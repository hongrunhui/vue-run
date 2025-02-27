import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueTrace from './plugins/vue-function-trace'

export default defineConfig({
  plugins: [
    vueTrace(),
    vue()
  ],
  optimizeDeps: {
    include: [
      '@babel/parser',
      '@babel/traverse',
      '@babel/generator'
    ],
    force: true
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.runtime.esm-bundler.js'
    }
  }
}) 