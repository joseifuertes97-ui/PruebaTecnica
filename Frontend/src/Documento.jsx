import React, { useEffect, useState } from 'react';
import { api, dinero, redondear } from './api.js';
import ProductoModal from './ProductoModal.jsx';

export default function Documento({ tipo, factorIgv }) {
  const compra = tipo === 'compras';
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState('');
  const [filas, setFilas] = useState([]);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [listo, setListo] = useState(false);

  const elegido = productos.find(p => p.id === Number(productoId));

  async function cargar() {
    const datos = await api('/kardex');
    setProductos(datos);
    setListo(true);
    return datos;
  }

  useEffect(() => {
    cargar().catch(e => setError(e.message));
  }, []);

  function seleccionar(id) {
    setProductoId(id);
    const p = productos.find(x => x.id === Number(id));
    setPrecio(p ? (compra ? p.costo : p.precioVenta) : '');
  }

  function agregar(e) {
    e.preventDefault();
    setError('');
    setAviso('');

    if (!elegido) return setError('Selecciona un producto.');
    if (filas.some(f => f.productoId === elegido.id)) {
      return setError('El producto ya está en el detalle. Quita su fila y vuelve a agregarlo con la cantidad total.');
    }
    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
      return setError('La cantidad debe ser un número entero mayor que cero.');
    }
    if (!compra && Number(cantidad) > elegido.stockActual) {
      return setError('La cantidad no debe ser mayor al stock.');
    }
    if (filas.length >= 100) return setError('Máximo 100 productos por documento.');
    if (compra && Number(precio) > 1000000) return setError('El costo máximo es 1000000.');

    const valor = compra ? Number(precio) : elegido.precioVenta;
    const subtotal = redondear(Number(cantidad) * valor);

    // El IGV se calcula solamente en ventas.
    const igv = compra ? 0 : redondear(subtotal * factorIgv);
    const total = compra ? subtotal : redondear(subtotal + igv);

    setFilas([...filas, {
      productoId: elegido.id,
      nombre: elegido.nombre,
      cantidad: Number(cantidad),
      precio: valor,
      precioVenta: compra ? redondear(valor * 1.35) : valor,
      subtotal,
      igv,
      total
    }]);

    setCantidad(1);
  }

  async function guardar() {
    setError('');
    setAviso('');
    setOcupado(true);

    try {
      const detalles = filas.map(f => compra
        ? { productoId: f.productoId, cantidad: f.cantidad, precio: f.precio }
        : { productoId: f.productoId, cantidad: f.cantidad });

      const registro = await api('/' + tipo, 'POST', { detalles });
      setFilas([]);
      setProductoId('');
      setPrecio('');
      setAviso(`${compra ? 'Compra' : 'Venta'} N.º ${registro.id} registrada. Total confirmado: S/ ${dinero(registro.total)}.`);

      try {
        await cargar();
      } catch {
        setError('El registro se guardó, pero no se pudo actualizar la lista. Usa Actualizar stock.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const total = campo => filas.reduce((s, f) => s + f[campo], 0);
  const subtotalActual = redondear(Number(cantidad) * Number(precio));
  const igvActual = compra ? 0 : redondear(subtotalActual * factorIgv);
  const totalActual = compra ? subtotalActual : redondear(subtotalActual + igvActual);
  const precioVentaActual = compra ? redondear(Number(precio) * 1.35) : Number(precio);

  return <>
    <h1 className="h4 mb-3">Registrar {compra ? 'compra' : 'venta'}</h1>

    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    {aviso && <div role="status" className="alert alert-success">{aviso}</div>}

    <form className="card card-body mb-3" onSubmit={agregar}>
      <fieldset disabled={ocupado || !listo}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label htmlFor="producto" className="form-label">Producto</label>
            <select id="producto" required className="form-select" value={productoId} onChange={e => seleccionar(e.target.value)}>
              <option value="">Seleccionar…</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — lote {p.nroLote}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label htmlFor="cantidad" className="form-label">Cantidad</label>
            <input id="cantidad" type="number" required min="1" max="1000000" step="1" className="form-control" value={cantidad} onChange={e => setCantidad(e.target.value)} />
          </div>

          <div className="col-6 col-md-3">
            <label htmlFor="precio" className="form-label">{compra ? 'Costo unitario' : 'Precio de venta'}</label>
            <input id="precio" type="number" required min="0.01" max="1350000" step="0.01" readOnly={!compra} className="form-control" value={precio} onChange={e => setPrecio(e.target.value)} />
          </div>

          <div className="col-md-2">
            <button className="btn btn-secondary w-100">Agregar</button>
          </div>
        </div>

        {elegido && (
          compra
            ? <>
                <p className="mt-3 mb-0">Stock actual: <strong>{elegido.stockActual}</strong></p>
                <p className="small mt-2 mb-0">
                  Total de compra de esta fila: S/ {dinero(totalActual)} · Precio de venta que se actualizará: S/ {dinero(precioVentaActual)}
                </p>
              </>
            : <>
                <p className="mt-3 mb-0">Stock disponible: <strong>{elegido.stockActual}</strong></p>
                <p className="small mt-2 mb-0">
                  Importe de esta fila: subtotal S/ {dinero(subtotalActual)} · IGV S/ {dinero(igvActual)} · total S/ {dinero(totalActual)}
                </p>
              </>
        )}
      </fieldset>

      <div className="mt-3 d-flex gap-2 flex-wrap">
        {compra && <button type="button" className="btn btn-outline-primary" disabled={ocupado} onClick={() => setModal(true)}>Nuevo producto</button>}
        <button type="button" className="btn btn-outline-secondary" disabled={ocupado} onClick={() => cargar().catch(e => setError(e.message))}>Actualizar stock</button>
      </div>
    </form>

    <div className="table-responsive bg-white border rounded">
      <table className="table mb-0">
        <thead>
          {compra
            ? <tr><th>Producto</th><th>Cantidad</th><th>Costo</th><th>Precio venta</th><th>Total compra</th><th></th></tr>
            : <tr><th>Producto</th><th>Cantidad</th><th>Precio venta</th><th>Subtotal</th><th>IGV</th><th>Total</th><th></th></tr>}
        </thead>
        <tbody>
          {filas.map((f, i) => compra
            ? <tr key={f.productoId}>
                <td>{f.nombre}</td>
                <td>{f.cantidad}</td>
                <td>{dinero(f.precio)}</td>
                <td>{dinero(f.precioVenta)}</td>
                <td>{dinero(f.total)}</td>
                <td><button className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => setFilas(filas.filter((_, n) => n !== i))}>Quitar</button></td>
              </tr>
            : <tr key={f.productoId}>
                <td>{f.nombre}</td>
                <td>{f.cantidad}</td>
                <td>{dinero(f.precio)}</td>
                <td>{dinero(f.subtotal)}</td>
                <td>{dinero(f.igv)}</td>
                <td>{dinero(f.total)}</td>
                <td><button className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => setFilas(filas.filter((_, n) => n !== i))}>Quitar</button></td>
              </tr>
          )}
          {!filas.length && <tr><td colSpan={compra ? 6 : 7} className="text-secondary py-4">Agrega productos al detalle.</td></tr>}
        </tbody>
      </table>
    </div>

    {compra
      ? <p className="text-end mt-3"><strong>Total compra: S/ {dinero(total('total'))}</strong></p>
      : <p className="text-end mt-3">Subtotal: S/ {dinero(total('subtotal'))} · IGV: S/ {dinero(total('igv'))} · <strong>Total: S/ {dinero(total('total'))}</strong></p>}

    <button className="btn btn-primary" disabled={!filas.length || ocupado} onClick={guardar}>
      {ocupado ? 'Guardando…' : `Guardar ${compra ? 'compra' : 'venta'}`}
    </button>

    {!compra && <p className="text-secondary small mt-2">Al guardar, la API vuelve a comprobar stock y precios. El total confirmado puede cambiar si otro usuario actualizó el precio.</p>}

    {modal && <ProductoModal cerrar={() => setModal(false)} guardado={async p => {
      setModal(false);
      try {
        await cargar();
        setProductoId(String(p.id));
        setPrecio(p.costo);
      } catch (e) {
        setError(e.message);
      }
    }} />}
  </>;
}
