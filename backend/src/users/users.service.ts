import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

type CreateUserInput = {
  phone: string;
  name?: string | null;
  role: UserRole;
};

type UpdateUserInput = {
  name?: string | null;
  role?: UserRole;
  status?: UserStatus;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: this.userSelect(),
    });
  }

  createUser(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        phone: input.phone,
        name: input.name,
        role: input.role,
        status: UserStatus.ACTIVE,
      },
      select: this.userSelect(),
    });
  }

  updateUser(id: string, input: UpdateUserInput) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: input,
      select: this.userSelect(),
    });
  }

  private userSelect() {
    return {
      id: true,
      phone: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
