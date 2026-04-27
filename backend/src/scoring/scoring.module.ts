import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersModule } from '../users/users.module';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [UsersModule],
  controllers: [ScoringController],
  providers: [ScoringService, FirebaseAuthGuard, RolesGuard],
})
export class ScoringModule {}
