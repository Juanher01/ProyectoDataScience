// src/components/views/UploadView.jsx
import React from "react";

const UploadView = ({
  selectedFile,
  previewUrl,
  errorMsg,
  isAnalyzing,
  onFileChange,
  onCameraClick,
  onClearSelection,
  onAnalyze,
}) => {
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <section className="view">
      <div className="view-header">
        <h2>1. Seleccionar imagen</h2>
        <p>
          Sube una foto desde tu dispositivo o tómala directamente con la cámara.
          Luego podrás ver la segmentación y clasificación de cada tomate.
        </p>
      </div>

      <div className="card large-card upload-grid">
        {/* Columna izquierda */}
        <div className="upload-left">
          <h3 className="section-title">Fuente de imagen</h3>
          <p className="section-description">
            Es recomendable que los tomates estén bien iluminados y ocupen buena
            parte del encuadre.
          </p>

          <div className="input-row">
            <label className="pill-button file-input-label primary">
              Elegir desde archivos
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ display: "none" }}
              />
            </label>

            <span className="or-label">o</span>

            <button
              className="pill-button secondary"
              onClick={onCameraClick}
            >
              Usar cámara
            </button>
          </div>

          <ul className="tips-list">
            <li>Evita reflejos fuertes o sombras muy marcadas.</li>
            <li>Procura que los tomates estén nítidos y enfocados.</li>
            <li>Puedes repetir el análisis las veces que necesites.</li>
          </ul>
        </div>

        {/* Columna derecha */}
        <div className="upload-right">
          <h3 className="section-title">Vista previa</h3>

          {!previewUrl && (
            <div className="preview-frame empty">
              <p>No hay ninguna imagen seleccionada.</p>
              <p className="preview-hint">
                Elige un archivo o usa la cámara para ver la vista previa aquí.
              </p>
            </div>
          )}

          {previewUrl && (
            <div className="preview-frame">
              <img src={previewUrl} alt="preview" className="preview-image" />
              <div className="preview-footer">
                <span className="preview-file-name">
                  {selectedFile?.name || "Imagen seleccionada"}
                </span>
                <button
                  className="pill-button ghost small"
                  onClick={onClearSelection}
                >
                  Quitar imagen
                </button>
              </div>
            </div>
          )}

          <div className="actions-row upload-actions">
            <button
              className="pill-button primary"
              onClick={onAnalyze}
              disabled={!selectedFile || isAnalyzing}
            >
              Analizar imagen
            </button>
          </div>

          {errorMsg && <p className="error-text">{errorMsg}</p>}
        </div>
      </div>
    </section>
  );
};

export default UploadView;
