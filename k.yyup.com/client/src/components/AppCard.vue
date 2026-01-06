<template>
  <div class="app-card" :class="cardClasses">
    <!-- 卡片头部 -->
    <div v-if="title || iconName || $slots.header" class="app-card-header">
      <div class="card-header-content">
        <!-- 图标 -->
        <div v-if="iconName" class="card-icon">
          <UnifiedIcon
            :name="iconName"
            :size="iconSize"
            :color="iconColor"
            :variant="iconVariant"
            :stroke-width="1.5"
          />
        </div>
        <!-- 标题 -->
        <div v-if="title" class="card-title">
          <h3>{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <slot name="header"></slot>
    </div>
    
    <!-- 卡片内容 -->
    <div class="app-card-body">
      <slot />
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="app-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface Props {
  title?: string
  subtitle?: string
  iconName?: string
  iconSize?: number
  iconColor?: string
  iconVariant?: 'default' | 'filled' | 'outlined' | 'rounded'
  hoverable?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'none'
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 24,
  iconVariant: 'default',
  hoverable: false,
  shadow: 'sm',
  padding: 'md'
})

const cardClasses = computed(() => [
  'app-card',
  `app-card--shadow-${props.shadow}`,
  `app-card--padding-${props.padding}`,
  {
    'app-card--hoverable': props.hoverable
  }
])
</script>

<style scoped lang="scss">
.app-card {
  background-color: var(--bg-card, var(--bg-white));
  border-radius: var(--radius-lg, var(--spacing-sm));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: all var(--transition-normal, 0.3s);
  border: var(--border-width) solid var(--border-color, var(--border-color));
  
  // 阴影变体
  &--shadow-none {
    box-shadow: none;
  }
  
  &--shadow-sm {
    box-shadow: var(--shadow-sm, 0 2px var(--text-sm) 0 var(--shadow-light));
  }
  
  &--shadow-md {
    box-shadow: var(--shadow-md, 0 var(--spacing-xs) var(--spacing-xl) 0 var(--shadow-medium));
  }
  
  &--shadow-lg {
    box-shadow: var(--shadow-lg, 0 var(--spacing-sm) var(--spacing-3xl) 0 var(--shadow-heavy));
  }
  
  // 内边距变体
  &--padding-sm {
    .app-card-header, .app-card-body, .app-card-footer {
      padding: var(--text-sm);
    }
  }
  
  &--padding-md {
    .app-card-header, .app-card-body, .app-card-footer {
      padding: var(--spacing-xl);
    }
  }
  
  &--padding-lg {
    .app-card-header, .app-card-body, .app-card-footer {
      padding: var(--spacing-3xl);
    }
  }
  
  // 悬停效果
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-var(--spacing-xs));
      box-shadow: var(--shadow-lg, 0 var(--spacing-sm) var(--spacing-3xl) 0 var(--shadow-heavy));
    }
  }
}

// 卡片头部
.app-card-header {
  background: var(--bg-secondary, var(--bg-gray-light));
  border-bottom: var(--z-index-dropdown) solid var(--border-color, var(--border-color));
  
  .card-header-content {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
  }
  
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size); height: var(--icon-size);
    background: var(--bg-card, var(--bg-white));
    border-radius: var(--spacing-sm);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  }
  
  .card-title {
    flex: 1;
    
    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary, var(--text-primary));
      line-height: 1.4;
    }
    
    .card-subtitle {
      margin: var(--spacing-xs) 0 0 0;
      font-size: var(--text-base);
      color: var(--text-secondary, var(--text-regular));
      line-height: 1.4;
    }
  }
}

// 卡片主体
.app-card-body {
  // 内边距在变体中定义
}

// 卡片底部
.app-card-footer {
  background: var(--bg-secondary, var(--bg-gray-light));
  border-top: var(--z-index-dropdown) solid var(--border-color, var(--border-color));
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .app-card {
    &--padding-md {
      .app-card-header, .app-card-body, .app-card-footer {
        padding: var(--text-lg);
      }
    }
    
    &--padding-lg {
      .app-card-header, .app-card-body, .app-card-footer {
        padding: var(--spacing-xl);
      }
    }
  }
  
  .app-card-header {
    .card-icon {
      width: var(--spacing-3xl);
      height: var(--spacing-3xl);
    }
    
    .card-title h3 {
      font-size: var(--text-base);
    }
    
    .card-subtitle {
      font-size: var(--text-sm);
    }
  }
}
</style>