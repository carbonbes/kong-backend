import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  plugins: [swc.vite()],

  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
    root: './',
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
