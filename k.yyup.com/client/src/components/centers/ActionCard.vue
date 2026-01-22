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
@use '@/styles/design-tokens.scss' as *;

.action-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-lg), var(--glow-primary);
      transform: translateY(-4px);

      .action-card__icon {
        transform: scale(1.1) rotate(-5deg);
      }

      .action-card__arrow {
        transform: translateX(4px);
        opacity: 1;
      }
    }
  }
  
  &--primary {
    .action-card__icon {
      background: var(--primary-light-bg);
      color: var(--primary-color);
    }
  }

  &--success {
    .action-card__icon {
      background: var(--success-light-bg);
      color: var(--success-color);
    }
  }

  &--warning {
    .action-card__icon {
      background: var(--warning-light-bg);
      color: var(--warning-color);
    }
  }

  &--info {
    .action-card__icon {
      background: var(--bg-secondary);
      color: var(--text-secondary);
    }
  }

  &--danger {
    .action-card__icon {
      background: var(--danger-light-bg);
      color: var(--danger-color);
    }
  }
}

.action-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  margin-right: var(--spacing-lg);
  flex-shrink: 0;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.action-card__content {
  flex: 1;
  min-width: 0;
}

.action-card__title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.action-card__description {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-card__arrow {
  margin-left: var(--spacing-md);
  color: var(--text-secondary);
  opacity: 0.5;
  flex-shrink: 0;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .action-card {
    padding: var(--spacing-md);
    
    .action-card__icon {
      width: 40px;
      height: 40px;
      margin-right: var(--spacing-md);
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
