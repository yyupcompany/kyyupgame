<template>
  <el-dialog
    :model-value="visible"
    title="活动评估"
    width="800px"
    @close="$emit('close')"
  >
    <div class="activity-evaluation">
      <!-- 活动信息 -->
      <div class="activity-info">
        <h3>{{ activity?.title }}</h3>
        <div class="activity-meta">
          <span><UnifiedIcon name="default" /> {{ formatDate(activity?.date) }}</span>
          <span><UnifiedIcon name="default" /> {{ activity?.location }}</span>
          <el-tag :type="getStatusTagType(activity?.status)">
            {{ getStatusText(activity?.status) }}
          </el-tag>
        </div>
      </div>

      <!-- 评估统计 -->
      <div class="evaluation-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ evaluationStats.total }}</div>
              <div class="stat-label">总评价数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ evaluationStats.average }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ evaluationStats.satisfaction }}%</div>
              <div class="stat-label">满意度</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ evaluationStats.participation }}%</div>
              <div class="stat-label">参与度</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 评分分布 -->
      <div class="rating-distribution">
        <h4>评分分布</h4>
        <div class="rating-bars">
          <div v-for="(count, rating) in ratingDistribution" :key="rating" class="rating-bar">
            <span class="rating-label">{{ rating }}星</span>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                :style="{ width: `${(count / evaluationStats.total) * 100}%` }"
              ></div>
            </div>
            <span class="rating-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- 评价列表 -->
      <div class="evaluations-list">
        <div class="list-header">
          <h4>详细评价</h4>
          <el-select v-model="filterRating" placeholder="筛选评分" clearable size="small">
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </div>

        <div class="evaluation-items">
          <div 
            v-for="evaluation in filteredEvaluations" 
            :key="evaluation.id"
            class="evaluation-item"
          >
            <div class="evaluation-header">
              <div class="evaluator-info">
                <span class="evaluator-name">{{ evaluation.evaluatorName }}</span>
                <span class="evaluator-role">{{ evaluation.evaluatorRole }}</span>
              </div>
              <div class="evaluation-rating">
                <el-rate 
                  v-model="evaluation.rating" 
                  disabled 
                  size="small"
                />
                <span class="rating-text">{{ evaluation.rating }}/5</span>
              </div>
            </div>
            
            <div class="evaluation-content">
              <p class="evaluation-comment">{{ evaluation.comment }}</p>
              <div class="evaluation-tags" v-if="evaluation.tags?.length">
                <el-tag 
                  v-for="tag in evaluation.tags" 
                  :key="tag" 
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            
            <div class="evaluation-footer">
              <span class="evaluation-time">{{ formatDateTime(evaluation.createdAt) }}</span>
              <el-button 
                v-if="evaluation.needsReply"
                size="small" 
                type="primary"
                @click="handleReply(evaluation)"
              >
                回复
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-if="evaluations.length > pageSize"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredEvaluations.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出评估报告</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Location } from '@element-plus/icons-vue'

// Props
interface Activity {
  id: number
  title: string
  date: string
  location: string
  status: string
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
  'reply': [evaluation: Evaluation]
  'export': [activity: Activity]
}>()

// 响应式数据
const filterRating = ref<number | undefined>()
const currentPage = ref(1)
const pageSize = ref(10)

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
  
  return result
})

// 方法
const getStatusTagType = (status?: string) => {
  const typeMap = {
    'upcoming': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status || ''] || 'info'
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
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleReply = (evaluation: Evaluation) => {
  emit('reply', evaluation)
}

const handleExport = () => {
  if (!props.activity) return
  emit('export', props.activity)
  ElMessage.success('评估报告导出成功')
}
</script>

<style lang="scss" scoped>
.activity-evaluation {
  .activity-info {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);

    h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--el-text-color-primary);
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      font-size: var(--text-base);
      color: var(--el-text-color-secondary);

      span {
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .evaluation-stats {
    margin-bottom: var(--text-2xl);

    .stat-card {
      text-align: center;
      padding: var(--text-lg);
      background: var(--el-bg-color);
      border: var(--border-width-base) solid var(--el-border-color-light);
      border-radius: var(--spacing-sm);

      .stat-number {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--el-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .rating-distribution {
    margin-bottom: var(--text-2xl);

    h4 {
      margin-bottom: var(--text-sm);
      color: var(--el-text-color-primary);
    }

    .rating-bars {
      .rating-bar {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-sm);

        .rating-label {
          width: auto;
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }

        .bar-container {
          flex: 1;
          height: var(--text-lg);
          background: var(--el-fill-color-light);
          border-radius: var(--spacing-sm);
          margin: 0 var(--spacing-sm);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

          .bar-fill {
            height: 100%;
            background: var(--el-color-primary);
            transition: width 0.3s;
          }
        }

        .rating-count {
          width: auto;
          text-align: right;
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .evaluations-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);

      h4 {
        margin: 0;
        color: var(--el-text-color-primary);
      }
    }

    .evaluation-items {
      .evaluation-item {
        background: var(--el-bg-color);
        border: var(--border-width-base) solid var(--el-border-color-light);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        margin-bottom: var(--text-sm);

        .evaluation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          .evaluator-info {
            .evaluator-name {
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-right: var(--spacing-sm);
            }

            .evaluator-role {
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);
            }
          }

          .evaluation-rating {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .rating-text {
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);
            }
          }
        }

        .evaluation-content {
          .evaluation-comment {
            color: var(--el-text-color-regular);
            line-height: 1.5;
            margin-bottom: var(--spacing-sm);
          }

          .evaluation-tags {
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;
          }
        }

        .evaluation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--text-sm);
          padding-top: var(--text-sm);
          border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);

          .evaluation-time {
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}
</style>
