import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  plugins: [swc.vite()],
})
