<template>
  <MobileCenterLayout title="活动反馈" back-path="/mobile/activity/activity-index">
    <div class="activity-feedback-mobile">
      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onFilter" />
      </van-dropdown-menu>

      <!-- 反馈列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="feedback-list">
            <div v-for="item in feedbackList" :key="item.id" class="feedback-card">
              <div class="card-header">
                <div class="user-info">
                  <van-image :src="item.avatar || 'https://via.placeholder.com/36'" width="36" height="36" round />
                  <div class="user-detail">
                    <span class="user-name">{{ item.userName }}</span>
                    <van-tag size="medium" :type="getFeedbackTypeTag(item.type)">{{ getFeedbackTypeLabel(item.type) }}</van-tag>
                  </div>
                </div>
                <span class="feedback-time">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="card-content">
                <div class="activity-name">{{ item.activityTitle }}</div>
                <div class="feedback-text">{{ item.content }}</div>
                <div class="feedback-images" v-if="item.images && item.images.length > 0">
                  <van-image v-for="(img, i) in item.images" :key="i" :src="img" width="60" height="60" fit="cover" radius="4" @click="previewImage(item.images, i)" />
                </div>
              </div>
              <div class="card-footer">
                <div class="reply-info" v-if="item.reply">
                  <van-icon name="chat-o" />
                  <span>已回复</span>
                </div>
                <van-button size="mini" type="primary" @click="handleReply(item)" v-else>回复</van-button>
              </div>
            </div>
          </div>
          <van-empty v-if="feedbackList.length === 0 && !loading" description="暂无反馈" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 回复弹窗 -->
    <van-popup v-model:show="showReply" position="bottom" round :style="{ height: '50%' }" closeable>
      <div class="reply-popup">
        <div class="popup-title">回复反馈</div>
        <van-field v-model="replyContent" type="textarea" rows="4" placeholder="请输入回复内容" maxlength="300" show-word-limit />
        <div class="reply-actions">
          <van-button type="primary" block :loading="replying" @click="submitReply">提交回复</van-button>
        </div>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast, showImagePreview } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterActivity = ref('')
const filterType = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' }
]

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '建议', value: 'suggestion' },
  { text: '问题', value: 'problem' },
  { text: '表扬', value: 'praise' }
]

interface Feedback {
  id: number
  userName: string
  avatar?: string
  activityId: number
  activityTitle: string
  type: string
  content: string
  images?: string[]
  createdAt: string
  reply?: string
}

const feedbackList = ref<Feedback[]>([])
const showReply = ref(false)
const replyContent = ref('')
const replying = ref(false)
const currentFeedback = ref<Feedback | null>(null)

const getFeedbackTypeTag = (type: string): TagType => {
  const map: Record<string, TagType> = { suggestion: 'primary', problem: 'danger', praise: 'success' }
  return map[type] || 'default'
}

const getFeedbackTypeLabel = (type: string) => {
  const map: Record<string, string> = { suggestion: '建议', problem: '问题', praise: '表扬' }
  return map[type] || '其他'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadData = async () => {
  const mockData: Feedback[] = [
    { id: 1, userName: '张家长', activityId: 1, activityTitle: '开放日活动', type: 'suggestion', content: '建议增加更多亲子互动环节，让孩子和家长能有更多互动时间。', createdAt: '2025-01-05 14:30:00' },
    { id: 2, userName: '李家长', activityId: 1, activityTitle: '开放日活动', type: 'praise', content: '活动组织得非常好，孩子很喜欢！老师们很亲切！', createdAt: '2025-01-05 15:20:00', reply: '感谢您的支持！' },
    { id: 3, userName: '王家长', activityId: 2, activityTitle: '家长会', type: 'problem', content: '会议室座位不够，部分家长只能站着。', images: ['https://via.placeholder.com/200'], createdAt: '2025-01-04 10:00:00' }
  ]
  return mockData
}

const onLoad = async () => {
  loading.value = true
  const data = await loadData()
  feedbackList.value = data
  loading.value = false
  finished.value = true
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onFilter = () => { onRefresh() }

const previewImage = (images: string[], index: number) => {
  showImagePreview({ images, startPosition: index })
}

const handleReply = (item: Feedback) => {
  currentFeedback.value = item
  replyContent.value = ''
  showReply.value = true
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    showToast('请输入回复内容')
    return
  }
  replying.value = true
  await new Promise(r => setTimeout(r, 1000))
  if (currentFeedback.value) {
    currentFeedback.value.reply = replyContent.value
  }
  replying.value = false
  showReply.value = false
  showSuccessToast('回复成功')
}

onMounted(() => { onLoad() })
</script>

<style scoped lang="scss">
.activity-feedback-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.feedback-list {
  padding: 12px;
}

.feedback-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .user-detail {
        display: flex;
        align-items: center;
        gap: 6px;
        .user-name { font-size: 14px; font-weight: 500; }
      }
    }

    .feedback-time {
      font-size: 12px;
      color: #969799;
    }
  }

  .card-content {
    .activity-name {
      font-size: 12px;
      color: #1989fa;
      margin-bottom: 4px;
    }

    .feedback-text {
      font-size: 14px;
      color: #323233;
      line-height: 1.5;
    }

    .feedback-images {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebedf0;

    .reply-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #07c160;
    }
  }
}

.reply-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
  .reply-actions { padding: 16px 0; }
}
</style>
