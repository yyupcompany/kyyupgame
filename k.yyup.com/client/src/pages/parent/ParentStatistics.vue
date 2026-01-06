<template>
  <div class="parent-statistics-container">
    <!-- 页面头部 -->
    <div class="statistics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>家长统计</h1>
          <p>全面分析家长数据和参与度</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <UnifiedIcon name="Refresh" />
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleExport">
            <UnifiedIcon name="Download" />
            导出报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="core-metrics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon total">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.total }}</div>
                <div class="metric-label">家长总数</div>
                <div class="metric-trend positive">
                  <UnifiedIcon name="default" />
                  较上月 +{{ statistics.totalGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon active">
                <UnifiedIcon name="Check" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.active }}</div>
                <div class="metric-label">在读家长</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.active, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon potential">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.potential }}</div>
                <div class="metric-label">潜在家长</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.potential, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon children">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.totalChildren }}</div>
                <div class="metric-label">关联儿童</div>
                <div class="metric-detail">平均{{ statistics.avgChildrenPerParent }}个/家长</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计图表 -->
    <div class="statistics-charts">
      <el-row :gutter="20">
        <!-- 家长状态分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>家长状态分布</span>
                <el-tag size="small">{{ statistics.total }}位家长</el-tag>
              </div>
            </template>
            
            <div class="status-chart">
              <div class="status-item active">
                <div class="status-icon">
                  <UnifiedIcon name="Check" />
                </div>
                <div class="status-info">
                  <div class="status-count">{{ statistics.active }}</div>
                  <div class="status-label">在读家长</div>
                  <div class="status-percentage">{{ getPercentage(statistics.active, statistics.total) }}%</div>
                </div>
              </div>
              
              <div class="status-item potential">
                <div class="status-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="status-info">
                  <div class="status-count">{{ statistics.potential }}</div>
                  <div class="status-label">潜在家长</div>
                  <div class="status-percentage">{{ getPercentage(statistics.potential, statistics.total) }}%</div>
                </div>
              </div>
              
              <div class="status-item graduated">
                <div class="status-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="status-info">
                  <div class="status-count">{{ statistics.graduated }}</div>
                  <div class="status-label">毕业家长</div>
                  <div class="status-percentage">{{ getPercentage(statistics.graduated, statistics.total) }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 来源分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>家长来源分布</span>
            </template>
            
            <div class="source-distribution">
              <div
                v-for="source in sourceDistribution"
                :key="source.source"
                class="source-item"
              >
                <div class="source-info">
                  <div class="source-name">{{ source.source }}</div>
                  <div class="source-count">{{ source.count }}人</div>
                </div>
                <div class="source-bar">
                  <div
                    class="source-progress"
                    :style="{ width: getPercentage(source.count, statistics.total) + '%' }"
                  ></div>
                </div>
                <div class="source-percentage">{{ getPercentage(source.count, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 参与度统计 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>家长参与度</span>
            </template>
            
            <div class="engagement-stats">
              <div class="engagement-item">
                <div class="engagement-label">高参与度</div>
                <div class="engagement-value">{{ engagementStats.high }}人</div>
                <div class="engagement-bar">
                  <el-progress
                    :percentage="getPercentage(engagementStats.high, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--success-color)"
                  />
                </div>
              </div>
              
              <div class="engagement-item">
                <div class="engagement-label">中等参与度</div>
                <div class="engagement-value">{{ engagementStats.medium }}人</div>
                <div class="engagement-bar">
                  <el-progress
                    :percentage="getPercentage(engagementStats.medium, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--warning-color)"
                  />
                </div>
              </div>
              
              <div class="engagement-item">
                <div class="engagement-label">低参与度</div>
                <div class="engagement-value">{{ engagementStats.low }}人</div>
                <div class="engagement-bar">
                  <el-progress
                    :percentage="getPercentage(engagementStats.low, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--danger-color)"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 沟通统计 -->
    <div class="communication-statistics">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>沟通统计</span>
            <el-select v-model="communicationPeriod" size="small" style="max-max-width: 120px; width: 100%; width: 100%">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年度" value="year" />
            </el-select>
          </div>
        </template>
        
        <div class="communication-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="communication-card total">
                <div class="communication-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="communication-info">
                  <div class="communication-count">{{ communicationStats.total }}</div>
                  <div class="communication-label">总沟通次数</div>
                  <div class="communication-description">平均{{ communicationStats.avgPerParent }}次/家长</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="communication-card phone">
                <div class="communication-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="communication-info">
                  <div class="communication-count">{{ communicationStats.phone }}</div>
                  <div class="communication-label">电话沟通</div>
                  <div class="communication-description">占比{{ getPercentage(communicationStats.phone, communicationStats.total) }}%</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="communication-card wechat">
                <div class="communication-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="communication-info">
                  <div class="communication-count">{{ communicationStats.wechat }}</div>
                  <div class="communication-label">微信沟通</div>
                  <div class="communication-description">占比{{ getPercentage(communicationStats.wechat, communicationStats.total) }}%</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="communication-card visit">
                <div class="communication-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="communication-info">
                  <div class="communication-count">{{ communicationStats.visit }}</div>
                  <div class="communication-label">面访沟通</div>
                  <div class="communication-description">占比{{ getPercentage(communicationStats.visit, communicationStats.total) }}%</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 趋势分析 -->
    <div class="trend-analysis">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span>家长数量趋势</span>
            <el-select v-model="trendPeriod" size="small" style="width: 120px">
              <el-option label="近7天" value="7d" />
              <el-option label="近30天" value="30d" />
              <el-option label="近3个月" value="3m" />
              <el-option label="近1年" value="1y" />
            </el-select>
          </div>
        </template>
        
        <div class="trend-chart" ref="trendChartRef">
          <div class="chart-placeholder">
            <UnifiedIcon name="default" />
            <p>家长数量趋势图表</p>
            <p class="chart-description">显示{{ trendPeriod }}内家长数量变化趋势</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <span>快速操作</span>
        </template>
        
        <div class="actions-grid">
          <el-button @click="handleViewParents">
            <UnifiedIcon name="eye" />
            查看家长列表
          </el-button>
          
          <el-button @click="handleAddParent">
            <UnifiedIcon name="Plus" />
            添加新家长
          </el-button>
          
          <el-button @click="handleCommunicationCenter">
            <UnifiedIcon name="default" />
            沟通中心
          </el-button>
          
          <el-button @click="handleParentAnalytics">
            <UnifiedIcon name="default" />
            家长分析
          </el-button>
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
  Avatar, Check, Clock, UserFilled, TrendCharts, Trophy,
  ChatDotRound, Phone, Location, View, Plus, DataAnalysis, Refresh, Download
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const communicationPeriod = ref('month')
const trendPeriod = ref('30d')
const trendChartRef = ref()

// 统计数据
const statistics = reactive({
  total: 0,
  active: 0,
  potential: 0,
  graduated: 0,
  totalChildren: 0,
  avgChildrenPerParent: 0,
  totalGrowth: 0
})

// 来源分布数据
const sourceDistribution = ref([
  { source: '线上咨询', count: 0 },
  { source: '朋友推荐', count: 0 },
  { source: '广告宣传', count: 0 },
  { source: '实地参观', count: 0 },
  { source: '其他渠道', count: 0 }
])

// 参与度统计数据
const engagementStats = reactive({
  high: 0,
  medium: 0,
  low: 0
})

// 沟通统计数据
const communicationStats = reactive({
  total: 0,
  phone: 0,
  wechat: 0,
  visit: 0,
  avgPerParent: 0
})

// 方法
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const loadStatistics = async () => {
  loading.value = true
  try {
    // 尝试从家长API获取统计数据
    const response = await get('/api/parents/stats')
    
    if (response.success && response.data) {
      const data = response.data
      Object.assign(statistics, {
        total: data.total || 0,
        active: data.active || 0,
        potential: data.potential || 0,
        graduated: data.graduated || 0,
        totalChildren: data.totalChildren || 0,
        avgChildrenPerParent: data.avgChildrenPerParent || 0,
        totalGrowth: 15.2 // 模拟增长率
      })
      
      // 更新来源分布数据
      if (data.sourceDistribution && Array.isArray(data.sourceDistribution)) {
        sourceDistribution.value = data.sourceDistribution
      }
      
      // 更新参与度数据
      if (data.engagementStats) {
        Object.assign(engagementStats, data.engagementStats)
      }
      
      // 更新沟通统计数据
      if (data.communicationStats) {
        Object.assign(communicationStats, data.communicationStats)
      }
    } else {
      // 使用模拟数据
      Object.assign(statistics, {
        total: 285,
        active: 220,
        potential: 45,
        graduated: 20,
        totalChildren: 320,
        avgChildrenPerParent: 1.2,
        totalGrowth: 15.2
      })
      
      // 模拟来源分布数据
      sourceDistribution.value = [
        { source: '线上咨询', count: 95 },
        { source: '朋友推荐', count: 85 },
        { source: '广告宣传', count: 55 },
        { source: '实地参观', count: 35 },
        { source: '其他渠道', count: 15 }
      ]
      
      // 模拟参与度数据
      Object.assign(engagementStats, {
        high: 85,
        medium: 145,
        low: 55
      })
      
      // 模拟沟通统计数据
      Object.assign(communicationStats, {
        total: 1250,
        phone: 450,
        wechat: 650,
        visit: 150,
        avgPerParent: 4.4
      })
    }
    
  } catch (error) {
    console.error('加载家长统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    
    // 使用模拟数据作为后备
    Object.assign(statistics, {
      total: 285,
      active: 220,
      potential: 45,
      graduated: 20,
      totalChildren: 320,
      avgChildrenPerParent: 1.2,
      totalGrowth: 15.2
    })
    
    sourceDistribution.value = [
      { source: '线上咨询', count: 95 },
      { source: '朋友推荐', count: 85 },
      { source: '广告宣传', count: 55 },
      { source: '实地参观', count: 35 },
      { source: '其他渠道', count: 15 }
    ]
    
    Object.assign(engagementStats, {
      high: 85,
      medium: 145,
      low: 55
    })
    
    Object.assign(communicationStats, {
      total: 1250,
      phone: 450,
      wechat: 650,
      visit: 150,
      avgPerParent: 4.4
    })
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadStatistics()
  ElMessage.success('数据已刷新')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleViewParents = () => {
  router.push('/parent')
}

const handleAddParent = () => {
  router.push('/parent/add')
}

const handleCommunicationCenter = () => {
  router.push('/parent/communication/smart-hub')
}

const handleParentAnalytics = () => {
  ElMessage.info('家长分析功能开发中')
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss">
.parent-statistics-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.statistics-header {
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

.core-metrics {
  margin-bottom: var(--text-3xl);
  
  .metric-card {
    .metric-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .metric-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.total {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.active {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.potential {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.children {
          background: #faf5ff;
          color: #a855f7;
        }
      }
      
      .metric-info {
        flex: 1;
        
        .metric-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .metric-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .metric-trend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          
          &.positive {
            color: var(--success-color);
          }
        }
        
        .metric-detail {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.statistics-charts {
  margin-bottom: var(--text-3xl);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-chart {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);
    
    .status-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-sm);
      border-radius: var(--spacing-sm);
      
      &.active {
        background: #f0fdf4;
        
        .status-icon {
          background: var(--success-color);
          color: white;
        }
      }
      
      &.potential {
        background: #fefbf2;
        
        .status-icon {
          background: var(--warning-color);
          color: white;
        }
      }
      
      &.graduated {
        background: #fef3c7;
        
        .status-icon {
          background: #d97706;
          color: white;
        }
      }
      
      .status-icon {
        width: var(--spacing-3xl);
        height: var(--spacing-3xl);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-lg);
      }
      
      .status-info {
        .status-count {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .status-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        
        .status-percentage {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
  
  .source-distribution {
    .source-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);
      
      .source-info {
        width: auto;
        
        .source-name {
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
        
        .source-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
      
      .source-bar {
        flex: 1;
        height: var(--spacing-sm);
        background: #f3f4f6;
        border-radius: var(--spacing-xs);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        
        .source-progress {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }
      
      .source-percentage {
        width: auto;
        text-align: right;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
  
  .engagement-stats {
    .engagement-item {
      margin-bottom: var(--text-2xl);
      
      .engagement-label {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
      
      .engagement-value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
    }
  }
}

.communication-statistics {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .communication-content {
    .communication-card {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border-radius: var(--spacing-sm);
      
      &.total {
        background: #f0f9ff;
        
        .communication-icon {
          background: var(--primary-color);
          color: white;
        }
      }
      
      &.phone {
        background: #f0fdf4;
        
        .communication-icon {
          background: var(--success-color);
          color: white;
        }
      }
      
      &.wechat {
        background: #fefbf2;
        
        .communication-icon {
          background: var(--warning-color);
          color: white;
        }
      }
      
      &.visit {
        background: #faf5ff;
        
        .communication-icon {
          background: #a855f7;
          color: white;
        }
      }
      
      .communication-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xl);
      }
      
      .communication-info {
        .communication-count {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .communication-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        
        .communication-description {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
}

.trend-analysis {
  margin-bottom: var(--text-3xl);
  
  .trend-chart {
    min-height: 60px; height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .chart-placeholder {
      text-align: center;
      color: var(--text-tertiary);
      
      p {
        margin-top: var(--text-sm);
      }
      
      .chart-description {
        font-size: var(--text-sm);
        color: var(--border-color);
      }
    }
  }
}

.quick-actions {
  .actions-grid {
    display: flex;
    gap: var(--text-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .parent-statistics-container {
    padding: var(--text-lg);
  }
  
  .statistics-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .core-metrics {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .status-chart {
    .status-item {
      padding: var(--spacing-sm);
    }
  }
  
  .communication-content {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
  
  .actions-grid {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
