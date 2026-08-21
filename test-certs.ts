import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const eligible = await prisma.registration.findMany({
    where: { status: "COMPLETED", certificate: null },
    include: { user: true, event: true }
  });
  console.log("Eligible registrations:", eligible.map(r => r.user.name));
  
  const issued = await prisma.certificate.findMany({
    include: { registration: { include: { user: true } } }
  });
  console.log("Issued certificates:", issued.map(c => c.registration.user.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
