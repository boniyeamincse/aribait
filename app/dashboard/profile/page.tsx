import { requireUser } from "@/lib/permissions";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <dl className="mt-4 grid max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Name</dt>
        <dd>{user.name}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{user.email}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>{user.status}</dd>
      </dl>
    </div>
  );
}
