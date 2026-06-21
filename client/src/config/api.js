// client/src/config/api.js

// Saat development (npm run dev), Vite baca dari client/.env -> http://localhost:5000
// Saat build production (npm run build), Vite baca dari client/.env.production -> URL Vercel
export const API_URL = import.meta.env.VITE_API_URL;
