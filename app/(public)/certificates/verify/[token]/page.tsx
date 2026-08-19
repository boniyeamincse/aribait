import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Public verification page. Only the minimal necessary fields are shown —
// no email, no other account details (docs/security.md §7, idea.md §5.13).
export default async function VerifyCertificatePage({
  params,
}: PageProps<"/certificates/verify/[token]">) {
  const { token } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationToken: token },
    include: { registration: { include: { user: true, event: true } } },
  });

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {!certificate ? (
            <p className="text-destructive">
              No certificate found for this verification code.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={certificate.status === "ISSUED" ? "secondary" : "destructive"}>
                  {certificate.status === "ISSUED" ? "Valid" : "Revoked"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Certificate No.</span>
                <span className="font-medium">{certificate.certificateNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">{certificate.registration.user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium">{certificate.registration.event.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-medium">
                  {certificate.issuedAt.toLocaleDateString("en-GB", { dateStyle: "long" })}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
