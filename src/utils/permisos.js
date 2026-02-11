const loadPermisos = () => {
  try {
    const raw = localStorage.getItem("snai_permisos");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizar = (endpoint) => {
  if (!endpoint) return "";
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

const tieneFlag = (flag) => (endpoint, permisos = loadPermisos()) => {
  const ep = normalizar(endpoint);
  if (!ep) return false;

  return permisos.some((p) => {
    const pEp = normalizar(p?.endpoint);
    if (p[flag] !== true) return false;
    if (pEp === ep) return true;
    return pEp.startsWith(`${ep}/`);
  });
};

export const puedeVer = tieneFlag("VIEW");
export const puedeEditar = tieneFlag("EDIT");
export const getPermisos = loadPermisos;
export const normalizarEndpoint = normalizar;
