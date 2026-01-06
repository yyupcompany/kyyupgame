<template>
  <div class="capacity-optimization-container">
    <div class="page-header">
      <h1>
        <el-icon><Setting /></el-icon>
        容量优化分析
      </h1>
      <p class="description">智能分析幼儿园容量配置，优化班级设置和资源分配</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>优化配置</h3>
      </template>
      
      <el-form :model="optimizationForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="选择计划:">
              <el-select v-model="optimizationForm.planId" placeholder="请选择招生计划" style="width: 100%;">
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
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="optimizing"
                @click="generateOptimization"
                :disabled="!optimizationForm.planId"
                size="large"
                style="width: 100%;"
              >
                <el-icon><Tools /></el-icon>
                开始容量优化
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 优化结果 -->
    <div v-if="optimizationResult" class="optimization-results">
      <!-- 容量分析概览 -->
      <div class="metrics-grid">
        <el-card class="metric-card utilization">
          <div class="metric">
            <div class="icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ Math.round(optimizationResult.capacityAnalysis.currentUtilization * 100) }}%</div>
              <div class="label">当前利用率</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card optimal">
          <div class="metric">
            <div class="icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ optimizationResult.capacityAnalysis.optimalCapacity }}</div>
              <div class="label">建议容量</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card efficiency">
          <div class="metric">
            <div class="icon">
              <el-icon><Promotion /></el-icon>
            </div>
            <div class="content">
              <div class="value">{{ Math.round(optimizationResult.efficiencyGains.projectedImprovement * 100) }}%</div>
              <div class="label">效率提升</div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card savings">
          <div class="metric">
            <div class="icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="content">
              <div class="value">¥{{ optimizationResult.efficiencyGains.costSavings.toLocaleString() }}</div>
              <div class="label">成本节省</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 容量分析详情 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="analysis-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><DataLine /></el-icon>
                容量分析
              </h3>
            </template>
            
            <div class="capacity-analysis">
              <div class="current-status">
                <h4>当前状况</h4>
                <el-progress 
                  :percentage="optimizationResult.capacityAnalysis.currentUtilization * 100"
                  :color="getUtilizationColor(optimizationResult.capacityAnalysis.currentUtilization)"
                />
                <p>利用率: {{ Math.round(optimizationResult.capacityAnalysis.currentUtilization * 100) }}%</p>
              </div>
              
              <div class="bottlenecks">
                <h4>瓶颈分析</h4>
                <ul class="bottleneck-list">
                  <li 
                    v-for="bottleneck in optimizationResult.capacityAnalysis.bottlenecks"
                    :key="bottleneck"
                  >
                    <el-icon><Warning /></el-icon>
                    {{ bottleneck }}
                  </li>
                </ul>
              </div>
              
              <div class="recommendations">
                <h4>优化建议</h4>
                <ul class="recommendation-list">
                  <li 
                    v-for="recommendation in optimizationResult.capacityAnalysis.recommendations"
                    :key="recommendation"
                  >
                    <el-icon><Check /></el-icon>
                    {{ recommendation }}
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="class-config-card" shadow="hover">
            <template #header>
              <h3>
                <el-icon><School /></el-icon>
                建议班级配置
              </h3>
            </template>
            
            <div class="class-configuration">
              <div 
                v-for="classConfig in optimizationResult.classConfiguration.suggestedClasses"
                :key="classConfig.ageGroup"
                class="class-item"
              >
                <div class="class-header">
                  <h4>{{ classConfig.ageGroup }}</h4>
                  <el-tag type="primary">{{ classConfig.capacity }}人/班</el-tag>
                </div>
                
                <div class="class-details">
                  <div class="detail-row">
                    <span class="label">教师配置:</span>
                    <span class="value">{{ classConfig.teachers }}人</span>
                  </div>
                  
                  <div class="equipment-list">
                    <span class="label">设备需求:</span>
                    <div class="equipment-tags">
                      <el-tag 
                        v-for="equipment in classConfig.equipment"
                        :key="equipment"
                        size="small"
                        type="info"
                      >
                        {{ equipment }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 资源分配优化 -->
      <el-card class="resource-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><Grid /></el-icon>
            资源分配优化
          </h3>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="resource-section">
              <h4>人员配置</h4>
              <div class="resource-breakdown">
                <div 
                  v-for="(count, role) in optimizationResult.resourceAllocation.staff"
                  :key="role"
                  class="resource-item"
                >
                  <span class="resource-name">{{ formatRoleName(role) }}</span>
                  <span class="resource-count">{{ count }}人</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="resource-section">
              <h4>设施配置</h4>
              <div class="resource-breakdown">
                <div 
                  v-for="(count, facility) in optimizationResult.resourceAllocation.facilities"
                  :key="facility"
                  class="resource-item"
                >
                  <span class="resource-name">{{ formatFacilityName(facility) }}</span>
                  <span class="resource-count">{{ count }}间</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="resource-section">
              <h4>设备配置</h4>
              <div class="resource-breakdown">
                <div 
                  v-for="(count, equipment) in optimizationResult.resourceAllocation.equipment"
                  :key="equipment"
                  class="resource-item"
                >
                  <span class="resource-name">{{ formatEquipmentName(equipment) }}</span>
                  <span class="resource-count">{{ count }}套</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 效率提升预期 -->
      <el-card class="efficiency-card" shadow="hover">
        <template #header>
          <h3>
            <el-icon><Opportunity /></el-icon>
            效率提升预期
          </h3>
        </template>
        
        <div class="efficiency-gains">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="efficiency-metric">
                <h4>当前效率</h4>
                <div class="metric-value">
                  {{ Math.round(optimizationResult.efficiencyGains.currentEfficiency * 100) }}%
                </div>
                <el-progress 
                  :percentage="optimizationResult.efficiencyGains.currentEfficiency * 100"
                  :show-text="false"
                  color="var(--warning-color)"
                />
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="efficiency-metric">
                <h4>预期效率</h4>
                <div class="metric-value">
                  {{ Math.round((optimizationResult.efficiencyGains.currentEfficiency + optimizationResult.efficiencyGains.projectedImprovement) * 100) }}%
                </div>
                <el-progress 
                  :percentage="(optimizationResult.efficiencyGains.currentEfficiency + optimizationResult.efficiencyGains.projectedImprovement) * 100"
                  :show-text="false"
                  color="var(--success-color)"
                />
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="efficiency-metric">
                <h4>成本节省</h4>
                <div class="metric-value">
                  ¥{{ optimizationResult.efficiencyGains.costSavings.toLocaleString() }}
                </div>
                <div class="metric-subtitle">年度预期节省</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="optimizing" class="loading-container">
      <el-card>
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <h3>AI正在分析优化中...</h3>
          <p>正在分析容量配置和资源分配，生成优化建议</p>
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
  Setting, Tools, DataAnalysis, TrendCharts, Promotion, Money, DataLine,
  Warning, Check, School, Grid, Opportunity, Loading 
} from '@element-plus/icons-vue'
import { enrollmentPlanApi } from '@/api/modules/enrollment-plan'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'

// 响应式数据
const enrollmentPlans = ref<any[]>([])
const optimizationResult = ref<any>(null)
const optimizing = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备分析...')

const optimizationForm = ref({
  planId: null
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

const generateOptimization = async () => {
  if (!optimizationForm.value.planId) return

  optimizing.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '分析当前容量配置...',
      '识别容量瓶颈...',
      '计算最优班级配置...',
      '优化资源分配...',
      '评估效率提升...',
      '生成优化建议...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    loadingStep.value = '生成优化报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateOptimization(optimizationForm.value.planId!)
    
    loadingProgress.value = 100
    optimizationResult.value = result.data
    
    ElMessage.success('容量优化分析完成')
    
  } catch (error) {
    console.error('容量优化失败:', error)
    ElMessage.error('容量优化分析失败，请稍后重试')
  } finally {
    optimizing.value = false
    loadingProgress.value = 0
  }
}

// 辅助方法
const getUtilizationColor = (utilization: number) => {
  if (utilization > 0.9) return 'var(--danger-color)'
  if (utilization > 0.7) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const formatRoleName = (role: string) => {
  const names: Record<string, string> = {
    'teachers': '教师',
    'assistants': '助教',
    'admin': '管理人员',
    'support': '后勤人员'
  }
  return names[role] || role
}

const formatFacilityName = (facility: string) => {
  const names: Record<string, string> = {
    'classrooms': '教室',
    'playgrounds': '活动室',
    'dining_rooms': '餐厅',
    'rest_rooms': '休息室'
  }
  return names[facility] || facility
}

const formatEquipmentName = (equipment: string) => {
  const names: Record<string, string> = {
    'teaching_aids': '教学用具',
    'playground_equipment': '游乐设施',
    'safety_equipment': '安全设备',
    'multimedia': '多媒体设备'
  }
  return names[equipment] || equipment
}
</script>

<style scoped lang="scss">
.capacity-optimization-container {
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

  .optimization-results {
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
            }
          }
        }

        &.utilization {
          .icon {
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
            color: white;
          }
          .value { color: var(--primary-color); }
        }

        &.optimal {
          .icon {
            background: var(--gradient-pink);
            color: white;
          }
          .value { color: var(--warning-color); }
        }

        &.efficiency {
          .icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
          .value { color: var(--success-color); }
        }

        &.savings {
          .icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: white;
          }
          .value { color: var(--danger-color); }
        }
      }
    }

    .analysis-card, .class-config-card, .resource-card, .efficiency-card {
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

    .capacity-analysis {
      .current-status, .bottlenecks, .recommendations {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-sm);
        }
      }

      .bottleneck-list, .recommendation-list {
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
    }

    .class-configuration {
      .class-item {
        padding: var(--text-base);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-lg);
        background: var(--bg-gray-light);

        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          h4 {
            margin: 0;
            color: #2c3e50;
          }
        }

        .class-details {
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-sm);

            .label {
              color: var(--text-regular);
            }

            .value {
              font-weight: 500;
              color: #2c3e50;
            }
          }

          .equipment-list {
            .label {
              color: var(--text-regular);
              display: block;
              margin-bottom: var(--spacing-sm);
            }

            .equipment-tags {
              .el-tag {
                margin: var(--spacing-sm) var(--spacing-xs) 2px 0;
              }
            }
          }
        }
      }
    }

    .resource-section {
      h4 {
        color: #2c3e50;
        margin-bottom: var(--text-lg);
        text-align: center;
      }

      .resource-breakdown {
        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--text-xs);
          border: var(--border-width-base) solid var(--border-color-lighter);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          background: var(--bg-gray-light);

          .resource-name {
            color: var(--text-regular);
          }

          .resource-count {
            font-weight: 500;
            color: var(--primary-color);
          }
        }
      }
    }

    .efficiency-gains {
      .efficiency-metric {
        text-align: center;

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .metric-value {
          font-size: var(--text-4xl);
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: var(--text-sm);
        }

        .metric-subtitle {
          color: var(--info-color);
          font-size: var(--text-sm);
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