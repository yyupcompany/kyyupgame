<template>
  <div v-if="visible" class="a2ui-conditional">
    <A2UIRenderer
      v-for="child in children"
      :key="child.id"
      :node="child"
      :session-id="sessionId"
      @event="emitEvent"
    />
  </div>
</template>

<script setup lang="ts">
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  condition: boolean | string | number;
  children?: A2UIComponentNode[];
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  condition: true,
  children: () => [],
  sessionId: ''
});

const visible = props.condition;

function emitEvent(event: A2UIEvent) {
  // Pass through events
}
</script>

<style scoped>
.a2ui-conditional {
  width: 100%;
}
</style>
