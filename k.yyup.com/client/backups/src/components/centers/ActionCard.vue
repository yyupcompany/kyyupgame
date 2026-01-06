<template>
  <div 
    class="action-card" 
    :class="[`action-card--${color}`, { 'action-card--clickable': clickable }]"
    @click="handleClick"
  >
    <div class="action-card__icon">
      <UnifiedIcon :name="icon" :size="24" />
    </div>
    <div class="action-card__content">
      <h4 class="action-card__title">{{ title }}</h4>
      <p class="action-card__description">{{ description }}</p>
    </div>
    <div class="action-card__arrow" v-if="clickable">
      <UnifiedIcon name="ArrowRight" :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface Props {
  title: string
  description: string
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  clickable?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
.action-card {
  display: flex;
  align-items: center;
  padding: var(--text-lg);
  background: var(--bg-color);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  transition: all 0.2s ease;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-var(--border-width-base));
    }
  }
  
  &--primary {
    .action-card__icon {
      background: var(--primary-bg);
      color: var(--primary-color);
    }
  }

  &--success {
    .action-card__icon {
      background: var(--success-bg);
      color: var(--success-color);
    }
  }

  &--warning {
    .action-card__icon {
      background: var(--warning-bg);
      color: var(--warning-color);
    }
  }

  &--info {
    .action-card__icon {
      background: var(--info-bg);
      color: var(--info-color);
    }
  }

  &--danger {
    .action-card__icon {
      background: var(--danger-bg);
      color: var(--danger-color);
    }
  }
}

.action-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--spacing-sm);
  margin-right: var(--text-sm);
  flex-shrink: 0;
}

.action-card__content {
  flex: 1;
  min-width: 0;
}

.action-card__title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.action-card__description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.action-card__arrow {
  margin-left: var(--spacing-sm);
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  .action-card--clickable:hover & {
    transform: translateX(2px);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .action-card {
    padding: var(--text-sm);
    
    .action-card__icon {
      width: var(--icon-size); height: var(--icon-size);
      margin-right: var(--spacing-2xl);
    }
    
    .action-card__title {
      font-size: var(--text-sm);
    }
    
    .action-card__description {
      font-size: var(--text-xs);
    }
  }
}
</style>
