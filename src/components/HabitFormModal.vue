<template>
  <div class="overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
    <div class="card modal">
      <h2 class="section-title">
        {{
          mode === "create"
            ? t("habit.form_create", lang)
            : t("habit.form_edit", lang)
        }}
      </h2>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>{{ t("habit.title", lang) }}</span>
          <input
            v-model="form.title"
            class="input"
            type="text"
            maxlength="200"
            required
          />
        </label>

        <div class="row-2">
          <label class="field">
            <span>{{ t("habit.start", lang) }}</span>
            <select v-model="form.start_time" class="input" required>
              <option v-for="tm in times" :key="tm" :value="tm">{{ tm }}</option>
            </select>
          </label>
          <label class="field">
            <span>{{ t("habit.end", lang) }}</span>
            <select v-model="form.end_time" class="input">
              <option value="">{{ t("habit.open_ended", lang) }}</option>
              <option v-for="tm in times" :key="'e' + tm" :value="tm">
                {{ tm }}
              </option>
            </select>
          </label>
        </div>

        <label class="field">
          <span>{{ t("habit.frequency", lang) }}</span>
          <select v-model="form.frequency" class="input" required>
            <option value="daily">{{ t("habit.freq_daily", lang) }}</option>
            <option value="weekdays">{{ t("habit.freq_weekdays", lang) }}</option>
            <option value="weekends">{{ t("habit.freq_weekends", lang) }}</option>
          </select>
        </label>

        <p v-if="error" class="error-title" style="margin: 0">{{ error }}</p>

        <div class="form-actions">
          <button type="button" class="btn" :disabled="saving" @click="emit('close')">
            {{ t("habit.cancel", lang) }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? t("habit.saving", lang) : t("habit.save", lang) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import type { HabitItem } from "@/api/habits"
import { timeGridOptions } from "@/api/tasks"
import { t, type Lang } from "@/i18n"

const props = withDefaults(
  defineProps<{
    mode: "create" | "edit"
    lang?: Lang
    initial?: HabitItem | null
  }>(),
  {
    lang: "ru",
    initial: null,
  },
)

const emit = defineEmits<{
  close: []
  save: [
    payload: {
      title: string
      start_time: string
      end_time: string | null
      frequency: string
    },
  ]
}>()

const times = timeGridOptions()
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  title: "",
  start_time: "09:00",
  end_time: "10:00",
  frequency: "daily",
})

onMounted(() => {
  if (props.mode === "edit" && props.initial) {
    form.title = props.initial.title || ""
    form.start_time = props.initial.start_time
    form.end_time = props.initial.end_time ?? ""
    form.frequency = props.initial.frequency || "daily"
  } else {
    form.title = ""
    form.start_time = "09:00"
    form.end_time = "10:00"
    form.frequency = "daily"
  }
})

function submit() {
  error.value = null
  const title = form.title.trim()
  if (!title) {
    error.value = t("habit.title_required", props.lang)
    return
  }
  if (form.end_time && form.end_time <= form.start_time) {
    error.value = t("habit.end_after_start", props.lang)
    return
  }
  emit("save", {
    title,
    start_time: form.start_time,
    end_time: form.end_time ? form.end_time : null,
    frequency: form.frequency,
  })
}

defineExpose({
  setError(msg: string) {
    error.value = msg
  },
  setSaving(v: boolean) {
    saving.value = v
  },
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

.modal {
  width: min(440px, 100%);
  max-height: 90vh;
  overflow: auto;
}

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.form {
  display: grid;
  gap: 0.85rem;
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

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
