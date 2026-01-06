import { RouteRecordRaw } from 'vue-router'
import DemoPage from '../demo/DemoPage.vue'

const demoRoutes: RouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'DemoPage',
    component: DemoPage,
    meta: {
      title: '样式演示页面'
    }
  }
]

export default demoRoutes