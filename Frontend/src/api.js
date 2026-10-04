// Todas las peticiones HTTP a la API salen desde esta función.
const baseUrl = import.meta.env.DEV ? 'http://localhost:5080/api' : '/api';
let token = ''; // En memoria: al actualizar la página se vuelve a iniciar sesión.
export function guardarToken(valor) { token = valor; }
export async function api(ruta, metodo = 'GET', datos) {
  let respuesta;
  try {
    respuesta = await fetch(baseUrl + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: datos === undefined ? undefined : JSON.stringify(datos)
    });
  } catch { throw new Error('No se pudo conectar con la API. Revisa que esté abierta en localhost:5080.'); }
  const contenido = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401 && ruta !== '/auth/login') {
    guardarToken('');
    window.dispatchEvent(new Event('sesion-vencida'));
    throw new Error('Tu sesión venció. Ingresa nuevamente.');
  }
  if (!respuesta.ok) {
    const errores = contenido.errors ? Object.values(contenido.errors).flat().join(' ') : '';
    throw new Error(contenido.mensaje || errores || `Error ${respuesta.status}`);
  }
  return contenido;
}
export const dinero = valor => Number(valor).toFixed(2);
export const redondear = valor => Math.round((valor + Number.EPSILON) * 100) / 100;
export const fecha = valor => new Date(valor).toLocaleString('es-PE');
