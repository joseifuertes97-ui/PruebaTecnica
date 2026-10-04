import React, { useEffect, useState } from 'react';
import { api, dinero, fecha } from './api.js';
import Modal from './Modal.jsx';
import ProductoModal from './ProductoModal.jsx';
export default function Kardex() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState(null);
  const [editar, setEditar] = useState(undefined);
  const [error, setError] = useState('');
  async function cargar() { setProductos(await api('/kardex')); }
  useEffect(() => { cargar().catch(e => setError(e.message)); }, []);
  async function ver(p) {
    try { setMovimientos({ nombre: p.nombre, filas: await api(`/kardex/${p.id}/movimientos`) }); }
    catch (e) { setError(e.message); }
  }
  return <><div className="d-flex justify-content-between mb-3 gap-2"><h1 className="h4">Productos / Kardex</h1>
    <button className="btn btn-primary" onClick={() => setEditar(null)}>Nuevo producto</button></div>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    <div className="table-responsive bg-white border rounded"><table className="table align-middle mb-0"><thead><tr><th>ID</th><th>Producto</th><th>Lote</th><th>Stock actual</th><th>Costo</th><th>Precio venta</th><th>Opciones</th></tr></thead>
    <tbody>{productos.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.nombre}</td><td>{p.nroLote}</td><td>{p.stockActual}</td><td>{dinero(p.costo)}</td><td>{dinero(p.precioVenta)}</td>
      <td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => ver(p)}>Movimientos</button><button className="btn btn-sm btn-outline-secondary" onClick={() => setEditar(p)}>Editar</button></td></tr>)}
      {!productos.length && <tr><td colSpan="7">No hay productos para mostrar.</td></tr>}</tbody></table></div>
    {movimientos && <Modal titulo={'Movimientos: ' + movimientos.nombre} cerrar={() => setMovimientos(null)}>
      <div className="table-responsive"><table className="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Documento</th></tr></thead>
      <tbody>{movimientos.filas.map((m, i) => <tr key={i}><td>{fecha(m.fecha)}</td><td>{m.tipoMovimiento}</td><td>{m.cantidad}</td><td>{m.documentoId}</td></tr>)}
      {!movimientos.filas.length && <tr><td colSpan="4">Sin movimientos.</td></tr>}</tbody></table></div></Modal>}
    {editar !== undefined && <ProductoModal producto={editar} cerrar={() => setEditar(undefined)} guardado={() => { setEditar(undefined); cargar().catch(e => setError(e.message)); }} />}
  </>;
}
