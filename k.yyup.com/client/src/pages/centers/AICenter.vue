<template>
  <UnifiedCenterLayout
    title="智能中心"
    description="这里是人工智能服务的中心枢纽，您可以管理AI模型、查看智能分析、配置自动化工作流"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreateModel">
        <UnifiedIcon name="Plus" />
        创建AI模型
      </el-button>
    </template>

    <div class="center-container ai-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
        <!-- 欢迎词 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h2>欢迎来到智能中心</h2>
            <p>探索强大的人工智能功能，提升工作效率</p>
          </div>
        </div>

        <!-- 统计卡片区域 - 使用统一网格系统 -->
        <div class="stats-section">
          <div class="stats-grid-unified">
            <CentersStatCard
              v-for="stat in overviewStats"
              :key="stat.key"
              :title="stat.title"
              :value="stat.value"
              :unit="stat.unit"
              :trend="stat.trend"
              :trend-text="stat.trendText"
              :type="stat.type"
              :icon-name="stat.iconName"
              clickable
              @click="handleStatClick(stat)"
            />
          </div>
        </div>

        <!-- AI功能模块 -->
        <div class="ai-modules section-spacing">
          <div class="section-header">
            <h3 class="section-title">AI功能模块</h3>
            <p class="section-subtitle">探索强大的人工智能功能，提升工作效率</p>
          </div>
          <div class="modules-grid">
            <div class="module-card" @click="navigateTo('/ai/query')">
              <div class="module-header">
                <div class="module-icon primary">🤖</div>
                <h4 class="module-title">AI智能查询</h4>
              </div>
              <p class="module-description">使用自然语言查询系统数据，获得智能化的分析结果</p>
              <div class="module-footer">
                <el-tag size="small" type="primary">智能查询</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai/analytics')">
              <div class="module-header">
                <div class="module-icon success">📊</div>
                <h4 class="module-title">AI数据分析</h4>
              </div>
              <p class="module-description">利用机器学习算法进行深度数据分析和预测</p>
              <div class="module-footer">
                <el-tag size="small" type="success">数据分析</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai/models')">
              <div class="module-header">
                <div class="module-icon warning">🧠</div>
                <h4 class="module-title">AI模型管理</h4>
              </div>
              <p class="module-description">管理和配置各种AI模型，包括训练和部署</p>
              <div class="module-footer">
                <el-tag size="small" type="warning">模型管理</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai/automation/WorkflowAutomation')">
              <div class="module-header">
                <div class="module-icon info">⚙️</div>
                <h4 class="module-title">AI自动化</h4>
              </div>
              <p class="module-description">设置智能化工作流，自动处理重复性任务</p>
              <div class="module-footer">
                <el-tag size="small" type="info">自动化</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai/predictions')">
              <div class="module-header">
                <div class="module-icon danger">🔮</div>
                <h4 class="module-title">AI预测分析</h4>
              </div>
              <p class="module-description">基于历史数据进行趋势预测和风险评估</p>
              <div class="module-footer">
                <el-tag size="small" type="danger">预测分析</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai/monitoring/AIPerformanceMonitor')">
              <div class="module-header">
                <div class="module-icon primary">📈</div>
                <h4 class="module-title">AI性能监控</h4>
              </div>
              <p class="module-description">实时监控AI服务性能和资源使用情况</p>
              <div class="module-footer">
                <el-tag size="small" type="primary">性能监控</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/admin/image-replacement')">
              <div class="module-header">
                <div class="module-icon success">🎨</div>
                <h4 class="module-title">AI自动配图</h4>
              </div>
              <p class="module-description">使用豆包文生图模型自动生成和替换项目中的展位图片</p>
              <div class="module-footer">
                <el-tag size="small" type="success">自动配图</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai-center/function-tools')">
              <div class="module-header">
                <div class="module-icon warning">🔧</div>
                <h4 class="module-title">Function Tools</h4>
              </div>
              <p class="module-description">智能工具调用系统，支持数据查询、页面导航等多种功能</p>
              <div class="module-footer">
                <el-tag size="small" type="warning">工具系统</el-tag>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/ai-center/expert-consultation')">
              <div class="module-header">
                <div class="module-icon info">👥</div>
                <h4 class="module-title">AI专家咨询</h4>
              </div>
              <p class="module-description">多位AI专家协同咨询，为您的问题提供专业的多角度分析和建议</p>
              <div class="module-footer">
                <el-tag size="small" type="info">专家咨询</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近AI任务 -->
        <div class="recent-tasks section-spacing">
          <div class="section-header">
            <h3 class="section-title">最近AI任务</h3>
            <p class="section-subtitle">查看和管理最近执行的AI任务</p>
          </div>
          <div class="tasks-container">
            <div class="task-card" v-for="task in recentTasks" :key="task.id">
              <div class="task-header">
                <div class="task-title-section">
                  <h4 class="task-title">{{ task.name }}</h4>
                  <el-tag
                    :type="getStatusTagType(task.status)"
                    size="small"
                    class="task-status-tag"
                  >
                    {{ getStatusText(task.status) }}
                  </el-tag>
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
                <el-button size="small" @click="viewTask(task.id)">
                  <UnifiedIcon name="eye" />
                  查看详情
                </el-button>
                <el-button size="small" type="primary" @click="rerunTask(task.id)">
                  <UnifiedIcon name="Refresh" />
                  重新运行
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- AI模型状态 -->
        <div class="model-status section-spacing">
          <div class="section-header">
            <h3 class="section-title">AI模型状态</h3>
            <p class="section-subtitle">监控和管理AI模型的运行状态</p>
          </div>
          <div class="models-grid">
            <div class="model-card" v-for="model in aiModels" :key="model.id">
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
                <el-button size="small" @click="viewModelDetails(model.id)">
                  <UnifiedIcon name="eye" />
                  查看详情
                </el-button>
                <el-button
                  size="small"
                  :type="model.status === 'active' ? 'warning' : 'primary'"
                  @click="toggleModelStatus(model.id)"
                >
                  <UnifiedIcon name="default" />
                  <UnifiedIcon name="default" />
                  {{ model.status === 'active' ? '停止' : '启动' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- AI模型创建对话框 -->
    <CreateModelDialog
      v-model="showCreateModelDialog"
      @success="handleModelCreated"
    />
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, View, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import CentersStatCard from '@/components/centers/StatCard.vue'
import CreateModelDialog from '@/components/ai/CreateModelDialog.vue'
import { get, post } from '@/utils/request'

// 路由
const router = useRouter()

// 对话框状态
const showCreateModelDialog = ref(false)


// 概览统计数据
const overviewStats = ref([
  {
    key: 'activeModels',
    title: '活跃AI模型',
    value: 0,
    unit: '',
    trend: 0,
    trendText: '较上月',
    type: 'primary',
    iconName: 'Service'
  },
  {
    key: 'dailyQueries',
    title: '今日查询次数',
    value: 0,
    unit: '',
    trend: 0,
    trendText: '较昨日',
    type: 'success',
    iconName: 'Search'
  },
  {
    key: 'accuracy',
    title: 'AI准确率',
    value: 0,
    unit: '%',
    trend: 0,
    trendText: '较上周',
    type: 'warning',
    iconName: 'Target'
  },
  {
    key: 'automationTasks',
    title: '自动化任务',
    value: 0,
    unit: '',
    trend: 0,
    trendText: '较上月',
    type: 'info',
    iconName: 'Setting'
  }
])

// 加载状态
const loading = ref(false)

// 最近AI任务
const recentTasks = ref([])

// AI模型
const aiModels = ref([])


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
    ElMessage.error('获取统计数据失败')
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


// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchOverviewStats(),
    fetchRecentTasks(),
    fetchAIModels()
  ])
}

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 创建AI模型
const handleCreateModel = () => {
  showCreateModelDialog.value = true
}

// 处理模型创建成功
const handleModelCreated = (modelData: any) => {
  console.log('新创建的模型:', modelData)
  // 刷新模型列表或其他操作
  fetchAIModels()
}

// 处理创建操作
const handleCreate = () => {
  handleCreateModel()
}


// 处理统计卡片点击
const handleStatClick = (stat: any) => {
  ElMessage.info(`点击了${stat.title}统计卡片`)
}

// 查看AI任务
const viewTask = (id: number) => {
  ElMessage.info(`查看AI任务 ${id}`)
}

// 重新运行任务
const rerunTask = (id: number) => {
  ElMessage.success(`重新运行AI任务 ${id}`)
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
  return date.toLocaleDateString('zh-CN')
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const statusTypeMap: Record<string, string> = {
    completed: 'success',
    running: 'primary',
    failed: 'danger',
    pending: 'warning'
  }
  return statusTypeMap[status] || 'info'
}

// 获取模型状态类
const getModelStatusClass = (status: string) => {
  return status // 直接返回状态作为类名
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
  ElMessage.info(`查看模型详情: ${modelId}`)
  // 这里可以跳转到模型详情页面
}

// 切换模型状态
const toggleModelStatus = (modelId: number) => {
  ElMessage.info(`切换模型状态: ${modelId}`)
  // 这里可以调用API切换模型状态
}




// 组件挂载时加载数据
onMounted(() => {
  console.log('智能中心已加载')
  initData()
})
</script>

<style scoped lang="scss">
/* AI中心根容器 - 完全参考活动中心的标准样式 */
.ai-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  overflow-y: auto;
}

/* 欢迎词样式 */
.welcome-section {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);

  .welcome-content {
    h2 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    p {
      font-size: var(--text-base);
      color: var(--el-text-color-regular);
      margin: 0;
      line-height: 1.5;
    }
  }
}

/* 新增：改善排版的通用样式 */
.section-spacing {
  margin-bottom: var(--spacing-xl);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  margin-bottom: var(--spacing-xl);
  text-align: left;

  .section-title {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
    line-height: 1.3;
  }

  .section-subtitle {
    font-size: var(--text-base);
    color: var(--el-text-color-regular);
    margin: 0;
    line-height: 1.5;
  }
}

/* AI功能模块卡片样式 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.module-card {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--el-color-primary);
  }

  .module-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .module-icon {
      width: 4var(--spacing-sm);
      height: 4var(--spacing-sm);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      margin-right: var(--spacing-lg);

      &.primary { background: var(--el-color-primary-light-9); }
      &.success { background: var(--el-color-success-light-9); }
      &.warning { background: var(--el-color-warning-light-9); }
      &.info { background: var(--el-color-info-light-9); }
      &.danger { background: var(--el-color-danger-light-9); }
    }

    .module-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      line-height: 1.3;
    }
  }

  .module-description {
    font-size: var(--text-base);
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0 0 var(--spacing-lg) 0;
  }

  .module-footer {
    display: flex;
    justify-content: flex-start;
  }
}

/* 任务卡片样式 */
.tasks-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.task-card {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);

    .task-title-section {
      flex: 1;

      .task-title {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-sm) 0;
        line-height: 1.3;
      }

      .task-status-tag {
        margin: 0;
      }
    }

    .task-date {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      margin-left: var(--spacing-lg);
    }
  }

  .task-description {
    font-size: var(--text-base);
    color: var(--el-text-color-regular);
    line-height: 1.5;
    margin: 0 0 var(--spacing-lg) 0;
  }

  .task-metrics {
    display: flex;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);

    .metric-item {
      text-align: center;

      .metric-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        margin-bottom: var(--spacing-xs);
      }

      .metric-value {
        font-size: var(--text-lg);
        font-weight: 600;

        &.primary { color: var(--el-color-primary); }
        &.success { color: var(--el-color-success); }
      }
    }
  }

  .task-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

/* 模型卡片样式 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.model-card {
  background: var(--el-bg-color);
  border: var(--border-width-base) solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  .model-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);

    .model-info {
      display: flex;
      align-items: center;
      flex: 1;

      .model-icon-wrapper {
        width: 4var(--spacing-sm);
        height: 4var(--spacing-sm);
        border-radius: var(--radius-md);
        background: var(--el-color-primary-light-9);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--spacing-lg);

        .model-icon {
          font-size: var(--text-2xl);
        }
      }

      .model-details {
        .model-name {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 var(--spacing-xs) 0;
          line-height: 1.3;
        }

        .model-version {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }
      }
    }

    .model-status-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-xl);
      font-size: var(--text-sm);
      font-weight: 500;

      .status-dot {
        width: auto;
        min-height: 32px; height: auto;
        border-radius: var(--radius-full);
      }

      &.active {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);

        .status-dot {
          background: var(--el-color-success);
        }
      }

      &.training {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);

        .status-dot {
          background: var(--el-color-warning);
        }
      }

      &.stopped {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);

        .status-dot {
          background: var(--el-color-info);
        }
      }
    }
  }

  .model-metrics {
    margin-bottom: var(--spacing-lg);

    .metric-row {
      display: flex;
      gap: var(--spacing-lg);

      .metric-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        padding: var(--spacing-sm);
        background: var(--el-fill-color-lighter);
        border-radius: var(--radius-sm);

        .metric-icon {
          font-size: var(--text-lg);
        }

        .metric-content {
          .metric-label {
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .metric-value {
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }

  .model-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

// 只保留页面标题样式
.recent-tasks h3,
.model-status h3,
.ai-query-content .query-header h2,
.ai-analysis-content .analysis-header h2,
.ai-models-content .models-header h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--el-text-color-primary);
  font-size: var(--text-xl);
  font-weight: 600;
}

// 响应式设计 - 参考活动中心
@media (max-width: 1200px) {
  .ai-center-timeline {
    padding: var(--spacing-lg);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;

    .header-content {
      .page-title {
        font-size: var(--text-2xl);
      }

      .page-description {
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }
}

@media (max-width: 76var(--spacing-sm)) {
  .ai-center-timeline {
    padding: var(--spacing-md);
  }

  .page-header {
    padding: var(--spacing-lg);

    .header-content {
      .page-title {
        font-size: var(--text-xl);
      }

      .page-description {
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
