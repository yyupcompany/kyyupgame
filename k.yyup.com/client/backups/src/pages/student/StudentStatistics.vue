<template>
  <div class="student-statistics-container">
    <!-- 页面头部 -->
    <div class="statistics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>学生统计</h1>
          <p>全面分析学生数据和趋势</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
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
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.total }}</div>
                <div class="metric-label">学生总数</div>
                <div class="metric-trend positive">
                  <el-icon><TrendCharts /></el-icon>
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
                <el-icon><Check /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.active }}</div>
                <div class="metric-label">在读学生</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.active, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon assigned">
                <el-icon><School /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.assigned }}</div>
                <div class="metric-label">已分班学生</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.assigned, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon unassigned">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.unassigned }}</div>
                <div class="metric-label">待分班学生</div>
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
        <!-- 性别分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>性别分布</span>
                <el-tag size="small">总计{{ statistics.male + statistics.female }}人</el-tag>
              </div>
            </template>
            
            <div class="gender-chart">
              <div class="gender-item">
                <div class="gender-icon male">
                  <el-icon><Male /></el-icon>
                </div>
                <div class="gender-info">
                  <div class="gender-count">{{ statistics.male }}</div>
                  <div class="gender-label">男生</div>
                  <div class="gender-percentage">{{ getPercentage(statistics.male, statistics.male + statistics.female) }}%</div>
                </div>
              </div>
              
              <div class="gender-item">
                <div class="gender-icon female">
                  <el-icon><Female /></el-icon>
                </div>
                <div class="gender-info">
                  <div class="gender-count">{{ statistics.female }}</div>
                  <div class="gender-label">女生</div>
                  <div class="gender-percentage">{{ getPercentage(statistics.female, statistics.male + statistics.female) }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 年龄分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>年龄分布</span>
            </template>
            
            <div class="age-distribution">
              <div
                v-for="age in ageDistribution"
                :key="age.ageGroup"
                class="age-item"
              >
                <div class="age-label">{{ age.ageGroup }}</div>
                <div class="age-bar">
                  <div
                    class="age-progress"
                    :style="{ width: getPercentage(age.count, statistics.total) + '%' }"
                  ></div>
                </div>
                <div class="age-count">{{ age.count }}人</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 班级分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>班级分布</span>
            </template>
            
            <div class="class-distribution">
              <div
                v-for="classItem in classDistribution"
                :key="classItem.className"
                class="class-item"
              >
                <div class="class-info">
                  <div class="class-name">{{ classItem.className }}</div>
                  <div class="class-count">{{ classItem.count }}人</div>
                </div>
                <div class="class-progress">
                  <el-progress
                    :percentage="getPercentage(classItem.count, statistics.assigned)"
                    :show-text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 学生状态统计 -->
    <div class="status-statistics">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>学生状态统计</span>
            <el-radio-group v-model="statusViewType" size="small">
              <el-radio-button label="chart">图表视图</el-radio-button>
              <el-radio-button label="table">表格视图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        
        <div v-if="statusViewType === 'chart'" class="status-chart">
          <div class="status-items">
            <div class="status-item active">
              <div class="status-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-count">{{ statistics.active }}</div>
                <div class="status-label">在读</div>
                <div class="status-percentage">{{ getPercentage(statistics.active, statistics.total) }}%</div>
              </div>
            </div>
            
            <div class="status-item inactive">
              <div class="status-icon">
                <el-icon><Close /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-count">{{ statistics.inactive }}</div>
                <div class="status-label">离园</div>
                <div class="status-percentage">{{ getPercentage(statistics.inactive, statistics.total) }}%</div>
              </div>
            </div>
            
            <div class="status-item assigned">
              <div class="status-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-count">{{ statistics.assigned }}</div>
                <div class="status-label">已分班</div>
                <div class="status-percentage">{{ getPercentage(statistics.assigned, statistics.total) }}%</div>
              </div>
            </div>
            
            <div class="status-item unassigned">
              <div class="status-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="status-info">
                <div class="status-count">{{ statistics.unassigned }}</div>
                <div class="status-label">待分班</div>
                <div class="status-percentage">{{ getPercentage(statistics.unassigned, statistics.total) }}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="status-table">
          <el-table :data="statusTableData" style="width: 100%">
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="人数" width="100" />
            <el-table-column prop="percentage" label="占比" width="100">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 趋势分析 -->
    <div class="trend-analysis">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span>学生数量趋势</span>
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
            <el-icon :size="48" color="var(--text-placeholder)"><TrendCharts /></el-icon>
            <p>学生数量趋势图表</p>
            <p class="chart-description">显示{{ trendPeriod }}内学生数量变化趋势</p>
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
          <el-button @click="handleViewStudents">
            <el-icon><View /></el-icon>
            查看学生列表
          </el-button>
          
          <el-button @click="handleAddStudent">
            <el-icon><Plus /></el-icon>
            添加新学生
          </el-button>
          
          <el-button @click="handleClassAssignment">
            <el-icon><School /></el-icon>
            班级分配
          </el-button>
          
          <el-button @click="handleStudentAnalytics">
            <el-icon><DataAnalysis /></el-icon>
            学生分析
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
  UserFilled, Check, School, Warning, TrendCharts, Male, Female,
  Close, View, Plus, DataAnalysis, Refresh, Download
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const statusViewType = ref('chart')
const trendPeriod = ref('30d')
const trendChartRef = ref()

// 统计数据
const statistics = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  male: 0,
  female: 0,
  assigned: 0,
  unassigned: 0,
  totalGrowth: 0
})

// 年龄分布数据
const ageDistribution = ref([
  { ageGroup: '0-3岁', count: 0 },
  { ageGroup: '3-4岁', count: 0 },
  { ageGroup: '4-5岁', count: 0 },
  { ageGroup: '5-6岁', count: 0 },
  { ageGroup: '6岁以上', count: 0 }
])

// 班级分布数据
const classDistribution = ref([
  { className: '小班A', count: 25 },
  { className: '小班B', count: 23 },
  { className: '中班A', count: 28 },
  { className: '中班B', count: 26 },
  { className: '大班A', count: 30 },
  { className: '大班B', count: 28 }
])

// 计算属性
const statusTableData = computed(() => [
  {
    status: 'active',
    statusText: '在读',
    count: statistics.active,
    percentage: getPercentage(statistics.active, statistics.total),
    description: '正常在园学习的学生'
  },
  {
    status: 'inactive',
    statusText: '离园',
    count: statistics.inactive,
    percentage: getPercentage(statistics.inactive, statistics.total),
    description: '已离园或毕业的学生'
  },
  {
    status: 'assigned',
    statusText: '已分班',
    count: statistics.assigned,
    percentage: getPercentage(statistics.assigned, statistics.total),
    description: '已分配到具体班级的学生'
  },
  {
    status: 'unassigned',
    statusText: '待分班',
    count: statistics.unassigned,
    percentage: getPercentage(statistics.unassigned, statistics.total),
    description: '尚未分配班级的学生'
  }
])

// 方法
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const getStatusTagType = (status: string) => {
  const statusMap = {
    'active': 'success',
    'inactive': 'info',
    'assigned': 'primary',
    'unassigned': 'warning'
  }
  return statusMap[status] || 'info'
}

const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await get('/api/students/stats')
    
    if (response.success && response.data) {
      const data = response.data
      Object.assign(statistics, {
        total: data.total || 0,
        active: data.active || 0,
        inactive: data.inactive || 0,
        male: data.male || 0,
        female: data.female || 0,
        assigned: data.assigned || 0,
        unassigned: data.unassigned || 0,
        totalGrowth: 12.5 // 模拟增长率
      })
      
      // 更新年龄分布数据
      if (data.ageDistribution && Array.isArray(data.ageDistribution)) {
        ageDistribution.value = data.ageDistribution
      }
    } else {
      // 使用模拟数据
      Object.assign(statistics, {
        total: 160,
        active: 145,
        inactive: 15,
        male: 85,
        female: 75,
        assigned: 140,
        unassigned: 20,
        totalGrowth: 12.5
      })
      
      // 模拟年龄分布数据
      ageDistribution.value = [
        { ageGroup: '0-3岁', count: 20 },
        { ageGroup: '3-4岁', count: 45 },
        { ageGroup: '4-5岁', count: 50 },
        { ageGroup: '5-6岁', count: 35 },
        { ageGroup: '6岁以上', count: 10 }
      ]
    }
  } catch (error) {
    console.error('加载学生统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    
    // 使用模拟数据作为后备
    Object.assign(statistics, {
      total: 160,
      active: 145,
      inactive: 15,
      male: 85,
      female: 75,
      assigned: 140,
      unassigned: 20,
      totalGrowth: 12.5
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

const handleViewStudents = () => {
  router.push('/student')
}

const handleAddStudent = () => {
  router.push('/student/create')
}

const handleClassAssignment = () => {
  ElMessage.info('班级分配功能开发中')
}

const handleStudentAnalytics = () => {
  router.push('/student/analytics')
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss">
.student-statistics-container {
  padding: var(--text-2xl);
  max-width: 1400px;
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
        
        &.assigned {
          background: #faf5ff;
          color: #a855f7;
        }
        
        &.unassigned {
          background: #fefbf2;
          color: var(--warning-color);
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
  
  .gender-chart {
    display: flex;
    gap: var(--text-3xl);
    
    .gender-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      
      .gender-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        
        &.male {
          background: #dbeafe;
          color: var(--primary-color);
        }
        
        &.female {
          background: #fce7f3;
          color: #ec4899;
        }
      }
      
      .gender-info {
        .gender-count {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .gender-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        
        .gender-percentage {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
    }
  }
  
  .age-distribution {
    .age-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);
      
      .age-label {
        width: 60px;
        font-size: var(--text-base);
        color: var(--color-gray-700);
      }
      
      .age-bar {
        flex: 1;
        height: var(--spacing-sm);
        background: #f3f4f6;
        border-radius: var(--spacing-xs);
        overflow: hidden;
        
        .age-progress {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }
      
      .age-count {
        width: 40px;
        text-align: right;
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }
  }
  
  .class-distribution {
    .class-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);
      
      .class-info {
        width: 80px;
        
        .class-name {
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
        
        .class-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
      
      .class-progress {
        flex: 1;
      }
    }
  }
}

.status-statistics {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-chart {
    .status-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-2xl);
      
      .status-item {
        display: flex;
        align-items: center;
        gap: var(--text-sm);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
        
        &.active {
          background: #f0fdf4;
          
          .status-icon {
            background: var(--success-color);
            color: white;
          }
        }
        
        &.inactive {
          background: #f9fafb;
          
          .status-icon {
            background: var(--text-secondary);
            color: white;
          }
        }
        
        &.assigned {
          background: #faf5ff;
          
          .status-icon {
            background: #a855f7;
            color: white;
          }
        }
        
        &.unassigned {
          background: #fefbf2;
          
          .status-icon {
            background: var(--warning-color);
            color: white;
          }
        }
        
        .status-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
        }
        
        .status-info {
          .status-count {
            font-size: var(--text-2xl);
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
  }
}

.trend-analysis {
  margin-bottom: var(--text-3xl);
  
  .trend-chart {
    height: 300px;
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
  .student-statistics-container {
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
  
  .gender-chart {
    flex-direction: column;
    gap: var(--text-lg);
  }
  
  .status-items {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
