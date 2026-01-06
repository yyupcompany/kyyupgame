<template>
  <div class="application-main">
    <PageWrapper title="入学申请">
      <!-- 使用现有的申请列表组件 -->
      <ApplicationList />
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import PageWrapper from '@/components/common/PageWrapper.vue'
import ApplicationList from './application/ApplicationList.vue'
</script>