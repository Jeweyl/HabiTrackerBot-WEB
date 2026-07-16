import { apiRequest } from "./client"

export type MeResponse = {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  language: string
  timezone: string
  reminder_time: string | null
  check_interval: number
  checkin_no_spam: boolean
  ask_auto_rollover: boolean
}

export type MeUpdatePayload = {
  language?: string
  timezone?: string
  /** Pass `null` to disable daily reminder. */
  reminder_time?: string | null
  check_interval?: number
  checkin_no_spam?: boolean
  ask_auto_rollover?: boolean
}

export function fetchMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/v1/me")
}

export function updateMe(payload: MeUpdatePayload): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/v1/me", {
    method: "PATCH",
    body: payload,
  })
}

/** UTC offsets matching the Telegram bot settings keyboard. */
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const n = 12 - i
    return { value: `-${n}`, label: `UTC-${n}` }
  }),
  { value: "+0", label: "UTC+0" },
  ...Array.from({ length: 14 }, (_, i) => {
    const n = i + 1
    return { value: `+${n}`, label: `UTC+${n}` }
  }),
]

export const CHECK_INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const

/** Whole-hour reminders like the bot keyboard, plus Off. */
export const REMINDER_HOUR_OPTIONS: string[] = Array.from(
  { length: 24 },
  (_, h) => `${String(h).padStart(2, "0")}:00`,
)
