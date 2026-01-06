<template>
  <div class="evaluation-container">
    <div class="page-header">
      <h1>
        <UnifiedIcon name="default" />
        招生计划评估
      </h1>
      <p class="description">全面评估招生计划的可行性和效果，提供科学的决策依据</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>评估配置</h3>
      </template>
      
      <el-form :model="evaluationForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="选择计划:">
              <el-select v-model="evaluationForm.planId" placeholder="请选择招生计划" style="width: 100%;">
                <el-option
                  v-for="plan in enrollmentPlans"
                  :key="plan.id"
                  :label="`${plan.title} (${plan.year}年)`"
                  :value="plan.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="评估维度:">
              <el-checkbox-group v-model="evaluationForm.dimensions">
                <el-checkbox value="feasibility">可行性</el-checkbox>
                <el-checkbox value="effectiveness">有效性</el-checkbox>
                <el-checkbox value="risk">风险性</el-checkbox>
                <el-checkbox value="resource">资源配置</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="evaluating"
                @click="generateEvaluation"
                :disabled="!evaluationForm.planId"
                size="large"
                style="width: 100%;"
              >
                <UnifiedIcon name="Check" />
                开始评估分析
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 评估结果 -->
    <div v-if="evaluationResult" class="evaluation-results">
      <!-- 总体评分 -->
      <el-card class="score-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            综合评估得分
          </h3>
        </template>
        
        <div class="overall-score">
          <div class="score-display">
            <div class="score-value">{{ evaluationResult.overallScore.toFixed(1) }}</div>
            <div class="score-label">总分</div>
            <el-progress 
              type="circle"
              :percentage="evaluationResult.overallScore * 10"
              :width="120"
              :color="getScoreColor(evaluationResult.overallScore)"
            />
          </div>
          
          <div class="score-breakdown">
            <div 
              v-for="dimension in evaluationResult.dimensionScores"
              :key="dimension.name"
              class="dimension-score"
            >
              <div class="dimension-name">{{ formatDimensionName(dimension.name) }}</div>
              <el-progress 
                :percentage="dimension.score * 10"
                :stroke-width="12"
                :color="getScoreColor(dimension.score)"
              />
              <div class="dimension-value">{{ dimension.score.toFixed(1) }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 关键指标 -->
      <div class="key-metrics">
        <el-card class="metric-card feasibility">
          <div class="metric">
            <div class="icon">🎯</div>
            <div class="content">
              <div class="value">{{ Math.round(evaluationResult.feasibilityAnalysis.probability * 100) }}%</div>
              <div class="label">可行性概率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card effectiveness">
          <div class="metric">
            <div class="icon">📊</div>
            <div class="content">
              <div class="value">{{ Math.round(evaluationResult.effectivenessAnalysis.expectedSuccess * 100) }}%</div>
              <div class="label">预期成功率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card risk">
          <div class="metric">
            <div class="icon">⚠️</div>
            <div class="content">
              <div class="value">{{ getRiskLevel(evaluationResult.riskAnalysis.overallRisk) }}</div>
              <div class="label">风险等级</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card resource">
          <div class="metric">
            <div class="icon">💰</div>
            <div class="content">
              <div class="value">{{ Math.round(evaluationResult.resourceAnalysis.efficiency * 100) }}%</div>
              <div class="label">资源效率</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 详细分析 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="analysis-card feasibility-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                可行性分析
              </h3>
            </template>
            
            <div class="feasibility-analysis">
              <div class="analysis-section">
                <h4>实施难度</h4>
                <el-progress 
                  :percentage="(1 - evaluationResult.feasibilityAnalysis.difficulty) * 100"
                  :color="getDifficultyColor(evaluationResult.feasibilityAnalysis.difficulty)"
                />
                <p>{{ getDifficultyDescription(evaluationResult.feasibilityAnalysis.difficulty) }}</p>
              </div>
              
              <div class="analysis-section">
                <h4>资源需求</h4>
                <div class="resource-requirements">
                  <div 
                    v-for="(value, key) in evaluationResult.feasibilityAnalysis.resourceRequirements"
                    :key="key"
                    class="resource-item"
                  >
                    <span class="resource-name">{{ formatResourceName(key) }}:</span>
                    <span class="resource-value">{{ value }}</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-section">
                <h4>关键因素</h4>
                <ul class="factor-list">
                  <li 
                    v-for="factor in evaluationResult.feasibilityAnalysis.keyFactors"
                    :key="factor"
                  >
                    <UnifiedIcon name="default" />
                    {{ factor }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="analysis-card effectiveness-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                有效性分析
              </h3>
            </template>
            
            <div class="effectiveness-analysis">
              <div class="analysis-section">
                <h4>预期成果</h4>
                <div class="outcome-metrics">
                  <div class="outcome-item">
                    <span class="outcome-label">目标完成率:</span>
                    <span class="outcome-value">{{ Math.round(evaluationResult.effectivenessAnalysis.targetCompletion * 100) }}%</span>
                  </div>
                  <div class="outcome-item">
                    <span class="outcome-label">投资回报率:</span>
                    <span class="outcome-value">{{ Math.round(evaluationResult.effectivenessAnalysis.roi * 100) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="analysis-section">
                <h4>优势因素</h4>
                <ul class="strength-list">
                  <li 
                    v-for="strength in evaluationResult.effectivenessAnalysis.strengths"
                    :key="strength"
                  >
                    <UnifiedIcon name="Check" />
                    {{ strength }}
                  </li>
                </ul>
              </div>
              
              <div class="analysis-section">
                <h4>改进空间</h4>
                <ul class="improvement-list">
                  <li 
                    v-for="improvement in evaluationResult.effectivenessAnalysis.improvements"
                    :key="improvement"
                  >
                    <UnifiedIcon name="Edit" />
                    {{ improvement }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 风险评估 -->
      <el-card class="risk-assessment-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            风险评估分析
          </h3>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="risk-overview">
              <h4>风险概览</h4>
              <div class="risk-gauge">
                <el-progress 
                  type="circle"
                  :percentage="evaluationResult.riskAnalysis.overallRisk * 100"
                  :color="getRiskColor(evaluationResult.riskAnalysis.overallRisk)"
                  :width="150"
                />
                <p>{{ getRiskLevel(evaluationResult.riskAnalysis.overallRisk) }}</p>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="risk-factors">
              <h4>主要风险</h4>
              <div 
                v-for="risk in evaluationResult.riskAnalysis.majorRisks"
                :key="risk.factor"
                class="risk-item"
              >
                <div class="risk-header">
                  <span class="risk-name">{{ risk.factor }}</span>
                  <el-tag :type="getRiskSeverityType(risk.severity)" size="small">
                    {{ getRiskSeverityLabel(risk.severity) }}
                  </el-tag>
                </div>
                <el-progress 
                  :percentage="risk.impact * 100"
                  :stroke-width="8"
                  :color="getRiskColor(risk.impact)"
                  :show-text="false"
                />
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="risk-mitigation">
              <h4>风险缓解</h4>
              <ul class="mitigation-list">
                <li 
                  v-for="mitigation in evaluationResult.riskAnalysis.mitigationStrategies"
                  :key="mitigation"
                >
                  <UnifiedIcon name="default" />
                  {{ mitigation }}
                </li>
              </ul>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 综合建议 -->
      <el-card class="recommendations-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            综合评估建议
          </h3>
        </template>
        
        <div class="recommendations">
          <div class="recommendation-summary">
            <h4>评估结论</h4>
            <div class="conclusion">
              <el-tag 
                :type="getRecommendationType(evaluationResult.recommendation.conclusion)" 
                size="large"
              >
                {{ evaluationResult.recommendation.conclusion }}
              </el-tag>
              <p>{{ evaluationResult.recommendation.summary }}</p>
            </div>
          </div>
          
          <div class="action-items">
            <h4>行动建议</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(action, index) in evaluationResult.recommendation.actionItems"
                :key="index"
                :type="getActionType(action.priority)"
                size="large"
              >
                <div class="action-content">
                  <h5>{{ action.title }}</h5>
                  <p>{{ action.description }}</p>
                  <div class="action-meta">
                    <el-tag :type="getPriorityType(action.priority)" size="small">
                      {{ action.priority }}优先级
                    </el-tag>
                    <el-tag type="info" size="small">
                      预期时间: {{ action.timeframe }}
                    </el-tag>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <div class="next-steps">
            <h4>下一步计划</h4>
            <div class="steps-grid">
              <div 
                v-for="(step, index) in evaluationResult.recommendation.nextSteps"
                :key="index"
                class="step-item"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <h5>{{ step.title }}</h5>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="evaluating" class="loading-container">
      <el-card>
        <div class="loading-content">
          <UnifiedIcon name="default" />
          <h3>AI正在评估分析中...</h3>
          <p>正在全面分析招生计划的可行性和效果</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ loadingStep }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Medal, DocumentChecked, Trophy, Aim, DataAnalysis, WarningFilled,
  Right, Check, Edit, Lock, Opportunity, Loading
} from '@element-plus/icons-vue'
import { enrollmentPlanApi } from '@/api/modules/enrollment-plan'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'

// 响应式数据
const enrollmentPlans = ref<any[]>([])
const evaluationResult = ref<any>(null)
const evaluating = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备评估分析...')

const evaluationForm = ref({
  planId: null,
  dimensions: ['feasibility', 'effectiveness', 'risk', 'resource']
})

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

const generateEvaluation = async () => {
  if (!evaluationForm.value.planId) return

  evaluating.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '收集计划数据...',
      '分析可行性指标...',
      '评估有效性预期...',
      '识别风险因素...',
      '分析资源配置...',
      '计算综合得分...',
      '生成改进建议...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    loadingStep.value = '生成评估报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateEvaluation(evaluationForm.value.planId!, evaluationForm.value.dimensions)
    
    loadingProgress.value = 100
    evaluationResult.value = result.data
    
    ElMessage.success('招生计划评估完成')
    
  } catch (error) {
    console.error('评估分析失败:', error)
    ElMessage.error('评估分析失败，请稍后重试')
  } finally {
    evaluating.value = false
    loadingProgress.value = 0
  }
}

// 辅助方法
const formatDimensionName = (dimension: string) => {
  const names: Record<string, string> = {
    'feasibility': '可行性',
    'effectiveness': '有效性',
    'risk': '风险性',
    'resource': '资源配置'
  }
  return names[dimension] || dimension
}

const formatResourceName = (resource: string) => {
  const names: Record<string, string> = {
    'budget': '预算',
    'staff': '人员',
    'time': '时间',
    'facilities': '设施'
  }
  return names[resource] || resource
}

const getScoreColor = (score: number) => {
  if (score >= 8) return 'var(--success-color)'
  if (score >= 6) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getRiskColor = (risk: number) => {
  if (risk > 0.7) return 'var(--danger-color)'
  if (risk > 0.4) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getRiskLevel = (risk: number) => {
  if (risk > 0.7) return '高风险'
  if (risk > 0.4) return '中风险'
  return '低风险'
}

const getDifficultyColor = (difficulty: number) => {
  if (difficulty > 0.7) return 'var(--danger-color)'
  if (difficulty > 0.4) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getDifficultyDescription = (difficulty: number) => {
  if (difficulty > 0.7) return '实施难度较高，需要充分准备'
  if (difficulty > 0.4) return '实施难度适中，需要合理规划'
  return '实施难度较低，容易执行'
}

const getRiskSeverityType = (severity: number) => {
  if (severity > 0.7) return 'danger'
  if (severity > 0.4) return 'warning'
  return 'success'
}

const getRiskSeverityLabel = (severity: number) => {
  if (severity > 0.7) return '高'
  if (severity > 0.4) return '中'
  return '低'
}

const getRecommendationType = (conclusion: string) => {
  if (conclusion.includes('推荐')) return 'success'
  if (conclusion.includes('谨慎')) return 'warning'
  return 'danger'
}

const getActionType = (priority: string) => {
  const types: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'primary'
  }
  return types[priority] || 'primary'
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return types[priority] || 'info'
}
</script>

<style scoped lang="scss">
.evaluation-container {
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

  .evaluation-results {
    .score-card {
      margin-bottom: var(--text-3xl);
      
      .overall-score {
        display: flex;
        align-items: center;
        gap: var(--spacing-5xl);

        .score-display {
          text-align: center;

          .score-value {
            font-size: var(--text-5xl);
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }

          .score-label {
            color: var(--text-regular);
            font-size: var(--text-base);
            margin-bottom: var(--text-lg);
          }
        }

        .score-breakdown {
          flex: 1;

          .dimension-score {
            display: flex;
            align-items: center;
            gap: var(--text-base);
            margin-bottom: var(--text-lg);

            .dimension-name {
              width: auto;
              color: #2c3e50;
              font-weight: 500;
            }

            .el-progress {
              flex: 1;
            }

            .dimension-value {
              width: auto;
              text-align: right;
              color: var(--primary-color);
              font-weight: bold;
            }
          }
        }
      }
    }

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

    .analysis-card, .risk-assessment-card, .recommendations-card {
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

    .feasibility-analysis, .effectiveness-analysis {
      .analysis-section {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }

        .resource-requirements {
          .resource-item {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm) 0;
            border-bottom: var(--z-index-dropdown) solid var(--bg-container);

            .resource-name {
              color: var(--text-regular);
            }

            .resource-value {
              color: #2c3e50;
              font-weight: 500;
            }
          }
        }

        .outcome-metrics {
          .outcome-item {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm) 0;
            border-bottom: var(--z-index-dropdown) solid var(--bg-container);

            .outcome-label {
              color: var(--text-regular);
            }

            .outcome-value {
              color: var(--primary-color);
              font-weight: bold;
            }
          }
        }

        .factor-list, .strength-list, .improvement-list {
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

    .risk-overview {
      text-align: center;

      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
      }

      .risk-gauge {
        p {
          margin-top: var(--text-sm);
          color: var(--text-regular);
          font-weight: 500;
        }
      }
    }

    .risk-factors {
      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
      }

      .risk-item {
        margin-bottom: var(--text-lg);

        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .risk-name {
            color: #2c3e50;
            font-weight: 500;
          }
        }
      }
    }

    .risk-mitigation {
      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
      }

      .mitigation-list {
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

    .recommendations {
      .recommendation-summary {
        margin-bottom: var(--spacing-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .conclusion {
          text-align: center;

          .el-tag {
            margin-bottom: var(--text-lg);
          }

          p {
            color: var(--text-regular);
            font-size: var(--text-base);
          }
        }
      }

      .action-items {
        margin-bottom: var(--spacing-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .action-content {
          h5 {
            margin: 0 0 var(--spacing-sm) 0;
            color: #2c3e50;
          }

          p {
            color: var(--text-regular);
            margin-bottom: var(--text-sm);
          }

          .action-meta {
            .el-tag {
              margin-right: var(--spacing-sm);
            }
          }
        }
      }

      .next-steps {
        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--text-base);

          .step-item {
            display: flex;
            gap: var(--text-base);
            padding: var(--text-base);
            border: var(--border-width-base) solid var(--border-color-lighter);
            border-radius: var(--spacing-sm);
            background: var(--bg-gray-light);

            .step-number {
              width: var(--spacing-3xl);
              height: var(--spacing-3xl);
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--primary-color);
              color: white;
              border-radius: var(--radius-full);
              font-weight: bold;
              flex-shrink: 0;
            }

            .step-content {
              flex: 1;

              h5 {
                margin: 0 0 var(--spacing-sm) 0;
                color: #2c3e50;
              }

              p {
                margin: 0;
                color: var(--text-regular);
                font-size: var(--text-sm);
              }
            }
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