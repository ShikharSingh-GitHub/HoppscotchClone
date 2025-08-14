import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./", // Use relative paths for assets - needed for Electron file:// loading
  server: {
    host: "0.0.0.0", // Allow external access
    port: 5173, // Default port
    strictPort: true, // Don't try other ports if 5173 is occupied
    cors: true, // Enable CORS
  },
});
