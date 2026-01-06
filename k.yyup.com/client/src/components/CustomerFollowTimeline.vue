<template>
  <div class="customer-follow-timeline">
    <!-- 客户基本信息 -->
    <el-card class="customer-info-card" shadow="never">
      <div class="customer-header">
        <div class="customer-basic">
          <h3>{{ customerInfo.customerName }}</h3>
          <p>孩子：{{ customerInfo.childName }} ({{ customerInfo.childAge }}岁)</p>
          <p>电话：{{ customerInfo.contactPhone }}</p>
        </div>
        <div class="customer-status">
          <el-tag :type="getStatusType(currentStage)" size="large">
            {{ getStageDisplayName(currentStage) }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 阶段进度条 -->
    <el-card class="progress-card" shadow="never">
      <el-steps :active="currentStage - 1" align-center>
        <el-step 
          v-for="stage in stageConfigurations" 
          :key="stage.id"
          :title="stage.stageName"
          :description="stage.stageDescription"
        />
      </el-steps>
    </el-card>

    <!-- 跟进时间线 -->
    <el-card class="timeline-card" shadow="never">
      <div class="timeline-header">
        <h4>跟进记录</h4>
        <el-button 
          type="primary" 
          @click="showAddRecordDialog = true"
          :disabled="loading"
        >
          添加跟进记录
        </el-button>
      </div>

      <el-timeline v-loading="loading">
        <el-timeline-item
          v-for="item in timelineData"
          :key="item.id"
          :timestamp="formatDate(item.createdAt)"
          :type="getTimelineType(item.stageStatus)"
          placement="top"
        >
          <el-card class="timeline-item-card">
            <!-- 记录头部 -->
            <div class="record-header">
              <div class="record-title">
                <el-tag size="small">{{ item.stageName }}</el-tag>
                <span class="sub-stage">{{ item.subStage }}</span>
                <el-tag size="small" :type="getStatusTagType(item.stageStatus)">
                  {{ getStatusText(item.stageStatus) }}
                </el-tag>
              </div>
              <div class="record-actions">
                <el-button 
                  size="small" 
                  type="text" 
                  @click="showAISuggestions(item)"
                  :loading="aiLoading[item.id]"
                >
                  <UnifiedIcon name="default" />
                  AI建议
                </el-button>
                <el-button size="small" type="text" @click="editRecord(item)">
                  编辑
                </el-button>
              </div>
            </div>

            <!-- 跟进内容 -->
            <div class="record-content">
              <p><strong>跟进方式：</strong>{{ item.followType }}</p>
              <p><strong>跟进内容：</strong></p>
              <div class="content-text">{{ item.content }}</div>
              
              <div v-if="item.customerFeedback" class="customer-feedback">
                <p><strong>客户反馈：</strong></p>
                <div class="feedback-text">{{ item.customerFeedback }}</div>
              </div>
            </div>

            <!-- 媒体文件 -->
            <div v-if="item.mediaFiles && item.mediaFiles.length > 0" class="media-files">
              <p><strong>附件：</strong></p>
              <div class="media-grid">
                <div 
                  v-for="media in item.mediaFiles" 
                  :key="media.id"
                  class="media-item"
                  @click="previewMedia(media)"
                >
                  <el-image 
                    v-if="media.mediaType === 'image'"
                    :src="media.filePath"
                    :preview-src-list="[media.filePath]"
                    fit="cover"
                    class="media-thumbnail"
                  />
                  <div v-else class="file-icon">
                    <UnifiedIcon name="default" />
                    <span>{{ media.fileName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI建议展示 -->
            <div v-if="item.aiSuggestions && showAI[item.id]" class="ai-suggestions">
              <el-divider content-position="left">
                <UnifiedIcon name="default" />
                AI智能建议
              </el-divider>
              
              <div class="suggestion-section">
                <h5>沟通策略</h5>
                <p>{{ item.aiSuggestions.suggestions.communicationStrategy }}</p>
              </div>

              <div class="suggestion-section">
                <h5>推荐行动</h5>
                <ul>
                  <li v-for="action in item.aiSuggestions.suggestions.recommendedActions" :key="action">
                    {{ action }}
                  </li>
                </ul>
              </div>

              <div class="suggestion-section">
                <h5>关键话术</h5>
                <ul>
                  <li v-for="point in item.aiSuggestions.suggestions.talkingPoints" :key="point">
                    {{ point }}
                  </li>
                </ul>
              </div>

              <div class="suggestion-section">
                <h5>下一步时机</h5>
                <p>{{ item.aiSuggestions.suggestions.nextStepTiming }}</p>
              </div>

              <div class="suggestion-section">
                <h5>成功技巧</h5>
                <ul>
                  <li v-for="tip in item.aiSuggestions.suggestions.successTips" :key="tip">
                    {{ tip }}
                  </li>
                </ul>
              </div>

              <div class="ai-confidence">
                <el-tag size="small" type="info">
                  置信度: {{ Math.round(item.aiSuggestions.confidence * 100) }}%
                </el-tag>
              </div>
            </div>

            <!-- 记录底部 -->
            <div class="record-footer">
              <span class="teacher-name">{{ item.teacherName }}</span>
              <span v-if="item.completedAt" class="completed-time">
                完成时间: {{ formatDate(item.completedAt) }}
              </span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 添加跟进记录对话框 -->
    <AddFollowRecordDialog
      v-model="showAddRecordDialog"
      :customer-id="customerId"
      :stage-configurations="stageConfigurations"
      @success="handleAddSuccess"
    />

    <!-- 编辑跟进记录对话框 -->
    <EditFollowRecordDialog
      v-model="showEditRecordDialog"
      :record="editingRecord"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Document } from '@element-plus/icons-vue'
import CustomerFollowEnhancedAPI, { 
  type TimelineItem, 
  type StageConfiguration 
} from '@/api/modules/customer-follow-enhanced'
import AddFollowRecordDialog from './AddFollowRecordDialog.vue'
import EditFollowRecordDialog from './EditFollowRecordDialog.vue'

// Props
interface Props {
  customerId: number
  customerInfo: {
    customerName: string
    childName: string
    childAge: number
    contactPhone: string
  }
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const timelineData = ref<TimelineItem[]>([])
const stageConfigurations = ref<StageConfiguration[]>([])
const showAddRecordDialog = ref(false)
const showEditRecordDialog = ref(false)
const editingRecord = ref<TimelineItem | null>(null)
const showAI = reactive<Record<number, boolean>>({})
const aiLoading = reactive<Record<number, boolean>>({})

// 计算属性
const currentStage = computed(() => {
  if (timelineData.value.length === 0) return 1
  const lastRecord = timelineData.value[timelineData.value.length - 1]
  return lastRecord.stage
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const [timeline, stages] = await Promise.all([
      CustomerFollowEnhancedAPI.getCustomerTimeline(props.customerId),
      CustomerFollowEnhancedAPI.getStageConfigurations()
    ])
    
    timelineData.value = timeline
    stageConfigurations.value = stages
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const showAISuggestions = async (item: TimelineItem) => {
  if (showAI[item.id]) {
    showAI[item.id] = false
    return
  }

  if (!item.aiSuggestions) {
    aiLoading[item.id] = true
    try {
      const suggestions = await CustomerFollowEnhancedAPI.getAISuggestions(item.id)
      // 更新本地数据
      const index = timelineData.value.findIndex(t => t.id === item.id)
      if (index !== -1) {
        timelineData.value[index].aiSuggestions = suggestions
      }
    } catch (error) {
      console.error('获取AI建议失败:', error)
      ElMessage.error('获取AI建议失败')
    } finally {
      aiLoading[item.id] = false
    }
  }

  showAI[item.id] = true
}

const editRecord = (item: TimelineItem) => {
  editingRecord.value = item
  showEditRecordDialog.value = true
}

const handleAddSuccess = () => {
  showAddRecordDialog.value = false
  loadData()
  ElMessage.success('添加跟进记录成功')
}

const handleEditSuccess = () => {
  showEditRecordDialog.value = false
  editingRecord.value = null
  loadData()
  ElMessage.success('更新跟进记录成功')
}

const getStageDisplayName = (stage: number) => {
  const stageNames = {
    1: '初期接触', 2: '需求挖掘', 3: '方案展示', 4: '实地体验',
    5: '异议处理', 6: '促成决策', 7: '缴费确认', 8: '入园准备'
  }
  return stageNames[stage as keyof typeof stageNames] || '未知阶段'
}

const getStatusType = (stage: number) => {
  if (stage <= 2) return 'info'
  if (stage <= 4) return 'warning'
  if (stage <= 6) return 'primary'
  return 'success'
}

const getTimelineType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'primary'
    case 'skipped': return 'warning'
    default: return 'info'
  }
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'primary'
    case 'skipped': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'in_progress': return '进行中'
    case 'skipped': return '已跳过'
    case 'pending': return '待处理'
    default: return '未知'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const previewMedia = (media: any) => {
  // 处理媒体文件预览
  console.log('预览媒体文件:', media)
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.customer-follow-timeline {
  padding: var(--spacing-xl);
}

.customer-info-card {
  margin-bottom: var(--spacing-xl);
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-basic h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.customer-basic p {
  margin: var(--spacing-base) 0;
  color: var(--text-regular);
}

.progress-card {
  margin-bottom: var(--spacing-xl);
}

.timeline-card {
  margin-bottom: var(--spacing-xl);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.timeline-item-card {
  margin-bottom: var(--spacing-2xl);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.record-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.sub-stage {
  font-weight: 500;
  color: var(--text-regular);
}

.record-content {
  margin-bottom: var(--spacing-4xl);
}

.content-text, .feedback-text {
  background: var(--bg-hover);
  padding: var(--spacing-2xl);
  border-radius: var(--spacing-xs);
  margin-top: var(--spacing-base);
  line-height: 1.6;
}

.customer-feedback {
  margin-top: var(--spacing-4xl);
}

.media-files {
  margin: var(--spacing-4xl) 0;
}

.media-grid {
  display: flex;
  gap: var(--spacing-2xl);
  flex-wrap: wrap;
}

.media-item {
  cursor: pointer;
}

.media-thumbnail {
  width: var(--avatar-size); height: var(--avatar-size);
  border-radius: var(--spacing-xs);
}

.file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2xl);
  border: var(--border-width-base) dashed var(--border-color);
  border-radius: var(--spacing-xs);
  width: var(--avatar-size); height: var(--avatar-size);
  justify-content: center;
}

.ai-suggestions {
  margin-top: var(--spacing-xl);
  background: #f0f9ff;
  padding: var(--spacing-4xl);
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.suggestion-section {
  margin-bottom: var(--spacing-4xl);
}

.suggestion-section h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.suggestion-section ul {
  margin: 0;
  padding-left: var(--spacing-xl);
}

.suggestion-section li {
  margin-bottom: var(--spacing-base);
  line-height: 1.5;
}

.ai-confidence {
  text-align: right;
  margin-top: var(--spacing-2xl);
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-4xl);
  border-top: var(--z-index-dropdown) solid #ebeef5;
  color: var(--info-color);
  font-size: var(--text-sm);
}
</style>
