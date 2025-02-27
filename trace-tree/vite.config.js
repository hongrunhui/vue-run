import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        injectOptions: {
          injectCss: true, // 将 CSS 嵌入到 HTML 中
          injectJs: true,  // 将 JS 嵌入到 HTML 中
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@stores': path.resolve(__dirname, 'src/stores'), // 添加别名
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 启用 Less 的 JavaScript 支持
      },
    },
  },
  server: {
    port: 7890, // 设置端口为 7890
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // 将所有模块打包到一个文件中
      },
    },
  },
})
