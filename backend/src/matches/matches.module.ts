import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersModule } from '../users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [UsersModule],
  controllers: [MatchesController],
  providers: [MatchesService, FirebaseAuthGuard, RolesGuard],
})
export class MatchesModule {}
