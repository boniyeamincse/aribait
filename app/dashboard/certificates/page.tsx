import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MyCertificatesPage() {
  const user = await requireUser();

  const certificates = await prisma.certificate.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { issuedAt: "desc" },
    include: { registration: { include: { event: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
      <div className="mt-6 divide-y rounded-lg border">
        {certificates.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No certificates yet — they appear here once an admin issues one
            for a completed Event.
          </p>
        )}
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{certificate.registration.event.title}</p>
              <p className="text-muted-foreground">
                {certificate.certificateNumber} ·{" "}
                {certificate.issuedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={certificate.status === "ISSUED" ? "secondary" : "destructive"}>
                {certificate.status}
              </Badge>
              {certificate.status === "ISSUED" && (
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a href={`/dashboard/certificates/${certificate.id}/download`}>
                      Download
                    </a>
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
