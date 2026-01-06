<template>
  <div class="notifications-container">
    <!-- 页面头部 -->
    <div class="notifications-header">
      <div class="header-content">
        <div class="page-title">
          <h1>通知管理</h1>
          <p>管理系统通知和消息</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleMarkAllRead">
            <el-icon><Check /></el-icon>
            全部已读
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="canApproveApplication ? 4 : 6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon unread">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.unread }}</div>
                <div class="stats-label">未读通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="canApproveApplication ? 4 : 6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Message /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.total }}</div>
                <div class="stats-label">总通知数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- 待审批统计（只对园长和管理员显示） -->
        <el-col v-if="canApproveApplication" :span="4">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.pending }}</div>
                <div class="stats-label">待审批</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="canApproveApplication ? 4 : 6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon system">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.system }}</div>
                <div class="stats-label">系统通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="canApproveApplication ? 4 : 6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon activity">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.activity }}</div>
                <div class="stats-label">活动通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="canApproveApplication ? 4 : 6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon today">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.today }}</div>
                <div class="stats-label">今日通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Tab切换（园长专用） -->
    <div v-if="canApproveApplication" class="tab-section">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我的通知" name="my-notifications">
          <template #label>
            <span class="tab-label">
              <el-icon><Bell /></el-icon>
              我的通知
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="通知统计" name="statistics">
          <template #label>
            <span class="tab-label">
              <el-icon><DataAnalysis /></el-icon>
              通知统计
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 筛选区域 -->
    <div v-if="activeTab === 'my-notifications'" class="filter-section">
      <el-card shadow="never">
        <el-form :model="filterForm" inline>
          <el-form-item label="通知类型">
            <el-select v-model="filterForm.type" placeholder="选择类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="系统通知" value="SYSTEM" />
              <el-option label="活动通知" value="ACTIVITY" />
              <el-option label="日程通知" value="SCHEDULE" />
              <el-option label="消息通知" value="MESSAGE" />
              <el-option v-if="canApproveApplication" label="客户申请" value="CUSTOMER_APPLICATION" />
            </el-select>
          </el-form-item>

          <el-form-item label="阅读状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="未读" value="UNREAD" />
              <el-option label="已读" value="READ" />
            </el-select>
          </el-form-item>

          <el-form-item label="关键词">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索标题或内容"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 我的通知列表 -->
    <div v-if="activeTab === 'my-notifications'" class="notifications-list">
      <el-card shadow="never">
        <div v-loading="loading" class="list-content">
          <div v-if="notifications.length === 0" class="empty-state">
            <el-empty description="暂无通知">
              <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
            </el-empty>
          </div>

          <div v-else class="notification-items">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': notification.status === 'UNREAD' }"
              @click="handleViewNotification(notification)"
            >
              <div class="notification-icon">
                <el-icon v-if="notification.type === 'SYSTEM'" class="icon-system">
                  <Setting />
                </el-icon>
                <el-icon v-else-if="notification.type === 'ACTIVITY'" class="icon-activity">
                  <Calendar />
                </el-icon>
                <el-icon v-else-if="notification.type === 'SCHEDULE'" class="icon-schedule">
                  <Clock />
                </el-icon>
                <el-icon v-else class="icon-message">
                  <Message />
                </el-icon>
              </div>

              <div class="notification-content">
                <div class="notification-header">
                  <h4 class="notification-title">{{ notification.title }}</h4>
                  <div class="notification-meta">
                    <el-tag :type="getTypeTagType(notification.type)" size="small">
                      {{ getTypeText(notification.type) }}
                    </el-tag>
                    <span class="notification-time">{{ formatDateTime(notification.createdAt) }}</span>
                  </div>
                </div>

                <div class="notification-body">
                  <p class="notification-text">{{ notification.content }}</p>
                </div>

                <div class="notification-footer">
                  <div class="notification-status">
                    <el-tag v-if="notification.status === 'UNREAD'" type="danger" size="small">
                      未读
                    </el-tag>
                    <el-tag v-else type="success" size="small">
                      已读
                    </el-tag>
                  </div>

                  <div class="notification-actions">
                    <!-- 客户申请审批按钮（只对园长和管理员显示） -->
                    <el-button
                      v-if="canApproveApplication && notification.sourceType === 'customer_application' && notification.sourceId"
                      type="primary"
                      size="small"
                      @click.stop="handleReviewApplication(notification)"
                    >
                      审批
                    </el-button>
                    <el-button
                      v-if="notification.status === 'UNREAD'"
                      type="text"
                      size="small"
                      @click.stop="handleMarkRead(notification)"
                    >
                      标记已读
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="handleDelete(notification)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="notifications.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知统计列表（园长专用） -->
    <div v-if="activeTab === 'statistics'" class="statistics-list">
      <el-card shadow="never">
        <!-- 统计筛选 -->
        <div class="stats-filter">
          <el-form :model="statsFilterForm" inline>
            <el-form-item label="通知类型">
              <el-select v-model="statsFilterForm.type" placeholder="选择类型" clearable>
                <el-option label="全部" value="" />
                <el-option label="系统通知" value="SYSTEM" />
                <el-option label="活动通知" value="ACTIVITY" />
                <el-option label="日程通知" value="SCHEDULE" />
                <el-option label="消息通知" value="MESSAGE" />
              </el-select>
            </el-form-item>

            <el-form-item label="日期范围">
              <el-date-picker
                v-model="statsFilterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
              />
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="statsFilterForm.keyword"
                placeholder="搜索标题"
                clearable
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleStatsSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleStatsReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 统计表格 -->
        <el-table
          v-loading="statsLoading"
          :data="statisticsList"
          style="width: 100%"
          class="stats-table"
        >
          <el-table-column prop="title" label="通知标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="senderName" label="发送人" width="120" />
          <el-table-column prop="sendAt" label="发送时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.sendAt) }}
            </template>
          </el-table-column>
          <el-table-column label="接收情况" width="350">
            <template #default="{ row }">
              <div class="recipients-info">
                <div class="recipients-text">
                  总数: <span class="num-total">{{ row.totalRecipients }}</span> |
                  已读: <span class="num-read">{{ row.readRecipients }}</span> |
                  未读: <span class="num-unread">{{ row.unreadRecipients }}</span>
                </div>
                <el-progress
                  :percentage="row.readRate"
                  :color="getProgressColor(row.readRate)"
                  :stroke-width="8"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleViewReadDetails(row)">
                查看详情
              </el-button>
              <el-button size="small" @click="handleExportReport(row)">
                导出
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div v-if="statisticsList.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="statsPagination.currentPage"
            v-model:page-size="statsPagination.pageSize"
            :total="statsPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleStatsSizeChange"
            @current-change="handleStatsCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="通知详情"
      width="600px"
      @close="handleDialogClose"
    >
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-header">
          <h3>{{ currentNotification.title }}</h3>
          <div class="detail-meta">
            <el-tag :type="getTypeTagType(currentNotification.type)">
              {{ getTypeText(currentNotification.type) }}
            </el-tag>
            <span class="detail-time">{{ formatDateTime(currentNotification.createdAt) }}</span>
          </div>
        </div>
        
        <div class="detail-content">
          <p>{{ currentNotification.content }}</p>
        </div>
        
        <div class="detail-footer">
          <div class="detail-status">
            <span>状态：</span>
            <el-tag :type="currentNotification.status === 'UNREAD' ? 'danger' : 'success'">
              {{ currentNotification.status === 'UNREAD' ? '未读' : '已读' }}
            </el-tag>
          </div>
          
          <div v-if="currentNotification.readAt" class="detail-read-time">
            <span>阅读时间：{{ formatDateTime(currentNotification.readAt) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentNotification && currentNotification.status === 'UNREAD'"
            type="primary"
            @click="handleMarkReadAndClose"
          >
            标记已读
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 客户申请审批对话框 -->
    <ApplicationReviewDialog
      v-model="reviewDialogVisible"
      :application="currentApplication"
      @success="handleReviewSuccess"
    />

    <!-- 阅读详情对话框（园长专用） -->
    <el-dialog
      v-model="readDetailsDialogVisible"
      title="通知阅读详情"
      width="900px"
      @close="handleReadDetailsDialogClose"
    >
      <div v-if="currentStatNotification" class="read-details-content">
        <!-- 通知信息 -->
        <div class="notification-info">
          <h3>{{ currentStatNotification.title }}</h3>
          <div class="info-meta">
            <el-tag :type="getTypeTagType(currentStatNotification.type)">
              {{ getTypeText(currentStatNotification.type) }}
            </el-tag>
            <span class="info-time">发送时间：{{ formatDateTime(currentStatNotification.sendAt) }}</span>
            <span class="info-sender">发送人：{{ currentStatNotification.senderName }}</span>
          </div>
          <div class="info-stats">
            <div class="stat-item">
              <span class="stat-label">总接收人数：</span>
              <span class="stat-value total">{{ currentStatNotification.totalRecipients }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已读人数：</span>
              <span class="stat-value read">{{ currentStatNotification.readRecipients }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">未读人数：</span>
              <span class="stat-value unread">{{ currentStatNotification.unreadRecipients }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">阅读率：</span>
              <span class="stat-value rate">{{ currentStatNotification.readRate }}%</span>
            </div>
          </div>
        </div>

        <!-- Tab切换：已读/未读用户 -->
        <el-tabs v-model="readDetailsTab" class="read-details-tabs">
          <el-tab-pane label="已读用户" name="read">
            <template #label>
              <span class="tab-label">
                已读用户 ({{ currentStatNotification.readRecipients }})
              </span>
            </template>
            <el-table
              v-loading="readDetailsLoading"
              :data="readUsersList"
              style="width: 100%"
              max-height="400"
            >
              <el-table-column prop="userName" label="姓名" width="120" />
              <el-table-column prop="userRole" label="角色" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.userRole }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="department" label="部门" width="150" />
              <el-table-column prop="readAt" label="阅读时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.readAt) }}
                </template>
              </el-table-column>
              <el-table-column label="阅读时长" width="120">
                <template #default="{ row }">
                  {{ getReadDuration(row.readAt, currentStatNotification.sendAt) }}
                </template>
              </el-table-column>
            </el-table>

            <!-- 已读用户分页 -->
            <div v-if="readUsersList.length > 0" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="readUsersPagination.currentPage"
                v-model:page-size="readUsersPagination.pageSize"
                :total="readUsersPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleReadUsersSizeChange"
                @current-change="handleReadUsersCurrentChange"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="未读用户" name="unread">
            <template #label>
              <span class="tab-label">
                未读用户 ({{ currentStatNotification.unreadRecipients }})
              </span>
            </template>
            <el-table
              v-loading="readDetailsLoading"
              :data="unreadUsersList"
              style="width: 100%"
              max-height="400"
            >
              <el-table-column prop="userName" label="姓名" width="120" />
              <el-table-column prop="userRole" label="角色" width="100">
                <template #default="{ row }">
                  <el-tag size="small" type="warning">{{ row.userRole }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="department" label="部门" width="150" />
              <el-table-column label="未读时长" width="120">
                <template #default="{ row }">
                  {{ getUnreadDuration(currentStatNotification.sendAt) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default>
                  <el-tag type="danger" size="small">未读</el-tag>
                </template>
              </el-table-column>
            </el-table>

            <!-- 未读用户分页 -->
            <div v-if="unreadUsersList.length > 0" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="unreadUsersPagination.currentPage"
                v-model:page-size="unreadUsersPagination.pageSize"
                :total="unreadUsersPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleUnreadUsersSizeChange"
                @current-change="handleUnreadUsersCurrentChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="readDetailsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleExportReadDetails">
            <el-icon><Download /></el-icon>
            导出详情
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell, Message, Setting, Calendar, Clock, Search, Refresh, Check, DocumentChecked,
  DataAnalysis, Download
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'
import { useUserStore } from '@/stores/user'
import { customerApplicationApi, type CustomerApplication } from '@/api/endpoints/customer-application'
import { notificationCenterApi } from '@/api/endpoints/notification-center'
import ApplicationReviewDialog from '@/components/notifications/ApplicationReviewDialog.vue'

// 用户store
const userStore = useUserStore()

// 是否可以审批申请（园长和管理员）
const canApproveApplication = computed(() => {
  const role = userStore.userRole
  return role === 'principal' || role === 'admin'
})

// Tab切换
const activeTab = ref('my-notifications')

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const currentNotification = ref(null)
const reviewDialogVisible = ref(false)
const currentApplication = ref<CustomerApplication | null>(null)

// 统计相关数据
const statsLoading = ref(false)
const statisticsList = ref([])
const statsFilterForm = reactive({
  type: '',
  dateRange: null,
  keyword: ''
})
const statsPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 阅读详情对话框
const readDetailsDialogVisible = ref(false)
const readDetailsLoading = ref(false)
const readDetailsTab = ref('read')
const currentStatNotification = ref(null)
const readUsersList = ref([])
const unreadUsersList = ref([])
const readUsersPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const unreadUsersPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const stats = reactive({
  unread: 0,
  total: 0,
  pending: 0,  // 待审批数量
  system: 0,
  activity: 0,
  today: 0  // 今日通知
})

// 筛选表单
const filterForm = reactive({
  type: '',
  status: '',
  keyword: ''
})

// 通知列表
const notifications = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 方法
const getTypeText = (type: string) => {
  const typeMap = {
    'SYSTEM': '系统通知',
    'ACTIVITY': '活动通知',
    'SCHEDULE': '日程通知',
    'MESSAGE': '消息通知',
    'CUSTOMER_APPLICATION': '客户申请'
  }
  return typeMap[type] || '其他'
}

const getTypeTagType = (type: string) => {
  const typeMap = {
    'SYSTEM': 'info',
    'ACTIVITY': 'success',
    'SCHEDULE': 'warning',
    'MESSAGE': 'primary',
    'CUSTOMER_APPLICATION': 'warning'
  }
  return typeMap[type] || 'info'
}

const loadStats = async () => {
  try {
    // 模拟统计数据
    stats.unread = 5
    stats.total = 23
    stats.system = 8
    stats.activity = 15
    stats.today = 3

    // 如果是园长或管理员，加载待审批统计
    if (canApproveApplication.value) {
      try {
        const appStats = await customerApplicationApi.getApplicationStats()
        stats.pending = appStats.data?.pending || 0
      } catch (error) {
        console.error('加载待审批统计失败:', error)
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    // 模拟通知数据
    const mockData = [
      {
        id: 1,
        title: '系统维护通知',
        content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用，请提前做好准备。',
        type: 'SYSTEM',
        status: 'UNREAD',
        createdAt: '2024-01-15 10:30:00',
        readAt: null
      },
      {
        id: 2,
        title: '新学期活动安排',
        content: '新学期即将开始，我们为孩子们准备了丰富多彩的活动，请家长关注相关通知。',
        type: 'ACTIVITY',
        status: 'read',
        createdAt: '2024-01-14 15:20:00',
        readAt: '2024-01-14 16:00:00'
      },
      {
        id: 3,
        title: '家长会通知',
        content: '本周五下午2点将举行家长会，请各位家长准时参加。',
        type: 'SCHEDULE',
        status: 'UNREAD',
        createdAt: '2024-01-13 09:15:00',
        readAt: null
      }
    ]
    
    notifications.value = mockData
    pagination.total = mockData.length
    
  } catch (error) {
    console.error('加载通知列表失败:', error)
    ElMessage.error('加载通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadNotifications()
}

const handleReset = () => {
  Object.assign(filterForm, {
    type: '',
    status: '',
    keyword: ''
  })
  handleSearch()
}

const handleRefresh = () => {
  loadStats()
  loadNotifications()
}

const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有未读通知标记为已读吗？', '确认操作', {
      type: 'warning'
    })
    
    // 模拟标记所有已读
    notifications.value.forEach(notification => {
      if (notification.status === 'UNREAD') {
        notification.status = 'read'
        notification.readAt = new Date().toISOString()
      }
    })
    
    stats.unread = 0
    ElMessage.success('所有通知已标记为已读')
  } catch {
    // 用户取消
  }
}

const handleViewNotification = (notification: any) => {
  currentNotification.value = notification
  dialogVisible.value = true
  
  // 如果是未读通知，自动标记为已读
  if (notification.status === 'UNREAD') {
    handleMarkRead(notification)
  }
}

const handleMarkRead = (notification: any) => {
  if (notification.status === 'UNREAD') {
    notification.status = 'read'
    notification.readAt = new Date().toISOString()
    stats.unread = Math.max(0, stats.unread - 1)
    ElMessage.success('已标记为已读')
  }
}

const handleMarkReadAndClose = () => {
  if (currentNotification.value) {
    handleMarkRead(currentNotification.value)
  }
  dialogVisible.value = false
}

const handleDelete = async (notification: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      pagination.total--
      
      if (notification.status === 'UNREAD') {
        stats.unread = Math.max(0, stats.unread - 1)
      }
      stats.total = Math.max(0, stats.total - 1)
      
      ElMessage.success('通知已删除')
    }
  } catch {
    // 用户取消
  }
}

// 处理审批申请
const handleReviewApplication = async (notification: any) => {
  try {
    // 根据通知的sourceId获取申请详情
    const applicationId = notification.sourceId
    if (!applicationId) {
      ElMessage.error('无法获取申请信息')
      return
    }

    // 加载申请详情
    const response = await customerApplicationApi.getApplicationDetail(applicationId)
    currentApplication.value = response.data
    reviewDialogVisible.value = true
  } catch (error: any) {
    console.error('加载申请详情失败:', error)
    ElMessage.error(error.message || '加载申请详情失败')
  }
}

// 审批成功后的回调
const handleReviewSuccess = () => {
  // 刷新通知列表和统计数据
  loadNotifications()
  loadStats()
  ElMessage.success('审批成功')
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadNotifications()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadNotifications()
}

const handleDialogClose = () => {
  currentNotification.value = null
}

// Tab切换处理
const handleTabChange = (tabName: string) => {
  if (tabName === 'statistics') {
    loadStatistics()
  }
}

// 加载通知统计列表
const loadStatistics = async () => {
  statsLoading.value = true
  try {
    const params = {
      page: statsPagination.currentPage,
      pageSize: statsPagination.pageSize,
      type: statsFilterForm.type || undefined,
      startDate: statsFilterForm.dateRange?.[0] || undefined,
      endDate: statsFilterForm.dateRange?.[1] || undefined,
      keyword: statsFilterForm.keyword || undefined
    }

    const response = await notificationCenterApi.getNotificationStatistics(params)

    if (response.success && response.data) {
      statisticsList.value = response.data.items
      statsPagination.total = response.data.total
    } else {
      ElMessage.error(response.message || '加载统计数据失败')
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error(error.message || '加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

// 统计筛选
const handleStatsSearch = () => {
  statsPagination.currentPage = 1
  loadStatistics()
}

const handleStatsReset = () => {
  Object.assign(statsFilterForm, {
    type: '',
    dateRange: null,
    keyword: ''
  })
  handleStatsSearch()
}

const handleStatsSizeChange = (size: number) => {
  statsPagination.pageSize = size
  loadStatistics()
}

const handleStatsCurrentChange = (page: number) => {
  statsPagination.currentPage = page
  loadStatistics()
}

// 查看阅读详情
const handleViewReadDetails = async (row: any) => {
  currentStatNotification.value = row
  readDetailsDialogVisible.value = true
  readDetailsTab.value = 'read'

  // 加载阅读详情
  await loadReadDetails()
}

// 加载阅读详情
const loadReadDetails = async () => {
  if (!currentStatNotification.value) return

  readDetailsLoading.value = true
  try {
    const notificationId = currentStatNotification.value.notificationId

    // 加载已读用户
    const readParams = {
      status: 'read' as const,
      page: readUsersPagination.currentPage,
      pageSize: readUsersPagination.pageSize
    }
    const readResponse = await notificationCenterApi.getNotificationReaders(notificationId, readParams)

    if (readResponse.success && readResponse.data) {
      readUsersList.value = readResponse.data.readers
      readUsersPagination.total = readResponse.data.total
    }

    // 加载未读用户
    const unreadParams = {
      status: 'unread' as const,
      page: unreadUsersPagination.currentPage,
      pageSize: unreadUsersPagination.pageSize
    }
    const unreadResponse = await notificationCenterApi.getNotificationReaders(notificationId, unreadParams)

    if (unreadResponse.success && unreadResponse.data) {
      unreadUsersList.value = unreadResponse.data.readers
      unreadUsersPagination.total = unreadResponse.data.total
    }
  } catch (error: any) {
    console.error('加载阅读详情失败:', error)
    ElMessage.error(error.message || '加载阅读详情失败')
  } finally {
    readDetailsLoading.value = false
  }
}

// 已读用户分页
const handleReadUsersSizeChange = (size: number) => {
  readUsersPagination.pageSize = size
  loadReadDetails()
}

const handleReadUsersCurrentChange = (page: number) => {
  readUsersPagination.currentPage = page
  loadReadDetails()
}

// 未读用户分页
const handleUnreadUsersSizeChange = (size: number) => {
  unreadUsersPagination.pageSize = size
  loadReadDetails()
}

const handleUnreadUsersCurrentChange = (page: number) => {
  unreadUsersPagination.currentPage = page
  loadReadDetails()
}

// 关闭阅读详情对话框
const handleReadDetailsDialogClose = () => {
  currentStatNotification.value = null
  readUsersList.value = []
  unreadUsersList.value = []
}

// 导出阅读报告
const handleExportReport = (row: any) => {
  ElMessage.info(`导出通知"${row.title}"的阅读报告`)
  // TODO: 实现导出功能
}

// 导出阅读详情
const handleExportReadDetails = () => {
  if (currentStatNotification.value) {
    ElMessage.info(`导出通知"${currentStatNotification.value.title}"的详细阅读情况`)
    // TODO: 实现导出功能
  }
}

// 进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) {
    return 'var(--danger-color)'
  } else if (percentage < 80) {
    return 'var(--warning-color)'
  } else {
    return 'var(--success-color)'
  }
}

// 计算阅读时长
const getReadDuration = (readAt: string, sendAt: string) => {
  const readTime = new Date(readAt).getTime()
  const sendTime = new Date(sendAt).getTime()
  const duration = readTime - sendTime

  const minutes = Math.floor(duration / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天${hours % 24}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 计算未读时长
const getUnreadDuration = (sendAt: string) => {
  const sendTime = new Date(sendAt).getTime()
  const now = new Date().getTime()
  const duration = now - sendTime

  const minutes = Math.floor(duration / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    return `${minutes}分钟`
  }
}

// 生命周期
onMounted(() => {
  loadStats()
  loadNotifications()
})
</script>

<style lang="scss">
.notifications-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.notifications-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.stats-section {
  margin-bottom: var(--text-3xl);
  
  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .stats-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.unread {
          background: #fef2f2;
          color: var(--danger-color);
        }
        
        &.total {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.system {
          background: #f3f4f6;
          color: var(--text-secondary);
        }
        
        &.activity {
          background: #f0fdf4;
          color: var(--success-color);
        }

        &.pending {
          background: #fef3c7;
          color: var(--warning-color);
        }

        &.today {
          background: #ede9fe;
          color: var(--ai-primary);
        }
      }

      .stats-info {
        .stats-number {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
        }
        
        .stats-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: var(--text-3xl);
}

.notifications-list {
  .list-content {
    min-height: 400px;
  }
  
  .notification-items {
    .notification-item {
      display: flex;
      gap: var(--text-lg);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      margin-bottom: var(--text-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
      }
      
      &.unread {
        background: #fefefe;
        border-left: var(--spacing-xs) solid var(--primary-color);
      }
      
      .notification-icon {
        flex-shrink: 0;
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .icon-system {
          color: var(--text-secondary);
        }
        
        .icon-activity {
          color: var(--success-color);
        }
        
        .icon-schedule {
          color: var(--warning-color);
        }
        
        .icon-message {
          color: var(--primary-color);
        }
      }
      
      .notification-content {
        flex: 1;
        min-width: 0;
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-sm);
          
          .notification-title {
            font-size: var(--text-lg);
            font-weight: 500;
            color: var(--text-primary);
            margin: 0;
            flex: 1;
            min-width: 0;
          }
          
          .notification-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            flex-shrink: 0;
            
            .notification-time {
              font-size: var(--text-sm);
              color: var(--text-tertiary);
            }
          }
        }
        
        .notification-body {
          margin-bottom: var(--text-sm);
          
          .notification-text {
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        
        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .notification-actions {
            display: flex;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }
}

.pagination-wrapper {
  margin-top: var(--text-3xl);
  display: flex;
  justify-content: center;
}

.notification-detail {
  .detail-header {
    margin-bottom: var(--text-2xl);
    
    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-sm) 0;
    }
    
    .detail-meta {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      
      .detail-time {
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }
  }
  
  .detail-content {
    margin-bottom: var(--text-2xl);
    
    p {
      color: var(--color-gray-700);
      line-height: 1.6;
      margin: 0;
    }
  }
  
  .detail-footer {
    padding-top: var(--text-lg);
    border-top: var(--border-width-base) solid #f3f4f6;
    
    .detail-status {
      margin-bottom: var(--spacing-sm);
      
      span {
        color: var(--text-secondary);
        margin-right: var(--spacing-sm);
      }
    }
    
    .detail-read-time {
      font-size: var(--text-base);
      color: var(--text-tertiary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.tab-section {
  margin-bottom: var(--text-3xl);

  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    font-size: var(--text-base);
  }
}

.statistics-list {
  .stats-filter {
    margin-bottom: var(--text-2xl);
  }

  .stats-table {
    .recipients-info {
      .recipients-text {
        font-size: var(--text-sm);
        color: var(--text-regular);
        margin-bottom: var(--spacing-sm);

        .num-total {
          color: var(--primary-color);
          font-weight: 600;
        }

        .num-read {
          color: var(--success-color);
          font-weight: 600;
        }

        .num-unread {
          color: var(--danger-color);
          font-weight: 600;
        }
      }
    }
  }
}

.read-details-content {
  .notification-info {
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-2xl);

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-sm) 0;
    }

    .info-meta {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      margin-bottom: var(--text-lg);

      .info-time,
      .info-sender {
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }

    .info-stats {
      display: flex;
      gap: var(--text-3xl);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;

          &.total {
            color: var(--primary-color);
          }

          &.read {
            color: var(--success-color);
          }

          &.unread {
            color: var(--danger-color);
          }

          &.rate {
            color: var(--warning-color);
          }
        }
      }
    }
  }

  .read-details-tabs {
    .tab-label {
      font-size: var(--text-base);
      font-weight: 500;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .notifications-container {
    padding: var(--text-lg);
  }

  .notifications-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .stats-section {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }

  .notification-item {
    .notification-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: flex-start !important;
    }

    .notification-footer {
      flex-direction: column;
      gap: var(--text-sm);
      align-items: flex-start !important;
    }
  }

  .read-details-content {
    .notification-info {
      .info-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }

      .info-stats {
        flex-direction: column;
        gap: var(--text-sm);
      }
    }
  }
}
</style>
