import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./", // Use relative paths for assets - needed for Electron file:// loading
  server: {
    host: "0.0.0.0", // Allow external access
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173, // Use PORT env variable or default to 5173
    strictPort: false, // Allow fallback to other ports if configured port is occupied
    cors: true, // Enable CORS
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
