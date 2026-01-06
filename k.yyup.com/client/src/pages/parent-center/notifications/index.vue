<template>
  <UnifiedCenterLayout
    title="最新通知"
    description="查看幼儿园的最新通知和重要信息"
    icon="Bell"
  >
    <template #stats>
      <StatCard
        title="未读通知"
        :value="unreadCount"
        unit="条"
        icon-name="message"
        type="danger"
      />
      <StatCard
        title="今日通知"
        :value="todayCount"
        unit="条"
        icon-name="calendar"
        type="primary"
      />
      <StatCard
        title="重要通知"
        :value="importantCount"
        unit="条"
        icon-name="warning"
        type="warning"
      />
      <StatCard
        title="本月通知"
        :value="monthlyCount"
        unit="条"
        icon-name="document"
        type="success"
      />
    </template>

    <div class="main-content">
      <!-- 通知筛选和操作 -->
      <el-row :gutter="24" class="content-row">
        <el-col :span="24">
          <el-card class="content-card">
            <div class="notification-filters">
              <div class="filter-left">
                <el-select
                  v-model="selectedType"
                  placeholder="通知类型"
                  clearable
                  style="width: 150px; margin-right: var(--spacing-md);"
                >
                  <el-option
                    v-for="type in notificationTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>

                <el-select
                  v-model="selectedPriority"
                  placeholder="优先级"
                  clearable
                  style="width: 120px; margin-right: var(--spacing-md);"
                >
                  <el-option
                    v-for="priority in priorities"
                    :key="priority.value"
                    :label="priority.label"
                    :value="priority.value"
                  />
                </el-select>

                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 240px;"
                />
              </div>

              <div class="filter-right">
                <el-button
                  type="primary"
                  @click="markAllAsRead"
                  :disabled="unreadCount === 0"
                >
                  全部已读
                </el-button>
                <el-button @click="refreshNotifications">
                  刷新
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 通知列表 -->
      <el-row :gutter="24" class="content-row">
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <el-card class="content-card notifications-card">
            <template #header>
              <div class="card-header">
                <h3>通知列表</h3>
                <span class="notification-count">
                  共 {{ filteredNotifications.length }} 条通知
                </span>
              </div>
            </template>

            <div class="notifications-list">
              <div
                v-for="notification in paginatedNotifications"
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read, 'important': notification.priority === 'high' }"
              >
                <div class="notification-header">
                  <div class="notification-meta">
                    <el-tag
                      :type="getTypeTagType(notification.type)"
                      size="small"
                    >
                      {{ getTypeLabel(notification.type) }}
                    </el-tag>
                    <el-tag
                      v-if="notification.priority === 'high'"
                      type="danger"
                      size="small"
                      style="margin-left: var(--spacing-xs);"
                    >
                      重要
                    </el-tag>
                    <span class="notification-time">
                      {{ formatDateTime(notification.createdAt) }}
                    </span>
                  </div>
                  <div class="notification-actions">
                    <el-button
                      v-if="!notification.read"
                      type="text"
                      size="small"
                      @click="markAsRead(notification)"
                    >
                      标记已读
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      class="delete-button"
                      @click="deleteNotification(notification)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>

                <div class="notification-content">
                  <h4 class="notification-title">
                    <span v-if="!notification.read" class="unread-indicator">•</span>
                    {{ notification.title }}
                  </h4>
                  <p class="notification-message">{{ notification.message }}</p>

                  <div v-if="notification.attachments && notification.attachments.length > 0" class="notification-attachments">
                    <div class="attachments-label">附件：</div>
                    <div class="attachments-list">
                      <div
                        v-for="attachment in notification.attachments"
                        :key="attachment.id"
                        class="attachment-item"
                        @click="downloadAttachment(attachment)"
                      >
                        <UnifiedIcon name="paperclip" size="14" />
                        <span>{{ attachment.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="filteredNotifications.length === 0"
              description="暂无通知"
              :image-size="120"
            />

            <!-- 分页 -->
            <div v-if="filteredNotifications.length > 0" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="filteredNotifications.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 侧边栏统计 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 通知类型统计 -->
          <el-card class="content-card type-stats-card">
            <template #header>
              <div class="card-header">
                <h3>类型统计</h3>
              </div>
            </template>

            <div class="type-stats">
              <div
                v-for="stat in typeStatistics"
                :key="stat.type"
                class="type-stat-item"
              >
                <div class="stat-icon">
                  <UnifiedIcon :name="stat.icon" size="16" />
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-count">{{ stat.count }}条</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 最近通知 -->
          <el-card class="content-card recent-card">
            <template #header>
              <div class="card-header">
                <h3>最近通知</h3>
              </div>
            </template>

            <div class="recent-notifications">
              <div
                v-for="recent in recentNotifications"
                :key="recent.id"
                class="recent-item"
                @click="viewNotification(recent)"
              >
                <div class="recent-dot" :class="{ 'unread': !recent.read }"></div>
                <div class="recent-content">
                  <div class="recent-title">{{ recent.title }}</div>
                  <div class="recent-time">{{ formatDateTime(recent.createdAt) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StatCard from '@/components/statistics/StatCard.vue'

// 响应式数据
const selectedType = ref('')
const selectedPriority = ref('')
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)

// 通知类型
const notificationTypes = [
  { value: 'announcement', label: '公告通知' },
  { value: 'activity', label: '活动通知' },
  { value: 'homework', label: '作业通知' },
  { value: 'holiday', label: '假期通知' },
  { value: 'emergency', label: '紧急通知' },
  { value: 'health', label: '健康提醒' }
]

// 优先级
const priorities = [
  { value: 'high', label: '重要' },
  { value: 'normal', label: '普通' },
  { value: 'low', label: '一般' }
]

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '本周家长会通知',
    message: '定于本周五下午2点召开本学期第一次家长会，请各位家长准时参加。会议将在幼儿园多功能厅举行，预计时长2小时。',
    type: 'announcement',
    priority: 'high',
    read: false,
    createdAt: '2024-11-18 09:00:00',
    attachments: [
      { id: 1, name: '家长会议程.pdf', url: '#' }
    ]
  },
  {
    id: 2,
    title: '秋季运动会报名',
    message: '幼儿园秋季运动会将于下月15日举行，现开始接受报名。请有意向的小朋友家长在月底前完成报名手续。',
    type: 'activity',
    priority: 'normal',
    read: false,
    createdAt: '2024-11-17 14:30:00',
    attachments: []
  },
  {
    id: 3,
    title: '本周作业安排',
    message: '本周的作业包括：1. 绘画练习《秋天的色彩》 2. 儿歌学习《小星星》 3. 手工制作树叶画。请家长协助完成。',
    type: 'homework',
    priority: 'normal',
    read: true,
    createdAt: '2024-11-16 16:00:00',
    attachments: [
      { id: 2, name: '作业要求.docx', url: '#' },
      { id: 3, name: '参考图片.jpg', url: '#' }
    ]
  },
  {
    id: 4,
    title: '冬季作息时间调整通知',
    message: '从下周一开始，幼儿园将实行冬季作息时间。早晨入园时间调整为8:00-8:30，下午离园时间调整为16:30-17:00。',
    type: 'announcement',
    priority: 'normal',
    read: true,
    createdAt: '2024-11-15 10:00:00',
    attachments: []
  },
  {
    id: 5,
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

  // 类型筛选
  if (selectedType.value) {
    result = result.filter(n => n.type === selectedType.value)
  }

  // 优先级筛选
  if (selectedPriority.value) {
    result = result.filter(n => n.priority === selectedPriority.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(n => {
      const noticeDate = n.createdAt.split(' ')[0]
      return noticeDate >= start && noticeDate <= end
    })
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
  const stats = {}
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
const markAsRead = (notification: any) => {
  notification.read = true
  ElMessage.success('已标记为已读')
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  ElMessage.success('所有通知已标记为已读')
}

const deleteNotification = (notification: any) => {
  ElMessageBox.confirm(
    `确定要删除通知"${notification.title}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const refreshNotifications = () => {
  ElMessage.success('通知已刷新')
}

const downloadAttachment = (attachment: any) => {
  ElMessage.info(`下载附件: ${attachment.name}`)
}

const viewNotification = (notification: any) => {
  if (!notification.read) {
    markAsRead(notification)
  }
  ElMessage.info(`查看通知: ${notification.title}`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
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
  const types = {
    announcement: 'primary',
    activity: 'success',
    homework: 'warning',
    holiday: 'info',
    emergency: 'danger',
    health: 'warning'
  }
  return types[type] || 'info'
}

const getTypeIcon = (type: string) => {
  const icons = {
    announcement: 'bell',
    activity: 'calendar',
    homework: 'book',
    holiday: 'sunny',
    emergency: 'warning',
    health: 'heart'
  }
  return icons[type] || 'message'
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

.content-row {
  margin-bottom: 0;
}

.content-card {
  margin-bottom: 0;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .notification-count {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
    }
  }
}

.notification-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);

  .filter-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .filter-right {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.notifications-card {
  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .notification-item {
    padding: var(--spacing-lg);
    border: var(--border-width-base) solid var(--el-border-color-lighter);
    border-radius: var(--radius-md);
    background: var(--el-fill-color-lighter);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-fill-color-light);
    }

    &.unread {
      border-left: 4px solid var(--el-color-primary);
      background: white;
    }

    &.important {
      border-left: 4px solid var(--el-color-danger);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .notification-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .notification-time {
          font-size: var(--text-xs);
          color: var(--el-text-color-placeholder);
        }
      }

      .notification-actions {
        display: flex;
        gap: var(--spacing-xs);

        .delete-button {
          color: var(--danger-color);

          &:hover {
            color: var(--danger-dark);
            background-color: var(--danger-light-bg);
          }
        }
      }
    }

    .notification-content {
      .notification-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--el-text-color-primary);

        .unread-indicator {
          color: var(--el-color-primary);
          font-size: var(--text-lg);
          font-weight: bold;
        }
      }

      .notification-message {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--el-text-color-regular);
        line-height: 1.6;
      }

      .notification-attachments {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .attachments-label {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
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
            padding: var(--spacing-xs) var(--spacing-sm);
            background: var(--el-fill-color);
            border: var(--border-width-base) solid var(--el-border-color-lighter);
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
            transition: all 0.3s ease;

            &:hover {
              background: var(--el-fill-color-light);
              color: var(--el-color-primary);
              border-color: var(--el-color-primary-light-5);
            }
          }
        }
      }
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

.type-stats-card {
  .type-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .type-stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm);

      .stat-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .stat-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;

        .stat-label {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }

        .stat-count {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

.recent-card {
  .recent-notifications {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .recent-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: background-color 0.3s ease;

      &:hover {
        background: var(--el-fill-color-lighter);
      }

      .recent-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--el-border-color);
        flex-shrink: 0;

        &.unread {
          background: var(--el-color-primary);
        }
      }

      .recent-content {
        flex: 1;
        min-width: 0;

        .recent-title {
          font-size: var(--text-sm);
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: var(--spacing-xs);
        }

        .recent-time {
          font-size: var(--text-xs);
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .main-content {
    gap: var(--spacing-xl);
  }

  .notification-filters {
    flex-direction: column;
    align-items: flex-start;

    .filter-left,
    .filter-right {
      width: 100%;
    }

    .filter-right {
      justify-content: flex-end;
    }
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm) !important;
  }

  .notification-attachments {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>