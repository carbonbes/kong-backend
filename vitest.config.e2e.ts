import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

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
