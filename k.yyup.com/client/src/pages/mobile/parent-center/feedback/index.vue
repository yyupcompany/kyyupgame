<template>
  <MobileMainLayout
    title="家长反馈"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="parent-feedback-page">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-number">{{ feedbackStats.total }}</div>
            <div class="stat-label">已提交</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ feedbackStats.processing }}</div>
            <div class="stat-label">处理中</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ feedbackStats.resolved }}</div>
            <div class="stat-label">已解决</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <van-cell-group inset title="快捷操作">
          <van-cell
            title="家长管理"
            icon="friends-o"
            is-link
            @click="navigateToParentList"
          />
          <van-cell
            title="消息中心"
            icon="chat-o"
            is-link
            @click="navigateToMessages"
          />
          <van-cell
            title="沟通记录"
            icon="records"
            is-link
            @click="navigateToParentCommunication"
          />
        </van-cell-group>
      </div>

      <!-- Tab切换 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="提交反馈" name="submit">
          <div class="feedback-form">
            <van-cell-group inset>
              <van-field
                v-model="feedbackForm.type"
                is-link
                readonly
                label="反馈类型"
                placeholder="请选择反馈类型"
                @click="showTypePicker = true"
              />
              <van-field
                v-model="feedbackForm.title"
                label="标题"
                placeholder="请输入标题"
                maxlength="50"
                show-word-limit
              />
              <van-field
                v-model="feedbackForm.content"
                rows="6"
                autosize
                label="内容"
                type="textarea"
                maxlength="500"
                placeholder="请详细描述您的问题或建议"
                show-word-limit
              />
              <van-field name="uploader" label="图片上传">
                <template #input>
                  <van-uploader v-model="feedbackForm.images" :max-count="3" />
                </template>
              </van-field>
              <van-field
                v-model="feedbackForm.contact"
                label="联系方式"
                placeholder="请输入手机号或邮箱（选填）"
              />
            </van-cell-group>

            <div class="submit-button">
              <van-button type="primary" block @click="submitFeedback" :loading="submitting">
                提交反馈
              </van-button>
            </div>
          </div>
        </van-tab>

        <van-tab title="我的反馈" name="history">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <div class="feedback-list">
              <!-- 搜索和筛选 -->
              <van-cell-group inset>
                <van-field
                  v-model="searchKeyword"
                  placeholder="搜索反馈内容"
                  left-icon="search"
                  clearable
                  @input="onSearch"
                />
                <van-cell
                  title="状态筛选"
                  :value="selectedStatus || '全部'"
                  is-link
                  @click="showStatusFilter = true"
                />
              </van-cell-group>

              <!-- 反馈列表 -->
              <van-cell-group inset>
                <van-cell
                  v-for="record in filteredFeedbackRecords"
                  :key="record.id"
                  :title="record.title"
                  :label="record.time"
                  is-link
                  @click="viewFeedback(record)"
                >
                  <template #icon>
                    <van-tag
                      :type="getStatusType(record.status)"
                      size="medium"
                      style="margin-right: 8px;"
                    >
                      {{ record.status }}
                    </van-tag>
                  </template>
                </van-cell>
              </van-cell-group>

              <!-- 空状态 -->
              <van-empty
                v-if="filteredFeedbackRecords.length === 0"
                description="暂无反馈记录"
              />
            </div>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>

      <!-- 反馈类型选择器 -->
      <van-action-sheet
        v-model:show="showTypePicker"
        :actions="typeActions"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectType"
      />

      <!-- 状态筛选器 -->
      <van-action-sheet
        v-model:show="showStatusFilter"
        :actions="statusActions"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectStatus"
      />

      <!-- 反馈详情弹窗 -->
      <van-popup
        v-model:show="showDetail"
        position="bottom"
        :style="{ height: '80%' }"
        round
      >
        <div v-if="selectedRecord" class="feedback-detail">
          <div class="detail-header">
            <div class="detail-title">{{ selectedRecord.title }}</div>
            <van-tag :type="getStatusType(selectedRecord.status)">
              {{ selectedRecord.status }}
            </van-tag>
          </div>
          <div class="detail-content">
            <van-cell title="反馈类型" :value="selectedRecord.type" />
            <van-cell title="提交时间" :value="selectedRecord.time" />
            <van-cell title="联系方式" :value="selectedRecord.contact || '未提供'" />
            <div class="detail-text">
              <div class="detail-label">反馈内容：</div>
              <div class="detail-value">{{ selectedRecord.content }}</div>
            </div>
            <div v-if="selectedRecord.reply" class="detail-text">
              <div class="detail-label">回复内容：</div>
              <div class="detail-value reply-content">{{ selectedRecord.reply }}</div>
            </div>
          </div>
        </div>
      </van-popup>

      <van-back-top right="20" bottom="80" />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { showToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'

interface FeedbackForm {
  type: string
  title: string
  content: string
  images: any[]
  contact: string
}

interface FeedbackRecord {
  id: number
  title: string
  content: string
  type: string
  time: string
  status: string
  contact?: string
  reply?: string
}

interface FeedbackStats {
  total: number
  processing: number
  resolved: number
}

const router = useRouter()
const activeTab = ref('submit')
const showTypePicker = ref(false)
const showStatusFilter = ref(false)
const showDetail = ref(false)
const submitting = ref(false)
const refreshing = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedRecord = ref<FeedbackRecord | null>(null)

const feedbackForm = ref<FeedbackForm>({
  type: '',
  title: '',
  content: '',
  images: [],
  contact: ''
})

const feedbackStats = ref<FeedbackStats>({
  total: 0,
  processing: 0,
  resolved: 0
})

const typeActions = [
  { name: '功能建议', value: 'suggestion' },
  { name: '问题反馈', value: 'bug' },
  { name: '内容投诉', value: 'complaint' },
  { name: '服务建议', value: 'service' },
  { name: '其他', value: 'other' }
]

const statusActions = [
  { name: '全部', value: '' },
  { name: '待处理', value: 'pending' },
  { name: '处理中', value: 'processing' },
  { name: '已回复', value: 'replied' },
  { name: '已解决', value: 'resolved' }
]

const feedbackRecords = ref<FeedbackRecord[]>([])

// 计算过滤后的反馈记录
const filteredFeedbackRecords = computed(() => {
  let filtered = feedbackRecords.value

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record =>
      record.title.toLowerCase().includes(keyword) ||
      record.content.toLowerCase().includes(keyword)
    )
  }

  // 按状态过滤
  if (selectedStatus.value) {
    filtered = filtered.filter(record =>
      record.status === selectedStatus.value
    )
  }

  return filtered
})

// 导航函数
const navigateToParentList = () => {
  router.push('/parent')
}

const navigateToMessages = () => {
  router.push('/messages')
}

const navigateToParentCommunication = () => {
  router.push('/parent/communication/smart-hub')
}

// 加载反馈记录
const loadFeedbackRecords = async () => {
  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    // 模拟API调用，实际应该调用真实的反馈API
    const response = await request.get('/api/v1/ai/feedback', {
      params: {
        page: 1,
        pageSize: 50
      }
    })

    if (response.success && response.data) {
      const records = response.data.items || response.data.list || response.data || []

      // 转换数据格式
      feedbackRecords.value = records.map((item: any) => ({
        id: item.id,
        title: item.content?.substring(0, 50) || '反馈标题',
        content: item.content || '反馈内容',
        type: getFeedbackTypeName(item.feedbackType),
        time: new Date(item.createdAt).toLocaleString(),
        status: getFeedbackStatusText(item.status),
        contact: item.contact,
        reply: item.adminNotes
      }))

      // 更新统计数据
      updateStats()
    } else {
      // 如果API不可用，使用模拟数据
      loadMockData()
    }
  } catch (error) {
    console.error('加载反馈记录失败:', error)
    // 使用模拟数据作为备选
    loadMockData()
  } finally {
    closeToast()
  }
}

// 加载模拟数据（当API不可用时使用）
const loadMockData = () => {
  feedbackRecords.value = [
    {
      id: 1,
      title: '关于课程安排的建议',
      content: '希望增加更多的户外活动时间，让孩子们有更多接触大自然的机会。',
      type: '功能建议',
      time: '2024-01-15 10:30:00',
      status: '已解决',
      contact: '138****5678',
      reply: '感谢您的建议，我们已经增加了户外活动时间。'
    },
    {
      id: 2,
      title: 'APP使用问题反馈',
      content: '在查看孩子成长记录时，页面加载较慢，希望能够优化一下。',
      type: '问题反馈',
      time: '2024-01-14 14:20:00',
      status: '处理中',
      contact: 'user@example.com'
    },
    {
      id: 3,
      title: '食堂餐食建议',
      content: '希望能够增加更多蔬菜种类，保证营养均衡。',
      type: '服务建议',
      time: '2024-01-13 09:15:00',
      status: '待处理',
      contact: '139****1234'
    }
  ]

  updateStats()
}

// 更新统计数据
const updateStats = () => {
  feedbackStats.value = {
    total: feedbackRecords.value.length,
    processing: feedbackRecords.value.filter(r => r.status === '处理中').length,
    resolved: feedbackRecords.value.filter(r => r.status === '已解决').length
  }
}

// 获取反馈类型名称
const getFeedbackTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'suggestion': '功能建议',
    'bug': '问题反馈',
    'complaint': '内容投诉',
    'service': '服务建议',
    'general': '其他'
  }
  return typeMap[type] || '其他'
}

// 获取反馈状态文本
const getFeedbackStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'reviewed': '已查看',
    'processing': '处理中',
    'replied': '已回复',
    'resolved': '已解决',
    'ignored': '已忽略'
  }
  return statusMap[status] || '待处理'
}

const onSelectType = (action: any) => {
  feedbackForm.value.type = action.name
}

const onSelectStatus = (action: any) => {
  selectedStatus.value = action.value
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    '待处理': 'default',
    '已查看': 'primary',
    '处理中': 'warning',
    '已回复': 'success',
    '已解决': 'success',
    '已忽略': 'danger'
  }
  return types[status] || 'default'
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadFeedbackRecords()
  } finally {
    refreshing.value = false
  }
}

// 搜索功能
const onSearch = () => {
  // 计算属性会自动过滤，这里不需要额外处理
}

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackForm.value.type) {
    showToast('请选择反馈类型')
    return
  }
  if (!feedbackForm.value.title) {
    showToast('请输入标题')
    return
  }
  if (!feedbackForm.value.content) {
    showToast('请输入反馈内容')
    return
  }
  if (feedbackForm.value.content.length < 10) {
    showToast('反馈内容至少10个字')
    return
  }

  submitting.value = true

  try {
    // 准备提交数据
    const feedbackType = typeActions.find(action => action.name === feedbackForm.value.type)?.value || 'other'
    const submitData = {
      feedbackType,
      sourceType: 'application',
      content: `[${feedbackForm.value.title}] ${feedbackForm.value.content}`,
      contact: feedbackForm.value.contact,
      images: feedbackForm.value.images.map((img: any) => img.url).filter(Boolean)
    }

    // 调用AI反馈API
    const response = await request.post('/api/v1/ai/feedback', submitData)

    if (response.success || response.data) {
      showSuccessToast('提交成功，感谢您的反馈！')

      // 重置表单
      feedbackForm.value = {
        type: '',
        title: '',
        content: '',
        images: [],
        contact: ''
      }

      // 切换到历史记录Tab并刷新
      activeTab.value = 'history'
      await loadFeedbackRecords()
    } else {
      showToast(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    showToast('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 查看反馈详情
const viewFeedback = (record: FeedbackRecord) => {
  selectedRecord.value = record
  showDetail.value = true
}

onMounted(() => {
  loadFeedbackRecords()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.parent-feedback-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background-color: var(--van-background-color-light);
}

// 统计卡片样式
.stats-section {
  padding: var(--spacing-md);

  .stats-cards {
    display: flex;
    gap: var(--spacing-md);
    justify-content: space-between;

    .stat-card {
      flex: 1;
      background: var(--card-bg);
      border-radius: 12px;
      padding: var(--spacing-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .stat-number {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}

// 快捷操作样式
.quick-actions {
  margin-bottom: 12px;
}

// 反馈表单样式
.feedback-form {
  padding: 0 0 20px 0;
}

.submit-button {
  padding: var(--spacing-md);
}

// 反馈列表样式
.feedback-list {
  padding: var(--spacing-md) 0 20px 0;
}

// 反馈详情弹窗样式
.feedback-detail {
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--van-border-color);

    .detail-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color-1);
      flex: 1;
      margin-right: 12px;
    }
  }

  .detail-content {
    .detail-text {
      margin: var(--spacing-md) 0;

      .detail-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--van-text-color-1);
        margin-bottom: 8px;
      }

      .detail-value {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.6;
        background: var(--van-background-color);
        padding: var(--spacing-md);
        border-radius: 8px;

        &.reply-content {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .parent-feedback-page {
    max-width: 768px;
    margin: 0 auto;
  }

  .stats-section .stats-cards {
    max-width: 600px;
    margin: 0 auto;
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .feedback-detail .detail-content .detail-value.reply-content {
    background: #1e293b;
    border-color: #334155;
  }
}
</style>

