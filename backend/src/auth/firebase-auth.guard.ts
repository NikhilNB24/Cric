import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    if (token.startsWith('dev-local:')) {
      return await this.activateLocalDevUser(request, token);
    }

    const decodedToken = await this.verifyToken(token);
    const phone = decodedToken.phone_number;

    if (!phone) {
      throw new UnauthorizedException(
        'Firebase token does not include a phone number.',
      );
    }

    const user = await this.usersService.findActiveByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Phone number is not active in CRIC.');
    }

    (request as Request & { user: AuthenticatedUser }).user = user;
    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  private async verifyToken(token: string) {
    try {
      return await this.firebaseAdminService.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token.');
    }
  }

  private async activateLocalDevUser(request: Request, token: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Local dev tokens are disabled.');
    }

    const phone = token.replace('dev-local:', '').trim();

    if (!phone) {
      throw new UnauthorizedException('Local dev token is missing a phone number.');
    }

    const user = await this.usersService.findActiveByPhone(phone);

    if (!user) {
      throw new UnauthorizedException('Phone number is not active in CRIC.');
    }

    (request as Request & { user: AuthenticatedUser }).user = user;
    return true;
  }
}
