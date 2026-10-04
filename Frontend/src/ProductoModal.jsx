import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { api, dinero } from './api.js';
export default function ProductoModal({ producto, cerrar, guardado }) {
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [lote, setLote] = useState(producto?.nroLote || '');
  const [costo, setCosto] = useState(producto?.costo || '');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  async function guardar(e) {
    e.preventDefault(); setError(''); setOcupado(true);
    try {
      const p = await api(producto ? `/productos/${producto.id}` : '/productos', producto ? 'PUT' : 'POST',
        { nombre: nombre.trim(), nroLote: lote.trim(), costo: Number(costo) });
      guardado(p);
    } catch (e) { setError(e.message); }
    finally { setOcupado(false); }
  }
  return <Modal titulo={producto ? 'Editar producto' : 'Registrar producto'} cerrar={() => !ocupado && cerrar()}>
    <form onSubmit={guardar}>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      <label className="form-label" htmlFor="nombre">Nombre</label>
      <input id="nombre" className="form-control mb-3" maxLength="100" required value={nombre} onChange={e => setNombre(e.target.value)} />
      <label className="form-label" htmlFor="lote">Lote</label>
      <input id="lote" className="form-control mb-3" maxLength="50" required value={lote} onChange={e => setLote(e.target.value)} />
      <label className="form-label" htmlFor="costo">Costo unitario</label>
      <input id="costo" className="form-control mb-3" type="number" min="0.01" max="1000000" step="0.01" required value={costo} onChange={e => setCosto(e.target.value)} />
      <p>Precio de venta (costo × 1.35): <strong>S/ {dinero(Number(costo) * 1.35)}</strong></p>
      <p className="text-secondary small">Registrar el producto no agrega stock. Para ello registra una compra.</p>
      <button className="btn btn-primary" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar producto'}</button>
    </form>
  </Modal>;
}
