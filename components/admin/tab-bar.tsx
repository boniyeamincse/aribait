import Link from "next/link";

export function TabBar({
  tabs,
  active,
  baseHref,
  paramName = "tab",
}: {
  tabs: { id: string; label: string }[];
  active: string;
  baseHref: string;
  paramName?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-px">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={`${baseHref}?${paramName}=${tab.id}`}
            className={
              isActive
                ? "shrink-0 rounded-t-lg border-b-2 border-cyan-400 px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
                : "shrink-0 rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm whitespace-nowrap text-slate-500 hover:text-slate-300"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
