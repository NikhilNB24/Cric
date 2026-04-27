import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedUser } from './auth.types';

@Controller()
export class AuthController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      user,
    };
  }
}
