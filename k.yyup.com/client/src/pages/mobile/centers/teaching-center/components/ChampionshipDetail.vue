<template>
  <div class="championship-detail">
    <!-- 预览模式 -->
    <div v-if="preview" class="preview-mode">
      <div class="stats-overview">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">脑科学达标率</span>
            <span class="stat-value primary">{{ data.data?.brainScienceRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">课程达标率</span>
            <span class="stat-value success">{{ data.data?.courseContentRate }}%</span>
          </div>
        </div>
      </div>

      <div class="achievement-preview">
        <h4 class="preview-title">四项达标情况</h4>
        <div class="achievement-grid">
          <div
            v-for="(item, index) in previewAchievements"
            :key="index"
            class="achievement-item-mini"
          >
            <div class="achievement-icon">{{ item.icon }}</div>
            <span class="achievement-name">{{ item.name }}</span>
            <span class="achievement-rate">{{ item.rate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整模式 -->
    <div v-else class="full-mode">
      <!-- 总体统计 -->
      <div class="overview-section">
        <h3 class="section-title">锦标赛达标率</h3>
        <div class="achievement-cards">
          <div
            v-for="(item, index) in achievementData"
            :key="index"
            class="achievement-card"
            :class="`achievement-card--${item.type}`"
          >
            <div class="card-icon">{{ item.icon }}</div>
            <div class="card-content">
              <div class="card-title">{{ item.name }}</div>
              <div class="card-value">{{ item.rate }}%</div>
              <van-progress
                :percentage="item.rate"
                stroke-width="6"
                :color="getProgressColor(item.rate)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 锦标赛列表 -->
      <div class="championship-section">
        <div class="section-header">
          <h3 class="section-title">锦标赛记录</h3>
          <van-button
            size="small"
            icon="plus"
            type="primary"
            @click="showCreateDialog = true"
          >
            创建锦标赛
          </van-button>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadChampionshipList"
        >
          <div
            v-for="championship in championshipList"
            :key="championship.id"
            class="championship-card"
            @click="selectChampionship(championship)"
          >
            <div class="championship-header">
              <div class="championship-info">
                <h4 class="championship-name">{{ championship.name }}</h4>
                <div class="championship-meta">
                  <span class="championship-date">{{ championship.date }}</span>
                  <van-tag
                    :type="getStatusTagType(championship.status)"
                    size="small"
                  >
                    {{ getStatusText(championship.status) }}
                  </van-tag>
                </div>
              </div>
              <div class="championship-trophy">
                <van-icon name="trophy-o" size="24" :color="getTrophyColor(championship.rank)" />
              </div>
            </div>

            <div class="championship-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">地点</span>
                  <span class="detail-value">{{ championship.location }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">参与人数</span>
                  <span class="detail-value">{{ championship.participantCount }}人</span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">排名</span>
                  <span class="detail-value rank" :class="`rank--${championship.rank}`">
                    {{ getRankText(championship.rank) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">奖项</span>
                  <span class="detail-value">{{ championship.awards }}</span>
                </div>
              </div>
            </div>

            <!-- 四项成绩展示 -->
            <div class="scores-section">
              <div class="scores-title">四项成绩</div>
              <div class="scores-grid">
                <div
                  v-for="(score, index) in championship.scores"
                  :key="index"
                  class="score-item"
                >
                  <span class="score-label">{{ score.name }}</span>
                  <span class="score-value">{{ score.value }}分</span>
                </div>
              </div>
            </div>

            <div class="championship-actions" v-if="selectedChampionship?.id === championship.id">
              <van-button
                size="small"
                icon="photo-o"
                @click.stop="viewPhotos(championship)"
              >
                查看照片
              </van-button>
              <van-button
                size="small"
                icon="chart-trending-o"
                type="primary"
                @click.stop="viewAnalytics(championship)"
              >
                数据分析
              </van-button>
              <van-button
                size="small"
                icon="edit"
                type="warning"
                @click.stop="editChampionship(championship)"
              >
                编辑
              </van-button>
            </div>
          </div>
        </van-list>
      </div>

      <!-- 排行榜 -->
      <div class="ranking-section">
        <h3 class="section-title">班级排行榜</h3>
        <div class="ranking-list">
          <div
            v-for="(item, index) in rankingData"
            :key="item.id"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank-number">
              <span v-if="index < 3" class="medal">{{ ['🥇', '🥈', '🥉'][index] }}</span>
              <span v-else class="number">{{ index + 1 }}</span>
            </div>
            <div class="class-info">
              <span class="class-name">{{ item.name }}</span>
              <span class="total-score">{{ item.totalScore }}分</span>
            </div>
            <div class="rank-change" :class="item.change">
              <van-icon
                :name="item.change === 'up' ? 'arrow-up' : item.change === 'down' ? 'arrow-down' : 'minus'"
                :color="item.change === 'up' ? '#07c160' : item.change === 'down' ? '#ee0a24' : '#c8c9cc'"
                size="14"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建锦标赛弹窗 -->
    <van-popup
      v-model:show="showCreateDialog"
      position="bottom"
      round
      :style="{ height: '85%' }"
      safe-area-inset-bottom
    >
      <div class="create-dialog">
        <div class="dialog-header">
          <h3>创建锦标赛</h3>
          <van-button icon="cross" @click="showCreateDialog = false" />
        </div>

        <div class="dialog-content">
          <van-form @submit="createChampionship">
            <van-cell-group inset>
              <van-field
                v-model="createForm.name"
                name="name"
                label="锦标赛名称"
                placeholder="请输入锦标赛名称"
                :rules="[{ required: true, message: '请输入锦标赛名称' }]"
              />
              <van-field
                v-model="createForm.type"
                name="type"
                label="锦标赛类型"
                placeholder="请选择锦标赛类型"
                is-link
                readonly
                @click="showTypePicker = true"
                :rules="[{ required: true, message: '请选择锦标赛类型' }]"
              />
              <van-field
                v-model="createForm.date"
                name="date"
                label="举办日期"
                placeholder="请选择举办日期"
                is-link
                readonly
                @click="showDatePicker = true"
                :rules="[{ required: true, message: '请选择举办日期' }]"
              />
              <van-field
                v-model="createForm.location"
                name="location"
                label="举办地点"
                placeholder="请输入举办地点"
                :rules="[{ required: true, message: '请输入举办地点' }]"
              />
              <van-field
                v-model="createForm.targetParticipantCount"
                name="targetParticipantCount"
                label="目标参与人数"
                placeholder="请输入目标参与人数"
                type="number"
                :rules="[{ required: true, message: '请输入目标参与人数' }]"
              />
              <van-field
                v-model="createForm.budgetAmount"
                name="budgetAmount"
                label="预算金额"
                placeholder="请输入预算金额（可选）"
                type="number"
              />
              <van-field
                v-model="createForm.awardsDescription"
                name="awardsDescription"
                label="奖项设置"
                placeholder="请输入奖项描述"
                type="textarea"
                rows="3"
              />
              <van-field
                v-model="createForm.notes"
                name="notes"
                label="备注"
                placeholder="请输入备注信息"
                type="textarea"
                rows="3"
              />
            </van-cell-group>

            <div class="dialog-actions">
              <van-button block type="primary" native-type="submit">
                创建锦标赛
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

// Props
interface Props {
  data: any
  preview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  preview: false
})

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const showCreateDialog = ref(false)
const selectedChampionship = ref<any>(null)

// 选择器状态
const showTypePicker = ref(false)
const showDatePicker = ref(false)

// 锦标赛数据
const championshipData = reactive({
  brainScienceRate: 0,
  courseContentRate: 0,
  outdoorTrainingRate: 0,
  externalDisplayRate: 0
})

// 数据列表
const championshipList = ref<any[]>([])
const rankingData = ref<any[]>([])

// 四项成绩数据
const achievementData = ref<any[]>([])

// 创建表单
const createForm = reactive({
  name: '',
  type: '',
  date: '',
  location: '',
  targetParticipantCount: '',
  budgetAmount: '',
  awardsDescription: '',
  notes: ''
})

// 选择器数据
const typeColumns = [
  { text: '学期锦标赛', value: '学期锦标赛' },
  { text: '年度总决赛', value: '年度总决赛' },
  { text: '专项技能赛', value: '专项技能赛' },
  { text: '团队对抗赛', value: '团队对抗赛' }
]

// 计算属性
const previewAchievements = computed(() => {
  return achievementData.value.slice(0, 4)
})

// 方法
const getStatusTagType = (status: string) => {
  const typeMap = {
    'completed': 'success',
    'ongoing': 'primary',
    'upcoming': 'warning',
    'cancelled': 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'default'
}

const getStatusText = (status: string) => {
  const textMap = {
    'completed': '已完成',
    'ongoing': '进行中',
    'upcoming': '即将开始',
    'cancelled': '已取消'
  }
  return textMap[status as keyof typeof textMap] || status
}

const getTrophyColor = (rank: number) => {
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return '#c8c9cc'
}

const getRankText = (rank: number) => {
  const rankTexts = ['', '冠军', '亚军', '季军']
  return rankTexts[rank] || `第${rank}名`
}

const getProgressColor = (rate: number) => {
  if (rate >= 90) return '#67C23A'
  if (rate >= 80) return '#409EFF'
  if (rate >= 70) return '#E6A23C'
  return '#F56C6C'
}

const selectChampionship = (championship: any) => {
  selectedChampionship.value = selectedChampionship.value?.id === championship.id ? null : championship
}

const generateAchievementData = () => {
  const achievements = [
    {
      name: '脑科学计划',
      icon: '🧠',
      rate: championshipData.brainScienceRate,
      type: 'primary'
    },
    {
      name: '课程内容',
      icon: '📚',
      rate: championshipData.courseContentRate,
      type: 'success'
    },
    {
      name: '户外训练展示',
      icon: '🏃',
      rate: championshipData.outdoorTrainingRate,
      type: 'warning'
    },
    {
      name: '校外展示',
      icon: '🌟',
      rate: championshipData.externalDisplayRate,
      type: 'info'
    }
  ]

  achievementData.value = achievements
}

const generateChampionshipList = () => {
  const championships = [
    {
      id: 1,
      name: '2024年春季学期锦标赛',
      date: '2024-06-15',
      type: '学期锦标赛',
      location: '学校体育馆',
      status: 'completed',
      rank: 1,
      participantCount: 120,
      awards: '金牌、最佳团队奖',
      scores: [
        { name: '脑科学', value: 92 },
        { name: '课程', value: 88 },
        { name: '户外', value: 85 },
        { name: '展示', value: 90 }
      ]
    },
    {
      id: 2,
      name: '2023年年度总决赛',
      date: '2023-12-20',
      type: '年度总决赛',
      location: '市体育中心',
      status: 'completed',
      rank: 2,
      participantCount: 200,
      awards: '银牌、优秀组织奖',
      scores: [
        { name: '脑科学', value: 85 },
        { name: '课程', value: 82 },
        { name: '户外', value: 88 },
        { name: '展示', value: 86 }
      ]
    },
    {
      id: 3,
      name: '专项技能赛',
      date: '2024-09-10',
      type: '专项技能赛',
      location: '技能训练中心',
      status: 'upcoming',
      rank: 0,
      participantCount: 80,
      awards: '待定',
      scores: []
    }
  ]

  championshipList.value = championships
}

const generateRankingData = () => {
  const rankings = [
    { id: 1, name: '大班A班', totalScore: 355, change: 'up' },
    { id: 2, name: '大班B班', totalScore: 342, change: 'down' },
    { id: 3, name: '中班A班', totalScore: 328, change: 'up' },
    { id: 4, name: '中班B班', totalScore: 315, change: 'same' },
    { id: 5, name: '小班A班', totalScore: 298, change: 'up' },
    { id: 6, name: '小班B班', totalScore: 285, change: 'down' }
  ]

  rankingData.value = rankings
}

const loadChampionshipList = async () => {
  try {
    loading.value = true

    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里应该调用API加载锦标赛列表
    generateChampionshipList()
    finished.value = true

  } catch (error) {
    console.error('加载锦标赛列表失败:', error)
    showToast('加载锦标赛列表失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

const viewPhotos = (championship: any) => {
  showToast(`查看${championship.name}照片`)
}

const viewAnalytics = (championship: any) => {
  showToast(`查看${championship.name}数据分析`)
}

const editChampionship = (championship: any) => {
  showToast(`编辑${championship.name}`)
}

const createChampionship = async () => {
  try {
    const loadingToast = showLoadingToast('创建锦标赛中...')

    await teachingCenterApi.createChampionship({
      championship_name: createForm.name,
      championship_type: createForm.type,
      championship_date: createForm.date,
      location: createForm.location,
      target_participant_count: parseInt(createForm.targetParticipantCount),
      budget_amount: createForm.budgetAmount ? parseFloat(createForm.budgetAmount) : undefined,
      awards_description: createForm.awardsDescription,
      notes: createForm.notes
    })

    closeToast()
    showToast('锦标赛创建成功')
    showCreateDialog.value = false

    // 重置表单
    Object.keys(createForm).forEach(key => {
      createForm[key as keyof typeof createForm] = ''
    })

    // 刷新数据
    emit('refresh')
  } catch (error) {
    closeToast()
    console.error('创建锦标赛失败:', error)
    showToast('创建锦标赛失败')
  }
}

// 选择器确认方法
const onTypeConfirm = ({ selectedOptions }: any) => {
  createForm.type = selectedOptions[0].value
  showTypePicker.value = false
}

const onDateConfirm = ({ selectedValues }: any) => {
  createForm.date = selectedValues.join('-')
  showDatePicker.value = false
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData?.data) {
      championshipData.brainScienceRate = newData.data.brainScienceRate || 0
      championshipData.courseContentRate = newData.data.courseContentRate || 0
      championshipData.outdoorTrainingRate = newData.data.outdoorTrainingRate || 0
      championshipData.externalDisplayRate = newData.data.externalDisplayRate || 0

      generateAchievementData()
      generateChampionshipList()
      generateRankingData()
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (props.data?.data) {
    championshipData.brainScienceRate = props.data.data.brainScienceRate || 0
    championshipData.courseContentRate = props.data.data.courseContentRate || 0
    championshipData.outdoorTrainingRate = props.data.data.outdoorTrainingRate || 0
    championshipData.externalDisplayRate = props.data.data.externalDisplayRate || 0

    generateAchievementData()
    generateChampionshipList()
    generateRankingData()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.championship-detail {
  width: 100%;
}

// 预览模式样式
.preview-mode {
  .stats-overview {
    margin-bottom: var(--van-padding-md);

    .stat-row {
      display: flex;
      gap: var(--van-padding-md);

      .stat-item {
        flex: 1;
        text-align: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-md);

        .stat-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;

          &.primary {
            color: var(--van-primary-color);
          }

          &.success {
            color: var(--van-success-color);
          }
        }
      }
    }
  }

  .achievement-preview {
    .preview-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .achievement-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-xs);

      .achievement-item-mini {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--van-padding-sm);
        background: var(--van-background-color-light);
        border-radius: var(--van-radius-sm);

        .achievement-icon {
          font-size: var(--text-base);
          margin-bottom: 2px;
        }

        .achievement-name {
          font-size: 10px;
          color: var(--van-text-color-2);
          margin-bottom: 2px;
          text-align: center;
        }

        .achievement-rate {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--van-primary-color);
        }
      }
    }
  }
}

// 完整模式样式
.full-mode {
  .overview-section {
    margin-bottom: var(--van-padding-lg);

    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .achievement-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-md);

      .achievement-card {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-md);
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        &--primary {
          border-left: 4px solid var(--van-primary-color);
        }

        &--success {
          border-left: 4px solid var(--van-success-color);
        }

        &--warning {
          border-left: 4px solid var(--van-warning-color);
        }

        &--info {
          border-left: 4px solid var(--van-info-color);
        }

        .card-icon {
          font-size: var(--text-2xl);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--van-background-color-light);
          border-radius: var(--van-radius-md);
        }

        .card-content {
          flex: 1;

          .card-title {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin-bottom: 2px;
          }

          .card-value {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: var(--van-padding-xs);
          }
        }
      }
    }
  }

  .championship-section {
    margin-bottom: var(--van-padding-lg);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-md);

      .section-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0;
      }
    }

    .championship-card {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .championship-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-md);

        .championship-info {
          flex: 1;

          .championship-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 var(--van-padding-xs) 0;
          }

          .championship-meta {
            display: flex;
            align-items: center;
            gap: var(--van-padding-sm);

            .championship-date {
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
            }
          }
        }

        .championship-trophy {
          padding: var(--van-padding-sm);
        }
      }

      .championship-details {
        margin-bottom: var(--van-padding-md);

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--van-padding-xs);

          .detail-item {
            .detail-label {
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
              margin-right: var(--van-padding-xs);
            }

            .detail-value {
              font-size: var(--text-xs);
              color: var(--van-text-color);
              font-weight: 500;

              &.rank {
                font-weight: 600;

                &.rank--1 {
                  color: var(--text-primary);
                }

                &.rank--2 {
                  color: var(--text-primary);
                }

                &.rank--3 {
                  color: var(--text-primary);
                }
              }
            }
          }
        }
      }

      .scores-section {
        margin-bottom: var(--van-padding-md);

        .scores-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--van-text-color);
          margin: 0 0 var(--van-padding-xs) 0;
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--van-padding-xs);

          .score-item {
            display: flex;
            justify-content: space-between;
            padding: var(--van-padding-xs);
            background: var(--van-background-color-light);
            border-radius: var(--van-radius-sm);

            .score-label {
              font-size: 11px;
              color: var(--van-text-color-3);
            }

            .score-value {
              font-size: var(--text-xs);
              font-weight: 600;
              color: var(--van-primary-color);
            }
          }
        }
      }

      .championship-actions {
        display: flex;
        gap: var(--van-padding-sm);
        justify-content: flex-end;
        padding-top: var(--van-padding-sm);
        border-top: 1px solid var(--van-border-color);
      }
    }
  }

  .ranking-section {
    .section-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin: 0 0 var(--van-padding-md) 0;
    }

    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: var(--van-padding-md);
        background: var(--card-bg);
        border-radius: var(--van-radius-lg);
        margin-bottom: var(--van-padding-sm);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        &.top-three {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 1) 100%);
        }

        .rank-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--van-padding-md);

          .medal {
            font-size: var(--text-xl);
          }

          .number {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color-2);
          }
        }

        .class-info {
          flex: 1;

          .class-name {
            display: block;
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--van-text-color);
            margin-bottom: 2px;
          }

          .total-score {
            font-size: var(--text-xs);
            color: var(--van-primary-color);
            font-weight: 600;
          }
        }

        .rank-change {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

// 创建弹窗样式
.create-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-lg) var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-md);

    .dialog-actions {
      margin-top: var(--van-padding-lg);
      padding: var(--van-padding-md);
    }
  }
}
</style>