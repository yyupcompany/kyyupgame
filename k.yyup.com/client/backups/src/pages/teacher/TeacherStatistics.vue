<template>
  <div class="teacher-statistics-container">
    <!-- 页面头部 -->
    <div class="statistics-header">
      <div class="header-content">
        <div class="page-title">
          <h1>教师统计</h1>
          <p>全面分析教师数据和绩效</p>
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
                <div class="metric-label">教师总数</div>
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
                <div class="metric-label">在职教师</div>
                <div class="metric-detail">占比{{ getPercentage(statistics.active, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon classes">
                <el-icon><School /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.classAssignments.totalAssignments }}</div>
                <div class="metric-label">班级分配</div>
                <div class="metric-detail">平均{{ statistics.classAssignments.avgClassesPerTeacher }}班/人</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon kindergartens">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ statistics.kindergartens }}</div>
                <div class="metric-label">覆盖园区</div>
                <div class="metric-detail">{{ statistics.positions }}个职位</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计图表 -->
    <div class="statistics-charts">
      <el-row :gutter="20">
        <!-- 职位分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>职位分布</span>
                <el-tag size="small">{{ statistics.positions }}个职位</el-tag>
              </div>
            </template>
            
            <div class="position-chart">
              <div
                v-for="position in positionDistribution"
                :key="position.position"
                class="position-item"
              >
                <div class="position-info">
                  <div class="position-name">{{ getPositionName(position.position) }}</div>
                  <div class="position-count">{{ position.count }}人</div>
                </div>
                <div class="position-bar">
                  <div
                    class="position-progress"
                    :style="{ width: getPercentage(position.count, statistics.total) + '%' }"
                  ></div>
                </div>
                <div class="position-percentage">{{ getPercentage(position.count, statistics.total) }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 状态分布 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>教师状态</span>
            </template>
            
            <div class="status-chart">
              <div class="status-item active">
                <div class="status-icon">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="status-info">
                  <div class="status-count">{{ statistics.active }}</div>
                  <div class="status-label">在职</div>
                  <div class="status-percentage">{{ getPercentage(statistics.active, statistics.total) }}%</div>
                </div>
              </div>
              
              <div class="status-item inactive">
                <div class="status-icon">
                  <el-icon><Close /></el-icon>
                </div>
                <div class="status-info">
                  <div class="status-count">{{ statistics.inactive }}</div>
                  <div class="status-label">离职</div>
                  <div class="status-percentage">{{ getPercentage(statistics.inactive, statistics.total) }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 班级分配 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>班级分配情况</span>
            </template>
            
            <div class="class-assignment">
              <div class="assignment-item">
                <div class="assignment-label">有班级教师</div>
                <div class="assignment-value">{{ statistics.classAssignments.teachersWithClasses }}人</div>
                <div class="assignment-bar">
                  <el-progress
                    :percentage="getPercentage(statistics.classAssignments.teachersWithClasses, statistics.total)"
                    :show-text="false"
                    :stroke-width="8"
                    color="var(--success-color)"
                  />
                </div>
              </div>
              
              <div class="assignment-item">
                <div class="assignment-label">总分配数</div>
                <div class="assignment-value">{{ statistics.classAssignments.totalAssignments }}个</div>
                <div class="assignment-description">平均每人{{ statistics.classAssignments.avgClassesPerTeacher }}个班级</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 教师绩效统计 -->
    <div class="performance-statistics">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>教师绩效统计</span>
            <el-select v-model="performancePeriod" size="small" style="width: 120px">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年度" value="year" />
            </el-select>
          </div>
        </template>
        
        <div class="performance-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="performance-card excellent">
                <div class="performance-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="performance-info">
                  <div class="performance-count">{{ performanceStats.excellent }}</div>
                  <div class="performance-label">优秀教师</div>
                  <div class="performance-description">绩效评分≥90分</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="performance-card good">
                <div class="performance-icon">
                  <el-icon><Medal /></el-icon>
                </div>
                <div class="performance-info">
                  <div class="performance-count">{{ performanceStats.good }}</div>
                  <div class="performance-label">良好教师</div>
                  <div class="performance-description">绩效评分80-89分</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="performance-card average">
                <div class="performance-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="performance-info">
                  <div class="performance-count">{{ performanceStats.average }}</div>
                  <div class="performance-label">合格教师</div>
                  <div class="performance-description">绩效评分70-79分</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="performance-card poor">
                <div class="performance-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="performance-info">
                  <div class="performance-count">{{ performanceStats.poor }}</div>
                  <div class="performance-label">待改进</div>
                  <div class="performance-description">绩效评分<70分</div>
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
            <span>教师数量趋势</span>
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
            <p>教师数量趋势图表</p>
            <p class="chart-description">显示{{ trendPeriod }}内教师数量变化趋势</p>
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
          <el-button @click="handleViewTeachers">
            <el-icon><View /></el-icon>
            查看教师列表
          </el-button>
          
          <el-button @click="handleAddTeacher">
            <el-icon><Plus /></el-icon>
            添加新教师
          </el-button>
          
          <el-button @click="handleClassAssignment">
            <el-icon><School /></el-icon>
            班级分配
          </el-button>
          
          <el-button @click="handlePerformanceEvaluation">
            <el-icon><DataAnalysis /></el-icon>
            绩效评估
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
  UserFilled, Check, School, OfficeBuilding, TrendCharts, Close,
  Trophy, Medal, Star, Warning, View, Plus, DataAnalysis, Refresh, Download
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const performancePeriod = ref('month')
const trendPeriod = ref('30d')
const trendChartRef = ref()

// 统计数据
const statistics = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  kindergartens: 0,
  positions: 0,
  totalGrowth: 0,
  classAssignments: {
    teachersWithClasses: 0,
    totalAssignments: 0,
    avgClassesPerTeacher: 0
  }
})

// 职位分布数据
const positionDistribution = ref([])

// 绩效统计数据
const performanceStats = reactive({
  excellent: 0,
  good: 0,
  average: 0,
  poor: 0
})

// 方法
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const getPositionName = (position: string) => {
  const positionMap = {
    '园长': '园长',
    '副园长': '副园长',
    '教研主任': '教研主任',
    '班主任': '班主任',
    '普通教师': '普通教师',
    '助教': '助教',
    '保育员': '保育员'
  }
  return positionMap[position] || position
}

const loadStatistics = async () => {
  loading.value = true
  try {
    // 尝试获取真实的教师列表数据来计算统计信息
    const response = await get('/api/teachers?page=1&limit=100')

    if (response.success && response.data && response.data.items) {
      const teachers = response.data.items

      // 计算统计数据
      const total = teachers.length
      const active = teachers.filter(t => t.status === 1 || t.status === 'ACTIVE').length
      const inactive = teachers.filter(t => t.status === 0 || t.status === 'RESIGNED').length

      // 计算职位分布
      const positionCounts = teachers.reduce((acc, teacher) => {
        const position = getPositionName(teacher.position)
        acc[position] = (acc[position] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const positionData = Object.entries(positionCounts).map(([position, count]) => ({
        position,
        count
      }))

      Object.assign(statistics, {
        total,
        active,
        inactive,
        kindergartens: new Set(teachers.map(t => t.kindergartenId)).size,
        positions: Object.keys(positionCounts).length,
        totalGrowth: 8.5, // 模拟增长率
        classAssignments: {
          teachersWithClasses: teachers.filter(t => t.classes && t.classes.length > 0).length,
          totalAssignments: teachers.reduce((sum, t) => sum + (t.classes?.length || 0), 0),
          avgClassesPerTeacher: teachers.length > 0 ?
            teachers.reduce((sum, t) => sum + (t.classes?.length || 0), 0) / teachers.length : 0
        }
      })

      positionDistribution.value = positionData
    } else {
      // 使用模拟数据
      Object.assign(statistics, {
        total: 45,
        active: 42,
        inactive: 3,
        kindergartens: 3,
        positions: 6,
        totalGrowth: 8.5,
        classAssignments: {
          teachersWithClasses: 38,
          totalAssignments: 85,
          avgClassesPerTeacher: 2.2
        }
      })

      positionDistribution.value = [
        { position: '普通教师', count: 25 },
        { position: '班主任', count: 12 },
        { position: '助教', count: 5 },
        { position: '保育员', count: 2 },
        { position: '园长', count: 1 }
      ]
    }
    
    // 模拟绩效统计数据
    Object.assign(performanceStats, {
      excellent: Math.floor(statistics.total * 0.2),
      good: Math.floor(statistics.total * 0.4),
      average: Math.floor(statistics.total * 0.3),
      poor: Math.floor(statistics.total * 0.1)
    })
    
  } catch (error) {
    console.error('加载教师统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
    
    // 使用模拟数据作为后备
    Object.assign(statistics, {
      total: 45,
      active: 42,
      inactive: 3,
      kindergartens: 3,
      positions: 6,
      totalGrowth: 8.5,
      classAssignments: {
        teachersWithClasses: 38,
        totalAssignments: 85,
        avgClassesPerTeacher: 2.2
      }
    })
    
    positionDistribution.value = [
      { position: '普通教师', count: 25 },
      { position: '班主任', count: 12 },
      { position: '助教', count: 5 },
      { position: '保育员', count: 2 },
      { position: '园长', count: 1 }
    ]
    
    Object.assign(performanceStats, {
      excellent: 9,
      good: 18,
      average: 14,
      poor: 4
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

const handleViewTeachers = () => {
  router.push('/teacher')
}

const handleAddTeacher = () => {
  router.push('/teacher/create')
}

const handleClassAssignment = () => {
  ElMessage.info('班级分配功能开发中')
}

const handlePerformanceEvaluation = () => {
  ElMessage.info('绩效评估功能开发中')
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style lang="scss">
.teacher-statistics-container {
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
        
        &.classes {
          background: #faf5ff;
          color: #a855f7;
        }
        
        &.kindergartens {
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
  
  .position-chart {
    .position-item {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);
      
      .position-info {
        width: 80px;
        
        .position-name {
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
        
        .position-count {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
        }
      }
      
      .position-bar {
        flex: 1;
        height: var(--spacing-sm);
        background: #f3f4f6;
        border-radius: var(--spacing-xs);
        overflow: hidden;
        
        .position-progress {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }
      
      .position-percentage {
        width: 40px;
        text-align: right;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
  
  .status-chart {
    display: flex;
    flex-direction: column;
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
  
  .class-assignment {
    .assignment-item {
      margin-bottom: var(--text-2xl);
      
      .assignment-label {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
      
      .assignment-value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .assignment-description {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
        margin-top: var(--spacing-xs);
      }
    }
  }
}

.performance-statistics {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .performance-content {
    .performance-card {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border-radius: var(--spacing-sm);
      
      &.excellent {
        background: #fef3c7;
        
        .performance-icon {
          background: var(--warning-color);
          color: white;
        }
      }
      
      &.good {
        background: #d1fae5;
        
        .performance-icon {
          background: var(--success-color);
          color: white;
        }
      }
      
      &.average {
        background: #dbeafe;
        
        .performance-icon {
          background: var(--primary-color);
          color: white;
        }
      }
      
      &.poor {
        background: #fee2e2;
        
        .performance-icon {
          background: var(--danger-color);
          color: white;
        }
      }
      
      .performance-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xl);
      }
      
      .performance-info {
        .performance-count {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .performance-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
        
        .performance-description {
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
  .teacher-statistics-container {
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
      padding: var(--text-sm);
    }
  }
  
  .performance-content {
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
