<template>
  <div class="mobile-tabbar">
    <div 
      v-for="tab in tabs" 
      :key="tab.key"
      class="mobile-tab-item"
      :class="{ 'mobile-tab-active': currentTab === tab.key }"
      @click="handleTabClick(tab.key)"
    >
      <div class="mobile-tab-icon">
        <component :is="tab.icon" v-if="typeof tab.icon === 'object'" />
        <svg v-else-if="tab.iconPath" viewBox="0 0 24 24">
          <path :d="tab.iconPath" />
        </svg>
      </div>
      <span class="mobile-tab-label">{{ tab.label }}</span>
      <div v-if="tab.badge" class="mobile-tab-badge">{{ tab.badge }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key: string
  label: string
  icon?: any
  iconPath?: string
  badge?: string | number
}

interface Props {
  currentTab?: string
  tabs?: TabItem[]
}

const props = withDefaults(defineProps<Props>(), {
  currentTab: '',
  tabs: () => [
    {
      key: 'home',
      label: '首页',
      iconPath: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
    },
    {
      key: 'activities',
      label: '活动',
      iconPath: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'
    },
    {
      key: 'profile',
      label: '我的',
      iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
    }
  ]
})

const emit = defineEmits<{
  tabChange: [tab: string]
}>()

const handleTabClick = (tab: string) => {
  emit('tabChange', tab)
}
</script>

<style lang="scss" scoped>
.mobile-tabbar {
  display: flex;
  background-color: var(--mobile-tabbar-bg, var(--bg-white));
  border-top: var(--border-width-base) solid var(--mobile-border-color, #e0e0e0);
  padding-bottom: env(safe-area-inset-bottom);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.mobile-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-xs);
  min-height: var(--button-height-xl);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:active {
    background-color: var(--shadow-lighter);
  }
  
  &.mobile-tab-active {
    color: var(--mobile-primary-color, #1976d2);
    
    .mobile-tab-icon {
      transform: scale(1.1);
    }
  }
}

.mobile-tab-icon {
  width: var(--text-3xl);
  height: var(--text-3xl);
  margin-bottom: var(--spacing-xs);
  transition: transform 0.2s ease;
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

.mobile-tab-label {
  font-size: var(--text-sm);
  line-height: 1;
  text-align: center;
  color: inherit;
}

.mobile-tab-badge {
  position: absolute;
  top: var(--spacing-xs);
  right: 50%;
  transform: translateX(50%);
  background-color: #ff4444;
  color: var(--bg-color);
  font-size: var(--text-2xs);
  padding: var(--spacing-sm) 6px;
  border-radius: var(--radius-xl);
  min-width: var(--text-lg);
  height: var(--text-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

// 暗色主题
@media (prefers-color-scheme: dark) {
  .mobile-tabbar {
    --mobile-tabbar-bg: #1a1a1a;
    --mobile-border-color: var(--text-primary);
  }
}
</style>
