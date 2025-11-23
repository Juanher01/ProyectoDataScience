// src/components/FullScreenLoader.jsx
import React from "react";

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

export default FullScreenLoader;
