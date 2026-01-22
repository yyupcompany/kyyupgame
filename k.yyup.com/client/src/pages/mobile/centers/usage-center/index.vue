<template>
  <MobileCenterLayout title="用量中心" back-path="/mobile/centers">
    <template #header-extra>
      <van-button
        type="primary"
        size="medium"
        icon="replay"
        @click="handleRefresh"
        :loading="loading"
      >
        刷新
      </van-button>
    </template>

    <div class="mobile-usage-center">

      <!-- 欢迎词 -->
      <div class="welcome-section">
        <van-notice-bar
          left-icon="volume-o"
          :scrollable="true"
          text="欢迎使用用量监控系统，实时掌握系统运行状态，确保服务稳定高效"
          background="#e6f7ff"
          color="#1890ff"
        />
      </div>

      <!-- 系统状态总览 -->
      <div class="system-overview">
        <div class="section-header">
          <h3 class="section-title">系统状态总览</h3>
        </div>
        <div class="overview-cards">
          <div
            class="overview-card"
            :class="{ 'warning': systemStatus.cpu > 80, 'critical': systemStatus.cpu > 90 }"
            @click="handleSystemDetail('cpu')"
          >
            <div class="card-icon cpu">
              <van-icon name="fire-o" size="20" />
            </div>
            <div class="card-content">
              <h4>CPU使用率</h4>
              <div class="value">{{ systemStatus.cpu }}%</div>
              <van-progress
                :percentage="systemStatus.cpu"
                :color="getProgressColor(systemStatus.cpu)"
                stroke-width="4"
              />
            </div>
          </div>

          <div
            class="overview-card"
            :class="{ 'warning': systemStatus.memory > 80, 'critical': systemStatus.memory > 90 }"
            @click="handleSystemDetail('memory')"
          >
            <div class="card-icon memory">
              <van-icon name="chip-o" size="20" />
            </div>
            <div class="card-content">
              <h4>内存使用率</h4>
              <div class="value">{{ systemStatus.memory }}%</div>
              <van-progress
                :percentage="systemStatus.memory"
                :color="getProgressColor(systemStatus.memory)"
                stroke-width="4"
              />
            </div>
          </div>

          <div
            class="overview-card"
            :class="{ 'warning': systemStatus.disk > 80, 'critical': systemStatus.disk > 90 }"
            @click="handleSystemDetail('disk')"
          >
            <div class="card-icon disk">
              <van-icon name="folder-o" size="20" />
            </div>
            <div class="card-content">
              <h4>磁盘使用率</h4>
              <div class="value">{{ systemStatus.disk }}%</div>
              <van-progress
                :percentage="systemStatus.disk"
                :color="getProgressColor(systemStatus.disk)"
                stroke-width="4"
              />
            </div>
          </div>

          <div
            class="overview-card"
            :class="{ 'offline': !systemStatus.network }"
            @click="handleSystemDetail('network')"
          >
            <div class="card-icon network">
              <van-icon name="wifi-o" size="20" />
            </div>
            <div class="card-content">
              <h4>网络状态</h4>
              <div class="value">{{ systemStatus.network ? '正常' : '异常' }}</div>
              <div class="status-indicator" :class="{ 'online': systemStatus.network }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div
            v-for="stat in stats"
            :key="stat.key"
            class="stat-card-mobile"
            :class="`stat-card--${stat.type}`"
            @click="navigateToDetail(stat.key)"
          >
            <div class="stat-icon">
              <van-icon :name="getMobileIcon(stat.iconName)" size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
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

      <!-- 监控功能 -->
      <div class="monitoring-features">
        <div class="section-header">
          <h3 class="section-title">监控功能</h3>
          <p class="section-subtitle">全面的系统监控和分析工具</p>
        </div>
        <div class="features-grid">
          <van-grid :column-num="2" :gutter="12">
            <van-grid-item
              v-for="feature in monitoringFeatures"
              :key="feature.key"
              @click="navigateToFeature(feature.key)"
            >
              <div class="feature-card">
                <div class="feature-icon">{{ feature.icon }}</div>
                <h4 class="feature-title">{{ feature.title }}</h4>
                <p class="feature-description">{{ feature.description }}</p>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </div>

      <!-- 实时监控图表 -->
      <div class="monitoring-charts">
        <div class="section-header">
          <h3 class="section-title">实时监控</h3>
          <p class="section-subtitle">系统性能实时数据展示</p>
        </div>

        <div class="charts-container">
          <!-- API调用趋势 -->
          <div class="chart-card">
            <h4 class="chart-title">API调用趋势</h4>
            <div class="chart-content">
              <div class="mock-line-chart">
                <div
                  v-for="(point, index) in apiTrendData"
                  :key="index"
                  class="chart-point"
                  :style="{
                    left: `${(index / (apiTrendData.length - 1)) * 100}%`,
                    bottom: `${point.value}%`
                  }"
                ></div>
                <svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    :points="apiTrendData.map((point, index) =>
                      `${(index / (apiTrendData.length - 1)) * 100},${100 - point.value}`
                    ).join(' ')"
                    fill="none"
                    stroke="#1989fa"
                    stroke-width="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- 用户活跃度 -->
          <div class="chart-card">
            <h4 class="chart-title">用户活跃度</h4>
            <div class="chart-content">
              <div class="mock-bar-chart">
                <div
                  v-for="(bar, index) in userActivityData"
                  :key="index"
                  class="chart-bar"
                  :style="{
                    height: `${bar.value}%`,
                    left: `${(index / userActivityData.length) * 100 + 5}%`,
                    width: `${80 / userActivityData.length}%`
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警信息 -->
      <div class="alerts-section">
        <div class="section-header">
          <h3 class="section-title">最新告警</h3>
          <van-button type="primary" size="medium" @click="navigateToFeature('alerts')">
            查看全部
            <van-icon name="arrow" />
          </van-button>
        </div>

        <div class="alerts-list">
          <van-cell
            v-for="alert in recentAlerts"
            :key="alert.id"
            :title="alert.title"
            :label="alert.description"
            :value="formatTime(alert.time)"
            :icon="getAlertIcon(alert.level)"
            :class="`alert-${alert.level}`"
            is-link
            @click="handleAlert(alert)"
          >
            <template #right-icon>
              <div class="alert-actions">
                <van-button
                  type="primary"
                  size="medium"
                  @click.stop="handleAlertAction(alert, 'handle')"
                >
                  处理
                </van-button>
                <van-button
                  type="default"
                  size="medium"
                  @click.stop="handleAlertAction(alert, 'dismiss')"
                >
                  忽略
                </van-button>
              </div>
            </template>
          </van-cell>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <div class="section-header">
          <h3 class="section-title">快速操作</h3>
          <p class="section-subtitle">一键执行常用系统操作</p>
        </div>
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="action in quickActions"
            :key="action.key"
            @click="handleQuickAction(action.key)"
          >
            <div class="action-card">
              <div class="action-icon">{{ action.icon }}</div>
              <h4 class="action-title">{{ action.title }}</h4>
              <p class="action-description">{{ action.description }}</p>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 底部间距 -->
      <div class="bottom-spacer"></div>
    </div>

    <!-- 告警处理弹窗 -->
    <van-popup
      v-model:show="alertDialogVisible"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="alert-dialog">
        <div class="dialog-header">
          <h3>处理告警</h3>
          <van-button type="primary" size="medium" @click="alertDialogVisible = false">
            关闭
          </van-button>
        </div>

        <div class="dialog-content" v-if="selectedAlert">
          <div class="alert-info">
            <h4>{{ selectedAlert.title }}</h4>
            <p>{{ selectedAlert.description }}</p>
            <span class="alert-time">{{ formatTime(selectedAlert.time) }}</span>
          </div>

          <van-form @submit="confirmHandleAlert">
            <van-field
              v-model="alertForm.method"
              name="method"
              label="处理方式"
              placeholder="选择处理方式"
              is-link
              readonly
              @click="showMethodPicker = true"
            />

            <van-field
              v-model="alertForm.note"
              name="note"
              label="备注"
              type="textarea"
              placeholder="输入处理备注"
              rows="3"
            />

            <div class="dialog-actions">
              <van-button type="primary" native-type="submit" block>
                确认处理
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 处理方式选择器 -->
    <van-picker
      v-model="methodPickerValue"
      :show="showMethodPicker"
      :columns="methodColumns"
      @confirm="onMethodConfirm"
      @cancel="showMethodPicker = false"
    />
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, showSuccessToast, showFailToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { getUsageOverview, type UsageOverview } from '@/api/endpoints/usage-center'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const alertDialogVisible = ref(false)
const selectedAlert = ref<any>(null)
const showMethodPicker = ref(false)
const methodPickerValue = ref(['立即修复'])

// 系统状态
const systemStatus = reactive({
  cpu: 65,
  memory: 78,
  disk: 45,
  network: true
})

// 统计数据
const stats = reactive([
  {
    key: 'api',
    title: '今日API调用',
    value: '2.8w',
    unit: '',
    iconName: 'api',
    type: 'primary',
    trend: 8.5
  },
  {
    key: 'users',
    title: '活跃用户数',
    value: '1248',
    unit: '',
    iconName: 'users',
    type: 'success',
    trend: 12.3
  },
  {
    key: 'data',
    title: '数据传输量',
    value: '3.7',
    unit: 'GB',
    iconName: 'download',
    type: 'info',
    trend: 15.2
  },
  {
    key: 'errors',
    title: '错误率',
    value: '0.3',
    unit: '%',
    iconName: 'alert-triangle',
    type: 'warning',
    trend: -0.1
  }
])

// 监控功能
const monitoringFeatures = ref([
  {
    key: 'api-monitor',
    title: 'API监控',
    description: '接口性能监控',
    icon: '📊'
  },
  {
    key: 'resource-monitor',
    title: '资源监控',
    description: '系统资源监控',
    icon: '💻'
  },
  {
    key: 'database-monitor',
    title: '数据库监控',
    description: '数据库性能',
    icon: '🗄️'
  },
  {
    key: 'user-behavior',
    title: '用户行为',
    description: '用户活跃分析',
    icon: '👥'
  },
  {
    key: 'performance-analysis',
    title: '性能分析',
    description: '系统性能分析',
    icon: '⚡'
  },
  {
    key: 'alert-system',
    title: '告警系统',
    description: '异常告警管理',
    icon: '🚨'
  }
])

// 快速操作
const quickActions = ref([
  {
    key: 'system-check',
    title: '系统检查',
    description: '执行健康检查',
    icon: '🔍'
  },
  {
    key: 'optimization',
    title: '性能优化',
    description: '一键优化性能',
    icon: '⚙️'
  },
  {
    key: 'backup',
    title: '数据备份',
    description: '创建数据备份',
    icon: '💾'
  },
  {
    key: 'cleanup',
    title: '清理缓存',
    description: '清理系统缓存',
    icon: '🧹'
  }
])

// 告警表单
const alertForm = reactive({
  method: '',
  note: ''
})

// 处理方式选项
const methodColumns = ['立即修复', '延迟处理', '忽略告警']

// 最近告警
const recentAlerts = ref([
  {
    id: 1,
    title: 'CPU使用率过高',
    description: '服务器CPU使用率达到85%',
    level: 'warning',
    time: '2024-03-15T14:30:00Z'
  },
  {
    id: 2,
    title: '数据库连接异常',
    description: 'MySQL连接数达到最大值',
    level: 'error',
    time: '2024-03-15T13:45:00Z'
  },
  {
    id: 3,
    title: '磁盘空间不足',
    description: '/var分区使用率达到90%',
    level: 'critical',
    time: '2024-03-15T12:20:00Z'
  }
])

// 模拟图表数据
const apiTrendData = ref([
  { value: 60 },
  { value: 75 },
  { value: 45 },
  { value: 80 },
  { value: 65 }
])

const userActivityData = ref([
  { value: 40 },
  { value: 60 },
  { value: 80 },
  { value: 55 },
  { value: 70 },
  { value: 45 }
])

// 获取移动端图标
function getMobileIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    'api': 'chart-trending-o',
    'users': 'friends-o',
    'download': 'down',
    'alert-triangle': 'warning-o'
  }
  return iconMap[iconName] || 'info-o'
}

// 获取进度条颜色
function getProgressColor(value: number): string {
  if (value > 90) return '#ee0a24'
  if (value > 80) return '#ff976a'
  return '#07c160'
}

// 获取告警图标
function getAlertIcon(level: string): string {
  const iconMap: Record<string, string> = {
    'info': 'info-o',
    'warning': 'warning-o',
    'error': 'close',
    'critical': 'warning'
  }
  return iconMap[level] || 'info-o'
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else {
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }
}

// 导航函数
function navigateToDetail(type: string) {
  showToast(`导航到${type}详情页面`)
}

function navigateToFeature(feature: string) {
  showToast(`导航到${feature}功能`)
}

function handleSystemDetail(type: string) {
  showToast(`查看${type}详细信息`)
}

// 告警处理
function handleAlert(alert: any) {
  selectedAlert.value = alert
  alertDialogVisible.value = true
}

function handleAlertAction(alert: any, action: string) {
  if (action === 'handle') {
    handleAlert(alert)
  } else {
    dismissAlert(alert.id)
  }
}

function onMethodConfirm({ selectedValues }: { selectedValues: string[] }) {
  alertForm.method = selectedValues[0]
  showMethodPicker.value = false
}

function confirmHandleAlert() {
  if (!selectedAlert.value || !alertForm.method) {
    showToast('请选择处理方式')
    return
  }

  showSuccessToast(`告警 "${selectedAlert.value.title}" 已处理`)
  alertDialogVisible.value = false

  // 从列表中移除已处理的告警
  const index = recentAlerts.value.findIndex(item => item.id === selectedAlert.value?.id)
  if (index > -1) {
    recentAlerts.value.splice(index, 1)
  }

  // 重置表单
  alertForm.method = ''
  alertForm.note = ''
  selectedAlert.value = null
}

function dismissAlert(alertId: number) {
  const index = recentAlerts.value.findIndex(item => item.id === alertId)
  if (index > -1) {
    recentAlerts.value.splice(index, 1)
    showSuccessToast('告警已忽略')
  }
}

// 快速操作
function handleQuickAction(action: string) {
  const loadingToast = showLoadingToast({
    message: '正在处理...',
    forbidClick: true,
    duration: 0
  })

  setTimeout(() => {
    loadingToast.close()

    switch (action) {
      case 'system-check':
        showSuccessToast('系统检查完成，一切正常')
        break
      case 'optimization':
        showSuccessToast('系统优化完成，性能提升15%')
        systemStatus.cpu = Math.max(20, systemStatus.cpu - 10)
        systemStatus.memory = Math.max(30, systemStatus.memory - 8)
        break
      case 'backup':
        showSuccessToast('数据备份创建成功')
        break
      case 'cleanup':
        showSuccessToast('缓存清理完成，释放500MB空间')
        systemStatus.disk = Math.max(10, systemStatus.disk - 5)
        break
    }
  }, 2000)
}

// 刷新数据
function handleRefresh() {
  loading.value = true

  // 模拟API调用
  setTimeout(() => {
    // 更新系统状态
    systemStatus.cpu = Math.floor(Math.random() * 30) + 60
    systemStatus.memory = Math.floor(Math.random() * 20) + 70
    systemStatus.disk = Math.floor(Math.random() * 15) + 40

    // 更新统计数据
    const apiCalls = Math.floor(Math.random() * 5000) + 25000
    stats[0].value = apiCalls >= 10000 ? `${(apiCalls / 10000).toFixed(1)}w` : apiCalls.toString()

    const activeUsers = Math.floor(Math.random() * 200) + 1200
    stats[1].value = activeUsers.toString()

    // 更新图表数据
    apiTrendData.value = apiTrendData.value.map(() => ({
      value: Math.floor(Math.random() * 40) + 40
    }))

    userActivityData.value = userActivityData.value.map(() => ({
      value: Math.floor(Math.random() * 50) + 30
    }))

    loading.value = false
    showSuccessToast('数据已刷新')
  }, 1000)
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loading.value = true

  // 模拟初始数据加载
  setTimeout(() => {
    loading.value = false
  }, 1000)

  // 模拟实时数据更新
  const interval = setInterval(() => {
    systemStatus.cpu = Math.min(95, Math.max(20, systemStatus.cpu + Math.floor(Math.random() * 11) - 5))
    systemStatus.memory = Math.min(95, Math.max(30, systemStatus.memory + Math.floor(Math.random() * 7) - 3))
  }, 5000)

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
@import '@/styles/mobile-base.scss';
.mobile-usage-center {
  padding: var(--van-padding-sm);
  background: var(--van-background-color-light);
  min-height: 100vh;

  .welcome-section {
    margin-bottom: var(--van-padding-md);
  }

  .section-header {
    margin-bottom: var(--van-padding-md);

    .section-title {
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: var(--van-padding-xs);
    }

    .section-subtitle {
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-2);
      margin: 0;
    }
  }

  // 系统状态总览
  .system-overview {
    margin-bottom: var(--van-padding-lg);

    .overview-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--van-padding-sm);

      .overview-card {
        background: white;
        border-radius: var(--van-radius-md);
        padding: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 2px solid transparent;
        transition: all 0.3s ease;
        cursor: pointer;

        &.warning {
          border-color: var(--van-warning-color);
          background: linear-gradient(135deg, white 0%, rgba(255, 152, 0, 0.05) 100%);
        }

        &.critical {
          border-color: var(--van-danger-color);
          background: linear-gradient(135deg, white 0%, rgba(255, 69, 58, 0.05) 100%);
        }

        &.offline {
          border-color: var(--van-gray-4);
          opacity: 0.7;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--van-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: var(--van-padding-sm);

          &.cpu { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          &.memory { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          &.disk { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          &.network { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

          .overview-card.offline & {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          }
        }

        .card-content {
          h4 {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            margin-bottom: var(--van-padding-xs);
            font-weight: 500;
          }

          .value {
            font-size: var(--van-font-size-lg);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: var(--van-padding-xs);
          }

          .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--van-danger-color);
            margin-top: var(--van-padding-xs);

            &.online {
              background: var(--van-success-color);
              animation: pulse 2s infinite;
            }
          }
        }
      }
    }
  }

  // 统计卡片
  .stats-section {
    margin-bottom: var(--van-padding-lg);

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--van-padding-sm);

      .stat-card-mobile {
        background: white;
        border-radius: var(--van-radius-md);
        padding: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--van-radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--van-padding-sm);
          color: white;

          .stat-card--primary & { background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%); }
          .stat-card--success & { background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%); }
          .stat-card--info & { background: linear-gradient(135deg, var(--info-color) 0%, #b1b3b8 100%); }
          .stat-card--warning & { background: linear-gradient(135deg, #ff976a 0%, #ffb347 100%); }
        }

        .stat-content {
          .stat-value {
            font-size: var(--van-font-size-xl);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: var(--van-padding-xs);
          }

          .stat-title {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            margin-bottom: var(--van-padding-xs);
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: var(--van-padding-xs);

            .trend-up { color: var(--van-success-color); }
            .trend-down { color: var(--van-danger-color); }
          }
        }
      }
    }
  }

  // 监控功能
  .monitoring-features {
    margin-bottom: var(--van-padding-lg);

    .features-grid {
      .feature-card {
        text-align: center;
        padding: var(--van-padding-md);

        .feature-icon {
          font-size: 2rem;
          margin-bottom: var(--van-padding-sm);
        }

        .feature-title {
          font-size: var(--van-font-size-md);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: var(--van-padding-xs);
        }

        .feature-description {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin: 0;
        }
      }
    }
  }

  // 监控图表
  .monitoring-charts {
    margin-bottom: var(--van-padding-lg);

    .charts-container {
      .chart-card {
        background: white;
        border-radius: var(--van-radius-md);
        padding: var(--van-padding-md);
        margin-bottom: var(--van-padding-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .chart-title {
          font-size: var(--van-font-size-md);
          font-weight: 600;
          color: var(--van-text-color);
          margin-bottom: var(--van-padding-sm);
        }

        .chart-content {
          height: 150px;
          position: relative;

          .mock-line-chart {
            width: 100%;
            height: 100%;
            position: relative;

            .chart-point {
              position: absolute;
              width: 6px;
              height: 6px;
              background: #1989fa;
              border-radius: 50%;
              z-index: 2;
            }

            .chart-line {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          }

          .mock-bar-chart {
            width: 100%;
            height: 100%;
            position: relative;

            .chart-bar {
              position: absolute;
              bottom: 0;
              background: linear-gradient(135deg, #07c160 0%, #1989fa 100%);
              border-radius: 4px 4px 0 0;
            }
          }
        }
      }
    }
  }

  // 告警信息
  .alerts-section {
    margin-bottom: var(--van-padding-lg);

    .alerts-list {
      :deep(.van-cell) {
        margin-bottom: var(--van-padding-xs);
        border-radius: var(--van-radius-md);

        &.alert-warning {
          background: linear-gradient(135deg, white 0%, rgba(255, 152, 0, 0.05) 100%);
          border-left: 4px solid var(--van-warning-color);
        }

        &.alert-error {
          background: linear-gradient(135deg, white 0%, rgba(255, 69, 58, 0.05) 100%);
          border-left: 4px solid var(--van-danger-color);
        }

        &.alert-critical {
          background: linear-gradient(135deg, white 0%, rgba(255, 69, 58, 0.1) 100%);
          border-left: 4px solid var(--van-danger-color);
        }

        .alert-actions {
          display: flex;
          gap: var(--van-padding-xs);
        }
      }
    }
  }

  // 快速操作
  .quick-actions {
    margin-bottom: var(--van-padding-lg);

    .action-card {
      text-align: center;
      padding: var(--van-padding-md);

      .action-icon {
        font-size: 2rem;
        margin-bottom: var(--van-padding-sm);
      }

      .action-title {
        font-size: var(--van-font-size-md);
        font-weight: 600;
        color: var(--van-text-color);
        margin-bottom: var(--van-padding-xs);
      }

      .action-description {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);
        margin: 0;
      }
    }
  }

  // 告警弹窗
  .alert-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-md);
      border-bottom: 1px solid var(--van-border-color);

      h3 {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: 600;
      }
    }

    .dialog-content {
      flex: 1;
      padding: var(--van-padding-md);
      overflow-y: auto;

      .alert-info {
        margin-bottom: var(--van-padding-lg);
        padding: var(--van-padding-md);
        background: var(--van-background-color);
        border-radius: var(--van-radius-md);

        h4 {
          margin: 0 0 var(--van-padding-sm) 0;
          font-size: var(--van-font-size-md);
          font-weight: 600;
        }

        p {
          margin: 0 0 var(--van-padding-sm) 0;
          color: var(--van-text-color-2);
        }

        .alert-time {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-3);
        }
      }

      .dialog-actions {
        margin-top: var(--van-padding-lg);
      }
    }
  }

  .bottom-spacer {
    height: var(--van-padding-xl);
  }
}

// 动画
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(7, 193, 96, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(7, 193, 96, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(7, 193, 96, 0);
  }
}
</style>