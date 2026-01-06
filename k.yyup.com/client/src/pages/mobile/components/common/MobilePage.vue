<template>
  <MobileLayout
    :title="title"
    :show-nav-bar="showNavBar"
    :show-back="showBack"
    :show-tab-bar="showTabBar"
    :tabs="tabs"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <!-- 页面内容 -->
    <div class="mobile-page">
      <!-- 加载状态 -->
      <van-loading v-if="loading" class="page-loading">
        {{ loadingText }}
      </van-loading>

      <!-- 错误状态 -->
      <van-empty v-else-if="error" :image="errorImage" :description="errorMessage">
        <van-button type="primary" @click="handleRetry">重试</van-button>
      </van-empty>

      <!-- 页面内容 -->
      <div v-else class="page-content">
        <slot></slot>
      </div>
    </div>

    <!-- 页面顶部插槽 -->
    <template #nav-bar>
      <slot name="nav-bar"></slot>
    </template>

    <!-- 右侧插槽 -->
    <template #right>
      <slot name="right"></slot>
    </template>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MobileLayout from '../../layouts/MobileLayout.vue'

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
  loading?: boolean
  loadingText?: string
  error?: boolean
  errorMessage?: string
  errorImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showNavBar: true,
  showBack: true,
  showTabBar: false,
  tabs: () => [],
  loading: false,
  loadingText: '加载中...',
  error: false,
  errorMessage: '加载失败',
  errorImage: 'error'
})

const emit = defineEmits<{
  retry: []
  back: []
  'tab-change': [name: string]
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  router.back()
}

const handleRetry = () => {
  emit('retry')
}

const handleTabChange = (name: string) => {
  emit('tab-change', name)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-page {
  min-height: calc(100vh - 50px);

  .page-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .page-content {
    padding: var(--spacing-md);
  }
}

:deep(.van-empty) {
  padding: 40px 0;
}
</style>
