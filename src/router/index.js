import { createRouter, createWebHistory } from "vue-router";

// Views principales
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import DashboardView from "../views/formularios/DashboardView.vue";

// Formularios
import FamiliarForm from "../views/formularios/FamiliarFormView.vue";
import TerapeuticaForm from "../views/formularios/TerapeuticaFormView.vue";
import OcupacionalForm from "../views/formularios/OcupacionalFormView.vue";
import JuridicaForm from "../views/formularios/JuridicaFormView.vue";
import TrasladoForm from "../views/formularios/TrasladoFormView.vue";

const routes = [
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
  {
    path: "/formularios/dashboard",
    name: "dashboard",
    component: DashboardView,
  },

  // Formularios
  {
    path: "/formularios/familiar",
    name: "familiarForm",
    component: FamiliarForm,
  },
  {
    path: "/formularios/terapeutica",
    name: "terapeuticaForm",
    component: TerapeuticaForm,
  },
  {
    path: "/formularios/ocupacional",
    name: "ocupacionalForm",
    component: OcupacionalForm,
  },
  {
    path: "/formularios/juridica",
    name: "juridicaForm",
    component: JuridicaForm,
  },
  {
    path: "/formularios/traslado",
    name: "trasladoForm",
    component: TrasladoForm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
