import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PlayerStatsService } from './player-stats.service';

@Controller('player-stats')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class PlayerStatsController {
  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Post('matches/:id/recalculate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  recalculateMatchStats(@Param('id') id: string) {
    return this.playerStatsService.recalculateMatchStats(id);
  }

  @Get('players/:id')
  getPlayerCareerStats(@Param('id') id: string) {
    return this.playerStatsService.getPlayerCareerStats(id);
  }

  @Get('players')
  searchPlayers(@Query('query') query?: string, @Query('limit') limit?: string) {
    return this.playerStatsService.searchPlayers(query, limit);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.playerStatsService.getLeaderboard(limit);
  }
}
