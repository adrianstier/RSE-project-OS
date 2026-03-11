import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const scenarioStatusStyles: Record<string, string> = {
  planning: "bg-neutral-100 text-neutral-600 border-transparent",
  active: "bg-blue-50 text-blue-700 border-transparent",
  completed: "bg-emerald-50 text-emerald-700 border-transparent",
  on_hold: "bg-amber-50 text-amber-700 border-transparent",
}

const actionItemStatusStyles: Record<string, string> = {
  todo: "bg-neutral-100 text-neutral-600 border-transparent",
  in_progress: "bg-blue-50 text-blue-700 border-transparent",
  done: "bg-emerald-50 text-emerald-700 border-transparent",
  blocked: "bg-red-50 text-red-700 border-transparent",
}

const priorityStyles: Record<string, string> = {
  low: "bg-neutral-100 text-neutral-600 border-transparent",
  medium: "bg-amber-50 text-amber-700 border-transparent",
  high: "bg-orange-50 text-orange-700 border-transparent",
  critical: "bg-red-50 text-red-700 border-transparent",
}

const dataStatusStyles: Record<string, string> = {
  "data-ready": "bg-emerald-50 text-emerald-700 border-transparent",
  "data-partial": "bg-amber-50 text-amber-700 border-transparent",
  "data-pending": "bg-neutral-100 text-neutral-600 border-transparent",
}

const eventTypeStyles: Record<string, string> = {
  milestone: "bg-purple-50 text-purple-700 border-transparent",
  deadline: "bg-red-50 text-red-700 border-transparent",
  meeting: "bg-blue-50 text-blue-700 border-transparent",
  deliverable: "bg-amber-50 text-amber-700 border-transparent",
}

const projectStyles: Record<string, string> = {
  mote: "bg-mote-50 text-mote-400 border-transparent",
  fundemar: "bg-fundemar-50 text-fundemar-400 border-transparent",
}

const formatLabel = (value: string): string =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^Data /, "")

const projectLabels: Record<string, string> = { mote: "Mote", fundemar: "Fundemar" }

type BadgeType = "scenario-status" | "action-status" | "priority" | "data-status" | "event-type" | "project"

const styleMap: Record<BadgeType, Record<string, string>> = {
  "scenario-status": scenarioStatusStyles,
  "action-status": actionItemStatusStyles,
  priority: priorityStyles,
  "data-status": dataStatusStyles,
  "event-type": eventTypeStyles,
  project: projectStyles,
}

interface StatusBadgeProps {
  type: BadgeType
  value: string
  className?: string
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const styles = styleMap[type]?.[value] ?? "bg-neutral-100 text-neutral-600 border-transparent"
  const label = type === "project" ? (projectLabels[value] ?? value) : formatLabel(value)
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", styles, className)}>
      {label}
    </Badge>
  )
}

interface ProjectDotProps {
  project: string
  className?: string
}

export function ProjectDot({ project, className }: ProjectDotProps) {
  const dotColor = project === "mote" ? "bg-mote-400" : "bg-fundemar-400"
  const label = projectLabels[project] ?? project
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {label}
    </span>
  )
}
