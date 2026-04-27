import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ViewerService {
  constructor(private readonly prisma: PrismaService) {}

  listLiveMatches(tournamentId?: string) {
    return this.prisma.match.findMany({
      where: {
        tournamentId,
        status: {
          in: [MatchStatus.IN_PROGRESS, MatchStatus.PAUSED],
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: this.viewerMatchSelect(),
    });
  }

  listRecentMatches(tournamentId?: string) {
    return this.prisma.match.findMany({
      where: {
        tournamentId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
      select: this.viewerMatchSelect(),
    });
  }

  async getLiveScore(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
      select: {
        ...this.viewerMatchSelect(),
        innings: {
          orderBy: {
            inningsNumber: 'asc',
          },
          select: {
            id: true,
            inningsNumber: true,
            status: true,
            runs: true,
            wickets: true,
            legalBalls: true,
            extras: true,
            battingTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    return match;
  }

  private viewerMatchSelect() {
    return {
      id: true,
      status: true,
      overs: true,
      venue: true,
      scheduledAt: true,
      startedAt: true,
      completedAt: true,
      updatedAt: true,
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
      homeTeam: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
      awayTeam: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
      scoreSnapshot: {
        select: {
          currentScore: true,
          summary: true,
          payload: true,
          updatedAt: true,
        },
      },
    };
  }
}
