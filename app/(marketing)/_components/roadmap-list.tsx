export type RoadmapItem = {
  label: string;
};

export function RoadmapList({
  items,
  className,
}: {
  items: RoadmapItem[];
  className?: string;
}) {
  return (
    <ol className={className}>
      {items.map(({ label }) => (
        <li
          key={label}
          className="flex items-center justify-between gap-6 border-t border-[#2A2A2A] py-6 last:border-b last:border-[#2A2A2A]"
        >
          <span className="flex-1 text-base font-medium text-white sm:text-lg">
            {label}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
            Soon
          </span>
        </li>
      ))}
    </ol>
  );
}
