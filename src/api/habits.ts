import { apiRequest } from "./client"

export type HabitItem = {
  id: number
  title: string
  start_time: string
  end_time: string | null
  frequency: "daily" | "weekdays" | "weekends" | string
}

export type HabitListResponse = {
  items: HabitItem[]
}

export type HabitCreatePayload = {
  title: string
  start_time: string
  end_time?: string | null
  frequency: string
}

export type HabitUpdatePayload = {
  title?: string
  start_time?: string
  end_time?: string | null
  frequency?: string
}

export const HABIT_FREQUENCIES = ["daily", "weekdays", "weekends"] as const

export function listHabits(): Promise<HabitListResponse> {
  return apiRequest<HabitListResponse>("/api/v1/habits")
}

export function createHabit(payload: HabitCreatePayload): Promise<HabitItem> {
  return apiRequest<HabitItem>("/api/v1/habits", {
    method: "POST",
    body: payload,
  })
}

export function updateHabit(
  id: number,
  payload: HabitUpdatePayload,
): Promise<HabitItem> {
  return apiRequest<HabitItem>(`/api/v1/habits/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteHabit(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/habits/${id}`, {
    method: "DELETE",
  })
}
