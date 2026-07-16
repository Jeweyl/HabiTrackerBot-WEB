<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>{{ t("habits_page.title", lang) }}</h1>
        <p class="muted" style="margin: 0.25rem 0 0">
          {{ t("habits_page.subtitle", lang) }}
        </p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn" @click="goDashboard">
          {{ t("habits_page.back_dash", lang) }}
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
      <p class="muted">{{ t("habits_page.loading", lang) }}</p>
    </div>

    <template v-else>
      <div v-if="loadError" class="card" style="margin-bottom: 1rem">
        <p class="error-title" style="margin: 0">{{ loadError }}</p>
      </div>

      <div v-if="actionError" class="card" style="margin-bottom: 1rem">
        <p class="error-title" style="margin: 0">{{ actionError }}</p>
      </div>

      <section class="card">
        <div class="section-head">
          <h2 class="section-title" style="margin: 0">
            {{ t("habits_page.list_title", lang) }}
          </h2>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="busyId !== null"
            @click="openCreate"
          >
            {{ t("habits_page.new_habit", lang) }}
          </button>
        </div>

        <div v-if="!habits.length" class="empty-state">
          <p class="muted" style="margin: 0">
            {{ t("habits_page.empty", lang) }}
          </p>
        </div>

        <ul v-else class="habit-list">
          <li v-for="habit in habits" :key="habit.id" class="habit-row">
            <div class="habit-main">
              <span class="habit-title">{{
                habit.title || t("schedule.untitled", lang)
              }}</span>
              <span class="muted habit-meta">
                {{ formatTime(habit) }} · {{ freqLabel(habit.frequency) }}
              </span>
            </div>
            <div class="row-actions">
              <button
                type="button"
                class="btn btn-sm"
                :disabled="busyId === habit.id"
                @click="openEdit(habit)"
              >
                {{ t("schedule.edit", lang) }}
              </button>
              <button
                type="button"
                class="btn btn-sm btn-danger"
                :disabled="busyId === habit.id"
                @click="onRemove(habit)"
              >
                {{ t("schedule.delete", lang) }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <HabitFormModal
      v-if="modalOpen"
      ref="modalRef"
      :mode="modalMode"
      :lang="lang"
      :initial="editingHabit"
      @close="closeModal"
      @save="onSaveHabit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { ApiError } from "@/api/client"
import {
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
  type HabitItem,
} from "@/api/habits"
import { clearAccessToken } from "@/auth/session"
import HabitFormModal from "@/components/HabitFormModal.vue"
import { resolveLang, setStoredLang, t, type Lang } from "@/i18n"

const router = useRouter()
const loading = ref(true)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const lang = ref<Lang>(resolveLang())
const habits = ref<HabitItem[]>([])
const busyId = ref<number | null>(null)

const modalOpen = ref(false)
const modalMode = ref<"create" | "edit">("create")
const editingHabit = ref<HabitItem | null>(null)
const modalRef = ref<{
  setError: (msg: string) => void
  setSaving: (v: boolean) => void
} | null>(null)

function logout() {
  clearAccessToken()
  void router.replace({
    name: "error",
    query: { reason: "not_authenticated" },
  })
}

function goDashboard() {
  void router.push({ name: "dashboard" })
}

function goSettings() {
  void router.push({ name: "settings" })
}

function formatTime(habit: HabitItem): string {
  if (habit.end_time) {
    return `${habit.start_time}–${habit.end_time}`
  }
  return `${habit.start_time}, ${t("habit.open_ended", lang.value).toLowerCase()}`
}

function freqLabel(freq: string): string {
  if (freq === "weekdays") return t("habit.freq_weekdays", lang.value)
  if (freq === "weekends") return t("habit.freq_weekends", lang.value)
  return t("habit.freq_daily", lang.value)
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
      return t("habit.conflict", lang.value)
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
  try {
    const data = await listHabits()
    habits.value = data?.items ?? []
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    loadError.value =
      err instanceof Error ? err.message : t("habits_page.load_error", lang.value)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  actionError.value = null
  modalMode.value = "create"
  editingHabit.value = null
  modalOpen.value = true
}

function openEdit(habit: HabitItem) {
  actionError.value = null
  modalMode.value = "edit"
  editingHabit.value = habit
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingHabit.value = null
  modalRef.value?.setSaving(false)
}

async function onRemove(habit: HabitItem) {
  if (busyId.value !== null) {
    return
  }
  const ok = window.confirm(t("habits_page.confirm_delete", lang.value))
  if (!ok) {
    return
  }
  actionError.value = null
  busyId.value = habit.id
  try {
    await deleteHabit(habit.id)
    await loadAll()
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    actionError.value = errorMessage(err, "habits_page.action_error")
  } finally {
    busyId.value = null
  }
}

async function onSaveHabit(payload: {
  title: string
  start_time: string
  end_time: string | null
  frequency: string
}) {
  const modal = modalRef.value
  modal?.setError("")
  modal?.setSaving(true)
  actionError.value = null
  try {
    if (modalMode.value === "create") {
      await createHabit({
        title: payload.title,
        start_time: payload.start_time,
        end_time: payload.end_time,
        frequency: payload.frequency,
      })
    } else if (editingHabit.value) {
      await updateHabit(editingHabit.value.id, {
        title: payload.title,
        start_time: payload.start_time,
        end_time: payload.end_time,
        frequency: payload.frequency,
      })
    }
    closeModal()
    await loadAll()
  } catch (err) {
    if (await handleAuthError(err)) {
      return
    }
    const msg = errorMessage(err, "habits_page.action_error")
    modal?.setError(msg)
    modal?.setSaving(false)
  }
}

onMounted(() => {
  lang.value = resolveLang()
  setStoredLang(lang.value)
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

.habit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.habit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
}

.habit-main {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.habit-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-meta {
  font-size: 0.85rem;
}

.row-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.3rem 0.55rem;
  font-size: 0.8rem;
}

.btn-danger {
  color: var(--danger);
  border-color: rgba(240, 113, 120, 0.35);
}

.empty-state {
  min-height: 100px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--accent-soft);
}
</style>
