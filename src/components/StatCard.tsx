import { cn } from "../lib/utils"

interface StatCardProps {
  label: string;
  value: number | string;
  detail?: string;
  valueClassName?: string;
}

export function StatCard({ label, value, detail, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-medium text-muted-foreground mb-2">{label}</div>
      <div className={cn("text-2xl font-semibold text-foreground leading-none", valueClassName)}>{value}</div>
      {detail && <div className="text-xs text-muted-foreground mt-1">{detail}</div>}
    </div>
  )
}
