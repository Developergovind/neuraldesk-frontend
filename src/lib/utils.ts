import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

/**
 * Utility for merging Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date nicely with error fallback
 */
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
}

/**
 * Safe distance to now formatting without crashing on invalid dates
 */
export function safeFormatDistanceToNow(
  dateInput: string | Date | undefined | null,
  options: { addSuffix?: boolean } = { addSuffix: false }
): string {
  if (!dateInput) return "Just now";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date, options);
  } catch {
    return "Recently";
  }
}

/**
 * Safe date-fns format wrapper
 */
export function safeFormat(
  dateInput: string | Date | undefined | null,
  formatStr: string,
  fallback = "N/A"
): string {
  if (!dateInput) return fallback;
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Generates a valid RFC4122 v4 UUID
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  // Fallback RFC4122 compliant UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Sleep utility for fake delays/testing
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


