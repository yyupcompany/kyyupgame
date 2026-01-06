# 移动端状态管理组件

提供统一的加载状态、错误处理和空状态展示组件。

## 组件概览

### 1. MobileLoading - 加载状态组件

提供多种样式的加载动画，支持进度显示。

```vue
<template>
  <!-- 基础加载 -->
  <MobileLoading text="加载中..." />

  <!-- 带进度的加载 -->
  <MobileLoading
    type="spinner"
    show-progress
    :progress="loadingProgress"
    text="上传中..."
  />

  <!-- 全屏加载 -->
  <MobileLoading
    type="dots"
    text="处理中..."
    fullscreen
    show-overlay
  />

  <!-- 骨架屏加载 -->
  <MobileLoading
    type="skeleton"
    text="加载中..."
  />

  <!-- 自定义图标 -->
  <MobileLoading
    type="custom"
    text="自定义加载..."
  >
    <template #icon>
      <van-icon name="star" spin />
    </template>
  </MobileLoading>
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'spinner' \| 'circle' \| 'dots' \| 'pulse' \| 'skeleton' \| 'custom'` | `'spinner'` | 加载动画类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 组件尺寸 |
| color | `string` | `var(--primary-color)` | 主题颜色 |
| text | `string` | `''` | 加载文本 |
| show-overlay | `boolean` | `false` | 是否显示遮罩 |
| overlay-color | `string` | `'rgba(0, 0, 0, 0.3)'` | 遮罩颜色 |
| fullscreen | `boolean` | `false` | 是否全屏显示 |
| show-progress | `boolean` | `false` | 是否显示进度条 |
| progress | `number` | `undefined` | 进度值 (0-100) |

### 2. MobileError - 错误处理组件

提供丰富的错误状态展示，支持重试和详情查看。

```vue
<template>
  <!-- 网络错误 -->
  <MobileError
    type="network"
    title="网络连接失败"
    description="请检查网络连接后重试"
    @retry="handleRetry"
  />

  <!-- 服务器错误 -->
  <MobileError
    type="server"
    title="服务器错误"
    description="服务器暂时无法响应"
    :retrying="isRetrying"
    @retry="handleRetry"
  />

  <!-- 带详情的错误 -->
  <MobileError
    type="custom"
    title="操作失败"
    description="上传图片时出现错误"
    :details="errorDetails"
    show-details
    show-cancel
    @retry="handleRetry"
    @cancel="handleCancel"
  />

  <!-- 自定义图标 -->
  <MobileError
    type="custom"
    title="自定义错误"
    description="这是一个自定义错误状态"
    :use-builtin-icon="false"
  >
    <template #icon>
      <van-icon name="warning" size="48px" color="orange" />
    </template>
    <template #actions>
      <van-button type="primary" @click="handleCustomAction">自定义操作</van-button>
    </template>
  </MobileError>
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'network' \| 'permission' \| 'not-found' \| 'server' \| 'validation' \| 'custom'` | `'custom'` | 错误类型 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 组件尺寸 |
| title | `string` | `''` | 错误标题 |
| description | `string` | `''` | 错误描述 |
| details | `string` | `''` | 错误详情 |
| show-details | `boolean` | `false` | 是否显示详情按钮 |
| show-retry | `boolean` | `true` | 是否显示重试按钮 |
| retry-text | `string` | `'重试'` | 重试按钮文本 |
| show-cancel | `boolean` | `false` | 是否显示取消按钮 |
| cancel-text | `string` | `'取消'` | 取消按钮文本 |
| show-overlay | `boolean` | `false` | 是否显示遮罩 |
| fullscreen | `boolean` | `false` | 是否全屏显示 |
| retrying | `boolean` | `false` | 是否正在重试 |

### 3. MobileStateHandler - 状态处理组件

组合加载、错误、空状态的统一管理组件。

```vue
<template>
  <MobileStateHandler
    :loading="loading"
    :error="error"
    :empty="empty"
    :loading-text="loadingText"
    :error-type="errorType"
    :empty-text="emptyText"
    :retrying="isRetrying"
    @retry="handleRetry"
  >
    <!-- 加载时自定义图标 -->
    <template #loadingIcon>
      <van-icon name="star" spin />
    </template>

    <!-- 错误时自定义内容 -->
    <template #errorContent>
      <div class="custom-error-content">
        <p>发生错误，请稍后重试</p>
      </div>
    </template>

    <!-- 空状态时自定义操作 -->
    <template #emptyActions>
      <van-button type="primary" @click="handleCreate">创建第一个项目</van-button>
    </template>

    <!-- 正常内容 -->
    <div class="page-content">
      <!-- 你的页面内容 -->
    </div>
  </MobileStateHandler>
</template>

<script setup>
import { ref } from 'vue'
import { MobileStateHandler } from '@/components/mobile/ui'

const loading = ref(false)
const error = ref(false)
const empty = ref(false)
const loadingText = ref('加载中...')
const errorType = ref('network')
const emptyText = ref('暂无数据')
const isRetrying = ref(false)

const handleRetry = () => {
  isRetrying.value = true
  // 重试逻辑
}
</script>
```

## Composable 使用

### useMobileState - 状态管理 Hook

```vue
<script setup>
import { useMobileState, useAsyncOperation } from '@/composables/useMobileState'

// 基础状态管理
const state = useMobileState({
  loadingText: '正在加载数据...',
  fullscreen: true
})

// 加载数据
const loadData = async () => {
  state.setLoading({
    text: '加载用户信息...',
    showProgress: true
  })

  try {
    // 模拟进度更新
    for (let i = 0; i <= 100; i += 10) {
      state.updateProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 加载成功
    state.setSuccess()
  } catch (error) {
    // 处理网络错误
    state.handleNetworkError({
      code: 'NETWORK_ERROR',
      message: '网络连接失败',
      details: error
    })
  }
}

// 异步操作助手
const { result, error } = await useAsyncOperation(
  async () => {
    const response = await api.fetchData()
    return response.data
  },
  {
    loadingText: '正在获取数据...',
    emptyChecker: (data) => !data || data.length === 0,
    emptyText: '暂无相关数据',
    onError: (err) => {
      console.error('操作失败:', err)
    },
    onSuccess: (data) => {
      console.log('操作成功:', data)
    }
  }
)
</script>
```

### useMobileListState - 列表数据管理

```vue
<script setup>
import { useMobileListState } from '@/composables/useMobileState'
import { fetchUserList } from '@/api/users'

const listState = useMobileListState(
  fetchUserList,
  { page: 1, pageSize: 20 }
)

// 初始加载
onMounted(() => {
  listState.loadFirst()
})

// 下拉刷新
const handleRefresh = () => {
  listState.refresh()
}

// 加载更多
const handleLoadMore = () => {
  listState.loadMore()
}
</script>

<template>
  <div class="user-list">
    <van-pull-refresh
      v-model="listState.refreshing"
      @refresh="handleRefresh"
    >
      <van-list
        :loading="listState.state.loading"
        :finished="!listState.canLoadMore"
        @load="handleLoadMore"
      >
        <!-- 列表内容 -->
        <div v-for="user in listState.data" :key="user.id">
          {{ user.name }}
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 状态处理 -->
    <MobileStateHandler v-bind="listState.state.stateHandlerProps">
      <!-- 空状态操作 -->
      <template #emptyActions>
        <van-button type="primary" @click="handleAddUser">
          添加第一个用户
        </van-button>
      </template>
    </MobileStateHandler>
  </div>
</template>
```

## 最佳实践

### 1. 错误处理

```javascript
// 统一错误处理
const handleApiError = (error) => {
  state.handleNetworkError({
    code: error.response?.status,
    message: error.message || '请求失败',
    details: error.response?.data,
    retryable: !error.response || error.response.status >= 500
  })
}
```

### 2. 进度显示

```javascript
// 文件上传进度
const uploadFile = async (file) => {
  state.setLoading({
    text: '上传中...',
    showProgress: true
  })

  try {
    await uploadWithProgress(file, (progress) => {
      state.updateProgress(progress)
    })
    state.setSuccess()
  } catch (error) {
    state.setError({
      title: '上传失败',
      description: '文件上传过程中出现错误'
    })
  }
}
```

### 3. 表单提交

```javascript
// 表单提交状态管理
const submitForm = async (formData) => {
  state.setLoading({ text: '提交中...' })

  try {
    const result = await api.submitForm(formData)
    state.setSuccess()
    return result
  } catch (error) {
    state.handleNetworkError(error)
    throw error
  }
}
```

## 注意事项

1. **状态互斥**: 加载、错误、空、成功状态是互斥的，同时只能有一个为 true
2. **错误类型**: 使用适当的错误类型来获得更好的用户体验
3. **重试机制**: 合理设置重试按钮，对于客户端错误通常不提供重试
4. **全屏状态**: 全屏状态适用于页面级操作，避免在组件内部使用
5. **进度更新**: 使用 updateProgress 时会自动限制在 0-100 范围内

## 样式定制

组件使用 CSS 变量进行主题定制，可以通过修改设计令牌来自定义样式：

```scss
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
}
```

组件完全响应式设计，支持各种移动设备屏幕尺寸和横竖屏切换。