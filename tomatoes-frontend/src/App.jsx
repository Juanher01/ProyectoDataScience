// src/App.jsx
import React, { useEffect, useState } from "react";
import CameraCapture from "./CameraCapture";

const API_BASE = "http://localhost:5000";

const INSTANCE_COLORS = [
  "#818cf8",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#f472b6",
  "#38bdf8",
  "#22c55e",
];

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString(); // usa la configuración regional del sistema
};


// ---------- Componentes de UI básicos ----------

const FullScreenLoader = () => (
  <div className="fullscreen-loader">
    <div className="loader-card">
      <div className="spinner" />
      <h2>Analizando imagen…</h2>
      <p className="loader-subtext">
        Estamos segmentando y clasificando los tomates. Esto puede tardar unos segundos.
      </p>
    </div>
  </div>
);

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

// ---------- App principal ----------

function App() {
  const [screen, setScreen] = useState("upload"); // 'upload' | 'result' | 'history'

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [history, setHistory] = useState([]);
  const [historyItem, setHistoryItem] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [showCamera, setShowCamera] = useState(false);

  // Cargar historial al inicio
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error al obtener historial:", err);
    }
  };

  // -------- Manejo de archivo / cámara --------

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setErrorMsg("");

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScreen("upload");
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleCameraCapture = (file) => {
    handleFileChange(file);
  };

  const clearSelection = () => {
  setSelectedFile(null);
  setPreviewUrl("");
  setErrorMsg("");
};


  // -------- Análisis con backend --------

const handleAnalyze = async () => {
  if (!selectedFile) {
    setErrorMsg("Primero selecciona o toma una imagen.");
    return;
  }

  setIsAnalyzing(true);
  setErrorMsg("");
  setResult(null);

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error en el servidor (${res.status})`);
    }

    const data = await res.json();
    setResult(data);

    // 👉 limpiamos la selección para que "Nueva imagen" quede vacía
    setSelectedFile(null);
    setPreviewUrl("");

    setScreen("result");
    fetchHistory();
  } catch (err) {
    console.error(err);
    setErrorMsg(err.message || "Error al analizar la imagen.");
    setScreen("upload");
  } finally {
    setIsAnalyzing(false);
  }
};

  // -------- Historial --------

  const openHistoryItem = (item) => {
    setHistoryItem(item);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryItem(null);
  };

  const goToUpload = () => {
    setScreen("upload");
    setErrorMsg("");
  };

  const goToHistory = () => {
    setScreen("history");
    fetchHistory();
  };

  // -------- Vistas --------

const renderUploadScreen = () => (
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
          Elige cómo quieres capturar la imagen. Es recomendable que los tomates
          estén bien iluminados y ocupen buena parte del encuadre.
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
            onClick={() => setShowCamera(true)}
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
                onClick={clearSelection}
              >
                Quitar imagen
              </button>
            </div>
          </div>
        )}

        <div className="actions-row upload-actions">
          <button
            className="pill-button primary"
            onClick={handleAnalyze}
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


 const renderResultScreen = () => (
  <section className="view">
    <div className="view-header">
      <h2>Resultado del análisis</h2>
      <p>
        Aquí puedes ver la imagen segmentada junto a la clasificación de cada tomate.
      </p>
    </div>

    {result ? (
      <div className="card large-card">
        <div className="result-layout">
          {/* Imagen anotada */}
          <div className="result-image">
            <h3>Imagen anotada</h3>
            {result.annotated_image ? (
              <img
                src={result.annotated_image}
                alt="annotated"
                className="annotated-image"
              />
            ) : (
              <p>No se recibió imagen anotada.</p>
            )}
          </div>

          {/* Resumen y lista */}
          <div className="result-info">
            <p className="result-summary">
              <span className="badge">
                Tomates detectados: {result.tomato_count ?? 0}
              </span>
            </p>

            <h3>Detalle por tomate</h3>
            {result.tomatoes && result.tomatoes.length > 0 ? (
              <ul className="tomato-list">
                {result.tomatoes.map((t, idx) => {
                  const color =
                    INSTANCE_COLORS[idx % INSTANCE_COLORS.length];
                  const classSlug = t.class.toLowerCase();

                  return (
                    <li key={idx} className="tomato-item">
                      <div className="tomato-item-header">
                        <span className="tomato-index">
                          <span
                            className="tomato-color-dot"
                            style={{ backgroundColor: color }}
                          />
                          Tomate #{idx + 1}
                        </span>
                        <span
                          className={`tomato-class tomato-class-${classSlug}`}
                        >
                          {t.class}
                        </span>
                      </div>
                      <p className="tomato-prob">
                        Clasificación: {(t.prob * 100).toFixed(1)}%
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No se encontraron tomates.</p>
            )}
          </div>
        </div>

        <div className="actions-row separate-top">
          <button className="pill-button secondary" onClick={goToUpload}>
            Analizar otra imagen
          </button>
          <button className="pill-button ghost" onClick={goToHistory}>
            Ver historial
          </button>
        </div>
      </div>
    ) : (
      <p>No hay resultado disponible todavía.</p>
    )}
  </section>
);

  const renderHistoryScreen = () => (
    <section className="view">
      <div className="view-header">
        <h2>Historial de imágenes</h2>
        <p>
          Aquí puedes revisar las imágenes analizadas previamente y sus
          resultados.
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
                onClick={() => openHistoryItem(item)}
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
                    {formatDateTime(item.uploaded_at)} · Tomates: {item.tomato_count ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="actions-row separate-top">
          <button className="pill-button secondary" onClick={goToUpload}>
            Volver a analizar
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo-circle">
            <span className="brand-logo">🍅</span>
          </div>
          <div>
            <h1>TomatoVision IA</h1>
            <span className="brand-subtitle">
              Monitor de calidad de tomates con visión por computador
            </span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${screen === "upload" ? "active" : ""}`}
            onClick={goToUpload}
          >
            Nueva imagen
          </button>
          <button
            className={`nav-tab ${screen === "result" ? "active" : ""}`}
            onClick={() => result && setScreen("result")}
            disabled={!result}
          >
            Resultado
          </button>
          <button
            className={`nav-tab ${screen === "history" ? "active" : ""}`}
            onClick={goToHistory}
          >
            Historial
          </button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="app-main">
        {screen === "upload" && renderUploadScreen()}
        {screen === "result" && renderResultScreen()}
        {screen === "history" && renderHistoryScreen()}
      </main>

      {/* Loader a pantalla completa */}
      {isAnalyzing && <FullScreenLoader />}

      {/* Modal detalle de historial */}
<Modal isOpen={showHistoryModal} onClose={closeHistoryModal}>
  {historyItem && (
    <div className="history-modal-content">
      <h2>Detalle de registro</h2>
      <p className="modal-subtitle">
        {historyItem.display_name || "Registro"} ·{" "}
        {formatDateTime(historyItem.uploaded_at)}
      </p>

      <p>
        <strong>Tomates detectados:</strong>{" "}
        {historyItem.tomato_count ?? 0}
      </p>

      <img
        src={`${API_BASE}/annotated/${historyItem.annotated_filename}`}
        alt="annotated history"
        className="annotated-image"
      />

      {historyItem.tomatoes && historyItem.tomatoes.length > 0 && (
        <>
          <h3>Detalle por tomate</h3>
          <ul className="tomato-list">
            {historyItem.tomatoes.map((t, idx) => {
              const color =
                INSTANCE_COLORS[idx % INSTANCE_COLORS.length];
              const classSlug = t.class.toLowerCase();
              return (
                <li key={idx} className="tomato-item">
                  <div className="tomato-item-header">
                    <span className="tomato-index">
                      <span
                        className="tomato-color-dot"
                        style={{ backgroundColor: color }}
                      />
                      Tomate #{idx + 1}
                    </span>
                    <span
                      className={`tomato-class tomato-class-${classSlug}`}
                    >
                      {t.class}
                    </span>
                  </div>
                  <p className="tomato-prob">
                    Clasificación: {(t.prob * 100).toFixed(1)}%
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  )}
</Modal>


      {/* Modal de cámara */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

export default App;
