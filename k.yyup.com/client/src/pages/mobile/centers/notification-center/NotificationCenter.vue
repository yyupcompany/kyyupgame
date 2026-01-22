<template>
  <MobileCenterLayout title="通知中心" back-path="/mobile/centers">
    <div class="notification-center">
      <!-- 搜索和筛选栏 -->
      <div class="search-filter-bar">
        <van-search
          v-model="searchQuery"
          placeholder="搜索通知内容"
          @search="handleSearch"
          @clear="handleClearSearch"
        />
        <div class="filter-tabs">
          <van-tabs v-model:active="activeFilter" @change="handleFilterChange" sticky>
            <van-tab title="全部" name="all" />
            <van-tab title="未读" name="unread" />
            <van-tab title="重要" name="important" />
            <van-tab title="系统" name="system" />
            <van-tab title="活动" name="activity" />
            <van-tab title="健康" name="health" />
          </van-tabs>
        </div>
      </div>

      <!-- 批量操作栏 -->
      <div v-if="batchMode" class="batch-actions">
        <div class="batch-info">
          <span>已选择 {{ selectedNotifications.length }} 项</span>
        </div>
        <div class="batch-buttons">
          <van-button size="medium" @click="selectAll">全选</van-button>
          <van-button size="medium" @click="deselectAll">取消</van-button>
          <van-button size="medium" type="primary" @click="markSelectedAsRead">标记已读</van-button>
          <van-button size="medium" type="warning" @click="deleteSelected">删除</van-button>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list">
        <!-- 加载状态 -->
        <van-loading v-if="loading && notifications.length === 0" type="spinner" vertical>
          加载中...
        </van-loading>

        <!-- 通知项列表 -->
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            'unread': !notification.isRead,
            'important': notification.priority === 'high',
            'selected': selectedNotifications.includes(notification.id)
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- 选择框（批量模式下显示） -->
          <div v-if="batchMode" class="selection-checkbox">
            <van-checkbox
              :model-value="selectedNotifications.includes(notification.id)"
              @click.stop="toggleSelection(notification.id)"
            />
          </div>

          <!-- 通知内容 -->
          <div class="notification-content">
            <!-- 通知图标和优先级标识 -->
            <div class="notification-header">
              <div class="notification-icon">
                <van-icon :name="getNotificationIcon(notification.type)" />
              </div>
              <div class="notification-meta">
                <span class="notification-type">{{ getNotificationTypeText(notification.type) }}</span>
                <van-tag
                  v-if="notification.priority === 'high'"
                  type="danger"
                  size="medium"
                >
                  重要
                </van-tag>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
            </div>

            <!-- 通知标题和内容 -->
            <div class="notification-body">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-description">{{ notification.content }}</p>
            </div>

            <!-- 通知操作按钮 -->
            <div v-if="notification.actions" class="notification-actions">
              <van-button
                v-for="action in notification.actions"
                :key="action.id"
                size="medium"
                :type="action.type"
                @click.stop="handleAction(action, notification)"
              >
                {{ action.text }}
              </van-button>
            </div>
          </div>

          <!-- 未读指示器 -->
          <div v-if="!notification.isRead" class="unread-indicator"></div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="!loading && notifications.length === 0"
          description="暂无通知"
          image="search"
        >
          <van-button type="primary" @click="refreshNotifications">
            刷新
          </van-button>
        </van-empty>

        <!-- 加载更多 -->
        <div v-if="hasMore && !loading" class="load-more">
          <van-button @click="loadMore" :loading="loadingMore">
            加载更多
          </van-button>
        </div>
      </div>

      <!-- 悬浮操作按钮 -->
      <div class="fab-container">
        <van-floating-bubble
          v-if="!batchMode"
          axis="xy"
          icon="edit"
          @click="toggleBatchMode"
        >
          批量操作
        </van-floating-bubble>
        <van-floating-bubble
          v-else
          axis="xy"
          icon="cross"
          @click="toggleBatchMode"
        >
          取消批量
        </van-floating-bubble>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '80%' }"
      round
      safe-area-inset-bottom
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-header">
          <h2>{{ selectedNotification.title }}</h2>
          <van-button icon="cross" @click="showDetail = false" />
        </div>
        <div class="detail-content">
          <div class="detail-meta">
            <span class="detail-type">{{ getNotificationTypeText(selectedNotification.type) }}</span>
            <span class="detail-time">{{ formatDateTime(selectedNotification.createdAt) }}</span>
          </div>
          <div class="detail-body">
            <p>{{ selectedNotification.content }}</p>
            <div v-if="selectedNotification.images" class="detail-images">
              <van-image
                v-for="(image, index) in selectedNotification.images"
                :key="index"
                :src="image"
                fit="cover"
                @click="previewImage(selectedNotification.images, index)"
              />
            </div>
          </div>
          <div v-if="selectedNotification.actions" class="detail-actions">
            <van-button
              v-for="action in selectedNotification.actions"
              :key="action.id"
              block
              :type="action.type"
              @click="handleAction(action, selectedNotification)"
            >
              {{ action.text }}
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog, ImagePreview } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { notificationApi } from '@/api/unified-api'

interface NotificationAction {
  id: string
  text: string
  type: 'primary' | 'success' | 'warning' | 'danger'
  action: string
  url?: string
}

interface Notification {
  id: string
  title: string
  content: string
  type: 'system' | 'activity' | 'health' | 'education' | 'meeting'
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: string
  actions?: NotificationAction[]
  images?: string[]
  sender?: string
  category?: string
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const notifications = ref<Notification[]>([])
const searchQuery = ref('')
const activeFilter = ref('all')
const batchMode = ref(false)
const selectedNotifications = ref<string[]>([])
const showDetail = ref(false)
const selectedNotification = ref<Notification | null>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const total = ref(0)

// 通知类型配置
const notificationTypes = {
  system: { icon: 'bell', text: '系统通知', color: '#409EFF' },
  activity: { icon: 'calendar-o', text: '活动通知', color: '#67C23A' },
  health: { icon: 'heart', text: '健康提醒', color: '#E6A23C' },
  education: { icon: 'book-o', text: '教育资讯', color: '#F56C6C' },
  meeting: { icon: 'friends-o', text: '会议通知', color: '#909399' }
}

// 计算属性
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // 类型筛选
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (activeFilter.value === 'important') {
      filtered = filtered.filter(n => n.priority === 'high')
    } else {
      filtered = filtered.filter(n => n.type === activeFilter.value)
    }
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query)
    )
  }

  return filtered
})

// 方法
const handleBack = () => {
  router.back()
}

const handleSearch = () => {
  currentPage.value = 1
  loadNotifications()
}

const handleClearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadNotifications()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadNotifications()
}

const loadNotifications = async (reset = true) => {
  try {
    if (reset) {
      loading.value = true
      currentPage.value = 1
      notifications.value = []
    } else {
      loadingMore.value = true
    }

    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }

    // 添加筛选条件
    if (activeFilter.value !== 'all') {
      if (activeFilter.value === 'unread') {
        params.unreadOnly = true
      } else if (activeFilter.value === 'important') {
        params.priority = 'high'
      } else {
        params.type = activeFilter.value
      }
    }

    // 添加搜索条件
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await notificationApi.getNotifications(params)

    if (response.success && response.data) {
      const newNotifications = response.data.items || []

      if (reset) {
        notifications.value = newNotifications
      } else {
        notifications.value.push(...newNotifications)
      }

      total.value = response.data.total || 0
      hasMore.value = notifications.value.length < total.value

      // 如果是首次加载且有未读通知，标记为已读
      if (reset && newNotifications.length > 0) {
        markNotificationsAsRead(newNotifications.filter(n => !n.isRead))
      }
    }
  } catch (error) {
    console.error('加载通知失败:', error)
    Toast.fail('加载通知失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  currentPage.value++
  await loadNotifications(false)
}

const refreshNotifications = async () => {
  await loadNotifications(true)
  Toast.success('刷新成功')
}

const handleNotificationClick = async (notification: Notification) => {
  if (batchMode.value) {
    toggleSelection(notification.id)
    return
  }

  selectedNotification.value = notification
  showDetail.value = true

  // 如果是未读通知，标记为已读
  if (!notification.isRead) {
    await markNotificationAsRead(notification.id)
    notification.isRead = true
  }
}

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedNotifications.value = []
  }
}

const toggleSelection = (notificationId: string) => {
  const index = selectedNotifications.value.indexOf(notificationId)
  if (index > -1) {
    selectedNotifications.value.splice(index, 1)
  } else {
    selectedNotifications.value.push(notificationId)
  }
}

const selectAll = () => {
  selectedNotifications.value = filteredNotifications.value.map(n => n.id)
}

const deselectAll = () => {
  selectedNotifications.value = []
}

const markSelectedAsRead = async () => {
  if (selectedNotifications.value.length === 0) {
    Toast('请先选择通知')
    return
  }

  try {
    await notificationApi.batchUpdateNotifications(selectedNotifications.value, 'read')

    // 更新本地状态
    notifications.value.forEach(notification => {
      if (selectedNotifications.value.includes(notification.id)) {
        notification.isRead = true
      }
    })

    selectedNotifications.value = []
    Toast.success('标记成功')
  } catch (error) {
    console.error('标记已读失败:', error)
    Toast.fail('标记失败')
  }
}

const deleteSelected = async () => {
  if (selectedNotifications.value.length === 0) {
    Toast('请先选择通知')
    return
  }

  try {
    await Dialog.confirm({
      title: '确认删除',
      message: `确定要删除选中的 ${selectedNotifications.value.length} 条通知吗？`
    })

    await notificationApi.batchUpdateNotifications(selectedNotifications.value, 'delete')

    // 更新本地状态
    notifications.value = notifications.value.filter(
      notification => !selectedNotifications.value.includes(notification.id)
    )

    selectedNotifications.value = []
    Toast.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      Toast.fail('删除失败')
    }
  }
}

const markNotificationAsRead = async (notificationId: string) => {
  try {
    await notificationApi.markNotificationRead(notificationId)
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markNotificationsAsRead = async (notifications: Notification[]) => {
  if (notifications.length === 0) return

  try {
    const ids = notifications.map(n => n.id)
    await notificationApi.batchUpdateNotifications(ids, 'read')
  } catch (error) {
    console.error('批量标记已读失败:', error)
  }
}

const handleAction = async (action: NotificationAction, notification: Notification) => {
  try {
    switch (action.action) {
      case 'url':
        if (action.url) {
          // 在移动端打开URL
          window.location.href = action.url
        }
        break
      case 'confirm':
        await Dialog.confirm({
          title: '确认操作',
          message: `确定要${action.text}吗？`
        })
        Toast.success('操作成功')
        break
      case 'register':
        router.push(`/mobile/parent-center/activities/${notification.id}`)
        break
      case 'view':
        // 查看详情
        selectedNotification.value = notification
        showDetail.value = true
        break
      default:
        Toast(`执行操作: ${action.text}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行操作失败:', error)
      Toast.fail('操作失败')
    }
  }
}

const previewImage = (images: string[], index: number) => {
  ImagePreview({
    images,
    startPosition: index,
    closeable: true
  })
}

const getNotificationIcon = (type: string) => {
  return notificationTypes[type as keyof typeof notificationTypes]?.icon || 'bell'
}

const getNotificationTypeText = (type: string) => {
  return notificationTypes[type as keyof typeof notificationTypes]?.text || '通知'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 监听搜索和筛选变化
watch([searchQuery, activeFilter], () => {
  currentPage.value = 1
  loadNotifications()
})

// 组件挂载时加载数据
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadNotifications()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.notification-center {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);

  .search-filter-bar {
    background: white;
    padding: var(--spacing-md);
    margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .filter-tabs {
      margin-top: 12px;

      :deep(.van-tabs__wrap) {
        height: 44px;
      }

      :deep(.van-tab) {
        font-size: var(--text-sm);
      }
    }
  }

  .batch-actions {
    background: white;
    padding: var(--spacing-md) 16px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .batch-info {
      font-size: var(--text-sm);
      color: #666;
    }

    .batch-buttons {
      display: flex;
      gap: var(--spacing-sm);

      :deep(.van-button) {
        height: 32px;
        padding: 0 12px;
      }
    }
  }

  .notification-list {
    .notification-item {
      background: white;
      margin-bottom: 8px;
      padding: var(--spacing-md);
      position: relative;
      transition: all 0.3s ease;

      &.unread {
        background: #f0f9ff;
      }

      &.important {
        border-left: 4px solid #f56c6c;
      }

      &.selected {
        background: #e8f4ff;
      }

      .selection-checkbox {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 2;
      }

      .notification-content {
        padding-left: 32px;

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .notification-icon {
            width: 20px;
            height: 20px;
            color: #409EFF;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .notification-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--text-xs);
            color: #999;

            .notification-type {
              color: #666;
            }

            .notification-time {
              color: #999;
            }
          }
        }

        .notification-body {
          margin-bottom: 12px;

          .notification-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: #333;
            margin: 0 0 8px 0;
            line-height: 1.4;
          }

          .notification-description {
            font-size: var(--text-sm);
            color: #666;
            margin: 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .notification-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;

          :deep(.van-button) {
            height: 28px;
            padding: 0 12px;
            font-size: var(--text-xs);
          }
        }
      }

      .unread-indicator {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background: #f56c6c;
        border-radius: 50%;
      }
    }
  }

  .load-more {
    text-align: center;
    padding: var(--spacing-lg);

    :deep(.van-button) {
      min-width: 120px;
    }
  }

  .fab-container {
    position: fixed;
    bottom: 80px;
    right: 16px;
    z-index: 100;
  }

  .notification-detail {
    height: 100%;
    background: white;
    overflow-y: auto;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid #f0f0f0;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;

      h2 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: #333;
      }
    }

    .detail-content {
      padding: var(--spacing-lg);

      .detail-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: 20px;
        font-size: var(--text-sm);
        color: #999;

        .detail-type {
          color: #666;
        }
      }

      .detail-body {
        margin-bottom: 20px;

        p {
          font-size: var(--text-base);
          color: #333;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .detail-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: var(--spacing-sm);
          margin-top: 16px;

          :deep(.van-image) {
            width: 100%;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
          }
        }
      }

      .detail-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
    }
  }
}

// 批量模式下的通知项样式调整
.notification-item {
  &.selected {
    .notification-content {
      margin-left: 0;
    }
  }
}

// 响应式设计
@media (min-width: 768px) {
  .notification-center {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>