<template>
  <div class="activity-publish-page">
    <div class="page-header">
      <h1>活动发布管理</h1>
      <p>管理和发布活动到各个渠道</p>
    </div>

    <!-- 活动列表 -->
    <el-card class="activity-list-card">
      <template #header>
        <div class="card-header">
          <span>待发布活动列表</span>
          <el-button type="primary" @click="refreshList">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="activities"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="活动名称" min-width="200" />
        <el-table-column prop="activityType" label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getActivityTypeLabel(row.activityType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="发布状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
              {{ row.publishStatus === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.publishStatus !== 1"
              type="primary"
              size="small"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 发布对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布活动"
      width="600px"
    >
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="currentActivity.title" disabled />
        </el-form-item>
        <el-form-item label="发布渠道">
          <el-checkbox-group v-model="publishForm.channels">
            <el-checkbox label="wechat">微信公众号</el-checkbox>
            <el-checkbox label="weibo">微博</el-checkbox>
            <el-checkbox label="website">官网</el-checkbox>
            <el-checkbox label="app">APP</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-radio-group v-model="publishForm.publishType">
            <el-radio label="now">立即发布</el-radio>
            <el-radio label="scheduled">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="publishForm.publishType === 'scheduled'" label="发布时间">
          <el-date-picker
            v-model="publishForm.scheduledTime"
            type="datetime"
            placeholder="选择发布时间"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPublish" :loading="publishing">
          确认发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { get, put } from '@/utils/request'

const router = useRouter()

// 数据
const loading = ref(false)
const activities = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const publishDialogVisible = ref(false)
const publishing = ref(false)
const currentActivity = ref<any>({})
const publishForm = ref({
  channels: ['wechat'],
  publishType: 'now',
  scheduledTime: null
})

// 方法
const loadActivities = async () => {
  try {
    loading.value = true
    const response = await get('/activities', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      status: 'active'
    })

    if (response.success) {
      activities.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadActivities()
}

const handlePublish = (activity: any) => {
  currentActivity.value = activity
  publishForm.value = {
    channels: ['wechat'],
    publishType: 'now',
    scheduledTime: null
  }
  publishDialogVisible.value = true
}

const confirmPublish = async () => {
  try {
    publishing.value = true

    const response = await put(`/activities/${currentActivity.value.id}/publish`, {
      publishChannels: publishForm.value.channels,
      publishType: publishForm.value.publishType,
      scheduledTime: publishForm.value.scheduledTime
    })

    if (response.success) {
      ElMessage.success('活动发布成功')
      publishDialogVisible.value = false
      loadActivities()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布活动失败:', error)
    ElMessage.error('发布活动失败')
  } finally {
    publishing.value = false
  }
}

const handleViewDetail = (activity: any) => {
  router.push(`/activity/detail/${activity.id}`)
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadActivities()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadActivities()
}

const getActivityTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'sports': '体育活动',
    'art': '艺术活动',
    'science': '科学活动',
    'social': '社会活动',
    'other': '其他'
  }
  return typeMap[type] || type
}

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'active': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'draft': 'info',
    'active': 'success',
    'completed': 'warning',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped lang="scss">
.activity-publish-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .activity-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }
}
</style>

