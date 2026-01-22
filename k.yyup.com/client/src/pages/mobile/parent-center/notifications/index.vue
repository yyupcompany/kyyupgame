<template>
  <MobileSubPageLayout title="通知中心" back-path="/mobile/parent-center">
    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card unread">
          <div class="stat-icon">
            <van-icon name="chat-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ unreadCount }}</div>
            <div class="stat-label">未读通知</div>
          </div>
        </div>
        <div class="stat-card today">
          <div class="stat-icon">
            <van-icon name="calendar-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayCount }}</div>
            <div class="stat-label">今日通知</div>
          </div>
        </div>
        <div class="stat-card important">
          <div class="stat-icon">
            <van-icon name="warning-o" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ importantCount }}</div>
            <div class="stat-label">重要通知</div>
          </div>
        </div>
        <div class="stat-card monthly">
          <div class="stat-icon">
            <van-icon name="description" size="20" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ monthlyCount }}</div>
            <div class="stat-label">本月通知</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索通知标题或内容"
        @search="handleSearch"
        @clear="handleClearSearch"
      />

      <div class="filter-actions">
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="selectedType"
            :options="typeOptions"
            title="通知类型"
          />
          <van-dropdown-item
            v-model="selectedPriority"
            :options="priorityOptions"
            title="优先级"
          />
        </van-dropdown-menu>

        <div class="action-buttons">
          <van-button
            type="primary"
            size="small"
            :disabled="unreadCount === 0"
            @click="markAllAsRead"
          >
            全部已读
          </van-button>
          <van-button
            size="small"
            @click="refreshNotifications"
          >
            <van-icon name="replay" />
          </van-button>
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-section">
      <div class="list-header">
        <span class="list-title">通知列表</span>
        <span class="list-count">共 {{ filteredNotifications.length }} 条</span>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <div
            v-for="notification in paginatedNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read, 'important': notification.priority === 'high' }"
            @click="viewNotificationDetail(notification)"
          >
            <div class="notification-header">
              <div class="notification-meta">
                <van-tag
                  :type="getTypeTagType(notification.type)"
                  size="small"
                >
                  {{ getTypeLabel(notification.type) }}
                </van-tag>
                <van-tag
                  v-if="notification.priority === 'high'"
                  type="danger"
                  size="small"
                  class="ml-2"
                >
                  重要
                </van-tag>
                <span class="notification-time">
                  {{ formatDateTime(notification.createdAt) }}
                </span>
              </div>
              <div class="unread-dot" v-if="!notification.read"></div>
            </div>

            <div class="notification-content">
              <h4 class="notification-title">
                {{ notification.title }}
              </h4>
              <p class="notification-message">{{ notification.message }}</p>

              <div
                v-if="notification.attachments && notification.attachments.length > 0"
                class="notification-attachments"
              >
                <div class="attachments-label">附件：</div>
                <div class="attachments-list">
                  <div
                    v-for="attachment in notification.attachments"
                    :key="attachment.id"
                    class="attachment-item"
                    @click.stop="downloadAttachment(attachment)"
                  >
                    <van-icon name="paperclip" size="14" />
                    <span>{{ attachment.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="notification-actions" @click.stop>
              <van-button
                v-if="!notification.read"
                type="primary"
                size="mini"
                @click="markAsRead(notification)"
              >
                标记已读
              </van-button>
              <van-button
                type="danger"
                size="mini"
                plain
                @click="deleteNotification(notification)"
              >
                删除
              </van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="filteredNotifications.length === 0 && !loading"
        description="暂无通知"
        image="default"
      />
    </div>

    <!-- 类型统计抽屉 -->
    <van-popup v-model:show="showStatsDrawer" position="right" :style="{ width: '80%', height: '100%' }">
      <div class="stats-drawer">
        <div class="drawer-header">
          <h3>类型统计</h3>
          <van-icon name="cross" @click="showStatsDrawer = false" />
        </div>

        <div class="type-stats">
          <div
            v-for="stat in typeStatistics"
            :key="stat.type"
            class="type-stat-item"
          >
            <div class="stat-icon">
              <van-icon :name="stat.icon" size="16" />
            </div>
            <div class="stat-info">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-count">{{ stat.count }}条</span>
            </div>
          </div>
        </div>

        <div class="recent-notifications">
          <h4>最近通知</h4>
          <div
            v-for="recent in recentNotifications"
            :key="recent.id"
            class="recent-item"
            @click="viewNotificationDetail(recent)"
          >
            <div class="recent-dot" :class="{ 'unread': !recent.read }"></div>
            <div class="recent-content">
              <div class="recent-title">{{ recent.title }}</div>
              <div class="recent-time">{{ formatDateTime(recent.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 悬浮统计按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="chart-trending-o"
      @click="showStatsDrawer = true"
    />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import {
  getNotificationList,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi
} from '@/api/modules/notification'

// 通知数据接口
interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  read: boolean
  createdAt: string
  attachments?: Array<{
    id: string
    name: string
    url: string
  }>
}

// 响应式数据
const router = useRouter()
const searchKeyword = ref('')
const selectedType = ref('')
const selectedPriority = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showStatsDrawer = ref(false)

// 通知类型选项
const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '公告通知', value: 'announcement' },
  { text: '活动通知', value: 'activity' },
  { text: '作业通知', value: 'homework' },
  { text: '假期通知', value: 'holiday' },
  { text: '紧急通知', value: 'emergency' },
  { text: '健康提醒', value: 'health' }
]

// 优先级选项
const priorityOptions = [
  { text: '全部优先级', value: '' },
  { text: '重要', value: 'high' },
  { text: '普通', value: 'normal' },
  { text: '一般', value: 'low' }
]

// 通知类型映射
const notificationTypes = [
  { value: 'announcement', label: '公告通知' },
  { value: 'activity', label: '活动通知' },
  { value: 'homework', label: '作业通知' },
  { value: 'holiday', label: '假期通知' },
  { value: 'emergency', label: '紧急通知' },
  { value: 'health', label: '健康提醒' }
]

// 模拟通知数据
const notifications = ref<Notification[]>([
  {
    id: '1',
    title: '本周家长会通知',
    message: '定于本周五下午2点召开本学期第一次家长会，请各位家长准时参加。会议将在幼儿园多功能厅举行，预计时长2小时。',
    type: 'announcement',
    priority: 'high',
    read: false,
    createdAt: '2024-11-18 09:00:00',
    attachments: [
      { id: '1', name: '家长会议程.pdf', url: '#' }
    ]
  },
  {
    id: '2',
    title: '秋季运动会报名',
    message: '幼儿园秋季运动会将于下月15日举行，现开始接受报名。请有意向的小朋友家长在月底前完成报名手续。',
    type: 'activity',
    priority: 'normal',
    read: false,
    createdAt: '2024-11-17 14:30:00',
    attachments: []
  },
  {
    id: '3',
    title: '本周作业安排',
    message: '本周的作业包括：1. 绘画练习《秋天的色彩》 2. 儿歌学习《小星星》 3. 手工制作树叶画。请家长协助完成。',
    type: 'homework',
    priority: 'normal',
    read: true,
    createdAt: '2024-11-16 16:00:00',
    attachments: [
      { id: '2', name: '作业要求.docx', url: '#' },
      { id: '3', name: '参考图片.jpg', url: '#' }
    ]
  },
  {
    id: '4',
    title: '冬季作息时间调整通知',
    message: '从下周一开始，幼儿园将实行冬季作息时间。早晨入园时间调整为8:00-8:30，下午离园时间调整为16:30-17:00。',
    type: 'announcement',
    priority: 'normal',
    read: true,
    createdAt: '2024-11-15 10:00:00',
    attachments: []
  },
  {
    id: '5',
    title: '流感疫苗接种提醒',
    message: '现在是流感高发季节，建议及时为幼儿接种流感疫苗。幼儿园将在本月底组织集体接种，有需要的家长请联系班主任。',
    type: 'health',
    priority: 'high',
    read: false,
    createdAt: '2024-11-14 09:15:00',
    attachments: []
  }
])

// 计算属性
const filteredNotifications = computed(() => {
  let result = [...notifications.value]

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(n =>
      n.title.toLowerCase().includes(keyword) ||
      n.message.toLowerCase().includes(keyword)
    )
  }

  // 类型筛选
  if (selectedType.value) {
    result = result.filter(n => n.type === selectedType.value)
  }

  // 优先级筛选
  if (selectedPriority.value) {
    result = result.filter(n => n.priority === selectedPriority.value)
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotifications.value.slice(start, end)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const todayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return notifications.value.filter(n => n.createdAt.startsWith(today)).length
})

const importantCount = computed(() =>
  notifications.value.filter(n => n.priority === 'high').length
)

const monthlyCount = computed(() => {
  const now = new Date()
  return notifications.value.filter(n => {
    const noticeDate = new Date(n.createdAt)
    return noticeDate.getMonth() === now.getMonth() &&
           noticeDate.getFullYear() === now.getFullYear()
  }).length
})

const typeStatistics = computed(() => {
  const stats: Record<string, number> = {}
  notifications.value.forEach(n => {
    stats[n.type] = (stats[n.type] || 0) + 1
  })

  return notificationTypes.map(type => ({
    type: type.value,
    label: type.label,
    count: stats[type.value] || 0,
    icon: getTypeIcon(type.value)
  }))
})

const recentNotifications = computed(() =>
  [...notifications.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
)

// 方法
const handleSearch = () => {
  currentPage.value = 1
  finished.value = false
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  finished.value = false
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await loadNotifications()
    showToast('刷新成功')
  } catch (error) {
    showToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

const loadMore = () => {
  // 模拟加载更多
  setTimeout(() => {
    if (paginatedNotifications.value.length >= filteredNotifications.value.length) {
      finished.value = true
    } else {
      currentPage.value++
    }
    loading.value = false
  }, 1000)
}

const markAsRead = async (notification: Notification) => {
  try {
    await markNotificationAsRead(notification.id)
    notification.read = true
    showToast('已标记为已读')
  } catch (error) {
    showToast('标记失败')
  }
}

const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(n => n.read = true)
    showToast('所有通知已标记为已读')
  } catch (error) {
    showToast('操作失败')
  }
}

const deleteNotification = async (notification: Notification) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除通知"${notification.title}"吗？`,
    })

    await deleteNotificationApi(notification.id)
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      showToast('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const refreshNotifications = () => {
  handleRefresh()
}

const downloadAttachment = (attachment: any) => {
  showToast(`下载附件: ${attachment.name}`)
}

const viewNotificationDetail = (notification: Notification) => {
  if (!notification.read) {
    markAsRead(notification)
  }
  router.push(`/mobile/parent-center/notifications/detail?id=${notification.id}`)
}

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const getTypeLabel = (type: string) => {
  const typeObj = notificationTypes.find(t => t.value === type)
  return typeObj ? typeObj.label : type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    announcement: 'primary',
    activity: 'success',
    homework: 'warning',
    holiday: 'default',
    emergency: 'danger',
    health: 'warning'
  }
  return types[type] || 'default'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    announcement: 'bell',
    activity: 'calendar',
    homework: 'book',
    holiday: 'sunny',
    emergency: 'warning',
    health: 'heart'
  }
  return icons[type] || 'message'
}

const loadNotifications = async () => {
  try {
    // 这里可以调用真实的API
    // const response = await getNotificationList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   keyword: searchKeyword.value,
    //   type: selectedType.value,
    //   priority: selectedPriority.value
    // })
    // notifications.value = response.data.items
  } catch (error) {
    console.error('加载通知失败:', error)
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

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

// 统计卡片区域
.stats-section {
  padding: var(--spacing-md);
  background: var(--primary-gradient);
  margin-bottom: 8px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      color: white;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-xl);
          font-weight: bold;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-xs);
          opacity: 0.9;
        }
      }

      &.unread { background: rgba(255, 255, 255, 0.2); }
      &.today { background: rgba(255, 255, 255, 0.15); }
      &.important { background: rgba(255, 255, 255, 0.25); }
      &.monthly { background: rgba(255, 255, 255, 0.15); }
    }
  }
}

// 筛选区域
.filter-section {
  background: var(--card-bg);
  padding: var(--spacing-md) 16px;
  margin-bottom: 8px;

  .filter-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

// 通知列表区域
.notifications-section {
  flex: 1;
  background: var(--card-bg);
  padding: 0 16px 16px;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;

    .list-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
    }

    .list-count {
      font-size: var(--text-sm);
      color: #969799;
    }
  }

  .notification-item {
    padding: var(--spacing-md);
    margin-bottom: 12px;
    background: var(--app-bg-color);
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;

    &.unread {
      background: var(--card-bg);
      border-left: 4px solid #409eff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .notification-header .unread-dot {
        display: block;
      }
    }

    &.important {
      border-left-color: #ee0a24;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .notification-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;

        .notification-time {
          font-size: var(--text-xs);
          color: #969799;
        }
      }

      .unread-dot {
        display: none;
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
      }

      .ml-2 {
        margin-left: 8px;
      }
    }

    .notification-content {
      .notification-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin: 0 0 8px 0;
        line-height: 1.4;
      }

      .notification-message {
        font-size: var(--text-sm);
        color: #646566;
        line-height: 1.5;
        margin: 0 0 12px 0;
      }

      .notification-attachments {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);

        .attachments-label {
          font-size: var(--text-xs);
          color: #969799;
          font-weight: 500;
        }

        .attachments-list {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;

          .attachment-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: 6px 8px;
            background: var(--card-bg);
            border: 1px solid #ebedf0;
            border-radius: 6px;
            cursor: pointer;
            font-size: var(--text-xs);
            color: #646566;
            transition: all 0.3s ease;

            &:active {
              background: #f2f3f5;
            }
          }
        }
      }
    }

    .notification-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: 12px;
      justify-content: flex-end;
    }
  }
}

// 统计抽屉
.stats-drawer {
  padding: var(--spacing-lg);
  height: 100%;
  background: var(--card-bg);
  overflow-y: auto;

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: #969799;
      cursor: pointer;
    }
  }

  .type-stats {
    margin-bottom: 32px;

    .type-stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: 8px;
      background: var(--app-bg-color);
      border-radius: 8px;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        border-radius: 6px;
        flex-shrink: 0;
      }

      .stat-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;

        .stat-label {
          font-size: var(--text-sm);
          color: #323233;
        }

        .stat-count {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--primary-color);
        }
      }
    }
  }

  .recent-notifications {
    h4 {
      margin: 0 0 16px 0;
      font-size: var(--text-base);
      font-weight: 600;
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: 8px;
      background: var(--app-bg-color);
      border-radius: 8px;
      cursor: pointer;

      &:active {
        background: #ebedf0;
      }

      .recent-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c8c9cc;
        flex-shrink: 0;

        &.unread {
          background: var(--primary-color);
        }
      }

      .recent-content {
        flex: 1;
        min-width: 0;

        .recent-title {
          font-size: var(--text-sm);
          color: #323233;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .recent-time {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .stats-section .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>