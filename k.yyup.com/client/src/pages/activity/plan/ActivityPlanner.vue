<template>
  <UnifiedCenterLayout
    title="活动策划"
    :show-header="true"
    :show-actions="true"
    @create="handleCreatePlan"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreatePlan">
        <UnifiedIcon name="Plus" />
        新建策划
      </el-button>
      <el-button type="success" @click="handleExportPlans">
        <UnifiedIcon name="Download" />
        导出策划
      </el-button>
    </template>

    <template #content>

    <!-- 搜索区域 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="queryForm" label-width="80px" class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="策划名称">
                <el-input 
                  v-model="queryForm.title" 
                  placeholder="请输入策划名称" 
                  clearable 
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动类型">
                <el-select 
                  v-model="queryForm.activityType" 
                  placeholder="全部类型" 
                  clearable
                >
                  <el-option 
                    v-for="type in activityTypeOptions" 
                    :key="type.value" 
                    :label="type.label" 
                    :value="type.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="策划状态">
                <el-select 
                  v-model="queryForm.status" 
                  placeholder="全部状态" 
                  clearable
                >
                  <el-option 
                    v-for="status in planStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch">
                  <UnifiedIcon name="Search" />
                  查询
                </el-button>
                <el-button @click="handleReset">
                  <UnifiedIcon name="Refresh" />
                  重置
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 策划列表 -->
    <div class="app-card">
      <div class="app-card-content">
        <div class="table-wrapper">
<el-table class="responsive-table" 
          :data="planList" 
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="策划名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="handleViewDetail(row)">
                {{ row.title }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="activityType" label="活动类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getActivityTypeTag(row.activityType)">
                {{ getActivityTypeLabel(row.activityType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="targetAge" label="目标年龄" width="120" />
          <el-table-column prop="participantCount" label="参与人数" width="100" />
          <el-table-column prop="duration" label="活动时长" width="120">
            <template #default="{ row }">
              {{ row.duration }} 分钟
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getPlanStatusTag(row.status)">
                {{ getPlanStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="success" size="small" @click="handleCopy(row)">
                复制
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
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
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 策划详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="策划详情" 
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentPlan" class="plan-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="策划名称">{{ currentPlan.title }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">{{ getActivityTypeLabel(currentPlan.activityType) }}</el-descriptions-item>
          <el-descriptions-item label="目标年龄">{{ currentPlan.targetAge }}</el-descriptions-item>
          <el-descriptions-item label="参与人数">{{ currentPlan.participantCount }}人</el-descriptions-item>
          <el-descriptions-item label="活动时长">{{ currentPlan.duration }}分钟</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getPlanStatusLabel(currentPlan.status) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">活动目标</el-divider>
        <div class="plan-content">{{ currentPlan.objectives || '暂无' }}</div>

        <el-divider content-position="left">内容大纲</el-divider>
        <div class="plan-content">{{ currentPlan.contentOutline || '暂无' }}</div>

        <el-divider content-position="left">所需材料</el-divider>
        <div class="plan-content">{{ currentPlan.materials || '暂无' }}</div>

        <el-divider content-position="left">应急预案</el-divider>
        <div class="plan-content">{{ currentPlan.emergencyPlan || '暂无' }}</div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromDetail">编辑策划</el-button>
      </template>
    </el-dialog>
    </template>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Search, Refresh } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentPlan = ref<any>(null)

// 查询表单
const queryForm = reactive({
  title: '',
  activityType: undefined,
  status: undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 策划列表
const planList = ref<any[]>([])

// 活动类型选项
const activityTypeOptions = [
  { label: '开放日', value: 1 },
  { label: '家长会', value: 2 },
  { label: '亲子活动', value: 3 },
  { label: '招生宣讲', value: 4 },
  { label: '园区参观', value: 5 },
  { label: '其他', value: 6 }
]

// 策划状态选项
const planStatusOptions = [
  { label: '草稿', value: 0 },
  { label: '待审核', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已拒绝', value: 3 },
  { label: '已归档', value: 4 }
]

// 获取活动类型标签
const getActivityTypeTag = (type: number) => {
  const tagMap: Record<number, string> = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: 'info',
    6: ''
  }
  return tagMap[type] || ''
}

// 获取活动类型标签
const getActivityTypeLabel = (type: number) => {
  const option = activityTypeOptions.find(item => item.value === type)
  return option?.label || '未知'
}

// 获取策划状态标签
const getPlanStatusTag = (status: number) => {
  const tagMap: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: ''
  }
  return tagMap[status] || ''
}

// 获取策划状态标签
const getPlanStatusLabel = (status: number) => {
  const option = planStatusOptions.find(item => item.value === status)
  return option?.label || '未知'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 加载策划列表
const loadPlanList = async () => {
  loading.value = true
  try {
    // TODO: 调用实际API
    // 模拟数据
    const mockData = {
      items: [
        {
          id: 1,
          title: '春季亲子运动会策划',
          activityType: 3,
          targetAge: '3-6岁',
          participantCount: 50,
          duration: 120,
          status: 2,
          objectives: '增进亲子关系，锻炼孩子身体素质',
          contentOutline: '开场仪式、亲子游戏、颁奖典礼',
          materials: '音响设备、奖品、场地布置用品',
          emergencyPlan: '医务人员待命，准备急救包',
          createdAt: '2024-01-15 10:00:00'
        },
        {
          id: 2,
          title: '幼儿园开放日策划',
          activityType: 1,
          targetAge: '2-6岁',
          participantCount: 100,
          duration: 180,
          status: 1,
          objectives: '展示幼儿园教学成果，吸引新生报名',
          contentOutline: '园区参观、课程体验、家长座谈',
          materials: '宣传资料、体验道具、茶水点心',
          emergencyPlan: '安保人员维持秩序，设置引导标识',
          createdAt: '2024-01-10 14:30:00'
        }
      ],
      total: 2
    }
    
    planList.value = mockData.items
    pagination.total = mockData.total
  } catch (error) {
    console.error('获取策划列表失败:', error)
    ElMessage.error('获取策划列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadPlanList()
}

// 重置
const handleReset = () => {
  Object.assign(queryForm, {
    title: '',
    activityType: undefined,
    status: undefined
  })
  handleSearch()
}

// 新建策划
const handleCreatePlan = () => {
  router.push('/activity/plan/create')
}

// 导出策划
const handleExportPlans = () => {
  ElMessage.info('导出功能开发中...')
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentPlan.value = row
  detailDialogVisible.value = true
}

// 编辑策划
const handleEdit = (row: any) => {
  router.push(`/activity/plan/edit/${row.id}`)
}

// 从详情编辑
const handleEditFromDetail = () => {
  if (currentPlan.value) {
    router.push(`/activity/plan/edit/${currentPlan.value.id}`)
  }
}

// 复制策划
const handleCopy = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要复制这个策划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // TODO: 实现复制逻辑
    ElMessage.success('复制成功')
    loadPlanList()
  } catch {
    // 用户取消
  }
}

// 删除策划
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个策划吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    loadPlanList()
  } catch {
    // 用户取消
  }
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentPlan.value = null
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadPlanList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadPlanList()
}

onMounted(() => {
  loadPlanList()
})
</script>

<style scoped>
.search-section {
  margin-bottom: var(--text-lg);
}

.pagination-container {
  margin-top: var(--text-2xl);
  text-align: right;
}

.plan-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.plan-content {
  padding: var(--text-xs);
  background-color: var(--bg-hover);
  border-radius: var(--spacing-xs);
  margin-bottom: var(--text-lg);
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
