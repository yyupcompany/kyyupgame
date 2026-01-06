<template>
  <div class="memory-visualization">
    <el-row :gutter="20">
      <!-- 记忆统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-title">总记忆数</div>
          <div class="stat-value">{{ stats.totalMemories || stats.totalCount || 0 }}</div>
          <div class="stat-icon">
            <el-icon><DataLine /></el-icon>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-title">平均重要性</div>
          <div class="stat-value">{{ formatPercent(stats.averageImportance) }}</div>
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-title">今日新增</div>
          <div class="stat-value">{{ stats.createdToday || 0 }}</div>
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-title">本周新增</div>
          <div class="stat-value">{{ stats.createdThisWeek || 0 }}</div>
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 记忆类型分布图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>记忆类型分布</span>
            </div>
          </template>
          <div class="chart-container" id="memory-type-chart"></div>
        </el-card>
      </el-col>
      
      <!-- 记忆重要性分布图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>记忆重要性分布</span>
            </div>
          </template>
          <div class="chart-container" id="memory-importance-chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <!-- 记忆增长趋势图 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>记忆增长趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" id="memory-trend-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { DataLine, Star, Calendar, TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 导入真实的AI记忆API
import { AI_MEMORY_ENDPOINTS } from '@/api/endpoints'
import request from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

// 注册必要的echarts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  LineChart,
  CanvasRenderer
]);

// 定义统计数据类型
interface MemoryStats {
  totalCount: number;
  averageImportance: number;
  typeDistribution: {
    immediate: number;
    shortTerm: number;
    longTerm: number;
  };
  importanceDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  trendData?: any[];
}

export default defineComponent({
  name: 'MemoryVisualization',
  
  components: {
    DataLine,
    Star,
    Calendar,
    TrendCharts
  },
  
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  
  setup(props: { userId: number }) {
    // 图表实例
    let typeChart: echarts.ECharts | null = null;
    let importanceChart: echarts.ECharts | null = null;
    let trendChart: echarts.ECharts | null = null;
    
    // 时间范围选择
    const timeRange = ref('week');
    
    // 统计数据
    const stats = ref<MemoryStats>({
      totalCount: 0,
      averageImportance: 0,
      typeDistribution: {
        immediate: 0,
        shortTerm: 0,
        longTerm: 0
      },
      importanceDistribution: {
        low: 0,
        medium: 0,
        high: 0
      },
      createdToday: 0,
      createdThisWeek: 0,
      createdThisMonth: 0,
      trendData: []
    });
    
    // 格式化百分比
    const formatPercent = (value: number) => {
      return `${Math.round((value || 0) * 100)}%`;
    };
    
    // 初始化记忆类型分布图
    const initTypeChart = () => {
      if (typeChart) {
        typeChart.dispose();
      }

      const chartDom = document.getElementById('memory-type-chart');
      if (!chartDom) return;

      // 确保数据已加载
      if (!stats.value.typeDistribution) return;

      // 检查容器尺寸
      if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
        setTimeout(() => initTypeChart(), 100);
        return;
      }

      typeChart = echarts.init(chartDom);

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['即时记忆', '短期记忆', '长期记忆']
        },
        series: [
          {
            name: '记忆类型',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: [
              { value: stats.value.typeDistribution.immediate, name: '即时记忆' },
              { value: stats.value.typeDistribution.shortTerm, name: '短期记忆' },
              { value: stats.value.typeDistribution.longTerm, name: '长期记忆' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'var(--shadow-heavy)'
              }
            }
          }
        ]
      };
      
      typeChart.setOption(option);
    };
    
    // 初始化记忆重要性分布图
    const initImportanceChart = () => {
      if (importanceChart) {
        importanceChart.dispose();
      }

      const chartDom = document.getElementById('memory-importance-chart');
      if (!chartDom) return;

      // 确保数据已加载
      if (!stats.value.importanceDistribution) return;

      // 检查容器尺寸
      if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
        setTimeout(() => initImportanceChart(), 100);
        return;
      }

      importanceChart = echarts.init(chartDom);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['低重要性', '中重要性', '高重要性']
        },
        series: [
          {
            name: '重要性分布',
            type: 'pie',
            radius: '70%',
            center: ['50%', '50%'],
            data: [
              { 
                value: stats.value.importanceDistribution.low, 
                name: '低重要性',
                itemStyle: { color: '#91cc75' }
              },
              { 
                value: stats.value.importanceDistribution.medium, 
                name: '中重要性',
                itemStyle: { color: '#fac858' }
              },
              { 
                value: stats.value.importanceDistribution.high, 
                name: '高重要性',
                itemStyle: { color: '#ee6666' }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'var(--shadow-heavy)'
              }
            }
          }
        ]
      };
      
      importanceChart.setOption(option);
    };
    
    // 初始化记忆增长趋势图
    const initTrendChart = () => {
      if (trendChart) {
        trendChart.dispose();
      }

      const chartDom = document.getElementById('memory-trend-chart');
      if (!chartDom) return;

      // 确保数据已加载
      if (!stats.value.trendData || !Array.isArray(stats.value.trendData)) return;

      // 检查容器尺寸
      if (chartDom.clientWidth === 0 || chartDom.clientHeight === 0) {
        setTimeout(() => initTrendChart(), 100);
        return;
      }

      trendChart = echarts.init(chartDom);
      
      // 模拟数据，实际应从API获取
      const xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const seriesData = [10, 15, 8, 20, 12, 5, 18];
      
      if (timeRange.value === 'month') {
        // 生成本月日期
        const daysInMonth = 30;
        const days = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);
        const data = Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 20));
        
        updateTrendChart(days, data);
      } else if (timeRange.value === 'year') {
        // 生成本年月份
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
        
        updateTrendChart(months, data);
      } else {
        // 默认显示本周
        updateTrendChart(xAxisData, seriesData);
      }
    };
    
    // 更新趋势图数据
    const updateTrendChart = (xAxisData: string[], seriesData: number[]) => {
      if (!trendChart) return;
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '记忆数量',
            type: 'bar',
            data: seriesData,
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      };
      
      trendChart.setOption(option);
    };
    
    // 获取统计数据
    const fetchStats = async () => {
      try {
        const result: ApiResponse = await request.get(AI_MEMORY_ENDPOINTS.STATS(props.userId));

        // 更新统计数据 - 修复：使用result.data而不是result
        const statsData = result.data || result;
        stats.value = {
          ...statsData,
          trendData: stats.value.trendData
        };
        
        // 更新图表
        initTypeChart();
        initImportanceChart();
        initTrendChart();
      } catch (error) {
        console.error('获取记忆统计数据失败:', error);
      }
    };
    
    // 监听时间范围变化
    watch(timeRange, () => {
      initTrendChart();
    });
    
    // 窗口大小变化时重新调整图表大小
    const handleResize = () => {
      typeChart?.resize();
      importanceChart?.resize();
      trendChart?.resize();
    };
    
    // 组件挂载时获取数据并初始化图表
    onMounted(() => {
      fetchStats();
      window.addEventListener('resize', handleResize);
    });
    
    // 组件卸载时移除事件监听
    const onUnmounted = () => {
      window.removeEventListener('resize', handleResize);
      typeChart?.dispose();
      importanceChart?.dispose();
      trendChart?.dispose();
    };
    
    return {
      stats,
      timeRange,
      formatPercent,
      onUnmounted
    };
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.memory-visualization {
  padding: var(--spacing-lg);
}

.stat-card {
  height: 120px;
  margin-bottom: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.stat-title {
  font-size: var(--font-size-base);
  color: var(--text-color-secondary);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
}

.stat-icon {
  position: absolute;
  right: var(--spacing-lg);
  top: var(--spacing-lg);
  font-size: 4var(--spacing-sm);
  opacity: 0.2;
  color: var(--color-primary);
}

.chart-row {
  margin-bottom: var(--spacing-lg);
}

.chart-card {
  margin-bottom: var(--spacing-lg);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

@media (max-width: 76var(--spacing-sm)) {
  .chart-container {
    height: 250px;
  }
}
</style> 