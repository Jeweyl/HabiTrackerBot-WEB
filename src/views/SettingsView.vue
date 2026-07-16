<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>{{ t("settings.title", lang) }}</h1>
        <p class="muted" style="margin: 0.25rem 0 0">
          {{ t("settings.subtitle", lang) }}
        </p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn" @click="goDashboard">
          {{ t("settings.back_dash", lang) }}
        </button>
        <button type="button" class="btn" @click="goHabits">
          {{ t("dash.habits_nav", lang) }}
        </button>
        <button type="button" class="btn btn-ghost" @click="logout">
          {{ t("dash.logout", lang) }}
        </button>
      </div>

    </header>

    <div v-if="loading" class="card center" style="min-height: 200px">
      <div class="spinner" />
      <p class="muted">{{ t("settings.loading", lang) }}</p>
    </div>

    <template v-else>
      <div v-if="loadError" class="card" style="margin-bottom: 1rem">
        <p class="error-title" style="margin: 0">{{ loadError }}</p>
      </div>

      <section v-if="me" class="card" style="margin-bottom: 1rem">
        <h2 class="section-title">{{ t("settings.profile", lang) }}</h2>
        <dl class="profile-grid">
          <div>
            <dt class="muted">{{ t("settings.telegram_id", lang) }}</dt>
            <dd>{{ me.telegram_id }}</dd>
          </div>
          <div>
            <dt class="muted">{{ t("settings.username", lang) }}</dt>
            <dd>{{ me.username ? `@${me.username}` : "—" }}</dd>
          </div>
          <div>
            <dt class="muted">{{ t("settings.name", lang) }}</dt>
            <dd>{{ displayName }}</dd>
          </div>
        </dl>
        <p class="muted" style="margin: 0.75rem 0 0; font-size: 0.85rem">
          {{ t("settings.profile_hint", lang) }}
        </p>
      </section>

      <section v-if="me" class="card">
        <h2 class="section-title">{{ t("settings.prefs", lang) }}</h2>

        <form class="form" @submit.prevent="save">
          <label class="field">
            <span>{{ t("settings.language", lang) }}</span>
            <select v-model="form.language" class="input">
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </label>

          <label class="field">
            <span>{{ t("settings.timezone", lang) }}</span>
            <select v-model="form.timezone" class="input">
              <option
                v-for="opt in timezoneOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>{{ t("settings.reminder", lang) }}</span>
            <select v-model="form.reminder" class="input">
              <option value="off">{{ t("settings.reminder_off", lang) }}</option>
              <option v-for="h in reminderHours" :key="h" :value="h">
                {{ h }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>{{ t("settings.interval", lang) }}</span>
            <select v-model.number="form.check_interval" class="input">
              <option
                v-for="m in intervalOptions"
                :key="m"
                :value="m"
              >
                {{ t("settings.minutes", lang, { n: m }) }}
              </option>
            </select>
          </label>

          <p v-if="saveError" class="error-title" style="margin: 0">
            {{ saveError }}
          </p>
          <p v-if="saveOk" class="ok-msg" style="margin: 0">
            {{ t("settings.saved", lang) }}
          </p>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              {{ saving ? t("settings.saving", lang) : t("settings.save", lang) }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ApiError } from "@/api/client"
import {
  CHECK_INTERVAL_OPTIONS,
  REMINDER_HOUR_OPTIONS,
  TIMEZONE_OPTIONS,
  fetchMe,
  updateMe,
  type MeResponse,
} from "@/api/me"
import { clearAccessToken } from "@/auth/session"
import { resolveLang, setStoredLang, t, type Lang } from "@/i18n"

const router = useRouter()
const lang = ref<Lang>(resolveLang())
const loading = ref(true)
const saving = ref(false)
const loadError = ref<string | null>(null)
const saveError = ref<string | null>(null)
const saveOk = ref(false)
const me = ref<MeResponse | null>(null)

const timezoneOptions = TIMEZONE_OPTIONS
const intervalOptions = CHECK_INTERVAL_OPTIONS
const reminderHours = REMINDER_HOUR_OPTIONS

const form = reactive({
  language: "ru" as string,
  timezone: "+0" as string,
  reminder: "off" as string,
  check_interval: 15 as number,
})

const displayName = computed(() => {
  if (!me.value) {
    return "—"
  }
  const parts = [me.value.first_name, me.value.last_name].filter(Boolean)
  return parts.length ? parts.join(" ") : "—"
})

function normalizeTzForSelect(raw: string | null | undefined): string {
  const v = (raw || "+0").trim()
  if (v.toUpperCase() === "UTC" || v === "0") {
    return "+0"
  }
  if (TIMEZONE_OPTIONS.some((o) => o.value === v)) {
    return v
  }
  // bare number
  if (/^\d+$/.test(v)) {
    return `+${v}`
  }
  return "+0"
}

function applyMe(data: MeResponse) {
  me.value = data
  form.language = data.language === "en" ? "en" : "ru"
  form.timezone = normalizeTzForSelect(data.timezone)
  form.reminder = data.reminder_time ?? "off"
  // If API returned non-hour time, keep it selectable by injecting into list via value
  form.check_interval = data.check_interval || 15
  const next = resolveLang(data.language)
  lang.value = next
  setStoredLang(next)
}

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

function goHabits() {
  void router.push({ name: "habits" })
}


async function load() {
  loading.value = true
  loadError.value = null
  try {
    const data = await fetchMe()
    applyMe(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearAccessToken()
      await router.replace({
        name: "error",
        query: { reason: "invalid_token" },
      })
      return
    }
    loadError.value =
      err instanceof Error ? err.message : t("settings.load_error", lang.value)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  saveError.value = null
  saveOk.value = false
  try {
    const payload = {
      language: form.language,
      timezone: form.timezone,
      reminder_time: form.reminder === "off" ? null : form.reminder,
      check_interval: form.check_interval,
    }
    const data = await updateMe(payload)
    applyMe(data)
    saveOk.value = true
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearAccessToken()
      await router.replace({
        name: "error",
        query: { reason: "invalid_token" },
      })
      return
    }
    saveError.value =
      err instanceof Error ? err.message : t("settings.save_error", lang.value)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.profile-grid {
  display: grid;
  gap: 0.75rem 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin: 0;
}

.profile-grid dt {
  font-size: 0.8rem;
  margin: 0 0 0.15rem;
}

.profile-grid dd {
  margin: 0;
  font-weight: 600;
}

.form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.input {
  font: inherit;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.ok-msg {
  color: var(--ok);
  font-size: 0.9rem;
}
</style>
