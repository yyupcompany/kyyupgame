<template>
  <div class="smart-planning-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>
        <UnifiedIcon name="default" />
        AI智能规划
      </h1>
      <p class="description">基于历史数据和市场分析，为您生成智能招生规划建议</p>
    </div>

    <!-- 计划选择器 -->
    <el-card class="plan-selector" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>选择招生计划</h3>
        </div>
      </template>
      
      <el-select
        v-model="selectedPlanId"
        placeholder="请选择要分析的招生计划"
        size="large"
        class="full-width-select"
        @change="handlePlanChange"
      >
        <el-option
          v-for="plan in enrollmentPlans"
          :key="plan.id"
          :label="`${plan.title} (${plan.year}年${plan.semester}学期)`"
          :value="plan.id"
        />
      </el-select>

      <div class="action-buttons" v-if="selectedPlanId">
        <el-button 
          type="primary" 
          :loading="analyzing"
          @click="generateSmartPlanning"
          size="large"
        >
          <UnifiedIcon name="default" />
          生成智能规划
        </el-button>
        
        <el-button 
          v-if="planningResult"
          @click="exportReport"
          size="large"
        >
          <UnifiedIcon name="Download" />
          导出报告
        </el-button>
      </div>
    </el-card>

    <!-- 分析结果 -->
    <div v-if="planningResult" class="results-container">
      <!-- 概览卡片 -->
      <div class="overview-cards">
        <el-card class="overview-card confidence">
          <div class="metric">
            <div class="value">{{ Math.round(planningResult.confidenceScore * 100) }}%</div>
            <div class="label">AI置信度</div>
          </div>
          <el-progress
            :percentage="planningResult.confidenceScore * 100"
            :color="getConfidenceColor(planningResult.confidenceScore)"
            :show-text="false"
          />
        </el-card>

        <el-card class="overview-card target">
          <div class="metric">
            <div class="value">{{ planningResult.recommendations.targetCount }}</div>
            <div class="label">建议招生人数</div>
          </div>
        </el-card>

        <el-card class="overview-card pricing">
          <div class="metric">
            <div class="value">¥{{ planningResult.recommendations.pricing.suggested.toLocaleString() }}</div>
            <div class="label">建议学费</div>
          </div>
        </el-card>

        <el-card class="overview-card reach">
          <div class="metric">
            <div class="value">{{ planningResult.recommendations.marketingStrategy.expectedReach.toLocaleString() }}</div>
            <div class="label">预期触达人数</div>
          </div>
        </el-card>
      </div>

      <!-- 详细建议 -->
      <el-row :gutter="24">
        <!-- 定价策略 -->
        <el-col :span="12">
          <el-card class="recommendation-card" shadow="hover">
            <template #header>
              <h3><UnifiedIcon name="default" /> 定价策略分析</h3>
            </template>
            
            <div class="pricing-analysis">
              <div class="suggested-price">
                <span class="price">¥{{ planningResult.recommendations.pricing.suggested.toLocaleString() }}</span>
                <el-tag type="success">AI推荐</el-tag>
              </div>
              <p class="rationale">{{ planningResult.recommendations.pricing.rationale }}</p>
              
              <div class="price-comparison">
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="市场平均价格">¥3,200</el-descriptions-item>
                  <el-descriptions-item label="竞争对手平均">¥3,150</el-descriptions-item>
                  <el-descriptions-item label="价格定位">
                    <el-tag v-if="planningResult.recommendations.pricing.suggested > 3200" type="warning">高端定位</el-tag>
                    <el-tag v-else-if="planningResult.recommendations.pricing.suggested > 2800" type="primary">中端定位</el-tag>
                    <el-tag v-else type="info">经济定位</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 时间规划 -->
        <el-col :span="12">
          <el-card class="recommendation-card" shadow="hover">
            <template #header>
              <h3><UnifiedIcon name="default" /> 时间规划</h3>
            </template>
            
            <div class="timeline-planning">
              <div class="optimal-date">
                <label>最佳开始时间：</label>
                <el-tag type="primary" size="large">{{ formatDate(planningResult.recommendations.timeline.optimalStartDate) }}</el-tag>
              </div>
              
              <div class="milestones">
                <h4>关键里程碑</h4>
                <el-timeline>
                  <el-timeline-item
                    v-for="(milestone, index) in planningResult.recommendations.timeline.milestones"
                    :key="index"
                    :type="getPriorityType(milestone.priority)"
                  >
                    <div class="milestone-content">
                      <div class="milestone-date">{{ formatDate(milestone.date) }}</div>
                      <div class="milestone-task">{{ milestone.task }}</div>
                      <el-tag :type="getPriorityType(milestone.priority)" size="small">
                        {{ getPriorityText(milestone.priority) }}
                      </el-tag>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 营销策略 -->
      <el-card class="recommendation-card" shadow="hover">
        <template #header>
          <h3><UnifiedIcon name="default" /> 营销策略建议</h3>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="marketing-metric">
              <h4>推荐渠道</h4>
              <div class="channels">
                <el-tag
                  v-for="channel in planningResult.recommendations.marketingStrategy.channels"
                  :key="channel"
                  type="primary"
                  class="channel-tag"
                >
                  {{ channel }}
                </el-tag>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="marketing-metric">
              <h4>建议预算</h4>
              <div class="budget">
                <span class="amount">¥{{ planningResult.recommendations.marketingStrategy.budget.toLocaleString() }}</span>
                <div class="budget-breakdown">
                  <small>平均每个获客成本：¥{{ Math.round(planningResult.recommendations.marketingStrategy.budget / planningResult.recommendations.marketingStrategy.expectedReach) }}</small>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="marketing-metric">
              <h4>预期触达</h4>
              <div class="reach">
                <span class="number">{{ planningResult.recommendations.marketingStrategy.expectedReach.toLocaleString() }}</span>
                <small>人次</small>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 风险因素 -->
      <el-card class="recommendation-card risk-card" shadow="hover">
        <template #header>
          <h3><UnifiedIcon name="default" /> 风险因素分析</h3>
        </template>
        
        <div class="risk-factors">
          <el-row :gutter="16">
            <el-col
              v-for="(risk, index) in planningResult.riskFactors"
              :key="index"
              :span="8"
            >
              <div class="risk-item">
                <div class="risk-header">
                  <el-tag :type="getRiskType(risk.impact)" size="small">
                    {{ getRiskText(risk.impact) }}
                  </el-tag>
                  <span class="risk-factor">{{ risk.factor }}</span>
                </div>
                <p class="risk-mitigation">{{ risk.mitigation }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="analyzing" class="loading-container">
      <el-card>
        <div class="loading-content">
          <UnifiedIcon name="default" />
          <h3>AI正在分析中...</h3>
          <p>正在基于历史数据和市场趋势生成智能规划建议</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ loadingStep }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Star, Download, Money, Calendar, Promotion, Warning, Loading } from '@element-plus/icons-vue'
import { enrollmentPlanApi } from '@/api/modules/enrollment-plan'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'

// 响应式数据
const selectedPlanId = ref<number | null>(null)
const enrollmentPlans = ref<any[]>([])
const planningResult = ref<any>(null)
const analyzing = ref(false)
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

const handlePlanChange = () => {
  planningResult.value = null
}

const generateSmartPlanning = async () => {
  if (!selectedPlanId.value) return

  analyzing.value = true
  loadingProgress.value = 0
  
  try {
    // 模拟加载进度
    const steps = [
      '分析历史招生数据...',
      '评估市场竞争环境...',
      '计算最优定价策略...',
      '生成时间规划建议...',
      '识别潜在风险因素...',
      '生成综合建议...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    loadingStep.value = '生成智能规划报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateSmartPlanning(selectedPlanId.value)
    
    loadingProgress.value = 100
    planningResult.value = result.data
    
    ElMessage.success('智能规划生成成功')
    
  } catch (error) {
    console.error('智能规划生成失败:', error)
    ElMessage.error('智能规划生成失败，请稍后重试')
  } finally {
    analyzing.value = false
    loadingProgress.value = 0
  }
}

const exportReport = async () => {
  try {
    await ElMessageBox.confirm('确定要导出智能规划报告吗？', '确认导出', {
      confirmButtonText: '导出',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 调用导出API
    const response = await enrollmentAIApi.exportReport(selectedPlanId.value!)
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-planning-report-${selectedPlanId.value}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('报告导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('报告导出失败')
    }
  }
}

// 辅助方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return 'var(--success-color)'
  if (score >= 0.6) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getPriorityType = (priority: string) => {
  const types = { high: 'danger', medium: 'warning', low: 'info' }
  return types[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const texts = { high: '高优先级', medium: '中优先级', low: '低优先级' }
  return texts[priority] || priority
}

const getRiskType = (impact: string) => {
  const types = { high: 'danger', medium: 'warning', low: 'info' }
  return types[impact] || 'info'
}

const getRiskText = (impact: string) => {
  const texts = { high: '高风险', medium: '中风险', low: '低风险' }
  return texts[impact] || impact
}
</script>

<style scoped lang="scss">
.full-width-select {
  width: 100%;
}

.smart-planning-container {
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

  .plan-selector {
    margin-bottom: var(--text-3xl);

    .card-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .action-buttons {
      margin-top: var(--text-lg);
      text-align: center;
      
      .el-button {
        margin: 0 var(--spacing-sm);
      }
    }
  }

  .results-container {
    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-base);
      margin-bottom: var(--text-3xl);

      .overview-card {
        text-align: center;
        
        .metric {
          .value {
            font-size: var(--text-4xl);
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }
          
          .label {
            color: var(--info-color);
            font-size: var(--text-sm);
          }
        }

        &.confidence .metric .value {
          color: var(--success-color);
        }
        
        &.target .metric .value {
          color: var(--warning-color);
        }
        
        &.pricing .metric .value {
          color: var(--danger-color);
        }
        
        &.reach .metric .value {
          color: var(--info-color);
        }
      }
    }

    .recommendation-card {
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

      .pricing-analysis {
        .suggested-price {
          display: flex;
          align-items: center;
          gap: var(--text-xs);
          margin-bottom: var(--text-lg);
          
          .price {
            font-size: var(--text-3xl);
            font-weight: bold;
            color: var(--danger-color);
          }
        }
        
        .rationale {
          color: var(--text-regular);
          margin-bottom: var(--text-lg);
          line-height: 1.6;
        }
      }

      .timeline-planning {
        .optimal-date {
          display: flex;
          align-items: center;
          gap: var(--text-xs);
          margin-bottom: var(--text-3xl);
          
          label {
            font-weight: 500;
            color: #2c3e50;
          }
        }
        
        .milestones h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }
        
        .milestone-content {
          .milestone-date {
            font-weight: 500;
            color: var(--primary-color);
            margin-bottom: var(--spacing-xs);
          }
          
          .milestone-task {
            color: #2c3e50;
            margin-bottom: var(--spacing-sm);
          }
        }
      }

      .marketing-metric {
        text-align: center;
        
        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }
        
        .channels .channel-tag {
          margin: var(--spacing-xs);
        }
        
        .budget {
          .amount {
            font-size: var(--text-2xl);
            font-weight: bold;
            color: var(--success-color);
            display: block;
          }
          
          .budget-breakdown {
            margin-top: var(--spacing-sm);
            color: var(--info-color);
          }
        }
        
        .reach {
          .number {
            font-size: var(--text-2xl);
            font-weight: bold;
            color: var(--primary-color);
            display: block;
          }
        }
      }

      &.risk-card :deep(.el-card__header) {
        background: var(--gradient-pink);
      }
      
      .risk-factors {
        .risk-item {
          padding: var(--text-base);
          border: var(--border-width-base) solid var(--border-color-lighter);
          border-radius: var(--spacing-sm);
          margin-bottom: var(--text-lg);
          
          .risk-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            
            .risk-factor {
              font-weight: 500;
              color: #2c3e50;
            }
          }
          
          .risk-mitigation {
            color: var(--text-regular);
            line-height: 1.5;
            margin: 0;
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