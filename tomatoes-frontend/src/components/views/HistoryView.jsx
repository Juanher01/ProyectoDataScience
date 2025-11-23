// src/components/views/HistoryView.jsx
import React from "react";
import { API_BASE, formatDateTime, INSTANCE_COLORS } from "../../config/constants";

const HistoryView = ({ history, onOpenItem, onGoUpload }) => {
  return (
    <section className="view">
      <div className="view-header">
        <h2>Historial de imágenes</h2>
        <p>
          Aquí puedes revisar las imágenes analizadas previamente y sus resultados.
        </p>
      </div>

      <div className="card large-card">
        {history.length === 0 ? (
          <p>Aún no hay imágenes en el historial.</p>
        ) : (
          <div className="history-grid">
            {history.map((item) => (
              <div
                key={item._id}
                className="history-card"
                onClick={() => onOpenItem(item)}
              >
                <img
                  src={`${API_BASE}/annotated/${item.annotated_filename}`}
                  alt={item.filename_original}
                  className="history-thumb"
                />
                <div className="history-info">
                  <p className="history-title">
                    {item.display_name || "Registro"}
                  </p>
                  <p className="history-meta">
                    {formatDateTime(item.uploaded_at)} · Tomates:{" "}
                    {item.tomato_count ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="actions-row separate-top">
          <button className="pill-button secondary" onClick={onGoUpload}>
            Volver a analizar
          </button>
        </div>
      </div>
    </section>
  );
};

export default HistoryView;
