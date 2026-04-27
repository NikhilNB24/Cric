import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SEED_SUPER_ADMIN_PHONE;
  const name = process.env.SEED_SUPER_ADMIN_NAME ?? 'CRIC Super Admin';

  if (!phone) {
    throw new Error('SEED_SUPER_ADMIN_PHONE is required.');
  }

  await prisma.user.upsert({
    where: { phone },
    update: {
      name,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      phone,
      name,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Seeded super admin user: ${phone}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
