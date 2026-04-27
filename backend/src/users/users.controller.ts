import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

type CreateUserBody = {
  phone?: unknown;
  name?: unknown;
  role?: unknown;
};

type UpdateUserBody = {
  name?: unknown;
  role?: unknown;
  status?: unknown;
};

@Controller('users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  async createUser(@Body() body: CreateUserBody) {
    try {
      return await this.usersService.createUser({
        phone: this.parsePhone(body.phone),
        name: this.parseOptionalString(body.name),
        role: this.parseRole(body.role),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A user with this phone number already exists.',
        );
      }

      throw error;
    }
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserBody) {
    return this.usersService.updateUser(id, {
      name: this.parseOptionalString(body.name),
      role: body.role === undefined ? undefined : this.parseRole(body.role),
      status:
        body.status === undefined ? undefined : this.parseStatus(body.status),
    });
  }

  private parsePhone(value: unknown) {
    if (typeof value !== 'string') {
      throw new BadRequestException('phone is required.');
    }

    const phone = value.trim();

    if (!/^\+\d{8,15}$/.test(phone)) {
      throw new BadRequestException('phone must be in E.164 format.');
    }

    return phone;
  }

  private parseOptionalString(value: unknown) {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('name must be a string.');
    }

    const text = value.trim();
    return text.length > 0 ? text : null;
  }

  private parseRole(value: unknown) {
    if (typeof value !== 'string' || !(value in UserRole)) {
      throw new BadRequestException('role is invalid.');
    }

    return UserRole[value as keyof typeof UserRole];
  }

  private parseStatus(value: unknown) {
    if (typeof value !== 'string' || !(value in UserStatus)) {
      throw new BadRequestException('status is invalid.');
    }

    return UserStatus[value as keyof typeof UserStatus];
  }
}
