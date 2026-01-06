<template>
  <div class="usage-type-detail">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 使用类型详情内容 -->
    <div class="detail-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="type-header">
          <div class="type-icon" :class="usageType.category">
            <van-icon :name="getCategoryIcon(usageType.category)" size="32" />
          </div>
          <div class="type-info">
            <h2 class="type-name">{{ usageType.name }}</h2>
            <div class="type-category">{{ getCategoryLabel(usageType.category) }}</div>
          </div>
        </div>

        <div class="type-description">
          <p>{{ usageType.description || '暂无描述' }}</p>
        </div>

        <div class="type-stats">
          <div class="stat-item">
            <div class="stat-value">{{ usageType.totalUsage || 0 }}</div>
            <div class="stat-label">总使用次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ usageType.activeUsers || 0 }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatPercentage(usageType.growthRate) }}</div>
            <div class="stat-label">增长率</div>
          </div>
        </div>
      </div>

      <!-- 使用趋势 -->
      <div class="usage-trend">
        <h3>使用趋势</h3>
        <div class="trend-chart">
          <div class="chart-container">
            <canvas ref="trendChart" id="trendChart"></canvas>
          </div>
          <div class="trend-summary">
            <div class="summary-item">
              <span class="label">日均使用:</span>
              <span class="value">{{ usageType.dailyAverage || 0 }} 次</span>
            </div>
            <div class="summary-item">
              <span class="label">峰值使用:</span>
              <span class="value">{{ usageType.peakUsage || 0 }} 次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能模块分布 -->
      <div class="module-distribution">
        <h3>功能模块分布</h3>
        <div class="module-list">
          <div
            v-for="module in usageType.modules"
            :key="module.name"
            class="module-item"
          >
            <div class="module-info">
              <div class="module-name">{{ module.name }}</div>
              <div class="module-usage">{{ module.usageCount }} 次使用</div>
            </div>
            <div class="module-progress">
              <van-progress
                :percentage="module.percentage"
                :show-pivot="false"
                stroke-width="6"
                color="#1989fa"
              />
              <span class="percentage-text">{{ module.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户群体分析 -->
      <div class="user-analysis">
        <h3>用户群体分析</h3>
        <div class="user-groups">
          <div class="group-item">
            <div class="group-header">
              <van-icon name="manager-o" color="#1989fa" />
              <span class="group-name">管理员</span>
              <van-tag type="primary" size="small">{{ userGroups.admin.count }}人</van-tag>
            </div>
            <div class="group-stats">
              <div class="stat">
                <span class="label">使用频率:</span>
                <span class="value">{{ userGroups.admin.frequency }}次/周</span>
              </div>
              <div class="stat">
                <span class="label">平均时长:</span>
                <span class="value">{{ userGroups.admin.duration }}分钟</span>
              </div>
            </div>
          </div>

          <div class="group-item">
            <div class="group-header">
              <van-icon name="user-o" color="#52c41a" />
              <span class="group-name">教师</span>
              <van-tag type="success" size="small">{{ userGroups.teacher.count }}人</van-tag>
            </div>
            <div class="group-stats">
              <div class="stat">
                <span class="label">使用频率:</span>
                <span class="value">{{ userGroups.teacher.frequency }}次/周</span>
              </div>
              <div class="stat">
                <span class="label">平均时长:</span>
                <span class="value">{{ userGroups.teacher.duration }}分钟</span>
              </div>
            </div>
          </div>

          <div class="group-item">
            <div class="group-header">
              <van-icon name="friends-o" color="#faad14" />
              <span class="group-name">家长</span>
              <van-tag type="warning" size="small">{{ userGroups.parent.count }}人</van-tag>
            </div>
            <div class="group-stats">
              <div class="stat">
                <span class="label">使用频率:</span>
                <span class="value">{{ userGroups.parent.frequency }}次/周</span>
              </div>
              <div class="stat">
                <span class="label">平均时长:</span>
                <span class="value">{{ userGroups.parent.duration }}分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间分布分析 -->
      <div class="time-distribution">
        <h3>时间分布分析</h3>
        <div class="time-grid">
          <div class="time-period">
            <div class="period-label">早晨</div>
            <div class="period-bar">
              <van-progress
                :percentage="timeDistribution.morning"
                color="#52c41a"
                :show-pivot="false"
              />
            </div>
            <div class="period-value">{{ timeDistribution.morning }}%</div>
          </div>

          <div class="time-period">
            <div class="period-label">上午</div>
            <div class="period-bar">
              <van-progress
                :percentage="timeDistribution.forenoon"
                color="#1890ff"
                :show-pivot="false"
              />
            </div>
            <div class="period-value">{{ timeDistribution.forenoon }}%</div>
          </div>

          <div class="time-period">
            <div class="period-label">下午</div>
            <div class="period-bar">
              <van-progress
                :percentage="timeDistribution.afternoon"
                color="#722ed1"
                :show-pivot="false"
              />
            </div>
            <div class="period-value">{{ timeDistribution.afternoon }}%</div>
          </div>

          <div class="time-period">
            <div class="period-label">晚上</div>
            <div class="period-bar">
              <van-progress
                :percentage="timeDistribution.evening"
                color="#faad14"
                :show-pivot="false"
              />
            </div>
            <div class="period-value">{{ timeDistribution.evening }}%</div>
          </div>
        </div>
      </div>

      <!-- 详细使用记录 -->
      <div class="usage-records">
        <h3>详细使用记录</h3>
        <div class="records-list">
          <div
            v-for="record in usageRecords"
            :key="record.id"
            class="record-item"
          >
            <div class="record-user">
              <van-image
                :src="record.userAvatar"
                round
                width="32"
                height="32"
                fit="cover"
              />
              <div class="user-info">
                <div class="user-name">{{ record.userName }}</div>
                <div class="user-role">{{ record.userRole }}</div>
              </div>
            </div>
            <div class="record-action">
              <div class="action-name">{{ record.action }}</div>
              <div class="action-time">{{ formatTime(record.timestamp) }}</div>
            </div>
            <div class="record-duration">
              <span class="duration">{{ record.duration }}秒</span>
            </div>
          </div>
        </div>

        <div class="load-more">
          <van-button
            v-if="hasMoreRecords"
            type="default"
            size="small"
            @click="loadMoreRecords"
            :loading="loadingRecords"
          >
            加载更多
          </van-button>
          <div v-else class="no-more">没有更多记录了</div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="performance-metrics">
        <h3>性能指标</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">
              <van-icon name="flash" color="#52c41a" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ performanceMetrics.avgResponseTime }}ms</div>
              <div class="metric-label">平均响应时间</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <van-icon name="check-circle" color="#1890ff" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ performanceMetrics.successRate }}%</div>
              <div class="metric-label">成功率</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <van-icon name="warning" color="#faad14" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ performanceMetrics.errorRate }}%</div>
              <div class="metric-label">错误率</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <van-icon name="fire" color="#ff4d4f" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ performanceMetrics.peakLoad }}</div>
              <div class="metric-label">峰值负载</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="optimization-suggestions">
        <h3>优化建议</h3>
        <div class="suggestions-list">
          <div
            v-for="suggestion in optimizationSuggestions"
            :key="suggestion.id"
            class="suggestion-item"
            :class="suggestion.priority"
          >
            <div class="suggestion-header">
              <van-icon
                :name="getPriorityIcon(suggestion.priority)"
                :color="getPriorityColor(suggestion.priority)"
              />
              <span class="suggestion-title">{{ suggestion.title }}</span>
              <van-tag
                :type="getPriorityTagType(suggestion.priority)"
                size="small"
              >
                {{ getPriorityLabel(suggestion.priority) }}
              </van-tag>
            </div>
            <div class="suggestion-content">
              <p>{{ suggestion.description }}</p>
              <div class="suggestion-impact">
                <span class="impact-label">预期效果:</span>
                <span class="impact-value">{{ suggestion.expectedImpact }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { showLoadingToast } from 'vant'

const route = useRoute()

// 页面数据
const usageType = ref<any>({})
const usageRecords = ref<any[]>([])
const userGroups = ref<any>({})
const timeDistribution = ref<any>({})
const performanceMetrics = ref<any>({})
const optimizationSuggestions = ref<any[]>([])

// 状态
const loadingRecords = ref(false)
const hasMoreRecords = ref(true)
const trendChart = ref<any>(null)

// 计算属性
const pageTitle = computed(() => {
  return usageType.value.name || '使用类型详情'
})

// 方法
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    teaching: '教学功能',
    administrative: '行政功能',
    communication: '沟通功能',
    assessment: '评估功能',
    activity: '活动功能',
    system: '系统功能'
  }
  return categoryMap[category] || category
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    teaching: 'book-o',
    administrative: 'manager-o',
    communication: 'chat-o',
    assessment: 'chart-trending-o',
    activity: 'star-o',
    system: 'setting-o'
  }
  return iconMap[category] || 'apps-o'
}

const formatPercentage = (value: number) => {
  if (!value) return '0%'
  return `${(value * 100).toFixed(1)}%`
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return labelMap[priority] || priority
}

const getPriorityIcon = (priority: string) => {
  const iconMap: Record<string, string> = {
    high: 'warning',
    medium: 'info',
    low: 'info-o'
  }
  return iconMap[priority] || 'info'
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a'
  }
  return colorMap[priority] || '#666'
}

const getPriorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return typeMap[priority] || 'default'
}

const initTrendChart = async () => {
  await nextTick()
  const canvas = document.getElementById('trendChart') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 模拟图表数据
  const data = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [{
      label: '使用次数',
      data: [120, 190, 300, 250, 420, 380],
      borderColor: '#1989fa',
      backgroundColor: 'rgba(25, 137, 250, 0.1)',
      tension: 0.4
    }]
  }

  // 这里应该使用实际的图表库，如 Chart.js
  // 暂时绘制简单的线条图
  drawSimpleChart(ctx, data)
}

const drawSimpleChart = (ctx: CanvasRenderingContext2D, data: any) => {
  const canvas = ctx.canvas
  const width = canvas.width
  const height = canvas.height

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 绘制简单的线条图
  ctx.strokeStyle = '#1989fa'
  ctx.lineWidth = 2
  ctx.beginPath()

  const maxValue = Math.max(...data.datasets[0].data)
  const xStep = width / (data.labels.length - 1)

  data.datasets[0].data.forEach((value: number, index: number) => {
    const x = index * xStep
    const y = height - (value / maxValue) * height * 0.8 - 10

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

const loadUsageTypeDetail = async () => {
  try {
    showLoadingToast('加载中...')
    const typeId = route.params.id

    // 这里应该调用实际的API
    // const response = await usageApi.getUsageTypeDetail(typeId)

    // 模拟数据
    usageType.value = {
      id: typeId,
      name: '教学计划管理',
      category: 'teaching',
      description: '教师创建和管理教学计划的核心功能模块，支持周计划、月计划和学期计划的制定与执行。',
      totalUsage: 1247,
      activeUsers: 89,
      growthRate: 0.15,
      dailyAverage: 42,
      peakUsage: 78,
      modules: [
        { name: '计划创建', usageCount: 456, percentage: 36.5 },
        { name: '计划编辑', usageCount: 321, percentage: 25.7 },
        { name: '计划查看', usageCount: 289, percentage: 23.2 },
        { name: '计划分享', usageCount: 181, percentage: 14.6 }
      ]
    }

    userGroups.value = {
      admin: {
        count: 5,
        frequency: 12,
        duration: 25
      },
      teacher: {
        count: 68,
        frequency: 8,
        duration: 18
      },
      parent: {
        count: 16,
        frequency: 3,
        duration: 12
      }
    }

    timeDistribution.value = {
      morning: 15,
      forenoon: 35,
      afternoon: 30,
      evening: 20
    }

    performanceMetrics.value = {
      avgResponseTime: 245,
      successRate: 99.2,
      errorRate: 0.8,
      peakLoad: 1250
    }

    optimizationSuggestions.value = [
      {
        id: 1,
        priority: 'high',
        title: '优化数据库查询性能',
        description: '当前计划列表查询存在N+1问题，建议添加适当的数据库索引和优化查询语句。',
        expectedImpact: '响应时间减少40%'
      },
      {
        id: 2,
        priority: 'medium',
        title: '增加计划模板功能',
        description: '为常用教学计划提供模板功能，减少教师重复工作，提升使用效率。',
        expectedImpact: '使用效率提升60%'
      },
      {
        id: 3,
        priority: 'low',
        title: '移动端界面优化',
        description: '优化移动端的计划编辑界面，提升触摸操作体验。',
        expectedImpact: '移动端使用率提升25%'
      }
    ]

    // 初始化图表
    setTimeout(() => {
      initTrendChart()
    }, 100)

    // 加载使用记录
    loadUsageRecords()

  } catch (error) {
    console.error('加载使用类型详情失败:', error)
  }
}

const loadUsageRecords = async () => {
  if (loadingRecords.value || !hasMoreRecords.value) return

  try {
    loadingRecords.value = true

    // 这里应该调用实际的API
    // const response = await usageApi.getUsageRecords(typeId, page)

    // 模拟数据
    const mockRecords = [
      {
        id: 1,
        userName: '张老师',
        userRole: '主班教师',
        userAvatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        action: '创建周计划',
        timestamp: '2025-12-12T10:30:00Z',
        duration: 180
      },
      {
        id: 2,
        userName: '李老师',
        userRole: '配班教师',
        userAvatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        action: '编辑月计划',
        timestamp: '2025-12-12T09:15:00Z',
        duration: 245
      },
      {
        id: 3,
        userName: '王老师',
        userRole: '学科教师',
        userAvatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        action: '查看学期计划',
        timestamp: '2025-12-11T16:45:00Z',
        duration: 120
      }
    ]

    usageRecords.value.push(...mockRecords)

    // 模拟分页
    if (usageRecords.value.length >= 20) {
      hasMoreRecords.value = false
    }

  } catch (error) {
    console.error('加载使用记录失败:', error)
  } finally {
    loadingRecords.value = false
  }
}

const loadMoreRecords = () => {
  loadUsageRecords()
}

// 生命周期
onMounted(() => {
  loadUsageTypeDetail()
})
</script>

<style scoped lang="scss">
.usage-type-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.detail-content {
  padding: var(--spacing-md);

  > div {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 16px 0;
    }
  }
}

.basic-info {
  .type-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .type-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      &.teaching {
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        color: white;
      }

      &.administrative {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
        color: white;
      }

      &.communication {
        background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
        color: white;
      }

      &.assessment {
        background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
        color: white;
      }

      &.activity {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
        color: white;
      }

      &.system {
        background: linear-gradient(135deg, #666 0%, #999 100%);
        color: white;
      }
    }

    .type-info {
      flex: 1;

      .type-name {
        color: #333;
        font-size: 22px;
        font-weight: bold;
        margin: 0 0 8px 0;
      }

      .type-category {
        color: #666;
        font-size: var(--text-sm);
        background: #f0f0f0;
        padding: var(--spacing-xs) 8px;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }

  .type-description {
    margin-bottom: 20px;

    p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
  }

  .type-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #1890ff;
        margin-bottom: 4px;
      }

      .stat-label {
        color: #666;
        font-size: var(--text-xs);
      }
    }
  }
}

.usage-trend {
  .trend-chart {
    .chart-container {
      height: 200px;
      margin-bottom: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: var(--spacing-md);

      canvas {
        width: 100%;
        height: 100%;
      }
    }

    .trend-summary {
      display: flex;
      justify-content: space-around;

      .summary-item {
        text-align: center;

        .label {
          color: #666;
          font-size: var(--text-sm);
        }

        .value {
          color: #333;
          font-weight: 600;
          margin-left: 8px;
        }
      }
    }
  }
}

.module-distribution {
  .module-list {
    .module-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .module-info {
        .module-name {
          color: #333;
          font-size: var(--text-base);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .module-usage {
          color: #666;
          font-size: var(--text-xs);
        }
      }

      .module-progress {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
        margin-left: 16px;

        .van-progress {
          flex: 1;
        }

        .percentage-text {
          color: #666;
          font-size: var(--text-xs);
          min-width: 30px;
          text-align: right;
        }
      }
    }
  }
}

.user-analysis {
  .user-groups {
    .group-item {
      padding: var(--spacing-md);
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .group-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: 12px;

        .group-name {
          flex: 1;
          color: #333;
          font-weight: 600;
        }
      }

      .group-stats {
        display: flex;
        gap: var(--spacing-lg);

        .stat {
          .label {
            color: #666;
            font-size: var(--text-xs);
          }

          .value {
            color: #333;
            font-weight: 600;
            margin-left: 4px;
          }
        }
      }
    }
  }
}

.time-distribution {
  .time-grid {
    .time-period {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .period-label {
        width: 40px;
        color: #333;
        font-size: var(--text-sm);
        font-weight: 600;
      }

      .period-bar {
        flex: 1;

        .van-progress {
          margin: 0;
        }
      }

      .period-value {
        width: 40px;
        text-align: right;
        color: #666;
        font-size: var(--text-xs);
      }
    }
  }
}

.usage-records {
  .records-list {
    .record-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .record-user {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;

        .user-info {
          .user-name {
            color: #333;
            font-size: var(--text-sm);
            font-weight: 600;
            margin-bottom: 2px;
          }

          .user-role {
            color: #666;
            font-size: var(--text-xs);
          }
        }
      }

      .record-action {
        flex: 2;

        .action-name {
          color: #333;
          font-size: var(--text-sm);
          margin-bottom: 2px;
        }

        .action-time {
          color: #666;
          font-size: var(--text-xs);
        }
      }

      .record-duration {
        .duration {
          color: #1890ff;
          font-size: var(--text-xs);
          font-weight: 600;
        }
      }
    }
  }

  .load-more {
    text-align: center;
    margin-top: 16px;

    .no-more {
      color: #999;
      font-size: var(--text-xs);
    }
  }
}

.performance-metrics {
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .metric-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: 8px;

      .metric-icon {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .metric-info {
        flex: 1;

        .metric-value {
          color: #333;
          font-size: var(--text-base);
          font-weight: bold;
          margin-bottom: 2px;
        }

        .metric-label {
          color: #666;
          font-size: var(--text-xs);
        }
      }
    }
  }
}

.optimization-suggestions {
  .suggestions-list {
    .suggestion-item {
      padding: var(--spacing-md);
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 4px solid;

      &.high {
        background: #fff2f0;
        border-left-color: #ff4d4f;
      }

      &.medium {
        background: #fffbe6;
        border-left-color: #faad14;
      }

      &.low {
        background: #f6ffed;
        border-left-color: #52c41a;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .suggestion-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: 8px;

        .suggestion-title {
          flex: 1;
          color: #333;
          font-weight: 600;
        }
      }

      .suggestion-content {
        p {
          color: #666;
          line-height: 1.6;
          margin: 0 0 8px 0;
        }

        .suggestion-impact {
          .impact-label {
            color: #666;
            font-size: var(--text-xs);
          }

          .impact-value {
            color: #52c41a;
            font-weight: 600;
            margin-left: 4px;
          }
        }
      }
    }
  }
}
</style>