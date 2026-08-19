import { prisma } from "../lib/db/client";

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
