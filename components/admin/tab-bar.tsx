import Link from "next/link";
import type { ComponentType } from "react";

type Tab = {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

export function TabBar({
  tabs,
  active,
  baseHref,
  paramName = "tab",
}: {
  tabs: Tab[];
  active: string;
  baseHref: string;
  paramName?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-px scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.id}
            href={`${baseHref}?${paramName}=${tab.id}`}
            className={
              isActive
                ? "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 border-cyan-400 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white bg-slate-800/20"
                : "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 border-transparent px-4 py-2.5 text-sm whitespace-nowrap text-slate-500 hover:text-slate-300 hover:bg-slate-800/10 transition-colors"
            }
          >
            {Icon && (
              <Icon 
                size={16} 
                className={isActive ? "text-cyan-400" : "text-slate-500"} 
                strokeWidth={isActive ? 2 : 1.75}
              />
            )}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
