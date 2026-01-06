<template>
  <div class="app-root">
    <IconSystemProvide>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </IconSystemProvide>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, provide } from 'vue'
import IconSystemProvide from './components/icons/IconSystemProvide.vue'

export default defineComponent({
  name: 'App',
  components: {
    IconSystemProvide
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss">

/* 基础重置样式 */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

/* 主题背景色设置 */
html, body {
  background-color: var(--el-bg-color-page);
}

#app {
  background-color: var(--el-bg-color-page);
}

.app-root {
  height: 100%;
  width: 100%;
  background-color: var(--el-bg-color-page);
}

/* 登录页：禁用全局背景，交给自定义容器渲染 */
body.route-login,
body.route-login #app,
body.route-login .app-root {
  background: transparent !important;
}

/* 使用全局极细滚动条样式 */
</style>
