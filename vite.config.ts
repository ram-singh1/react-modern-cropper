import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// In "demo" mode we build the playground app (App.tsx). Otherwise we build the
// distributable library from src/index.ts.
export default defineConfig(({ mode }) => {
  const isLibrary = mode !== 'demo'

  return {
    plugins: [
      react(),
      isLibrary &&
        dts({
          include: ['src'],
          exclude: ['src/main.tsx', 'src/App.tsx'],
          insertTypesEntry: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: isLibrary
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ReactAdvancedCropper',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`,
          },
          rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'jsxRuntime',
              },
            },
          },
          sourcemap: true,
          emptyOutDir: true,
        }
      : {
          outDir: 'dist-demo',
        },
  }
})
