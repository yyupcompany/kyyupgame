<template>
  <MobileSubPageLayout title="发育测评" back-path="/mobile/parent-center">
    <div class="mobile-development-assessment">
      <!-- 页面头部 -->
      <div class="header-section">
        <div class="title-area">
          <h1 class="main-title">
            <van-icon name="chart-trending-o" />
            2-6岁儿童发育商测评
          </h1>
          <p class="subtitle">通过科学的评估体系，全面了解2-6岁儿童在五大能区的发展情况</p>
        </div>
      </div>

      <!-- 测评说明卡片 -->
      <van-cell-group class="intro-card" inset>
        <van-cell class="card-header">
          <template #title>
            <div class="header-title">
              <van-icon name="info-o" />
              <span>测评说明</span>
            </div>
          </template>
        </van-cell>

        <div class="intro-content">
          <div class="section">
            <h3 class="section-title">什么是发育商测评？</h3>
            <p class="section-text">
              发育商测评是评估0-6岁儿童神经心理发育水平的科学方法，通过五大能区的综合评估，了解孩子的发育情况。
            </p>
          </div>

          <div class="section">
            <h3 class="section-title">测评内容涵盖</h3>
            <div class="dimensions-grid">
              <div
                v-for="dimension in assessmentDimensions"
                :key="dimension.key"
                class="dimension-item"
              >
                <div class="dimension-icon" :style="{ color: dimension.color }">
                  <span>{{ dimension.emoji }}</span>
                </div>
                <h4 class="dimension-title">{{ dimension.title }}</h4>
                <p class="dimension-desc">{{ dimension.description }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">测评信息</h3>
            <van-cell-group inset>
              <van-cell title="适合年龄" value="2-6岁" />
              <van-cell title="测评时长" value="15-25分钟" />
              <van-cell title="测评形式" value="互动游戏 + 观察评估" />
              <van-cell title="结果展示" value="发育商指数 + 能力分析报告" />
            </van-cell-group>
          </div>
        </div>
      </van-cell-group>

      <!-- 开始测评区域 -->
      <van-cell-group class="start-card" inset>
        <van-cell class="card-header">
          <template #title>
            <div class="header-title">
              <van-icon name="flag-o" />
              <span>开始测评</span>
            </div>
          </template>
        </van-cell>

        <div class="start-content">
          <div class="features-grid">
            <div
              v-for="(feature, index) in assessmentFeatures"
              :key="index"
              class="feature-item"
            >
              <van-icon name="success" class="feature-icon" />
              <span class="feature-text">{{ feature }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <van-button
              type="primary"
              block
              round
              size="large"
              :loading="starting"
              @click="startAssessment"
              class="primary-btn"
            >
              <van-icon name="play-circle-o" />
              立即开始测评
            </van-button>

            <van-button
              block
              round
              size="large"
              @click="viewReports"
              class="secondary-btn"
            >
              <van-icon name="orders-o" />
              查看历史报告
            </van-button>
          </div>
        </div>
      </van-cell-group>

      <!-- 测评历史记录 -->
      <van-cell-group
        v-if="historyData.length > 0"
        class="history-card"
        inset
      >
        <van-cell class="card-header">
          <template #title>
            <div class="header-title">
              <van-icon name="clock-o" />
              <span>最近测评记录</span>
            </div>
          </template>
          <template #right-icon>
            <van-button
              type="primary"
              size="small"
              plain
              @click="viewAllHistory"
            >
              查看全部
            </van-button>
          </template>
        </van-cell>

        <div class="history-list">
          <div
            v-for="record in historyData"
            :key="record.id"
            class="history-item"
          >
            <div class="record-info">
              <div class="record-header">
                <span class="child-name">{{ record.childName }}</span>
                <van-tag
                  :type="getDQTagType(record.dq)"
                  size="small"
                >
                  {{ record.dq }}
                </van-tag>
              </div>
              <div class="record-details">
                <span class="record-date">{{ formatDate(record.date) }}</span>
                <span class="record-age">{{ record.age }}个月</span>
                <van-tag
                  :type="record.status === 'completed' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ record.status === 'completed' ? '已完成' : '进行中' }}
                </van-tag>
              </div>
            </div>
            <div class="record-actions">
              <van-button
                type="primary"
                size="small"
                plain
                @click="viewReport(record.id)"
              >
                查看报告
              </van-button>
              <van-button
                v-if="record.status !== 'completed'"
                type="primary"
                size="small"
                plain
                @click="continueAssessment(record.id)"
              >
                继续测评
              </van-button>
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

const router = useRouter()
const starting = ref(false)
const historyData = ref<any[]>([])

// 测评维度配置
const assessmentDimensions = [
  {
    key: 'gross',
    title: '大运动能力',
    description: '身体协调性、平衡能力、爬行、行走、跑跳等大肌肉发展',
    emoji: '🏃',
    color: '#409EFF'
  },
  {
    key: 'fine',
    title: '精细动作',
    description: '手眼协调、手指灵活性、抓握能力、书写准备等小肌肉发展',
    emoji: '✏️',
    color: '#67C23A'
  },
  {
    key: 'language',
    title: '语言能力',
    description: '语言理解、表达能力、词汇量、语法结构等语言发展',
    emoji: '💬',
    color: '#E6A23C'
  },
  {
    key: 'social',
    title: '社会适应',
    description: '人际交往、情绪管理、规则意识、独立性等社会能力发展',
    emoji: '👥',
    color: '#F56C6C'
  },
  {
    key: 'cognitive',
    title: '认知能力',
    description: '注意力、记忆力、思维能力、问题解决等认知发展',
    emoji: '🧠',
    color: '#909399'
  }
]

// 测评特色
const assessmentFeatures = [
  '专业科学的评估体系',
  '趣味互动的测评方式',
  'AI智能分析报告',
  '个性化成长建议'
]

// 开始测评
const startAssessment = async () => {
  try {
    starting.value = true
    Toast.loading({
      message: '正在准备测评...',
      forbidClick: true,
      duration: 0
    })

    // 延迟跳转以显示加载效果
    await new Promise(resolve => setTimeout(resolve, 800))

    Toast.clear()
    await router.push('/mobile/parent-center/assessment/start')
  } catch (error) {
    Toast.clear()
    Toast.fail('跳转失败，请重试')
  } finally {
    starting.value = false
  }
}

// 查看历史报告
const viewReports = () => {
  router.push('/mobile/parent-center/assessment/growth-trajectory')
}

// 查看全部历史
const viewAllHistory = () => {
  router.push('/mobile/parent-center/assessment/growth-trajectory')
}

// 查看报告
const viewReport = (id: string) => {
  router.push(`/mobile/parent-center/assessment/report/${id}`)
}

// 继续测评
const continueAssessment = (id: string) => {
  router.push(`/mobile/parent-center/assessment/doing/${id}`)
}

// 获取发育商等级标签类型
const getDQTagType = (dq: number) => {
  if (dq >= 130) return 'success'
  if (dq >= 110) return 'primary'
  if (dq >= 90) return 'warning'
  return 'danger'
}

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}-${d.getDate()}`
}

// 加载历史数据
const loadHistory = async () => {
  try {
    // 模拟历史数据，实际应该从API获取
    historyData.value = [
      {
        id: '1',
        date: '2024-01-15',
        childName: '小明',
        age: 48,
        dq: 115,
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-01-10',
        childName: '小明',
        age: 47,
        dq: 112,
        status: 'completed'
      }
    ]
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadHistory()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-development-assessment {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: var(--van-padding-xl);

  .header-section {
    background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
    padding: var(--van-padding-xl) var(--van-padding-md) var(--van-padding-lg);
    color: white;
    text-align: center;

    .title-area {
      .main-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--van-padding-sm);
        font-size: var(--text-xl);
        font-weight: 600;
        margin: 0 0 var(--van-padding-sm) 0;
        line-height: 1.3;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

        .van-icon {
          font-size: var(--text-2xl);
        }
      }

      .subtitle {
        font-size: var(--text-sm);
        margin: 0;
        opacity: 0.9;
        line-height: 1.4;
      }
    }
  }

  .intro-card,
  .start-card,
  .history-card {
    margin-bottom: var(--van-padding-md);

    .card-header {
      background: var(--van-background-color-light);

      .header-title {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-weight: 600;
        font-size: var(--text-base);
        color: var(--van-text-color);

        .van-icon {
          color: var(--van-primary-color);
        }
      }
    }
  }

  .intro-content {
    padding: var(--van-padding-md);

    .section {
      margin-bottom: var(--van-padding-lg);

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
        margin: 0 0 var(--van-padding-sm) 0;
      }

      .section-text {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.5;
        margin: 0 0 var(--van-padding-md) 0;
      }

      .dimensions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--van-padding-md);

        .dimension-item {
          background: var(--van-background-color);
          border-radius: var(--van-radius-md);
          padding: var(--van-padding-md);
          text-align: center;
          border: 1px solid var(--van-border-color);

          .dimension-icon {
            font-size: var(--text-2xl);
            margin-bottom: var(--van-padding-sm);

            span {
              font-size: var(--text-4xl);
              display: block;
            }
          }

          .dimension-title {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color);
            margin: 0 0 var(--van-padding-xs) 0;
          }

          .dimension-desc {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            line-height: 1.4;
            margin: 0;
          }
        }
      }
    }
  }

  .start-content {
    padding: var(--van-padding-md);

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--van-padding-md);
      margin-bottom: var(--van-padding-lg);

      .feature-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-size: var(--text-sm);
        color: var(--van-text-color-2);

        .feature-icon {
          color: var(--van-success-color);
          font-size: var(--text-base);
          flex-shrink: 0;
        }

        .feature-text {
          line-height: 1.3;
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-md);

      .primary-btn {
        background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
        border: none;
        height: 50px;
        font-size: var(--text-base);
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(32, 126, 255, 0.3);

        .van-icon {
          margin-right: var(--van-padding-xs);
        }
      }

      .secondary-btn {
        height: 44px;
        font-size: var(--text-sm);
        color: var(--van-primary-color);
        border-color: var(--van-primary-color);

        .van-icon {
          margin-right: var(--van-padding-xs);
        }
      }
    }
  }

  .history-list {
    padding: var(--van-padding-md);

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-md) 0;
      border-bottom: 1px solid var(--van-border-color);

      &:last-child {
        border-bottom: none;
      }

      .record-info {
        flex: 1;

        .record-header {
          display: flex;
          align-items: center;
          gap: var(--van-padding-sm);
          margin-bottom: var(--van-padding-xs);

          .child-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--van-text-color);
          }
        }

        .record-details {
          display: flex;
          align-items: center;
          gap: var(--van-padding-sm);
          font-size: var(--text-xs);
          color: var(--van-text-color-3);

          .record-date {
            color: var(--van-text-color-2);
          }

          .record-age {
            color: var(--van-text-color-2);
          }
        }
      }

      .record-actions {
        display: flex;
        gap: var(--van-padding-xs);
      }
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-development-assessment {
    .intro-content {
      .dimensions-grid {
        grid-template-columns: 1fr;
      }
    }

    .start-content {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .mobile-development-assessment {
    max-width: 768px;
    margin: 0 auto;

    .header-section {
      .title-area {
        .main-title {
          font-size: var(--text-2xl);
        }

        .subtitle {
          font-size: var(--text-base);
        }
      }
    }
  }
}
</style>