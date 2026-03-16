import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCents(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

/**
 * Parse an ISO date string and treat it as shop-local time (UTC stored = local time).
 * Strips the timezone offset so the browser displays the raw hours without conversion.
 */
function toLocalDate(dateStr: string): Date {
    // Remove timezone offset (+00:00 or Z) so Date() treats it as local
    const normalized = dateStr.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
    return new Date(normalized);
}

export function formatDateTime(dateStr: string): string {
    return toLocalDate(dateStr).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

export function formatDateTimeShort(dateStr: string): string {
    return toLocalDate(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

export function formatTime(dateStr: string): string {
    return toLocalDate(dateStr).toLocaleString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
