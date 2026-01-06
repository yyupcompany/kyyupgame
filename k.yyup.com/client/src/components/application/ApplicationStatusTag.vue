<template>
  <el-tag :type="tagType" size="small">{{ statusText }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ApplicationStatus } from '@/types/application';

interface Props {
  status: ApplicationStatus;
}

const props = defineProps<Props>();

// 根据状态计算标签类型
const tagType = computed(() => {
  const typeMap: Record<ApplicationStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    [ApplicationStatus.PENDING]: 'warning',
    [ApplicationStatus.APPROVED]: 'success',
    [ApplicationStatus.REJECTED]: 'danger',
    [ApplicationStatus.CANCELLED]: 'info'
  };
  
  return typeMap[props.status] || 'info';
});

// 根据状态计算显示文本
const statusText = computed(() => {
  const textMap: Record<ApplicationStatus, string> = {
    [ApplicationStatus.PENDING]: '待审核',
    [ApplicationStatus.APPROVED]: '已通过',
    [ApplicationStatus.REJECTED]: '已拒绝',
    [ApplicationStatus.CANCELLED]: '已取消'
  };
  
  return textMap[props.status] || '未知状态';
});
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
</style> 