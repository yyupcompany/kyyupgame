<template>
  <div class="a2ui-group-container" :class="containerClass" :style="containerStyle">
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
import { computed } from 'vue';
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  children?: A2UIComponentNode[];
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'column',
  gap: 16,
  align: 'stretch',
  justify: 'start',
  children: () => [],
  sessionId: ''
});

const containerClass = computed(() => ({
  [`direction-${props.direction}`]: true,
  [`align-${props.align}`]: true,
  [`justify-${props.justify}`]: true
}));

const containerStyle = computed(() => ({
  gap: `${props.gap}px`
}));

function emitEvent(event: A2UIEvent) {
  // Pass through events
}
</script>

<style scoped lang="scss">
.a2ui-group-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  &.direction-row {
    flex-direction: row;
  }

  &.direction-column {
    flex-direction: column;
  }

  &.align-start {
    align-items: flex-start;
  }

  &.align-center {
    align-items: center;
  }

  &.align-end {
    align-items: flex-end;
  }

  &.align-stretch {
    align-items: stretch;
  }

  &.justify-start {
    justify-content: flex-start;
  }

  &.justify-center {
    justify-content: center;
  }

  &.justify-end {
    justify-content: flex-end;
  }

  &.justify-space-between {
    justify-content: space-between;
  }

  &.justify-space-around {
    justify-content: space-around;
  }
}
</style>
