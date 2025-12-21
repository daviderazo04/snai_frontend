import { createRouter, createWebHistory } from "vue-router";

// Vistas públicas
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/public/LoginView.vue";
import RegisterView from "../views/public/RegisterView.vue";

// Layout privado y vistas internas
import PrivateLayout from "../views/private/layout/PrivateLayout.vue";
import HomeApp from "../views/private/HomeApp.vue";
import Perfiles from "../views/private/perfiles.vue";
import ProvinciasView from "../views/private/provincia/index.vue";
import ProvinciaDetalle from "../views/private/provincia/[id]/index.vue";

// Formularios (privados)
import DashboardView from "../views/formularios/DashboardView.vue";
import FamiliarForm from "../views/formularios/FamiliarFormView.vue";
import TerapeuticaForm from "../views/formularios/TerapeuticaFormView.vue";
import OcupacionalForm from "../views/formularios/OcupacionalFormView.vue";
import JuridicaForm from "../views/formularios/JuridicaFormView.vue";
import TrasladoForm from "../views/formularios/TrasladoFormView.vue";

const routes = [
  // =======================
  // RUTAS PÚBLICAS
  // =======================
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },

  // =======================
  // RUTAS PRIVADAS (todo dentro de /app)
  // =======================
  {
    path: "/app",
    component: PrivateLayout,
    meta: { requiresAuth: true },

    children: [
      {
        path: "",
        name: "app-home",
        component: HomeApp,
      },
      {
        path: "perfiles",
        name: "perfiles",
        component: Perfiles,
      },
      {
        path: "provincias",
        name: "provincias",
        component: ProvinciasView,
      },
      {
        path: "provincias/:id",
        name: "provinciaDetalle",
        component: ProvinciaDetalle,
      },

      // Formularios privados
      {
        path: "dashboard",
        name: "dashboard",
        component: DashboardView,
      },
      {
        path: "familiar",
        name: "familiarForm",
        component: FamiliarForm,
      },
      {
        path: "terapeutica",
        name: "terapeuticaForm",
        component: TerapeuticaForm,
      },
      {
        path: "ocupacional",
        name: "ocupacionalForm",
        component: OcupacionalForm,
      },
      {
        path: "juridica",
        name: "juridicaForm",
        component: JuridicaForm,
      },
      {
        path: "traslado",
        name: "trasladoForm",
        component: TrasladoForm,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// =======================
// PROTECCIÓN DE RUTAS
// =======================
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("snai_token");

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  next();
});

export default router;
