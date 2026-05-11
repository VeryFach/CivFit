import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
    ],
    esbuild: {
      loader: 'tsx',
      include: /node_modules\/.*\.js$|src\/.*\.ts$|src\/.*\.tsx$/,
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react-native': 'react-native-web',
        'expo-sqlite': path.resolve(__dirname, 'src/platform/storage/sqlite/mock.ts'),
        'lucide-react-native': 'lucide-react',
      },
      extensions: [
        '.web.mjs',
        '.web.js',
        '.web.mts',
        '.web.ts',
        '.web.jsx',
        '.web.tsx',
        '.mjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
