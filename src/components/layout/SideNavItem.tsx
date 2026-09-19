import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { StarIcon } from "@/components/home/DecorIcons"

export function SideNavItem({
  label,
  hint,
  path,
  active,
  icon: Icon,
}: {
  label: string
  hint: string
  path: string
  active: boolean
  icon: LucideIcon
}) {
  return (
    <Link
      to={path}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary/15 text-primary-foreground ring-1 ring-primary/25"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 text-primary-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs font-normal text-muted-foreground">{hint}</span>
      </span>
      {active ? <StarIcon className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
    </Link>
  )
}