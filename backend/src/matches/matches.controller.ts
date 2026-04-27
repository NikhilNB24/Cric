import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MatchesService } from './matches.service';

type CreateMatchBody = {
  tournamentId?: unknown;
  homeTeamId?: unknown;
  awayTeamId?: unknown;
  overs?: unknown;
  venue?: unknown;
  scheduledAt?: unknown;
};

@Controller('matches')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  listMatches(@Query('tournamentId') tournamentId?: string) {
    return this.matchesService.listMatches(tournamentId);
  }

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matchesService.getMatch(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN)
  createMatch(@Body() body: CreateMatchBody) {
    return this.matchesService.createMatch({
      tournamentId: this.parseRequiredString(body.tournamentId, 'tournamentId'),
      homeTeamId: this.parseRequiredString(body.homeTeamId, 'homeTeamId'),
      awayTeamId: this.parseRequiredString(body.awayTeamId, 'awayTeamId'),
      overs: this.parseOvers(body.overs),
      venue: this.parseOptionalString(body.venue, 'venue'),
      scheduledAt: this.parseOptionalDate(body.scheduledAt, 'scheduledAt'),
    });
  }

  @Post(':id/start')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  startMatch(@Param('id') id: string) {
    return this.matchesService.startMatch(id);
  }

  @Post(':id/pause')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  pauseMatch(@Param('id') id: string) {
    return this.matchesService.pauseMatch(id);
  }

  @Post(':id/resume')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  resumeMatch(@Param('id') id: string) {
    return this.matchesService.resumeMatch(id);
  }

  @Post(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  completeMatch(@Param('id') id: string) {
    return this.matchesService.completeMatch(id);
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

  private parseOvers(value: unknown) {
    const overs = Number(value);

    if (!Number.isInteger(overs)) {
      throw new BadRequestException('overs must be an integer.');
    }

    return overs;
  }

  private parseOptionalDate(value: unknown, field: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} must be an ISO date string.`);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(
        `${field} must be a valid ISO date string.`,
      );
    }

    return date;
  }
}
