import { createRouter, createWebHistory } from "vue-router"
import { isAuthenticated } from "@/auth/session"
import LoginView from "@/views/LoginView.vue"
import DashboardView from "@/views/DashboardView.vue"
import HabitsView from "@/views/HabitsView.vue"
import SettingsView from "@/views/SettingsView.vue"
import ErrorView from "@/views/ErrorView.vue"


export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: () => (isAuthenticated() ? "/dashboard" : "/error"),
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/habits",
      name: "habits",
      component: HabitsView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },

    {
      path: "/error",

      name: "error",
      component: ErrorView,
      meta: { public: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/error",
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) {
    return true
  }
  if (!isAuthenticated()) {
    return {
      name: "error",
      query: { reason: "not_authenticated" },
    }
  }
  return true
})
