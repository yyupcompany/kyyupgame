<!--
  AI记忆统计分析组件
  显示记忆统计数据和可视化图表
-->
<template>
  <div class="memory-statistics" v-loading="loading">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalMemories }}</div>
              <div class="stat-label">总记忆数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon short-term">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.shortTermCount }}</div>
              <div class="stat-label">短期记忆</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon long-term">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.longTermCount }}</div>
              <div class="stat-label">长期记忆</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon working">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.workingCount }}</div>
              <div class="stat-label">工作记忆</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>记忆类型分布</span>
                <el-button link @click="refreshCharts">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div ref="pieChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>重要性分析</span>
                <div class="importance-value">
                  平均重要性: {{ (stats.averageImportance * 100).toFixed(1) }}%
                </div>
              </div>
            </template>
            <div class="importance-analysis">
              <div class="importance-bar">
                <div 
                  class="importance-fill" 
                  :style="{ width: (stats.averageImportance * 100) + '%' }"
                ></div>
              </div>
              <div class="importance-details">
                <div class="detail-item">
                  <span class="label">最新记忆:</span>
                  <span class="value">{{ formatDate(stats.latestMemory) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="primary" @click="$emit('refresh')" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新统计
      </el-button>
      <el-button @click="exportStats">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Clock, FolderOpened, Cpu, Refresh, Download } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// Props
interface Props {
  userId: number;
  stats: {
    totalMemories: number;
    shortTermCount: number;
    longTermCount: number;
    workingCount: number;
    averageImportance: number;
    latestMemory: string | null;
  };
  loading: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 图表引用
const pieChartRef = ref<HTMLElement>();
let pieChart: echarts.ECharts | null = null;

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return;
  
  pieChart = echarts.init(pieChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '记忆类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: props.stats.shortTermCount, name: '短期记忆', itemStyle: { color: 'var(--primary-color)' } },
          { value: props.stats.longTermCount, name: '长期记忆', itemStyle: { color: 'var(--success-color)' } },
          { value: props.stats.workingCount, name: '工作记忆', itemStyle: { color: 'var(--warning-color)' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'var(--shadow-color, rgba(0, 0, 0, 0.5))'
          }
        }
      }
    ]
  };
  
  pieChart.setOption(option);
};

// 更新图表数据
const updateCharts = () => {
  if (!pieChart) return;
  
  const option = {
    series: [
      {
        data: [
          { value: props.stats.shortTermCount, name: '短期记忆', itemStyle: { color: 'var(--primary-color)' } },
          { value: props.stats.longTermCount, name: '长期记忆', itemStyle: { color: 'var(--success-color)' } },
          { value: props.stats.workingCount, name: '工作记忆', itemStyle: { color: 'var(--warning-color)' } }
        ]
      }
    ]
  };
  
  pieChart.setOption(option);
};

// 刷新图表
const refreshCharts = () => {
  emit('refresh');
};

// 导出统计数据
const exportStats = () => {
  const data = {
    userId: props.userId,
    stats: props.stats,
    exportTime: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memory-stats-${props.userId}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  ElMessage.success('统计数据已导出');
};

// 格式化日期
const formatDate = (dateString: string | null) => {
  if (!dateString) return '暂无';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 监听统计数据变化
watch(() => props.stats, () => {
  nextTick(() => {
    updateCharts();
  });
}, { deep: true });

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initPieChart();
  });
});

// 组件卸载
onUnmounted(() => {
  if (pieChart) {
    pieChart.dispose();
  }
});
</script>

<style lang="scss" scoped>
.memory-statistics {
  padding: var(--spacing-lg);
}

.stats-cards {
  margin-bottom: var(--text-3xl);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.stat-icon {
  width: 4var(--spacing-sm);
  height: 4var(--spacing-sm);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--text-lg);
  background: var(--primary-color);
  color: white;

  &.short-term {
    background: var(--primary-color);
  }

  &.long-term {
    background: var(--success-color);
  }

  &.working {
    background: var(--warning-color);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.charts-section {
  margin-bottom: var(--text-3xl);
}

.chart-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.chart-container {
  height: 300px;
}

.importance-analysis {
  padding: var(--spacing-lg) 0;
}

.importance-bar {
  width: 100%;
  height: var(--text-2xl);
  background: var(--bg-secondary);
  border-radius: var(--spacing-sm);
  overflow: hidden;
  margin-bottom: var(--text-lg);
}

.importance-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.importance-value {
  font-size: var(--text-sm);
  color: var(--primary-color);
  font-weight: 500;
}

.importance-details {
  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);

    .label {
      color: var(--text-muted);
    }

    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

.actions {
  display: flex;
  gap: var(--text-xs);
}

@media (max-width: 76var(--spacing-sm)) {
  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }

  .charts-section {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }
}
</style>
