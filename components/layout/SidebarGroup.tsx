// SidebarGroup.tsx – Collapsible group for the fixed sidebar
// Premium UI: glassmorphism, smooth transitions, hover effects

"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarGroupProps {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: SidebarItem[]
  defaultExpanded?: boolean
}

export function SidebarGroup({ id, name, icon: Icon, items, defaultExpanded = false }: SidebarGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const pathname = usePathname()

  const toggle = () => setExpanded((prev) => !prev)

  return (
    <div className="space-y-1">
      {/* Header – clickable, with animated chevron */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium",
          "transition-colors duration-200",
          "bg-slate-800/30 hover:bg-slate-700/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        )}
        aria-controls={id}
        aria-expanded={expanded}
      >
        <Icon className="mr-2 h-4 w-4 text-slate-400" />
        <span className="flex-1 text-left text-slate-200">{name}</span>
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-slate-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-slate-400" />
        )}
      </button>

      {/* Items – collapse with smooth height transition */}
      <div
        id={id}
        className={cn(
          "overflow-hidden transition-[height] duration-300",
          expanded ? "h-auto" : "h-0"
        )}
      >
        <ul className="mt-1 space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-1.5 text-xs",
                  "transition-colors duration-150",
                  pathname?.startsWith(item.href)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                )}
              >
                <item.icon className="mr-2 h-3 w-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
