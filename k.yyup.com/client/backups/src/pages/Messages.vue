<template>
  <div class="messages-container">
    <!-- 页面头部 -->
    <div class="messages-header">
      <div class="header-content">
        <div class="page-title">
          <h1>消息中心</h1>
          <p>统一管理您的所有消息和通知</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleNewMessage">
            <el-icon><Plus /></el-icon>
            新建消息
          </el-button>
        </div>
      </div>
    </div>

    <!-- 消息统计 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon unread">
                <el-icon><Message /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.unreadMessages }}</div>
                <div class="stats-label">未读消息</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon chat">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.activeChats }}</div>
                <div class="stats-label">活跃会话</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon notification">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.notifications }}</div>
                <div class="stats-label">系统通知</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Folder /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.totalMessages }}</div>
                <div class="stats-label">总消息数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 消息分类标签 -->
    <div class="message-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部消息" name="all">
          <template #label>
            <span class="tab-label">
              <el-icon><Message /></el-icon>
              全部消息
              <el-badge v-if="stats.unreadMessages > 0" :value="stats.unreadMessages" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="聊天会话" name="chat">
          <template #label>
            <span class="tab-label">
              <el-icon><ChatDotRound /></el-icon>
              聊天会话
              <el-badge v-if="stats.unreadChats > 0" :value="stats.unreadChats" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="系统通知" name="notification">
          <template #label>
            <span class="tab-label">
              <el-icon><Bell /></el-icon>
              系统通知
              <el-badge v-if="stats.unreadNotifications > 0" :value="stats.unreadNotifications" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="AI助手" name="ai">
          <template #label>
            <span class="tab-label">
              <el-icon><Avatar /></el-icon>
              AI助手
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 消息内容区域 -->
    <div class="messages-content">
      <el-card shadow="never">
        <!-- 筛选工具栏 -->
        <div class="filter-toolbar">
          <el-form :model="filterForm" inline>
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
                <el-option label="全部" value="" />
                <el-option label="未读" value="unread" />
                <el-option label="已读" value="read" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="时间">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <el-form-item label="搜索">
              <el-input
                v-model="filterForm.keyword"
                placeholder="搜索消息内容"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              >
                <template #suffix>
                  <el-icon class="search-icon" @click="handleSearch">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 消息列表 -->
        <div v-loading="loading" class="messages-list">
          <div v-if="messageList.length === 0" class="empty-state">
            <el-empty description="暂无消息">
              <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
            </el-empty>
          </div>
          
          <div v-else class="message-items">
            <div
              v-for="message in messageList"
              :key="message.id"
              class="message-item"
              :class="{ 'unread': message.status === 'unread' }"
              @click="handleViewMessage(message)"
            >
              <div class="message-avatar">
                <el-avatar :size="40">
                  <el-icon v-if="message.type === 'chat'"><ChatDotRound /></el-icon>
                  <el-icon v-else-if="message.type === 'notification'"><Bell /></el-icon>
                  <el-icon v-else-if="message.type === 'ai'"><Avatar /></el-icon>
                  <el-icon v-else><Message /></el-icon>
                </el-avatar>
              </div>
              
              <div class="message-content">
                <div class="message-header">
                  <div class="message-title">
                    <h4>{{ message.title }}</h4>
                    <el-tag :type="getTypeTagType(message.type)" size="small">
                      {{ getTypeText(message.type) }}
                    </el-tag>
                  </div>
                  <div class="message-meta">
                    <span class="message-time">{{ formatDateTime(message.createdAt) }}</span>
                    <el-tag v-if="message.status === 'unread'" type="danger" size="small">
                      未读
                    </el-tag>
                  </div>
                </div>
                
                <div class="message-body">
                  <p class="message-preview">{{ message.content }}</p>
                </div>
                
                <div class="message-footer">
                  <div class="message-sender">
                    <span>来自：{{ message.sender || '系统' }}</span>
                  </div>
                  
                  <div class="message-actions">
                    <el-button
                      v-if="message.status === 'unread'"
                      type="text"
                      size="small"
                      @click.stop="handleMarkRead(message)"
                    >
                      标记已读
                    </el-button>
                    <el-button
                      v-if="message.type === 'chat'"
                      type="text"
                      size="small"
                      @click.stop="handleReply(message)"
                    >
                      回复
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="handleDelete(message)"
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
        <div v-if="messageList.length > 0" class="pagination-wrapper">
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

    <!-- 快捷操作面板 -->
    <div class="quick-actions">
      <el-card shadow="never">
        <template #header>
          <span>快捷操作</span>
        </template>
        
        <div class="action-buttons">
          <el-button @click="handleMarkAllRead" :disabled="stats.unreadMessages === 0">
            <el-icon><Check /></el-icon>
            全部已读
          </el-button>
          
          <el-button @click="handleGoToChat">
            <el-icon><ChatDotRound /></el-icon>
            进入聊天
          </el-button>
          
          <el-button @click="handleGoToNotifications">
            <el-icon><Bell /></el-icon>
            查看通知
          </el-button>
          
          <el-button @click="handleGoToAI">
            <el-icon><Avatar /></el-icon>
            AI助手
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Message, ChatDotRound, Bell, Avatar, Folder, Plus, Refresh, Search, Check
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const activeTab = ref('all')

// 统计数据
const stats = reactive({
  unreadMessages: 8,
  activeChats: 3,
  notifications: 5,
  totalMessages: 45,
  unreadChats: 2,
  unreadNotifications: 3
})

// 筛选表单
const filterForm = reactive({
  status: '',
  dateRange: [],
  keyword: ''
})

// 消息列表
const messageList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 方法
const getTypeText = (type: string) => {
  const typeMap = {
    'chat': '聊天消息',
    'notification': '系统通知',
    'ai': 'AI助手',
    'system': '系统消息'
  }
  return typeMap[type] || '普通消息'
}

const getTypeTagType = (type: string) => {
  const typeMap = {
    'chat': 'primary',
    'notification': 'warning',
    'ai': 'success',
    'system': 'info'
  }
  return typeMap[type] || 'info'
}

const loadMessages = async () => {
  loading.value = true
  try {
    // 模拟消息数据
    const mockData = [
      {
        id: 1,
        type: 'chat',
        title: '来自张老师的消息',
        content: '您好，关于孩子今天在学校的表现，我想和您聊一下...',
        sender: '张老师',
        status: 'unread',
        createdAt: '2024-01-15 14:30:00'
      },
      {
        id: 2,
        type: 'notification',
        title: '系统维护通知',
        content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用...',
        sender: '系统',
        status: 'unread',
        createdAt: '2024-01-15 10:00:00'
      },
      {
        id: 3,
        type: 'ai',
        title: 'AI助手回复',
        content: '根据您的问题，我为您整理了以下建议...',
        sender: 'AI助手',
        status: 'read',
        createdAt: '2024-01-14 16:45:00'
      },
      {
        id: 4,
        type: 'chat',
        title: '来自李园长的消息',
        content: '家长您好，关于下周的家长会安排...',
        sender: '李园长',
        status: 'read',
        createdAt: '2024-01-14 09:20:00'
      }
    ]
    
    messageList.value = mockData
    pagination.total = mockData.length
    
  } catch (error) {
    console.error('加载消息列表失败:', error)
    ElMessage.error('加载消息列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  loadMessages()
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadMessages()
}

const handleReset = () => {
  Object.assign(filterForm, {
    status: '',
    dateRange: [],
    keyword: ''
  })
  handleSearch()
}

const handleRefresh = () => {
  loadMessages()
}

const handleNewMessage = () => {
  ElMessage.info('新建消息功能开发中')
}

const handleViewMessage = (message: any) => {
  // 如果是未读消息，自动标记为已读
  if (message.status === 'unread') {
    handleMarkRead(message)
  }
  
  // 根据消息类型跳转到相应页面
  if (message.type === 'chat') {
    router.push('/chat')
  } else if (message.type === 'notification') {
    router.push('/notifications')
  } else if (message.type === 'ai') {
    router.push('/ai')
  }
}

const handleMarkRead = (message: any) => {
  if (message.status === 'unread') {
    message.status = 'read'
    stats.unreadMessages = Math.max(0, stats.unreadMessages - 1)
    ElMessage.success('已标记为已读')
  }
}

const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有未读消息标记为已读吗？', '确认操作', {
      type: 'warning'
    })
    
    messageList.value.forEach(message => {
      if (message.status === 'unread') {
        message.status = 'read'
      }
    })
    
    stats.unreadMessages = 0
    stats.unreadChats = 0
    stats.unreadNotifications = 0
    
    ElMessage.success('所有消息已标记为已读')
  } catch {
    // 用户取消
  }
}

const handleReply = (message: any) => {
  router.push('/chat')
}

const handleDelete = async (message: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = messageList.value.findIndex(m => m.id === message.id)
    if (index > -1) {
      messageList.value.splice(index, 1)
      pagination.total--
      
      if (message.status === 'unread') {
        stats.unreadMessages = Math.max(0, stats.unreadMessages - 1)
      }
      stats.totalMessages = Math.max(0, stats.totalMessages - 1)
      
      ElMessage.success('消息已删除')
    }
  } catch {
    // 用户取消
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadMessages()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadMessages()
}

const handleGoToChat = () => {
  router.push('/chat')
}

const handleGoToNotifications = () => {
  router.push('/notifications')
}

const handleGoToAI = () => {
  router.push('/ai')
}

// 生命周期
onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss">
.messages-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.messages-header {
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
        
        &.chat {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.notification {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.total {
          background: #f0fdf4;
          color: var(--success-color);
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

.message-tabs {
  margin-bottom: var(--text-3xl);
  
  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .tab-badge {
      margin-left: var(--spacing-xs);
    }
  }
}

.messages-content {
  margin-bottom: var(--text-3xl);
  
  .filter-toolbar {
    margin-bottom: var(--text-2xl);
    padding-bottom: var(--text-lg);
    border-bottom: var(--border-width-base) solid #f3f4f6;
    
    .search-icon {
      cursor: pointer;
      color: var(--text-secondary);
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
  
  .messages-list {
    min-height: 400px;
    
    .message-items {
      .message-item {
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
        
        .message-avatar {
          flex-shrink: 0;
        }
        
        .message-content {
          flex: 1;
          min-width: 0;
          
          .message-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-sm);
            
            .message-title {
              display: flex;
              align-items: center;
              gap: var(--text-sm);
              flex: 1;
              min-width: 0;
              
              h4 {
                font-size: var(--text-lg);
                font-weight: 500;
                color: var(--text-primary);
                margin: 0;
                flex: 1;
                min-width: 0;
              }
            }
            
            .message-meta {
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);
              flex-shrink: 0;
              
              .message-time {
                font-size: var(--text-sm);
                color: var(--text-tertiary);
              }
            }
          }
          
          .message-body {
            margin-bottom: var(--text-sm);
            
            .message-preview {
              color: var(--text-secondary);
              line-height: 1.5;
              margin: 0;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }
          
          .message-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .message-sender {
              font-size: var(--text-sm);
              color: var(--text-tertiary);
            }
            
            .message-actions {
              display: flex;
              gap: var(--spacing-sm);
            }
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

.quick-actions {
  .action-buttons {
    display: flex;
    gap: var(--text-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .messages-container {
    padding: var(--text-lg);
  }
  
  .messages-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .stats-section {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .filter-toolbar {
    .el-form {
      flex-direction: column;
      
      .el-form-item {
        margin-bottom: var(--text-lg);
        margin-right: 0;
      }
    }
  }
  
  .message-item {
    .message-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: flex-start !important;
    }
    
    .message-footer {
      flex-direction: column;
      gap: var(--text-sm);
      align-items: flex-start !important;
    }
  }
  
  .action-buttons {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
