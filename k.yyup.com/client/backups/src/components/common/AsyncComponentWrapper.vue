<template>
  <div class="async-component-wrapper">
    <!-- Suspense包装器 -->
    <Suspense v-if="useSuspense">
      <template #default>
        <component 
          :is="asyncComponent" 
          v-bind="componentProps"
          @loading="handleLoading"
          @error="handleError"
          @loaded="handleLoaded"
        />
      </template>
      
      <template #fallback>
        <div class="suspense-fallback">
          <LoadingState 
            :text="loadingText"
            :tip="loadingTip"
            variant="card"
            size="medium"
            spinner-type="circle"
            :show-progress="showProgress"
            :progress="loadingProgress"
          />
        </div>
      </template>
    </Suspense>

    <!-- 传统异步组件包装 -->
    <component 
      v-else
      :is="asyncComponent" 
      v-bind="componentProps"
      @loading="handleLoading"
      @error="handleError"
      @loaded="handleLoaded"
    />

    <!-- 数据加载状态 -->
    <div v-if="dataLoading && showDataLoading" class="data-loading-overlay">
      <LoadingState 
        text="正在获取数据..."
        tip="请稍候，数据加载中"
        variant="overlay"
        size="medium"
        spinner-type="pulse"
        :cancelable="cancelable"
        @cancel="handleCancelDataLoading"
      />
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError && showError" class="error-overlay">
      <ErrorFallback 
        :error="error"
        :show-details="showErrorDetails"
        @retry="handleRetry"
        @report="handleReportError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { createAsyncComponent, useAsyncData, type AsyncComponentConfig, type DataLoaderConfig } from '@/utils/async-component-loader'
import LoadingState from './LoadingState.vue'
import ErrorFallback from './ErrorFallback.vue'

interface Props {
  // 组件配置
  componentConfig: AsyncComponentConfig
  // 数据配置
  dataConfig?: DataLoaderConfig
  // 组件props
  componentProps?: Record<string, any>
  // 是否使用Suspense
  useSuspense?: boolean
  // 加载文案
  loadingText?: string
  loadingTip?: string
  // 是否显示进度
  showProgress?: boolean
  // 是否显示数据加载状态
  showDataLoading?: boolean
  // 是否显示错误
  showError?: boolean
  // 是否显示错误详情
  showErrorDetails?: boolean
  // 是否可取消数据加载
  cancelable?: boolean
  // 预加载延迟
  preloadDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  componentProps: () => ({}),
  useSuspense: false,
  loadingText: '正在加载组件...',
  loadingTip: '请稍候',
  showProgress: false,
  showDataLoading: true,
  showError: true,
  showErrorDetails: false,
  cancelable: false,
  preloadDelay: 0
})

const emit = defineEmits<{
  loading: [isLoading: boolean]
  error: [error: Error]
  loaded: []
  dataLoaded: [data: any]
  cancelled: []
}>()

// 状态管理
const componentLoading = ref(false)
const loadingProgress = ref(0)
const error = ref<Error | null>(null)
const dataLoadingController = ref<AbortController | null>(null)

// 创建异步组件
const asyncComponent = computed(() => {
  return createAsyncComponent({
    ...props.componentConfig,
    preloadData: props.dataConfig ? undefined : props.componentConfig.preloadData
  })
})

// 数据加载
const {
  data: asyncData,
  loading: dataLoading,
  error: dataError,
  hasError: hasDataError,
  loadData,
  refresh
} = props.dataConfig ? useAsyncData(props.dataConfig) : {
  data: ref(null),
  loading: ref(false),
  error: ref(null),
  hasError: ref(false),
  loadData: () => Promise.resolve(),
  refresh: () => Promise.resolve()
}

// 计算属性
const hasError = computed(() => !!error.value || hasDataError.value)

// 事件处理
const handleLoading = (isLoading: boolean) => {
  componentLoading.value = isLoading
  emit('loading', isLoading)
}

const handleError = (err: Error) => {
  error.value = err
  emit('error', err)
}

const handleLoaded = () => {
  emit('loaded')
}

const handleRetry = async () => {
  error.value = null
  
  if (hasDataError.value) {
    try {
      await refresh()
    } catch (err) {
      console.error('重试失败:', err)
    }
  }
}

const handleReportError = (err: Error) => {
  console.log('报告错误:', err)
  // 这里可以集成错误报告服务
}

const handleCancelDataLoading = () => {
  if (dataLoadingController.value) {
    dataLoadingController.value.abort()
    dataLoadingController.value = null
  }
  emit('cancelled')
}

// 模拟加载进度
const simulateProgress = () => {
  if (!props.showProgress) return
  
  loadingProgress.value = 0
  const interval = setInterval(() => {
    loadingProgress.value += Math.random() * 15
    if (loadingProgress.value >= 90) {
      loadingProgress.value = 90
      clearInterval(interval)
    }
  }, 200)
  
  return interval
}

// 预加载
const preloadData = async () => {
  if (!props.dataConfig) return
  
  if (props.preloadDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, props.preloadDelay))
  }
  
  try {
    dataLoadingController.value = new AbortController()
    await loadData()
    emit('dataLoaded', asyncData.value)
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('数据预加载失败:', err)
    }
  }
}

// 监听数据变化
watch(asyncData, (newData) => {
  if (newData) {
    emit('dataLoaded', newData)
  }
})

watch(dataError, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})

// 生命周期
onMounted(() => {
  const progressInterval = simulateProgress()
  
  // 预加载数据
  preloadData()
  
  // 清理进度模拟
  setTimeout(() => {
    if (progressInterval) {
      clearInterval(progressInterval)
      loadingProgress.value = 100
    }
  }, 2000)
})

onUnmounted(() => {
  if (dataLoadingController.value) {
    dataLoadingController.value.abort()
  }
})

// 暴露方法
defineExpose({
  refresh,
  retry: handleRetry,
  cancel: handleCancelDataLoading,
  getData: () => asyncData.value
})
</script>

<style scoped lang="scss">
.async-component-wrapper {
  position: relative;
  width: 100%;
  min-height: 100px;
}

.suspense-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.data-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-90);
  backdrop-filter: blur(2px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--white-alpha-95);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

// 响应式适配
@media (max-width: var(--breakpoint-md)) {
  .suspense-fallback {
    min-height: 150px;
    padding: 1rem;
  }
  
  .error-overlay {
    padding: 1rem;
  }
}
</style>