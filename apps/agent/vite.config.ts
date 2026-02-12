import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

// https://vite.dev/config/
export default defineConfig({
  base:  '/',//'//localhost:9001',
  plugins: [react(), qiankun('agent', {
    useDevMode: true
  })],
  server: {
    host: true,
    hmr: false,
    port: 9001,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  // configureWebpack: { // 需要获取我打包的内容  systemjs=》 umd格式
  //   output: {
  //     libraryTarget: 'umd',
  //     library: 'm-vue'// window['m-vue']
  //   }
  // }
})
