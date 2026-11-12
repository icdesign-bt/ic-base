import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  root,
  // Project Pages: https://icdesign-bt.github.io/ic-base/
  base: command === 'build' ? '/ic-base/' : '/',
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
    },
  },
  server: {
    port: 5175,
    // Доступ с телефона в LAN + HTTPS (SpeechRecognition / mic в Safari).
    host: true,
    https: true,
  },
}));
