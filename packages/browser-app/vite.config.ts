import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

// CoreReader is a Module Federation REMOTE.
// Shell dev:  core_reader@http://localhost:3015/assets/remoteEntry.js
// Shell prod: shell reads VITE_REMOTE_CORE_READER env var

export default defineConfig({
  plugins: [
    react(),
    // cssInjectedByJs MUST come before federation. Intercepts CSS extraction and
    // converts it to JS style-injection so exposed modules carry their own styles.
    // Filter scopes injection to Dashboard chunk only — not the full Carbon singleton.
    // __federation_expose_ is @originjs/vite-plugin-federation's internal convention
    // (verified at v1.4.x). If CSS stops loading after a plugin upgrade, check dist/
    // chunk names and update this string.
    cssInjectedByJs({
      jsAssetsFilterFunction: ({ fileName }) =>
        fileName.includes('__federation_expose_Dashboard'),
    }),
    federation({
      name: 'core_reader',
      filename: 'remoteEntry.js',
      exposes: {
        './Dashboard': './src/components/Dashboard',
      },
      shared: {
        // Object form required — string array does not support singleton config.
        // @carbon/react MUST be singleton or CSS class resolution breaks in the remote.
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
        '@carbon/react': { singleton: true, requiredVersion: false },
        'react-redux': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,      // required for MF module graph correctness
    cssCodeSplit: false,
  },
})
