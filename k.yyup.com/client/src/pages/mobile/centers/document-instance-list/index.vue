<template>
  <MobileMainLayout
    title="我的文档"
    :show-back="false"
  >
    <div class="mobile-document-instance-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <h2>📄 我的文档</h2>
        <p>管理您创建和分配的文档实例</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <van-icon name="description" size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.draft }}</div>
            <div class="stat-label">草稿</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <van-icon name="edit" size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.filling }}</div>
            <div class="stat-label">填写中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <van-icon name="eye-o" size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.review }}</div>
            <div class="stat-label">审核中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <van-icon name="checked" size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索文档标题..."
          @search="handleSearch"
          @clear="handleSearchClear"
          show-action
          action-text="筛选"
          @click-action="showFilterPopup = true"
        />

        <div class="filter-tags" v-if="hasActiveFilters">
          <van-tag
            v-if="filterStatus"
            type="primary"
            closeable
            @close="filterStatus = ''; loadInstances()"
          >
            状态: {{ getStatusLabel(filterStatus) }}
          </van-tag>
          <van-tag
            v-if="sortBy !== 'createdAt'"
            type="success"
            closeable
            @close="sortBy = 'createdAt'; loadInstances()"
          >
            排序: {{ getSortLabel(sortBy) }}
          </van-tag>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button
          type="primary"
          block
          round
          @click="handleCreateDocument"
          icon="plus"
        >
          新建文档
        </van-button>
        <van-button
          v-if="selectedIds.length > 0"
          type="danger"
          block
          round
          @click="handleBatchDelete"
          icon="delete"
          class="batch-delete-btn"
        >
          批量删除 ({{ selectedIds.length }})
        </van-button>
      </div>

      <!-- 文档列表 -->
      <div class="document-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div
              v-for="instance in instances"
              :key="instance.id"
              class="document-item"
              :class="{ 'selected': selectedIds.includes(instance.id) }"
            >
              <!-- 选择框 -->
              <div class="selection-area">
                <van-checkbox
                  v-model="selectedIds"
                  :name="instance.id"
                  @change="handleSelectionChange"
                />
              </div>

              <!-- 文档内容 -->
              <div class="document-content" @click="handleViewDocument(instance)">
                <div class="document-header">
                  <h3 class="document-title">
                    {{ instance.title }}
                    <van-tag
                      v-if="instance.deadline && isOverdue(instance.deadline)"
                      type="danger"
                      size="small"
                      class="overdue-tag"
                    >
                      已逾期
                    </van-tag>
                  </h3>
                  <div class="document-meta">
                    <van-tag :type="getStatusType(instance.status)" size="small">
                      {{ getStatusLabel(instance.status) }}
                    </van-tag>
                    <span class="template-name">{{ instance.template?.name || '-' }}</span>
                  </div>
                </div>

                <!-- 进度条 -->
                <div class="progress-section">
                  <div class="progress-info">
                    <span class="progress-text">进度: {{ instance.progress }}%</span>
                    <span v-if="instance.deadline" class="deadline-info">
                      截止: {{ formatDate(instance.deadline) }}
                    </span>
                  </div>
                  <van-progress
                    :percentage="instance.progress"
                    :color="getProgressColor(instance.progress)"
                    stroke-width="6"
                    :show-pivot="false"
                  />
                </div>

                <!-- 时间信息 -->
                <div class="time-info">
                  <span class="update-time">更新: {{ formatDate(instance.updatedAt) }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <van-button
                  v-if="instance.status === 'draft' || instance.status === 'filling'"
                  type="primary"
                  size="small"
                  icon="edit"
                  @click.stop="handleEditDocument(instance)"
                >
                  编辑
                </van-button>
                <van-button
                  v-else
                  type="default"
                  size="small"
                  icon="eye-o"
                  @click.stop="handleViewDocument(instance)"
                >
                  查看
                </van-button>
                <van-dropdown-menu class="action-menu">
                  <van-dropdown-item @change="handleAction($event, instance)">
                    <div class="action-item" @click="handleExportDocument(instance)">
                      <van-icon name="down" />
                      <span>导出</span>
                    </div>
                    <div class="action-item" @click="handleDeleteDocument(instance)">
                      <van-icon name="delete-o" />
                      <span>删除</span>
                    </div>
                  </van-dropdown-item>
                </van-dropdown-menu>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="!loading && instances.length === 0"
              description="暂无文档实例"
              image="search"
            >
              <van-button
                type="primary"
                round
                @click="handleCreateDocument"
              >
                创建第一个文档
              </van-button>
            </van-empty>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 筛选弹窗 -->
      <van-popup v-model:show="showFilterPopup" position="bottom" round>
        <div class="filter-popup">
          <div class="popup-header">
            <h3>筛选条件</h3>
            <van-button type="primary" plain @click="resetFilters">重置</van-button>
          </div>

          <div class="filter-content">
            <!-- 状态筛选 -->
            <div class="filter-group">
              <label class="filter-label">状态</label>
              <van-radio-group v-model="filterStatus" direction="horizontal">
                <van-radio name="">全部</van-radio>
                <van-radio name="draft">草稿</van-radio>
                <van-radio name="filling">填写中</van-radio>
                <van-radio name="review">审核中</van-radio>
                <van-radio name="approved">已通过</van-radio>
                <van-radio name="rejected">已拒绝</van-radio>
                <van-radio name="completed">已完成</van-radio>
              </van-radio-group>
            </div>

            <!-- 排序方式 -->
            <div class="filter-group">
              <label class="filter-label">排序</label>
              <van-radio-group v-model="sortBy" direction="horizontal">
                <van-radio name="createdAt">创建时间</van-radio>
                <van-radio name="updatedAt">更新时间</van-radio>
                <van-radio name="deadline">截止时间</van-radio>
                <van-radio name="progress">进度</van-radio>
              </van-radio-group>
            </div>
          </div>

          <div class="popup-footer">
            <van-button block type="primary" @click="applyFilters">
              确认筛选
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- 返回顶部按钮 -->
      <van-floating-bubble
        v-if="showBackToTop"
        icon="arrow-up"
        @click="scrollToTop"
        style="right: 20px; bottom: 80px;"
      />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showActionSheet } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getInstances,
  deleteInstance,
  batchDeleteInstances,
  exportInstance,
  type DocumentInstance,
  type DocumentInstanceListParams
} from '@/api/endpoints/document-instances'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const sortBy = ref('createdAt')
const selectedIds = ref<number[]>([])
const showFilterPopup = ref(false)
const showBackToTop = ref(false)

// 统计数据
const stats = ref({
  draft: 0,
  filling: 0,
  review: 0,
  completed: 0
})

// 文档实例列表
const instances = ref<DocumentInstance[]>([])

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 进度阈值常量
const PROGRESS_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  MEDIUM: 50
}

// 计算属性
const hasActiveFilters = computed(() => {
  return filterStatus.value || sortBy.value !== 'createdAt'
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

const getSortLabel = (sort: string) => {
  const map: Record<string, string> = {
    createdAt: '创建时间',
    updatedAt: '更新时间',
    deadline: '截止时间',
    progress: '进度'
  }
  return map[sort] || sort
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
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${d.getMonth() + 1}-${d.getDate()}`
  }
}

const isOverdue = (deadline: string | Date) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

// 事件处理
const handleSearch = () => {
  pagination.value.page = 1
  instances.value = []
  loadInstances()
}

const handleSearchClear = () => {
  searchKeyword.value = ''
  handleSearch()
}

const handleSelectionChange = () => {
  // Vue 3 van-checkbox 会自动处理数组
}

const handleCreateDocument = () => {
  router.push('/mobile/centers/document-template-center')
}

const handleViewDocument = (instance: DocumentInstance) => {
  router.push(`/mobile/document-instance/${instance.id}`)
}

const handleEditDocument = (instance: DocumentInstance) => {
  router.push(`/mobile/document-instance/${instance.id}/edit`)
}

const handleExportDocument = async (instance: DocumentInstance) => {
  try {
    showToast({
      type: 'loading',
      message: '导出中...',
      forbidClick: true,
      duration: 0
    })

    await exportInstance(instance.id, 'pdf')
    showToast.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    showToast.fail('导出失败')
  }
}

const handleDeleteDocument = async (instance: DocumentInstance) => {
  try {
    await showConfirmDialog({
      title: '删除确认',
      message: '确定要删除这个文档吗？',
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

    const response = await deleteInstance(instance.id)
    if (response.success) {
      showToast.success('删除成功')
      // 从列表中移除
      const index = instances.value.findIndex(item => item.id === instance.id)
      if (index > -1) {
        instances.value.splice(index, 1)
      }
      // 更新统计
      updateStats()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast.fail('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await showConfirmDialog({
      title: '批量删除确认',
      message: `确定要删除选中的 ${selectedIds.value.length} 个文档吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    showToast({
      type: 'loading',
      message: '批量删除中...',
      forbidClick: true,
      duration: 0
    })

    const response = await batchDeleteInstances(selectedIds.value)
    if (response.success) {
      showToast.success(`成功删除 ${response.data.deletedCount} 个文档`)
      selectedIds.value = []
      // 重新加载列表
      pagination.value.page = 1
      instances.value = []
      loadInstances()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      showToast.fail('批量删除失败')
    }
  }
}

const handleAction = (action: string, instance: DocumentInstance) => {
  // 处理下拉菜单操作
}

const applyFilters = () => {
  showFilterPopup.value = false
  pagination.value.page = 1
  instances.value = []
  loadInstances()
}

const resetFilters = () => {
  filterStatus.value = ''
  sortBy.value = 'createdAt'
}

const onRefresh = () => {
  pagination.value.page = 1
  instances.value = []
  loadInstances().then(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  loadInstances()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听滚动显示返回顶部按钮
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 加载数据
const loadInstances = async () => {
  if (loading.value && !refreshing.value) return

  loading.value = true

  try {
    const params: DocumentInstanceListParams = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: sortBy.value,
      sortOrder: 'DESC'
    }

    if (filterStatus.value) {
      params.status = filterStatus.value
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const response = await getInstances(params)
    if (response.success) {
      const newItems = response.data.items

      if (refreshing.value || pagination.value.page === 1) {
        instances.value = newItems
      } else {
        instances.value.push(...newItems)
      }

      pagination.value.total = response.data.total
      pagination.value.page++

      // 更新统计
      updateStats()

      // 判断是否加载完成
      finished.value = instances.value.length >= pagination.value.total
    }
  } catch (error) {
    console.error('加载文档列表失败:', error)
    showToast.fail('加载文档列表失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const updateStats = () => {
  // 从当前列表数据计算统计信息
  stats.value = {
    draft: instances.value.filter(i => i.status === 'draft').length,
    filling: instances.value.filter(i => i.status === 'filling').length,
    review: instances.value.filter(i => i.status === 'review').length,
    completed: instances.value.filter(i => i.status === 'completed').length
  }
}

// 生命周期
onMounted(() => {
  loadInstances()
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-document-instance-list {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);

  .page-header {
    background: var(--card-bg);
    padding: var(--spacing-md);
    margin-bottom: 8px;

    h2 {
      margin: 0 0 4px 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: #323233;
    }

    p {
      margin: 0;
      font-size: var(--text-sm);
      color: #969799;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--card-bg);
    margin-bottom: 8px;

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md) 8px;
      background: #f7f8fa;
      border-radius: 8px;

      .stat-icon {
        margin-bottom: 8px;
        color: var(--text-regular);
      }

      .stat-info {
        text-align: center;

        .stat-value {
          font-size: var(--text-lg);
          font-weight: bold;
          color: #323233;
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
          margin-top: 2px;
        }
      }
    }
  }

  .filter-section {
    background: var(--card-bg);
    padding: var(--spacing-sm) 16px;
    margin-bottom: 8px;

    .filter-tags {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: 8px;
      flex-wrap: wrap;
    }
  }

  .action-section {
    padding: 0 16px 8px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .batch-delete-btn {
      background: #ee0a24;
      border-color: #ee0a24;
    }
  }

  .document-list {
    padding: 0 16px;

    .document-item {
      background: var(--card-bg);
      border-radius: 8px;
      margin-bottom: 8px;
      padding: var(--spacing-md);
      display: flex;
      gap: var(--spacing-md);
      position: relative;
      transition: all 0.3s ease;

      &.selected {
        border: 2px solid #1989fa;
        box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
      }

      .selection-area {
        display: flex;
        align-items: flex-start;
        padding-top: 4px;
      }

      .document-content {
        flex: 1;
        min-width: 0;

        .document-header {
          margin-bottom: 12px;

          .document-title {
            margin: 0 0 8px 0;
            font-size: var(--text-base);
            font-weight: 600;
            color: #323233;
            line-height: 1.4;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            flex-wrap: wrap;

            .overdue-tag {
              flex-shrink: 0;
            }
          }

          .document-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            flex-wrap: wrap;

            .template-name {
              font-size: var(--text-xs);
              color: #969799;
            }
          }
        }

        .progress-section {
          margin-bottom: 8px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: var(--text-xs);

            .progress-text {
              color: #323233;
            }

            .deadline-info {
              color: #969799;
            }
          }
        }

        .time-info {
          .update-time {
            font-size: var(--text-xs);
            color: #c8c9cc;
          }
        }
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        align-items: flex-end;

        .action-menu {
          :deep(.van-dropdown-menu__bar) {
            height: auto;
            min-height: 24px;
            box-shadow: none;
            background: transparent;
          }

          :deep(.van-dropdown-menu__title) {
            padding: 0;
            font-size: var(--text-xs);
            color: #969799;
          }

          .action-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) 16px;
            font-size: var(--text-sm);
            color: #323233;

            .van-icon {
              font-size: var(--text-base);
            }

            &:hover {
              background: #f7f8fa;
            }
          }
        }
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }

  .filter-popup {
    max-height: 70vh;
    overflow: hidden;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid #ebedf0;

      h3 {
        margin: 0;
        font-size: var(--text-base);
        font-weight: 600;
      }
    }

    .filter-content {
      padding: var(--spacing-md);
      max-height: 50vh;
      overflow-y: auto;

      .filter-group {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 500;
          color: #323233;
          margin-bottom: 12px;
        }

        :deep(.van-radio-group) {
          .van-radio {
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .popup-footer {
      padding: var(--spacing-md);
      border-top: 1px solid #ebedf0;
    }
  }

  :deep(.van-empty) {
    padding: var(--spacing-xl) 16px;
  }

  :deep(.van-progress) {
    .van-progress__portion {
      border-radius: 3px;
    }
  }

  :deep(.van-checkbox) {
    .van-checkbox__icon {
      .van-icon {
        border-radius: 50%;
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-instance-list {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>