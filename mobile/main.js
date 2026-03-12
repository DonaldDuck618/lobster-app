import App from './App'
import { createSSRApp } from 'vue'
import Pinia from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用 Pinia 状态管理
  app.use(Pinia)
  
  return {
    app
  }
}
