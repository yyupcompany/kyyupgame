<template>
  <UnifiedCenterLayout
    title="智能中心"
    description="这里是人工智能服务的中心枢纽，您可以管理AI模型、查看智能分析、配置自动化工作流"
  >
    <div class="center-container ai-center-timeline">

    <!-- 主要内容区域 -->
    <div class="main-content">
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
/* AI中心根容器 */
.ai-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: var(--bg-page);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

/* ==================== 欢迎区块优化 ==================== */
.welcome-section {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-5) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  text-align: left;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;

  // 添加装饰性背景图案
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  .welcome-content {
    position: relative;
    z-index: 1;

    h2 {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: #fff;
      margin: 0 0 var(--spacing-sm) 0;
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    p {
      font-size: var(--text-base);
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      line-height: 1.6;
      max-width: 600px;
    }
  }
}

/* ==================== 统计卡片区域优化 ==================== */
.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid-unified {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

/* ==================== 通用区块头部样式 ==================== */
.section-spacing {
  margin-bottom: var(--spacing-2xl);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  margin-bottom: var(--spacing-lg);
  text-align: left;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--el-border-color-lighter);

  .section-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-xs) 0;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  .section-subtitle {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    margin: 0;
    line-height: 1.5;
    padding-left: var(--spacing-md);
  }
}

/* ==================== AI功能模块卡片样式 ==================== */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.module-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  // 顶部渐变装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-5));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--el-color-primary-light-5);

    &::before {
      opacity: 1;
    }
  }

  .module-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-md);

    .module-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      transition: transform 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-7) 100%);
        color: var(--el-color-primary);
      }
      &.success {
        background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-color-success-light-7) 100%);
        color: var(--el-color-success);
      }
      &.warning {
        background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-color-warning-light-7) 100%);
        color: var(--el-color-warning);
      }
      &.info {
        background: linear-gradient(135deg, var(--el-color-info-light-9) 0%, var(--el-color-info-light-7) 100%);
        color: var(--el-color-info);
      }
      &.danger {
        background: linear-gradient(135deg, var(--el-color-danger-light-9) 0%, var(--el-color-danger-light-7) 100%);
        color: var(--el-color-danger);
      }
    }

    .module-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      line-height: 1.3;
      transition: color 0.3s ease;
    }
  }

  &:hover .module-header .module-icon {
    transform: scale(1.1);
  }

  .module-description {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0 0 var(--spacing-md) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .module-footer {
    display: flex;
    justify-content: flex-start;
  }
}

/* ==================== 任务卡片样式 ==================== */
.tasks-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.task-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--el-color-primary);
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    box-shadow: var(--shadow-md);

    &::before {
      opacity: 1;
    }
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-md);

    .task-title-section {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      .task-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
        line-height: 1.3;
      }

      .task-status-tag {
        margin: 0;
        flex-shrink: 0;
      }
    }

    .task-date {
      font-size: var(--text-xs);
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      background: var(--el-fill-color-light);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }
  }

  .task-description {
    font-size: var(--text-sm);
    color: var(--el-text-color-regular);
    line-height: 1.5;
    margin: 0 0 var(--spacing-md) 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .task-metrics {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--el-fill-color-light);
    border-radius: var(--radius-md);

    .metric-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .metric-label {
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      }

      .metric-value {
        font-size: var(--text-base);
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
    padding-top: var(--spacing-sm);
    border-top: 1px dashed var(--el-border-color-lighter);
  }
}

/* ==================== 模型卡片样式 ==================== */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.model-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--el-color-primary-light-3);
  }

  .model-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-md);

    .model-info {
      display: flex;
      align-items: center;
      flex: 1;
      gap: var(--spacing-md);

      .model-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-7) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .model-icon {
          font-size: 24px;
        }
      }

      .model-details {
        .model-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 var(--spacing-xs) 0;
          line-height: 1.3;
        }

        .model-version {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
          background: var(--el-fill-color-light);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          display: inline-block;
        }
      }
    }

    .model-status-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-xl);
      font-size: var(--text-xs);
      font-weight: 500;
      flex-shrink: 0;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      &.active {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);

        .status-dot {
          background: var(--el-color-success);
          box-shadow: 0 0 0 3px var(--el-color-success-light-5);
        }
      }

      &.training {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);

        .status-dot {
          background: var(--el-color-warning);
          box-shadow: 0 0 0 3px var(--el-color-warning-light-5);
          animation: pulse 1.5s infinite;
        }
      }

      &.stopped {
        background: var(--el-fill-color);
        color: var(--el-text-color-secondary);

        .status-dot {
          background: var(--el-text-color-secondary);
        }
      }
    }
  }

  .model-metrics {
    margin-bottom: var(--spacing-md);

    .metric-row {
      display: flex;
      gap: var(--spacing-md);

      .metric-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--el-fill-color-light);
        border-radius: var(--radius-md);

        .metric-icon {
          font-size: 18px;
        }

        .metric-content {
          .metric-label {
            font-size: var(--text-xs);
            color: var(--el-text-color-secondary);
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
    padding-top: var(--spacing-sm);
    border-top: 1px dashed var(--el-border-color-lighter);
  }
}

// 脉冲动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 状态指示器动画
@keyframes statusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1400px) {
  .stats-grid-unified {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .main-content {
    padding: var(--spacing-lg);
  }

  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-md);
  }

  .welcome-section {
    padding: var(--spacing-lg);

    .welcome-content h2 {
      font-size: var(--text-xl);
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .tasks-container {
    grid-template-columns: 1fr;
  }

  .models-grid {
    grid-template-columns: 1fr;
  }

  .section-header .section-title {
    font-size: var(--text-lg);

    &::before {
      width: 3px;
      height: 16px;
    }
  }
}
</style>
