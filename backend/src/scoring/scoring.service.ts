import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DismissalType,
  InningsStatus,
  MatchStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

type StartInningsInput = {
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
};

type SubmitBallInput = {
  inningsId: string;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  scoredById: string;
  runsBat: number;
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penaltyRuns: number;
  isWicket: boolean;
  dismissalType?: DismissalType;
  playerOutId?: string | null;
  notes?: string | null;
  idempotencyKey: string;
};

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async getScorecard(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        innings: {
          orderBy: {
            inningsNumber: 'asc',
          },
          include: {
            battingTeam: true,
            bowlingTeam: true,
            ballEvents: {
              orderBy: {
                sequence: 'asc',
              },
              include: {
                striker: true,
                nonStriker: true,
                bowler: true,
                playerOut: true,
              },
            },
          },
        },
        scoreSnapshot: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    return match;
  }

  async startInnings(input: StartInningsInput) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: input.matchId,
      },
      include: {
        innings: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Match must be in progress to start innings.',
      );
    }

    if (match.innings.length >= 2) {
      throw new BadRequestException('A match can have at most two innings.');
    }

    this.validateInningsTeams(match, input);

    const innings = await this.prisma.innings.create({
      data: {
        matchId: input.matchId,
        battingTeamId: input.battingTeamId,
        bowlingTeamId: input.bowlingTeamId,
        inningsNumber: match.innings.length + 1,
        status: InningsStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: {
        battingTeam: true,
        bowlingTeam: true,
      },
    });

    await this.refreshSnapshot(input.matchId);
    return innings;
  }

  async submitBall(input: SubmitBallInput) {
    this.validateBallInput(input);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const innings = await tx.innings.findUnique({
          where: {
            id: input.inningsId,
          },
          include: {
            match: true,
          },
        });

        if (!innings) {
          throw new NotFoundException('Innings not found.');
        }

        if (innings.status !== InningsStatus.IN_PROGRESS) {
          throw new BadRequestException('Innings is not in progress.');
        }

        if (innings.match.status !== MatchStatus.IN_PROGRESS) {
          throw new BadRequestException('Match is not in progress.');
        }

        const sequence = await tx.ballEvent.count({
          where: {
            inningsId: input.inningsId,
          },
        });
        const nextSequence = sequence + 1;
        const isLegalDelivery = input.wides === 0 && input.noBalls === 0;
        const legalBallIndex = innings.legalBalls + (isLegalDelivery ? 1 : 0);
        const overNumber = Math.floor(Math.max(legalBallIndex - 1, 0) / 6);
        const ballInOver = isLegalDelivery
          ? ((legalBallIndex - 1) % 6) + 1
          : (innings.legalBalls % 6) + 1;

        const extras =
          input.wides +
          input.noBalls +
          input.byes +
          input.legByes +
          input.penaltyRuns;
        const runs = input.runsBat + extras;

        const ballEvent = await tx.ballEvent.create({
          data: {
            inningsId: input.inningsId,
            sequence: nextSequence,
            overNumber,
            ballInOver,
            strikerId: input.strikerId,
            nonStrikerId: input.nonStrikerId,
            bowlerId: input.bowlerId,
            scoredById: input.scoredById,
            runsBat: input.runsBat,
            wides: input.wides,
            noBalls: input.noBalls,
            byes: input.byes,
            legByes: input.legByes,
            penaltyRuns: input.penaltyRuns,
            isLegalDelivery,
            isWicket: input.isWicket,
            dismissalType: input.dismissalType,
            playerOutId: input.playerOutId,
            notes: input.notes,
            idempotencyKey: input.idempotencyKey,
          },
        });

        const updatedInnings = await tx.innings.update({
          where: {
            id: input.inningsId,
          },
          data: {
            runs: {
              increment: runs,
            },
            extras: {
              increment: extras,
            },
            wickets: {
              increment: input.isWicket ? 1 : 0,
            },
            legalBalls: {
              increment: isLegalDelivery ? 1 : 0,
            },
          },
        });

        await this.refreshSnapshot(input.inningsId, tx, 'inningsId');

        return {
          ballEvent,
          innings: updatedInnings,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Duplicate ball submission.');
      }

      throw error;
    }
  }

  async undoLastBall(inningsId: string) {
    return this.prisma.$transaction(async (tx) => {
      const lastBall = await tx.ballEvent.findFirst({
        where: {
          inningsId,
        },
        orderBy: {
          sequence: 'desc',
        },
      });

      if (!lastBall) {
        throw new BadRequestException('No ball events to undo.');
      }

      const innings = await tx.innings.findUnique({
        where: {
          id: inningsId,
        },
      });

      if (!innings) {
        throw new NotFoundException('Innings not found.');
      }

      const extras =
        lastBall.wides +
        lastBall.noBalls +
        lastBall.byes +
        lastBall.legByes +
        lastBall.penaltyRuns;
      const runs = lastBall.runsBat + extras;

      await tx.ballEvent.delete({
        where: {
          id: lastBall.id,
        },
      });

      const updatedInnings = await tx.innings.update({
        where: {
          id: inningsId,
        },
        data: {
          runs: {
            decrement: runs,
          },
          extras: {
            decrement: extras,
          },
          wickets: {
            decrement: lastBall.isWicket ? 1 : 0,
          },
          legalBalls: {
            decrement: lastBall.isLegalDelivery ? 1 : 0,
          },
        },
      });

      await this.refreshSnapshot(inningsId, tx, 'inningsId');

      return {
        removedBallEvent: lastBall,
        innings: updatedInnings,
      };
    });
  }

  private validateInningsTeams(
    match: { homeTeamId: string; awayTeamId: string },
    input: StartInningsInput,
  ) {
    if (input.battingTeamId === input.bowlingTeamId) {
      throw new BadRequestException(
        'Batting and bowling teams must be different.',
      );
    }

    const matchTeamIds = [match.homeTeamId, match.awayTeamId];

    if (
      !matchTeamIds.includes(input.battingTeamId) ||
      !matchTeamIds.includes(input.bowlingTeamId)
    ) {
      throw new BadRequestException('Innings teams must belong to the match.');
    }
  }

  private validateBallInput(input: SubmitBallInput) {
    const numericFields = [
      input.runsBat,
      input.wides,
      input.noBalls,
      input.byes,
      input.legByes,
      input.penaltyRuns,
    ];

    if (numericFields.some((value) => !Number.isInteger(value) || value < 0)) {
      throw new BadRequestException(
        'Run values must be non-negative integers.',
      );
    }

    if (input.wides > 0 && input.noBalls > 0) {
      throw new BadRequestException(
        'A delivery cannot be both wide and no-ball.',
      );
    }

    if (input.isWicket && !input.dismissalType) {
      throw new BadRequestException('dismissalType is required for wickets.');
    }
  }

  private async refreshSnapshot(
    id: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
    idType: 'matchId' | 'inningsId' = 'matchId',
  ) {
    const matchId =
      idType === 'matchId'
        ? id
        : (
            await tx.innings.findUniqueOrThrow({
              where: {
                id,
              },
              select: {
                matchId: true,
              },
            })
          ).matchId;

    const innings = await tx.innings.findMany({
      where: {
        matchId,
      },
      orderBy: {
        inningsNumber: 'asc',
      },
      include: {
        battingTeam: true,
      },
    });

    const currentInnings = innings.at(-1);
    const currentScore = currentInnings
      ? `${currentInnings.battingTeam.shortName ?? currentInnings.battingTeam.name} ${currentInnings.runs}/${currentInnings.wickets} (${this.formatOvers(currentInnings.legalBalls)})`
      : 'Match not started';

    const summary = innings
      .map(
        (item) =>
          `${item.battingTeam.shortName ?? item.battingTeam.name} ${item.runs}/${item.wickets} (${this.formatOvers(item.legalBalls)})`,
      )
      .join(' | ');

    await tx.matchScoreSnapshot.upsert({
      where: {
        matchId,
      },
      update: {
        currentScore,
        summary,
        payload: innings,
      },
      create: {
        matchId,
        currentScore,
        summary,
        payload: innings,
      },
    });
  }

  private formatOvers(legalBalls: number) {
    return `${Math.floor(legalBalls / 6)}.${legalBalls % 6} ov`;
  }
}
