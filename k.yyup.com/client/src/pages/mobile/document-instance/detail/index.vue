<template>
  <MobileSubPageLayout title="文档详情" back-path="/mobile/centers">
    <div class="mobile-document-instance-detail">
      <van-loading v-if="loading" type="spinner" color="#1989fa" vertical>
        加载中...
      </van-loading>

      <div v-else-if="document" class="document-content">
        <!-- 文档头部信息 -->
        <van-cell-group class="document-header">
          <van-cell>
            <template #title>
              <h2 class="document-title">{{ document.title }}</h2>
            </template>
            <template #right-icon>
              <van-tag :type="getStatusType(document.status)" size="large">
                {{ getStatusLabel(document.status) }}
              </van-tag>
            </template>
          </van-cell>

          <van-cell title="文档模板" :value="document.template?.name || '-'" />
          <van-cell title="创建时间" :value="formatDate(document.createdAt)" />
          <van-cell title="更新时间" :value="formatDate(document.updatedAt)" />
          <van-cell
            v-if="document.deadline"
            title="截止时间"
            :value="formatDate(document.deadline)"
            :value-class="{ 'text-danger': isOverdue(document.deadline) }"
          />
        </van-cell-group>

        <!-- 进度信息 -->
        <van-cell-group class="progress-section">
          <van-cell title="填写进度">
            <template #right-icon>
              <div class="progress-info">
                <span class="progress-text">{{ document.progress }}%</span>
              </div>
            </template>
          </van-cell>
          <van-cell>
            <van-progress
              :percentage="document.progress"
              :color="getProgressColor(document.progress)"
              stroke-width="8"
              :show-pivot="false"
            />
          </van-cell>
        </van-cell-group>

        <!-- 文档内容 -->
        <van-cell-group class="content-section">
          <van-cell title="文档内容" />
          <div class="document-body" v-html="document.content"></div>
        </van-cell-group>

        <!-- 填写变量 (如果有) -->
        <van-cell-group v-if="hasFilledVariables" class="variables-section">
          <van-cell title="填写信息" />
          <van-cell
            v-for="(value, key) in document.filledVariables"
            :key="key"
            :title="key"
            :value="formatVariableValue(value)"
          />
        </van-cell-group>

        <!-- 操作按钮 -->
        <div class="action-section">
          <van-button
            v-if="document.status === 'draft' || document.status === 'filling'"
            type="primary"
            block
            round
            @click="handleEdit"
            icon="edit"
          >
            编辑文档
          </van-button>

          <van-button
            type="success"
            block
            round
            @click="handleExport"
            icon="down"
            class="action-btn"
          >
            导出文档
          </van-button>

          <van-button
            type="default"
            block
            round
            @click="handleViewVersions"
            icon="records"
            class="action-btn"
          >
            版本历史
          </van-button>

          <van-button
            v-if="canDelete"
            type="danger"
            block
            round
            @click="handleDelete"
            icon="delete"
            class="action-btn delete-btn"
          >
            删除文档
          </van-button>
        </div>
      </div>

      <van-empty
        v-else
        description="文档不存在或已被删除"
        image="error"
      >
        <van-button type="primary" round @click="goBack">
          返回列表
        </van-button>
      </van-empty>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import {
  getInstanceById,
  deleteInstance,
  exportInstance,
  getVersionHistory,
  type DocumentInstance
} from '@/api/endpoints/document-instances'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const document = ref<DocumentInstance | null>(null)

// 进度阈值常量
const PROGRESS_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  MEDIUM: 50
}

// 计算属性
const hasFilledVariables = computed(() => {
  return document.value?.filledVariables &&
         Object.keys(document.value.filledVariables).length > 0
})

const canDelete = computed(() => {
  return document.value?.status === 'draft' ||
         document.value?.status === 'filling'
})

// 方法
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'default',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return map[status] || status
}

const getProgressColor = (progress: number) => {
  if (progress >= PROGRESS_THRESHOLDS.EXCELLENT) return '#67c23a'
  if (progress >= PROGRESS_THRESHOLDS.GOOD) return '#e6a23c'
  if (progress >= PROGRESS_THRESHOLDS.MEDIUM) return '#f56c6c'
  return '#909399'
}

const formatDate = (date: string | Date | null) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const isOverdue = (deadline: string | Date) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const formatVariableValue = (value: any) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// 事件处理
const handleEdit = () => {
  if (document.value) {
    router.push(`/mobile/document-instance/${document.value.id}/edit`)
  }
}

const handleExport = async () => {
  if (!document.value) return

  try {
    showToast({
      type: 'loading',
      message: '导出中...',
      forbidClick: true,
      duration: 0
    })

    await exportInstance(document.value.id, 'pdf')
    showToast.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    showToast.fail('导出失败')
  }
}

const handleViewVersions = async () => {
  if (!document.value) return

  try {
    showToast({
      type: 'loading',
      message: '加载版本历史...',
      forbidClick: true,
      duration: 0
    })

    const response = await getVersionHistory(document.value.id)
    if (response.success) {
      showToast.success('版本历史加载成功')
      // TODO: 显示版本历史弹窗或跳转到版本历史页面
    }
  } catch (error) {
    console.error('加载版本历史失败:', error)
    showToast.fail('加载版本历史失败')
  }
}

const handleDelete = async () => {
  if (!document.value) return

  try {
    await showConfirmDialog({
      title: '删除确认',
      message: '确定要删除这个文档吗？此操作无法撤销。',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    showToast({
      type: 'loading',
      message: '删除中...',
      forbidClick: true,
      duration: 0
    })

    const response = await deleteInstance(document.value.id)
    if (response.success) {
      showToast.success('删除成功')
      goBack()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast.fail('删除失败')
    }
  }
}

const goBack = () => {
  router.push('/mobile/centers/document-instance-list')
}

// 加载数据
const loadDocument = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true

  try {
    const response = await getInstanceById(id)
    if (response.success) {
      document.value = response.data
    } else {
      showToast.fail('文档不存在')
    }
  } catch (error) {
    console.error('加载文档详情失败:', error)
    showToast.fail('加载文档详情失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadDocument()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-document-instance-detail {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--app-bg-color);
  padding: var(--spacing-md);

  .van-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .document-content {
    .document-header {
      margin-bottom: 12px;

      .document-title {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: #323233;
        line-height: 1.4;
      }

      .text-danger {
        color: #ee0a24;
      }
    }

    .progress-section {
      margin-bottom: 12px;

      .progress-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .progress-text {
          font-weight: 600;
          color: #323233;
        }
      }
    }

    .content-section {
      margin-bottom: 12px;

      .document-body {
        padding: var(--spacing-md);
        background: var(--card-bg);
        line-height: 1.6;
        color: #323233;
        word-wrap: break-word;

        :deep(p) {
          margin: var(--spacing-sm) 0;
        }

        :deep(img) {
          max-width: 100%;
          height: auto;
        }
      }
    }

    .variables-section {
      margin-bottom: 12px;
    }

    .action-section {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .action-btn {
        background: var(--card-bg);
        color: #323233;
        border: 1px solid #ebedf0;

        &.delete-btn {
          background: #fef0f0;
          color: #ee0a24;
          border-color: #fde2e2;
        }
      }
    }
  }

  .van-empty {
    padding: 40px 16px;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-instance-detail {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>