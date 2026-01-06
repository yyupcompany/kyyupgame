<template>
  <div class="strategy-container">
    <div class="page-header">
      <h1>
        <el-icon><Setting /></el-icon>
        AI招生策略
      </h1>
      <p class="description">基于市场分析和目标受众，制定个性化招生策略</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>策略配置</h3>
      </template>
      
      <el-form :model="strategyForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="选择计划:">
              <el-select v-model="strategyForm.planId" placeholder="请选择招生计划" class="full-width-select">
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
            <el-form-item label="策略类型:">
              <el-select v-model="strategyForm.type" class="full-width-select">
                <el-option label="增长型策略" value="growth" />
                <el-option label="稳定型策略" value="stable" />
                <el-option label="差异化策略" value="differentiated" />
                <el-option label="成本领导策略" value="cost-leader" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="目标预算:">
              <el-input-number
                v-model="strategyForm.budget"
                :min="0"
                :step="1000"
                class="full-width-input"
                placeholder="营销预算"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="目标时长:">
              <el-select v-model="strategyForm.duration" class="full-width-select">
                <el-option label="3个月" value="3months" />
                <el-option label="6个月" value="6months" />
                <el-option label="1年" value="1year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="generating"
            @click="generateStrategy"
            :disabled="!strategyForm.planId"
            size="large"
          >
            <el-icon><Star /></el-icon>
            生成AI策略
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 策略结果 -->
    <div v-if="strategyResult" class="strategy-results">
      <!-- 策略概览 -->
      <el-card class="overview-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><View /></el-icon>
            策略概览
          </h3>
        </template>
        
        <div class="strategy-overview">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="overview-item">
                <div class="label">目标受众</div>
                <div class="value">{{ strategyResult.strategies.targetAudience.primarySegment }}</div>
                <div class="detail">规模: {{ strategyResult.strategies.targetAudience.size.toLocaleString() }}人</div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="overview-item">
                <div class="label">价值主张</div>
                <div class="value">{{ strategyResult.strategies.positioning.valueProposition }}</div>
                <div class="detail">核心优势: {{ strategyResult.strategies.positioning.competitiveAdvantage }}</div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="overview-item">
                <div class="label">总预算</div>
                <div class="value">¥{{ strategyResult.budget.total.toLocaleString() }}</div>
                <div class="detail">{{ strategyResult.timeline.phases.length }}个执行阶段</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 渠道策略 -->
      <el-card class="channels-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><Connection /></el-icon>
            渠道策略矩阵
          </h3>
        </template>
        
        <div class="channels-matrix">
          <div 
            v-for="channel in strategyResult.strategies.channels"
            :key="channel.channel"
            class="channel-item"
          >
            <div class="channel-header">
              <h4>{{ channel.channel }}</h4>
              <div class="channel-metrics">
                <el-tag :type="getPriorityType(channel.priority)" size="small">
                  优先级: {{ channel.priority }}
                </el-tag>
                <span class="roi">ROI: {{ channel.expectedROI }}%</span>
              </div>
            </div>
            
            <div class="channel-tactics">
              <h5>执行策略:</h5>
              <ul>
                <li v-for="tactic in channel.tactics" :key="tactic">{{ tactic }}</li>
              </ul>
            </div>
            
            <div class="channel-progress">
              <el-progress 
                :percentage="channel.priority * 20" 
                :color="getChannelColor(channel.priority)"
                :show-text="false"
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 执行时间线 -->
      <el-card class="timeline-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><Clock /></el-icon>
            执行时间线
          </h3>
        </template>
        
        <div class="execution-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(phase, index) in strategyResult.timeline.phases"
              :key="index"
              :type="getPhaseType(index)"
              size="large"
            >
              <div class="phase-content">
                <div class="phase-header">
                  <h4>{{ phase.phase }}</h4>
                  <el-tag type="info" size="small">{{ phase.duration }}</el-tag>
                </div>
                
                <div class="phase-objectives">
                  <h5>阶段目标:</h5>
                  <ul>
                    <li v-for="objective in phase.objectives" :key="objective">{{ objective }}</li>
                  </ul>
                </div>
                
                <div class="phase-metrics">
                  <h5>关键指标:</h5>
                  <div class="metrics-tags">
                    <el-tag 
                      v-for="metric in phase.metrics" 
                      :key="metric"
                      type="success" 
                      size="small"
                    >
                      {{ metric }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 预算分配 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="budget-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><Money /></el-icon>
                预算分配
              </h3>
            </template>
            
            <div class="budget-breakdown">
              <div 
                v-for="(amount, category) in strategyResult.budget.breakdown"
                :key="category"
                class="budget-item"
              >
                <div class="budget-category">
                  <span class="category-name">{{ formatCategoryName(category) }}</span>
                  <span class="category-amount">¥{{ amount.toLocaleString() }}</span>
                </div>
                <div class="budget-bar">
                  <el-progress 
                    :percentage="(amount / strategyResult.budget.total) * 100"
                    :show-text="false"
                    :color="getBudgetColor(category)"
                  />
                </div>
                <div class="budget-percentage">
                  {{ Math.round((amount / strategyResult.budget.total) * 100) }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="positioning-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><Flag /></el-icon>
                定位与差异化
              </h3>
            </template>
            
            <div class="positioning-analysis">
              <div class="value-proposition">
                <h4>价值主张</h4>
                <p>{{ strategyResult.strategies.positioning.valueProposition }}</p>
              </div>
              
              <div class="differentiators">
                <h4>核心差异点</h4>
                <ul class="diff-list">
                  <li 
                    v-for="diff in strategyResult.strategies.positioning.differentiators"
                    :key="diff"
                  >
                    <el-icon><Right /></el-icon>
                    {{ diff }}
                  </li>
                </ul>
              </div>
              
              <div class="competitive-advantage">
                <h4>竞争优势</h4>
                <div class="advantage-highlight">
                  {{ strategyResult.strategies.positioning.competitiveAdvantage }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 加载状态 -->
    <div v-if="generating" class="loading-container">
      <el-card>
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <h3>AI正在制定策略中...</h3>
          <p>正在分析市场环境和竞争态势，制定最优策略</p>
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
  Setting, Star, View, Connection, Clock, Money, Flag, Right, Loading
} from '@element-plus/icons-vue'
import { enrollmentPlanApi } from '@/api/modules/enrollment-plan'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'

// 响应式数据
const enrollmentPlans = ref<any[]>([])
const strategyResult = ref<any>(null)
const generating = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备分析...')

const strategyForm = ref({
  planId: null,
  type: 'growth',
  budget: 50000,
  duration: '6months'
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

const generateStrategy = async () => {
  if (!strategyForm.value.planId) return

  generating.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '分析目标市场...',
      '评估竞争环境...',
      '制定定位策略...',
      '设计渠道组合...',
      '规划执行时间线...',
      '优化预算分配...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    loadingStep.value = '生成策略报告...'
    loadingProgress.value = 95
    
    const objectives = {
      type: strategyForm.value.type,
      budget: strategyForm.value.budget,
      duration: strategyForm.value.duration
    }
    
    const result = await enrollmentAIApi.generateStrategy(strategyForm.value.planId!, { objectives })
    
    loadingProgress.value = 100
    strategyResult.value = result.data
    
    ElMessage.success('AI策略生成成功')
    
  } catch (error) {
    console.error('策略生成失败:', error)
    ElMessage.error('策略生成失败，请稍后重试')
  } finally {
    generating.value = false
    loadingProgress.value = 0
  }
}

// 辅助方法
const getPriorityType = (priority: number) => {
  if (priority >= 4) return 'danger'
  if (priority >= 3) return 'warning'
  return 'info'
}

const getChannelColor = (priority: number) => {
  if (priority >= 4) return 'var(--danger-color)'
  if (priority >= 3) return 'var(--warning-color)'
  return 'var(--info-color)'
}

const getPhaseType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info']
  return types[index % types.length]
}

const formatCategoryName = (category: string) => {
  const names: Record<string, string> = {
    'digital_marketing': '数字营销',
    'traditional_ads': '传统广告',
    'events': '活动推广',
    'partnerships': '合作推广',
    'content_creation': '内容制作'
  }
  return names[category] || category
}

const getBudgetColor = (category: string) => {
  const colors: Record<string, string> = {
    'digital_marketing': 'var(--primary-color)',
    'traditional_ads': 'var(--success-color)',
    'events': 'var(--warning-color)',
    'partnerships': 'var(--danger-color)',
    'content_creation': 'var(--info-color)'
  }
  return colors[category] || 'var(--info-color)'
}
</script>

<style scoped lang="scss">
.full-width-select,
.full-width-input {
  width: 100%;
}

.strategy-container {
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

  .strategy-results {
    .overview-card, .channels-card, .timeline-card, .budget-card, .positioning-card {
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

    .strategy-overview {
      .overview-item {
        text-align: center;
        padding: var(--spacing-lg);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        background: var(--bg-gray-light);

        .label {
          color: var(--info-color);
          font-size: var(--text-sm);
          margin-bottom: var(--spacing-sm);
        }

        .value {
          font-size: var(--text-lg);
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: var(--spacing-xs);
        }

        .detail {
          color: var(--text-regular);
          font-size: var(--text-xs);
        }
      }
    }

    .channels-matrix {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--text-base);

      .channel-item {
        padding: var(--spacing-lg);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        background: var(--bg-gray-light);

        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-lg);

          h4 {
            margin: 0;
            color: #2c3e50;
          }

          .channel-metrics {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .roi {
              color: var(--success-color);
              font-weight: 500;
            }
          }
        }

        .channel-tactics {
          margin-bottom: var(--text-lg);

          h5 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--text-regular);
            font-size: var(--text-sm);
          }

          ul {
            margin: 0;
            padding-left: var(--text-lg);
            
            li {
              color: var(--text-regular);
              font-size: var(--text-sm);
              line-height: 1.5;
            }
          }
        }
      }
    }

    .execution-timeline {
      .phase-content {
        .phase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          h4 {
            margin: 0;
            color: #2c3e50;
          }
        }

        .phase-objectives {
          margin-bottom: var(--text-sm);

          h5 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--text-regular);
            font-size: var(--text-sm);
          }

          ul {
            margin: 0;
            padding-left: var(--text-lg);
            
            li {
              color: var(--text-regular);
              font-size: var(--text-sm);
              line-height: 1.5;
            }
          }
        }

        .phase-metrics {
          h5 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--text-regular);
            font-size: var(--text-sm);
          }

          .metrics-tags {
            .el-tag {
              margin: var(--spacing-sm) var(--spacing-xs) 2px 0;
            }
          }
        }
      }
    }

    .budget-breakdown {
      .budget-item {
        margin-bottom: var(--text-lg);

        .budget-category {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .category-name {
            color: #2c3e50;
            font-weight: 500;
          }

          .category-amount {
            color: var(--primary-color);
            font-weight: bold;
          }
        }

        .budget-bar {
          margin-bottom: var(--spacing-xs);
        }

        .budget-percentage {
          text-align: right;
          color: var(--info-color);
          font-size: var(--text-xs);
        }
      }
    }

    .positioning-analysis {
      .value-proposition, .differentiators, .competitive-advantage {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }

        p {
          color: var(--text-regular);
          line-height: 1.6;
          margin: 0;
        }
      }

      .diff-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
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

      .advantage-highlight {
        padding: var(--text-base);
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
        border-radius: var(--spacing-sm);
        font-weight: 500;
        text-align: center;
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