<template>
  <div class="customer-basic-info">
    <!-- 客户基本信息卡片 -->
    <van-card
      :thumb="customer.avatar"
      :title="customer.name"
      :desc="customer.title"
      @click="$emit('customer-click', customer)"
    >
      <template #tags>
        <van-tag
          v-for="tag in customer.tags"
          :key="tag"
          :type="getTagType(tag)"
          size="medium"
          class="customer-tag"
        >
          {{ tag }}
        </van-tag>
      </template>

      <template #price>
        <div class="customer-value">
          <span class="value-label">客户价值</span>
          <span class="value-score">{{ customer.valueScore }}</span>
        </div>
      </template>

      <template #footer>
        <div class="contact-info">
          <div class="contact-item" v-if="customer.phone">
            <van-icon name="phone-o" size="14" />
            <span>{{ customer.phone }}</span>
          </div>
          <div class="contact-item" v-if="customer.email">
            <van-icon name="envelope-o" size="14" />
            <span>{{ customer.email }}</span>
          </div>
        </div>
      </template>
    </van-card>

    <!-- 详细信息 -->
    <div class="detail-sections">
      <!-- 基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell
          title="年龄"
          :value="customer.age ? `${customer.age}岁` : '未知'"
        />
        <van-cell
          title="性别"
          :value="customer.gender || '未知'"
        />
        <van-cell
          title="职业"
          :value="customer.occupation || '未知'"
        />
        <van-cell
          title="来源渠道"
          :value="customer.source || '未知'"
        >
          <template #right-icon>
            <van-tag
              :type="getSourceType(customer.source)"
              size="small"
            >
              {{ getSourceText(customer.source) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 家庭信息 -->
      <van-cell-group inset title="家庭信息" v-if="customer.familyInfo">
        <van-cell
          title="婚姻状况"
          :value="customer.familyInfo.maritalStatus || '未知'"
        />
        <van-cell
          title="子女情况"
          :value="customer.familyInfo.children || '无子女'"
        />
        <van-cell
          title="家庭收入"
          :value="customer.familyInfo.income || '未知'"
        />
        <van-cell
          title="居住区域"
          :value="customer.familyInfo.residence || '未知'"
        />
      </van-cell-group>

      <!-- 需求信息 -->
      <van-cell-group inset title="需求分析" v-if="customer.needs">
        <van-cell
          title="关注重点"
          :value="customer.needs.focus || '未知'"
        />
        <van-cell
          title="预算范围"
          :value="customer.needs.budget || '未知'"
        />
        <van-cell
          title="期望时间"
          :value="customer.needs.timeline || '未知'"
        />
        <van-cell
          title="特殊要求"
          :value="customer.needs.special || '无'"
        />
      </van-cell-group>

      <!-- 活动记录 -->
      <van-cell-group inset title="活动记录" v-if="customer.activities?.length">
        <van-cell
          v-for="activity in customer.activities.slice(0, 3)"
          :key="activity.id"
          :title="activity.title"
          :label="activity.description"
          :value="formatDate(activity.date)"
          :is-link="true"
          @click="$emit('activity-click', activity)"
        />
        <van-cell
          v-if="customer.activities.length > 3"
          title="查看更多活动"
          is-link
          @click="$emit('view-all-activities')"
        />
      </van-cell-group>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-grid :column-num="4" :gutter="12">
        <van-grid-item
          v-for="action in actionButtons"
          :key="action.type"
          :icon="action.icon"
          :text="action.text"
          @click="$emit('action-click', action.type)"
        />
      </van-grid>
    </div>

    <!-- 状态指示器 -->
    <div class="status-indicators">
      <div class="status-item">
        <van-icon name="contact" size="16" />
        <span>{{ getStatusText(customer.status) }}</span>
      </div>
      <div class="status-item" v-if="customer.priority">
        <van-icon name="star" size="16" />
        <span>{{ getPriorityText(customer.priority) }}</span>
      </div>
      <div class="status-item" v-if="customer.followUpDate">
        <van-icon name="clock-o" size="16" />
        <span>跟进: {{ formatDate(customer.followUpDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FamilyInfo {
  maritalStatus?: string
  children?: string
  income?: string
  residence?: string
}

interface Needs {
  focus?: string
  budget?: string
  timeline?: string
  special?: string
}

interface Activity {
  id: string
  title: string
  description: string
  date: string | Date
}

interface Customer {
  id: string | number
  name: string
  avatar?: string
  title?: string
  phone?: string
  email?: string
  age?: number
  gender?: string
  occupation?: string
  source?: string
  status?: string
  priority?: string
  valueScore?: number
  followUpDate?: string | Date
  tags?: string[]
  familyInfo?: FamilyInfo
  needs?: Needs
  activities?: Activity[]
}

interface Props {
  customer: Customer
  showActions?: boolean
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showDetails: true
})

const emit = defineEmits<{
  'customer-click': [customer: Customer]
  'activity-click': [activity: Activity]
  'view-all-activities': []
  'action-click': [actionType: string]
}>()

// 操作按钮配置
const actionButtons = computed(() => [
  {
    type: 'call',
    icon: 'phone-o',
    text: '拨打电话'
  },
  {
    type: 'message',
    icon: 'chat-o',
    text: '发送消息'
  },
  {
    type: 'schedule',
    icon: 'calendar-o',
    text: '预约跟进'
  },
  {
    type: 'note',
    icon: 'edit',
    text: '添加备注'
  }
])

// 方法
const getTagType = (tag: string): string => {
  const tagTypeMap: Record<string, string> = {
    '高价值': 'success',
    '新客户': 'primary',
    '活跃': 'success',
    '沉睡': 'warning',
    '流失': 'danger',
    '重点': 'success',
    '一般': 'default'
  }
  return tagTypeMap[tag] || 'default'
}

const getSourceType = (source?: string): string => {
  const sourceTypeMap: Record<string, string> = {
    '线上广告': 'primary',
    '线下活动': 'success',
    '转介绍': 'success',
    '自然到访': 'default',
    '电话咨询': 'warning',
    '社交媒体': 'primary'
  }
  return sourceTypeMap[source || ''] || 'default'
}

const getSourceText = (source?: string): string => {
  const sourceTextMap: Record<string, string> = {
    '线上广告': '线上',
    '线下活动': '活动',
    '转介绍': '推荐',
    '自然到访': '自访',
    '电话咨询': '电话',
    '社交媒体': '社媒'
  }
  return sourceTextMap[source || ''] || '未知'
}

const getStatusText = (status?: string): string => {
  const statusMap: Record<string, string> = {
    'new': '新客户',
    'active': '活跃',
    'following': '跟进中',
    'sleeping': '沉睡',
    'lost': '流失',
    'converted': '已转化'
  }
  return statusMap[status || ''] || '未知状态'
}

const getPriorityText = (priority?: string): string => {
  const priorityMap: Record<string, string> = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return priorityMap[priority || ''] || '普通'
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.customer-basic-info {
  .customer-tag {
    margin-right: var(--van-padding-xs);
  }

  .customer-value {
    display: flex;
    align-items: center;
    gap: var(--van-padding-xs);

    .value-label {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
    }

    .value-score {
      font-size: var(--van-font-size-md);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-warning-color);
    }
  }

  .contact-info {
    display: flex;
    gap: var(--van-padding-md);

    .contact-item {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);

      .van-icon {
        color: var(--van-primary-color);
      }
    }
  }

  .detail-sections {
    margin: var(--van-padding-md) 0;

    .van-cell-group {
      margin-bottom: var(--van-padding-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .action-buttons {
    margin: var(--van-padding-md) 0;
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
  }

  .status-indicators {
    display: flex;
    justify-content: space-around;
    background: var(--van-background-color-light);
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-sm);
    margin-top: var(--van-padding-md);

    .status-item {
      display: flex;
      align-items: center;
      gap: var(--van-padding-xs);
      font-size: var(--van-font-size-xs);
      color: var(--van-text-color-2);

      .van-icon {
        color: var(--van-primary-color);
      }
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .customer-basic-info {
    .action-buttons,
    .status-indicators {
      background: var(--van-background-color-dark);
    }
  }
}

// 小屏幕适配
@media (max-width: 375px) {
  .customer-basic-info {
    .contact-info {
      flex-direction: column;
      gap: var(--van-padding-xs);

      .contact-item {
        justify-content: center;
      }
    }

    .status-indicators {
      flex-direction: column;
      gap: var(--van-padding-xs);
      align-items: center;
    }
  }
}
</style>