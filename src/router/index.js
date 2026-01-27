import { createRouter, createWebHistory } from "vue-router";

/* =======================
   VISTAS PÚBLICAS
======================= */
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/public/LoginView.vue";
import RegisterView from "../views/public/RegisterView.vue";

/* =======================
   LAYOUT PRIVADO
======================= */
import PrivateLayout from "../views/private/layout/PrivateLayout.vue";
import HomeApp from "../views/private/HomeApp.vue";
import Perfiles from "../views/private/perfiles.vue";

/* =======================
   CATÁLOGOS
======================= */
import ProvinciasView from "../views/private/provincia/index.vue";
import ProvinciaDetalle from "../views/private/provincia/[id]/index.vue";

import CantonesView from "../views/private/cantones/index.vue";
import CantonDetalle from "../views/private/cantones/[id]/index.vue";

import CaisView from "../views/private/cai/index.vue";
import CaiDetalle from "../views/private/cai/[id]/index.vue";

import EstadoCivilView from "../views/private/estado-civil/index.vue";

import EtniaList from "../views/private/etnia/index.vue";
import EtniaForm from "../views/private/etnia/[id]/index.vue";

import GdoView from "../views/private/gdos/index.vue";
import GdoDetalle from "../views/private/gdos/[id]/index.vue";

import NacionalidadView from "../views/private/nacionalidad/index.vue";
import NacionalidadDetalle from "../views/private/nacionalidad/[id]/index.vue";

import ParentescoView from "../views/private/parentesco/index.vue";
import ParentescoDetalle from "../views/private/parentesco/[id]/index.vue";

/* =======================
   OCUPACIÓN (CATÁLOGO)
======================= */
import OcupacionView from "../views/private/ocupacion/index.vue";
import OcupacionFormView from "../views/private/ocupacion/[id]/index.vue";

/* =======================
   FAMILIA (CATÁLOGO)
======================= */
import FamiliaView from "../views/private/familia/index.vue";
import FamiliaFormView from "../views/private/familia/[id]/index.vue"; // <-- FIX (antes apuntaba al mismo index)

/* =======================
   SALUD (CATÁLOGO / MÓDULO)
======================= */
import SaludView from "../views/private/salud/index.vue";
import SaludDetalle from "../views/private/salud/[id]/index.vue";
import EducacionView from "../views/private/educacion/index.vue";

/* =======================
   EVENTO (CATÁLOGO)
======================= */
import EventoView from "../views/private/evento/index.vue";

/* =======================
   TRASLADOS
======================= */
import TrasladosView from "../views/private/traslados/index.vue";

/* =======================
   VISITAS / DETALLE EVENTO
======================= */
import VisitasDetalleEvento from "../views/private/evento/[id]/index.vue";

/* =======================
   FORMULARIOS CLÍNICOS
======================= */
import AdolecenteView from "../views/private/adolentes/index.vue";
import DelitoView from "../views/private/delito/index.vue"; // <-- FIX (.vue)

/* =======================
   FORMULARIOS (VISTAS)
======================= */
import DashboardView from "../views/formularios/DashboardView.vue";
import FamiliarForm from "../views/formularios/FamiliarFormView.vue";
import TerapeuticaForm from "../views/formularios/TerapeuticaFormView.vue";
import OcupacionalForm from "../views/formularios/OcupacionalFormView.vue";
import JuridicaForm from "../views/formularios/JuridicaFormView.vue";
import TrasladoForm from "../views/formularios/TrasladoFormView.vue";

/* =======================
   ROUTES
======================= */
const routes = [
  /* ===== PÚBLICAS ===== */
  { path: "/", name: "home", component: HomeView },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },

  /* ===== PRIVADAS ===== */
  {
    path: "/app",
    component: PrivateLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "app-home", component: HomeApp },

      { path: "adolescentes", name: "adolescentes", component: AdolecenteView },
      { path: "delito", name: "delito", component: DelitoView },
      { path: "perfiles", name: "perfiles", component: Perfiles },

      /* ===== CATÁLOGOS ===== */
      { path: "nacionalidad", name: "nacionalidad", component: NacionalidadView },
      { path: "nacionalidad/:id", name: "nacionalidadDetalle", component: NacionalidadDetalle },

      { path: "parentesco", name: "parentesco", component: ParentescoView }, // <-- FIX name
      { path: "parentesco/:id", name: "parentescoDetalle", component: ParentescoDetalle }, // <-- FIX component

      { path: "familia", name: "familia", component: FamiliaView },
      { path: "familia/:id", name: "familiaDetalle", component: FamiliaFormView },

      { path: "gdos", name: "gdos", component: GdoView },
      { path: "gdos/:id", name: "gdosDetalle", component: GdoDetalle },

      { path: "provincias", name: "provincias", component: ProvinciasView },
      { path: "provincias/:id", name: "provinciaDetalle", component: ProvinciaDetalle },

      { path: "cantones", name: "cantones", component: CantonesView },
      { path: "cantones/:id", name: "cantonDetalle", component: CantonDetalle },

      { path: "cai", name: "cai", component: CaisView },
      { path: "cai/:id", name: "caiDetalle", component: CaiDetalle },

      { path: "estado-civil", name: "estadoCivil", component: EstadoCivilView },

      /* ===== ETNIA ===== */
      { path: "etnia", name: "etnia-list", component: EtniaList },
      { path: "etnia/:id", name: "etnia-form", component: EtniaForm },

      /* ===== OCUPACIÓN ===== */
      { path: "ocupacion", name: "ocupacion", component: OcupacionView },
      { path: "ocupacion/:id", name: "ocupacion-form", component: OcupacionFormView },

      /* ===== SALUD ===== */
      { path: "salud", name: "salud", component: SaludView },
      { path: "salud/:id", name: "saludDetalle", component: SaludDetalle },
      { path: "educacion", name: "educacion", component: EducacionView },

      /* ===== EVENTO ===== */
      { path: "evento", name: "eventos", component: EventoView },

      /* ===== TRASLADOS ===== */
      { path: "traslados", name: "traslados", component: TrasladosView },

      /* ===== VISITAS / DETALLE EVENTO ===== */
      { path: "visitas/:id", name: "visitas-detalle-evento", component: VisitasDetalleEvento },

      /* ===== FORMULARIOS ===== */
      { path: "dashboard", name: "dashboard", component: DashboardView },
      { path: "familiar", name: "familiarForm", component: FamiliarForm },
      { path: "terapeutica", name: "terapeuticaForm", component: TerapeuticaForm },
      { path: "ocupacional", name: "ocupacionalForm", component: OcupacionalForm },
      { path: "juridica", name: "juridicaForm", component: JuridicaForm },
      { path: "traslado", name: "trasladoForm", component: TrasladoForm },
    ],
  },
];

/* =======================
   ROUTER
======================= */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* =======================
   AUTH GUARD
======================= */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("snai_token");

  if (to.meta.requiresAuth && !token) return next("/login");

  next();
});

export default router;
