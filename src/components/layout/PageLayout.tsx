import type { ReactNode } from "react"

import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

type PageProps = {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>
}

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  align?: "left" | "center"
  className?: string
}

export function PageHeader({
  title,
  description,
  meta,
  action,
  align = "left",
  className,
}: PageHeaderProps) {
  const centered = align === "center"

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4",
        centered && "relative justify-center text-center",
        className
      )}
    >
      <div className={cn("min-w-0", centered && "mx-auto")}>
        {typeof title === "string" || typeof title === "number" ? (
          <h1 className="truncate text-2xl font-bold md:text-3xl">{title}</h1>
        ) : (
          <div className="min-w-0">{title}</div>
        )}

        {description && (
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      </div>

      {action && (
        <div
          className={cn(
            "shrink-0",
            centered && "absolute top-1/2 right-0 -translate-y-1/2"
          )}
        >
          {action}
        </div>
      )}
    </header>
  )
}

type PageBackLinkProps = {
  to: string
  children: ReactNode
}

export function PageBackLink({ to, children }: PageBackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {children}
    </Link>
  )
}

type PageStateProps = {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: "muted" | "danger"
  size?: "default" | "compact"
  className?: string
}

export function PageState({
  title,
  description,
  icon,
  tone = "muted",
  size = "default",
  className,
}: PageStateProps) {
  return (
    <div
      className={cn(
        "text-center",
        size === "default" ? "py-16" : "py-12",
        tone === "danger" ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {icon && <div className="mx-auto mb-3 flex justify-center">{icon}</div>}

      {title && (
        <p
          className={cn(
            "text-sm",
            description && "font-medium text-foreground"
          )}
        >
          {title}
        </p>
      )}

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

type PageSectionProps = {
  title?: ReactNode
  meta?: ReactNode
  children: ReactNode
  className?: string
}

export function PageSection({
  title,
  meta,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("app-scroll-mt", className)}>
      {(title || meta) && (
        <div className="mb-4 flex items-end justify-between gap-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {meta && (
            <span className="text-sm text-muted-foreground">{meta}</span>
          )}
        </div>
      )}

      {children}
    </section>
  )
}
