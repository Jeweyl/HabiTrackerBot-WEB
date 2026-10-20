<template>
  <div class="page center">
    <div class="card" style="max-width: 420px; width: 100%">
      <div class="spinner" aria-hidden="true" />
      <h1 style="margin: 0 0 0.5rem; font-size: 1.25rem">
        {{ t("login.title", lang) }}
      </h1>
      <p class="muted" style="margin: 0">
        {{ t("login.body", lang) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { exchangeTelegramInitData, exchangeToken } from "@/api/auth"
import { ApiError } from "@/api/client"
import { setAccessToken } from "@/auth/session"
import { resolveLang, t, type Lang } from "@/i18n"
import { getTelegramInitData } from "@/telegram"

const route = useRoute()
const router = useRouter()
const controller = new AbortController()
const lang = ref<Lang>(resolveLang())

onMounted(async () => {
  const raw = route.query.token
  const token = Array.isArray(raw) ? raw[0] : raw
  // Telegram may finish attaching WebApp.initData just after the page starts.
  // Wait briefly before falling back to the legacy ?token=... flow.
  let initData = getTelegramInitData()
  for (let attempt = 0; !initData && attempt < 20; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 100))
    if (controller.signal.aborted) {
      return
    }
    initData = getTelegramInitData()
  }

  // Inside Telegram, authentication comes from fresh initData.
  // The old one-time ?token=... flow is only a fallback for external browser opens.
  if (!initData && (!token || !String(token).trim())) {
    await router.replace({
      name: "error",
      query: { reason: "missing_token" },
    })
    return
  }

  try {
    const result = initData
      ? await exchangeTelegramInitData(initData, controller.signal)
      : await exchangeToken(String(token).trim(), controller.signal)
    if (!result?.access_token) {
      await router.replace({
        name: "error",
        query: { reason: "invalid_token" },
      })
      return
    }
    setAccessToken(result.access_token)
    await router.replace({ name: "dashboard" })
  } catch (err) {
    if (controller.signal.aborted) {
      return
    }
    const reason =
      err instanceof ApiError && err.status === 401
        ? "invalid_token"
        : "exchange_failed"
    await router.replace({ name: "error", query: { reason } })
  }
})

onUnmounted(() => {
  controller.abort()
})
</script>
