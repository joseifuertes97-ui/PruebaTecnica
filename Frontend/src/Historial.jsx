import React, { useEffect, useState } from 'react';
import { api, dinero, fecha } from './api.js';
import Modal from './Modal.jsx';

export default function Historial() {
  const [tipo, setTipo] = useState('compras');
  const [filas, setFilas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState('');

  const compra = tipo === 'compras';

  useEffect(() => {
    let activo = true;
    setFilas([]);
    setDetalle(null);
    setError('');

    api('/' + tipo)
      .then(datos => {
        if (activo) setFilas(datos);
      })
      .catch(e => {
        if (activo) setError(e.message);
      });

    return () => {
      activo = false;
    };
  }, [tipo]);

  const nombresProductos = (fila) => {
    const nombres = fila.detalles
      .map(d => d.nombreProducto)
      .filter(Boolean);

    return nombres.length ? nombres.join(', ') : '-';
  };

  const cantidadTotal = (fila) =>
    fila.detalles.reduce((total, d) => total + Number(d.cantidad || 0), 0);

  return <>
    <h1 className="h4">Historial</h1>

    <label className="form-label" htmlFor="tipo">Tipo de documento</label>
    <select
      id="tipo"
      className="form-select mb-3 w-auto"
      value={tipo}
      onChange={e => setTipo(e.target.value)}
    >
      <option value="compras">Compras</option>
      <option value="ventas">Ventas</option>
    </select>

    {error && <div role="alert" className="alert alert-danger">{error}</div>}

    <div className="table-responsive bg-white border rounded">
      <table className="table mb-0">
        <thead>
          {compra
            ? <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Producto(s)</th>
                <th>Cantidad total</th>
                <th>Monto compra</th>
                <th></th>
              </tr>
            : <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Producto(s)</th>
                <th>Cantidad total</th>
                <th>Subtotal</th>
                <th>IGV</th>
                <th>Total</th>
                <th></th>
              </tr>}
        </thead>
        <tbody>
          {filas.map(f => compra
            ? <tr key={f.id}>
                <td>{f.id}</td>
                <td>{fecha(f.fecha)}</td>
                <td>{nombresProductos(f)}</td>
                <td>{cantidadTotal(f)}</td>
                <td>S/ {dinero(f.total)}</td>
                <td><button className="btn btn-sm btn-outline-primary" onClick={() => setDetalle(f)}>Ver detalle</button></td>
              </tr>
            : <tr key={f.id}>
                <td>{f.id}</td>
                <td>{fecha(f.fecha)}</td>
                <td>{nombresProductos(f)}</td>
                <td>{cantidadTotal(f)}</td>
                <td>S/ {dinero(f.subTotal)}</td>
                <td>S/ {dinero(f.igv)}</td>
                <td>S/ {dinero(f.total)}</td>
                <td><button className="btn btn-sm btn-outline-primary" onClick={() => setDetalle(f)}>Ver detalle</button></td>
              </tr>
          )}

          {!filas.length && <tr><td colSpan={compra ? 6 : 8}>Sin registros para mostrar.</td></tr>}
        </tbody>
      </table>
    </div>

    {detalle && <Modal titulo={'Detalle N.º ' + detalle.id} cerrar={() => setDetalle(null)}>
      <div className="mb-3">
        <strong>Producto(s): </strong>{nombresProductos(detalle)}
        <span className="ms-3"><strong>Cantidad total: </strong>{cantidadTotal(detalle)}</span>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            {compra
              ? <tr><th>ID producto</th><th>Producto</th><th>Cantidad</th><th>Costo</th><th>Total compra</th></tr>
              : <tr><th>ID producto</th><th>Producto</th><th>Cantidad</th><th>Precio venta</th><th>Total</th></tr>}
          </thead>
          <tbody>
            {detalle.detalles.map(d => <tr key={d.id}>
              <td>{d.productoId}</td>
              <td>{d.nombreProducto}</td>
              <td>{d.cantidad}</td>
              <td>S/ {dinero(d.precio)}</td>
              <td>S/ {dinero(d.total)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Modal>}
  </>;
}
