import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Access your Ariba IT dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <LoginForm />
        <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="underline underline-offset-4">
            Forgot password?
          </Link>
          <p>
            No account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Register
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
