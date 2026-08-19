import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatBdt(amountBdt: number) {
  if (amountBdt === 0) return "Free"
  return `৳${amountBdt.toLocaleString("en-BD")}`
}

/** Like formatBdt, but for revenue/collections figures where 0 means "৳0 collected", not "Free". */
export function formatBdtAmount(amountBdt: number) {
  return `৳${amountBdt.toLocaleString("en-BD")}`
}

/** Formats a Date for a `datetime-local` input's `defaultValue`, in local time. */
export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Only allow same-origin relative paths (e.g. "/events/foo") as a post-login
 * redirect target. Rejects absolute URLs and protocol-relative "//evil.com"
 * paths, which would otherwise be an open redirect.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}
