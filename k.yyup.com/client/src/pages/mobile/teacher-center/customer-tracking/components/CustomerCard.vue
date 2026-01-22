<template>
  <div class="mobile-customer-card" @click="handleCardClick">
    <!-- 客户头部信息 -->
    <div class="customer-header">
      <div class="customer-avatar">
        <el-avatar :size="avatarSize">
          {{ customer.name?.charAt(0) || '客' }}
        </el-avatar>
        <div class="online-indicator" :class="customer.onlineStatus"></div>
      </div>

      <div class="customer-basic">
        <div class="customer-name-row">
          <span class="customer-name">{{ customer.name }}</span>
          <el-tag
            :type="getStatusType(customer.status)"
            size="small"
            class="status-tag"
          >
            {{ getStatusText(customer.status) }}
          </el-tag>
        </div>

        <div class="customer-phone">
          <el-icon><Phone /></el-icon>
          <span>{{ customer.phone }}</span>
        </div>

        <div class="last-contact">
          <el-icon><Clock /></el-icon>
          <span>{{ formatLastContact(customer.lastContactTime) }}</span>
        </div>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="quick-actions">
        <el-button
          text
          size="small"
          @click.stop="handlePhoneCall"
          class="action-btn phone-btn"
        >
          <el-icon><Phone /></el-icon>
        </el-button>
        <el-button
          text
          size="small"
          @click.stop="handleSendMessage"
          class="action-btn message-btn"
        >
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 孩子信息 -->
    <div class="child-info">
      <div class="child-header">
        <el-icon><Avatar /></el-icon>
        <span class="child-title">孩子信息</span>
      </div>
      <div class="child-details">
        <div class="child-basic">
          <span class="child-name">{{ customer.childName }}</span>
          <el-tag size="small" class="age-tag">
            {{ customer.childAge }}岁
            {{ customer.childGender === '男' ? '👦' : '👧' }}
          </el-tag>
        </div>
        <div v-if="customer.birthDate" class="child-birth">
          <el-icon><Calendar /></el-icon>
          <span>{{ customer.birthDate }}</span>
        </div>
      </div>
    </div>

    <!-- SOP进度 -->
    <div class="sop-progress">
      <div class="progress-header">
        <div class="stage-info">
          <span class="stage-name">{{ customer.currentStageName || '跟进中' }}</span>
          <el-tag
            :type="getStageType(customer.stageProgress)"
            size="small"
          >
            {{ getStageText(customer.stageProgress) }}
          </el-tag>
        </div>
        <div class="progress-percentage">{{ customer.stageProgress || 0 }}%</div>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width: `${customer.stageProgress || 0}%`,
            backgroundColor: getProgressColor(customer.stageProgress)
          }"
        ></div>
      </div>
    </div>

    <!-- 成功概率和来源信息 -->
    <div class="customer-stats">
      <div class="stat-item probability">
        <div class="stat-header">
          <el-icon><TrendCharts /></el-icon>
          <span class="stat-label">成功概率</span>
        </div>
        <div class="stat-value" :class="getProbabilityClass(customer.successProbability)">
          {{ customer.successProbability || 0 }}%
        </div>
      </div>

      <div class="stat-item source">
        <div class="stat-header">
          <el-icon><Location /></el-icon>
          <span class="stat-label">来源渠道</span>
        </div>
        <div class="stat-value">
          <el-tag
            :type="getSourceType(customer.source)"
            size="small"
          >
            {{ customer.source || '未知' }}
          </el-tag>
        </div>
      </div>

      <div class="stat-item days">
        <div class="stat-header">
          <el-icon><Timer /></el-icon>
          <span class="stat-label">跟进天数</span>
        </div>
        <div class="stat-value">{{ getFollowDays(customer.createTime) }}天</div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="card-footer">
      <el-button
        type="primary"
        size="small"
        @click.stop="handleViewDetail"
        class="detail-btn"
      >
        查看详情
      </el-button>

      <div class="action-group">
        <el-button
          text
          size="small"
          @click.stop="handleAddFollow"
          class="follow-btn"
        >
          <el-icon><Plus /></el-icon>
          跟进
        </el-button>

        <el-dropdown @command="handleMoreAction" trigger="click" @click.stop>
          <el-button text size="small" class="more-btn">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                编辑客户
              </el-dropdown-item>
              <el-dropdown-item command="assign">
                <el-icon><User /></el-icon>
                分配老师
              </el-dropdown-item>
              <el-dropdown-item command="export">
                <el-icon><Download /></el-icon>
                导出资料
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon><Delete /></el-icon>
                删除客户
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ElAvatar,
  ElTag,
  ElButton,
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import {
  Phone,
  Clock,
  Avatar,
  Calendar,
  TrendCharts,
  Location,
  Timer,
  Plus,
  MoreFilled,
  Edit,
  User,
  Download,
  Delete,
  ChatDotRound
} from '@element-plus/icons-vue'

interface Customer {
  id: number
  name: string
  phone: string
  childName: string
  childAge: number
  childGender: string
  birthDate?: string
  source: string
  status: string
  onlineStatus?: 'online' | 'offline' | 'busy'
  currentStageName?: string
  stageProgress: number
  successProbability: number
  lastContactTime?: string
  createTime?: string
}

interface Props {
  customer: Customer;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [customer: Customer];
  phoneCall: [customer: Customer];
  sendMessage: [customer: Customer];
  viewDetail: [customer: Customer];
  addFollow: [customer: Customer];
  edit: [customer: Customer];
  assign: [customer: Customer];
  export: [customer: Customer];
  delete: [customer: Customer];
}>()

const avatarSize = computed(() => {
  return window.innerWidth < 768 ? 48 : 56
})

function handleCardClick() {
  emit('click', props.customer)
}

function handlePhoneCall() {
  emit('phoneCall', props.customer)
}

function handleSendMessage() {
  emit('sendMessage', props.customer)
}

function handleViewDetail() {
  emit('viewDetail', props.customer)
}

function handleAddFollow() {
  emit('addFollow', props.customer)
}

function handleMoreAction(command: string) {
  switch (command) {
    case 'edit':
      emit('edit', props.customer)
      break
    case 'assign':
      emit('assign', props.customer)
      break
    case 'export':
      emit('export', props.customer)
      break
    case 'delete':
      emit('delete', props.customer)
      break
  }
}

function getStatusType(status: string) {
  const typeMap = {
    'potential': 'info',      // 潜在客户
    'contacted': 'warning',   // 已联系
    'interested': 'primary',  // 有意向
    'visiting': 'warning',    // 参观中
    'negotiating': 'success', // 谈判中
    'converted': 'success',   // 已转化
    'lost': 'danger'          // 已流失
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap = {
    'potential': '潜在客户',
    'contacted': '已联系',
    'interested': '有意向',
    'visiting': '参观中',
    'negotiating': '谈判中',
    'converted': '已转化',
    'lost': '已流失'
  }
  return textMap[status] || '未知状态'
}

function getStageType(progress: number) {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'info'
}

function getStageText(progress: number) {
  if (progress >= 80) return '即将完成'
  if (progress >= 50) return '进行中'
  return '刚开始'
}

function getSourceType(source: string) {
  const sourceMap = {
    '官网咨询': 'primary',
    '电话咨询': 'success',
    '朋友推荐': 'warning',
    '线下活动': 'info',
    '其他': ''
  }
  return sourceMap[source] || ''
}

function getProgressColor(progress: number) {
  if (progress >= 80) return '#67C23A'
  if (progress >= 50) return '#E6A23C'
  return '#409EFF'
}

function getProbabilityClass(probability: number) {
  if (probability >= 70) return 'high'
  if (probability >= 40) return 'medium'
  return 'low'
}

function formatLastContact(time?: string) {
  if (!time) return '暂无联系记录'

  const now = new Date()
  const contactTime = new Date(time)
  const diffDays = Math.floor((now.getTime() - contactTime.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return contactTime.toLocaleDateString('zh-CN')
}

function getFollowDays(createTime?: string) {
  if (!createTime) return 0

  const now = new Date()
  const created = new Date(createTime)
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}
</script>

<style scoped lang="scss">
.mobile-customer-card {
  background: white;
  border: 1px solid var(--border-color-lighter);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  // 客户头部
  .customer-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .customer-avatar {
      position: relative;
      flex-shrink: 0;

      .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;

        &.online {
          background-color: var(--success-color);
        }

        &.offline {
          background-color: var(--info-color);
        }

        &.busy {
          background-color: var(--warning-color);
        }
      }
    }

    .customer-basic {
      flex: 1;
      min-width: 0;

      .customer-name-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);

        .customer-name {
          font-size: var(--font-size-large);
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-tag {
          flex-shrink: 0;
        }
      }

      .customer-phone,
      .last-contact {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--font-size-small);
        color: var(--text-secondary);
        margin-bottom: 4px;

        .el-icon {
          font-size: var(--text-sm);
        }
      }
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      flex-shrink: 0;

      .action-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.phone-btn {
          color: var(--success-color);
          background-color: rgba(103, 194, 58, 0.1);
        }

        &.message-btn {
          color: var(--primary-color);
          background-color: rgba(64, 158, 255, 0.1);
        }
      }
    }
  }

  // 孩子信息
  .child-info {
    background: var(--bg-card);
    border-radius: var(--border-radius-base);
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .child-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);

      .el-icon {
        color: var(--primary-color);
        font-size: var(--text-base);
      }

      .child-title {
        font-size: var(--font-size-small);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .child-details {
      .child-basic {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);

        .child-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .age-tag {
          font-size: var(--text-xs);
        }
      }

      .child-birth {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--font-size-small);
        color: var(--text-secondary);

        .el-icon {
          font-size: var(--text-sm);
        }
      }
    }
  }

  // SOP进度
  .sop-progress {
    margin-bottom: var(--spacing-md);

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      .stage-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .stage-name {
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .progress-percentage {
        font-weight: 700;
        color: var(--primary-color);
      }
    }

    .progress-bar {
      height: 6px;
      background: var(--border-color-lighter);
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.3s ease;
      }
    }
  }

  // 统计信息
  .customer-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    .stat-item {
      text-align: center;
      padding: var(--spacing-sm);
      background: var(--bg-card);
      border-radius: var(--border-radius-base);

      .stat-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);

        .el-icon {
          font-size: var(--text-sm);
          color: var(--primary-color);
        }

        .stat-label {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
        }
      }

      .stat-value {
        font-size: var(--font-size-base);
        font-weight: 600;
        color: var(--text-primary);

        &.high {
          color: var(--success-color);
        }

        &.medium {
          color: var(--warning-color);
        }

        &.low {
          color: var(--danger-color);
        }
      }
    }
  }

  // 底部操作区
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color-lighter);

    .detail-btn {
      flex: 1;
      height: 40px;
    }

    .action-group {
      display: flex;
      gap: var(--spacing-sm);
      margin-left: var(--spacing-md);

      .follow-btn,
      .more-btn {
        height: 40px;
        min-width: 60px;
      }
    }
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-customer-card {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);

    .customer-header {
      gap: var(--spacing-sm);

      .customer-basic {
        .customer-name-row {
          .customer-name {
            font-size: var(--font-size-base);
          }
        }
      }

      .quick-actions {
        .action-btn {
          width: 36px;
          height: 36px;
        }
      }
    }

    .customer-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-xs);

      .stat-item {
        padding: var(--spacing-xs);

        .stat-header {
          .stat-label {
            font-size: var(--text-xs);
          }
        }

        .stat-value {
          font-size: var(--font-size-small);
        }
      }
    }

    .card-footer {
      .detail-btn {
        height: 36px;
      }

      .action-group {
        .follow-btn,
        .more-btn {
          height: 36px;
          min-width: 50px;
        }
      }
    }
  }
}
</style>