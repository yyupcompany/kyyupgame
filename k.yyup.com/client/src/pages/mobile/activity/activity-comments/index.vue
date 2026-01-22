<template>
  <MobileCenterLayout title="活动评论" back-path="/mobile/activity/activity-index">
    <div class="activity-comments-mobile">
      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
      </van-dropdown-menu>

      <!-- 评论列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="comment-list">
            <div v-for="item in commentList" :key="item.id" class="comment-card">
              <div class="comment-header">
                <van-image :src="item.avatar || 'https://via.placeholder.com/40'" width="40" height="40" round />
                <div class="user-info">
                  <div class="user-name">{{ item.userName }}</div>
                  <div class="comment-meta">
                    <span>{{ item.activityTitle }}</span>
                    <span>·</span>
                    <span>{{ formatDate(item.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="comment-content">{{ item.content }}</div>
              <div class="comment-actions">
                <van-button size="mini" icon="like-o" @click="handleLike(item)">{{ item.likeCount }}</van-button>
                <van-button size="mini" icon="chat-o" @click="handleReply(item)">回复</van-button>
              </div>
              <!-- 回复列表 -->
              <div class="reply-list" v-if="item.replies && item.replies.length > 0">
                <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                  <span class="reply-user">{{ reply.userName }}</span>
                  <span class="reply-content">{{ reply.content }}</span>
                </div>
              </div>
            </div>
          </div>
          <van-empty v-if="commentList.length === 0 && !loading" description="暂无评论" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 回复弹窗 -->
    <van-popup v-model:show="showReply" position="bottom" round :style="{ height: '40%' }" closeable>
      <div class="reply-popup">
        <div class="popup-title">回复评论</div>
        <van-field v-model="replyContent" type="textarea" rows="3" placeholder="请输入回复内容" maxlength="200" show-word-limit />
        <div class="reply-actions">
          <van-button type="primary" block :loading="replying" @click="submitReply">提交回复</van-button>
        </div>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterActivity = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' }
]

interface Reply { id: number; userName: string; content: string }
interface Comment {
  id: number
  userName: string
  avatar?: string
  activityId: number
  activityTitle: string
  content: string
  likeCount: number
  createdAt: string
  replies?: Reply[]
}

const commentList = ref<Comment[]>([])
const showReply = ref(false)
const replyContent = ref('')
const replying = ref(false)
const currentComment = ref<Comment | null>(null)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const loadData = async () => {
  return [
    { id: 1, userName: '张家长', activityId: 1, activityTitle: '开放日活动', content: '活动组织得很好，孩子很喜欢！', likeCount: 12, createdAt: '2025-01-05', replies: [{ id: 101, userName: '园长', content: '感谢您的支持！' }] },
    { id: 2, userName: '李家长', activityId: 1, activityTitle: '开放日活动', content: '希望多举办这样的活动', likeCount: 8, createdAt: '2025-01-05' },
    { id: 3, userName: '王家长', activityId: 2, activityTitle: '家长会', content: '会议内容很实用，收获很多', likeCount: 5, createdAt: '2025-01-04' }
  ]
}

const onLoad = async () => {
  loading.value = true
  commentList.value = await loadData()
  loading.value = false
  finished.value = true
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onFilter = () => { onRefresh() }

const handleLike = (item: Comment) => {
  item.likeCount++
  showToast('点赞成功')
}

const handleReply = (item: Comment) => {
  currentComment.value = item
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
  if (currentComment.value) {
    if (!currentComment.value.replies) currentComment.value.replies = []
    currentComment.value.replies.push({ id: Date.now(), userName: '园长', content: replyContent.value })
  }
  replying.value = false
  showReply.value = false
  showSuccessToast('回复成功')
}

onMounted(() => { onLoad() })
</script>

<style scoped lang="scss">
.activity-comments-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.comment-list {
  padding: 12px;
}

.comment-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .comment-header {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;

    .user-info {
      .user-name { font-size: 14px; font-weight: 500; }
      .comment-meta {
        font-size: 12px;
        color: #969799;
        display: flex;
        gap: 4px;
      }
    }
  }

  .comment-content {
    font-size: 14px;
    color: #323233;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .comment-actions {
    display: flex;
    gap: 8px;
  }

  .reply-list {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f7f8fa;
    border-radius: 4px;

    .reply-item {
      font-size: 13px;
      margin-bottom: 4px;
      .reply-user { color: #1989fa; margin-right: 4px; }
      .reply-content { color: #646566; }
    }
  }
}

.reply-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
  .reply-actions { padding: 16px 0; }
}
</style>
