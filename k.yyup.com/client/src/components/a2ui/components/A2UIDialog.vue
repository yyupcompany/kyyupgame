<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :show-close="showClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
    @open="handleOpen"
  >
    <div class="dialog-content">
      <A2UIRenderer
        v-for="child in children"
        :key="child.id"
        :node="child"
        :session-id="sessionId"
        @event="emitEvent"
      />
      <slot />
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  title: string;
  visible: boolean;
  width?: string;
  showClose?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  destroyOnClose?: boolean;
  children?: A2UIComponentNode[];
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '50%',
  showClose: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  destroyOnClose: true,
  children: () => [],
  sessionId: ''
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'event', event: A2UIEvent): void;
  (e: 'close'): void;
  (e: 'open'): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

function handleClose() {
  emit('close');
  emitEvent('dialog.close', {});
}

function handleOpen() {
  emit('open');
  emitEvent('dialog.open', {});
}

function handleConfirm() {
  emit('confirm');
  emitEvent('dialog.confirm', {});
  visible.value = false;
}

function handleCancel() {
  emit('cancel');
  emitEvent('dialog.cancel', {});
  visible.value = false;
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'dialog',
    eventType,
    payload,
    sessionId: props.sessionId
  };
  emit('event', event);
}
</script>

<style scoped lang="scss">
.dialog-content {
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
