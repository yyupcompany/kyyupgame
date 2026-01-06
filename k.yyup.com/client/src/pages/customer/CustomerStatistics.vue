<template>
  <div class="customer-statistics-container">
    <!-- 页面头部 -->
    <div class="statistics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>客户统计</h1>
          <p>全面分析客户数据和转化情况</p>
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
                <div class="metric-label">客户总数</div>
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
              <div class="metric-icon converted">
                <UnifiedIcon name="Check" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.converted }}</div>
                <div class="metric-label">成交客户</div>
                <div class="metric-detail">转化率{{ statistics.conversionRate }}%</div>
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
                <div class="metric-label">潜在客户</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.potential, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon follow">
                <UnifiedIcon name="default" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.pendingFollow }}</div>
                <div class="metric-label">待跟进</div>
                <div class="metric-detail">需要关注</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计图表 -->
    <div class="statistics-charts">
      <el-row :gutter="20">
        <!-- 客户类型分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>客户类型分布</span>
                <el-tag size="small">{{ statistics.total }}位客户</el-tag>
              </div>
            </template>
            
            <div class="type-chart">
              <div class="type-item potential">
                <div class="type-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="type-info">
                  <div class="type-count">{{ statistics.potential }}</div>
                  <div class="type-label">潜在客户</div>
                  <div class="type-percentage">{{ getPercentage(statistics.potential, statistics.total) }}%</div>
                </div>
              </div>
              
              <div class="type-item enrolled">
                <div class="type-icon">
                  <UnifiedIcon name="Check" />
                </div>
                <div class="type-info">
                  <div class="type-count">{{ statistics.enrolled }}</div>
                  <div class="type-label">已入园</div>
                  <div class="type-percentage">{{ getPercentage(statistics.enrolled, statistics.total) }}%</div>
                </div>
              </div>
              
              <div class="type-item graduated">
                <div class="type-icon">
                  <UnifiedIcon name="default" />
                </div>
                <div class="type-info">
                  <div class="type-count">{{ statistics.graduated }}</div>
                  <div class="type-label">已毕业</div>
                  <div class="type-percentage">{{ getPercentage(statistics.graduated, statistics.total) }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 客户来源分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>客户来源分布</span>
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
        
        <!-- 跟进状态统计 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>跟进状态统计</span>
            </template>
            
            <div class="follow-stats">
              <div class="follow-item">
                <div class="follow-label">待跟进</div>
                <div class="follow-value">{{ followStats.pending }}人</div>
                <div class="follow-bar">
                  <el-progress
                    :percentage="getPercentage(followStats.pending, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--warning-color)"
                  />
                </div>
              </div>
              
              <div class="follow-item">
                <div class="follow-label">跟进中</div>
                <div class="follow-value">{{ followStats.following }}人</div>
                <div class="follow-bar">
                  <el-progress
                    :percentage="getPercentage(followStats.following, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--primary-color)"
                  />
                </div>
              </div>
              
              <div class="follow-item">
                <div class="follow-label">已成交</div>
                <div class="follow-value">{{ followStats.converted }}人</div>
                <div class="follow-bar">
                  <el-progress
                    :percentage="getPercentage(followStats.converted, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--success-color)"
                  />
                </div>
              </div>
              
              <div class="follow-item">
                <div class="follow-label">已流失</div>
                <div class="follow-value">{{ followStats.lost }}人</div>
                <div class="follow-bar">
                  <el-progress
                    :percentage="getPercentage(followStats.lost, statistics.total)"
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

    <!-- 转化漏斗分析 -->
    <div class="conversion-funnel">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>客户转化漏斗</span>
            <el-select v-model="funnelPeriod" size="small" style="max-max-max-width: 120px; width: 100%; width: 100%; width: 100%">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年度" value="year" />
            </el-select>
          </div>
        </template>
        
        <div class="funnel-content">
          <div class="funnel-stage">
            <div class="stage-info">
              <div class="stage-title">初次接触</div>
              <div class="stage-count">{{ funnelData.contact }}</div>
              <div class="stage-rate">100%</div>
            </div>
            <div class="stage-bar">
              <div class="stage-progress" style="width: 100%"></div>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="stage-info">
              <div class="stage-title">产生兴趣</div>
              <div class="stage-count">{{ funnelData.interest }}</div>
              <div class="stage-rate">{{ getPercentage(funnelData.interest, funnelData.contact) }}%</div>
            </div>
            <div class="stage-bar">
              <div class="stage-progress" :style="{ width: getPercentage(funnelData.interest, funnelData.contact) + '%' }"></div>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="stage-info">
              <div class="stage-title">深度沟通</div>
              <div class="stage-count">{{ funnelData.communication }}</div>
              <div class="stage-rate">{{ getPercentage(funnelData.communication, funnelData.contact) }}%</div>
            </div>
            <div class="stage-bar">
              <div class="stage-progress" :style="{ width: getPercentage(funnelData.communication, funnelData.contact) + '%' }"></div>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="stage-info">
              <div class="stage-title">试听体验</div>
              <div class="stage-count">{{ funnelData.trial }}</div>
              <div class="stage-rate">{{ getPercentage(funnelData.trial, funnelData.contact) }}%</div>
            </div>
            <div class="stage-bar">
              <div class="stage-progress" :style="{ width: getPercentage(funnelData.trial, funnelData.contact) + '%' }"></div>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="stage-info">
              <div class="stage-title">成功转化</div>
              <div class="stage-count">{{ funnelData.conversion }}</div>
              <div class="stage-rate">{{ getPercentage(funnelData.conversion, funnelData.contact) }}%</div>
            </div>
            <div class="stage-bar">
              <div class="stage-progress" :style="{ width: getPercentage(funnelData.conversion, funnelData.contact) + '%' }"></div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 趋势分析 -->
    <div class="trend-analysis">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span>客户数量趋势</span>
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
            <p>客户数量趋势图表</p>
            <p class="chart-description">显示{{ trendPeriod }}内客户数量变化趋势</p>
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
          <el-button @click="handleViewCustomers">
            <UnifiedIcon name="eye" />
            查看客户列表
          </el-button>
          
          <el-button @click="handleAddCustomer">
            <UnifiedIcon name="Plus" />
            添加新客户
          </el-button>
          
          <el-button @click="handleCustomerAnalytics">
            <UnifiedIcon name="default" />
            客户分析
          </el-button>
          
          <el-button @click="handleFollowUp">
            <UnifiedIcon name="default" />
            跟进管理
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
  User, Check, Clock, Phone, Trophy, TrendCharts,
  View, Plus, DataAnalysis, Refresh, Download
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const funnelPeriod = ref('month')
const trendPeriod = ref('30d')
const trendChartRef = ref()

// 统计数据
const statistics = reactive({
  total: 0,
  converted: 0,
  potential: 0,
  enrolled: 0,
  graduated: 0,
  pendingFollow: 0,
  conversionRate: 0,
  totalGrowth: 0
})

// 来源分布数据
const sourceDistribution = ref([
  { source: '线上推广', count: 0 },
  { source: '朋友推荐', count: 0 },
  { source: '地推活动', count: 0 },
  { source: '电话营销', count: 0 },
  { source: '其他渠道', count: 0 }
])

// 跟进状态统计数据
const followStats = reactive({
  pending: 0,
  following: 0,
  converted: 0,
  lost: 0
})

// 转化漏斗数据
const funnelData = reactive({
  contact: 0,
  interest: 0,
  communication: 0,
  trial: 0,
  conversion: 0
})

// 方法
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const loadStatistics = async () => {
  loading.value = true
  try {
    // 尝试从客户API获取统计数据
    const response = await get('/api/customers/stats')
    
    if (response.success && response.data) {
      const data = response.data
      Object.assign(statistics, {
        total: data.total || 0,
        converted: data.byStatus?.CONVERTED || 0,
        potential: data.byType?.POTENTIAL || 0,
        enrolled: data.byType?.ENROLLED || 0,
        graduated: data.byType?.GRADUATED || 0,
        pendingFollow: data.pendingFollow || 0,
        conversionRate: data.conversionRate || 0,
        totalGrowth: 18.5 // 模拟增长率
      })
      
      // 更新来源分布数据
      if (data.bySource) {
        sourceDistribution.value = Object.entries(data.bySource).map(([source, count]) => ({
          source,
          count: count as number
        }))
      }
    } else {
      // 使用模拟数据
      Object.assign(statistics, {
        total: 2768,
        converted: 1234,
        potential: 1156,
        enrolled: 1234,
        graduated: 378,
        pendingFollow: 456,
        conversionRate: 44.6,
        totalGrowth: 18.5
      })
      
      // 模拟来源分布数据
      sourceDistribution.value = [
        { source: '线上推广', count: 985 },
        { source: '朋友推荐', count: 756 },
        { source: '地推活动', count: 523 },
        { source: '电话营销', count: 345 },
        { source: '其他渠道', count: 159 }
      ]
    }
    
    // 模拟跟进状态数据
    Object.assign(followStats, {
      pending: Math.floor(statistics.total * 0.16),
      following: Math.floor(statistics.total * 0.28),
      converted: Math.floor(statistics.total * 0.45),
      lost: Math.floor(statistics.total * 0.11)
    })
    
    // 模拟转化漏斗数据
    Object.assign(funnelData, {
      contact: 3500,
      interest: 2800,
      communication: 2100,
      trial: 1650,
      conversion: 1234
    })
    
  } catch (error) {
    console.error('加载客户统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    
    // 使用模拟数据作为后备
    Object.assign(statistics, {
      total: 2768,
      converted: 1234,
      potential: 1156,
      enrolled: 1234,
      graduated: 378,
      pendingFollow: 456,
      conversionRate: 44.6,
      totalGrowth: 18.5
    })
    
    sourceDistribution.value = [
      { source: '线上推广', count: 985 },
      { source: '朋友推荐', count: 756 },
      { source: '地推活动', count: 523 },
      { source: '电话营销', count: 345 },
      { source: '其他渠道', count: 159 }
    ]
    
    Object.assign(followStats, {
      pending: 456,
      following: 785,
      converted: 1234,
      lost: 293
    })
    
    Object.assign(funnelData, {
      contact: 3500,
      interest: 2800,
      communication: 2100,
      trial: 1650,
      conversion: 1234
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

const handleViewCustomers = () => {
  router.push('/customer')
}

const handleAddCustomer = () => {
  router.push('/customer/create')
}

const handleCustomerAnalytics = () => {
  router.push('/customer/analytics')
}

const handleFollowUp = () => {
  ElMessage.info('跟进管理功能开发中')
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss">
.customer-statistics-container {
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
        
        &.converted {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.potential {
          background: #fefbf2;
          color: var(--warning-color);
        }
        
        &.follow {
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
  
  .type-chart {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);
    
    .type-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-sm);
      border-radius: var(--spacing-sm);
      
      &.potential {
        background: #fefbf2;
        
        .type-icon {
          background: var(--warning-color);
          color: white;
        }
      }
      
      &.enrolled {
        background: #f0fdf4;
        
        .type-icon {
          background: var(--success-color);
          color: white;
        }
      }
      
      &.graduated {
        background: #fef3c7;
        
        .type-icon {
          background: #d97706;
          color: white;
        }
      }
      
      .type-icon {
        width: var(--spacing-3xl);
        height: var(--spacing-3xl);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-lg);
      }
      
      .type-info {
        .type-count {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .type-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        
        .type-percentage {
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
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
        
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
  
  .follow-stats {
    .follow-item {
      margin-bottom: var(--text-2xl);
      
      .follow-label {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
      
      .follow-value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
    }
  }
}

.conversion-funnel {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .funnel-content {
    .funnel-stage {
      display: flex;
      align-items: center;
      gap: var(--text-2xl);
      margin-bottom: var(--text-lg);
      
      .stage-info {
        width: 120px;
        
        .stage-title {
          font-size: var(--text-base);
          color: var(--color-gray-700);
          margin-bottom: var(--spacing-xs);
        }
        
        .stage-count {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .stage-rate {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
      
      .stage-bar {
        flex: 1;
        height: var(--text-3xl);
        background: #f3f4f6;
        border-radius: var(--text-sm);
        overflow: hidden;
        
        .stage-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), #1d4ed8);
          transition: width 0.3s ease;
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
  .customer-statistics-container {
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
  
  .type-chart {
    .type-item {
      padding: var(--spacing-sm);
    }
  }
  
  .funnel-content {
    .funnel-stage {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: flex-start;
      
      .stage-info {
        width: 100%;
      }
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
