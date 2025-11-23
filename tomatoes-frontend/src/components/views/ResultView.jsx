// src/components/views/ResultView.jsx
import React from "react";
import { INSTANCE_COLORS } from "../../config/constants";

const ResultView = ({ result, onAnalyzeAnother, onGoHistory }) => {
  return (
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

            {/* Resumen + lista */}
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
            <button
              className="pill-button secondary"
              onClick={onAnalyzeAnother}
            >
              Analizar otra imagen
            </button>
            <button className="pill-button ghost" onClick={onGoHistory}>
              Ver historial
            </button>
          </div>
        </div>
      ) : (
        <p>No hay resultado disponible todavía.</p>
      )}
    </section>
  );
};

export default ResultView;
