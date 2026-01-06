<template>
  <div class="trend-analysis-container">
    <div class="page-header">
      <h1>
        <UnifiedIcon name="default" />
        招生趋势分析
      </h1>
      <p class="description">深度分析历史招生数据，识别趋势模式，为战略决策提供数据支撑</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>分析配置</h3>
      </template>
      
      <el-form :model="analysisForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="时间范围:">
              <el-select v-model="analysisForm.timeRange" style="width: 100%;">
                <el-option label="近1年" value="1year" />
                <el-option label="近3年" value="3years" />
                <el-option label="近5年" value="5years" />
                <el-option label="全部历史" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="分析维度:">
              <el-checkbox-group v-model="analysisForm.dimensions">
                <el-checkbox label="applications">申请量趋势</el-checkbox>
                <el-checkbox label="demographics">人口统计</el-checkbox>
                <el-checkbox label="seasonal">季节性分析</el-checkbox>
                <el-checkbox label="competition">竞争分析</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="analyzing"
                @click="generateTrendAnalysis"
                size="large"
                style="width: 100%;"
              >
                <UnifiedIcon name="default" />
                开始趋势分析
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 趋势分析结果 -->
    <div v-if="trendResult" class="trend-results">
      <!-- 关键指标 -->
      <div class="key-metrics">
        <el-card class="metric-card growth">
          <div class="metric">
            <div class="icon">📈</div>
            <div class="content">
              <div class="value">{{ trendResult.trends.projected.growthRate * 100 }}%</div>
              <div class="label">年增长率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card conversion">
          <div class="metric">
            <div class="icon">🎯</div>
            <div class="content">
              <div class="value">{{ Math.round(trendResult.trends.current.conversionRate * 100) }}%</div>
              <div class="label">当前转化率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card market-share">
          <div class="metric">
            <div class="icon">🏆</div>
            <div class="content">
              <div class="value">{{ Math.round(trendResult.competitorAnalysis.marketShare * 100) }}%</div>
              <div class="label">市场份额</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card forecast">
          <div class="metric">
            <div class="icon">🔮</div>
            <div class="content">
              <div class="value">{{ trendResult.trends.projected.nextYear }}</div>
              <div class="label">明年预测</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 历史趋势图表 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            历史招生趋势
          </h3>
        </template>
        
        <div class="chart-container">
          <div id="trendChart" style="width: 100%; min-height: 60px; height: auto;"></div>
        </div>
      </el-card>

      <!-- 当前状况分析 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="current-status-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                当前状况分析
              </h3>
            </template>
            
            <div class="current-status">
              <div class="status-item">
                <label>当前申请量:</label>
                <span class="value">{{ trendResult.trends.current.applications }}人</span>
              </div>
              
              <div class="status-item">
                <label>转化率:</label>
                <span class="value">{{ Math.round(trendResult.trends.current.conversionRate * 100) }}%</span>
              </div>
              
              <div class="popular-programs">
                <h4>热门项目</h4>
                <div class="program-tags">
                  <el-tag 
                    v-for="program in trendResult.trends.current.popularPrograms"
                    :key="program"
                    type="success"
                    size="large"
                  >
                    {{ program }}
                  </el-tag>
                </div>
              </div>
              
              <div class="peak-periods">
                <h4>高峰期</h4>
                <div class="period-tags">
                  <el-tag 
                    v-for="period in trendResult.trends.current.peakPeriods"
                    :key="period"
                    type="warning"
                    size="medium"
                  >
                    {{ period }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="market-insights-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                市场洞察
              </h3>
            </template>
            
            <div class="market-insights">
              <div class="demographics">
                <h4>人口统计趋势</h4>
                <div class="demo-grid">
                  <div 
                    v-for="(value, key) in trendResult.marketInsights.demographics"
                    :key="key"
                    class="demo-item"
                  >
                    <span class="demo-label">{{ formatDemoKey(key) }}:</span>
                    <span class="demo-value">{{ value }}</span>
                  </div>
                </div>
              </div>
              
              <div class="preferences">
                <h4>家长偏好趋势</h4>
                <ul class="preference-list">
                  <li 
                    v-for="preference in trendResult.marketInsights.preferences"
                    :key="preference"
                  >
                    <UnifiedIcon name="default" />
                    {{ preference }}
                  </li>
                </ul>
              </div>
              
              <div class="price-elasticity">
                <h4>价格弹性</h4>
                <div class="elasticity-indicator">
                  <el-progress 
                    :percentage="Math.abs(trendResult.marketInsights.priceElasticity) * 100"
                    :color="getElasticityColor(trendResult.marketInsights.priceElasticity)"
                  />
                  <p>{{ getElasticityDescription(trendResult.marketInsights.priceElasticity) }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 竞争分析 -->
      <el-card class="competition-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            竞争环境分析
          </h3>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="competition-metric">
              <h4>市场份额</h4>
              <div class="share-display">
                <div class="share-value">{{ Math.round(trendResult.competitorAnalysis.marketShare * 100) }}%</div>
                <el-progress 
                  type="circle" 
                  :percentage="trendResult.competitorAnalysis.marketShare * 100"
                  :width="120"
                  color="var(--primary-color)"
                />
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="competition-metric">
              <h4>竞争优势</h4>
              <ul class="strength-list">
                <li 
                  v-for="strength in trendResult.competitorAnalysis.strengths"
                  :key="strength"
                >
                  <UnifiedIcon name="Check" />
                  {{ strength }}
                </li>
              </ul>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="competition-metric">
              <h4>发展机会</h4>
              <ul class="opportunity-list">
                <li 
                  v-for="opportunity in trendResult.competitorAnalysis.opportunities"
                  :key="opportunity"
                >
                  <UnifiedIcon name="default" />
                  {{ opportunity }}
                </li>
              </ul>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 新兴趋势 -->
      <el-card class="emerging-trends-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            新兴趋势预测
          </h3>
        </template>
        
        <div class="emerging-trends">
          <el-timeline>
            <el-timeline-item
              v-for="(trend, index) in trendResult.trends.projected.emergingTrends"
              :key="index"
              :type="getTrendType(index)"
              size="large"
            >
              <div class="trend-content">
                <h4>{{ trend }}</h4>
                <div class="trend-impact">
                  <el-tag :type="getTrendImpactType(index)" size="small">
                    {{ getTrendImpact(index) }}
                  </el-tag>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="analyzing" class="loading-container">
      <el-card>
        <div class="loading-content">
          <UnifiedIcon name="default" />
          <h3>AI正在分析趋势中...</h3>
          <p>正在深度分析历史数据，识别趋势模式</p>
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
  TrendCharts, DataAnalysis, DataLine, Calendar, Compass, Trophy,
  Check, Opportunity, Right, Loading, TrendCharts as Trend
} from '@element-plus/icons-vue'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'
import * as echarts from 'echarts'
import {
  getPrimaryColor,
  getSuccessColor,
  getWarningColor,
  getDangerColor,
  primaryRgba
} from '@/utils/color-tokens'

// 响应式数据
const trendResult = ref<any>(null)
const analyzing = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备分析...')

const analysisForm = ref({
  timeRange: '3years',
  dimensions: ['applications', 'demographics', 'seasonal']
})

// 生命周期
onMounted(() => {
  // 页面加载完成后的初始化
})

// 方法
const generateTrendAnalysis = async () => {
  analyzing.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '收集历史数据...',
      '分析申请量趋势...',
      '识别季节性模式...',
      '评估市场环境变化...',
      '分析竞争格局...',
      '预测未来趋势...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    loadingStep.value = '生成趋势报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateTrendAnalysis(analysisForm.value.timeRange)
    
    loadingProgress.value = 100
    trendResult.value = result.data
    
    // 生成图表
    nextTick(() => {
      generateTrendChart()
    })
    
    ElMessage.success('趋势分析完成')
    
  } catch (error) {
    console.error('趋势分析失败:', error)
    ElMessage.error('趋势分析失败，请稍后重试')
  } finally {
    analyzing.value = false
    loadingProgress.value = 0
  }
}

const generateTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 模拟历史趋势数据
  const years = ['2019', '2020', '2021', '2022', '2023', '2024']
  const applications = [120, 135, 98, 156, 189, 215]
  const admissions = [110, 125, 89, 142, 178, 198]
  
  const option = {
    title: {
      text: '历史招生趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['申请人数', '录取人数'],
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: years
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '申请人数',
        type: 'line',
        data: applications,
        lineStyle: { color: getPrimaryColor() },
        itemStyle: { color: getPrimaryColor() },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: primaryRgba(0.3) },
              { offset: 1, color: primaryRgba(0.1) }
            ]
          }
        }
      },
      {
        name: '录取人数',
        type: 'line',
        data: admissions,
        lineStyle: { color: getSuccessColor() },
        itemStyle: { color: getSuccessColor() },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  myChart.setOption(option)
}

// 辅助方法
const formatDemoKey = (key: string) => {
  const names: Record<string, string> = {
    'age_distribution': '年龄分布',
    'income_level': '收入水平',
    'education_background': '教育背景',
    'family_structure': '家庭结构'
  }
  return names[key] || key
}

const getElasticityColor = (elasticity: number) => {
  if (Math.abs(elasticity) > 0.7) return 'var(--danger-color)'
  if (Math.abs(elasticity) > 0.3) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getElasticityDescription = (elasticity: number) => {
  const abs = Math.abs(elasticity)
  if (abs > 0.7) return '价格敏感度高'
  if (abs > 0.3) return '价格敏感度中等'
  return '价格敏感度低'
}

const getTrendType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info']
  return types[index % types.length]
}

const getTrendImpactType = (index: number) => {
  const types = ['success', 'warning', 'info', 'danger']
  return types[index % types.length]
}

const getTrendImpact = (index: number) => {
  const impacts = ['高影响', '中影响', '新兴趋势', '待观察']
  return impacts[index % impacts.length]
}
</script>

<style scoped lang="scss">
.trend-analysis-container {
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
  }

  .trend-results {
    .key-metrics {
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
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
            color: white;
          }

          .content {
            flex: 1;

            .value {
              font-size: var(--text-2xl);
              font-weight: bold;
              margin-bottom: var(--spacing-xs);
              color: var(--primary-color);
            }

            .label {
              color: var(--text-regular);
              font-size: var(--text-sm);
            }
          }
        }
      }
    }

    .chart-card, .current-status-card, .market-insights-card, 
    .competition-card, .emerging-trends-card {
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

    .current-status {
      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-xs) 0;
        border-bottom: var(--z-index-dropdown) solid var(--bg-container);

        label {
          color: var(--text-regular);
          font-weight: 500;
        }

        .value {
          color: var(--primary-color);
          font-weight: bold;
        }
      }

      .popular-programs, .peak-periods {
        margin-top: var(--text-2xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }

        .program-tags, .period-tags {
          .el-tag {
            margin: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 0;
          }
        }
      }
    }

    .market-insights {
      .demographics, .preferences, .price-elasticity {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }
      }

      .demo-grid {
        .demo-item {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-sm) 0;
          border-bottom: var(--z-index-dropdown) solid var(--bg-container);

          .demo-label {
            color: var(--text-regular);
          }

          .demo-value {
            color: #2c3e50;
            font-weight: 500;
          }
        }
      }

      .preference-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
          color: var(--text-regular);
          border-bottom: var(--z-index-dropdown) solid var(--bg-container);

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .elasticity-indicator {
        p {
          margin: var(--text-xs) 0 0 0;
          color: var(--text-regular);
          text-align: center;
        }
      }
    }

    .competition-metric {
      text-align: center;

      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
      }

      .share-display {
        .share-value {
          font-size: var(--text-4xl);
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: var(--text-lg);
        }
      }

      .strength-list, .opportunity-list {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;

        li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
          color: var(--text-regular);
          border-bottom: var(--z-index-dropdown) solid var(--bg-container);

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .emerging-trends {
      .trend-content {
        h4 {
          margin: 0 0 var(--spacing-sm) 0;
          color: #2c3e50;
        }

        .trend-impact {
          margin-top: var(--spacing-sm);
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