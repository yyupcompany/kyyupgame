<template>
  <div id="app">
    <nav class="demo-nav">
      <div class="nav-container">
        <h1>🎨 Vue3 3D登录入场动画Demo</h1>
        <div class="nav-links">
          <router-link
            v-for="route in routes"
            :key="route.path"
            :to="route.path"
            class="nav-link"
            :class="{ active: $route.path === route.path }"
          >
            {{ route.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <main class="demo-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const routes = ref([
  { path: '/blocks', name: '3D方块' },
  { path: '/gsap-cards', name: 'GSAP卡片' },
  { path: '/particle-wave', name: '粒子波浪' },
  { path: '/matrix-blocks', name: '方块矩阵' },
  { path: '/helix-spiral', name: '螺旋3D' },
  { path: '/cube-explosion', name: '立方体爆炸' },
  { path: '/liquid-flow', name: '液体流动' },
  { path: '/neon-grid', name: '霓虹网格' },
  { path: '/login-with-animation', name: '登录动画示例' }
])
</script>

<style scoped lang="scss">
.demo-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      color: white;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .nav-links {
      display: flex;
      gap: 1rem;

      .nav-link {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;

        &:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}

.demo-main {
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}
</style>