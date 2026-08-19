import { prisma } from "@/lib/db/client";

export default async function PrivacyPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      {settings?.privacyContent ? (
        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {settings.privacyContent}
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Privacy policy has not been published yet.
        </p>
      )}
    </div>
  );
}
