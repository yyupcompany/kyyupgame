<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container customer-sop-detail-simple">
    <h1>SOP详情页测试</h1>
    <p>客户ID: {{ customerId }}</p>
    <p>如果你能看到这个页面，说明路由配置正确！</p>
    
    <el-button @click="goBack">返回列表</el-button>
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const customerId = computed(() => route.params.id);

function goBack() {
  router.push('/teacher-center/customer-tracking');
}
</script>

<style scoped>
.customer-sop-detail-simple {
  padding: var(--spacing-10xl);
  text-align: center;
}

h1 {
  color: var(--primary-color);
  margin-bottom: var(--text-2xl);
}

p {
  font-size: var(--text-xl);
  margin: var(--spacing-2xl) 0;
}
</style>

