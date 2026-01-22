<template>
  <MobileSubPageLayout title="测评中心" back-path="/mobile/parent-center">
    <div class="mobile-assessment-page">
      <!-- Hero区域 -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">2-6岁儿童发育商测评</h1>
          <p class="hero-subtitle">免费测评，专业报告，助力孩子成长</p>
          <van-button
            type="primary"
            block
            round
            size="large"
            class="start-btn"
            :loading="startingAssessment"
            @click="startAssessment"
          >
            立即开始测评
          </van-button>
        </div>
      </div>

      <!-- 数据统计区域 -->
      <div class="stats-section">
        <van-grid :column-num="3" :border="false" :gutter="12">
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ assessmentStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ assessmentStats.inProgress }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ assessmentStats.recommended }}</div>
              <div class="stat-label">推荐测评</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索测评记录"
          shape="round"
          background="transparent"
          @search="handleSearch"
          @clear="handleClear"
        />
        <van-dropdown-menu>
          <van-dropdown-item
            v-model="statusFilter"
            :options="statusOptions"
            title="状态筛选"
            @change="handleStatusFilter"
          />
          <van-dropdown-item
            v-model="timeFilter"
            :options="timeOptions"
            title="时间筛选"
            @change="handleTimeFilter"
          />
        </van-dropdown-menu>
      </div>

      <!-- 测评特色 -->
      <div class="features-section">
        <div class="section-title">测评特色</div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <div class="feature-title">多维度评估</div>
            <div class="feature-desc">专注力、记忆力、逻辑思维、语言能力、精细动作、社交能力</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <div class="feature-title">互动游戏</div>
            <div class="feature-desc">通过趣味游戏测评，让孩子在玩乐中完成评估</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <div class="feature-title">AI智能分析</div>
            <div class="feature-desc">专业AI生成个性化报告和成长建议</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <div class="feature-title">成长追踪</div>
            <div class="feature-desc">记录每次测评结果，追踪孩子成长轨迹</div>
          </div>
        </div>
      </div>

      <!-- 测评流程 -->
      <div class="process-section">
        <div class="section-title">测评流程</div>
        <div class="process-steps">
          <van-steps direction="vertical" :active="4">
            <van-step>
              <div class="step-content">
                <div class="step-number">1</div>
                <div class="step-info">
                  <div class="step-title">填写信息</div>
                  <div class="step-desc">输入孩子基本信息</div>
                </div>
              </div>
            </van-step>
            <van-step>
              <div class="step-content">
                <div class="step-number">2</div>
                <div class="step-info">
                  <div class="step-title">开始测评</div>
                  <div class="step-desc">完成问答和互动游戏</div>
                </div>
              </div>
            </van-step>
            <van-step>
              <div class="step-content">
                <div class="step-number">3</div>
                <div class="step-info">
                  <div class="step-title">生成报告</div>
                  <div class="step-desc">AI智能生成专业报告</div>
                </div>
              </div>
            </van-step>
            <van-step>
              <div class="step-content">
                <div class="step-number">4</div>
                <div class="step-info">
                  <div class="step-title">查看结果</div>
                  <div class="step-desc">查看报告并分享给朋友</div>
                </div>
              </div>
            </van-step>
          </van-steps>
        </div>
      </div>

      <!-- 最近测评记录 -->
      <div class="records-section" v-if="assessmentRecords.length > 0">
        <div class="section-title">最近测评记录</div>
        <div class="records-list">
          <div
            v-for="record in assessmentRecords"
            :key="record.id"
            class="record-item"
            @click="viewRecord(record)"
          >
            <div class="record-info">
              <div class="record-child">{{ record.childName }}</div>
              <div class="record-time">{{ formatTime(record.createdAt) }}</div>
            </div>
            <div class="record-status">
              <van-tag
                :type="getStatusType(record.status)"
                size="medium"
              >
                {{ getStatusText(record.status) }}
              </van-tag>
            </div>
            <div class="record-score" v-if="record.developmentQuotient">
              <div class="score-value">{{ record.developmentQuotient }}</div>
              <div class="score-label">发育商</div>
            </div>
          </div>
        </div>
        <div class="view-more" v-if="hasMoreRecords">
          <van-button
            type="default"
            block
            round
            size="small"
            @click="viewAllRecords"
          >
            查看全部记录
          </van-button>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-else-if="!loading && assessmentRecords.length === 0"
        description="暂无测评记录"
        image="search"
      >
        <van-button
          type="primary"
          round
          size="small"
          @click="startAssessment"
        >
          开始第一次测评
        </van-button>
      </van-empty>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { assessmentApi, type AssessmentRecord } from '@/api/assessment'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const startingAssessment = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const timeFilter = ref('')
const assessmentRecords = ref<AssessmentRecord[]>([])
const hasMoreRecords = ref(false)

// 数据统计
const assessmentStats = reactive({
  completed: 0,
  inProgress: 0,
  recommended: 5
})

// 筛选选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '进行中', value: 'in_progress' },
  { text: '已完成', value: 'completed' },
  { text: '已取消', value: 'cancelled' }
]

const timeOptions = [
  { text: '全部时间', value: '' },
  { text: '最近7天', value: '7days' },
  { text: '最近30天', value: '30days' },
  { text: '最近3个月', value: '3months' }
]

// 方法
const startAssessment = async () => {
  try {
    startingAssessment.value = true

    console.log('[评估系统] 开始测评按钮被点击')

    // 检查是否有进行中的测评
    const inProgressRecord = assessmentRecords.value.find(record => record.status === 'in_progress')
    if (inProgressRecord) {
      const confirmContinue = await Dialog.confirm({
        title: '继续测评',
        message: `您有一个为"${inProgressRecord.childName}"进行的测评尚未完成，是否继续？`,
        confirmButtonText: '继续',
        cancelButtonText: '重新开始'
      }).catch(() => false)

      if (confirmContinue) {
        showToast('继续进行中的测评...')
        router.push(`/mobile/parent-center/assessment/progress/${inProgressRecord.id}`)
        return
      }
    }

    // 显示提示信息
    showToast('正在进入测评页面...')

    // 延迟跳转，确保Toast显示
    setTimeout(() => {
      router.push('/mobile/parent-center/assessment/start')
    }, 300)

  } catch (error) {
    console.error('开始测评失败:', error)
    Toast.fail('操作失败，请重试')
  } finally {
    setTimeout(() => {
      startingAssessment.value = false
    }, 500)
  }
}

const loadAssessmentRecords = async () => {
  try {
    loading.value = true

    const params: any = {
      page: 1,
      pageSize: 5
    }

    if (searchKeyword.value) {
      params.phone = searchKeyword.value
    }

    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    if (timeFilter.value) {
      params.timeFilter = timeFilter.value
    }

    const response = await assessmentApi.getMyRecords(params)

    if (response.data) {
      assessmentRecords.value = response.data.list || []
      hasMoreRecords.value = assessmentRecords.value.length >= 5

      // 更新统计数据
      updateStats(assessmentRecords.value)
    }

  } catch (error) {
    console.error('加载测评记录失败:', error)
    Toast.fail('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

const updateStats = (records: AssessmentRecord[]) => {
  assessmentStats.completed = records.filter(r => r.status === 'completed').length
  assessmentStats.inProgress = records.filter(r => r.status === 'in_progress').length
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  loadAssessmentRecords()
}

const handleClear = () => {
  searchKeyword.value = ''
  loadAssessmentRecords()
}

const handleStatusFilter = (value: string) => {
  statusFilter.value = value
  loadAssessmentRecords()
}

const handleTimeFilter = (value: string) => {
  timeFilter.value = value
  loadAssessmentRecords()
}

const viewRecord = (record: AssessmentRecord) => {
  if (record.status === 'in_progress') {
    router.push(`/mobile/parent-center/assessment/progress/${record.id}`)
  } else if (record.status === 'completed') {
    router.push(`/mobile/parent-center/assessment/report/${record.id}`)
  }
}

const viewAllRecords = () => {
  router.push('/mobile/parent-center/assessment/records')
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`
  } else {
    return date.toLocaleDateString()
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'primary'
    case 'cancelled':
      return 'danger'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '进行中'
    case 'cancelled':
      return '已取消'
    default:
      return '未知'
  }
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadAssessmentRecords()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-assessment-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: var(--van-tabbar-height);

  .hero-section {
    background: linear-gradient(135deg, var(--van-primary-color) 0%, #6a8fee 100%);
    color: white;
    padding: var(--van-padding-xl) var(--van-padding-md) var(--van-padding-2xl);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;

      .hero-title {
        font-size: var(--text-3xl);
        font-weight: 700;
        margin-bottom: var(--van-padding-sm);
        line-height: 1.3;
      }

      .hero-subtitle {
        font-size: var(--text-base);
        opacity: 0.9;
        margin-bottom: var(--van-padding-xl);
        line-height: 1.5;
      }

      .start-btn {
        max-width: 280px;
        margin: 0 auto;
        height: 50px;
        font-size: var(--text-lg);
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border: none;
        background: var(--card-bg);
        color: var(--van-primary-color);

        &:active {
          transform: translateY(1px);
        }
      }
    }
  }

  .stats-section {
    margin: var(--van-padding-md);
    margin-top: -var(--van-padding-lg);
    position: relative;
    z-index: 3;

    .stat-item {
      text-align: center;
      background: var(--card-bg);
      padding: var(--van-padding-md) var(--van-padding-sm);
      border-radius: var(--van-radius-lg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      .stat-number {
        font-size: var(--text-2xl);
        font-weight: 700;
        color: var(--van-primary-color);
        margin-bottom: var(--van-padding-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .search-section {
    background: var(--card-bg);
    margin: var(--van-padding-md);
    padding: var(--van-padding-md);
    border-radius: var(--van-radius-lg);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .van-search {
      padding: 0;
    }
  }

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--van-text-color-1);
    margin: var(--van-padding-xl) var(--van-padding-md) var(--van-padding-lg);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: var(--van-padding-md);
      bottom: -8px;
      width: 40px;
      height: 4px;
      background: var(--van-primary-color);
      border-radius: 2px;
    }
  }

  .features-section {
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-md);
      padding: var(--van-padding-lg) var(--van-padding-md);

      .feature-card {
        background: var(--card-bg);
        padding: var(--van-padding-lg);
        border-radius: var(--van-radius-lg);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        text-align: center;

        .feature-icon {
          font-size: 40px;
          margin-bottom: var(--van-padding-md);
          line-height: 1;
        }

        .feature-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color-1);
          margin-bottom: var(--van-padding-sm);
        }

        .feature-desc {
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          line-height: 1.4;
        }
      }
    }
  }

  .process-section {
    background: var(--card-bg);
    margin: var(--van-padding-md);
    padding: var(--van-padding-lg);
    border-radius: var(--van-radius-lg);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .process-steps {
      :deep(.van-steps) {
        .van-step__title {
          font-weight: 500;
        }

        .van-step__circle-container {
          display: none;
        }

        .van-step__line {
          background: var(--van-primary-color);
          opacity: 0.3;
        }
      }

      .step-content {
        display: flex;
        align-items: center;
        padding: var(--van-padding-sm) 0;

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--van-primary-color) 0%, #6a8fee 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 600;
          margin-right: var(--van-padding-md);
          flex-shrink: 0;
        }

        .step-info {
          flex: 1;

          .step-title {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color-1);
            margin-bottom: var(--van-padding-xs);
          }

          .step-desc {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
            line-height: 1.4;
          }
        }
      }
    }
  }

  .records-section {
    margin: var(--van-padding-md);

    .records-list {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .record-item {
        display: flex;
        align-items: center;
        padding: var(--van-padding-lg);
        border-bottom: 1px solid var(--van-border-color);
        cursor: pointer;
        transition: background-color 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: var(--van-background-color-light);
        }

        .record-info {
          flex: 1;

          .record-child {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color-1);
            margin-bottom: var(--van-padding-xs);
          }

          .record-time {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
          }
        }

        .record-status {
          margin-right: var(--van-padding-md);
        }

        .record-score {
          text-align: center;

          .score-value {
            font-size: var(--text-lg);
            font-weight: 700;
            color: var(--van-primary-color);
            margin-bottom: 2px;
          }

          .score-label {
            font-size: 11px;
            color: var(--van-text-color-2);
          }
        }
      }
    }

    .view-more {
      margin-top: var(--van-padding-md);
    }
  }

  :deep(.van-empty) {
    padding: var(--van-padding-xl) 0;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-assessment-page {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
