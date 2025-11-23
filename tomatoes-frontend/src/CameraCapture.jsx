// src/CameraCapture.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Componente para usar la cámara del dispositivo.
 * - Abre la cámara con getUserMedia
 * - Muestra el vídeo en vivo
 * - Permite capturar una foto
 * - Devuelve la foto como File al padre mediante onCapture(file)
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setError(
          "No se pudo acceder a la cámara. Revisa los permisos o prueba en un navegador compatible."
        );
      }
    };

    initCamera();

    // Limpiar al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        if (onClose) onClose();
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Tomar foto</h2>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: "8px" }}
          />
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Cerrar</button>
          <button onClick={handleCapture} disabled={!!error}>
            Capturar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
