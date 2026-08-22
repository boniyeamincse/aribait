import { prisma } from "@/lib/db/client";

export type InstructorBalances = {
  pendingEarnings: number;
  availableEarnings: number;
  totalPaid: number;
  availableBalance: number;
  lifetimeEarnings: number;
};

// Balance is always derived from the ledger (InstructorEarning +
// InstructorPayment rows) at read time — never stored as an editable field
// (docs/Payment.md "Never save only a manually editable balance value").
function toBalances(pendingEarnings: number, availableEarnings: number, totalPaid: number): InstructorBalances {
  return {
    pendingEarnings,
    availableEarnings,
    totalPaid,
    availableBalance: availableEarnings - totalPaid,
    lifetimeEarnings: availableEarnings,
  };
}

export async function computeInstructorBalances(instructorId: string): Promise<InstructorBalances> {
  const [pending, available, paid] = await Promise.all([
    prisma.instructorEarning.aggregate({
      where: { instructorId, status: "PENDING" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorEarning.aggregate({
      where: { instructorId, status: "AVAILABLE" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorPayment.aggregate({
      where: { instructorId, status: "RECORDED" },
      _sum: { amountBdt: true },
    }),
  ]);

  return toBalances(
    pending._sum.instructorAmountBdt ?? 0,
    available._sum.instructorAmountBdt ?? 0,
    paid._sum.amountBdt ?? 0,
  );
}

// Batched per-instructor balances for the /admin/instructor-payments index
// table — 3 groupBy queries total instead of N aggregate calls per instructor.
export async function listInstructorBalances(): Promise<Map<string, InstructorBalances>> {
  const [pendingByInstructor, availableByInstructor, paidByInstructor] = await Promise.all([
    prisma.instructorEarning.groupBy({
      by: ["instructorId"],
      where: { status: "PENDING" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorEarning.groupBy({
      by: ["instructorId"],
      where: { status: "AVAILABLE" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorPayment.groupBy({
      by: ["instructorId"],
      where: { status: "RECORDED" },
      _sum: { amountBdt: true },
    }),
  ]);

  const pendingMap = new Map(pendingByInstructor.map((r) => [r.instructorId, r._sum.instructorAmountBdt ?? 0]));
  const availableMap = new Map(availableByInstructor.map((r) => [r.instructorId, r._sum.instructorAmountBdt ?? 0]));
  const paidMap = new Map(paidByInstructor.map((r) => [r.instructorId, r._sum.amountBdt ?? 0]));

  const instructorIds = new Set([...pendingMap.keys(), ...availableMap.keys(), ...paidMap.keys()]);
  const result = new Map<string, InstructorBalances>();
  for (const id of instructorIds) {
    result.set(id, toBalances(pendingMap.get(id) ?? 0, availableMap.get(id) ?? 0, paidMap.get(id) ?? 0));
  }
  return result;
}

export async function computePlatformFinanceOverview(): Promise<InstructorBalances> {
  const [pending, available, paid] = await Promise.all([
    prisma.instructorEarning.aggregate({
      where: { status: "PENDING" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorEarning.aggregate({
      where: { status: "AVAILABLE" },
      _sum: { instructorAmountBdt: true },
    }),
    prisma.instructorPayment.aggregate({
      where: { status: "RECORDED" },
      _sum: { amountBdt: true },
    }),
  ]);

  return toBalances(
    pending._sum.instructorAmountBdt ?? 0,
    available._sum.instructorAmountBdt ?? 0,
    paid._sum.amountBdt ?? 0,
  );
}
