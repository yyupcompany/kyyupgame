<template>
  <el-badge
    :value="displayValue"
    :max="max"
    :type="badgeType"
    :is-dot="isDot"
    :hidden="hidden"
  >
    <slot />
  </el-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number | string;
  max?: number;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  isDot?: boolean;
  hidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  max: 99,
  type: 'danger',
  isDot: false,
  hidden: false
});

const displayValue = computed(() => {
  if (typeof props.value === 'string') {
    return props.value;
  }
  return props.value > props.max ? `${props.max}+` : props.value;
});

const badgeType = computed(() => {
  if (props.type) return props.type;
  const num = typeof props.value === 'number' ? props.value : 0;
  if (num === 0) return 'info';
  if (num < 10) return 'primary';
  return 'danger';
});
</script>

<style scoped>
.a2ui-badge {
  display: inline-block;
}
</style>
