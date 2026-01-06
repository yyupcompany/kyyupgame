<template>
  <div class="enrollment-plan-main">
    <PageWrapper title="招生计划">
      <!-- 使用现有的计划列表组件 -->
      <PlanList />
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import PageWrapper from '@/components/common/PageWrapper.vue'
import PlanList from './enrollment-plan/PlanList.vue'
</script>