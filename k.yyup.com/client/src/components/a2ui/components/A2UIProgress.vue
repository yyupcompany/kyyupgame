<template>
  <div class="a2ui-progress" :style="wrapperStyle">
    <el-progress
      :percentage="percentage"
      :max="max"
      :stroke-width="height"
      :show-text="showLabel"
      :color="progressColor"
      :status="status"
    />
    <span v-if="showLabel && !hideLabel" class="progress-label">{{ percentage }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  percentage: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
  status?: 'success' | 'exception' | 'warning';
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: true,
  color: '#409EFF',
  height: 8
});

const hideLabel = computed(() => props.percentage >= 100);

const progressColor = computed(() => {
  if (props.status) return props.color;
  if (props.percentage >= 100) return '#67C23A';
  if (props.percentage >= 70) return props.color;
  if (props.percentage >= 40) return '#E6A23C';
  return '#F56C6C';
});

const wrapperStyle = computed(() => ({
  width: '100%'
}));
</script>

<style scoped lang="scss">
.a2ui-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-label {
  min-width: 48px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
