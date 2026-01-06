<template>
  <div class="mobile-activity-evaluation">
    <!-- 活动信息头部 -->
    <div class="activity-header">
      <van-nav-bar
        :title="activity?.title || '活动评估'"
        left-text="返回"
        left-arrow
        @click-left="$emit('close')"
      />

      <div class="activity-info" v-if="activity">
        <div class="activity-meta">
          <van-tag :type="getStatusTagType(activity.status)" size="medium">
            {{ getStatusText(activity.status) }}
          </van-tag>
          <div class="activity-detail">
            <van-icon name="calendar-o" />
            <span>{{ formatDate(activity.date) }}</span>
          </div>
          <div class="activity-detail">
            <van-icon name="location-o" />
            <span>{{ activity.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 评估统计 -->
    <div class="evaluation-stats">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <div class="stat-card">
            <div class="stat-number">{{ evaluationStats.total }}</div>
            <div class="stat-label">总评价数</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <div class="stat-number">{{ evaluationStats.average }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <div class="stat-number">{{ evaluationStats.satisfaction }}%</div>
            <div class="stat-label">满意度</div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-card">
            <div class="stat-number">{{ evaluationStats.participation }}%</div>
            <div class="stat-label">参与度</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 评分分布 -->
    <div class="rating-distribution">
      <van-cell-group inset title="评分分布">
        <div
          v-for="(count, rating) in ratingDistribution"
          :key="rating"
          class="rating-item"
        >
          <div class="rating-label">{{ rating }}星</div>
          <div class="rating-bar-container">
            <van-progress
              :percentage="evaluationStats.total > 0 ? (count / evaluationStats.total) * 100 : 0"
              stroke-width="8"
              color="#1989fa"
              track-color="#f5f5f5"
            />
          </div>
          <div class="rating-count">{{ count }}</div>
        </div>
      </van-cell-group>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="filterRating"
          :options="ratingOptions"
          title="筛选评分"
        />
      </van-dropdown-menu>
    </div>

    <!-- 评价列表 -->
    <div class="evaluations-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="evaluation in paginatedEvaluations"
            :key="evaluation.id"
            class="evaluation-item"
          >
            <van-swipe-cell>
              <div class="evaluation-content">
                <div class="evaluation-header">
                  <div class="evaluator-info">
                    <div class="evaluator-avatar">
                      <van-image
                        :src="evaluation.avatar || '/default-avatar.png'"
                        round
                        width="40"
                        height="40"
                      />
                    </div>
                    <div class="evaluator-details">
                      <div class="evaluator-name">{{ evaluation.evaluatorName }}</div>
                      <div class="evaluator-role">{{ evaluation.evaluatorRole }}</div>
                    </div>
                  </div>
                  <div class="evaluation-rating">
                    <van-rate
                      :model-value="evaluation.rating"
                      disabled
                      :size="16"
                      color="#ffd21e"
                      void-color="#c8c9cc"
                    />
                    <div class="rating-text">{{ evaluation.rating }}/5</div>
                  </div>
                </div>

                <div class="evaluation-comment">
                  {{ evaluation.comment }}
                </div>

                <div class="evaluation-tags" v-if="evaluation.tags?.length">
                  <van-tag
                    v-for="tag in evaluation.tags"
                    :key="tag"
                    size="small"
                    type="default"
                    plain
                  >
                    {{ tag }}
                  </van-tag>
                </div>

                <div class="evaluation-footer">
                  <div class="evaluation-time">
                    <van-icon name="clock-o" />
                    {{ formatDateTime(evaluation.createdAt) }}
                  </div>
                  <van-button
                    v-if="evaluation.needsReply"
                    size="mini"
                    type="primary"
                    plain
                    @click="handleReply(evaluation)"
                  >
                    回复
                  </van-button>
                </div>
              </div>

              <template #right>
                <van-button
                  square
                  type="primary"
                  text="回复"
                  @click="handleReply(evaluation)"
                />
              </template>
            </van-swipe-cell>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <van-button
        type="primary"
        block
        @click="handleExport"
        icon="down"
      >
        导出评估报告
      </van-button>
    </div>

    <!-- 回复对话框 -->
    <van-dialog
      v-model:show="showReplyDialog"
      title="回复评价"
      :show-confirm-button="false"
    >
      <div class="reply-form">
        <van-field
          v-model="replyContent"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容..."
          maxlength="200"
          show-word-limit
        />
        <div class="reply-actions">
          <van-button @click="showReplyDialog = false">取消</van-button>
          <van-button type="primary" @click="submitReply">发送</van-button>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'

// Props
interface Activity {
  id: number
  title: string
  date: string
  location: string
  status: string
  participantCount?: number
}

interface Evaluation {
  id: number
  evaluatorName: string
  evaluatorRole: string
  rating: number
  comment: string
  tags?: string[]
  createdAt: string
  needsReply?: boolean
  avatar?: string
}

interface Props {
  visible: boolean
  activity: Activity | null
  evaluations: Evaluation[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activity: null,
  evaluations: () => []
})

// Emits
const emit = defineEmits<{
  'close': []
  'reply': [evaluation: Evaluation, content: string]
  'export': [activity: Activity]
}>()

// 响应式数据
const filterRating = ref<number | undefined>()
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const showReplyDialog = ref(false)
const replyContent = ref('')
const currentEvaluation = ref<Evaluation | null>(null)

const ratingOptions = [
  { text: '全部评分', value: undefined },
  { text: '5星', value: 5 },
  { text: '4星', value: 4 },
  { text: '3星', value: 3 },
  { text: '2星', value: 2 },
  { text: '1星', value: 1 }
]

// 计算属性
const evaluationStats = computed(() => {
  const total = props.evaluations.length
  if (total === 0) {
    return { total: 0, average: 0, satisfaction: 0, participation: 0 }
  }

  const totalRating = props.evaluations.reduce((sum, eval) => sum + eval.rating, 0)
  const average = Math.round((totalRating / total) * 10) / 10
  const satisfaction = Math.round((props.evaluations.filter(e => e.rating >= 4).length / total) * 100)
  const participation = Math.round((total / (props.activity?.participantCount || total)) * 100)

  return { total, average, satisfaction, participation }
})

const ratingDistribution = computed(() => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  props.evaluations.forEach(evaluation => {
    distribution[evaluation.rating as keyof typeof distribution]++
  })
  return distribution
})

const filteredEvaluations = computed(() => {
  let result = props.evaluations

  if (filterRating.value) {
    result = result.filter(evaluation => evaluation.rating === filterRating.value)
  }

  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedEvaluations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEvaluations.value.slice(start, end)
})

// 方法
const getStatusTagType = (status?: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    'upcoming': 'primary',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status || ''] || 'default'
}

const getStatusText = (status?: string) => {
  const textMap = {
    'upcoming': '即将开始',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status || ''] || '未知'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const onLoad = () => {
  // 模拟加载延迟
  setTimeout(() => {
    if (paginatedEvaluations.value.length >= filteredEvaluations.value.length) {
      finished.value = true
    } else {
      currentPage.value++
    }
    loading.value = false
  }, 1000)
}

const onRefresh = () => {
  finished.value = false
  currentPage.value = 1
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}

const handleReply = (evaluation: Evaluation) => {
  currentEvaluation.value = evaluation
  replyContent.value = ''
  showReplyDialog.value = true
}

const submitReply = () => {
  if (!replyContent.value.trim()) {
    showToast('请输入回复内容')
    return
  }

  if (currentEvaluation.value) {
    emit('reply', currentEvaluation.value, replyContent.value)
    showReplyDialog.value = false
    showToast('回复成功')
  }
}

const handleExport = () => {
  if (!props.activity) return
  showLoadingToast({
    message: '导出中...',
    forbidClick: true,
    duration: 2000
  })
  setTimeout(() => {
    closeToast()
    emit('export', props.activity!)
    showToast('导出成功')
  }, 2000)
}

// 生命周期
onMounted(() => {
  currentPage.value = 1
  finished.value = false
})
</script>

<style lang="scss" scoped>
.mobile-activity-evaluation {
  min-height: 100vh;
  background-color: var(--van-background-color);
  padding-bottom: 80px;

  .activity-header {
    .activity-info {
      padding: var(--spacing-md);
      background: white;
      border-bottom: 1px solid var(--van-border-color);

      .activity-meta {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);

        .activity-detail {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--van-text-color-2);
          font-size: var(--text-sm);

          .van-icon {
            font-size: var(--text-base);
          }
        }
      }
    }
  }

  .evaluation-stats {
    margin: var(--spacing-md) 0;

    .stat-card {
      text-align: center;
      padding: var(--spacing-md);
      background: white;
      border-radius: 8px;

      .stat-number {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }
  }

  .rating-distribution {
    margin: var(--spacing-md) 0;

    .rating-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md) 16px;

      .rating-label {
        width: 40px;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }

      .rating-bar-container {
        flex: 1;
        margin: 0 12px;
      }

      .rating-count {
        width: 30px;
        text-align: right;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .filter-section {
    margin: var(--spacing-md) 0;
  }

  .evaluations-list {
    .evaluation-item {
      margin-bottom: 8px;
      background: white;

      .evaluation-content {
        padding: var(--spacing-md);

        .evaluation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .evaluator-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);

            .evaluator-details {
              .evaluator-name {
                font-size: var(--text-sm);
                font-weight: 600;
                color: var(--van-text-color-1);
                margin-bottom: 2px;
              }

              .evaluator-role {
                font-size: var(--text-xs);
                color: var(--van-text-color-2);
              }
            }
          }

          .evaluation-rating {
            text-align: right;

            .rating-text {
              font-size: var(--text-xs);
              color: var(--van-text-color-2);
              margin-top: 2px;
            }
          }
        }

        .evaluation-comment {
          font-size: var(--text-sm);
          line-height: 1.5;
          color: var(--van-text-color-1);
          margin-bottom: 12px;
        }

        .evaluation-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .evaluation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--van-border-color);

          .evaluation-time {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
          }
        }
      }
    }
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid var(--van-border-color);
    z-index: 100;
  }

  .reply-form {
    padding: var(--spacing-md);

    .reply-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: 16px;

      .van-button {
        flex: 1;
      }
    }
  }
}
</style>