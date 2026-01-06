import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/index.scss'

// 导入视图组件
import BlocksView from './views/BlocksView.vue'
import GsapCardsView from './views/GsapCardsView.vue'
import ParticleWaveView from './views/ParticleWaveView.vue'
import MatrixBlocksView from './views/MatrixBlocksView.vue'
import HelixSpiralView from './views/HelixSpiralView.vue'
import CubeExplosionView from './views/CubeExplosionView.vue'
import LiquidFlowView from './views/LiquidFlowView.vue'
import NeonGridView from './views/NeonGridView.vue'
import LoginWithAnimation from './views/LoginWithAnimation.vue'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/blocks' },
    { path: '/blocks', component: BlocksView, name: 'blocks' },
    { path: '/gsap-cards', component: GsapCardsView, name: 'gsap-cards' },
    { path: '/particle-wave', component: ParticleWaveView, name: 'particle-wave' },
    { path: '/matrix-blocks', component: MatrixBlocksView, name: 'matrix-blocks' },
    { path: '/helix-spiral', component: HelixSpiralView, name: 'helix-spiral' },
    { path: '/cube-explosion', component: CubeExplosionView, name: 'cube-explosion' },
    { path: '/liquid-flow', component: LiquidFlowView, name: 'liquid-flow' },
    { path: '/neon-grid', component: NeonGridView, name: 'neon-grid' },
    { path: '/login-with-animation', component: LoginWithAnimation, name: 'login-with-animation' }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')