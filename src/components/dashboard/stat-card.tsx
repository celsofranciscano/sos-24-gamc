import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-primary/10 text-primary",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
} as const;

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "default",
  loading,
}: {
  title: string;
  value?: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        {Icon && (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONES[tone])}>
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-16" />
          ) : (
            <p className="text-xl leading-tight font-semibold tabular-nums">{value}</p>
          )}
          {hint && !loading && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
