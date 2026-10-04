import React, { useEffect, useRef } from 'react';
export default function Modal({ titulo, cerrar, children }) {
  const dialogo = useRef(null);
  useEffect(() => { dialogo.current.showModal(); }, []);
  return <dialog ref={dialogo} className="ventana" onCancel={e => { e.preventDefault(); cerrar(); }}>
    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
      <h2 className="h5 m-0">{titulo}</h2>
      <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrar} />
    </div>{children}
  </dialog>;
}
