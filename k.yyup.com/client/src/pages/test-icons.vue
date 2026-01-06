<template>
  <div class="test-icons-page">
    <div class="test-container">
      <h1>UnifiedIcon 图标测试</h1>

      <div class="icon-grid">
        <div class="icon-item" v-for="iconName in testIcons" :key="iconName">
          <div class="icon-wrapper">
            <UnifiedIcon
              :name="iconName"
              :size="32"
              :color="currentColor"
              variant="default"
            />
          </div>
          <span class="icon-name">{{ iconName }}</span>
        </div>
      </div>

      <div class="variant-test">
        <h2>变体测试</h2>
        <div class="variant-grid">
          <div class="variant-item" v-for="variant in variants" :key="variant">
            <h3>{{ variant }} 变体</h3>
            <div class="icon-row">
              <div class="icon-wrapper" v-for="iconName in ['user', 'home', 'settings']" :key="`${variant}-${iconName}`">
                <UnifiedIcon
                  :name="iconName"
                  :size="24"
                  :variant="variant"
                />
                <span>{{ iconName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

const testIcons = [
  'user', 'users', 'home', 'building', 'dashboard', 'settings',
  'phone', 'message', 'search', 'calendar', 'trend-charts', 'analytics',
  'book', 'activity', 'menu', 'chevron-down', 'plus', 'edit',
  'delete', 'check', 'close', 'arrow-up', 'arrow-down', 'refresh'
]

const variants = ['default', 'filled', 'outlined', 'rounded']

const currentColor = '#409EFF'
</script>

<style lang="scss" scoped>
.test-icons-page {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
}

.test-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: var(--text-3xl);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: 40px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409EFF;
  }
}

.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  height: 60px;
}

.icon-name {
  font-size: var(--text-xs);
  color: #666;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 22px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 8px;
}

.variant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.variant-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.variant-item h3 {
  margin: 0 0 15px 0;
  font-size: var(--text-base);
  color: #409EFF;
  text-align: center;
}

.icon-row {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.icon-row .icon-wrapper {
  flex: 1;
  height: 40px;
  margin-bottom: 4px;
}

.icon-row .icon-wrapper span {
  font-size: 10px;
}
</style>