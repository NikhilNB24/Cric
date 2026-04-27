import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersModule } from '../users/users.module';
import { PlayerStatsController } from './player-stats.controller';
import { PlayerStatsService } from './player-stats.service';

@Module({
  imports: [UsersModule],
  controllers: [PlayerStatsController],
  providers: [PlayerStatsService, FirebaseAuthGuard, RolesGuard],
})
export class PlayerStatsModule {}
