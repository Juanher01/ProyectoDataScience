// src/config/constants.js
export const API_BASE = "http://localhost:5000";

export const INSTANCE_COLORS = [
  "#818cf8",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#f472b6",
  "#38bdf8",
  "#22c55e",
];

export const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString(); // usa la región del sistema
};
