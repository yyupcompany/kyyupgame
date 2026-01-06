<template>
  <MobileMainLayout
    title="智能中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <template #header-extra>
      <van-button
        type="primary"
        size="small"
        icon="plus"
        @click="handleCreateModel"
      >
        创建模型
      </van-button>
    </template>

    <div class="mobile-ai-center">

      <!-- 欢迎词 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <van-notice-bar
            left-icon="volume-o"
            :scrollable="true"
            text="欢迎来到智能中心，探索强大的人工智能功能，提升工作效率"
            background="#e6f7ff"
            color="#1890ff"
          />
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div
            v-for="stat in overviewStats"
            :key="stat.key"
            class="stat-card-mobile"
            :class="`stat-card--${stat.type}`"
            @click="handleStatClick(stat)"
          >
            <div class="stat-icon">
              <van-icon :name="getMobileIcon(stat.iconName)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}{{ stat.unit }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div v-if="stat.trend !== 0" class="stat-trend">
                <van-icon
                  :name="stat.trend > 0 ? 'arrow-up' : 'arrow-down'"
                  :color="stat.trend > 0 ? '#07c160' : '#ee0a24'"
                  size="12"
                />
                <span :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                  {{ Math.abs(stat.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI功能模块 -->
      <div class="ai-modules">
        <div class="section-header">
          <h3 class="section-title">AI功能模块</h3>
          <p class="section-subtitle">探索强大的人工智能功能，提升工作效率</p>
        </div>
        <div class="modules-grid">
          <van-grid :column-num="2" :gutter="12">
            <van-grid-item
              v-for="module in aiModules"
              :key="module.key"
              @click="navigateTo(module.path)"
            >
              <div class="module-card-mobile" :class="`module-${module.type}`">
                <div class="module-icon">{{ module.icon }}</div>
                <h4 class="module-title">{{ module.title }}</h4>
                <van-tag :type="module.tagType" size="small">{{ module.tag }}</van-tag>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </div>

      <!-- 最近AI任务 -->
      <div class="recent-tasks">
        <div class="section-header">
          <h3 class="section-title">最近AI任务</h3>
          <p class="section-subtitle">查看和管理最近执行的AI任务</p>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadTasks"
        >
          <div
            v-for="task in recentTasks"
            :key="task.id"
            class="task-card-mobile"
          >
            <div class="task-header">
              <div class="task-title-section">
                <h4 class="task-title">{{ task.name }}</h4>
                <van-tag
                  :type="getStatusTagType(task.status)"
                  size="small"
                >
                  {{ getStatusText(task.status) }}
                </van-tag>
              </div>
              <div class="task-date">{{ formatDate(task.createdAt) }}</div>
            </div>

            <p class="task-description">{{ task.description }}</p>

            <div class="task-metrics">
              <div class="metric-item">
                <div class="metric-label">准确率</div>
                <div class="metric-value primary">{{ task.accuracy }}%</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">处理时间</div>
                <div class="metric-value success">{{ task.processingTime }}ms</div>
              </div>
            </div>

            <div class="task-actions">
              <van-button size="small" icon="eye-o" @click="viewTask(task.id)">
                查看详情
              </van-button>
              <van-button size="small" type="primary" icon="replay" @click="rerunTask(task.id)">
                重新运行
              </van-button>
            </div>
          </div>
        </van-list>
      </div>

      <!-- AI模型状态 -->
      <div class="model-status">
        <div class="section-header">
          <h3 class="section-title">AI模型状态</h3>
          <p class="section-subtitle">监控和管理AI模型的运行状态</p>
        </div>

        <div class="models-grid">
          <div
            v-for="model in aiModels"
            :key="model.id"
            class="model-card-mobile"
          >
            <div class="model-card-header">
              <div class="model-info">
                <div class="model-icon-wrapper">
                  <span class="model-icon">{{ model.icon }}</span>
                </div>
                <div class="model-details">
                  <h4 class="model-name">{{ model.name }}</h4>
                  <div class="model-version">版本 {{ model.version }}</div>
                </div>
              </div>
              <div class="model-status-badge" :class="getModelStatusClass(model.status)">
                <div class="status-dot"></div>
                <span class="status-text">{{ getModelStatusText(model.status) }}</span>
              </div>
            </div>

            <div class="model-metrics">
              <div class="metric-row">
                <div class="metric-item">
                  <div class="metric-icon">🎯</div>
                  <div class="metric-content">
                    <div class="metric-label">准确率</div>
                    <div class="metric-value">{{ model.accuracy }}%</div>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-icon">⚡</div>
                  <div class="metric-content">
                    <div class="metric-label">响应时间</div>
                    <div class="metric-value">{{ model.responseTime }}ms</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="model-actions">
              <van-button size="small" icon="eye-o" @click="viewModelDetails(model.id)">
                查看详情
              </van-button>
              <van-button
                size="small"
                :type="model.status === 'active' ? 'warning' : 'primary'"
                :icon="model.status === 'active' ? 'pause' : 'play'"
                @click="toggleModelStatus(model.id)"
              >
                {{ model.status === 'active' ? '停止' : '启动' }}
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI模型创建弹窗 -->
    <van-popup
      v-model:show="showCreateModelDialog"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="create-model-dialog">
        <div class="dialog-header">
          <h3>创建AI模型</h3>
          <van-button icon="cross" @click="showCreateModelDialog = false" />
        </div>
        <div class="dialog-content">
          <p>AI模型创建功能开发中...</p>
        </div>
      </div>
    </van-popup>

    <!-- 悬浮操作按钮 -->
    <van-back-top right="20" bottom="80" />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { get, post } from '@/utils/request'

// 路由
const router = useRouter()

// 对话框状态
const showCreateModelDialog = ref(false)
const loading = ref(false)
const finished = ref(false)

// 概览统计数据
const overviewStats = ref([
  {
    key: 'activeModels',
    title: '活跃AI模型',
    value: 12,
    unit: '',
    trend: 8.5,
    trendText: '较上月',
    type: 'primary',
    iconName: 'Service'
  },
  {
    key: 'dailyQueries',
    title: '今日查询次数',
    value: 1580,
    unit: '',
    trend: 12.3,
    trendText: '较昨日',
    type: 'success',
    iconName: 'Search'
  },
  {
    key: 'accuracy',
    title: 'AI准确率',
    value: 96.8,
    unit: '%',
    trend: 2.1,
    trendText: '较上周',
    type: 'warning',
    iconName: 'Target'
  },
  {
    key: 'automationTasks',
    title: '自动化任务',
    value: 245,
    unit: '',
    trend: -3.2,
    trendText: '较上月',
    type: 'info',
    iconName: 'Setting'
  }
])

// AI功能模块
const aiModules = ref([
  {
    key: 'query',
    title: 'AI智能查询',
    icon: '🤖',
    tag: '智能查询',
    tagType: 'primary',
    type: 'primary',
    path: '/mobile/ai/ai-query'
  },
  {
    key: 'analytics',
    title: 'AI数据分析',
    icon: '📊',
    tag: '数据分析',
    tagType: 'success',
    type: 'success',
    path: '/mobile/ai/ai-analytics'
  },
  {
    key: 'models',
    title: 'AI模型管理',
    icon: '🧠',
    tag: '模型管理',
    tagType: 'warning',
    type: 'warning',
    path: '/mobile/ai/ai-models'
  },
  {
    key: 'automation',
    title: 'AI自动化',
    icon: '⚙️',
    tag: '自动化',
    tagType: 'default',
    type: 'info',
    path: '/mobile/ai/ai-automation'
  },
  {
    key: 'predictions',
    title: 'AI预测分析',
    icon: '🔮',
    tag: '预测分析',
    tagType: 'danger',
    type: 'danger',
    path: '/mobile/ai/ai-predictions'
  },
  {
    key: 'monitoring',
    title: 'AI性能监控',
    icon: '📈',
    tag: '性能监控',
    tagType: 'primary',
    type: 'primary',
    path: '/mobile/ai/ai-monitoring'
  }
])

// 最近AI任务
const recentTasks = ref([
  {
    id: 1,
    name: '学生能力评估分析',
    description: '对大班学生进行综合能力评估，包括认知、语言、社交等维度',
    status: 'completed',
    accuracy: 95.2,
    processingTime: 1250,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: '活动方案智能生成',
    description: '基于春季主题和幼儿年龄特点，生成户外活动方案',
    status: 'running',
    accuracy: 0,
    processingTime: 0,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    name: '家长咨询智能回复',
    description: '针对家长关于孩子教育问题的咨询，生成专业回复建议',
    status: 'completed',
    accuracy: 89.7,
    processingTime: 890,
    createdAt: '2024-01-14T16:45:00Z'
  }
])

// AI模型
const aiModels = ref([
  {
    id: 1,
    name: 'GPT-4 教育助手',
    version: '1.2.0',
    status: 'active',
    accuracy: 96.8,
    responseTime: 1200,
    icon: '🤖'
  },
  {
    id: 2,
    name: '智能评估模型',
    version: '2.1.0',
    status: 'active',
    accuracy: 94.2,
    responseTime: 890,
    icon: '🎯'
  },
  {
    id: 3,
    name: '课程生成模型',
    version: '1.0.5',
    status: 'training',
    accuracy: 0,
    responseTime: 0,
    icon: '📚'
  }
])

// 获取移动端图标
const getMobileIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'Service': 'service-o',
    'Search': 'search',
    'Target': 'aim',
    'Setting': 'setting-o'
  }
  return iconMap[iconName] || 'apps-o'
}

// API调用函数
const fetchOverviewStats = async () => {
  try {
    loading.value = true
    const response = await get('/ai-stats/overview')
    if (response.success && response.data) {
      overviewStats.value = response.data
    }
  } catch (error) {
    console.error('获取AI概览统计失败:', error)
    showToast('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

const fetchRecentTasks = async () => {
  try {
    const response = await get('/ai-stats/recent-tasks')
    if (response.success && response.data) {
      recentTasks.value = response.data
    }
  } catch (error) {
    console.error('获取最近AI任务失败:', error)
  }
}

const fetchAIModels = async () => {
  try {
    const response = await get('/ai-stats/models')
    if (response.success && response.data) {
      aiModels.value = response.data
    }
  } catch (error) {
    console.error('获取AI模型列表失败:', error)
  }
}

// 加载任务
const loadTasks = () => {
  // 模拟加载更多任务
  setTimeout(() => {
    finished.value = true
  }, 1000)
}

// 初始化数据
const initData = async () => {
  const loadingToast = showLoadingToast('加载数据中...')
  try {
    await Promise.all([
      fetchOverviewStats(),
      fetchRecentTasks(),
      fetchAIModels()
    ])
    loadingToast.close()
  } catch (error) {
    loadingToast.close()
    showToast('数据加载失败')
  }
}

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 创建AI模型
const handleCreateModel = () => {
  showCreateModelDialog.value = true
}

// 处理统计卡片点击
const handleStatClick = (stat: any) => {
  showToast(`点击了${stat.title}统计卡片`)
}

// 查看AI任务
const viewTask = (id: number) => {
  router.push(`/mobile/ai/task-detail?id=${id}`)
}

// 重新运行任务
const rerunTask = (id: number) => {
  showToast(`重新运行AI任务 ${id}`)
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    running: '运行中',
    failed: '失败',
    pending: '等待中'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusTypeMap: Record<string, string> = {
    completed: 'success',
    running: 'primary',
    failed: 'danger',
    pending: 'warning'
  }
  return statusTypeMap[status] || 'default'
}

// 获取模型状态类
const getModelStatusClass = (status: string) => {
  return status
}

// 获取模型状态文本
const getModelStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '运行中',
    training: '训练中',
    stopped: '已停止'
  }
  return statusMap[status] || status
}

// 查看模型详情
const viewModelDetails = (modelId: number) => {
  router.push(`/mobile/ai/model-detail?id=${modelId}`)
}

// 切换模型状态
const toggleModelStatus = (modelId: number) => {
  showToast(`切换模型状态: ${modelId}`)
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('移动端AI中心已加载')
  initData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-ai-center {
  padding: var(--van-padding-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

// 欢迎词样式
.welcome-section {
  margin-bottom: var(--van-padding-lg);

  .welcome-content {
    border-radius: var(--van-radius-lg);
    overflow: hidden;
  }
}

// 统计卡片样式
.stats-section {
  margin-bottom: var(--van-padding-lg);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--van-padding-md);

    .stat-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--van-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--van-background-color-light);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: 2px;
        }

        .stat-title {
          font-size: var(--text-xs);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;

          .trend-up {
            color: #07c160;
          }

          .trend-down {
            color: #ee0a24;
          }
        }
      }

      &.stat-card--primary .stat-icon {
        background: rgba(64, 158, 255, 0.1);
        color: var(--primary-color);
      }

      &.stat-card--success .stat-icon {
        background: rgba(103, 194, 58, 0.1);
        color: var(--success-color);
      }

      &.stat-card--warning .stat-icon {
        background: rgba(230, 162, 60, 0.1);
        color: var(--warning-color);
      }

      &.stat-card--info .stat-icon {
        background: rgba(144, 147, 153, 0.1);
        color: var(--info-color);
      }
    }
  }
}

// 区域标题样式
.section-header {
  margin-bottom: var(--van-padding-lg);
  text-align: left;

  .section-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
    margin: 0 0 var(--van-padding-xs) 0;
    line-height: 1.3;
  }

  .section-subtitle {
    font-size: var(--text-sm);
    color: var(--van-text-color-2);
    margin: 0;
    line-height: 1.5;
  }
}

// AI功能模块样式
.ai-modules {
  margin-bottom: var(--van-padding-lg);

  .modules-grid {
    .module-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &:active {
        transform: scale(0.98);
      }

      .module-icon {
        font-size: var(--text-4xl);
        margin-bottom: var(--van-padding-xs);
      }

      .module-title {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--van-text-color);
        margin: 0 0 var(--van-padding-xs) 0;
        line-height: 1.2;
      }
    }
  }
}

// 任务卡片样式
.recent-tasks {
  margin-bottom: var(--van-padding-lg);

  .task-card-mobile {
    background: var(--card-bg);
    border-radius: var(--van-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--van-padding-md);

      .task-title-section {
        flex: 1;

        .task-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
          margin: 0 0 var(--van-padding-xs) 0;
          line-height: 1.3;
        }
      }

      .task-date {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
        white-space: nowrap;
        margin-left: var(--van-padding-sm);
      }
    }

    .task-description {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
      margin: 0 0 var(--van-padding-md) 0;
    }

    .task-metrics {
      display: flex;
      gap: var(--van-padding-lg);
      margin-bottom: var(--van-padding-md);

      .metric-item {
        text-align: center;
        flex: 1;

        .metric-label {
          font-size: var(--text-xs);
          color: var(--van-text-color-3);
          margin-bottom: var(--van-padding-xs);
        }

        .metric-value {
          font-size: var(--text-base);
          font-weight: 600;

          &.primary {
            color: var(--primary-color);
          }

          &.success {
            color: var(--success-color);
          }
        }
      }
    }

    .task-actions {
      display: flex;
      gap: var(--van-padding-sm);
      justify-content: flex-end;
    }
  }
}

// 模型卡片样式
.model-status {
  margin-bottom: var(--van-padding-lg);

  .models-grid {
    .model-card-mobile {
      background: var(--card-bg);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-md);
      margin-bottom: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .model-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-md);

        .model-info {
          display: flex;
          align-items: center;
          flex: 1;

          .model-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: var(--van-radius-md);
            background: rgba(64, 158, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: var(--van-padding-md);

            .model-icon {
              font-size: var(--text-xl);
            }
          }

          .model-details {
            .model-name {
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--van-text-color);
              margin: 0 0 var(--van-padding-xs) 0;
              line-height: 1.3;
            }

            .model-version {
              font-size: var(--text-xs);
              color: var(--van-text-color-3);
            }
          }
        }

        .model-status-badge {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          padding: var(--van-padding-xs) var(--van-padding-sm);
          border-radius: var(--van-radius-xl);
          font-size: var(--text-xs);
          font-weight: 500;

          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }

          &.active {
            background: rgba(103, 194, 58, 0.1);
            color: var(--success-color);

            .status-dot {
              background: var(--success-color);
            }
          }

          &.training {
            background: rgba(230, 162, 60, 0.1);
            color: var(--warning-color);

            .status-dot {
              background: var(--warning-color);
            }
          }

          &.stopped {
            background: rgba(144, 147, 153, 0.1);
            color: var(--info-color);

            .status-dot {
              background: var(--info-color);
            }
          }
        }
      }

      .model-metrics {
        margin-bottom: var(--van-padding-md);

        .metric-row {
          display: flex;
          gap: var(--van-padding-md);

          .metric-item {
            display: flex;
            align-items: center;
            gap: var(--van-padding-xs);
            flex: 1;
            padding: var(--van-padding-xs);
            background: var(--van-background-color-light);
            border-radius: var(--van-radius-sm);

            .metric-icon {
              font-size: var(--text-base);
            }

            .metric-content {
              .metric-label {
                font-size: 11px;
                color: var(--van-text-color-3);
                margin-bottom: 2px;
              }

              .metric-value {
                font-size: var(--text-sm);
                font-weight: 600;
                color: var(--van-text-color);
              }
            }
          }
        }
      }

      .model-actions {
        display: flex;
        gap: var(--van-padding-sm);
        justify-content: flex-end;
      }
    }
  }
}

// 创建模型弹窗样式
.create-model-dialog {
  padding: var(--van-padding-lg);

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-lg);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .dialog-content {
    text-align: center;
    padding: var(--van-padding-xl) 0;
    color: var(--van-text-color-2);
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-ai-center {
    padding: var(--van-padding-sm);
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>