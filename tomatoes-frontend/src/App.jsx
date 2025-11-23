// src/App.jsx
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import FullScreenLoader from "./components/FullScreenLoader";
import Modal from "./components/Modal";
import UploadView from "./components/views/UploadView";
import ResultView from "./components/views/ResultView";
import HistoryView from "./components/views/HistoryView";
import CameraCapture from "./CameraCapture";

import {
  API_BASE,
  INSTANCE_COLORS,
  formatDateTime,
} from "./config/constants";

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

  // ------- selección de imagen --------

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setErrorMsg("");

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScreen("upload");
  };

  const handleCameraCapture = (file) => {
    handleFileChange(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setErrorMsg("");
  };

  // ------- análisis --------

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
        throw new Error(
          errData.error || `Error en el servidor (${res.status})`
        );
      }

      const data = await res.json();
      setResult(data);

      // limpiamos selección para que "Nueva imagen" quede vacía
      clearSelection();

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

  // ------- historial --------

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

  const handleChangeScreen = (next) => {
    if (next === "history") goToHistory();
    else if (next === "upload") goToUpload();
    else if (next === "result" && result) setScreen("result");
  };

  // ------- render --------

  return (
    <div className="app-shell">
      <Header
        currentScreen={screen}
        hasResult={!!result}
        onChangeScreen={handleChangeScreen}
      />

      <main className="app-main">
        {screen === "upload" && (
          <UploadView
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            errorMsg={errorMsg}
            isAnalyzing={isAnalyzing}
            onFileChange={handleFileChange}
            onCameraClick={() => setShowCamera(true)}
            onClearSelection={clearSelection}
            onAnalyze={handleAnalyze}
          />
        )}

        {screen === "result" && (
          <ResultView
            result={result}
            onAnalyzeAnother={goToUpload}
            onGoHistory={goToHistory}
          />
        )}

        {screen === "history" && (
          <HistoryView
            history={history}
            onOpenItem={openHistoryItem}
            onGoUpload={goToUpload}
          />
        )}
      </main>

      {/* Loader a pantalla completa */}
      {isAnalyzing && <FullScreenLoader />}

      {/* Modal de historial */}
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
