import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MatchesModule } from './matches/matches.module';
import { ScoringModule } from './scoring/scoring.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { UsersModule } from './users/users.module';
import { ViewerModule } from './viewer/viewer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    MatchesModule,
    ScoringModule,
    ViewerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
