<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>{{ t("dash.title", lang) }}</h1>
        <p class="muted" style="margin: 0.25rem 0 0">
          {{ t("dash.subtitle", lang, { days }) }}
        </p>
      </div>
      <div class="header-actions">
        <div class="range-toggle" role="group" aria-label="Range">
          <button
            type="button"
            class="btn"
            :class="{ 'btn-primary': days === 7 }"
            @click="setDays(7)"
          >
            7d
          </button>
          <button
            type="button"
            class="btn"
            :class="{ 'btn-primary': days === 30 }"
            @click="setDays(30)"
          >
            30d
          </button>
        </div>
        <button type="button" class="btn" @click="loadAll" :disabled="loading">
          {{ t("dash.refresh", lang) }}
        </button>
        <button type="button" class="btn" @click="goSettings">
          {{ t("dash.settings", lang) }}
        </button>
        <button type="button" class="btn btn-ghost" @click="logout">
          {{ t("dash.logout", lang) }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="card center" style="min-height: 200px">
      <div class="spinner" />
      <p class="muted">{{ t("dash.loading", lang) }}</p>
    </div>

    <template v-else>
      <div v-if="loadError" class="card" style="margin-bottom: 1rem">
        <p class="error-title" style="margin: 0">{{ loadError }}</p>
        <p class="muted" style="margin: 0.5rem 0 0">
          {{ t("dash.partial", lang) }}
        </p>
      </div>

      <div v-if="actionError" class="card" style="margin-bottom: 1rem">
        <p class="error-title" style="margin: 0">{{ actionError }}</p>
      </div>

      <section class="grid" style="margin-bottom: 1rem">
        <article class="card stat-card">
          <h3>{{ t("dash.completion", lang) }}</h3>
          <div class="value">
            {{ overview ? `${overview.completion_rate}%` : "—" }}
          </div>
          <p class="muted" style="margin: 0.35rem 0 0; font-size: 0.85rem">
            {{
              overview
                ? t("dash.tasks_ratio", lang, {
                    completed: overview.completed_tasks,
                    total: overview.total_tasks,
                  })
                : t("dash.no_data", lang)
            }}
          </p>
        </article>
        <article class="card stat-card">
          <h3>{{ t("dash.streak", lang) }}</h3>
          <div class="value">🔥 {{ overview ? overview.streak : "—" }}</div>
          <p class="muted" style="margin: 0.35rem 0 0; font-size: 0.85rem">
            {{ t("dash.days_in_row", lang) }}
          </p>
        </article>
        <article class="card stat-card">
          <h3>{{ t("dash.habits", lang) }}</h3>
          <div class="value">
            {{ overview ? overview.habits_count : "—" }}
          </div>
          <p class="muted" style="margin: 0.35rem 0 0; font-size: 0.85rem">
            {{ t("dash.templates", lang) }}
          </p>
        </article>
        <article class="card stat-card">
          <h3>{{ t("dash.missed", lang) }}</h3>
          <div class="value">
            {{ overview ? overview.missed_tasks : "—" }}
          </div>
          <p class="muted" style="margin: 0.35rem 0 0; font-size: 0.85rem">
            {{ t("dash.incomplete", lang) }}
          </p>
        </article>
      </section>

      <section class="card" style="margin-bottom: 1rem">
        <h2 class="section-title">{{ t("dash.chart_title", lang) }}</h2>
        <CompletionChart :series="dailySeries" :lang="lang" />
      </section>

      <section class="card" style="margin-bottom: 1rem">
        <h2 class="section-title">{{ t("dash.habits_title", lang) }}</h2>
        <HabitBreakdown :items="habits" :lang="lang" />
      </section>

      <section class="card">
        <div class="section-head">
          <h2 class="section-title" style="margin: 0">
            {{ t("dash.schedule_title", lang) }}
          </h2>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="busyId !== null"
            @click="openCreate"
          >
            {{ t("dash.new_task", lang) }}
          </button>
        </div>
        <ScheduleList
          :items="schedule"
          :lang="lang"
          :busy-id="busyId"
          @toggle="onToggle"
          @edit="openEdit"
          @remove="onRemove"
        />
      </section>
    </template>

    <TaskFormModal
      v-if="modalOpen"
      ref="modalRef"
      :mode="modalMode"
      :lang="lang"
      :initial="editingTask"
      :default-date="defaultTaskDate"
      @close="closeModal"
      @save="onSaveTask"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ApiError } from "@/api/client"
import {
  fetchDaily,
  fetchHabitBreakdown,
  fetchOverview,
  fetchSchedule,
  type DailyPoint,
  type HabitBreakdownItem,
  type OverviewResponse,
  type ScheduleItem,
} from "@/api/stats"
import { createTask, deleteTask, updateTask } from "@/api/tasks"
import { clearAccessToken } from "@/auth/session"
import CompletionChart from "@/components/CompletionChart.vue"
import HabitBreakdown from "@/components/HabitBreakdown.vue"
import ScheduleList from "@/components/ScheduleList.vue"
import TaskFormModal from "@/components/TaskFormModal.vue"
import { resolveLang, setStoredLang, t, type Lang } from "@/i18n"
import { rangeLastDays } from "@/utils/dates"

const router = useRouter()
const loading = ref(true)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const days = ref(7)
const lang = ref<Lang>(resolveLang())
const overview = ref<OverviewResponse | null>(null)
const dailySeries = ref<DailyPoint[]>([])
const schedule = ref<ScheduleItem[]>([])
const habits = ref<HabitBreakdownItem[]>([])
const busyId = ref<number | null>(null)

const modalOpen = ref(false)
const modalMode = ref<"create" | "edit">("create")
const editingTask = ref<ScheduleItem | null>(null)
const modalRef = ref<{
  setError: (msg: string) => void
  setSaving: (v: boolean) => void
} | null>(null)

const defaultTaskDate = computed(() => {
  return new Date().toISOString().slice(0, 10)
})

function logout() {
  clearAccessToken()
  void router.replace({
    name: "error",
    query: { reason: "not_authenticated" },
  })
}

function goSettings() {
  void router.push({ name: "settings" })
}

function setDays(value: 7 | 30) {
  if (days.value === value) {
    return
  }
  days.value = value
}

async function handleAuthError(err: unknown): Promise<boolean> {
  if (err instanceof ApiError && err.status === 401) {
    clearAccessToken()
    await router.replace({
      name: "error",
      query: { reason: "invalid_token" },
    })
    return true
  }
  return false
}

function errorMessage(err: unknown, fallbackKey: string): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return t("task.conflict", lang.value)
    }
    if (err.message) {
      return err.message
    }
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return t(fallbackKey, lang.value)
}

async function loadAll() {
  loading.value = true
  loadError.value = null
  actionError.value = null
  const range = rangeLastDays(days.value)

  try {
    const [ov, daily, sched, habitData] = await Promise.all([
      fetchOverview(days.value),
      fetchDaily(range.from, range.to),
      fetchSchedule(range.from, range.to),
      fetchHabitBreakdown(days.value),
    ])
    overview.value = ov
    if (ov?.language) {
      const next = resolveLang(ov.language)
      lang.value = next
      setStoredLang(next)
    }
    dailySeries.value = daily?.series ?? []
    schedule.value = sched?.items ?? []
    habits.value = habitData?.items ?? []
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    loadError.value =
      err instanceof Error ? err.message : t("dash.load_error", lang.value)
    overview.value = overview.value
    dailySeries.value = dailySeries.value ?? []
    schedule.value = schedule.value ?? []
    habits.value = habits.value ?? []
  } finally {
    loading.value = false
  }
}

/** Reload schedule + overview/chart after mutations (lighter than full spinner). */
async function refreshAfterMutation() {
  const range = rangeLastDays(days.value)
  try {
    const [ov, daily, sched] = await Promise.all([
      fetchOverview(days.value),
      fetchDaily(range.from, range.to),
      fetchSchedule(range.from, range.to),
    ])
    overview.value = ov
    dailySeries.value = daily?.series ?? []
    schedule.value = sched?.items ?? []
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    // Fall back to full reload on partial failure
    await loadAll()
  }
}

function openCreate() {
  actionError.value = null
  modalMode.value = "create"
  editingTask.value = null
  modalOpen.value = true
}

function openEdit(task: ScheduleItem) {
  if (task.is_placeholder) {
    return
  }
  actionError.value = null
  modalMode.value = "edit"
  editingTask.value = task
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingTask.value = null
  modalRef.value?.setSaving(false)
}

async function onToggle(task: ScheduleItem) {
  if (busyId.value !== null || task.is_placeholder) {
    return
  }
  actionError.value = null
  busyId.value = task.id
  try {
    await updateTask(task.id, { is_completed: !task.is_completed })
    await refreshAfterMutation()
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    actionError.value = errorMessage(err, "schedule.action_error")
  } finally {
    busyId.value = null
  }
}

async function onRemove(task: ScheduleItem) {
  if (busyId.value !== null || task.is_placeholder) {
    return
  }
  const ok = window.confirm(t("schedule.confirm_delete", lang.value))
  if (!ok) {
    return
  }
  actionError.value = null
  busyId.value = task.id
  try {
    await deleteTask(task.id)
    await refreshAfterMutation()
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    actionError.value = errorMessage(err, "schedule.action_error")
  } finally {
    busyId.value = null
  }
}

async function onSaveTask(payload: {
  title: string
  date: string
  start_time: string
  end_time: string | null
}) {
  const modal = modalRef.value
  modal?.setError("")
  modal?.setSaving(true)
  actionError.value = null
  try {
    if (modalMode.value === "create") {
      await createTask({
        title: payload.title,
        date: payload.date,
        start_time: payload.start_time,
        end_time: payload.end_time,
      })
    } else if (editingTask.value) {
      await updateTask(editingTask.value.id, {
        title: payload.title,
        date: payload.date,
        start_time: payload.start_time,
        end_time: payload.end_time,
      })
    }
    closeModal()
    await refreshAfterMutation()
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    const msg = errorMessage(err, "schedule.action_error")
    modal?.setError(msg)
    modal?.setSaving(false)
  }
}

onMounted(() => {
  void loadAll()
})

watch(days, () => {
  void loadAll()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.range-toggle {
  display: inline-flex;
  gap: 0.35rem;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
</style>
