<template>
  <div class="parent-assessment-layout">
    <div class="page-header">
      <h1>测评中心</h1>
      <p>根据孩子年龄与需求选择合适的测评类型</p>
    </div>

    <el-tabs
      v-model="activeTab"
      class="assessment-tabs"
      @tab-change="onTabChange"
    >
      <el-tab-pane label="2-6岁儿童发育商" name="development" />
      <el-tab-pane label="幼小衔接" name="school-readiness" />
      <el-tab-pane label="1-6年级学科测试" name="academic" />
    </el-tabs>

    <div class="tab-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTab = ref<'development' | 'school-readiness' | 'academic'>('development')

const syncTabFromRoute = () => {
  const path = route.path

  if (path.includes('/assessment/school-readiness')) {
    activeTab.value = 'school-readiness'
  } else if (path.includes('/assessment/academic')) {
    activeTab.value = 'academic'
  } else {
    // 默认显示儿童发育商
    activeTab.value = 'development'
  }
}

// 初始同步一次
syncTabFromRoute()

// 监听路由变化，同步当前激活的tab
watch(
  () => route.path,
  () => {
    syncTabFromRoute()
  }
)

const onTabChange = (name: string | number) => {
  const n = String(name)

  if (n === 'school-readiness') {
    router.push('/parent-center/assessment/school-readiness')
  } else if (n === 'academic') {
    router.push('/parent-center/assessment/academic')
  } else {
    router.push('/parent-center/assessment/development')
  }
}
</script>

<style scoped lang="scss">
.parent-assessment-layout {
  padding: var(--spacing-xl) !important;
  width: 100% !important;
  min-height: 100% !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  font-size: var(--text-xl);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.page-header p {
  color: var(--text-secondary);
}

.assessment-tabs {
  margin-bottom: var(--spacing-lg);
  width: 100%;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  // 确保 tab 可见
  :deep(.el-tabs__header) {
    margin: 0 0 var(--spacing-lg) 0;
    display: block !important;
    visibility: visible !important;
  }
  
  :deep(.el-tabs__nav-wrap) {
    display: block !important;
    visibility: visible !important;
    
    &::after {
      display: block;
    }
  }
  
  :deep(.el-tabs__nav) {
    display: flex !important;
    visibility: visible !important;
  }
  
  :deep(.el-tabs__item) {
    font-size: var(--text-base);
    padding: 0 var(--spacing-lg);
    height: 40px;
    line-height: 40px;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  :deep(.el-tabs__content) {
    display: block !important;
    visibility: visible !important;
  }
}

.tab-content {
  min-height: 300px;
  width: 100%;
}
</style>

