<template>
  <div class="app-root">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
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
