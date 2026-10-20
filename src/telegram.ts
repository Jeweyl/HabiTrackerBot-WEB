/**
 * Telegram Mini App bootstrap (safe when opened outside Telegram).
 */

type TelegramWebApp = {
  ready: () => void
  initData?: string
  expand: () => void
  themeParams?: Record<string, string | undefined>
  colorScheme?: "light" | "dark"
  backgroundColor?: string
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
}

function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null
  }
  const tg = (
    window as Window & {
      Telegram?: { WebApp?: TelegramWebApp }
    }
  ).Telegram
  return tg?.WebApp ?? null
}

/** Call once at app start: ready + expand + optional theme colors. */
export function initTelegramWebApp(): void {
  const webApp = getWebApp()
  if (!webApp) {
    return
  }

  try {
    webApp.ready()
  } catch {
    // ignore
  }

  try {
    webApp.expand()
  } catch {
    // ignore
  }

  const bg = webApp.themeParams?.bg_color
  if (bg) {
    try {
      document.documentElement.style.setProperty("--tg-bg", bg)
      document.body.style.backgroundColor = bg
      webApp.setBackgroundColor?.(bg)
      webApp.setHeaderColor?.(bg)
    } catch {
      // ignore older clients
    }
  }

  const text = webApp.themeParams?.text_color
  if (text) {
    document.documentElement.style.setProperty("--tg-text", text)
  }
}

export function isTelegramWebApp(): boolean {
  return getWebApp() != null
}


export function getTelegramInitData(): string | null {
  return getWebApp()?.initData?.trim() || null
}
