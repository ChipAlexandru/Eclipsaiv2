import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite dev harness for the v2 refactor. Temporary — Next.js takes
// over in the deployment milestone.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
