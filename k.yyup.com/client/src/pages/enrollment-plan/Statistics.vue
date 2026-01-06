<template>
  <div class="page-container">
    <div class="page-header">
      <h1>招生统计</h1>
    </div>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="招生计划">
          <el-select 
            v-model="filterForm.planId"
            placeholder="请选择招生计划"
            clearable
            @change="handlePlanChange"
          >
            <el-option 
              v-for="item in planOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据总览 -->
    <el-card class="overview-card" v-loading="overviewLoading">
      <template #header>
        <div class="card-header">
          <span>数据总览</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalTarget }}</div>
              <div class="stat-label">招生目标</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalApplications }}</div>
              <div class="stat-label">报名总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <UnifiedIcon name="Check" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewData.totalAdmissions }}</div>
              <div class="stat-label">录取总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatPercent(overviewData.conversionRate) }}</div>
              <div class="stat-label">转化率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 趋势分析 -->
    <el-card class="trend-card" v-loading="trendLoading">
      <template #header>
        <div class="card-header">
          <span>招生趋势分析</span>
                  <el-radio-group v-model="trendType" size="small">
          <el-radio-button value="daily">日趋势</el-radio-button>
          <el-radio-button value="weekly">周趋势</el-radio-button>
          <el-radio-button value="monthly">月趋势</el-radio-button>
        </el-radio-group>
        </div>
      </template>
      
      <div ref="trendChartRef" class="chart-container"></div>
    </el-card>
    
    <el-row :gutter="20">
      <!-- 班级分布 -->
      <el-col :span="12">
        <el-card class="distribution-card">
          <template #header>
            <div class="card-header">
              <span>班级分布</span>
            </div>
          </template>
          
          <div ref="classChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 渠道分布 -->
      <el-col :span="12">
        <el-card class="distribution-card">
          <template #header>
            <div class="card-header">
              <span>渠道分布</span>
            </div>
          </template>
          
          <div ref="channelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 渠道效果对比 -->
    <el-card class="channel-card">
      <template #header>
        <div class="card-header">
          <span>渠道效果对比</span>
        </div>
      </template>
      
      <div class="table-wrapper">
<el-table class="responsive-table" :data="channelData" border style="width: 100%">
        <el-table-column prop="channelName" label="渠道名称" min-width="120" />
        <el-table-column prop="applicationCount" label="报名人数" width="120" />
        <el-table-column prop="admissionCount" label="录取人数" width="120" />
        <el-table-column label="转化率" width="120">
          <template #default="{ row }">
            {{ formatPercent(row.conversionRate) }}
          </template>
        </el-table-column>
        <el-table-column label="同比上月" width="120">
          <template #default="{ row }">
            <span :class="getCompareClass(row.monthOnMonth)">
              {{ formatCompare(row.monthOnMonth) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="同比上周" width="120">
          <template #default="{ row }">
            <span :class="getCompareClass(row.weekOnWeek)">
              {{ formatCompare(row.weekOnWeek) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>
    
    <!-- 报表下载 -->
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>报表下载</span>
        </div>
      </template>
      
      <div class="report-actions">
        <el-button type="primary" @click="exportExcel">
          <UnifiedIcon name="Download" />
          导出Excel
        </el-button>
        <el-button type="success" @click="generateReport">
          <UnifiedIcon name="default" />
          生成完整报告
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
// 1. Vue 相关导入
import { defineComponent, ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage } from 'element-plus'

// 组件导入
import EmptyState from '@/components/common/EmptyState.vue'
import { User, MessageBox, Check, TrendCharts, Download, Printer } from '@element-plus/icons-vue'

// 3. 第三方库导入
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { 
  TooltipComponent, 
  LegendComponent, 
  GridComponent, 
  DatasetComponent,
  TransformComponent,
  TitleComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 4. 公共工具函数导入
import { get, post } from '@/utils/request'
import { ENROLLMENT_STATISTICS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 5. 页面内部类型定义
interface FilterForm {
  planId?: number
  dateRange?: [string, string]
}

interface PlanOption {
  id: number;
  name: string
}

interface OverviewData {
  totalTarget: number
  totalApplications: number
  totalAdmissions: number
  conversionRate: number
}

interface ChannelData {
  channelName: string
  applicationCount: number
  admissionCount: number
  conversionRate: number
  monthOnMonth: number
  weekOnWeek: number
}

// 注册 ECharts 组件
echarts.use([
  LineChart, 
  BarChart, 
  PieChart, 
  TooltipComponent, 
  LegendComponent, 
  GridComponent, 
  DatasetComponent, 
  TransformComponent,
  TitleComponent,
  CanvasRenderer
]);

export default defineComponent({
  name: 'EnrollmentStatistics',
  components: {
    User,
    MessageBox,
    Check,
    TrendCharts,
    Download,
    Printer
  },
  setup() {
    const router = useRouter();
    
    // 加载状态
    const loading = ref(false);
    const overviewLoading = ref(false);
    const trendLoading = ref(false);
    const channelLoading = ref(false);
    const classLoading = ref(false);
    
    // 图表实例
    let trendChart: echarts.ECharts | null = null;
    let classChart: echarts.ECharts | null = null;
    let channelChart: echarts.ECharts | null = null;
    
    // 图表容器引用
    const trendChartRef = ref<HTMLElement | null>(null);
    const classChartRef = ref<HTMLElement | null>(null);
    const channelChartRef = ref<HTMLElement | null>(null);
    
    // 筛选表单
    const filterForm = ref({
      planId: undefined as number | undefined,
      dateRange: undefined as [string, string] | undefined
    });
    
    // 趋势类型
    const trendType = ref<'daily' | 'weekly' | 'monthly'>('daily');
    
    // 计划选项
    const planOptions = ref<{ id: number, name: string }[]>([]);
    
    // 数据总览
    const overviewData = ref({
      totalTarget: 0,
      totalApplications: 0,
      totalAdmissions: 0,
      conversionRate: 0
    });
    
    // 渠道数据
    const channelData = ref<any[]>([]);
    
    // 班级分布数据
    const classDistributionData = ref<any[]>([]);
    
    // 趋势数据
    const trendData = ref<any[]>([]);
    
    // 加载招生计划选项
    const loadPlanOptions = async () => {
      try {
        // 使用新的统计API
        const analyticsResponse = await get(ENROLLMENT_STATISTICS_ENDPOINTS.ANALYTICS);
        
        if (analyticsResponse.success && analyticsResponse.data) {
          const data = analyticsResponse.data;
          
          overviewData.value = {
            totalTarget: data.totalTarget || 200,
            totalApplications: data.totalApplications || 150,
            totalAdmissions: data.totalEnrolled || 100,
            conversionRate: data.conversionRate || 0.67
          };
          
          // 模拟计划选项（后续可从专门的API获取）
          planOptions.value = [
            { id: 1, name: '2023年秋季招生计划' },
            { id: 2, name: '2024年春季招生计划' },
            { id: 3, name: '2024年秋季招生计划' }
          ];
        } else {
          // 如果API调用失败，使用默认数据
          overviewData.value = {
            totalTarget: 200,
            totalApplications: 150,
            totalAdmissions: 100,
            conversionRate: 0.67
          };
          
          planOptions.value = [
            { id: 1, name: '2023年秋季招生计划' },
            { id: 2, name: '2024年春季招生计划' },
            { id: 3, name: '2024年秋季招生计划' }
          ];
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, false);
        
        // 使用默认数据
        overviewData.value = {
          totalTarget: 200,
          totalApplications: 150,
          totalAdmissions: 100,
          conversionRate: 0.67
        };
        
        planOptions.value = [
          { id: 1, name: '2023年秋季招生计划' },
          { id: 2, name: '2024年春季招生计划' },
          { id: 3, name: '2024年秋季招生计划' }
        ];
      } finally {
        overviewLoading.value = false;
      }
    };
    
    // 获取渠道数据
    const fetchChannelData = async () => {
      channelLoading.value = true;
      try {
        const params: any = {};
        
        if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
          params.startDate = filterForm.value.dateRange[0];
          params.endDate = filterForm.value.dateRange[1];
        }
        
        if (filterForm.value.planId) {
          params.planId = filterForm.value.planId;
        }
        
        const response = await get(ENROLLMENT_STATISTICS_ENDPOINTS.CHANNELS, params);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          channelData.value = response.data.map((channel: any) => ({
            channelName: channel.name,
            applicationCount: channel.applicationCount || 0,
            admissionCount: channel.admissionCount || 0,
            conversionRate: channel.applicationCount > 0 ? (channel.admissionCount || 0) / channel.applicationCount : 0,
            monthOnMonth: Math.random() * 20 - 10, // 模拟同比数据，后续可对接真实API
            weekOnWeek: Math.random() * 15 - 7.5
          }));
          
          // 渲染渠道图表
          nextTick(() => {
            renderChannelChart();
          });
        } else {
          // 使用默认数据
          generateMockChannelData();
          nextTick(() => {
            renderChannelChart();
          });
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, false);
        
        // 使用默认数据
        generateMockChannelData();
        nextTick(() => {
          renderChannelChart();
        });
      } finally {
        channelLoading.value = false;
      }
    };
    
    // 生成模拟渠道数据
    const generateMockChannelData = () => {
      channelData.value = [
        { channelName: '线上推广', applicationCount: 45, admissionCount: 30, conversionRate: 0.67, monthOnMonth: 0.12, weekOnWeek: 0.05 },
        { channelName: '转介绍', applicationCount: 35, admissionCount: 25, conversionRate: 0.71, monthOnMonth: 0.08, weekOnWeek: 0.03 },
        { channelName: '社区活动', applicationCount: 30, admissionCount: 20, conversionRate: 0.67, monthOnMonth: -0.05, weekOnWeek: -0.02 },
        { channelName: '园所宣传', applicationCount: 25, admissionCount: 15, conversionRate: 0.60, monthOnMonth: 0.15, weekOnWeek: 0.10 },
        { channelName: '其他', applicationCount: 15, admissionCount: 10, conversionRate: 0.67, monthOnMonth: -0.03, weekOnWeek: -0.01 }
      ];
    };
    
    // 获取趋势数据
    const fetchTrendData = async () => {
      trendLoading.value = true;
      try {
        const params: any = {
          type: trendType.value
        };
        
        if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
          params.startDate = filterForm.value.dateRange[0];
          params.endDate = filterForm.value.dateRange[1];
        }
        
        if (filterForm.value.planId) {
          params.planId = filterForm.value.planId;
        }
        
        const response = await get(ENROLLMENT_STATISTICS_ENDPOINTS.TRENDS, params);
        
        if (response.success && response.data && response.data.length > 0) {
          trendData.value = response.data;
          
          // 渲染趋势图表
          nextTick(() => {
            renderTrendChart();
          });
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '获取趋势数据失败'), true);
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true);
      } finally {
        trendLoading.value = false;
      }
    };
    
    
    // 加载统计数据
    const loadStatistics = async () => {
      loading.value = true;
      try {
        // 加载招生计划选项和总览数据
        await loadPlanOptions();
        
        // 加载渠道数据
        await fetchChannelData();
        
        // 加载趋势数据
        await fetchTrendData();
        
        // 班级分布数据（目前使用模拟数据，后续可对接真实API）
        classDistributionData.value = [
          { value: 35, name: '小班' },
          { value: 45, name: '中班' },
          { value: 65, name: '大班' },
          { value: 25, name: '学前班' },
          { value: 10, name: '特长班' }
        ];
        
        // 渲染班级分布图表
        nextTick(() => {
          renderClassChart();
        });
      } catch (error) {
        console.error('加载统计数据失败:', error);
        ElMessage.error('加载统计数据失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 渲染趋势图表
    const renderTrendChart = () => {
      if (!trendChartRef.value) return;
      
      if (!trendChart) {
        trendChart = echarts.init(trendChartRef.value);
      }
      
      const dates = trendData.value.map(item => item.date);
      const applications = trendData.value.map(item => item.applicationCount);
      const admissions = trendData.value.map(item => item.admissionCount);
      
      const option = {
        title: {
          text: '招生趋势分析'
        },
  tooltip: {
          trigger: 'axis'
        },
  legend: {
          data: ['报名人数', '录取人数']
        },
        xAxis: {
          type: 'category',
  data: dates
        },
        yAxis: {
          type: 'value'
        },
  series: [
          {
            name: '报名人数',
  type: 'line',
  data: applications,
  smooth: true,
  symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3
            }
          },
          {
            name: '录取人数',
  type: 'line',
  data: admissions,
  smooth: true,
  symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3
            }
          }
        ]
      };
      
      trendChart.setOption(option);
    };
    
    // 渲染班级分布图表
    const renderClassChart = () => {
      if (!classChartRef.value) return;
      
      if (!classChart) {
        classChart = echarts.init(classChartRef.value);
      }
      
      const option = {
        title: {
          text: '班级分布',
  left: 'center'
        },
  tooltip: {
          trigger: 'item',
  formatter: '{b}: {c} ({d}%)'
        },
  legend: {
          orient: 'vertical',
  left: 'left'
        },
  series: [
          {
            name: '班级分布',
  type: 'pie',
  radius: '55%',
  center: ['50%', '60%'],
  data: classDistributionData.value,
  emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'var(--shadow-color)'
              }
            }
          }
        ]
      };
      
      classChart.setOption(option);
    };
    
    // 渲染渠道分布图表
    const renderChannelChart = () => {
      if (!channelChartRef.value) return;
      
      if (!channelChart) {
        channelChart = echarts.init(channelChartRef.value);
      }
      
      const channelNames = channelData.value.map(item => item.channelName);
      const applicationCounts = channelData.value.map(item => item.applicationCount);
      
      const option = {
        title: {
          text: '渠道分布',
  left: 'center'
        },
  tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
  data: channelNames
        },
        yAxis: {
          type: 'value'
        },
  series: [
          {
            name: '报名人数',
  type: 'bar',
  data: applicationCounts,
            barWidth: '40%',
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      };
      
      channelChart.setOption(option);
    };
    
    // 计划变化处理
    const handlePlanChange = () => {
      loadStatistics();
    };
    
    // 查询
    const handleSearch = () => {
      loadStatistics();
    };
    
    // 重置
    const handleReset = () => {
      filterForm.value.planId = undefined;
      filterForm.value.dateRange = undefined;
      loadStatistics();
    };
    
    // 格式化百分比
    const formatPercent = (value: number) => {
      return `${(value * 100).toFixed(2)}%`;
    };
    
    // 格式化同比数据
    const formatCompare = (value: number) => {
      if (value > 0) {
        return `↑ ${(value * 100).toFixed(2)}%`;
      } else if (value < 0) {
        return `↓ ${Math.abs(value * 100).toFixed(2)}%`;
      } else {
        return '0%';
      }
    };
    
    // 获取同比样式
    const getCompareClass = (value: number): 'text-success' | 'text-danger' | '' => {
      if (value > 0) {
        return 'text-success';
      } else if (value < 0) {
        return 'text-danger';
      }
      return '';
    };
    
    // 导出Excel
    const exportExcel = async () => {
      try {
        const csvContent = [
          ['渠道名称', '报名人数', '录取人数', '转化率', '同比上月', '同比上周'],
          ...channelData.value.map(item => [
            item.channelName,
            item.applicationCount,
            item.admissionCount,
            formatPercent(item.conversionRate),
            formatCompare(item.monthOnMonth),
            formatCompare(item.weekOnWeek)
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `招生统计报告_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        ElMessage.success('导出成功');
      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
      }
    };
    
    // 生成报告
    const generateReport = async () => {
      try {
        const reportData = {
          overview: overviewData.value,
          channels: channelData.value,
          trends: trendData.value,
          classDistribution: classDistributionData.value,
          generatedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `招生统计完整报告_${new Date().toLocaleDateString()}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        ElMessage.success('报告生成成功');
      } catch (error) {
        console.error('生成报告失败:', error);
        ElMessage.error('生成报告失败');
      }
    };
    
    // 监听趋势类型变化
    watch(trendType, () => {
      fetchTrendData();
    });
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadStatistics();
      
      // 处理窗口大小变化，重新渲染图表
      window.addEventListener('resize', () => {
        trendChart?.resize();
        classChart?.resize();
        channelChart?.resize();
      });
    });
    
    return {
      // 加载状态
      loading,
      overviewLoading,
      trendLoading,
      channelLoading,
      classLoading,
      // 数据
      filterForm,
      trendType,
      planOptions,
      overviewData,
      channelData,
      trendChartRef,
      classChartRef,
      channelChartRef,
      // 方法
      handlePlanChange,
      handleSearch,
      handleReset,
      formatPercent,
      formatCompare,
      getCompareClass,
      exportExcel,
      generateReport
    };
  }
});
</script>

<style scoped>
/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  padding: var(--app-gap);
}

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  background: var(--gradient-orange); /* 硬编码修复：使用橙色渐变 */;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  margin: 0;
}

.page-header h1::after {
  content: '';
  position: absolute;
  bottom: -var(--spacing-xs);
  left: 0;
  width: auto;
  min-height: 32px; height: auto;
  background: var(--gradient-orange);
  border-radius: var(--radius-sm);
}

.filter-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
}

.filter-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
  border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.overview-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden;
}

.overview-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
}

.trend-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden;
}

.trend-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
}

.distribution-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  min-height: 60px; height: auto;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden;
}

.distribution-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
}

.channel-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden;
}

.channel-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
}

.report-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */;
  transition: all 0.3s ease;
  overflow: hidden;
}

.report-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  transform: translateY(var(--transform-hover-lift));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  font-weight: 600;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */;
  min-height: 60px; height: auto;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-blue);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-var(--spacing-xs));
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */;
  border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

.stat-card:hover::before {
  opacity: 0.05;
}

.stat-icon {
  font-size: var(--text-5xl);
  color: var(--primary-color); /* 白色区域修复：使用主题主色 */;
  margin-right: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  position: relative;
  z-index: var(--z-index-dropdown);
}

.stat-info {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: var(--z-index-dropdown);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */;
  margin-bottom: var(--app-gap-xs); /* 硬编码修复：使用统一间距变量 */
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted); /* 白色区域修复：使用主题次要文字色 */
}

.chart-container {
  min-height: 60px; height: auto;
  width: 100%;
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */;
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
}

.text-success {
  color: var(--success-color); /* 硬编码修复：使用主题成功色 */;
  font-weight: 600;
}

.text-danger {
  color: var(--danger-color); /* 硬编码修复：使用主题危险色 */;
  font-weight: 600;
}

/* 按钮排版修复：报表操作区域优化 */
.report-actions {
  display: flex;
  justify-content: center;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */;
  padding: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */;
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */;
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */;
  margin: var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
}

.report-actions .el-button {
  min-max-width: 140px; width: 100%;
  height: var(--button-height-lg);
  font-weight: 500;
}

.report-actions .el-button .el-icon {
  margin-right: var(--app-gap-xs);
}

.report-actions .el-button:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: var(--shadow-md);
}

/* 白色区域修复：Element Plus组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-card__header) {
  background: var(--bg-tertiary) !important;
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-card__body) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  padding: var(--app-gap) !important;
}

:deep(.el-form) {
  background: var(--bg-card) !important;
}

:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
  font-weight: 500;
}

:deep(.el-input .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-input .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-input .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input .el-input__inner::placeholder) {
  color: var(--text-muted) !important;
}

:deep(.el-select .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-select .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-date-editor .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-date-editor .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-date-editor .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.el-button.el-button--primary:hover) {
  background: var(--primary-light) !important;
  border-color: var(--primary-light) !important;
}

:deep(.el-button.el-button--success) {
  background: var(--success-color) !important;
  border-color: var(--success-color) !important;
}

:deep(.el-button.el-button--success:hover) {
  background: var(--success-light) !important;
  border-color: var(--success-light) !important;
}

:deep(.el-button.el-button--default) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-button.el-button--default:hover) {
  background: var(--bg-hover) !important;
  border-color: var(--border-light) !important;
}

:deep(.el-radio-group) {
  background: var(--bg-tertiary) !important;
  border-radius: var(--radius-md) !important;
  padding: var(--app-gap-xs) !important;
}

:deep(.el-radio-button__inner) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-radio-button__inner:hover) {
  background: var(--bg-hover) !important;
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: var(--bg-card) !important;
}

:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__header-wrapper .el-table__header th) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-color) !important;
  font-weight: 600;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr) {
  background: var(--bg-card) !important;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr:hover) {
  background: var(--bg-hover) !important;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr td) {
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__border-left-patch),
:deep(.el-table .el-table__border-bottom-patch) {
  background: var(--border-color) !important;
}

:deep(.el-table.el-table--border) {
  border-color: var(--border-color) !important;
}

:deep(.el-table.el-table--border::after) {
  background: var(--border-color) !important;
}

:deep(.el-table.el-table--border::before) {
  background: var(--border-color) !important;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header h1 {
    font-size: var(--spacing-lg);
  }
  
  .stat-card {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  min-height: 60px; height: auto;
  }
  
  .stat-icon {
    font-size: var(--text-4xl);
    margin-right: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-value {
    font-size: var(--spacing-lg);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
  
  .chart-container {
    min-height: 60px; height: auto;
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .distribution-card {
    min-height: 60px; height: auto;
  }
  
  .report-actions {
    flex-direction: column;
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */;
  padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .report-actions .el-button {
    min-max-width: 120px; width: 100%;
    height: var(--button-height-md);
    font-size: var(--text-sm);
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-sm) !important;
  }
  
  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-bottom: var(--app-gap-sm);
  }
  
  :deep(.el-radio-group) {
    padding: var(--app-gap-xs) !important;
  }
  
  :deep(.el-col) {
    margin-bottom: var(--app-gap-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-container {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-header h1 {
    font-size: var(--text-lg);
  }
  
  .stat-card {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */;
  min-height: 60px; height: auto;
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    font-size: var(--text-3xl);
    margin-right: 0;
    margin-bottom: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .stat-value {
    font-size: var(--text-lg);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
  
  .chart-container {
    min-height: 60px; height: auto;
  }
  
  .distribution-card {
    min-height: 60px; height: auto;
  }
  
  .report-actions .el-button {
    min-max-width: 100px; width: 100%;
    height: var(--spacing-3xl);
    font-size: var(--text-xs);
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-xs) !important;
  }
  
  :deep(.el-table .el-table__cell) {
    padding: var(--app-gap-xs) !important;
    font-size: var(--text-xs);
  }
  
  :deep(.el-col) {
    margin-bottom: var(--app-gap-xs);
  }
}
</style> 