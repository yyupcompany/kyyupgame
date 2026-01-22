<template>
  <div v-if="fullscreen" class="a2ui-loading-fullscreen" v-show="visible">
    <div class="loading-content">
      <el-icon class="is-loading" :size="size === 'small' ? 24 : size === 'large' ? 64 : 40">
        <Loading />
      </el-icon>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
  <div v-else class="a2ui-loading-inline" v-show="visible">
    <el-icon class="is-loading" :size="size === 'small' ? 16 : size === 'large' ? 48 : 24">
      <Loading />
    </el-icon>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  visible: true,
  size: 'medium',
  fullscreen: false
});
</script>

<style scoped lang="scss">
.a2ui-loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.a2ui-loading-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.loading-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
