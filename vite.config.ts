import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: `import React from 'react';`,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
	  path: 'path-browserify',
    },
  },
});