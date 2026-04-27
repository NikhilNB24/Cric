import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
