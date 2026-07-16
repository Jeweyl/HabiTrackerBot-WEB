import { apiRequest } from "./client"

export type TaskItem = {
  id: number
  title: string
  date: string
  start_time: string | null
  end_time: string | null
  is_completed: boolean
  is_placeholder: boolean
  habit_id: number | null
  auto_rollover: boolean
}

export type TaskListResponse = {
  from: string
  to: string
  items: TaskItem[]
}

export type TaskCreatePayload = {
  title: string
  date: string
  start_time?: string | null
  end_time?: string | null
  auto_rollover?: boolean
}

export type TaskUpdatePayload = {
  title?: string
  date?: string
  start_time?: string | null
  end_time?: string | null
  is_completed?: boolean
  auto_rollover?: boolean
}

export const TIME_GRID_MINUTES = ["00", "15", "30", "45"] as const

export function listTasks(from: string, to: string): Promise<TaskListResponse> {
  const q = new URLSearchParams({ from, to })
  return apiRequest<TaskListResponse>(`/api/v1/tasks?${q}`)
}

export function createTask(payload: TaskCreatePayload): Promise<TaskItem> {
  return apiRequest<TaskItem>("/api/v1/tasks", {
    method: "POST",
    body: payload,
  })
}

export function updateTask(
  id: number,
  payload: TaskUpdatePayload,
): Promise<TaskItem> {
  return apiRequest<TaskItem>(`/api/v1/tasks/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteTask(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/tasks/${id}`, {
    method: "DELETE",
  })
}

/** Build HH:MM options on the bot 15-minute grid. */
export function timeGridOptions(): string[] {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of TIME_GRID_MINUTES) {
      out.push(`${String(h).padStart(2, "0")}:${m}`)
    }
  }
  return out
}
