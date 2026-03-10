import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.e2e' })

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
