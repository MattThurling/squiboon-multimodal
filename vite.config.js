import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import mix from 'vite-plugin-mix'
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mix({
      handler: './api.js',
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
