<template>
  <div class="principal-layout">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
// Principal 嵌套路由的布局组件
</script>

<style scoped lang="scss">
.principal-layout {
  width: 100%;
  min-height: 100vh;
}
</style>
