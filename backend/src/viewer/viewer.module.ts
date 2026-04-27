import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UsersModule } from '../users/users.module';
import { ViewerController } from './viewer.controller';
import { ViewerService } from './viewer.service';

@Module({
  imports: [UsersModule],
  controllers: [ViewerController],
  providers: [ViewerService, FirebaseAuthGuard],
})
export class ViewerModule {}
