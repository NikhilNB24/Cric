import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DismissalType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ScoringService } from './scoring.service';

type StartInningsBody = {
  battingTeamId?: unknown;
  bowlingTeamId?: unknown;
};

type SubmitBallBody = {
  strikerId?: unknown;
  nonStrikerId?: unknown;
  bowlerId?: unknown;
  runsBat?: unknown;
  wides?: unknown;
  noBalls?: unknown;
  byes?: unknown;
  legByes?: unknown;
  penaltyRuns?: unknown;
  isWicket?: unknown;
  dismissalType?: unknown;
  playerOutId?: unknown;
  fielderId?: unknown;
  notes?: unknown;
  idempotencyKey?: unknown;
};

@Controller()
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('matches/:id/scorecard')
  getScorecard(@Param('id') id: string) {
    return this.scoringService.getScorecard(id);
  }

  @Post('matches/:id/innings')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  startInnings(@Param('id') id: string, @Body() body: StartInningsBody) {
    return this.scoringService.startInnings({
      matchId: id,
      battingTeamId: this.parseRequiredString(
        body.battingTeamId,
        'battingTeamId',
      ),
      bowlingTeamId: this.parseRequiredString(
        body.bowlingTeamId,
        'bowlingTeamId',
      ),
    });
  }

  @Post('innings/:id/balls')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  submitBall(
    @Param('id') id: string,
    @Body() body: SubmitBallBody,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.scoringService.submitBall({
      inningsId: id,
      strikerId: this.parseRequiredString(body.strikerId, 'strikerId'),
      nonStrikerId: this.parseRequiredString(body.nonStrikerId, 'nonStrikerId'),
      bowlerId: this.parseRequiredString(body.bowlerId, 'bowlerId'),
      scoredById: user.id,
      runsBat: this.parseRunValue(body.runsBat),
      wides: this.parseRunValue(body.wides),
      noBalls: this.parseRunValue(body.noBalls),
      byes: this.parseRunValue(body.byes),
      legByes: this.parseRunValue(body.legByes),
      penaltyRuns: this.parseRunValue(body.penaltyRuns),
      isWicket: body.isWicket === true,
      dismissalType: this.parseOptionalDismissalType(body.dismissalType),
      playerOutId: this.parseOptionalString(body.playerOutId, 'playerOutId'),
      fielderId: this.parseOptionalString(body.fielderId, 'fielderId'),
      notes: this.parseOptionalString(body.notes, 'notes'),
      idempotencyKey: this.parseRequiredString(
        body.idempotencyKey,
        'idempotencyKey',
      ),
    });
  }

  @Post('innings/:id/undo-last-ball')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.SCORER)
  undoLastBall(@Param('id') id: string) {
    return this.scoringService.undoLastBall(id);
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

  private parseRunValue(value: unknown) {
    if (value === undefined || value === null) {
      return 0;
    }

    const runValue = Number(value);

    if (!Number.isInteger(runValue) || runValue < 0) {
      throw new BadRequestException(
        'Run values must be non-negative integers.',
      );
    }

    return runValue;
  }

  private parseOptionalDismissalType(value: unknown) {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string' || !(value in DismissalType)) {
      throw new BadRequestException('dismissalType is invalid.');
    }

    return DismissalType[value as keyof typeof DismissalType];
  }
}
