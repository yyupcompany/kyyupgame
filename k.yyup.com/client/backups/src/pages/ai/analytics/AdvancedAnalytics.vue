<template>
  <div class="advanced-analytics-container">
    <!-- 页面头部 -->
    <div class="analytics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>AI高级分析系统</h1>
          <p>基于人工智能的深度数据分析和预测</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleStartAnalysis">
            <el-icon><DataAnalysis /></el-icon>
            开始分析
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI分析能力概览 -->
    <div class="ai-capabilities">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="capability-card">
            <div class="capability-content">
              <div class="capability-icon prediction">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="capability-info">
                <div class="capability-value">96.2%</div>
                <div class="capability-label">预测准确率</div>
                <div class="capability-detail">LSTM深度学习模型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="capability-card">
            <div class="capability-content">
              <div class="capability-icon nlp">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="capability-info">
                <div class="capability-value">94.2%</div>
                <div class="capability-label">NLP分析精度</div>
                <div class="capability-detail">BERT多语言模型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="capability-card">
            <div class="capability-content">
              <div class="capability-icon anomaly">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="capability-info">
                <div class="capability-value">98.3%</div>
                <div class="capability-label">异常检测精度</div>
                <div class="capability-detail">Autoencoder模型</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="capability-card">
            <div class="capability-content">
              <div class="capability-icon satisfaction">
                <el-icon><Star /></el-icon>
              </div>
              <div class="capability-info">
                <div class="capability-value">92.1%</div>
                <div class="capability-label">用户满意度</div>
                <div class="capability-detail">GPT-4智能回复</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分析模块选择 -->
    <div class="analysis-modules">
      <el-card shadow="never">
        <template #header>
          <span>AI分析模块</span>
        </template>
        
        <div class="modules-grid">
          <div
            v-for="module in analysisModules"
            :key="module.key"
            class="module-item"
            :class="{ active: selectedModule === module.key }"
            @click="handleModuleSelect(module.key)"
          >
            <div class="module-icon" :class="module.color">
              <el-icon>
                <component :is="module.icon" />
              </el-icon>
            </div>
            <div class="module-content">
              <h4>{{ module.title }}</h4>
              <p>{{ module.description }}</p>
              <div class="module-stats">
                <span class="module-accuracy">准确率{{ module.accuracy }}%</span>
                <span class="module-status" :class="module.statusClass">
                  {{ module.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分析控制面板 -->
    <div class="analysis-controls">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>分析控制面板</span>
            <el-select v-model="analysisTimeRange" size="small" style="width: 120px">
              <el-option label="近7天" value="7d" />
              <el-option label="近30天" value="30d" />
              <el-option label="近3个月" value="3m" />
              <el-option label="近1年" value="1y" />
            </el-select>
          </div>
        </template>
        
        <div class="controls-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="control-group">
                <h4>数据源选择</h4>
                <el-checkbox-group v-model="selectedDataSources">
                  <el-checkbox label="student">学生数据</el-checkbox>
                  <el-checkbox label="teacher">教师数据</el-checkbox>
                  <el-checkbox label="parent">家长数据</el-checkbox>
                  <el-checkbox label="customer">客户数据</el-checkbox>
                  <el-checkbox label="financial">财务数据</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="control-group">
                <h4>分析类型</h4>
                <el-radio-group v-model="analysisType">
                  <el-radio label="predictive">预测分析</el-radio>
                  <el-radio label="descriptive">描述性分析</el-radio>
                  <el-radio label="prescriptive">规范性分析</el-radio>
                </el-radio-group>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="control-group">
                <h4>输出格式</h4>
                <el-select v-model="outputFormat" placeholder="选择输出格式">
                  <el-option label="可视化报告" value="visual" />
                  <el-option label="数据表格" value="table" />
                  <el-option label="JSON数据" value="json" />
                  <el-option label="PDF报告" value="pdf" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 分析结果展示 -->
    <div class="analysis-results">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <span>分析结果</span>
            <div class="result-actions">
              <el-button size="small" @click="handleExportResults" :disabled="!hasResults">
                导出结果
              </el-button>
              <el-button size="small" @click="handleSaveAnalysis" :disabled="!hasResults">
                保存分析
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-loading="analyzing" class="results-content">
          <div v-if="!hasResults" class="no-results">
            <el-icon :size="64" color="var(--text-placeholder)"><DataAnalysis /></el-icon>
            <p>请选择分析模块并开始分析</p>
            <p class="hint">AI将为您提供深度数据洞察和预测</p>
          </div>
          
          <div v-else class="results-display">
            <!-- 预测分析结果 -->
            <div v-if="analysisResults.predictions" class="result-section">
              <h4>预测分析结果</h4>
              <div class="predictions-grid">
                <div
                  v-for="prediction in analysisResults.predictions"
                  :key="prediction.metric"
                  class="prediction-item"
                >
                  <div class="prediction-metric">{{ prediction.metric }}</div>
                  <div class="prediction-value">{{ prediction.value }}</div>
                  <div class="prediction-confidence">
                    置信度: {{ prediction.confidence }}%
                  </div>
                  <div class="prediction-trend" :class="prediction.trendClass">
                    <el-icon><component :is="prediction.trendIcon" /></el-icon>
                    {{ prediction.trend }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 异常检测结果 -->
            <div v-if="analysisResults.anomalies" class="result-section">
              <h4>异常检测结果</h4>
              <div class="anomalies-list">
                <div
                  v-for="anomaly in analysisResults.anomalies"
                  :key="anomaly.id"
                  class="anomaly-item"
                  :class="anomaly.severity"
                >
                  <div class="anomaly-icon">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="anomaly-content">
                    <div class="anomaly-title">{{ anomaly.title }}</div>
                    <div class="anomaly-description">{{ anomaly.description }}</div>
                    <div class="anomaly-meta">
                      <span>严重程度: {{ anomaly.severity }}</span>
                      <span>检测时间: {{ formatDateTime(anomaly.detectedAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 智能建议 -->
            <div v-if="analysisResults.recommendations" class="result-section">
              <h4>AI智能建议</h4>
              <div class="recommendations-list">
                <div
                  v-for="recommendation in analysisResults.recommendations"
                  :key="recommendation.id"
                  class="recommendation-item"
                >
                  <div class="recommendation-priority" :class="recommendation.priority">
                    {{ getPriorityText(recommendation.priority) }}
                  </div>
                  <div class="recommendation-content">
                    <div class="recommendation-title">{{ recommendation.title }}</div>
                    <div class="recommendation-description">{{ recommendation.description }}</div>
                    <div class="recommendation-impact">
                      预期影响: {{ recommendation.expectedImpact }}
                    </div>
                  </div>
                  <div class="recommendation-actions">
                    <el-button size="small" type="primary">
                      采纳建议
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- AI模型状态 -->
    <div class="model-status">
      <el-card shadow="never">
        <template #header>
          <span>AI模型状态</span>
        </template>
        
        <div class="models-grid">
          <div
            v-for="model in aiModels"
            :key="model.id"
            class="model-item"
            :class="{ active: model.status === 'active' }"
          >
            <div class="model-info">
              <div class="model-name">{{ model.name }}</div>
              <div class="model-type">{{ model.type }}</div>
            </div>
            <div class="model-metrics">
              <div class="metric">
                <span class="metric-label">准确率</span>
                <span class="metric-value">{{ model.accuracy }}%</span>
              </div>
              <div class="metric">
                <span class="metric-label">延迟</span>
                <span class="metric-value">{{ model.latency }}ms</span>
              </div>
            </div>
            <div class="model-status-indicator">
              <el-tag :type="getModelStatusType(model.status)" size="small">
                {{ getModelStatusText(model.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, ChatDotRound, Warning, Star, DataAnalysis,
  Refresh, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { formatDateTime } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const analyzing = ref(false)
const selectedModule = ref('prediction')
const analysisTimeRange = ref('30d')
const selectedDataSources = ref(['student', 'teacher'])
const analysisType = ref('predictive')
const outputFormat = ref('visual')
const hasResults = ref(false)

// 分析模块
const analysisModules = ref([
  {
    key: 'prediction',
    title: '预测分析',
    description: '基于LSTM深度学习的趋势预测',
    icon: 'TrendCharts',
    color: 'blue',
    accuracy: 96.2,
    status: '运行中',
    statusClass: 'active'
  },
  {
    key: 'nlp',
    title: 'NLP分析',
    description: '自然语言处理和情感分析',
    icon: 'ChatDotRound',
    color: 'green',
    accuracy: 94.2,
    status: '运行中',
    statusClass: 'active'
  },
  {
    key: 'anomaly',
    title: '异常检测',
    description: 'Autoencoder异常模式识别',
    icon: 'Warning',
    color: 'orange',
    accuracy: 98.3,
    status: '运行中',
    statusClass: 'active'
  },
  {
    key: 'recommendation',
    title: '智能推荐',
    description: '基于协同过滤的个性化推荐',
    icon: 'Star',
    color: 'purple',
    accuracy: 89.7,
    status: '运行中',
    statusClass: 'active'
  }
])

// 分析结果
const analysisResults = reactive({
  predictions: [],
  anomalies: [],
  recommendations: []
})

// AI模型状态
const aiModels = ref([
  {
    id: 1,
    name: 'LSTM预测模型',
    type: '深度学习',
    accuracy: 96.2,
    latency: 45,
    status: 'active'
  },
  {
    id: 2,
    name: 'BERT-NLP模型',
    type: '自然语言处理',
    accuracy: 94.2,
    latency: 120,
    status: 'active'
  },
  {
    id: 3,
    name: 'Autoencoder异常检测',
    type: '异常检测',
    accuracy: 98.3,
    latency: 35,
    status: 'active'
  },
  {
    id: 4,
    name: 'GPT-4智能回复',
    type: '生成式AI',
    accuracy: 92.1,
    latency: 200,
    status: 'maintenance'
  }
])

// 方法
const handleModuleSelect = (moduleKey: string) => {
  selectedModule.value = moduleKey
}

const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

const handleStartAnalysis = async () => {
  if (selectedDataSources.value.length === 0) {
    ElMessage.warning('请至少选择一个数据源')
    return
  }
  
  analyzing.value = true
  try {
    // 模拟AI分析过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 生成模拟分析结果
    generateMockResults()
    hasResults.value = true
    
    ElMessage.success('AI分析完成')
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}

const generateMockResults = () => {
  // 生成预测结果
  analysisResults.predictions = [
    {
      metric: '下月招生人数',
      value: '85-95人',
      confidence: 92,
      trend: '+12.5%',
      trendClass: 'positive',
      trendIcon: 'ArrowUp'
    },
    {
      metric: '学生满意度',
      value: '4.7/5.0',
      confidence: 88,
      trend: '+0.3',
      trendClass: 'positive',
      trendIcon: 'ArrowUp'
    },
    {
      metric: '教师工作效率',
      value: '89.2%',
      confidence: 95,
      trend: '-2.1%',
      trendClass: 'negative',
      trendIcon: 'ArrowDown'
    }
  ]
  
  // 生成异常检测结果
  analysisResults.anomalies = [
    {
      id: 1,
      title: '异常退费率增长',
      description: '本月退费率较上月增长35%，建议关注服务质量',
      severity: 'high',
      detectedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: '教师出勤率下降',
      description: '部分教师出勤率低于正常水平，可能影响教学质量',
      severity: 'medium',
      detectedAt: new Date().toISOString()
    }
  ]
  
  // 生成智能建议
  analysisResults.recommendations = [
    {
      id: 1,
      title: '优化招生策略',
      description: '建议加强线上推广投入，预计可提升招生转化率15%',
      priority: 'high',
      expectedImpact: '招生人数+15%'
    },
    {
      id: 2,
      title: '改善教师培训',
      description: '针对工作效率较低的教师提供专项培训',
      priority: 'medium',
      expectedImpact: '教学质量+10%'
    }
  ]
}

const getPriorityText = (priority: string) => {
  const priorityMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  }
  return priorityMap[priority] || '未知'
}

const getModelStatusType = (status: string) => {
  const statusMap = {
    'active': 'success',
    'maintenance': 'warning',
    'error': 'danger',
    'inactive': 'info'
  }
  return statusMap[status] || 'info'
}

const getModelStatusText = (status: string) => {
  const statusMap = {
    'active': '运行中',
    'maintenance': '维护中',
    'error': '错误',
    'inactive': '未激活'
  }
  return statusMap[status] || '未知状态'
}

const handleExportResults = () => {
  ElMessage.info('导出功能开发中')
}

const handleSaveAnalysis = () => {
  ElMessage.info('保存功能开发中')
}

// 生命周期
onMounted(() => {
  // 初始化页面
})
</script>

<style lang="scss">
.advanced-analytics-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.analytics-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.ai-capabilities {
  margin-bottom: var(--text-3xl);
  
  .capability-card {
    .capability-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .capability-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.prediction {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.nlp {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.anomaly {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.satisfaction {
          background: #fef3c7;
          color: #d97706;
        }
      }
      
      .capability-info {
        flex: 1;
        
        .capability-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .capability-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .capability-detail {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.analysis-modules {
  margin-bottom: var(--text-3xl);
  
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-lg);
    
    .module-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover,
      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--accent-enrollment-light);
      }
      
      .module-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        
        &.blue {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.green {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.orange {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.purple {
          background: #faf5ff;
          color: #a855f7;
        }
      }
      
      .module-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-lg);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }
        
        p {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        .module-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--text-sm);
          
          .module-accuracy {
            color: var(--success-color);
            font-weight: 500;
          }
          
          .module-status {
            &.active {
              color: var(--success-color);
            }
          }
        }
      }
    }
  }
}

.analysis-controls {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .controls-content {
    .control-group {
      h4 {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--color-gray-700);
        margin: 0 0 var(--text-sm) 0;
      }
    }
  }
}

.analysis-results {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .result-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
  
  .no-results {
    text-align: center;
    padding: var(--spacing-15xl) var(--text-2xl);
    color: var(--text-tertiary);
    
    p {
      margin-top: var(--text-lg);
      
      &.hint {
        font-size: var(--text-base);
        color: var(--border-color);
      }
    }
  }
  
  .results-display {
    .result-section {
      margin-bottom: var(--spacing-3xl);
      
      h4 {
        font-size: var(--text-lg);
        font-weight: 500;
        color: var(--text-primary);
        margin: 0 0 var(--text-lg) 0;
        padding-bottom: var(--spacing-sm);
        border-bottom: var(--border-width-base) solid #f3f4f6;
      }
    }
    
    .predictions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-lg);
      
      .prediction-item {
        padding: var(--text-lg);
        background: #f9fafb;
        border-radius: var(--spacing-sm);
        
        .prediction-metric {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .prediction-value {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .prediction-confidence {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-bottom: var(--spacing-sm);
        }
        
        .prediction-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 500;
          
          &.positive {
            color: var(--success-color);
          }
          
          &.negative {
            color: var(--danger-color);
          }
        }
      }
    }
    
    .anomalies-list {
      .anomaly-item {
        display: flex;
        gap: var(--text-sm);
        padding: var(--text-lg);
        margin-bottom: var(--text-sm);
        border-radius: var(--spacing-sm);
        
        &.high {
          background: #fef2f2;
          border-left: var(--spacing-xs) solid var(--danger-color);
        }
        
        &.medium {
          background: #fefbf2;
          border-left: var(--spacing-xs) solid var(--warning-color);
        }
        
        .anomaly-icon {
          color: var(--warning-color);
        }
        
        .anomaly-content {
          flex: 1;
          
          .anomaly-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }
          
          .anomaly-description {
            font-size: var(--text-base);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }
          
          .anomaly-meta {
            display: flex;
            gap: var(--text-lg);
            font-size: var(--text-sm);
            color: var(--text-tertiary);
          }
        }
      }
    }
    
    .recommendations-list {
      .recommendation-item {
        display: flex;
        gap: var(--text-lg);
        padding: var(--text-lg);
        margin-bottom: var(--text-sm);
        background: #f9fafb;
        border-radius: var(--spacing-sm);
        
        .recommendation-priority {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          font-size: var(--text-sm);
          font-weight: 500;
          
          &.high {
            background: #fef2f2;
            color: #dc2626;
          }
          
          &.medium {
            background: #fefbf2;
            color: #d97706;
          }
        }
        
        .recommendation-content {
          flex: 1;
          
          .recommendation-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
          }
          
          .recommendation-description {
            font-size: var(--text-base);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }
          
          .recommendation-impact {
            font-size: var(--text-sm);
            color: var(--success-color);
            font-weight: 500;
          }
        }
        
        .recommendation-actions {
          display: flex;
          align-items: center;
        }
      }
    }
  }
}

.model-status {
  .models-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-lg);
    
    .model-item {
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--spacing-sm);
      
      &.active {
        border-color: var(--success-color);
        background: #f0fdf4;
      }
      
      .model-info {
        margin-bottom: var(--text-sm);
        
        .model-name {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .model-type {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
      
      .model-metrics {
        display: flex;
        gap: var(--text-lg);
        margin-bottom: var(--text-sm);
        
        .metric {
          .metric-label {
            font-size: var(--text-sm);
            color: var(--text-tertiary);
            display: block;
          }
          
          .metric-value {
            font-weight: 500;
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .advanced-analytics-container {
    padding: var(--text-lg);
  }
  
  .analytics-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .ai-capabilities {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-content {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .predictions-grid {
    grid-template-columns: 1fr;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
}
</style>
