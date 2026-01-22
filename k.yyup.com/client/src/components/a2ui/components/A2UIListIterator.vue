<template>
  <div class="a2ui-list-iterator">
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      class="list-item"
    >
      <A2UIRenderer
        :node="renderItem(item, index)"
        :session-id="sessionId"
        @event="handleItemEvent($event, item, index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  items: any[];
  itemTemplate: A2UIComponentNode;
  sessionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  sessionId: ''
});

function getItemKey(item: any, index: number): string | number {
  if (item && typeof item === 'object') {
    return item.id ?? item.key ?? index;
  }
  return index;
}

function renderItem(item: any, index: number): A2UIComponentNode {
  const template = props.itemTemplate;
  // Deep clone and inject item data into bindings
  return injectItemData(template, item, index);
}

function injectItemData(node: A2UIComponentNode, item: any, index: number): A2UIComponentNode {
  const result = { ...node };

  // Inject item data into props
  if (node.props) {
    result.props = { ...node.props };

    // Replace {{item.xxx}} and {{index}} placeholders
    Object.keys(result.props).forEach(key => {
      const value = result.props![key];
      if (typeof value === 'string') {
        result.props![key] = replacePlaceholders(value, item, index);
      }
    });
  }

  // Recursively process children
  if (node.children && node.children.length > 0) {
    result.children = node.children.map(child =>
      injectItemData(child, item, index)
    );
  }

  return result;
}

function replacePlaceholders(template: string, item: any, index: number): string {
  return template
    .replace(/\{\{item\.(\w+)\}\}/g, (_, prop) => {
      return item?.[prop] ?? '';
    })
    .replace(/\{\{index\}\}/g, String(index))
    .replace(/\{\{item\}\}/g, String(item));
}

function emitEvent(event: A2UIEvent) {
  // Pass through events
}

function handleItemEvent(event: A2UIEvent, item: any, index: number) {
  // Add item context to event payload
  const enhancedEvent: A2UIEvent = {
    ...event,
    payload: {
      ...event.payload,
      itemIndex: index,
      itemData: item
    }
  };
  emitEvent(enhancedEvent);
}
</script>

<style scoped>
.a2ui-list-iterator {
  width: 100%;
}

.list-item {
  margin-bottom: 8px;
}

.list-item:last-child {
  margin-bottom: 0;
}
</style>
