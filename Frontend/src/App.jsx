import React, { useEffect, useState } from 'react';
import { api, guardarToken } from './api.js';
import Documento from './Documento.jsx';
import Kardex from './Kardex.jsx';
import Historial from './Historial.jsx';
export default function App() {
  const [sesion, setSesion] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [vista, setVista] = useState('compras');
  const [factorIgv, setFactorIgv] = useState(0.18);
  useEffect(() => {
    const salir = () => { setSesion(false); setError('La sesión venció. Ingresa nuevamente.'); };
    window.addEventListener('sesion-vencida', salir);
    return () => window.removeEventListener('sesion-vencida', salir);
  }, []);
  async function entrar(e) {
    e.preventDefault(); setOcupado(true); setError('');
    try {
      const datos = await api('/auth/login', 'POST', { usuario, password });
      guardarToken(datos.token);
      const config = await api('/kardex/configuracion');
      setFactorIgv(config.factorIgv); setPassword(''); setVista('compras'); setSesion(true);
    } catch (e) { guardarToken(''); setError(e.message); }
    finally { setOcupado(false); }
  }
  if (!sesion) return <main className="container"><form className="card card-body login" onSubmit={entrar}>
    <h1 className="h4">Prueba Técnica</h1><p className="text-secondary">Ingresa para registrar operaciones.</p>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    <label className="form-label" htmlFor="usuario">Usuario</label><input id="usuario" autoComplete="username" required className="form-control mb-3" value={usuario} onChange={e => setUsuario(e.target.value)} />
    <label className="form-label" htmlFor="password">Contraseña</label><input id="password" type="password" autoComplete="current-password" required className="form-control mb-3" value={password} onChange={e => setPassword(e.target.value)} />
    <button className="btn btn-primary" disabled={ocupado}>{ocupado ? 'Ingresando…' : 'Ingresar'}</button>
  </form></main>;
  return <><header className="bg-white border-bottom"><div className="container py-3 d-flex justify-content-between align-items-center gap-3"><strong>Prueba Técnica</strong>
    <button className="btn btn-sm btn-outline-secondary" onClick={() => { guardarToken(''); setSesion(false); setError(''); }}>Cerrar sesión</button></div></header>
    <main className="container py-4"><nav className="d-flex flex-wrap gap-2 mb-4" aria-label="Secciones">
      {[['compras','Compras'],['ventas','Ventas'],['kardex','Productos / Kardex'],['historial','Historial']].map(([id, texto]) =>
        <button key={id} className={'btn ' + (vista === id ? 'btn-primary' : 'btn-outline-primary')} onClick={() => setVista(id)}>{texto}</button>)}
    </nav>
    {(vista === 'compras' || vista === 'ventas') && <Documento key={vista} tipo={vista} factorIgv={factorIgv} />}
    {vista === 'kardex' && <Kardex />}{vista === 'historial' && <Historial />}
    </main></>;
}
