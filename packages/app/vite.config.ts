import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/shoebox-webapp/",
  plugins: [react()],
  css: {
    postcss: {
      plugins: [],
    },
  },
});
