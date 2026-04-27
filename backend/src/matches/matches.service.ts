import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

type CreateMatchInput = {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  overs: number;
  venue?: string | null;
  scheduledAt?: Date | null;
};

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMatches(tournamentId?: string) {
    return this.prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: this.matchInclude(),
    });
  }

  async getMatch(id: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id,
      },
      include: {
        ...this.matchInclude(),
        innings: {
          orderBy: {
            inningsNumber: 'asc',
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    return match;
  }

  async createMatch(input: CreateMatchInput) {
    this.validateOvers(input.overs);
    await this.validateTeams(input);

    return this.prisma.match.create({
      data: input,
      include: this.matchInclude(),
    });
  }

  async startMatch(id: string) {
    const match = await this.ensureMatch(id);

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled matches can be started.');
    }

    return this.prisma.match.update({
      where: {
        id,
      },
      data: {
        status: MatchStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: this.matchInclude(),
    });
  }

  async pauseMatch(id: string) {
    const match = await this.ensureMatch(id);

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress matches can be paused.');
    }

    return this.updateStatus(id, MatchStatus.PAUSED);
  }

  async resumeMatch(id: string) {
    const match = await this.ensureMatch(id);

    if (match.status !== MatchStatus.PAUSED) {
      throw new BadRequestException('Only paused matches can be resumed.');
    }

    return this.updateStatus(id, MatchStatus.IN_PROGRESS);
  }

  async completeMatch(id: string) {
    const match = await this.ensureMatch(id);

    if (
      match.status !== MatchStatus.IN_PROGRESS &&
      match.status !== MatchStatus.PAUSED
    ) {
      throw new BadRequestException(
        'Only in-progress or paused matches can be completed.',
      );
    }

    return this.prisma.match.update({
      where: {
        id,
      },
      data: {
        status: MatchStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: this.matchInclude(),
    });
  }

  private async validateTeams(input: CreateMatchInput) {
    if (input.homeTeamId === input.awayTeamId) {
      throw new BadRequestException('A match requires two different teams.');
    }

    const teams = await this.prisma.team.findMany({
      where: {
        id: {
          in: [input.homeTeamId, input.awayTeamId],
        },
      },
      select: {
        id: true,
        tournamentId: true,
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (teams.length !== 2) {
      throw new BadRequestException('Both teams must exist.');
    }

    const invalidTournamentTeam = teams.find(
      (team) => team.tournamentId !== input.tournamentId,
    );

    if (invalidTournamentTeam) {
      throw new BadRequestException(
        'Both teams must belong to the tournament.',
      );
    }

    const shortTeam = teams.find((team) => team._count.players < 4);

    if (shortTeam) {
      throw new BadRequestException('Each team must have at least 4 players.');
    }
  }

  private validateOvers(overs: number) {
    if (!Number.isInteger(overs) || overs < 3 || overs > 15) {
      throw new BadRequestException('overs must be an integer from 3 to 15.');
    }
  }

  private async ensureMatch(id: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found.');
    }

    return match;
  }

  private updateStatus(id: string, status: MatchStatus) {
    return this.prisma.match.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: this.matchInclude(),
    });
  }

  private matchInclude() {
    return {
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
      scoreSnapshot: true,
    };
  }
}
