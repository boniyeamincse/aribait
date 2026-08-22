import { PrismaClient } from './lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'azmarry', mode: 'insensitive' } },
        { email: { contains: 'azmarry', mode: 'insensitive' } }
      ]
    }
  });

  console.log('Found users:', users.length);
  for (const user of users) {
    console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, PasswordHash: ${user.passwordHash}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
