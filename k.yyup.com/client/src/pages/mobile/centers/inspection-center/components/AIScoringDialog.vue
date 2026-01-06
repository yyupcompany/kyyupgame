<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '90%' }"
    round
  >
    <div class="ai-scoring-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          title="🤖 AI预评分分析"
          left-text="关闭"
          @click-left="handleClose"
        >
          <template #right>
            <van-button
              v-if="canStart && !isAnalyzing && !isCompleted"
              type="primary"
              size="small"
              @click="startScoring"
              :loading="starting"
            >
              开始评分
            </van-button>
          </template>
        </van-nav-bar>
      </div>

      <!-- 内容 -->
      <div class="dialog-content">
        <!-- 时间限制提示 -->
        <van-notice-bar
          v-if="!canStart"
          color="#fff"
          background="#ff976a"
          left-icon="warning-o"
        >
          距离下次可评分还有 {{ remainingDays }} 天
        </van-notice-bar>

        <!-- 重要提示 -->
        <van-notice-bar
          v-if="!isAnalyzing && canStart"
          color="#fff"
          background="#1989fa"
          left-icon="info-o"
          wrapable
          :scrollable="false"
        >
          <template #default>
            <div class="important-tips">
              <div>📢 重要提示：</div>
              <div>1. 预计需要10分钟</div>
              <div>2. 请勿刷新网页</div>
              <div>3. 请勿关闭此页面</div>
            </div>
          </template>
        </van-notice-bar>

        <!-- 分析进行中提示 -->
        <van-notice-bar
          v-if="isAnalyzing"
          color="#fff"
          background="#ff976a"
          left-icon="loading"
        >
          AI分析进行中，请勿刷新网页！预计剩余时间：{{ estimatedTimeRemaining }}
        </van-notice-bar>

        <!-- 分析结果 -->
        <div v-if="isCompleted || isAnalyzing" class="result-section">
          <!-- 总体进度 -->
          <div class="progress-card">
            <div class="progress-header">
              <span class="label">总体进度</span>
              <span class="stats">
                {{ progress.completed }}/{{ progress.total }}
                (成功{{ progress.completed - progress.failed }}, 失败{{ progress.failed }})
              </span>
            </div>
            <van-progress
              :percentage="progress.progress"
              :color="getProgressColor()"
              stroke-width="20"
            />

            <div v-if="isAnalyzing" class="current-step">
              <van-loading size="16px" />
              <span>{{ currentStep }}</span>
            </div>
          </div>

          <!-- 评分结果 -->
          <div v-if="isCompleted && scoringResult" class="result-card">
            <div class="result-header">
              <van-icon name="checked" color="#07c160" size="20" />
              <span>分析完成</span>
            </div>

            <div class="result-stats">
              <van-grid :column-num="2" :border="false">
                <van-grid-item text="总评分">
                  <template #icon>
                    <div class="stat-value">{{ scoringResult.totalScore }}</div>
                  </template>
                </van-grid-item>
                <van-grid-item text="排名">
                  <template #icon>
                    <div class="stat-value">{{ scoringResult.rank }}</div>
                  </template>
                </van-grid-item>
                <van-grid-item text="优秀项">
                  <template #icon>
                    <div class="stat-value success">{{ scoringResult.excellentCount }}</div>
                  </template>
                </van-grid-item>
                <van-grid-item text="待改进项">
                  <template #icon>
                    <div class="stat-value warning">{{ scoringResult.improveCount }}</div>
                  </template>
                </van-grid-item>
              </van-grid>
            </div>

            <!-- 详细结果 -->
            <van-collapse v-model="activeNames" class="result-details">
              <van-collapse-item title="详细评分" name="details">
                <div v-for="(item, index) in scoringResult.details" :key="index" class="detail-item">
                  <div class="detail-header">
                    <span>{{ item.category }}</span>
                    <van-tag :type="getScoreTagType(item.score)">
                      {{ item.score }}分
                    </van-tag>
                  </div>
                  <div class="detail-comment">{{ item.comment }}</div>
                </div>
              </van-collapse-item>
              <van-collapse-item title="改进建议" name="suggestions">
                <div v-for="(suggestion, index) in scoringResult.suggestions" :key="index" class="suggestion-item">
                  <van-icon name="arrow" />
                  <span>{{ suggestion }}</span>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!isAnalyzing && canStart" class="empty-state">
          <van-empty description="点击开始评分进行AI分析" />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'

interface Props {
  modelValue: boolean
  lastScoringTime?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'scoring-completed': [result: any]
}>()

// 响应式数据
const starting = ref(false)
const isAnalyzing = ref(false)
const isCompleted = ref(false)
const activeNames = ref(['details', 'suggestions'])

const progress = ref({
  completed: 0,
  total: 100,
  failed: 0,
  progress: 0
})

const currentStep = ref('')
const scoringResult = ref<any>(null)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 时间限制计算（7天一次）
const remainingDays = computed(() => {
  if (!props.lastScoringTime) return 0
  const lastTime = new Date(props.lastScoringTime).getTime()
  const now = Date.now()
  const daysSinceLastScoring = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24))
  return Math.max(0, 7 - daysSinceLastScoring)
})

const canStart = computed(() => remainingDays.value === 0)

const estimatedTimeRemaining = computed(() => {
  const remaining = progress.value.total - progress.value.completed
  return `${Math.ceil(remaining / 6)}分钟`
})

// 方法
const handleClose = () => {
  if (isAnalyzing.value) {
    showToast('分析进行中，请勿关闭')
    return
  }
  emit('update:modelValue', false)
}

const getProgressColor = () => {
  if (progress.value.failed > 0) return '#ee0a24'
  if (progress.value.progress === 100) return '#07c160'
  return '#1989fa'
}

const getScoreTagType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

const startScoring = async () => {
  try {
    starting.value = true
    isAnalyzing.value = true
    isCompleted.value = false

    // 模拟AI分析过程
    const steps = [
      '正在分析巡检计划...',
      '正在检查安全设施...',
      '正在评估卫生状况...',
      '正在检查教学环境...',
      '正在评估活动区域...',
      '正在生成评分报告...'
    ]

    for (let i = 0; i < steps.length; i++) {
      currentStep.value = steps[i]
      await sleep(1000)

      // 更新进度
      progress.value.completed = Math.floor(((i + 1) / steps.length) * 100)
      progress.value.progress = Math.floor(((i + 1) / steps.length) * 100)
    }

    // 分析完成
    isAnalyzing.value = false
    isCompleted.value = true
    starting.value = false

    // 模拟评分结果
    scoringResult.value = {
      totalScore: 85,
      rank: '前10%',
      excellentCount: 12,
      improveCount: 3,
      details: [
        { category: '安全管理', score: 90, comment: '安全设施完善，无隐患' },
        { category: '卫生保健', score: 85, comment: '卫生状况良好，需加强细节' },
        { category: '教学环境', score: 88, comment: '环境整洁，布置合理' },
        { category: '活动区域', score: 80, comment: '活动区域充足，需补充器材' }
      ],
      suggestions: [
        '建议增加户外活动器材',
        '定期检查消防设施',
        '加强卫生死角清理'
      ]
    }

    emit('scoring-completed', scoringResult.value)
    showToast('AI分析完成')
  } catch (error) {
    console.error('AI评分失败:', error)
    showToast('分析失败，请重试')
    isAnalyzing.value = false
    starting.value = false
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.ai-scoring-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .dialog-header {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  .important-tips {
    line-height: 1.8;
  }

  .result-section {
    .progress-card {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 12px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: var(--text-sm);

        .label {
          font-weight: 600;
        }

        .stats {
          color: var(--van-text-color-2);
        }
      }

      .current-step {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: 12px;
        color: var(--van-primary-color);
        font-size: var(--text-sm);
      }
    }

    .result-card {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);

      .result-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: 16px;
        font-size: var(--text-base);
        font-weight: 600;
      }

      .result-stats {
        margin-bottom: 16px;

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--van-primary-color);

          &.success {
            color: #07c160;
          }

          &.warning {
            color: #ff976a;
          }
        }
      }

      .result-details {
        .detail-item {
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid #ebedf0;

          &:last-child {
            border-bottom: none;
          }

          .detail-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .detail-comment {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
          font-size: var(--text-sm);
        }
      }
    }
  }

  .empty-state {
    margin-top: 60px;
  }
}
</style>
