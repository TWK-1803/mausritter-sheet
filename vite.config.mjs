import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // Some imports omit the extension, e.g. '@/components/D6'
    extensions: ['.mjs', '.js', '.json', '.vue']
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: true,
    __INTLIFY_PROD_DEVTOOLS__: false
  },
  // The colony server allows this origin (CORS).
  server: {
    port: 8801,
    strictPort: true
  }
})
