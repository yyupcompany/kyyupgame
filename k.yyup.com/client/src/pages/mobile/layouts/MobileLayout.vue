<template>
  <div class="mobile-layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      v-if="showNavBar"
      :title="title"
      :left-arrow="showBack"
      @click-left="handleBack"
      :border="false"
      :safe-area-inset-top="true"
    >
      <template #right v-if="$slots.right">
        <slot name="right"></slot>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="mobile-layout-content" :class="{ 'with-bottom-bar': showTabBar }">
      <slot></slot>
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar
      v-if="showTabBar"
      v-model="activeTab"
      @change="handleTabChange"
      :safe-area-inset-bottom="true"
      :border="true"
    >
      <van-tabbar-item
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
      >
        {{ tab.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface Tab {
  name: string
  title: string
  icon: string
  path?: string
}

interface Props {
  title?: string
  showNavBar?: boolean
  showBack?: boolean
  showTabBar?: boolean
  tabs?: Tab[]
  activeTabName?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showNavBar: true,
  showBack: true,
  showTabBar: false,
  tabs: () => []
})

const emit = defineEmits<{
  'tab-change': [name: string]
  'back': []
}>()

const router = useRouter()
const route = useRoute()
const activeTab = ref(props.activeTabName || '')

// 监听路由变化，自动更新当前活跃标签
watch(
  () => route.name,
  (newName) => {
    if (newName) {
      activeTab.value = newName as string
    }
  },
  { immediate: true }
)

const handleBack = () => {
  emit('back')
  router.back()
}

const handleTabChange = (name: string) => {
  emit('tab-change', name)
  const tab = props.tabs.find(t => t.name === name)
  if (tab?.path) {
    router.push(tab.path)
  }
}
</script>

<style lang="scss" scoped>
.mobile-layout {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  display: flex;
  flex-direction: column;

  &-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 0;

    &.with-bottom-bar {
      padding-bottom: 50px; /* 为底部导航栏留出空间 */
    }
  }
}

:deep(.van-nav-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .van-nav-bar__title,
  .van-icon {
    color: #fff;
  }
}

:deep(.van-tabbar) {
  background-color: var(--bg-card);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>
