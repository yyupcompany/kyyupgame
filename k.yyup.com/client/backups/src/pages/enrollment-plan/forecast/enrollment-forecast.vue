<template>
  <div class="forecast-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>
        <el-icon><TrendCharts /></el-icon>
        招生预测分析
      </h1>
      <p class="description">基于历史数据和市场趋势，预测未来招生情况</p>
    </div>

    <!-- 预测配置 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>预测配置</h3>
      </template>
      
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="config-item">
            <label>选择招生计划:</label>
            <el-select v-model="selectedPlanId" placeholder="请选择计划" style="width: 100%;">
              <el-option
                v-for="plan in enrollmentPlans"
                :key="plan.id"
                :label="`${plan.title} (${plan.year}年)`"
                :value="plan.id"
              />
            </el-select>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="config-item">
            <label>预测时间范围:</label>
            <el-select v-model="timeframe" style="width: 100%;">
              <el-option label="1个月" value="1month" />
              <el-option label="3个月" value="3months" />
              <el-option label="6个月" value="6months" />
              <el-option label="1年" value="1year" />
            </el-select>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="config-item">
            <el-button 
              type="primary" 
              :loading="forecasting"
              @click="generateForecast"
              :disabled="!selectedPlanId"
              size="large"
              style="width: 100%;"
            >
              <el-icon><DataAnalysis /></el-icon>
              生成预测
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 预测结果 -->
    <div v-if="forecastResult" class="forecast-results">
      <!-- 关键指标卡片 -->
      <div class="metrics-grid">
        <el-card class="metric-card applications">
          <div class="metric">
            <div class="icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ forecastResult.forecasts.shortTerm.expectedApplications }}</div>
              <div class="label">预期申请人数</div>
              <div class="sub-label">{{ getTimeframeName() }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card conversion">
          <div class="metric">
            <div class="icon">
              <el-icon><Promotion /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ Math.round(forecastResult.forecasts.shortTerm.conversionRate * 100) }}%</div>
              <div class="label">预期转化率</div>
              <div class="sub-label">咨询到申请</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card confidence">
          <div class="metric">
            <div class="icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ Math.round(forecastResult.forecasts.shortTerm.confidence * 100) }}%</div>
              <div class="label">预测置信度</div>
              <div class="sub-label">算法准确性</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card demand">
          <div class="metric">
            <div class="icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ forecastResult.forecasts.longTerm.demandForecast }}</div>
              <div class="label">长期需求预测</div>
              <div class="sub-label">未来1年</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 预测图表 -->
      <el-row :gutter="24">
        <el-col :span="16">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><DataLine /></el-icon>
                申请量趋势预测
              </h3>
            </template>
            
            <div class="chart-container">
              <div id="forecastChart" style="width: 100%; height: 400px;"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="seasonal-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><Calendar /></el-icon>
                季节性因素
              </h3>
            </template>
            
            <div class="seasonal-factors">
              <div
                v-for="factor in forecastResult.seasonalFactors"
                :key="factor.period"
                class="factor-item"
              >
                <div class="factor-header">
                  <span class="period">{{ factor.period }}</span>
                  <el-tag :type="getFactorType(factor.factor)" size="small">
                    {{ factor.factor > 1 ? '+' : '' }}{{ Math.round((factor.factor - 1) * 100) }}%
                  </el-tag>
                </div>
                <p class="factor-desc">{{ factor.description }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 市场趋势分析 -->
      <el-card class="trend-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><Compass /></el-icon>
            市场趋势分析
          </h3>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="trend-section">
              <h4>新兴趋势</h4>
              <ul class="trend-list">
                <li 
                  v-for="trend in forecastResult.forecasts.longTerm.marketTrends" 
                  :key="trend"
                  class="trend-item"
                >
                  <el-icon><Right /></el-icon>
                  {{ trend }}
                </li>
              </ul>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="competition-section">
              <h4>竞争环境分析</h4>
              <div class="competition-analysis">
                <p>{{ forecastResult.forecasts.longTerm.competitionAnalysis }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 建议措施 -->
      <el-card class="recommendations-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><InfoFilled /></el-icon>
            AI建议措施
          </h3>
        </template>
        
        <div class="recommendations">
          <el-timeline>
            <el-timeline-item
              v-for="(recommendation, index) in forecastResult.recommendations"
              :key="index"
              :type="getRecommendationType(index)"
            >
              <div class="recommendation-content">
                <span class="recommendation-text">{{ recommendation }}</span>
                <el-tag :type="getRecommendationType(index)" size="small">
                  {{ getRecommendationLabel(index) }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="forecasting" class="loading-container">
      <el-card>
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <h3>AI正在分析预测中...</h3>
          <p>正在基于历史数据和市场模式进行预测分析</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ loadingStep }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, DataAnalysis, User, Promotion, DataLine, Calendar,
  Compass, Right, InfoFilled, Loading
} from '@element-plus/icons-vue'
import { enrollmentPlanApi } from '@/api/modules/enrollment-plan'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'
import * as echarts from 'echarts'

// 响应式数据
const selectedPlanId = ref<number | null>(null)
const timeframe = ref('3months')
const enrollmentPlans = ref<any[]>([])
const forecastResult = ref<any>(null)
const forecasting = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备分析...')

// 生命周期
onMounted(() => {
  loadEnrollmentPlans()
})

// 方法
const loadEnrollmentPlans = async () => {
  try {
    const response = await enrollmentPlanApi.getList({ page: 1, limit: 100 })
    enrollmentPlans.value = response.data?.list || []
  } catch (error) {
    ElMessage.error('获取招生计划列表失败')
  }
}

const generateForecast = async () => {
  if (!selectedPlanId.value) return

  forecasting.value = true
  loadingProgress.value = 0
  
  try {
    // 模拟加载进度
    const steps = [
      '收集历史申请数据...',
      '分析季节性趋势...',
      '评估市场环境变化...',
      '计算预测模型...',
      '生成趋势图表...',
      '分析竞争因素...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    loadingStep.value = '生成预测报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateForecast(selectedPlanId.value, { timeframe: timeframe.value })
    
    loadingProgress.value = 100
    forecastResult.value = result.data
    
    // 生成图表
    nextTick(() => {
      generateChart()
    })
    
    ElMessage.success('预测分析完成')
    
  } catch (error) {
    console.error('预测分析失败:', error)
    ElMessage.error('预测分析失败，请稍后重试')
  } finally {
    forecasting.value = false
    loadingProgress.value = 0
  }
}

const generateChart = () => {
  const chartDom = document.getElementById('forecastChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 模拟历史数据和预测数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const historicalData = [45, 52, 61, 58, 67, 73, 68, 75, 82, 78, 85, 91]
  const forecastData = [95, 102, 108, 115, 122, 129] // 未来6个月预测
  
  const option = {
    title: {
      text: '申请量趋势预测',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['历史数据', '预测数据'],
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: [...months, ...months.slice(0, 6).map(m => `预测${m}`)]
    },
    yAxis: {
      type: 'value',
      name: '申请人数'
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: [...historicalData, ...new Array(6).fill(null)],
        lineStyle: { color: 'var(--primary-color)' },
        itemStyle: { color: 'var(--primary-color)' }
      },
      {
        name: '预测数据',
        type: 'line',
        data: [...new Array(12).fill(null), ...forecastData],
        lineStyle: { 
          color: 'var(--success-color)',
          type: 'dashed'
        },
        itemStyle: { color: 'var(--success-color)' }
      }
    ]
  }
  
  myChart.setOption(option)
}

// 辅助方法
const getTimeframeName = () => {
  const names = {
    '1month': '未来1个月',
    '3months': '未来3个月', 
    '6months': '未来6个月',
    '1year': '未来1年'
  }
  return names[timeframe.value] || '预测期间'
}

const getFactorType = (factor: number) => {
  if (factor > 1.1) return 'success'
  if (factor < 0.9) return 'danger'
  return 'warning'
}

const getRecommendationType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info']
  return types[index % types.length]
}

const getRecommendationLabel = (index: number) => {
  const labels = ['核心建议', '优化措施', '注意事项', '补充建议']
  return labels[index % labels.length]
}
</script>

<style scoped lang="scss">
.forecast-container {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);

    h1 {
      font-size: var(--text-3xl);
      color: #2c3e50;
      margin-bottom: var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--text-xs);
    }

    .description {
      color: var(--text-regular);
      font-size: var(--text-base);
    }
  }

  .config-card {
    margin-bottom: var(--text-3xl);

    .config-item {
      label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: #2c3e50;
      }
    }
  }

  .forecast-results {
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-base);
      margin-bottom: var(--text-3xl);

      .metric-card {
        .metric {
          display: flex;
          align-items: center;
          gap: var(--text-base);

          .icon {
            width: var(--icon-size); height: var(--icon-size);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--spacing-sm);
            font-size: var(--text-2xl);
          }

          .content {
            flex: 1;

            .value {
              font-size: var(--text-2xl);
              font-weight: bold;
              margin-bottom: var(--spacing-xs);
            }

            .label {
              color: var(--text-regular);
              font-size: var(--text-sm);
              margin-bottom: var(--spacing-sm);
            }

            .sub-label {
              color: var(--info-color);
              font-size: var(--text-xs);
            }
          }
        }

        &.applications {
          .icon {
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
            color: white;
          }
          .value { color: var(--primary-color); }
        }

        &.conversion {
          .icon {
            background: var(--gradient-pink);
            color: white;
          }
          .value { color: var(--warning-color); }
        }

        &.confidence {
          .icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
          .value { color: var(--success-color); }
        }

        &.demand {
          .icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }
          .value { color: var(--danger-color); }
        }
      }
    }

    .chart-card, .seasonal-card, .trend-card, .recommendations-card {
      margin-bottom: var(--text-3xl);

      :deep(.el-card__header) {
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
        
        h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
      }
    }

    .seasonal-factors {
      .factor-item {
        padding: var(--text-base);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-sm);

        .factor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .period {
            font-weight: 500;
            color: #2c3e50;
          }
        }

        .factor-desc {
          color: var(--text-regular);
          font-size: var(--text-sm);
          margin: 0;
          line-height: 1.4;
        }
      }
    }

    .trend-section, .competition-section {
      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
      }

      .trend-list {
        list-style: none;
        padding: 0;
        margin: 0;

        .trend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
          color: var(--text-regular);
          border-bottom: var(--border-width-base) solid var(--bg-container);

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .competition-analysis {
        padding: var(--text-base);
        background: var(--bg-gray-light);
        border-radius: var(--spacing-sm);
        border-left: var(--spacing-xs) solid var(--primary-color);

        p {
          margin: 0;
          color: var(--text-regular);
          line-height: 1.6;
        }
      }
    }

    .recommendations {
      .recommendation-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .recommendation-text {
          flex: 1;
          color: #2c3e50;
          line-height: 1.5;
          margin-right: var(--text-sm);
        }
      }
    }
  }

  .loading-container {
    margin-top: var(--text-3xl);
    
    .loading-content {
      text-align: center;
      padding: var(--spacing-10xl);
      
      .loading-icon {
        font-size: var(--text-5xl);
        color: var(--primary-color);
        margin-bottom: var(--text-lg);
        animation: spin 2s linear infinite;
      }
      
      h3 {
        color: #2c3e50;
        margin-bottom: var(--spacing-sm);
      }
      
      p {
        color: var(--text-regular);
        margin-bottom: var(--text-3xl);
      }
      
      .loading-step {
        color: var(--primary-color);
        font-weight: 500;
        margin-top: var(--text-lg);
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>