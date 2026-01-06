<template>
  <div class="predictive-analytics-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="icon-brain"></i>
          AI预测分析
        </h1>
        <p class="page-description">基于机器学习算法的智能预测分析系统</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <i class="icon-refresh"></i>
          刷新数据
        </el-button>
        <el-button @click="exportReport">
          <i class="icon-download"></i>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 预测概览卡片 -->
    <div class="overview-cards">
      <div class="card prediction-card">
        <div class="card-header">
          <h3>招生预测</h3>
          <span class="accuracy-badge">准确率: 94.2%</span>
        </div>
        <div class="card-content">
          <div class="prediction-value">
            <span class="number">{{ enrollmentPrediction }}</span>
            <span class="unit">人</span>
          </div>
          <div class="trend-indicator">
            <i class="icon-trend-up" :class="{ positive: enrollmentTrend > 0 }"></i>
            <span>{{ enrollmentTrend > 0 ? '+' : '' }}{{ enrollmentTrend }}%</span>
          </div>
        </div>
      </div>

      <div class="card prediction-card">
        <div class="card-header">
          <h3>收入预测</h3>
          <span class="accuracy-badge">准确率: 91.8%</span>
        </div>
        <div class="card-content">
          <div class="prediction-value">
            <span class="number">{{ revenuePrediction }}</span>
            <span class="unit">万元</span>
          </div>
          <div class="trend-indicator">
            <i class="icon-trend-up" :class="{ positive: revenueTrend > 0 }"></i>
            <span>{{ revenueTrend > 0 ? '+' : '' }}{{ revenueTrend }}%</span>
          </div>
        </div>
      </div>

      <div class="card prediction-card">
        <div class="card-header">
          <h3>流失率预测</h3>
          <span class="accuracy-badge">准确率: 89.5%</span>
        </div>
        <div class="card-content">
          <div class="prediction-value">
            <span class="number">{{ churnPrediction }}</span>
            <span class="unit">%</span>
          </div>
          <div class="trend-indicator">
            <i class="icon-trend-down" :class="{ negative: churnTrend < 0 }"></i>
            <span>{{ churnTrend > 0 ? '+' : '' }}{{ churnTrend }}%</span>
          </div>
        </div>
      </div>

      <div class="card prediction-card">
        <div class="card-header">
          <h3>满意度预测</h3>
          <span class="accuracy-badge">准确率: 92.1%</span>
        </div>
        <div class="card-content">
          <div class="prediction-value">
            <span class="number">{{ satisfactionPrediction }}</span>
            <span class="unit">分</span>
          </div>
          <div class="trend-indicator">
            <i class="icon-trend-up" :class="{ positive: satisfactionTrend > 0 }"></i>
            <span>{{ satisfactionTrend > 0 ? '+' : '' }}{{ satisfactionTrend }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预测图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>招生趋势预测</h3>
              <div class="chart-controls">
                <el-select v-model="timeRange" @change="updateCharts" size="small">
                  <el-option label="近3个月" value="3months"></el-option>
                  <el-option label="近6个月" value="6months"></el-option>
                  <el-option label="近1年" value="1year"></el-option>
                </el-select>
              </div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="icon-chart-line"></i>
                <p>招生趋势预测图表</p>
                <small>基于历史数据和季节性因素的智能预测</small>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>收入预测分析</h3>
              <div class="chart-controls">
                <el-button size="small" :type="revenueView === 'monthly' ? 'primary' : ''" @click="revenueView = 'monthly'">月度</el-button>
                <el-button size="small" :type="revenueView === 'quarterly' ? 'primary' : ''" @click="revenueView = 'quarterly'">季度</el-button>
              </div>
            </div>
            <div class="chart-content">
              <div class="chart-placeholder">
                <i class="icon-chart-bar"></i>
                <p>收入预测分析图表</p>
                <small>多维度收入预测模型</small>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 预测模型详情 -->
    <div class="model-details-section">
      <div class="section-header">
        <h3>预测模型详情</h3>
        <el-button @click="showModelConfig = !showModelConfig">
          <i class="icon-settings"></i>
          模型配置
        </el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="model in predictionModels" :key="model.id">
          <div class="model-card">
            <div class="model-header">
              <h4>{{ model.name }}</h4>
              <el-tag :type="model.status === 'active' ? 'success' : 'warning'">{{ model.statusText }}</el-tag>
            </div>
            <div class="model-metrics">
              <div class="metric">
                <label>准确率</label>
                <span>{{ model.accuracy }}%</span>
              </div>
              <div class="metric">
                <label>最后训练</label>
                <span>{{ model.lastTrained }}</span>
              </div>
              <div class="metric">
                <label>数据量</label>
                <span>{{ model.dataSize }}</span>
              </div>
            </div>
            <div class="model-actions">
              <el-button size="small" type="primary" @click="retrainModel(model.id)">重新训练</el-button>
              <el-button size="small" @click="viewModelDetails(model.id)">查看详情</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 预测洞察 -->
    <div class="insights-section">
      <h3>AI智能洞察</h3>
      <div class="insights-list">
        <div class="insight-item" v-for="insight in aiInsights" :key="insight.id">
          <div class="insight-icon">
            <i :class="insight.icon"></i>
          </div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.description }}</p>
            <div class="insight-meta">
              <span class="confidence">置信度: {{ insight.confidence }}%</span>
              <span class="impact">影响程度: {{ insight.impact }}</span>
            </div>
          </div>
          <div class="insight-actions">
            <el-button size="small" type="primary" @click="applyInsight(insight.id)">应用建议</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型配置弹窗 -->
    <el-dialog v-model="showModelConfig" title="预测模型配置" width="500px">
      <el-form :model="modelConfig" label-width="100px">
        <el-form-item label="预测周期">
          <el-select v-model="modelConfig.period" style="width: 100%">
            <el-option label="1个月" value="1month"></el-option>
            <el-option label="3个月" value="3months"></el-option>
            <el-option label="6个月" value="6months"></el-option>
            <el-option label="1年" value="1year"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源">
          <el-checkbox-group v-model="modelConfig.dataSources">
            <el-checkbox label="enrollment">招生数据</el-checkbox>
            <el-checkbox label="financial">财务数据</el-checkbox>
            <el-checkbox label="satisfaction">满意度数据</el-checkbox>
            <el-checkbox label="external">外部数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="算法选择">
          <el-select v-model="modelConfig.algorithm" style="width: 100%">
            <el-option label="LSTM神经网络" value="lstm"></el-option>
            <el-option label="ARIMA时间序列" value="arima"></el-option>
            <el-option label="随机森林" value="random_forest"></el-option>
            <el-option label="梯度提升" value="gradient_boost"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showModelConfig = false">取消</el-button>
          <el-button type="primary" @click="saveModelConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PredictiveAnalytics',
  data() {
    return {
      // 预测数据
      enrollmentPrediction: 285,
      enrollmentTrend: 12.5,
      revenuePrediction: 156.8,
      revenueTrend: 8.3,
      churnPrediction: 3.2,
      churnTrend: -1.1,
      satisfactionPrediction: 4.7,
      satisfactionTrend: 2.8,
      
      // 图表控制
      timeRange: '6months',
      revenueView: 'monthly',
      
      // 模型配置
      showModelConfig: false,
      modelConfig: {
        period: '3months',
        dataSources: ['enrollment', 'financial'],
        algorithm: 'lstm'
      },
      
      // 预测模型
      predictionModels: [
        {
          id: 1,
          name: '招生预测模型',
          status: 'active',
          statusText: '运行中',
          accuracy: 94.2,
          lastTrained: '2小时前',
          dataSize: '12.5K'
        },
        {
          id: 2,
          name: '收入预测模型',
          status: 'active',
          statusText: '运行中',
          accuracy: 91.8,
          lastTrained: '4小时前',
          dataSize: '8.3K'
        },
        {
          id: 3,
          name: '流失预测模型',
          status: 'training',
          statusText: '训练中',
          accuracy: 89.5,
          lastTrained: '1天前',
          dataSize: '15.2K'
        }
      ],
      
      // AI洞察
      aiInsights: [
        {
          id: 1,
          icon: 'icon-lightbulb',
          title: '招生高峰期预测',
          description: '基于历史数据分析，预计下月中旬将迎来招生高峰，建议提前准备营销活动。',
          confidence: 92,
          impact: '高'
        },
        {
          id: 2,
          icon: 'icon-warning',
          title: '潜在流失风险',
          description: '检测到部分家长满意度下降，建议加强沟通和服务质量提升。',
          confidence: 87,
          impact: '中'
        },
        {
          id: 3,
          icon: 'icon-target',
          title: '收入优化建议',
          description: '通过调整课程定价策略，预计可提升15%的收入。',
          confidence: 89,
          impact: '高'
        }
      ]
    }
  },
  
  mounted() {
    this.loadPredictionData()
  },
  
  methods: {
    loadPredictionData() {
      console.log('加载预测分析数据...')
    },
    
    refreshData() {
      console.log('刷新预测数据')
      this.$message.success('数据刷新成功')
    },
    
    exportReport() {
      console.log('导出预测报告')
      this.$message.success('报告导出成功')
    },
    
    updateCharts() {
      console.log('更新图表数据，时间范围:', this.timeRange)
    },
    
    retrainModel(modelId) {
      console.log('重新训练模型:', modelId)
      this.$message.success('模型重训练已启动')
    },
    
    viewModelDetails(modelId) {
      console.log('查看模型详情:', modelId)
    },
    
    applyInsight(insightId) {
      console.log('应用AI洞察建议:', insightId)
      this.$message.success('建议已应用')
    },
    
    saveModelConfig() {
      console.log('保存模型配置:', this.modelConfig)
      this.showModelConfig = false
      this.$message.success('模型配置保存成功')
    }
  }
}
</script>

<style scoped>
.predictive-analytics-container {
  padding: var(--text-3xl);
  background: var(--text-primary-light);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3xl);
  background: white;
  padding: var(--text-3xl);
  border-radius: var(--text-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
}

.header-content h1 {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--text-sm);
}

.header-content p {
  color: var(--dark-text-1);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--text-sm);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--text-3xl);
  margin-bottom: var(--spacing-3xl);
}

.prediction-card {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.card-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
}

.accuracy-badge {
  background: var(--success-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.prediction-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: var(--text-sm);
}

.prediction-value .number {
  font-size: var(--spacing-3xl);
  font-weight: 700;
  color: var(--text-primary);
}

.prediction-value .unit {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-base);
  font-weight: 500;
}

.trend-indicator .positive {
  color: var(--success-color);
}

.trend-indicator .negative {
  color: var(--danger-color);
}

.charts-section {
  margin-bottom: var(--spacing-3xl);
}

.chart-container {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.chart-header h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-content {
  min-height: 60px; height: auto;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  text-align: center;
}

.chart-placeholder i {
  font-size: var(--text-5xl);
  margin-bottom: var(--text-lg);
}

.model-details-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
}

.section-header h3 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
}

.model-card {
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  height: 100%;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.model-header h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0;
}

.model-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--text-lg);
  margin-bottom: var(--text-lg);
}

.metric {
  text-align: center;
}

.metric label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.metric span {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-700);
}

.model-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.insights-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-10);
}

.insights-section h3 {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--text-3xl) 0;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--text-lg);
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
}

.insight-icon {
  width: var(--icon-size); height: var(--icon-size);
  background: var(--primary-color);
  border-radius: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-xl);
}

.insight-content {
  flex: 1;
}

.insight-content h4 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--spacing-sm) 0;
}

.insight-content p {
  color: var(--text-secondary);
  margin: 0 0 var(--text-sm) 0;
  line-height: 1.5;
}

.insight-meta {
  display: flex;
  gap: var(--text-lg);
  font-size: var(--text-sm);
}

.insight-meta span {
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .predictive-analytics-container {
    padding: var(--text-lg);
  }

  .page-header {
    flex-direction: column;
    gap: var(--text-lg);
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .insight-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
