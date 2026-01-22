<template>
  <MobileSubPageLayout title="通知中心" back-path="/mobile/teacher-center">
    <template #nav-right>
      <van-icon
        name="ellipsis"
        size="18"
        @click="showActionSheet = true"
      />
    </template>

    <div class="mobile-teacher-notifications">
      <!-- 统计卡片 -->
      <MobileNotificationStats
        :unread="notificationStats.unread"
        :total="notificationStats.total"
        :today="notificationStats.today"
        @stat-click="handleStatClick"
      />

      <!-- 分类筛选 -->
      <div class="filter-section">
        <van-tabs
          v-model:active="activeCategory"
          @change="handleCategoryChange"
          sticky
          offset-top="46"
        >
          <van-tab title="全部" name="" />
          <van-tab title="系统通知" name="system" />
          <van-tab title="园区公告" name="announcement" />
          <van-tab title="班级通知" name="class" />
        </van-tabs>
      </div>

      <!-- 园区重要公告 -->
      <div
        v-if="activeCategory === '' || activeCategory === 'announcement'"
        class="announcements-section"
      >
        <van-cell-group inset title="园区重要公告">
          <van-cell
            v-for="announcement in importantAnnouncements"
            :key="announcement.id"
            :title="announcement.title"
            :label="announcement.content"
            is-link
            @click="handleViewAnnouncement(announcement)"
          >
            <template #title>
              <div class="announcement-header">
                <van-tag
                  :type="announcement.priority === 'urgent' ? 'danger' : 'warning'"
                  size="small"
                >
                  {{ announcement.priority === 'urgent' ? '紧急' : '重要' }}
                </van-tag>
                <span class="announcement-title">{{ announcement.title }}</span>
              </div>
            </template>
            <template #right-icon>
              <span class="announcement-time">
                {{ formatRelativeTime(announcement.created_at) }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 通知列表 -->
      <div class="notifications-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-cell-group
              v-for="notification in notificationList"
              :key="notification.id"
              inset
              class="notification-item"
              :class="{ 'unread': !notification.is_read }"
            >
              <van-cell
                :border="false"
                @click="handleNotificationClick(notification)"
              >
                <template #title>
                  <div class="notification-header">
                    <div class="notification-title">
                      {{ notification.title }}
                    </div>
                    <div class="notification-meta">
                      <van-tag
                        :type="getPriorityType(notification.priority)"
                        size="small"
                      >
                        {{ getPriorityText(notification.priority) }}
                      </van-tag>
                    </div>
                  </div>
                </template>

                <template #label>
                  <div class="notification-content">
                    {{ notification.content }}
                  </div>
                  <div class="notification-footer">
                    <span class="notification-category">
                      {{ getCategoryText(notification.type) }}
                    </span>
                    <span class="notification-time">
                      {{ formatRelativeTime(notification.created_at) }}
                    </span>
                  </div>
                </template>

                <template #right-icon>
                  <van-badge
                    v-if="!notification.is_read"
                    dot
                    :content="''"
                  />
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && notificationList.length === 0"
              description="暂无通知消息"
              image="search"
            />
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 快速操作悬浮按钮 -->
      <van-floating-bubble
        axis="xy"
        icon="plus"
        @click="showPublishDialog = true"
      />
    </div>

    <!-- 操作菜单 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      cancel-text="取消"
    />

    <!-- 通知详情弹窗 -->
    <MobileNotificationDetail
      v-model="notificationDetailVisible"
      :notification="currentNotification"
      @read="handleMarkRead"
      @delete="handleDeleteNotification"
    />

    <!-- 发布通知弹窗 -->
    <van-dialog
      v-model:show="showPublishDialog"
      title="发布通知"
      :show-confirm-button="false"
    >
      <div class="publish-form">
        <van-form @submit="handlePublishNotification">
          <van-field
            v-model="publishForm.title"
            name="title"
            label="标题"
            placeholder="请输入通知标题"
            :rules="[{ required: true, message: '请输入通知标题' }]"
          />
          <van-field
            v-model="publishForm.content"
            name="content"
            label="内容"
            type="textarea"
            placeholder="请输入通知内容"
            :rules="[{ required: true, message: '请输入通知内容' }]"
          />
          <van-field name="type" label="类型">
            <template #input>
              <van-radio-group v-model="publishForm.type" direction="horizontal">
                <van-radio name="system">系统</van-radio>
                <van-radio name="announcement">公告</van-radio>
                <van-radio name="class">班级</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field name="priority" label="优先级">
            <template #input>
              <van-radio-group v-model="publishForm.priority" direction="horizontal">
                <van-radio name="normal">普通</van-radio>
                <van-radio name="important">重要</van-radio>
                <van-radio name="urgent">紧急</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <div class="publish-actions">
            <van-button block type="primary" native-type="submit">
              发布
            </van-button>
          </div>
        </van-form>
      </div>
    </van-dialog>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import MobileNotificationStats from './components/MobileNotificationStats.vue'
import MobileNotificationDetail from './components/MobileNotificationDetail.vue'
import {
  getNotificationList,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
} from '@/api/modules/notification'

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const activeCategory = ref('')
const notificationDetailVisible = ref(false)
const showActionSheet = ref(false)
const showPublishDialog = ref(false)
const currentNotification = ref(null)

// 通知统计
const notificationStats = reactive({
  unread: 0,
  total: 0,
  today: 0
})

// 通知列表
const notificationList = ref([])

// 重要公告列表
const importantAnnouncements = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 发布通知表单
const publishForm = reactive({
  title: '',
  content: '',
  type: 'announcement',
  priority: 'normal'
})

// 操作菜单
const actionSheetActions = [
  { name: '全部标记已读', value: 'markAllRead' },
  { name: '刷新通知', value: 'refresh' },
  { name: '发布通知', value: 'publish' }
]

// 方法
const handleStatClick = (stat: any) => {
  showToast(`点击了${stat.label}`)
}

const handleCategoryChange = () => {
  pagination.page = 1
  notificationList.value = []
  finished.value = false
  loadNotifications()
}

const handleNotificationClick = (notification: any) => {
  currentNotification.value = notification
  notificationDetailVisible.value = true

  // 如果是未读消息，标记为已读
  if (!notification.is_read) {
    handleMarkRead(notification)
  }
}

const handleMarkRead = async (notification: any) => {
  try {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      notification.is_read = true
      notificationStats.unread--
      showToast('已标记为已读')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    showToast('标记已读失败')
  }
}

const handleViewAnnouncement = (announcement: any) => {
  // 将公告转换为通知格式以复用详情组件
  const announcementAsNotification = {
    ...announcement,
    type: 'announcement',
    is_read: true // 公告默认为已读状态
  }
  currentNotification.value = announcementAsNotification
  notificationDetailVisible.value = true
}

const handleDeleteNotification = async (notification: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条通知吗？'
    })

    await deleteNotification(notification.id)

    // 从列表中移除
    const index = notificationList.value.findIndex(item => item.id === notification.id)
    if (index > -1) {
      notificationList.value.splice(index, 1)
    }

    // 更新统计数据
    if (!notification.is_read) {
      notificationStats.unread--
    }
    notificationStats.total--

    showToast('通知已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      showToast('删除通知失败')
    }
  }
}

const handleActionSelect = (action: any) => {
  switch (action.value) {
    case 'markAllRead':
      handleMarkAllRead()
      break
    case 'refresh':
      onRefresh()
      break
    case 'publish':
      showPublishDialog.value = true
      break
  }
}

const handleMarkAllRead = async () => {
  try {
    await showConfirmDialog({
      title: '批量操作',
      message: '确定要将所有未读消息标记为已读吗？'
    })

    await markAllNotificationsAsRead()

    // 更新本地数据
    notificationList.value.forEach(item => {
      item.is_read = true
    })
    notificationStats.unread = 0
    showToast('所有消息已标记为已读')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量标记已读失败:', error)
      showToast('批量标记已读失败')
    }
  }
}

const handlePublishNotification = async () => {
  try {
    await createNotification(publishForm)
    showToast('通知发布成功')
    showPublishDialog.value = false

    // 重置表单
    Object.assign(publishForm, {
      title: '',
      content: '',
      type: 'announcement',
      priority: 'normal'
    })

    // 刷新列表
    onRefresh()
  } catch (error) {
    console.error('发布通知失败:', error)
    showToast('发布通知失败')
  }
}

const onRefresh = () => {
  refreshing.value = true
  pagination.page = 1
  notificationList.value = []
  finished.value = false
  loadNotifications().finally(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  loadNotifications()
}

// 工具方法
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    urgent: 'danger',
    important: 'warning',
    normal: 'primary'
  }
  return typeMap[priority] || 'primary'
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    urgent: '紧急',
    important: '重要',
    normal: '普通'
  }
  return textMap[priority] || '普通'
}

const getCategoryText = (type: string) => {
  const textMap: Record<string, string> = {
    system: '系统通知',
    announcement: '园区公告',
    class: '班级通知',
    personal: '个人消息'
  }
  return textMap[type] || '系统通知'
}

const formatRelativeTime = (dateTime: string) => {
  if (!dateTime) return ''
  const now = new Date()
  const date = new Date(dateTime)
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

const loadNotifications = async () => {
  if (finished.value) return

  try {
    loading.value = true

    // 并行加载通知列表和统计数据
    const [listResponse, statsResponse] = await Promise.all([
      getNotificationList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: activeCategory.value || undefined
      }),
      pagination.page === 1 ? getNotificationStats() : Promise.resolve({ data: notificationStats })
    ])

    // 更新通知列表
    if (listResponse.data) {
      const newItems = listResponse.data.items || []
      if (pagination.page === 1) {
        notificationList.value = newItems
      } else {
        notificationList.value.push(...newItems)
      }
      pagination.total = listResponse.data.total || 0

      // 判断是否加载完成
      if (notificationList.value.length >= pagination.total) {
        finished.value = true
      }
    }

    // 更新统计数据
    if (statsResponse.data && pagination.page === 1) {
      Object.assign(notificationStats, statsResponse.data)
    }

    // 重要公告模拟数据
    if (pagination.page === 1 && (activeCategory.value === '' || activeCategory.value === 'announcement')) {
      importantAnnouncements.value = [
        {
          id: 'ann_1',
          title: '2025年春季学期开学准备工作通知',
          content: '各位老师请注意，春季学期将于2月20日正式开学，请提前做好教学准备工作。',
          priority: 'urgent',
          created_at: '2025-01-20T09:00:00Z'
        },
        {
          id: 'ann_2',
          title: '幼儿园安全管理制度更新',
          content: '根据最新的安全管理要求，我园安全管理制度已更新，请各位老师认真学习新制度内容。',
          priority: 'important',
          created_at: '2025-01-18T14:30:00Z'
        },
        {
          id: 'ann_3',
          title: '教师培训计划安排',
          content: '本学期教师培训计划已制定完成，包括专业技能培训、安全培训等。',
          priority: 'important',
          created_at: '2025-01-16T11:00:00Z'
        }
      ]
    }

    pagination.page++
  } catch (error) {
    console.error('加载通知失败:', error)
    showToast('加载通知失败')

    // 如果API调用失败，使用模拟数据
    if (pagination.page === 1) {
      notificationStats.unread = 8
      notificationStats.total = 45
      notificationStats.today = 12

      notificationList.value = [
        {
          id: 1,
          title: '本周教研活动安排',
          content: '请各位老师准时参加本周三下午的教研活动，地点在会议室A。',
          type: 'announcement',
          priority: 'important',
          is_read: false,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          title: '学期末家长会通知',
          content: '学期末家长会将于下周举行，请提前准备相关材料。',
          type: 'class',
          priority: 'normal',
          is_read: true,
          created_at: '2024-01-14T15:20:00Z'
        },
        {
          id: 3,
          title: '系统维护通知',
          content: '系统将于今晚22:00-24:00进行维护，期间可能无法正常使用。',
          type: 'system',
          priority: 'urgent',
          is_read: false,
          created_at: '2024-01-15T09:00:00Z'
        }
      ]

      pagination.total = 45
      finished.value = true
    }
  } finally {
    loading.value = false
  }
}

// 生命周期
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
.mobile-teacher-notifications {
  background: var(--van-background-color-light);
  min-height: calc(100vh - 100px);

  .filter-section {
    background: white;
    margin-bottom: var(--spacing-md);

    :deep(.van-tabs) {
      .van-tabs__nav {
        background: white;
      }
    }
  }

  .announcements-section {
    margin-bottom: var(--spacing-md);

    .announcement-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;

      .announcement-title {
        font-weight: 600;
        color: var(--van-text-color-1);
        flex: 1;
      }
    }

    .announcement-time {
      font-size: var(--text-xs);
      color: var(--van-text-color-3);
    }
  }

  .notifications-list {
    padding: 0 0 80px 0;

    .notification-item {
      margin-bottom: var(--spacing-md);
      transition: all 0.3s ease;

      &.unread {
        :deep(.van-cell-group) {
          border-left: 4px solid var(--van-danger-color);
        }
      }

      .notification-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);

        .notification-title {
          font-weight: 600;
          font-size: var(--text-base);
          color: var(--van-text-color-1);
          flex: 1;
          margin-right: var(--spacing-sm);
        }

        .notification-meta {
          flex-shrink: 0;
        }
      }

      .notification-content {
        color: var(--van-text-color-2);
        font-size: var(--text-sm);
        line-height: 1.5;
        margin-bottom: var(--spacing-sm);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .notification-category {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
          background: var(--van-background-color-light);
          padding: 2px 6px;
          border-radius: var(--spacing-xs);
        }

        .notification-time {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
        }
      }
    }
  }
}

.publish-form {
  padding: var(--spacing-md);

  .publish-actions {
    margin-top: var(--spacing-lg);
  }

  :deep(.van-field__label) {
    width: 60px;
  }
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-teacher-notifications {
    .notification-item {
      .notification-header {
        .notification-title {
          font-size: var(--text-base);
        }
      }

      .notification-content {
        font-size: var(--text-sm);
      }
    }
  }

  .publish-form {
    padding: var(--spacing-md);
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>