import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every asset reference relative, so the same build works on
// GitHub Pages (served from /<repo>/) and on a custom domain later.
export default defineConfig({
  plugins: [react()],
  base: './',
});
