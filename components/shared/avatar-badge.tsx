export function AvatarBadge({
  image,
  initials,
  // Caller supplies size + background color/gradient (e.g. "h-8 w-8 text-xs
  // bg-gradient-to-br from-blue-500 to-green-600") — kept out of the base
  // classes below so there's never a duplicate/conflicting bg-* utility.
  className,
}: {
  image: string | null | undefined;
  initials: string;
  className: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-slate-900 ${className}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
