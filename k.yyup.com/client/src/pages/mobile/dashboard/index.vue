<template>
  <div class="mobile-dashboard-page">
    <!-- 角色仪表板内容 -->
    <component :is="dashboardComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 根据用户角色动态加载对应的仪表板组件
const dashboardComponent = computed(() => {
  const role = userStore.user?.role || 'parent'

  // 使用defineAsyncComponent动态导入对应角色的仪表板
  switch (role) {
    case 'principal':
    case 'admin':
      return defineAsyncComponent(() =>
        import('../components/dashboard/PrincipalDashboard.vue')
      )
    case 'teacher':
      return defineAsyncComponent(() =>
        import('../components/dashboard/TeacherDashboard.vue')
      )
    case 'parent':
    default:
      return defineAsyncComponent(() =>
        import('../components/dashboard/ParentDashboard.vue')
      )
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-dashboard-page {
  min-height: 100vh;
  background: var(--bg-color-page);
}
</style>
