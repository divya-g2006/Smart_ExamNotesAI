const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const defaultServerUrl = "https://smart-examnotes-backend.onrender.com";

export const serverUrl = (
  (viteEnv?.VITE_SERVER_URL || defaultServerUrl)
    .trim()
    .replace(/\/$/, "")
);
