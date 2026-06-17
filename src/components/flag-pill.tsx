import { cn } from "@/lib/utils";
import { FLAG_COLORS, flagLabel } from "@/lib/mock-data";

export function FlagPill({ flag, className }: { flag: string; className?: string }) {
  const color = FLAG_COLORS[flag] ?? "#b026ff";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm",
        className
      )}
      style={{
        color,
        backgroundColor: `${color}1a`,
        boxShadow: `0 0 10px 0 ${color}55`,
        border: `1px solid ${color}55`,
      }}
    >
      {flagLabel(flag)}
    </span>
  );
}
