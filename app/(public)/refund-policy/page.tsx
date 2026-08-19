import { prisma } from "@/lib/db/client";

export default async function RefundPolicyPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Refund Policy</h1>
      {settings?.refundContent ? (
        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {settings.refundContent}
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Refund policy has not been published yet.
        </p>
      )}
    </div>
  );
}
