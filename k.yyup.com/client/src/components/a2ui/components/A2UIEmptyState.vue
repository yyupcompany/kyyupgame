<template>
  <div class="a2ui-empty-state">
    <div class="empty-image" v-if="image">
      <el-image :src="image" fit="contain" />
    </div>
    <el-empty v-else :description="''">
      <template #image>
        <el-icon :size="80" class="empty-icon"><FolderOpened /></el-icon>
      </template>
    </el-empty>
    <h3 class="empty-message">{{ message }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <el-button v-if="actionLabel" type="primary" @click="handleAction">
      {{ actionLabel }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { FolderOpened } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  message: string;
  description?: string;
  image?: string;
  actionLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: '暂无数据',
  description: ''
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'action'): void;
}>();

function handleAction() {
  emit('action');
  emitEvent('empty.action', {});
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'empty-state',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.a2ui-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-image {
  margin-bottom: 16px;
  max-width: 200px;
}

.empty-icon {
  color: var(--el-text-color-secondary);
  opacity: 0.5;
}

.empty-message {
  margin: 16px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.empty-description {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
