import { createApp } from 'vue'
import router from './router'
import './styles/global.scss'

// 创建一个简单的App组件
const App = {
  template: '<router-view />'
}

const app = createApp(App)
app.use(router)
app.mount('#demo-app')

console.log('Demo应用已启动！访问 /demo/dashboard 查看效果') 