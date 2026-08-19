import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { VerifyEmailClient } from "./verify-email-client";

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";
  const token = typeof params.token === "string" ? params.token : "";
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify email</CardTitle>
        <CardDescription>Confirming your Ariba IT account.</CardDescription>
      </CardHeader>
      <CardContent>
        {email && token ? (
          <VerifyEmailClient email={email} token={token} callbackUrl={callbackUrl} />
        ) : (
          <p className="text-sm text-destructive">
            This verification link is missing required information.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
