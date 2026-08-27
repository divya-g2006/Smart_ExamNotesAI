const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
export const serverUrl = ((viteEnv && viteEnv.VITE_SERVER_URL) || "").replace(/\/$/, "");
