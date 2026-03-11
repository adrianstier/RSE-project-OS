import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InboxIcon, SearchIcon, LayoutListIcon, CheckSquareIcon, CalendarIcon, FilterIcon } from "lucide-react"

type EmptyVariant = "default" | "search" | "scenarios" | "actions" | "timeline" | "filter"

const variantConfig: Record<EmptyVariant, { icon: typeof InboxIcon; title: string; description: string }> = {
  default: { icon: InboxIcon, title: "Nothing here yet", description: "Get started by creating your first item." },
  search: { icon: SearchIcon, title: "No results found", description: "Try adjusting your search or filters." },
  scenarios: { icon: LayoutListIcon, title: "No scenarios yet", description: "Create your first scenario to get started." },
  actions: { icon: CheckSquareIcon, title: "No action items yet", description: "Create your first action item to get started." },
  timeline: { icon: CalendarIcon, title: "No events yet", description: "Add your first timeline event." },
  filter: { icon: FilterIcon, title: "No matches", description: "No items match your current filters." },
}

interface EmptyStateProps {
  variant?: EmptyVariant
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ variant = "default", title, description, actionLabel, onAction, className }: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title ?? config.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description ?? config.description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  )
}
