<template>
  <el-tag
    :type="type"
    :size="size"
    :round="round"
    :closable="closable"
    :disable-transitions="true"
    @close="handleClose"
  >
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  round?: boolean;
  closable?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  round: true,
  closable: false
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleClose() {
  emit('close');
}
</script>

<style scoped>
.a2ui-tag {
  display: inline-flex;
  align-items: center;
}
</style>
