<template>
  <MobileMainLayout
    title="成长轨迹"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="growth-trajectory-page">
      <!-- 筛选条件 -->
      <van-card class="filter-card">
        <van-form @submit="loadTrajectory">
          <van-cell-group inset>
            <van-field
              v-model="filterForm.childName"
              name="childName"
              label="孩子姓名"
              placeholder="请输入孩子姓名"
              clearable
            />
            <van-field
              v-model="filterForm.phone"
              name="phone"
              label="联系电话"
              placeholder="请输入联系电话"
              clearable
            />
          </van-cell-group>
          <div class="filter-buttons">
            <van-button
              type="primary"
              size="small"
              native-type="submit"
              :loading="loading"
              block
            >
              查询
            </van-button>
            <van-button
              size="small"
              @click="resetFilter"
              block
            >
              重置
            </van-button>
          </div>
        </van-form>
      </van-card>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <van-skeleton title :row="5" animated />
        <van-skeleton title :row="5" animated />
        <van-skeleton title :row="5" animated />
      </div>

      <!-- 无数据提示 -->
      <van-empty
        v-else-if="!trajectoryData || trajectoryData.records.length === 0"
        description="暂无成长轨迹数据"
        image="default"
      />

      <!-- 成长轨迹内容 -->
      <div v-else class="trajectory-content">
        <!-- 总体概览 -->
        <van-card class="overview-card" title="总体概览">
          <van-grid :column-num="3" :border="false" :gutter="12">
            <van-grid-item>
              <div class="overview-item">
                <div class="overview-icon">
                  <van-icon name="chart-trending-o" size="24" color="#409EFF" />
                </div>
                <div class="overview-content">
                  <div class="overview-value">{{ trajectoryData.records.length }}</div>
                  <div class="overview-label">测评次数</div>
                </div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="overview-item">
                <div class="overview-icon">
                  <van-icon name="star-o" size="24" color="#67C23A" />
                </div>
                <div class="overview-content">
                  <div class="overview-value highlight">
                    {{ trajectoryData.records[trajectoryData.records.length - 1]?.dq || 0 }}
                  </div>
                  <div class="overview-label">当前发育商</div>
                </div>
              </div>
            </van-grid-item>
            <van-grid-item v-if="trajectoryData.comparison?.currentVsPrevious">
              <div class="overview-item">
                <div class="overview-icon">
                  <van-icon
                    :name="trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? 'arrow-up' : 'arrow-down'"
                    size="24"
                    :color="trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? '#67C23A' : '#F56C6C'"
                  />
                </div>
                <div class="overview-content">
                  <div
                    class="overview-value"
                    :class="trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? 'positive' : 'negative'"
                  >
                    {{ trajectoryData.comparison.currentVsPrevious.dqChange >= 0 ? '+' : '' }}{{ trajectoryData.comparison.currentVsPrevious.dqChange }}
                  </div>
                  <div class="overview-label">与上次对比</div>
                </div>
              </div>
            </van-grid-item>
          </van-grid>
        </van-card>

        <!-- 发育商趋势图 -->
        <van-card class="chart-card" title="发育商趋势">
          <div ref="dqChartRef" class="chart-container"></div>
        </van-card>

        <!-- 各维度趋势对比 -->
        <van-card class="chart-card" title="各维度能力趋势">
          <div ref="dimensionChartRef" class="chart-container"></div>
        </van-card>

        <!-- 改进分析 -->
        <van-card
          v-if="trajectoryData.trends.improvements.length > 0"
          class="improvement-card"
          title="能力改进分析"
        >
          <van-grid :column-num="2" :border="false" :gutter="12">
            <van-grid-item
              v-for="(item, index) in trajectoryData.trends.improvements"
              :key="index"
            >
              <div class="improvement-item">
                <div class="improvement-icon">
                  <van-icon
                    :name="getImprovementIcon(item.trend)"
                    :color="getImprovementColor(item.trend)"
                    size="20"
                  />
                </div>
                <div class="improvement-content">
                  <div class="improvement-dimension">{{ getDimensionName(item.dimension) }}</div>
                  <div
                    class="improvement-value"
                    :class="item.trend"
                  >
                    {{ item.improvement >= 0 ? '+' : '' }}{{ item.improvement }}
                  </div>
                </div>
              </div>
            </van-grid-item>
          </van-grid>
        </van-card>

        <!-- 历史记录列表 -->
        <van-card class="records-card" title="历史测评记录">
          <div class="records-list">
            <div
              v-for="(record, index) in trajectoryData.records"
              :key="record.id"
              class="record-item"
              @click="viewReport(record.id)"
            >
              <div class="record-header">
                <div class="record-info">
                  <div class="record-title">{{ record.childName }}</div>
                  <div class="record-meta">
                    <van-tag type="primary" size="small">{{ record.recordNo }}</van-tag>
                    <span class="record-age">{{ record.childAge }}个月</span>
                  </div>
                </div>
                <div class="record-score">
                  <div class="score-value">{{ record.dq }}</div>
                  <div class="score-label">发育商</div>
                </div>
              </div>
              <div class="record-details">
                <div class="detail-item">
                  <van-icon name="calendar-o" size="14" />
                  <span>{{ formatDate(record.assessmentDate) }}</span>
                </div>
                <div class="detail-item">
                  <van-icon name="medal-o" size="14" />
                  <span>得分：{{ record.totalScore }}/{{ record.maxScore }}</span>
                </div>
              </div>
              <van-icon name="arrow" class="record-arrow" />
            </div>
          </div>
        </van-card>
      </div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import * as echarts from 'echarts'
import { assessmentApi } from '@/api/assessment'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const trajectoryData = ref<any>(null)
const filterForm = ref({
  childName: '',
  phone: ''
})

const dqChartRef = ref<HTMLElement>()
const dimensionChartRef = ref<HTMLElement>()
let dqChart: echarts.ECharts | null = null
let dimensionChart: echarts.ECharts | null = null

// 维度名称映射
const dimensionNames: Record<string, string> = {
  attention: '专注力',
  memory: '记忆力',
  logic: '逻辑思维',
  language: '语言能力',
  motor: '运动能力',
  social: '社交能力'
}

const getDimensionName = (dim: string) => {
  return dimensionNames[dim] || dim
}

// 获取改进图标
const getImprovementIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'arrow-up'
    case 'down':
      return 'arrow-down'
    default:
      return 'minus'
  }
}

// 获取改进颜色
const getImprovementColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return '#67C23A'
    case 'down':
      return '#F56C6C'
    default:
      return '#909399'
  }
}

// 格式化日期
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 加载成长轨迹数据
const loadTrajectory = async () => {
  try {
    loading.value = true
    const response = await assessmentApi.getGrowthTrajectory({
      childName: filterForm.value.childName || undefined,
      phone: filterForm.value.phone || undefined,
      limit: 12
    })
    trajectoryData.value = response.data.data

    // 渲染图表
    await nextTick()
    setTimeout(() => {
      renderDQChart()
      renderDimensionChart()
    }, 300)
  } catch (error: any) {
    showFailToast(error.message || '加载成长轨迹失败')
  } finally {
    loading.value = false
  }
}

// 渲染发育商趋势图
const renderDQChart = () => {
  if (!dqChartRef.value || !trajectoryData.value) return

  if (dqChart) {
    dqChart.dispose()
  }

  dqChart = echarts.init(dqChartRef.value)

  const option: echarts.EChartsOption = {
    title: {
      text: '发育商变化趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>发育商: ${param.value}`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trajectoryData.value.trends.dates,
      axisLabel: {
        fontSize: 10,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '发育商',
      nameTextStyle: {
        fontSize: 10
      },
      min: Math.max(0, Math.min(...trajectoryData.value.trends.dqTrend) - 20),
      max: Math.max(...trajectoryData.value.trends.dqTrend) + 20,
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '发育商',
        type: 'line' as const,
        smooth: true,
        data: trajectoryData.value.trends.dqTrend,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  }

  dqChart.setOption(option)

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    dqChart?.resize()
  })
}

// 渲染各维度趋势图
const renderDimensionChart = () => {
  if (!dimensionChartRef.value || !trajectoryData.value) return

  if (dimensionChart) {
    dimensionChart.dispose()
  }

  dimensionChart = echarts.init(dimensionChartRef.value)

  const dimensionTrends = trajectoryData.value.trends.dimensionTrends
  const dates = trajectoryData.value.trends.dates
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#8B5CF6']

  const series = Object.keys(dimensionTrends).map((dim, index) => ({
    name: getDimensionName(dim),
    type: 'line' as const,
    smooth: true,
    data: dimensionTrends[dim],
    itemStyle: {
      color: colors[index % colors.length]
    }
  }))

  const option: echarts.EChartsOption = {
    title: {
      text: '各维度能力变化',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(dimensionTrends).map(dim => getDimensionName(dim)),
      top: 25,
      textStyle: {
        fontSize: 10
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '35%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        fontSize: 10,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '得分',
      nameTextStyle: {
        fontSize: 10
      },
      axisLabel: {
        fontSize: 10
      }
    },
    series
  }

  dimensionChart.setOption(option)

  // 窗口大小变化时自动调整
  window.addEventListener('resize', () => {
    dimensionChart?.resize()
  })
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    childName: '',
    phone: ''
  }
  loadTrajectory()
}

// 查看报告
const viewReport = (recordId: number) => {
  router.push(`/mobile/parent-center/assessment/report/${recordId}`)
}

// 初始化
onMounted(() => {
  // 从路由参数获取筛选条件
  if (route.query.childName) {
    filterForm.value.childName = route.query.childName as string
  }
  if (route.query.phone) {
    filterForm.value.phone = route.query.phone as string
  }

  loadTrajectory()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.growth-trajectory-page {
  padding: 0 0 var(--van-padding-md) 0;
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));

  .filter-card {
    margin: var(--van-padding-md);

    .filter-buttons {
      display: flex;
      gap: var(--van-padding-sm);
      margin-top: var(--van-padding-md);
    }
  }

  .loading-container {
    padding: var(--van-padding-xl);
  }

  .trajectory-content {
    .overview-card {
      margin: 0 var(--van-padding-md) var(--van-padding-md);

      .overview-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--van-padding-md);
        background: var(--van-background-color);
        border-radius: var(--van-radius-md);

        .overview-icon {
          margin-bottom: var(--van-padding-sm);
        }

        .overview-content {
          text-align: center;

          .overview-value {
            font-size: var(--van-font-size-lg);
            font-weight: bold;
            color: var(--van-text-color);
            line-height: 1.2;

            &.highlight {
              color: var(--van-primary-color);
            }

            &.positive {
              color: var(--van-success-color);
            }

            &.negative {
              color: var(--van-danger-color);
            }
          }

          .overview-label {
            font-size: var(--van-font-size-sm);
            color: var(--van-text-color-2);
            margin-top: var(--van-padding-xs);
          }
        }
      }
    }

    .chart-card {
      margin: 0 var(--van-padding-md) var(--van-padding-md);

      .chart-container {
        width: 100%;
        height: 300px;
        padding: var(--van-padding-md);
        background: var(--van-background-color);
        border-radius: var(--van-radius-md);
      }
    }

    .improvement-card {
      margin: 0 var(--van-padding-md) var(--van-padding-md);

      .improvement-item {
        display: flex;
        align-items: center;
        padding: var(--van-padding-md);
        background: var(--van-background-color);
        border-radius: var(--van-radius-md);

        .improvement-icon {
          margin-right: var(--van-padding-sm);
        }

        .improvement-content {
          flex: 1;

          .improvement-dimension {
            font-size: var(--van-font-size-md);
            color: var(--van-text-color);
            margin-bottom: var(--van-padding-xs);
          }

          .improvement-value {
            font-size: var(--van-font-size-lg);
            font-weight: bold;

            &.up {
              color: var(--van-success-color);
            }

            &.down {
              color: var(--van-danger-color);
            }

            &.stable {
              color: var(--van-text-color-2);
            }
          }
        }
      }
    }

    .records-card {
      margin: 0 var(--van-padding-md) var(--van-padding-md);

      .records-list {
        .record-item {
          display: flex;
          flex-direction: column;
          padding: var(--van-padding-md);
          margin-bottom: var(--van-padding-sm);
          background: var(--van-background-color);
          border-radius: var(--van-radius-md);
          position: relative;

          &:last-child {
            margin-bottom: 0;
          }

          .record-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--van-padding-sm);

            .record-info {
              flex: 1;

              .record-title {
                font-size: var(--van-font-size-lg);
                font-weight: bold;
                color: var(--van-text-color);
                margin-bottom: var(--van-padding-xs);
              }

              .record-meta {
                display: flex;
                align-items: center;
                gap: var(--van-padding-sm);

                .record-age {
                  font-size: var(--van-font-size-sm);
                  color: var(--van-text-color-2);
                }
              }
            }

            .record-score {
              text-align: center;

              .score-value {
                font-size: var(--van-font-size-xl);
                font-weight: bold;
                color: var(--van-primary-color);
              }

              .score-label {
                font-size: var(--van-font-size-xs);
                color: var(--van-text-color-2);
              }
            }
          }

          .record-details {
            display: flex;
            justify-content: space-between;

            .detail-item {
              display: flex;
              align-items: center;
              gap: var(--van-padding-xs);
              font-size: var(--van-font-size-sm);
              color: var(--van-text-color-2);
            }
          }

          .record-arrow {
            position: absolute;
            right: var(--van-padding-md);
            top: 50%;
            transform: translateY(-50%);
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .growth-trajectory-page {
    .trajectory-content {
      .chart-card {
        .chart-container {
          height: 250px;
        }
      }
    }
  }
}
</style>