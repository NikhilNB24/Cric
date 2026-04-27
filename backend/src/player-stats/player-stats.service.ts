import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DismissalType, MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

type BallEventForStats = {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsBat: number;
  wides: number;
  noBalls: number;
  penaltyRuns: number;
  isLegalDelivery: boolean;
  isWicket: boolean;
  dismissalType: DismissalType | null;
  playerOutId: string | null;
  fielderId: string | null;
};

type PlayerMatchAccumulator = {
  playerId: string;
  battingInningsIds: Set<string>;
  bowlingInningsIds: Set<string>;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  outs: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  catches: number;
};

type CareerAggregate = {
  matches: number;
  battingInnings: number;
  bowlingInnings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  outs: number;
  highestScore: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  catches: number;
};

const BOWLER_WICKET_TYPES = new Set<DismissalType>([
  DismissalType.BOWLED,
  DismissalType.CAUGHT,
  DismissalType.CAUGHT_AND_BOWLED,
  DismissalType.LBW,
  DismissalType.STUMPED,
  DismissalType.HIT_WICKET,
  DismissalType.OTHER,
]);

@Injectable()
export class PlayerStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculateMatchStats(matchId: string) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          innings: {
            include: {
              ballEvents: {
                orderBy: {
                  sequence: 'asc',
                },
              },
            },
          },
          playerStats: {
            select: {
              playerId: true,
            },
          },
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found.');
      }

      if (match.status !== MatchStatus.COMPLETED) {
        throw new BadRequestException(
          'Career stats can only be recalculated for completed matches.',
        );
      }

      const previousPlayerIds = match.playerStats.map((stat) => stat.playerId);
      const matchStats = this.buildMatchStats(
        match.id,
        match.innings.flatMap((innings) =>
          innings.ballEvents.map((ballEvent) => ({
            inningsId: innings.id,
            ballEvent,
          })),
        ),
      );
      const nextPlayerIds = matchStats.map((stat) => stat.playerId);
      const affectedPlayerIds = [...new Set([...previousPlayerIds, ...nextPlayerIds])];

      await tx.matchPlayerStat.deleteMany({
        where: {
          matchId,
        },
      });

      if (matchStats.length > 0) {
        await tx.matchPlayerStat.createMany({
          data: matchStats,
        });
      }

      await Promise.all(
        affectedPlayerIds.map((playerId) => this.refreshCareerStats(tx, playerId)),
      );

      return {
        matchId,
        playersUpdated: affectedPlayerIds.length,
        matchStats,
      };
    });
  }

  async getPlayerCareerStats(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: true,
        careerStat: true,
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found.');
    }

    return {
      player,
      careerStat: player.careerStat ?? this.emptyCareerStats(player.id),
    };
  }

  async searchPlayers(queryValue?: string, limitValue?: string) {
    const query = queryValue?.trim() ?? '';
    const limit = this.parseLimit(limitValue);

    if (query.length < 2) {
      return [];
    }

    return this.prisma.player.findMany({
      take: limit,
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        team: true,
        careerStat: true,
      },
    });
  }

  async getLeaderboard(limitValue?: string) {
    const limit = this.parseLimit(limitValue);

    return this.prisma.playerCareerStat.findMany({
      take: limit,
      orderBy: [
        {
          runs: 'desc',
        },
        {
          wickets: 'desc',
        },
        {
          matches: 'asc',
        },
      ],
      include: {
        player: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  private buildMatchStats(
    matchId: string,
    events: { inningsId: string; ballEvent: BallEventForStats }[],
  ) {
    const stats = new Map<string, PlayerMatchAccumulator>();

    for (const event of events) {
      const ball = event.ballEvent;
      const striker = this.getAccumulator(stats, ball.strikerId);
      const nonStriker = this.getAccumulator(stats, ball.nonStrikerId);
      const bowler = this.getAccumulator(stats, ball.bowlerId);

      striker.battingInningsIds.add(event.inningsId);
      nonStriker.battingInningsIds.add(event.inningsId);
      bowler.bowlingInningsIds.add(event.inningsId);

      striker.runs += ball.runsBat;
      striker.ballsFaced += ball.isLegalDelivery ? 1 : 0;
      striker.fours += ball.runsBat === 4 ? 1 : 0;
      striker.sixes += ball.runsBat === 6 ? 1 : 0;

      bowler.ballsBowled += ball.isLegalDelivery ? 1 : 0;
      bowler.runsConceded += ball.runsBat + ball.wides + ball.noBalls + ball.penaltyRuns;

      if (ball.isWicket && ball.playerOutId) {
        const playerOut = this.getAccumulator(stats, ball.playerOutId);
        playerOut.outs += 1;

        if (ball.dismissalType && BOWLER_WICKET_TYPES.has(ball.dismissalType)) {
          bowler.wickets += 1;
        }

        if (ball.dismissalType === DismissalType.CAUGHT && ball.fielderId) {
          this.getAccumulator(stats, ball.fielderId).catches += 1;
        }

        if (ball.dismissalType === DismissalType.CAUGHT_AND_BOWLED) {
          bowler.catches += 1;
        }
      }
    }

    return [...stats.values()].map((stat) => ({
      matchId,
      playerId: stat.playerId,
      matches: 1,
      battingInnings: stat.battingInningsIds.size,
      bowlingInnings: stat.bowlingInningsIds.size,
      runs: stat.runs,
      ballsFaced: stat.ballsFaced,
      fours: stat.fours,
      sixes: stat.sixes,
      outs: stat.outs,
      wickets: stat.wickets,
      ballsBowled: stat.ballsBowled,
      runsConceded: stat.runsConceded,
      catches: stat.catches,
    }));
  }

  private getAccumulator(
    stats: Map<string, PlayerMatchAccumulator>,
    playerId: string,
  ) {
    const existing = stats.get(playerId);

    if (existing) {
      return existing;
    }

    const stat: PlayerMatchAccumulator = {
      playerId,
      battingInningsIds: new Set<string>(),
      bowlingInningsIds: new Set<string>(),
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      outs: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      catches: 0,
    };

    stats.set(playerId, stat);
    return stat;
  }

  private async refreshCareerStats(
    tx: Prisma.TransactionClient,
    playerId: string,
  ) {
    const matchStats = await tx.matchPlayerStat.findMany({
      where: {
        playerId,
      },
    });

    if (matchStats.length === 0) {
      await tx.playerCareerStat.deleteMany({
        where: {
          playerId,
        },
      });
      return;
    }

    const career = matchStats.reduce<CareerAggregate>(
      (total, stat) => ({
        matches: total.matches + stat.matches,
        battingInnings: total.battingInnings + stat.battingInnings,
        bowlingInnings: total.bowlingInnings + stat.bowlingInnings,
        runs: total.runs + stat.runs,
        ballsFaced: total.ballsFaced + stat.ballsFaced,
        fours: total.fours + stat.fours,
        sixes: total.sixes + stat.sixes,
        outs: total.outs + stat.outs,
        highestScore: Math.max(total.highestScore, stat.runs),
        wickets: total.wickets + stat.wickets,
        ballsBowled: total.ballsBowled + stat.ballsBowled,
        runsConceded: total.runsConceded + stat.runsConceded,
        catches: total.catches + stat.catches,
      }),
      this.emptyCareerTotals(),
    );

    await tx.playerCareerStat.upsert({
      where: {
        playerId,
      },
      create: {
        playerId,
        ...career,
      },
      update: career,
    });
  }

  private emptyCareerTotals(): CareerAggregate {
    return {
      matches: 0,
      battingInnings: 0,
      bowlingInnings: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      outs: 0,
      highestScore: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      catches: 0,
    };
  }

  private emptyCareerStats(playerId: string) {
    return {
      id: null,
      playerId,
      ...this.emptyCareerTotals(),
      updatedAt: null,
    };
  }

  private parseLimit(value?: string) {
    if (!value) {
      return 20;
    }

    const limit = Number(value);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be an integer between 1 and 100.');
    }

    return limit;
  }
}
