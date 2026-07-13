import { createApp } from "vue"
import App from "./App.vue"
import { router } from "./router"
import { initTelegramWebApp } from "./telegram"
import "./styles.css"

initTelegramWebApp()
createApp(App).use(router).mount("#app")
