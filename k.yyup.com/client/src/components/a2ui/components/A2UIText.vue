<template>
  <p
    class="a2ui-text"
    :style="textStyle"
    :class="{ 'text-center': align === 'center', 'text-right': align === 'right' }"
  >
    {{ content }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  content: string;
  size?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: string;
  lineHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: '16px',
  color: '#333',
  align: 'left',
  weight: 'normal',
  lineHeight: '1.5'
});

const textStyle = computed(() => ({
  fontSize: props.size,
  color: props.color,
  fontWeight: props.weight,
  lineHeight: props.lineHeight
}));
</script>

<style scoped lang="scss">
.a2ui-text {
  margin: 8px 0;
  word-break: break-word;

  &.text-center {
    text-align: center;
  }

  &.text-right {
    text-align: right;
  }
}
</style>
