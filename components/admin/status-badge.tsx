export function StatusBadge({
  status,
  map,
}: {
  status: string;
  map: Record<string, string>;
}) {
  const colorClass = map[status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
