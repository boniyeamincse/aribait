import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";

import {
  IssueCertificateButton,
  ReissueCertificateButton,
  RevokeCertificateButton,
} from "./certificate-actions";

export default async function AdminCertificatesPage() {
  const [eligibleRegistrations, certificates] = await Promise.all([
    prisma.registration.findMany({
      where: { status: "COMPLETED", certificate: null },
      include: { user: true, event: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 100,
      include: { registration: { include: { user: true, event: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Eligible for a certificate</h2>
        <div className="divide-y rounded-lg border">
          {eligibleRegistrations.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No completed registrations awaiting a certificate.
            </p>
          )}
          {eligibleRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div>
                <p className="font-medium">{registration.user.name}</p>
                <p className="text-muted-foreground">{registration.event.title}</p>
              </div>
              <IssueCertificateButton registrationId={registration.id} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Issued</h2>
        <div className="divide-y rounded-lg border">
          {certificates.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No certificates issued yet.
            </p>
          )}
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div>
                <p className="font-medium">{certificate.certificateNumber}</p>
                <p className="text-muted-foreground">
                  {certificate.registration.user.name} —{" "}
                  {certificate.registration.event.title}
                </p>
                {certificate.status === "REVOKED" && certificate.revokeReason && (
                  <p className="text-xs text-destructive">
                    Revoked: {certificate.revokeReason}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={certificate.status === "ISSUED" ? "secondary" : "destructive"}>
                  {certificate.status}
                </Badge>
                {certificate.status === "ISSUED" ? (
                  <RevokeCertificateButton certificateId={certificate.id} />
                ) : (
                  <ReissueCertificateButton certificateId={certificate.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
