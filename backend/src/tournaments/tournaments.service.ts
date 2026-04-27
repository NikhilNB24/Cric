import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

type CreateTournamentInput = {
  name: string;
  description?: string | null;
  createdById: string;
};

type CreateTeamInput = {
  tournamentId: string;
  name: string;
  shortName?: string | null;
};

type CreatePlayerInput = {
  teamId: string;
  name: string;
  phone?: string | null;
};

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  listTournaments() {
    return this.prisma.tournament.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            teams: true,
            matches: true,
          },
        },
      },
    });
  }

  createTournament(input: CreateTournamentInput) {
    return this.prisma.tournament.create({
      data: input,
    });
  }

  async getTournament(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id,
      },
      include: {
        teams: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            players: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found.');
    }

    return tournament;
  }

  async createTeam(input: CreateTeamInput) {
    await this.ensureTournamentExists(input.tournamentId);

    return this.prisma.team.create({
      data: input,
      include: {
        players: true,
      },
    });
  }

  async listTeams(tournamentId: string) {
    await this.ensureTournamentExists(tournamentId);

    return this.prisma.team.findMany({
      where: {
        tournamentId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        players: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async createPlayer(input: CreatePlayerInput) {
    const playerCount = await this.prisma.player.count({
      where: {
        teamId: input.teamId,
      },
    });

    if (playerCount >= 11) {
      throw new BadRequestException('A team can have at most 11 players.');
    }

    return this.prisma.player.create({
      data: input,
    });
  }

  async listPlayers(teamId: string) {
    await this.ensureTeamExists(teamId);

    return this.prisma.player.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  private async ensureTournamentExists(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found.');
    }
  }

  private async ensureTeamExists(id: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found.');
    }
  }
}
