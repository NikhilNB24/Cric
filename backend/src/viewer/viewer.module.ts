import { Module } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ViewerController } from './viewer.controller';
import { ViewerService } from './viewer.service';

@Module({
  controllers: [ViewerController],
  providers: [ViewerService, FirebaseAuthGuard],
})
export class ViewerModule {}
