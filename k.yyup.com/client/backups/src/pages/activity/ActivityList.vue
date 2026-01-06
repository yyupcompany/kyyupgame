<template>
  <div class="page-container">
    <page-header title="活动管理">
      <template #actions>
        <el-button type="primary" @click="handleCreateActivity">创建活动</el-button>
        <el-button type="danger" :disabled="selectedActivities.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </template>
    </page-header>

    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="queryForm" label-width="80px" class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="关键词">
                <el-input
                  v-model="queryForm.title"
                  placeholder="活动标题/描述/地点"
                  clearable
                  class="search-input"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动状态">
                <el-select
                  v-model="queryForm.status"
                  placeholder="全部状态"
                  clearable
                  class="search-select"
                >
                  <el-option v-for="status in activityStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12">
              <el-form-item label="活动日期">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  clearable
                  class="search-date-picker"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item class="search-actions">
                <div class="action-buttons">
                  <el-button type="primary" @click="handleSearch" class="search-btn">
                    <el-icon><Search /></el-icon>
                    <span class="btn-text">查询</span>
                  </el-button>
                  <el-button @click="handleReset" class="reset-btn">
                    <el-icon><Refresh /></el-icon>
                    <span class="btn-text">重置</span>
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <div class="activity-list-container">
      <el-table
        v-loading="loading"
        :data="activityList"
        border
        stripe
        style="width: 100%"
        :empty-text="'暂无数据'"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="活动标题" prop="title" min-width="150">
          <template #default="{ row }">{{ row.title || '—' }}</template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <activity-status-tag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" min-width="150">
          <template #default="{ row }">
            {{ row.startTime ? formatDateTime(row.startTime) : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endTime" min-width="150">
          <template #default="{ row }">
            {{ row.endTime ? formatDateTime(row.endTime) : '—' }}
          </template>
        </el-table-column>
        <el-table-column label="地点" prop="location" min-width="150">
          <template #default="{ row }">{{ row.location || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="{ row }">
            <activity-actions
              :activity="row"
              @view="handleViewActivity"
              @edit="handleEditActivity"
              @delete="handleDeleteActivity"
              @change-status="handleChangeStatus"
              @manage-participants="handleManageParticipants"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
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
    </div>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="activityListHelp" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
// API导入已移至activity模块

import {
  Activity,
  ActivityQueryParams,
  getActivityList,
  deleteActivity,
  updateActivityStatus
} from '../../api/modules/activity'
import { ActivityStatus } from '../../types/activity'
import ActivityStatusTag from '../../components/activity/ActivityStatusTag.vue'
import ActivityActions from '../../components/activity/ActivityActions.vue'
import PageHeader from '../../components/common/PageHeader.vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { ErrorHandler } from '@/utils/errorHandler'
import { formatDateTime } from '@/utils/dateFormat'
import { del, put } from '@/utils/request'

export default defineComponent({
  name: 'ActivityList',
  components: {
    ActivityStatusTag,
    ActivityActions,
    PageHeader,
    PageHelpButton
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const activityList = ref<Activity[]>([])
    const selectedActivities = ref<Activity[]>([])
    const dateRange = ref<string[]>([])

    // AI帮助内容
    const activityListHelp = {
      title: '活动管理使用指南',
      description: '查看和管理所有活动，支持搜索、筛选、批量操作。可以快速创建、编辑、删除活动。',
      features: [
        '活动列表查看和搜索',
        '按状态、日期筛选活动',
        '批量删除活动',
        '快速创建新活动',
        '查看活动详情和编辑'
      ],
      steps: [
        '使用搜索框查找活动',
        '使用筛选条件缩小范围',
        '点击活动卡片查看详情',
        '点击"创建活动"新建活动',
        '勾选多个活动进行批量操作'
      ],
      tips: [
        '可以按活动标题、描述、地点搜索',
        '活动状态包括：计划中、报名开放、进行中、已结束等',
        '批量删除前请确认选择的活动',
        '活动卡片显示关键信息和快捷操作'
      ]
    }

    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
  total: 0
    })

    // 查询表单 - 修正字段名以匹配API接口
    const queryForm = reactive({
      title: '',           // 对应keyword搜索
      status: undefined,
      startTimeStart: '',  // 修正字段名
      startTimeEnd: '',    // 修正字段名
      page: 1,
      pageSize: 10
    })

    // 活动状态选项
    const activityStatusOptions = [
      { label: '进行中', value: 'ONGOING' },
      { label: '即将开始', value: 'UPCOMING' },
      { label: '已结束', value: 'ENDED' },
      { label: '已取消', value: 'CANCELLED' }
    ]

    // 监听日期范围变化
    watch(dateRange, (newVal) => {
      if (newVal && newVal.length === 2) {
        queryForm.startTimeStart = newVal[0]
        queryForm.startTimeEnd = newVal[1]
      } else {
        queryForm.startTimeStart = ''
        queryForm.startTimeEnd = ''
      }
    })

    // 获取活动列表 - 使用统一API
    const fetchActivityList = async () => {
      loading.value = true
      try {
        const statusParam = typeof (queryForm as any).status === 'number' ? (queryForm as any).status : undefined
        const params: ActivityQueryParams = {
          title: queryForm.title,
          status: statusParam,
          startTimeStart: queryForm.startTimeStart,
          startTimeEnd: queryForm.startTimeEnd,
          page: pagination.currentPage,
          size: pagination.pageSize
        }

        const response = await getActivityList(params)

        if (response.success && response.data) {
          // getActivityList 已经处理了数据转换
          activityList.value = response.data.items || []
          pagination.total = response.data.total || 0
        } else {
          activityList.value = []
          pagination.total = 0
          ElMessage.error(response.message || '获取活动列表失败')
        }
      } catch (error) {
        ErrorHandler.handle(error)
      } finally {
        loading.value = false
      }
    }

    // 查询
    const handleSearch = () => {
      pagination.currentPage = 1
      fetchActivityList()
    }

    // 重置
    const handleReset = () => {
      queryForm.title = ''
      queryForm.status = undefined
      queryForm.startTimeStart = ''
      queryForm.startTimeEnd = ''
      queryForm.page = 1
      queryForm.pageSize = 10
      dateRange.value = []
      pagination.currentPage = 1
      fetchActivityList()
    }

    // 分页大小变化
    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      fetchActivityList()
    }

    // 分页页码变化
    const handleCurrentChange = (page: number) => {
      pagination.currentPage = page
      fetchActivityList()
    }

    // 创建活动
    const handleCreateActivity = () => {
      router.push('/activity/create')
    }

    // 查看活动详情
    const handleViewActivity = (activity: Activity) => {
      router.push(`/activity/detail/${activity.id}`)
    }

    // 编辑活动
    const handleEditActivity = (activity: Activity) => {
      router.push(`/activity/edit/${activity.id}`)
    }

    // 删除活动 - 使用统一端点和错误处理
    const handleDeleteActivity = (activity: Activity) => {
      ElMessageBox.confirm(
        '确定要删除这个活动吗？此操作不可恢复。',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const response = await del(`/activities/${activity.id}`)
          if (response.success) {
            ElMessage.success('活动删除成功')
            fetchActivityList()
          } else {
            ElMessage.error(response.message || '删除活动失败')
          }
        } catch (error: any) {
          ErrorHandler.handle(error)
        }
      }).catch(() => {
        // 用户取消删除，不做任何操作
      })
    }

    // 批量删除活动
    const handleBatchDelete = () => {
      if (selectedActivities.value.length === 0) {
        ElMessage.warning('请至少选择一个活动')
        return
      }

      ElMessageBox.confirm(
        `确定要删除选中的 ${selectedActivities.value.length} 个活动吗？此操作不可恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
  type: 'warning'
        }
      ).then(async () => {
        try {
          const ids = selectedActivities.value && Array.isArray(selectedActivities.value)
            ? selectedActivities.value.map(item => item.id)
            : []
          const deletePromises = ids.map(id => del(`/activities/${id}`))

          await Promise.all(deletePromises)
          ElMessage.success('批量删除成功')
          fetchActivityList()
          selectedActivities.value = []
        } catch (error: any) {
          ErrorHandler.handle(error)
        }
      }).catch(() => {
        // 用户取消删除，不做任何操作
      })
    }

    // 表格选择变化
    const handleSelectionChange = (selection: Activity[]) => {
      selectedActivities.value = selection
    }

    // 更改活动状态
    const handleChangeStatus = (activity: Activity) => {
      let newStatus: string
      let confirmMessage: string

      switch (activity.status) {
        case 'ONGOING':
          newStatus = 'ENDED'
          confirmMessage = `确定要将活动 "${activity.title}" 标记为已结束吗？`
          break
        case 'UPCOMING':
          newStatus = 'ONGOING'
          confirmMessage = `确定要将活动 "${activity.title}" 标记为进行中吗？`
          break
        case 'ENDED':
        case 'CANCELLED':
          newStatus = 'UPCOMING'
          confirmMessage = `确定要重新激活活动 "${activity.title}" 吗？`
          break;
  default:
          ElMessage.warning('无法更改当前状态的活动')
          return
      }

      ElMessageBox.confirm(
        confirmMessage,
        '更改活动状态',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
  type: 'warning'
        }
      ).then(async () => {
        try {
          const response = await put(`/activities/${activity.id}/status`, { status: newStatus })
          if (response.success) {
            ElMessage.success('活动状态更新成功')
            fetchActivityList()
          } else {
            ElMessage.error(response.message || '更新活动状态失败')
          }
        } catch (error: any) {
          ErrorHandler.handle(error)
        }
      }).catch(() => {
        // 用户取消操作，不做任何处理
      })
    }

    // 管理活动参与者
    const handleManageParticipants = (activity: Activity) => {
      router.push(`/activity/participants/${activity.id}`)
    }

    onMounted(() => {
      fetchActivityList()
    })

    return {
      loading,
      activityList,
      selectedActivities,
      pagination,
      queryForm,
      dateRange,
      activityStatusOptions,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleCreateActivity,
      handleViewActivity,
      handleEditActivity,
      handleDeleteActivity,
      handleBatchDelete,
      handleSelectionChange,
      handleChangeStatus,
      handleManageParticipants,
      formatDateTime
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局样式 page-container 替代 activity-list-page */
/* .filter-container 和 .pagination-container 使用全局定义 */

.activity-list-container {
  margin-bottom: var(--spacing-lg);
  background-color: transparent;
}

/* Form styles */
.filter-container :deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.filter-container :deep(.el-form-item) {
  margin-bottom: 0;
}

/* Table styles */
.activity-list-container :deep(.el-table) {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

.activity-list-container :deep(.el-table__header-wrapper) {
  background-color: var(--bg-secondary);
}

.activity-list-container :deep(.el-table th) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
}

.activity-list-container :deep(.el-table tr) {
  background-color: var(--bg-card);
}

.activity-list-container :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--bg-secondary);
}

.activity-list-container :deep(.el-table td) {
  color: var(--text-secondary);
}

.activity-list-container :deep(.el-table__body tr:hover > td) {
  background-color: var(--bg-hover);
}

/* Button styles */
.filter-container :deep(.el-button) {
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

/* Input styles */
.filter-container :deep(.el-input__inner),
.filter-container :deep(.el-select__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-md);
}

.filter-container :deep(.el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: var(--focus-shadow);
}

.filter-container :deep(.el-select__wrapper:focus) {
  border-color: var(--primary-color);
  box-shadow: var(--focus-shadow);
}

/* Date picker styles */
.filter-container :deep(.el-date-editor) {
  background-color: var(--bg-primary);
}

.filter-container :deep(.el-date-editor .el-input__inner) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Page header styles */
.activity-list-page :deep(h1),
.activity-list-page :deep(h2) {
  font-size: var(--text-2xl);
  color: var(--text-primary);
  font-weight: 600;
  background: var(--gradient-orange);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* Page actions */
.activity-list-page :deep([name="actions"]) {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

/* Element Plus button theme */
.activity-list-page :deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.activity-list-page :deep(.el-button--primary:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-sm);
}

.activity-list-page :deep(.el-button--danger) {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
}

.activity-list-page :deep(.el-button--danger:hover) {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  filter: brightness(1.1);
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-sm);
}

/* Pagination styles */
.pagination-container :deep(.el-pagination) {
  font-weight: 500;
}

/* Pagination button styles */
.pagination-container :deep(.btn-prev),
.pagination-container :deep(.btn-next) {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
}

.pagination-container :deep(.btn-prev:hover) {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.pagination-container :deep(.btn-next:hover) {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

/* Date picker popover styles */
.filter-container :deep(.el-date-picker__time-header) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-container :deep(.el-date-table td.available:hover) {
  background-color: var(--bg-hover);
}

.filter-container :deep(.el-date-table td.current:not(.disabled)) {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.pagination-container :deep(.el-pager li) {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-fast);
}

.pagination-container :deep(.el-pager li:hover) {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination-container :deep(.el-pager li.active) {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}

/* Loading styles */
.activity-list-container :deep(.el-loading-mask) {
  background-color: var(--bg-card-overlay);
}

/* Select dropdown styles */
.filter-container :deep(.el-select-dropdown) {
  background-color: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.filter-container :deep(.el-select-dropdown__item) {
  color: var(--text-primary);
}

.filter-container :deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-hover);
}

.filter-container :deep(.el-select-dropdown__item.selected) {
  color: var(--primary-color);
  font-weight: 600;
  background-color: var(--primary-light-bg);
}

/* Responsive design */
@media (max-width: var(--breakpoint-md)) {
  .activity-list-page {
    padding: var(--spacing-md);
  }

  .filter-container {
    padding: var(--spacing-md);
  }

  .filter-container :deep(.el-form) {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .filter-container :deep(.el-form-item) {
    width: 100%;
  }

  .filter-container :deep(.el-form-item__label) {
    font-size: var(--text-sm);
  }

  .filter-container :deep(.el-button) {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
    padding: var(--spacing-md);
  }

  .activity-list-container :deep(.el-table) {
    font-size: var(--text-sm);
  }
}
</style>