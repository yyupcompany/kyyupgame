<template>
  <div class="page-container">
    <page-header title="活动评估">
      <template #actions>
        <el-button type="primary" @click="handleCreateEvaluation">
          <el-icon><Plus /></el-icon>
          新建评估
        </el-button>
        <el-button type="success" @click="handleExportEvaluations">
          <el-icon><Download /></el-icon>
          导出评估
        </el-button>
      </template>
    </page-header>

    <!-- 评估概览 -->
    <div class="app-card overview-section">
      <div class="app-card-content">
        <h3>评估概览</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.totalEvaluations }}</div>
                <div class="stat-label">总评估数</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.avgRating }}/5</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">👍</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.satisfactionRate }}%</div>
                <div class="stat-label">满意度</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6">
            <div class="stat-card">
              <div class="stat-icon">💬</div>
              <div class="stat-content">
                <div class="stat-value">{{ overviewData.responseRate }}%</div>
                <div class="stat-label">回复率</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="app-card filter-section">
      <div class="app-card-content">
        <el-form :model="filterForm" label-width="100px" class="filter-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="活动选择">
                <el-select 
                  v-model="filterForm.activityId" 
                  placeholder="全部活动" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="activity in activityList" 
                    :key="activity.id" 
                    :label="activity.title" 
                    :value="activity.id" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="评估状态">
                <el-select 
                  v-model="filterForm.status" 
                  placeholder="全部状态" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option 
                    v-for="status in evaluationStatusOptions" 
                    :key="status.value" 
                    :label="status.label" 
                    :value="status.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item label="评分范围">
                <el-select 
                  v-model="filterForm.ratingRange" 
                  placeholder="全部评分" 
                  clearable
                  @change="handleFilterChange"
                >
                  <el-option label="5分 (优秀)" value="5" />
                  <el-option label="4分 (良好)" value="4" />
                  <el-option label="3分 (一般)" value="3" />
                  <el-option label="2分 (较差)" value="2" />
                  <el-option label="1分 (很差)" value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 评估列表 -->
    <div class="app-card">
      <div class="app-card-content">
        <el-table 
          :data="evaluationList" 
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="activityTitle" label="活动名称" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="handleViewActivity(row)">
                {{ row.activityTitle }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="evaluatorName" label="评估人" width="120" />
          <el-table-column prop="evaluatorType" label="评估类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getEvaluatorTypeTag(row.evaluatorType)">
                {{ getEvaluatorTypeLabel(row.evaluatorType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="overallRating" label="总体评分" width="120">
            <template #default="{ row }">
              <el-rate 
                v-model="row.overallRating" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          <el-table-column prop="contentRating" label="内容评分" width="100" />
          <el-table-column prop="organizationRating" label="组织评分" width="100" />
          <el-table-column prop="serviceRating" label="服务评分" width="100" />
          <el-table-column prop="evaluationTime" label="评估时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.evaluationTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getEvaluationStatusTag(row.status)">
                {{ getEvaluationStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button 
                v-if="row.status === 0" 
                type="success" 
                size="small" 
                @click="handleApprove(row)"
              >
                审核
              </el-button>
              <el-button 
                v-if="!row.replyContent" 
                type="warning" 
                size="small" 
                @click="handleReply(row)"
              >
                回复
              </el-button>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 评估详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="评估详情" 
      width="70%"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentEvaluation" class="evaluation-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动名称">{{ currentEvaluation.activityTitle }}</el-descriptions-item>
          <el-descriptions-item label="评估人">{{ currentEvaluation.evaluatorName }}</el-descriptions-item>
          <el-descriptions-item label="评估类型">{{ getEvaluatorTypeLabel(currentEvaluation.evaluatorType) }}</el-descriptions-item>
          <el-descriptions-item label="评估时间">{{ formatDate(currentEvaluation.evaluationTime) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">评分详情</el-divider>
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="rating-item">
              <div class="rating-label">总体评分</div>
              <el-rate v-model="currentEvaluation.overallRating" disabled show-score />
            </div>
          </el-col>
          <el-col :span="6">
            <div class="rating-item">
              <div class="rating-label">内容评分</div>
              <el-rate v-model="currentEvaluation.contentRating" disabled show-score />
            </div>
          </el-col>
          <el-col :span="6">
            <div class="rating-item">
              <div class="rating-label">组织评分</div>
              <el-rate v-model="currentEvaluation.organizationRating" disabled show-score />
            </div>
          </el-col>
          <el-col :span="6">
            <div class="rating-item">
              <div class="rating-label">服务评分</div>
              <el-rate v-model="currentEvaluation.serviceRating" disabled show-score />
            </div>
          </el-col>
        </el-row>

        <el-divider content-position="left">评价内容</el-divider>
        <div class="evaluation-content">{{ currentEvaluation.comment || '暂无评价内容' }}</div>

        <el-divider content-position="left">优点</el-divider>
        <div class="evaluation-content">{{ currentEvaluation.strengths || '暂无' }}</div>

        <el-divider content-position="left">不足</el-divider>
        <div class="evaluation-content">{{ currentEvaluation.weaknesses || '暂无' }}</div>

        <el-divider content-position="left">建议</el-divider>
        <div class="evaluation-content">{{ currentEvaluation.suggestions || '暂无' }}</div>

        <div v-if="currentEvaluation.replyContent">
          <el-divider content-position="left">官方回复</el-divider>
          <div class="reply-content">
            <div class="reply-text">{{ currentEvaluation.replyContent }}</div>
            <div class="reply-time">回复时间：{{ formatDate(currentEvaluation.replyTime) }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="currentEvaluation && !currentEvaluation.replyContent" 
          type="primary" 
          @click="handleReplyFromDetail"
        >
          回复评估
        </el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog 
      v-model="replyDialogVisible" 
      title="回复评估" 
      width="50%"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input 
            v-model="replyForm.content" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入回复内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReply" :loading="replying">
          发送回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Search, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const replying = ref(false)
const currentEvaluation = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  activityId: undefined,
  status: undefined,
  ratingRange: undefined
})

// 回复表单
const replyForm = reactive({
  content: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 概览数据
const overviewData = reactive({
  totalEvaluations: 156,
  avgRating: 4.3,
  satisfactionRate: 87.5,
  responseRate: 92.3
})

// 活动列表
const activityList = ref([
  { id: 1, title: '春季亲子运动会' },
  { id: 2, title: '幼儿园开放日' },
  { id: 3, title: '家长座谈会' },
  { id: 4, title: '艺术展示活动' }
])

// 评估状态选项
const evaluationStatusOptions = [
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核不通过', value: 2 }
]

// 评估列表
const evaluationList = ref([
  {
    id: 1,
    activityTitle: '春季亲子运动会',
    evaluatorName: '张女士',
    evaluatorType: 1,
    overallRating: 5,
    contentRating: 5,
    organizationRating: 4,
    serviceRating: 5,
    evaluationTime: '2024-01-20 16:30:00',
    status: 1,
    comment: '活动组织得很好，孩子们玩得很开心！',
    strengths: '活动内容丰富，组织有序',
    weaknesses: '场地稍显拥挤',
    suggestions: '希望能增加更多互动环节',
    replyContent: '感谢您的宝贵建议，我们会持续改进！',
    replyTime: '2024-01-21 09:00:00'
  },
  {
    id: 2,
    activityTitle: '幼儿园开放日',
    evaluatorName: '李先生',
    evaluatorType: 1,
    overallRating: 4,
    contentRating: 4,
    organizationRating: 4,
    serviceRating: 4,
    evaluationTime: '2024-01-19 14:20:00',
    status: 0,
    comment: '整体不错，但还有改进空间',
    strengths: '老师很专业',
    weaknesses: '时间安排有点紧',
    suggestions: '建议延长参观时间'
  }
])

// 获取评估者类型标签
const getEvaluatorTypeTag = (type: number) => {
  const tagMap: Record<number, string> = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return tagMap[type] || ''
}

// 获取评估者类型标签
const getEvaluatorTypeLabel = (type: number) => {
  const labelMap: Record<number, string> = {
    1: '家长',
    2: '教师',
    3: '专家'
  }
  return labelMap[type] || '未知'
}

// 获取评估状态标签
const getEvaluationStatusTag = (status: number) => {
  const tagMap: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return tagMap[status] || ''
}

// 获取评估状态标签
const getEvaluationStatusLabel = (status: number) => {
  const option = evaluationStatusOptions.find(item => item.value === status)
  return option?.label || '未知'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 加载评估列表
const loadEvaluationList = async () => {
  loading.value = true
  try {
    // TODO: 调用实际API
    console.log('加载评估列表...')
    pagination.total = evaluationList.value.length
  } catch (error) {
    console.error('获取评估列表失败:', error)
    ElMessage.error('获取评估列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  pagination.page = 1
  loadEvaluationList()
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadEvaluationList()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    activityId: undefined,
    status: undefined,
    ratingRange: undefined
  })
  handleSearch()
}

// 新建评估
const handleCreateEvaluation = () => {
  router.push('/activity/evaluation/create')
}

// 导出评估
const handleExportEvaluations = () => {
  ElMessage.info('导出评估功能开发中...')
}

// 查看活动
const handleViewActivity = (row: any) => {
  router.push(`/activity/detail/${row.activityId}`)
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentEvaluation.value = row
  detailDialogVisible.value = true
}

// 审核评估
const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要审核通过这个评估吗？', '确认审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('审核成功')
    loadEvaluationList()
  } catch {
    // 用户取消
  }
}

// 回复评估
const handleReply = (row: any) => {
  currentEvaluation.value = row
  replyForm.content = ''
  replyDialogVisible.value = true
}

// 从详情回复
const handleReplyFromDetail = () => {
  replyForm.content = ''
  replyDialogVisible.value = true
}

// 提交回复
const handleSubmitReply = async () => {
  if (!replyForm.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replying.value = true
  try {
    // TODO: 调用回复API
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    detailDialogVisible.value = false
    loadEvaluationList()
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  } finally {
    replying.value = false
  }
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentEvaluation.value = null
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadEvaluationList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadEvaluationList()
}

onMounted(() => {
  loadEvaluationList()
})
</script>

<style scoped>
.overview-section,
.filter-section {
  margin-bottom: var(--text-3xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border-radius: var(--spacing-sm);
  color: white;
  margin-bottom: var(--text-lg);
}

.stat-icon {
  font-size: var(--text-4xl);
  margin-right: var(--text-lg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.pagination-container {
  margin-top: var(--text-2xl);
  text-align: right;
}

.evaluation-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.rating-item {
  text-align: center;
  margin-bottom: var(--text-lg);
}

.rating-label {
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.evaluation-content {
  padding: var(--text-xs);
  background-color: var(--bg-hover);
  border-radius: var(--spacing-xs);
  margin-bottom: var(--text-lg);
  white-space: pre-wrap;
  line-height: 1.6;
}

.reply-content {
  padding: var(--text-xs);
  background-color: #e8f4fd;
  border-radius: var(--spacing-xs);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.reply-text {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.reply-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
