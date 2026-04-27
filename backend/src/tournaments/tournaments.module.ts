import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersModule } from '../users/users.module';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
  imports: [UsersModule],
  controllers: [TournamentsController],
  providers: [TournamentsService, FirebaseAuthGuard, RolesGuard],
})
export class TournamentsModule {}
