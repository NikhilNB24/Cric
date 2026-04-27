import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { TournamentsService } from './tournaments.service';

type CreateTournamentBody = {
  name?: unknown;
  description?: unknown;
};

type CreateTeamBody = {
  name?: unknown;
  shortName?: unknown;
};

type CreatePlayerBody = {
  name?: unknown;
  phone?: unknown;
};

@Controller()
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get('tournaments')
  listTournaments() {
    return this.tournamentsService.listTournaments();
  }

  @Post('tournaments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN)
  async createTournament(
    @Body() body: CreateTournamentBody,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tournamentsService.createTournament({
      name: this.parseRequiredString(body.name, 'name'),
      description: this.parseOptionalString(body.description, 'description'),
      createdById: user.id,
    });
  }

  @Get('tournaments/:id')
  getTournament(@Param('id') id: string) {
    return this.tournamentsService.getTournament(id);
  }

  @Get('tournaments/:id/teams')
  listTeams(@Param('id') id: string) {
    return this.tournamentsService.listTeams(id);
  }

  @Post('tournaments/:id/teams')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN)
  async createTeam(@Param('id') id: string, @Body() body: CreateTeamBody) {
    try {
      return await this.tournamentsService.createTeam({
        tournamentId: id,
        name: this.parseRequiredString(body.name, 'name'),
        shortName: this.parseOptionalString(body.shortName, 'shortName'),
      });
    } catch (error) {
      this.handleUniqueError(error, 'A team with this name already exists.');
      throw error;
    }
  }

  @Get('teams/:id/players')
  listPlayers(@Param('id') id: string) {
    return this.tournamentsService.listPlayers(id);
  }

  @Post('teams/:id/players')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN)
  async createPlayer(@Param('id') id: string, @Body() body: CreatePlayerBody) {
    try {
      return await this.tournamentsService.createPlayer({
        teamId: id,
        name: this.parseRequiredString(body.name, 'name'),
        phone: this.parseOptionalPhone(body.phone),
      });
    } catch (error) {
      this.handleUniqueError(error, 'A player with this name already exists.');
      throw error;
    }
  }

  private parseRequiredString(value: unknown, field: string) {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} is required.`);
    }

    const text = value.trim();

    if (!text) {
      throw new BadRequestException(`${field} is required.`);
    }

    return text;
  }

  private parseOptionalString(value: unknown, field: string) {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} must be a string.`);
    }

    const text = value.trim();
    return text.length > 0 ? text : null;
  }

  private parseOptionalPhone(value: unknown) {
    const phone = this.parseOptionalString(value, 'phone');

    if (phone && !/^\+\d{8,15}$/.test(phone)) {
      throw new BadRequestException('phone must be in E.164 format.');
    }

    return phone;
  }

  private handleUniqueError(error: unknown, message: string) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(message);
    }
  }
}
