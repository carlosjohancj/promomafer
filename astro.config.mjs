// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), preact()],
  adapter: netlify(),
  vite: {                  // Añade o modifica la sección 'vite'
    resolve: {
      alias: {
        // Mapea React a preact/compat
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime'
      },
    },
  },
});