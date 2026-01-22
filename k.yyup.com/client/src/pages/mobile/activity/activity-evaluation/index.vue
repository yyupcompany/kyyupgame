<template>
  <MobileCenterLayout title="活动评价" back-path="/mobile/activity/activity-index">
    <div class="activity-evaluation-mobile">
      <!-- 评估概览 -->
      <div class="overview-section">
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-value">{{ overviewData.totalEvaluations }}</div>
            <div class="overview-label">总评估数</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ overviewData.avgRating }}/5</div>
            <div class="overview-label">平均评分</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ overviewData.satisfactionRate }}%</div>
            <div class="overview-label">满意度</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ overviewData.responseRate }}%</div>
            <div class="overview-label">回复率</div>
          </div>
        </div>
      </div>

      <!-- 筛选条件 -->
      <van-sticky offset-top="46">
        <div class="filter-section">
          <van-dropdown-menu>
            <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
            <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
            <van-dropdown-item v-model="filterRating" :options="ratingOptions" @change="onFilter" />
          </van-dropdown-menu>
        </div>
      </van-sticky>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button type="primary" size="small" icon="plus" @click="handleCreate">
          新建评估
        </van-button>
        <van-button size="small" icon="down" @click="handleExport">
          导出
        </van-button>
      </div>

      <!-- 评估列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="evaluation-list">
            <div
              v-for="item in evaluationList"
              :key="item.id"
              class="evaluation-card"
              @click="handleViewDetail(item)"
            >
              <div class="evaluation-header">
                <div class="activity-title">{{ item.activityTitle }}</div>
                <van-tag :type="getStatusTagType(item.status)" size="medium">
                  {{ getStatusLabel(item.status) }}
                </van-tag>
              </div>
              <div class="evaluation-content">
                <div class="evaluator-info">
                  <van-icon name="user-o" />
                  <span>{{ item.evaluatorName }}</span>
                  <van-tag size="medium" plain>{{ getEvaluatorTypeLabel(item.evaluatorType) }}</van-tag>
                </div>
                <div class="rating-row">
                  <span class="rating-label">总体评分</span>
                  <van-rate v-model="item.overallRating" readonly allow-half size="14" />
                  <span class="rating-value">{{ item.overallRating }}分</span>
                </div>
                <div class="detail-ratings">
                  <span>内容: {{ item.contentRating }}</span>
                  <span>组织: {{ item.organizationRating }}</span>
                  <span>服务: {{ item.serviceRating }}</span>
                </div>
                <div class="evaluation-time">
                  <van-icon name="clock-o" />
                  {{ formatDate(item.evaluationTime) }}
                </div>
              </div>
              <div class="evaluation-actions" @click.stop>
                <van-button size="mini" type="primary" @click="handleViewDetail(item)">详情</van-button>
                <van-button v-if="item.status === 0" size="mini" type="success" @click="handleApprove(item)">审核</van-button>
                <van-button v-if="!item.replyContent" size="mini" @click="handleReply(item)">回复</van-button>
              </div>
            </div>
          </div>

          <van-empty v-if="evaluationList.length === 0 && !listLoading" description="暂无评估数据" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 评估详情弹窗 -->
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
      closeable
    >
      <div class="detail-popup" v-if="currentEvaluation">
        <div class="popup-title">评估详情</div>
        <van-cell-group inset>
          <van-cell title="活动名称" :value="currentEvaluation.activityTitle" />
          <van-cell title="评估人" :value="currentEvaluation.evaluatorName" />
          <van-cell title="评估类型" :value="getEvaluatorTypeLabel(currentEvaluation.evaluatorType)" />
          <van-cell title="总体评分">
            <template #value>
              <van-rate v-model="currentEvaluation.overallRating" readonly allow-half size="16" />
            </template>
          </van-cell>
          <van-cell title="内容评分" :value="`${currentEvaluation.contentRating}分`" />
          <van-cell title="组织评分" :value="`${currentEvaluation.organizationRating}分`" />
          <van-cell title="服务评分" :value="`${currentEvaluation.serviceRating}分`" />
          <van-cell title="评估时间" :value="formatDate(currentEvaluation.evaluationTime)" />
          <van-cell title="状态" :value="getStatusLabel(currentEvaluation.status)" />
        </van-cell-group>
        
        <van-cell-group inset title="评价内容" v-if="currentEvaluation.comment">
          <div class="comment-content">{{ currentEvaluation.comment }}</div>
        </van-cell-group>

        <van-cell-group inset title="回复内容" v-if="currentEvaluation.replyContent">
          <div class="reply-content">{{ currentEvaluation.replyContent }}</div>
        </van-cell-group>

        <div class="detail-actions">
          <van-button v-if="currentEvaluation.status === 0" type="success" block @click="handleApprove(currentEvaluation)">审核通过</van-button>
          <van-button v-if="!currentEvaluation.replyContent" type="primary" block @click="handleReply(currentEvaluation)">回复评价</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 回复弹窗 -->
    <van-popup
      v-model:show="showReplyPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
      closeable
    >
      <div class="reply-popup">
        <div class="popup-title">回复评价</div>
        <van-field
          v-model="replyContent"
          type="textarea"
          rows="5"
          placeholder="请输入回复内容"
          maxlength="500"
          show-word-limit
        />
        <div class="reply-actions">
          <van-button type="primary" block :loading="replying" @click="submitReply">提交回复</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 新建评估弹窗 -->
    <van-popup
      v-model:show="showCreatePopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
      closeable
    >
      <div class="create-popup">
        <div class="popup-title">新建评估</div>
        <van-form @submit="onCreateSubmit">
          <van-cell-group inset>
            <van-field
              v-model="createForm.activityName"
              is-link
              readonly
              label="选择活动"
              placeholder="请选择活动"
              required
              @click="showActivityPicker = true"
            />
            <van-field label="总体评分" required>
              <template #input>
                <van-rate v-model="createForm.overallRating" allow-half />
              </template>
            </van-field>
            <van-field label="内容评分">
              <template #input>
                <van-rate v-model="createForm.contentRating" allow-half />
              </template>
            </van-field>
            <van-field label="组织评分">
              <template #input>
                <van-rate v-model="createForm.organizationRating" allow-half />
              </template>
            </van-field>
            <van-field label="服务评分">
              <template #input>
                <van-rate v-model="createForm.serviceRating" allow-half />
              </template>
            </van-field>
            <van-field
              v-model="createForm.comment"
              label="评价内容"
              type="textarea"
              rows="3"
              placeholder="请输入评价内容"
              maxlength="500"
              show-word-limit
            />
          </van-cell-group>
          <div class="create-actions">
            <van-button type="primary" block native-type="submit" :loading="creating">提交评估</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 活动选择器 -->
    <van-popup v-model:show="showActivityPicker" position="bottom" round>
      <van-picker
        title="选择活动"
        :columns="activityPickerOptions"
        @confirm="onActivityConfirm"
        @cancel="showActivityPicker = false"
      />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog, showLoadingToast, closeToast, showFailToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

// 概览数据
const overviewData = reactive({
  totalEvaluations: 156,
  avgRating: 4.2,
  satisfactionRate: 86,
  responseRate: 72
})

// 筛选
const filterActivity = ref('')
const filterStatus = ref('')
const filterRating = ref('')

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' },
  { text: '亲子活动', value: '3' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待审核', value: 0 },
  { text: '已通过', value: 1 },
  { text: '已回复', value: 2 }
]

const ratingOptions = [
  { text: '全部评分', value: '' },
  { text: '5分 (优秀)', value: 5 },
  { text: '4分 (良好)', value: 4 },
  { text: '3分 (一般)', value: 3 },
  { text: '2分 (较差)', value: 2 },
  { text: '1分 (很差)', value: 1 }
]

// 列表状态
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)

interface Evaluation {
  id: number
  activityId: number
  activityTitle: string
  evaluatorName: string
  evaluatorType: string
  overallRating: number
  contentRating: number
  organizationRating: number
  serviceRating: number
  evaluationTime: string
  status: number
  comment?: string
  replyContent?: string
}

const evaluationList = ref<Evaluation[]>([])

// 状态和类型转换
const getStatusTagType = (status: number): TagType => {
  const map: Record<number, TagType> = { 0: 'warning', 1: 'success', 2: 'primary' }
  return map[status] || 'default'
}

const getStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已回复' }
  return map[status] || '未知'
}

const getEvaluatorTypeLabel = (type: string) => {
  const map: Record<string, string> = { parent: '家长', teacher: '教师', student: '学生' }
  return map[type] || type
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 加载数据
const loadData = async () => {
  const mockData: Evaluation[] = [
    { id: 1, activityId: 1, activityTitle: '开放日活动', evaluatorName: '张家长', evaluatorType: 'parent', overallRating: 4.5, contentRating: 4, organizationRating: 5, serviceRating: 4, evaluationTime: '2025-01-05 14:30:00', status: 1, comment: '活动组织得很好，孩子很喜欢！' },
    { id: 2, activityId: 1, activityTitle: '开放日活动', evaluatorName: '李家长', evaluatorType: 'parent', overallRating: 5, contentRating: 5, organizationRating: 5, serviceRating: 5, evaluationTime: '2025-01-05 15:20:00', status: 2, comment: '非常棒的活动，希望多举办！', replyContent: '感谢您的支持，我们会继续努力！' },
    { id: 3, activityId: 2, activityTitle: '家长会', evaluatorName: '王家长', evaluatorType: 'parent', overallRating: 3.5, contentRating: 3, organizationRating: 4, serviceRating: 3, evaluationTime: '2025-01-04 10:00:00', status: 0, comment: '建议增加互动环节' },
    { id: 4, activityId: 3, activityTitle: '亲子运动会', evaluatorName: '赵家长', evaluatorType: 'parent', overallRating: 4, contentRating: 4, organizationRating: 4, serviceRating: 4, evaluationTime: '2025-01-03 16:45:00', status: 1, comment: '运动会很有趣，孩子玩得很开心' }
  ]
  return mockData
}

const onLoad = async () => {
  listLoading.value = true
  try {
    const data = await loadData()
    evaluationList.value = data
    finished.value = true
  } finally {
    listLoading.value = false
  }
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onFilter = () => {
  evaluationList.value = []
  finished.value = false
  onLoad()
}

// 详情
const showDetailPopup = ref(false)
const currentEvaluation = ref<Evaluation | null>(null)

const handleViewDetail = (item: Evaluation) => {
  currentEvaluation.value = item
  showDetailPopup.value = true
}

// 审核
const handleApprove = (item: Evaluation) => {
  showConfirmDialog({
    title: '审核确认',
    message: '确定通过此评估？'
  }).then(async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    item.status = 1
    showSuccessToast('审核通过')
    showDetailPopup.value = false
  }).catch(() => {})
}

// 回复
const showReplyPopup = ref(false)
const replyContent = ref('')
const replying = ref(false)
const replyingItem = ref<Evaluation | null>(null)

const handleReply = (item: Evaluation) => {
  replyingItem.value = item
  replyContent.value = ''
  showDetailPopup.value = false
  showReplyPopup.value = true
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    showToast('请输入回复内容')
    return
  }
  replying.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (replyingItem.value) {
      replyingItem.value.replyContent = replyContent.value
      replyingItem.value.status = 2
    }
    showSuccessToast('回复成功')
    showReplyPopup.value = false
  } finally {
    replying.value = false
  }
}

// 新建评估
const showCreatePopup = ref(false)
const showActivityPicker = ref(false)
const creating = ref(false)

const activityPickerOptions = [
  { text: '开放日活动', value: 1 },
  { text: '家长会', value: 2 },
  { text: '亲子运动会', value: 3 }
]

const createForm = reactive({
  activityId: 0,
  activityName: '',
  overallRating: 0,
  contentRating: 0,
  organizationRating: 0,
  serviceRating: 0,
  comment: ''
})

const handleCreate = () => {
  createForm.activityId = 0
  createForm.activityName = ''
  createForm.overallRating = 0
  createForm.contentRating = 0
  createForm.organizationRating = 0
  createForm.serviceRating = 0
  createForm.comment = ''
  showCreatePopup.value = true
}

const onActivityConfirm = ({ selectedOptions }: any) => {
  showActivityPicker.value = false
  if (selectedOptions[0]) {
    createForm.activityId = selectedOptions[0].value
    createForm.activityName = selectedOptions[0].text
  }
}

const onCreateSubmit = async () => {
  if (!createForm.activityId) {
    showToast('请选择活动')
    return
  }
  if (createForm.overallRating === 0) {
    showToast('请评分')
    return
  }
  creating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccessToast('评估提交成功')
    showCreatePopup.value = false
    onRefresh()
  } finally {
    creating.value = false
  }
}

// 导出
const handleExport = async () => {
  showLoadingToast({ message: '导出中...', forbidClick: true })
  
  try {
    // 生成导出内容
    const exportData = {
      overview: overviewData,
      evaluations: evaluationList.value,
      exportTime: new Date().toISOString()
    }
    
    const content = JSON.stringify(exportData, null, 2)
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `活动评估_${new Date().toLocaleDateString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    closeToast()
    showSuccessToast('导出成功')
  } catch (error: any) {
    closeToast()
    showFailToast(error?.message || '导出失败')
  }
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped lang="scss">
.activity-evaluation-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.overview-section {
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  padding: 16px;
  margin: 12px;
  border-radius: 8px;

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .overview-item {
    text-align: center;
    color: #fff;

    .overview-value {
      font-size: 20px;
      font-weight: 600;
    }

    .overview-label {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
}

.filter-section {
  background: #fff;
}

.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 12px;
}

.evaluation-list {
  padding: 0 12px;
}

.evaluation-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .activity-title {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
    }
  }

  .evaluation-content {
    .evaluator-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #646566;
      margin-bottom: 8px;
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .rating-label {
        font-size: 13px;
        color: #969799;
      }

      .rating-value {
        font-size: 13px;
        color: #ff9800;
        font-weight: 500;
      }
    }

    .detail-ratings {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #969799;
      margin-bottom: 8px;
    }

    .evaluation-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #c8c9cc;
    }
  }

  .evaluation-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebedf0;
  }
}

.detail-popup,
.reply-popup,
.create-popup {
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  .popup-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 16px;
  }

  .comment-content,
  .reply-content {
    padding: 12px 16px;
    font-size: 14px;
    color: #646566;
    line-height: 1.6;
  }

  .detail-actions,
  .reply-actions,
  .create-actions {
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
