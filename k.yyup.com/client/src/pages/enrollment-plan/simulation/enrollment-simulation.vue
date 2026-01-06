<template>
  <div class="simulation-container">
    <div class="page-header">
      <h1>
        <UnifiedIcon name="default" />
        招生仿真模拟
      </h1>
      <p class="description">通过AI驱动的仿真模拟，预测不同招生策略的效果</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>仿真配置</h3>
      </template>
      
      <el-form :model="simulationForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="仿真场景:">
              <el-select v-model="simulationForm.scenario" style="width: 100%;">
                <el-option label="常规招生" value="normal" />
                <el-option label="竞争激烈" value="competitive" />
                <el-option label="市场萎缩" value="declining" />
                <el-option label="快速扩张" value="expansion" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="仿真周期:">
              <el-select v-model="simulationForm.duration" style="width: 100%;">
                <el-option label="3个月" value="3months" />
                <el-option label="6个月" value="6months" />
                <el-option label="1年" value="1year" />
                <el-option label="3年" value="3years" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="simulating"
                @click="startSimulation"
                size="large"
                style="width: 100%;"
              >
                <UnifiedIcon name="default" />
                开始仿真
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">高级配置</el-divider>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="目标招生数:">
              <el-input-number 
                v-model="simulationForm.targetEnrollment" 
                :min="50" 
                :max="1000" 
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="预算限制:">
              <el-input-number 
                v-model="simulationForm.budget" 
                :min="10000" 
                :max="1000000" 
                :step="10000"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="策略组合:">
              <el-checkbox-group v-model="simulationForm.strategies">
                <el-checkbox label="online_marketing">线上营销</el-checkbox>
                <el-checkbox label="community_outreach">社区推广</el-checkbox>
                <el-checkbox label="referral_program">推荐计划</el-checkbox>
                <el-checkbox label="price_adjustment">价格调整</el-checkbox>
                <el-checkbox label="quality_improvement">质量提升</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 仿真结果 -->
    <div v-if="simulationResult" class="simulation-results">
      <!-- 关键指标 -->
      <div class="key-metrics">
        <el-card class="metric-card success-rate">
          <div class="metric">
            <div class="icon">🎯</div>
            <div class="content">
              <div class="value">{{ Math.round(simulationResult.metrics.successRate * 100) }}%</div>
              <div class="label">成功率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card enrollment">
          <div class="metric">
            <div class="icon">👥</div>
            <div class="content">
              <div class="value">{{ simulationResult.metrics.projectedEnrollment }}</div>
              <div class="label">预计招生</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card cost">
          <div class="metric">
            <div class="icon">💰</div>
            <div class="content">
              <div class="value">¥{{ simulationResult.metrics.costPerStudent.toLocaleString() }}</div>
              <div class="label">获客成本</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card roi">
          <div class="metric">
            <div class="icon">📈</div>
            <div class="content">
              <div class="value">{{ Math.round(simulationResult.metrics.roi * 100) }}%</div>
              <div class="label">投资回报率</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 仿真图表 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            仿真过程曲线
          </h3>
        </template>
        
        <div class="chart-container">
          <div id="simulationChart" style="width: 100%; min-height: 60px; height: auto;"></div>
        </div>
      </el-card>

      <!-- 策略效果分析 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="strategy-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                策略效果分析
              </h3>
            </template>
            
            <div class="strategy-analysis">
              <div 
                v-for="strategy in simulationResult.strategyAnalysis"
                :key="strategy.name"
                class="strategy-item"
              >
                <div class="strategy-header">
                  <span class="strategy-name">{{ formatStrategyName(strategy.name) }}</span>
                  <el-tag :type="getEffectivenessType(strategy.effectiveness)">
                    {{ getEffectivenessLabel(strategy.effectiveness) }}
                  </el-tag>
                </div>
                
                <div class="strategy-metrics">
                  <div class="metric-row">
                    <span class="metric-label">贡献度:</span>
                    <el-progress 
                      :percentage="strategy.contribution * 100"
                      :show-text="false"
                      :stroke-width="8"
                    />
                    <span class="metric-value">{{ Math.round(strategy.contribution * 100) }}%</span>
                  </div>
                  
                  <div class="metric-row">
                    <span class="metric-label">成本效益:</span>
                    <span class="metric-value">{{ strategy.costEfficiency }}:1</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="risk-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                风险评估
              </h3>
            </template>
            
            <div class="risk-assessment">
              <div class="overall-risk">
                <h4>整体风险等级</h4>
                <el-progress 
                  type="circle"
                  :percentage="simulationResult.riskAssessment.overallRisk * 100"
                  :color="getRiskColor(simulationResult.riskAssessment.overallRisk)"
                  :width="120"
                />
                <p>{{ getRiskLabel(simulationResult.riskAssessment.overallRisk) }}</p>
              </div>
              
              <div class="risk-factors">
                <h4>主要风险因素</h4>
                <ul class="risk-list">
                  <li 
                    v-for="risk in simulationResult.riskAssessment.factors"
                    :key="risk"
                  >
                    <UnifiedIcon name="default" />
                    {{ risk }}
                  </li>
                </ul>
              </div>
              
              <div class="mitigation">
                <h4>风险缓解建议</h4>
                <ul class="mitigation-list">
                  <li 
                    v-for="suggestion in simulationResult.riskAssessment.mitigation"
                    :key="suggestion"
                  >
                    <UnifiedIcon name="Check" />
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 场景对比 -->
      <el-card class="scenario-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            场景对比分析
          </h3>
        </template>
        
        <div class="scenario-comparison">
          <div class="table-wrapper">
<el-table class="responsive-table" :data="simulationResult.scenarioComparison" style="width: 100%">
            <el-table-column prop="scenario" label="场景" width="120">
              <template #default="{ row }">
                <el-tag :type="row.scenario === simulationForm.scenario ? 'primary' : 'info'">
                  {{ formatScenarioName(row.scenario) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="enrollment" label="预计招生" width="100" />
            <el-table-column prop="successRate" label="成功率" width="100">
              <template #default="{ row }">
                {{ Math.round(row.successRate * 100) }}%
              </template>
            </el-table-column>
            <el-table-column prop="cost" label="总成本" width="120">
              <template #default="{ row }">
                ¥{{ row.cost.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="roi" label="ROI" width="100">
              <template #default="{ row }">
                {{ Math.round(row.roi * 100) }}%
              </template>
            </el-table-column>
            <el-table-column prop="recommendation" label="推荐度" width="120">
              <template #default="{ row }">
                <el-rate 
                  v-model="row.recommendation" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                />
              </template>
            </el-table-column>
            <el-table-column label="特点" min-width="200">
              <template #default="{ row }">
                <el-tag 
                  v-for="feature in row.features"
                  :key="feature"
                  size="small"
                  style="margin: var(--spacing-sm);"
                >
                  {{ feature }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
      </el-card>

      <!-- 优化建议 -->
      <el-card class="recommendations-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            仿真优化建议
          </h3>
        </template>
        
        <div class="recommendations">
          <el-timeline>
            <el-timeline-item
              v-for="(recommendation, index) in simulationResult.recommendations"
              :key="index"
              :type="getRecommendationType(index)"
              size="large"
            >
              <div class="recommendation-content">
                <h4>{{ recommendation.title }}</h4>
                <p>{{ recommendation.description }}</p>
                <div class="recommendation-impact">
                  <el-tag :type="getImpactType(recommendation.impact)" size="small">
                    预期影响: {{ recommendation.impact }}
                  </el-tag>
                  <el-tag type="info" size="small">
                    实施难度: {{ recommendation.difficulty }}
                  </el-tag>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="simulating" class="loading-container">
      <el-card>
        <div class="loading-content">
          <UnifiedIcon name="default" />
          <h3>AI仿真进行中...</h3>
          <p>正在运行多种场景模拟，分析最优策略组合</p>
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
  Monitor, VideoPlay, DataLine, Operation, Warning, WarningFilled,
  Check, Switch, Opportunity, Loading 
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
const simulationResult = ref<any>(null)
const simulating = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备仿真环境...')

const simulationForm = ref({
  scenario: 'normal',
  duration: '6months',
  targetEnrollment: 200,
  budget: 100000,
  strategies: ['online_marketing', 'community_outreach']
})

// 生命周期
onMounted(() => {
  // 页面加载完成后的初始化
})

// 方法
const startSimulation = async () => {
  simulating.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '初始化仿真环境...',
      '设定市场参数...',
      '运行策略模拟...',
      '分析竞争响应...',
      '计算成本效益...',
      '评估风险因素...',
      '生成对比场景...',
      '优化策略组合...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
    
    loadingStep.value = '生成仿真报告...'
    loadingProgress.value = 95
    
    const scenarios = [{
      scenario: simulationForm.value.scenario,
      duration: simulationForm.value.duration,
      targetEnrollment: simulationForm.value.targetEnrollment,
      budget: simulationForm.value.budget,
      strategies: simulationForm.value.strategies
    }]
    const result = await enrollmentAIApi.generateSimulation(1, { scenarios })
    
    loadingProgress.value = 100
    simulationResult.value = result.data
    
    // 生成图表
    nextTick(() => {
      generateSimulationChart()
    })
    
    ElMessage.success('仿真模拟完成')
    
  } catch (error) {
    console.error('仿真模拟失败:', error)
    ElMessage.error('仿真模拟失败，请稍后重试')
  } finally {
    simulating.value = false
    loadingProgress.value = 0
  }
}

const generateSimulationChart = () => {
  const chartDom = document.getElementById('simulationChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 模拟仿真过程数据
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const enrollmentTrend = [15, 32, 58, 85, 125, 168]
  const costTrend = [8000, 15000, 22000, 28000, 35000, 42000]
  
  const option = {
    title: {
      text: '仿真过程趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['累计招生', '累计成本'],
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: [
      {
        type: 'value',
        name: '招生人数',
        position: 'left'
      },
      {
        type: 'value',
        name: '成本(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '累计招生',
        type: 'line',
        yAxisIndex: 0,
        data: enrollmentTrend,
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
        name: '累计成本',
        type: 'line',
        yAxisIndex: 1,
        data: costTrend,
        lineStyle: { color: getWarningColor() },
        itemStyle: { color: getWarningColor() }
      }
    ]
  }
  
  myChart.setOption(option)
}

// 辅助方法
const formatStrategyName = (strategy: string) => {
  const names: Record<string, string> = {
    'online_marketing': '线上营销',
    'community_outreach': '社区推广',
    'referral_program': '推荐计划',
    'price_adjustment': '价格调整',
    'quality_improvement': '质量提升'
  }
  return names[strategy] || strategy
}

const formatScenarioName = (scenario: string) => {
  const names: Record<string, string> = {
    'normal': '常规',
    'competitive': '激烈竞争',
    'declining': '市场萎缩',
    'expansion': '快速扩张'
  }
  return names[scenario] || scenario
}

const getEffectivenessType = (effectiveness: number) => {
  if (effectiveness > 0.8) return 'success'
  if (effectiveness > 0.6) return 'warning'
  return 'danger'
}

const getEffectivenessLabel = (effectiveness: number) => {
  if (effectiveness > 0.8) return '高效'
  if (effectiveness > 0.6) return '中效'
  return '低效'
}

const getRiskColor = (risk: number) => {
  if (risk > 0.7) return 'var(--danger-color)'
  if (risk > 0.4) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getRiskLabel = (risk: number) => {
  if (risk > 0.7) return '高风险'
  if (risk > 0.4) return '中风险'
  return '低风险'
}

const getRecommendationType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info']
  return types[index % types.length]
}

const getImpactType = (impact: string) => {
  const types: Record<string, string> = {
    '高': 'success',
    '中': 'warning',
    '低': 'info'
  }
  return types[impact] || 'info'
}
</script>

<style scoped lang="scss">
.simulation-container {
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

  .simulation-results {
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

    .chart-card, .strategy-card, .risk-card, .scenario-card, .recommendations-card {
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

    .strategy-analysis {
      .strategy-item {
        padding: var(--text-base);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-lg);
        background: var(--bg-gray-light);

        .strategy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          .strategy-name {
            font-weight: 500;
            color: #2c3e50;
          }
        }

        .strategy-metrics {
          .metric-row {
            display: flex;
            align-items: center;
            gap: var(--text-xs);
            margin-bottom: var(--spacing-sm);

            .metric-label {
              width: auto;
              color: var(--text-regular);
              font-size: var(--text-sm);
            }

            .metric-value {
              color: var(--primary-color);
              font-weight: 500;
              min-width: auto;
            }

            .el-progress {
              flex: 1;
            }
          }
        }
      }
    }

    .risk-assessment {
      .overall-risk {
        text-align: center;
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        p {
          margin-top: var(--text-sm);
          color: var(--text-regular);
        }
      }

      .risk-factors, .mitigation {
        margin-bottom: var(--text-2xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }

        .risk-list, .mitigation-list {
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
      }
    }

    .scenario-comparison {
      .el-table {
        border-radius: var(--spacing-sm);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
    }

    .recommendations {
      .recommendation-content {
        h4 {
          margin: 0 0 var(--spacing-sm) 0;
          color: #2c3e50;
        }

        p {
          color: var(--text-regular);
          margin-bottom: var(--text-sm);
        }

        .recommendation-impact {
          .el-tag {
            margin-right: var(--spacing-sm);
          }
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