/** Lightweight EN/RU i18n for the Vue dashboard. */

export type Lang = "en" | "ru"

type Dict = Record<string, string>

const en: Dict = {
  "login.title": "Signing in…",
  "login.body": "Exchanging your one-time link for a secure session.",
  "error.hint": "Open the bot → Statistics → «Open dashboard» for a new link.",
  "error.missing_token.title": "Link incomplete",
  "error.missing_token.body":
    "This page needs a one-time token from the Telegram bot.",
  "error.invalid_token.title": "Link invalid or expired",
  "error.invalid_token.body":
    "The one-time link was already used, expired, or is invalid.",
  "error.not_authenticated.title": "Session required",
  "error.not_authenticated.body":
    "Open a fresh dashboard link from the bot to continue.",
  "error.exchange_failed.title": "Could not sign in",
  "error.exchange_failed.body":
    "The server could not exchange your token. Try again later.",
  "error.unknown.title": "Something went wrong",
  "error.unknown.body": "Please request a new dashboard link from the bot.",
  "dash.title": "HabiTracker Dashboard",
  "dash.subtitle": "Stats & schedule · last {days} days",
  "dash.logout": "Log out",
  "dash.loading": "Loading stats…",
  "dash.load_error": "Failed to load dashboard data",
  "dash.partial": "Partial data may still be shown below.",
  "dash.refresh": "Refresh",
  "dash.settings": "Settings",
  "dash.new_task": "New task",
  "dash.completion": "Completion",

  "dash.streak": "Streak",
  "dash.habits": "Habits",
  "dash.missed": "Missed",
  "dash.tasks_ratio": "{completed}/{total} tasks",
  "dash.no_data": "No data",
  "dash.days_in_row": "days in a row",
  "dash.templates": "templates",
  "dash.incomplete": "incomplete",
  "dash.chart_title": "Completion chart",
  "dash.habits_title": "Habit breakdown",
  "dash.schedule_title": "Schedule",
  "chart.empty": "No completion data for this period yet.",
  "chart.completed": "Completed",
  "chart.missed": "Missed",
  "habits.empty": "No habits yet. Create one in the bot.",
  "schedule.empty": "No tasks in this range. Create one or wait for habits to generate.",
  "schedule.done": "done",
  "schedule.open": "open",
  "schedule.untitled": "Untitled",
  "schedule.toggle": "Toggle completion",
  "schedule.edit": "Edit",
  "schedule.delete": "Delete",
  "schedule.confirm_delete": "Delete this task?",
  "schedule.action_error": "Could not update task",
  "task.form_create": "New task",
  "task.form_edit": "Edit task",
  "task.title": "Title",
  "task.date": "Date",
  "task.start": "Start",
  "task.end": "End",
  "task.open_ended": "Open-ended",
  "task.cancel": "Cancel",
  "task.save": "Save",
  "task.saving": "Saving…",
  "task.title_required": "Title is required",
  "task.end_after_start": "End time must be after start",
  "task.conflict": "This time slot conflicts with another task",
  "settings.title": "Account settings",
  "settings.subtitle": "Profile and preferences (same as in the bot)",
  "settings.back_dash": "Dashboard",
  "settings.loading": "Loading account…",
  "settings.load_error": "Failed to load account",
  "settings.profile": "Profile",
  "settings.telegram_id": "Telegram ID",
  "settings.username": "Username",
  "settings.name": "Name",
  "settings.profile_hint":
    "Name and username come from Telegram and cannot be edited here.",
  "settings.prefs": "Preferences",
  "settings.language": "Language",
  "settings.timezone": "Timezone",
  "settings.reminder": "Daily reminder",
  "settings.reminder_off": "Off",
  "settings.interval": "Check-in interval",
  "settings.minutes": "{n} min",
  "settings.save": "Save",
  "settings.saving": "Saving…",
  "settings.saved": "Settings saved.",
  "settings.save_error": "Could not save settings",
}


const ru: Dict = {
  "login.title": "Вход…",
  "login.body": "Обмениваем одноразовую ссылку на безопасную сессию.",
  "error.hint":
    "Откройте бота → Статистика → «Открыть дашборд» для новой ссылки.",
  "error.missing_token.title": "Ссылка неполная",
  "error.missing_token.body":
    "Этой странице нужен одноразовый токен из Telegram-бота.",
  "error.invalid_token.title": "Ссылка недействительна или устарела",
  "error.invalid_token.body":
    "Одноразовая ссылка уже использована, истекла или неверна.",
  "error.not_authenticated.title": "Нужна сессия",
  "error.not_authenticated.body":
    "Откройте свежую ссылку на дашборд из бота, чтобы продолжить.",
  "error.exchange_failed.title": "Не удалось войти",
  "error.exchange_failed.body":
    "Сервер не смог обменять токен. Попробуйте позже.",
  "error.unknown.title": "Что-то пошло не так",
  "error.unknown.body": "Запросите новую ссылку на дашборд в боте.",
  "dash.title": "HabiTracker — дашборд",
  "dash.subtitle": "Статистика и расписание · последние {days} дн.",
  "dash.logout": "Выйти",
  "dash.loading": "Загрузка статистики…",
  "dash.load_error": "Не удалось загрузить данные дашборда",
  "dash.partial": "Ниже могут отображаться частичные данные.",
  "dash.refresh": "Обновить",
  "dash.settings": "Настройки",
  "dash.new_task": "Новая задача",
  "dash.completion": "Выполнение",

  "dash.streak": "Серия",
  "dash.habits": "Привычки",
  "dash.missed": "Пропущено",
  "dash.tasks_ratio": "{completed}/{total} задач",
  "dash.no_data": "Нет данных",
  "dash.days_in_row": "дней подряд",
  "dash.templates": "шаблонов",
  "dash.incomplete": "не выполнено",
  "dash.chart_title": "График выполнения",
  "dash.habits_title": "По привычкам",
  "dash.schedule_title": "Расписание",
  "chart.empty": "Пока нет данных о выполнении за этот период.",
  "chart.completed": "Выполнено",
  "chart.missed": "Пропущено",
  "habits.empty": "Привычек пока нет. Создайте первую в боте.",
  "schedule.empty":
    "В этом диапазоне нет задач. Создайте задачу или дождитесь привычек.",
  "schedule.done": "готово",
  "schedule.open": "открыто",
  "schedule.untitled": "Без названия",
  "schedule.toggle": "Отметить выполнение",
  "schedule.edit": "Изменить",
  "schedule.delete": "Удалить",
  "schedule.confirm_delete": "Удалить эту задачу?",
  "schedule.action_error": "Не удалось обновить задачу",
  "task.form_create": "Новая задача",
  "task.form_edit": "Редактировать задачу",
  "task.title": "Название",
  "task.date": "Дата",
  "task.start": "Начало",
  "task.end": "Конец",
  "task.open_ended": "Без конца",
  "task.cancel": "Отмена",
  "task.save": "Сохранить",
  "task.saving": "Сохранение…",
  "task.title_required": "Укажите название",
  "task.end_after_start": "Конец должен быть позже начала",
  "task.conflict": "Это время пересекается с другой задачей",
  "settings.title": "Настройки аккаунта",
  "settings.subtitle": "Профиль и предпочтения (как в боте)",
  "settings.back_dash": "Дашборд",
  "settings.loading": "Загрузка аккаунта…",
  "settings.load_error": "Не удалось загрузить аккаунт",
  "settings.profile": "Профиль",
  "settings.telegram_id": "Telegram ID",
  "settings.username": "Username",
  "settings.name": "Имя",
  "settings.profile_hint":
    "Имя и username берутся из Telegram и здесь не редактируются.",
  "settings.prefs": "Предпочтения",
  "settings.language": "Язык",
  "settings.timezone": "Часовой пояс",
  "settings.reminder": "Ежедневное напоминание",
  "settings.reminder_off": "Выкл",
  "settings.interval": "Интервал check-in",
  "settings.minutes": "{n} мин",
  "settings.save": "Сохранить",
  "settings.saving": "Сохранение…",
  "settings.saved": "Настройки сохранены.",
  "settings.save_error": "Не удалось сохранить настройки",
}


const catalogs: Record<Lang, Dict> = { en, ru }

const LANG_KEY = "habitracker_lang"

export function normalizeLang(raw: string | null | undefined): Lang {
  if (!raw) {
    return detectBrowserLang()
  }
  const code = String(raw).trim().toLowerCase()
  if (code.startsWith("en")) {
    return "en"
  }
  if (code.startsWith("ru")) {
    return "ru"
  }
  return detectBrowserLang()
}

export function detectBrowserLang(): Lang {
  try {
    const nav = typeof navigator !== "undefined" ? navigator.language : ""
    if (nav && nav.toLowerCase().startsWith("en")) {
      return "en"
    }
  } catch {
    // ignore
  }
  return "ru"
}

export function getStoredLang(): Lang | null {
  try {
    const raw = sessionStorage.getItem(LANG_KEY)
    if (raw === "en" || raw === "ru") {
      return raw
    }
  } catch {
    // ignore
  }
  return null
}

export function setStoredLang(lang: Lang): void {
  try {
    sessionStorage.setItem(LANG_KEY, lang)
  } catch {
    // ignore
  }
}

export function resolveLang(preferred?: string | null): Lang {
  if (preferred) {
    return normalizeLang(preferred)
  }
  return getStoredLang() ?? detectBrowserLang()
}

export function t(
  key: string,
  lang: Lang,
  params?: Record<string, string | number>,
): string {
  const catalog = catalogs[lang] ?? catalogs.ru
  let text = catalog[key] ?? catalogs.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}
