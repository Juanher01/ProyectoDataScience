// src/components/Modal.jsx
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {children}
        <div className="modal-actions">
          <button className="pill-button secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
