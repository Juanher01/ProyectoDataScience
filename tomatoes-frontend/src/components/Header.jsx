// src/components/Header.jsx
import React from "react";

const Header = ({ currentScreen, hasResult, onChangeScreen }) => {
  return (
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
          className={`nav-tab ${
            currentScreen === "upload" ? "active" : ""
          }`}
          onClick={() => onChangeScreen("upload")}
        >
          Nueva imagen
        </button>
        <button
          className={`nav-tab ${
            currentScreen === "result" ? "active" : ""
          }`}
          onClick={() => hasResult && onChangeScreen("result")}
          disabled={!hasResult}
        >
          Resultado
        </button>
        <button
          className={`nav-tab ${
            currentScreen === "history" ? "active" : ""
          }`}
          onClick={() => onChangeScreen("history")}
        >
          Historial
        </button>
      </nav>
    </header>
  );
};

export default Header;
