import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ViewerService } from './viewer.service';

@Controller('viewer')
@UseGuards(FirebaseAuthGuard)
export class ViewerController {
  constructor(private readonly viewerService: ViewerService) {}

  @Get('matches/live')
  listLiveMatches(@Query('tournamentId') tournamentId?: string) {
    return this.viewerService.listLiveMatches(tournamentId);
  }

  @Get('matches/recent')
  listRecentMatches(@Query('tournamentId') tournamentId?: string) {
    return this.viewerService.listRecentMatches(tournamentId);
  }

  @Get('matches/:id/live-score')
  getLiveScore(@Param('id') id: string) {
    return this.viewerService.getLiveScore(id);
  }
}
