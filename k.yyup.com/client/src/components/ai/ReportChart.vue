<template>
  <div class="ai-report-chart" :style="{ height: height + 'px' }">
    <!-- 图表标题区域 -->
    <div class="chart-title-section" v-if="title || description">
      <h3 class="chart-title">{{ title }}</h3>
      <p class="chart-description" v-if="description">{{ description }}</p>
    </div>

    <!-- 图表工具栏区域 -->
    <div class="chart-toolbar-section" v-if="showToolbar && allowChangeType">
      <div class="chart-type-selector">
        <button
          v-for="type in availableTypes"
          :key="type.value"
          class="chart-type-button"
          :class="{ active: chartType === type.value }"
          @click="changeChartType(type.value)"
        >
          <i :class="type.icon"></i>
          <span>{{ type.label }}</span>
        </button>
      </div>
    </div>

    <!-- 图表显示区域 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 图表图例区域 -->
    <div class="chart-legend" v-if="showLegend">
      <div
        v-for="(series, index) in chartSeries"
        :key="index"
        class="legend-item"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: getSeriesColor(index) }"
        ></span>
        <span class="legend-label">{{ series.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  CanvasRenderer
]);

export default {
  name: 'AiReportChart',
  props: {
    // 数据结构：{ xAxis: ['Jan', 'Feb'], series: [{ name: 'Sales', data: [100, 200] }] }
    data: {
      type: Object,
      required: true
    },
    // 图表类型：'bar', 'line', 'pie'
    type: {
      type: String,
      default: 'bar',
      validator: (value) => ['bar', 'line', 'pie'].includes(value)
    },
    // 可用的图表类型
    availableTypes: {
      type: Array,
      default: () => [
        { value: 'bar', label: '柱状图', icon: 'bar-chart-3' },
        { value: 'line', label: '折线图', icon: 'trending-up' },
        { value: 'pie', label: '饼图', icon: 'pie-chart' }
      ]
    },
    // 是否允许切换图表类型
    allowChangeType: {
      type: Boolean,
      default: true
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 描述
    description: {
      type: String,
      default: ''
    },
    // 图表高度
    height: {
      type: Number,
      default: 300
    },
    // 是否显示工具栏
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 是否显示图例
    showLegend: {
      type: Boolean,
      default: true
    },
    // 图表主题
    theme: {
      type: String,
      default: ''
    },
    // 配色方案
    colors: {
      type: Array,
      default: () => []
    }
  },
  
  setup(props, { emit }) {
    const chartContainer = ref(null);
    const chartInstance = ref(null);
    const chartType = ref(props.type);
    
    // 基于props.data提取的系列数据
    const chartSeries = computed(() => {
      return props.data.series || [];
    });
    
    // 颜色获取
    const defaultColors = [
      '#2463EB', 'var(--game-success)', 'var(--accent-activity)', 'var(--game-danger)', 'var(--accent-marketing)',
      '#EC4899', '#14B8A6', '#F97316', 'var(--accent-personnel)', 'var(--accent-system)'
    ];
    
    const getSeriesColor = (index) => {
      if (props.colors && props.colors.length > 0) {
        return props.colors[index % props.colors.length];
      }
      return defaultColors[index % defaultColors.length];
    };
    
    // 初始化图表
    const initChart = () => {
      if (chartContainer.value) {
        // 如果已有图表实例，销毁它
        if (chartInstance.value) {
          chartInstance.value.dispose();
        }

        // 创建新的图表实例
        chartInstance.value = echarts.init(chartContainer.value, props.theme);

        // 更新图表配置
        updateChartOption();

        // 监听窗口大小变化，调整图表尺寸
        const resizeHandler = () => {
          chartInstance.value && chartInstance.value.resize();
        };
        window.addEventListener('resize', resizeHandler);

        // 组件销毁时移除事件监听
        onBeforeUnmount(() => {
          window.removeEventListener('resize', resizeHandler);
          chartInstance.value && chartInstance.value.dispose();
        });
      }
    };
    
    // 更新图表配置
    const updateChartOption = () => {
      if (!chartInstance.value || !props.data) return;

      let option;

      // 根据图表类型构建不同的配置
      if (chartType.value === 'pie') {
        option = getPieChartOption();
      } else if (chartType.value === 'line') {
        option = getLineChartOption();
      } else {
        option = getBarChartOption();
      }

      // 设置图表选项
      chartInstance.value.setOption(option);
    };
    
    // 构建柱状图配置
    const getBarChartOption = () => {
      const option = {
        color: props.colors.length > 0 ? props.colors : defaultColors,
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
          data: props.data.xAxis || [],
          axisLabel: {
            interval: 0,
            rotate: props.data.xAxis && props.data.xAxis.length > 8 ? 30 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: (props.data.series || []).map(series => ({
          name: series.name,
          type: 'bar',
          data: series.data,
          emphasis: {
            focus: 'series'
          }
        }))
      };
      
      // 不在这里显示图例，使用自定义图例
      if (!props.showLegend) {
        option.legend = { show: false };
      }
      
      return option;
    };
    
    // 构建折线图配置
    const getLineChartOption = () => {
      const option = {
        color: props.colors.length > 0 ? props.colors : defaultColors,
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: props.data.xAxis || [],
          axisLabel: {
            interval: 0,
            rotate: props.data.xAxis && props.data.xAxis.length > 8 ? 30 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: (props.data.series || []).map(series => ({
          name: series.name,
          type: 'line',
          data: series.data,
          smooth: true,
          emphasis: {
            focus: 'series'
          }
        }))
      };
      
      // 不在这里显示图例，使用自定义图例
      if (!props.showLegend) {
        option.legend = { show: false };
      }
      
      return option;
    };
    
    // 构建饼图配置
    const getPieChartOption = () => {
      // 饼图数据转换
      let pieData = [];
      
      // 注意：饼图只能显示一个系列的数据
      if (props.data.series && props.data.series.length > 0) {
        const series = props.data.series[0];
        pieData = props.data.xAxis.map((label, index) => ({
          name: label,
          value: series.data[index]
        }));
      }
      
      const option = {
        color: props.colors.length > 0 ? props.colors : defaultColors,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: props.data.series && props.data.series.length > 0 ? props.data.series[0].name : '',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'var(--shadow-heavy)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          }
        ]
      };
      
      // 不在这里显示图例，使用自定义图例
      if (!props.showLegend) {
        option.legend = { show: false };
      }
      
      return option;
    };
    
    // 切换图表类型
    const changeChartType = (type) => {
      chartType.value = type;
      updateChartOption();
      emit('change-type', type);
    };
    
    // 监听数据变化，更新图表
    watch(() => props.data, () => {
      updateChartOption();
    }, { deep: true });
    
    // 监听主题变化
    watch(() => props.theme, () => {
      // 重新初始化图表以应用新主题
      initChart();
    });
    
    // 监听图表类型变化
    watch(() => props.type, (newType) => {
      chartType.value = newType;
      updateChartOption();
    });
    
    // 组件挂载后初始化图表
    onMounted(() => {
      initChart();
    });
    
    return {
      chartContainer,
      chartType,
      chartSeries,
      changeChartType,
      getSeriesColor
    };
  }
};
</script>

<style scoped lang="scss">
.ai-report-chart {
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--border-color-light);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--z-index-below));
  }
}

/* 图表标题区域 */
.chart-title-section {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--z-index-dropdown) solid var(--border-color-lighter);
}

.chart-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  &::before {
    content: '📊';
    font-size: var(--font-size-xl);
  }
}

.chart-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

/* 图表工具栏区域 */
.chart-toolbar-section {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}



.chart-type-selector {
  display: flex;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  border: var(--border-width) solid var(--border-color-light);
}

.chart-type-button {
  background: none;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal) ease;
  position: relative;

  &:hover {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  &.active {
    background: var(--ai-gradient);
    color: var(--ai-text-white);
    box-shadow: var(--shadow-sm);
  }

  span {
    position: relative;
    z-index: var(--z-index-dropdown);
  }
}

.chart-container {
  flex: 1;
  width: 100%;
  min-min-height: 60px; height: auto;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--border-color-lighter);
  margin-top: var(--spacing-sm);
  position: relative;
  overflow: hidden;

  &.loading {
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '📊 正在加载图表...';
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
  }
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
  gap: var(--spacing-sm);
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-right: var(--spacing-md);
}

.legend-color {
  width: var(--text-sm);
  height: var(--text-sm);
  border-radius: var(--radius-xs);
}

.legend-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>