import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ariba IT. Live classes, training and
        event registration for Bangladesh.
      </footer>
    </div>
  );
}
