<template>
  <div class="mobile-customer-info-card">
    <van-cell-group inset class="info-card" v-loading="loading">
      <!-- 卡片头部 -->
      <template #title>
        <div class="card-header">
          <van-icon name="contact" />
          <span class="header-title">客户信息</span>
          <van-tag
            v-if="customer?.status"
            :type="getStatusTagType(customer.status)"
            class="status-tag"
          >
            {{ getStatusText(customer.status) }}
          </van-tag>
        </div>
      </template>

      <div v-if="customer" class="customer-info">
        <!-- 基本信息 -->
        <van-cell center>
          <template #title>
            <div class="info-label">客户姓名</div>
          </template>
          <template #value>
            <div class="info-value primary">{{ customer.name }}</div>
          </template>
          <template #icon>
            <van-icon name="manager-o" color="#1989fa" />
          </template>
        </van-cell>

        <van-cell center>
          <template #title>
            <div class="info-label">联系电话</div>
          </template>
          <template #value>
            <div class="info-value">
              <a :href="`tel:${customer.phone}`" class="phone-link">
                {{ customer.phone }}
                <van-icon name="phone-o" size="14" />
              </a>
            </div>
          </template>
          <template #icon>
            <van-icon name="phone-o" color="#07c160" />
          </template>
        </van-cell>

        <van-cell center>
          <template #title>
            <div class="info-label">孩子信息</div>
          </template>
          <template #value>
            <div class="info-value">
              {{ customer.childName }}
              <span class="child-detail">({{ customer.childAge }}岁 {{ customer.childGender }})</span>
            </div>
          </template>
          <template #icon>
            <van-icon name="friends-o" color="#ff6034" />
          </template>
        </van-cell>

        <van-cell center>
          <template #title>
            <div class="info-label">来源渠道</div>
          </template>
          <template #value>
            <van-tag
              :type="getSourceTagType(customer.source)"
              size="medium"
            >
              {{ customer.source }}
            </van-tag>
          </template>
          <template #icon>
            <van-icon name="location-o" color="#ff976a" />
          </template>
        </van-cell>

        <van-cell center>
          <template #title>
            <div class="info-label">创建时间</div>
          </template>
          <template #value>
            <div class="info-value time">{{ formatDate(customer.createdAt) }}</div>
          </template>
          <template #icon>
            <van-icon name="clock-o" color="#909399" />
          </template>
        </van-cell>

        <van-cell center>
          <template #title>
            <div class="info-label">负责教师</div>
          </template>
          <template #value>
            <div class="info-value">{{ customer.teacherName }}</div>
          </template>
          <template #icon>
            <van-icon name="service-o" color="#7232dd" />
          </template>
        </van-cell>

        <!-- 备注信息 -->
        <van-cell v-if="customer.notes" class="notes-cell">
          <template #title>
            <div class="info-label">备注</div>
          </template>
          <template #label>
            <div class="notes-content">{{ customer.notes }}</div>
          </template>
          <template #icon>
            <van-icon name="comment-o" color="#f39c12" />
          </template>
        </van-cell>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="暂无客户信息" image="search" />
    </van-cell-group>

    <!-- 快捷操作 -->
    <div v-if="customer" class="quick-actions">
      <van-grid :border="false" :column-num="4">
        <van-grid-item @click="$emit('call-customer', customer.phone)">
          <van-icon name="phone-o" size="24" color="#07c160" />
          <span class="action-text">拨打电话</span>
        </van-grid-item>
        <van-grid-item @click="$emit('add-follow', customer)">
          <van-icon name="add-o" size="24" color="#1989fa" />
          <span class="action-text">添加跟进</span>
        </van-grid-item>
        <van-grid-item @click="$emit('view-history', customer)">
          <van-icon name="description" size="24" color="#ff976a" />
          <span class="action-text">跟进记录</span>
        </van-grid-item>
        <van-grid-item @click="$emit('view-sop', customer)">
          <van-icon name="chart-trending-o" size="24" color="#7232dd" />
          <span class="action-text">SOP进度</span>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Customer {
  id: string
  name: string
  phone: string
  childName: string
  childAge: number
  childGender: string
  source: string
  status: string
  createdAt: string
  teacherName: string
  notes?: string
}

interface Props {
  customerId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'call-customer': [phone: string]
  'add-follow': [customer: Customer]
  'view-history': [customer: Customer]
  'view-sop': [customer: Customer]
}>()

const loading = ref(false)
const customer = ref<Customer | null>(null)

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusTagType(status: string): 'primary' | 'success' | 'warning' | 'danger' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    NEW: 'primary',
    FOLLOWING: 'warning',
    CONVERTED: 'success',
    LOST: 'danger',
    new: 'primary',
    following: 'warning',
    success: 'success',
    lost: 'danger'
  }
  return types[status] || 'primary'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    NEW: '新客户',
    FOLLOWING: '跟进中',
    CONVERTED: '已转化',
    LOST: '已流失',
    new: '新客户',
    following: '跟进中',
    success: '已成交',
    lost: '已流失'
  }
  return texts[status] || status
}

function getSourceTagType(source: string): 'primary' | 'success' | 'warning' | 'danger' {
  // 根据来源渠道返回不同的标签颜色
  const sourceTypes: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    '官网咨询': 'primary',
    '电话咨询': 'success',
    '微信咨询': 'success',
    '朋友推荐': 'warning',
    '活动引流': 'danger'
  }
  return sourceTypes[source] || 'primary'
}

async function loadCustomerInfo() {
  loading.value = true
  try {
    // TODO: 从API加载客户信息
    // const response = await getCustomerInfo(props.customerId);
    // customer.value = response.data;

    // 模拟数据
    customer.value = {
      id: props.customerId,
      name: '张女士',
      phone: '13812341234',
      childName: '小明',
      childAge: 3,
      childGender: '男',
      source: '官网咨询',
      status: 'following',
      createdAt: '2025-10-01 10:30:00',
      teacherName: '李老师',
      notes: '客户对蒙氏教育很感兴趣，希望了解更多课程细节，已经安排试听课程。'
    }
  } catch (error) {
    console.error('加载客户信息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomerInfo()
})
</script>

<style scoped lang="scss">
.mobile-customer-info-card {
  background: var(--van-background-color);
  padding: var(--van-padding-sm);

  .info-card {
    margin-bottom: var(--van-padding-sm);
    border-radius: var(--van-border-radius-lg);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);

    :deep(.van-cell-group__title) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--van-padding-md);
      font-weight: 600;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--van-padding-xs);

    .header-title {
      flex: 1;
      font-size: var(--van-font-size-lg);
      font-weight: 600;
    }

    .status-tag {
      font-size: var(--van-font-size-sm);
    }
  }

  .customer-info {
    :deep(.van-cell) {
      padding: var(--van-padding-md);
      align-items: flex-start;

      &:not(:last-child)::after {
        left: 44px; // 与图标对齐
      }
    }

    .info-label {
      font-size: var(--van-font-size-md);
      color: var(--van-gray-6);
      font-weight: 500;
      margin-bottom: 2px;
    }

    .info-value {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color);
      font-weight: 500;
      text-align: right;

      &.primary {
        color: var(--van-primary-color);
        font-weight: 600;
      }

      &.time {
        color: var(--van-gray-6);
        font-size: var(--van-font-size-sm);
      }

      .phone-link {
        color: var(--van-success-color);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-weight: 600;
      }

      .child-detail {
        color: var(--van-gray-6);
        font-weight: 400;
        font-size: var(--van-font-size-sm);
      }
    }

    .notes-cell {
      :deep(.van-cell__label) {
        margin-top: var(--van-padding-xs);
      }

      .notes-content {
        font-size: var(--van-font-size-sm);
        color: var(--van-gray-6);
        line-height: 1.6;
        padding: var(--van-padding-sm);
        background: var(--van-gray-1);
        border-radius: var(--van-border-radius-sm);
        border-left: 3px solid var(--van-warning-color);
      }
    }
  }

  .quick-actions {
    background: white;
    border-radius: var(--van-border-radius-lg);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(100, 101, 102, 0.08);

    :deep(.van-grid) {
      padding: var(--van-padding-md) 0;
    }

    :deep(.van-grid-item) {
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }

    .action-text {
      font-size: var(--van-font-size-xs);
      color: var(--van-gray-7);
      margin-top: var(--van-padding-xs);
      display: block;
    }
  }
}

/* 暗黑模式适配 */
:deep([data-theme="dark"]) {
  .mobile-customer-info-card {
    .info-card {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    }

    .quick-actions {
      background: var(--van-background-color-dark);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    }

    .notes-content {
      background: var(--van-gray-8) !important;
      color: var(--van-gray-3) !important;
    }
  }
}
</style>