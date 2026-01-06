<template>
  <div class="ai-component-renderer">
    <div v-if="parsedData && parsedData.type" :key="renderKey">
      <!-- 待办事项组件 -->
      <ai-todo-list
        v-if="parsedData.type === 'todo-list'"
        :value="parsedData.value"
        :title="parsedData.title"
        :editable="parsedData.editable !== false"
        :showProgress="parsedData.showProgress !== false"
        @change="handleComponentChange"
      />
      
      <!-- 数据表格组件 -->
      <ai-data-table
        v-else-if="parsedData.type === 'data-table'"
        :data="parsedData.data"
        :columns="parsedData.columns"
        :title="parsedData.title || '数据表格'"
        :searchable="parsedData.searchable !== false"
        :pagination="parsedData.pagination !== false"
        :pageSize="parsedData.pageSize || 10"
        :showToolbar="parsedData.showToolbar !== false"
        :exportable="parsedData.exportable !== false"
        :emptyText="parsedData.emptyText || '暂无数据'"
      />
      
      <!-- 报表图表组件 -->
      <ai-report-chart
        v-else-if="parsedData.type === 'chart'"
        :data="parsedData.data"
        :type="parsedData.chartType || 'bar'"
        :title="parsedData.title"
        :description="parsedData.description"
        :height="parsedData.height || 300"
        :showToolbar="parsedData.showToolbar !== false"
        :showLegend="parsedData.showLegend !== false"
        :theme="parsedData.theme || ''"
        :colors="parsedData.colors || []"
        :allowChangeType="parsedData.allowChangeType !== false"
        @change-type="handleChartTypeChange"
      />
      
      <!-- 操作面板组件 -->
      <operation-panel
        v-else-if="parsedData.type === 'operation-panel'"
        :title="parsedData.title"
        :status="parsedData.status"
        :steps="parsedData.steps"
        :activeStep="parsedData.activeStep"
        :screenshot="parsedData.screenshot"
        :highlights="parsedData.highlights"
        :results="parsedData.results"
        :showActions="parsedData.showActions"
        :canRetry="parsedData.canRetry"
        :canContinue="parsedData.canContinue"
        @retry="handleOperationRetry"
        @continue="handleOperationContinue"
        @close="handleOperationClose"
      />

      <!-- 🔧 统计卡片组件 -->
      <div v-else-if="parsedData.type === 'stat-card'" class="stat-cards-container">
        <h3 v-if="parsedData.title" class="stat-cards-title">{{ parsedData.title }}</h3>
        <div class="stat-cards-grid">
          <stat-card
            v-for="(value, key) in parsedData.data"
            :key="key"
            :title="formatStatTitle(key)"
            :value="value"
            :icon="getStatIcon(key)"
            :type="getStatType(key)"
            size="small"
          />
        </div>
      </div>

      <!-- 📄 文档预览组件 -->
      <document-preview
        v-else-if="parsedData.type === 'document'"
        :documentInfo="parsedData.documentInfo"
        @download="handleDocumentDownload"
        @close="handleDocumentClose"
      />

      <!-- 🖼️ 媒体相册组件 -->
      <media-gallery
        v-else-if="parsedData.type === 'media-gallery'"
        :data="parsedData.data"
        :title="parsedData.title || '媒体相册'"
        :statistics="parsedData.statistics"
        :pageSize="parsedData.pageSize || 12"
      />

      <!-- 🆕 错误组件类型 -->
      <div v-else-if="parsedData.type === 'error'" class="error-component">
        <div class="error-header">
          <UnifiedIcon name="alert-triangle" :size="16" />
          <span>{{ parsedData.title || '组件渲染错误' }}</span>
        </div>
        <div class="error-message">{{ parsedData.message }}</div>
        <div v-if="parsedData.preview" class="error-preview">
          <details>
            <summary>数据预览</summary>
            <pre>{{ parsedData.preview }}</pre>
          </details>
        </div>
      </div>

      <!-- 未知组件类型 -->
      <div v-else class="unknown-component">
        <div class="unknown-header">
          <UnifiedIcon name="alert-triangle" :size="16" />
          <span>未识别的组件类型: {{ parsedData.type }}</span>
        </div>
        <pre class="json-data">{{ jsonString }}</pre>
      </div>
    </div>
    
    <!-- JSON解析错误 -->
    <div v-else-if="parseError" class="parse-error">
      <div class="error-header">
        <UnifiedIcon name="x-circle" :size="16" />
        <span>JSON 解析错误</span>
      </div>
      <div class="error-message">{{ parseError }}</div>
      <pre class="json-data">{{ jsonString }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import AiTodoList from './TodoList.vue';
import AiDataTable from './DataTable.vue';
import AiReportChart from './ReportChart.vue';
import OperationPanel from './OperationPanel.vue';
import StatCard from '@/components/centers/StatCard.vue';
import DocumentPreview from '@/components/ai-assistant/document/DocumentPreview.vue';
import MediaGallery from './MediaGallery.vue';

export default {
  name: 'AiComponentRenderer',
  components: {
    AiTodoList,
    AiDataTable,
    AiReportChart,
    OperationPanel,
    StatCard,
    DocumentPreview,
    MediaGallery
  },
  
  props: {
    jsonData: {
      type: [String, Object],
      required: true
    }
  },
  
  emits: ['update:jsonData', 'component-change'],
  
  setup(props, { emit }) {
    const parseError = ref(null);
    const parsedData = ref(null);
    const renderKey = ref(0);

    // 转换统计数据为图表数据格式
    const convertStatisticsToChartData = (statisticsData) => {
      if (!statisticsData || !statisticsData.data) {
        return { xAxis: [], series: [] };
      }

      const data = statisticsData.data;

      // 处理不同类型的统计数据
      if (Array.isArray(data)) {
        // 数组格式：[{name: 'xxx', value: 123}, ...]
        if (data.length > 0 && typeof data[0] === 'object' && data[0].name !== undefined) {
          return {
            xAxis: data.map(item => item.name || item.label || item.category),
            series: [{
              name: statisticsData.title || '数据',
              data: data.map(item => item.value || item.count || 0)
            }]
          };
        }
        // 简单数组格式：[10, 20, 30, ...]
        else if (data.length > 0 && typeof data[0] === 'number') {
          return {
            xAxis: data.map((_, index) => `项目${index + 1}`),
            series: [{
              name: statisticsData.title || '数据',
              data: data
            }]
          };
        }
      }

      // 对象格式：{labels: [...], datasets: [...]}
      if (data.labels && data.datasets) {
        return {
          xAxis: data.labels,
          series: data.datasets.map(dataset => ({
            name: dataset.label || '数据',
            data: dataset.data || []
          }))
        };
      }

      // 对象格式：{xAxis: [...], series: [...]}
      if (data.xAxis && data.series) {
        return data;
      }

      // 默认空数据
      return { xAxis: [], series: [] };
    };

    // 解析JSON数据
    const parseJsonData = () => {
      if (!props.jsonData) {
        parseError.value = '无数据';
        parsedData.value = null;
        return;
      }

      try {
        console.log('🎨 [ComponentRenderer] 开始解析数据:', typeof props.jsonData === 'string' ? props.jsonData.substring(0, 200) + '...' : props.jsonData);

        // 🆕 防止死循环：如果解析中发生错误，提供错误恢复机制
        const parseStartTime = Date.now();
        const PARSE_TIMEOUT = 5000; // 5秒解析超时

        // 如果是字符串，尝试解析为JSON
        if (typeof props.jsonData === 'string') {
          // 尝试找出JSON部分（从 ```json 到 ``` 之间的内容）
          const jsonMatch = props.jsonData.match(/```json\n([\s\S]*?)\n```/) ||
                           props.jsonData.match(/```([\s\S]*?)```/);

          if (jsonMatch && jsonMatch[1]) {
            parsedData.value = JSON.parse(jsonMatch[1].trim());
          } else {
            // 尝试直接解析整个字符串
            parsedData.value = JSON.parse(props.jsonData);
          }
        } else {
          // 如果已经是对象，需要处理不同的数据结构
          let dataToProcess = props.jsonData;

          // 🔧 修复：处理包含 ui_instruction 的统计工具返回结果
          if (dataToProcess.ui_instruction && dataToProcess.ui_instruction.type === 'render_statistics') {
            // 转换统计数据为图表组件格式
            const uiInstruction = dataToProcess.ui_instruction;
            const statisticsData = dataToProcess.statistics;

            parsedData.value = {
              type: 'chart',
              title: uiInstruction.title || '统计报表',
              chartType: uiInstruction.chart_type || 'bar',
              data: convertStatisticsToChartData(statisticsData),
              showLegend: true,
              exportable: true
            };
          }
          // 🔧 修复：处理嵌套的 result.ui_instruction 结构
          else if (dataToProcess.result && dataToProcess.result.ui_instruction && dataToProcess.result.ui_instruction.type === 'render_statistics') {
            const uiInstruction = dataToProcess.result.ui_instruction;
            const statisticsData = dataToProcess.result.statistics;

            parsedData.value = {
              type: 'chart',
              title: uiInstruction.title || '统计报表',
              chartType: uiInstruction.chart_type || 'bar',
              data: convertStatisticsToChartData(statisticsData),
              showLegend: true,
              exportable: true
            };
          }
          // 🔧 修复：处理包含 component 字段的结果
          else if (dataToProcess.component && dataToProcess.component.type) {
            parsedData.value = dataToProcess.component;
          }
          // 🔧 修复：处理嵌套的 result.component 结构
          else if (dataToProcess.result && dataToProcess.result.component && dataToProcess.result.component.type) {
            parsedData.value = dataToProcess.result.component;
          }
          // 📋 处理 TodoList 工具返回的 ui_component 结构
          else if (dataToProcess.result && dataToProcess.result.ui_component === 'todo-list') {
            const uiData = dataToProcess.result.ui_data || dataToProcess.result;
            const taskList = [];
            if (uiData.tasks && Array.isArray(uiData.tasks)) {
              for (const task of uiData.tasks) {
                taskList.push({
                  text: task.title || task.text || '',
                  completed: task.status === 'completed',
                  priority: task.priority || 'normal',
                  dueDate: task.dueDate
                });
              }
            }
            parsedData.value = {
              type: 'todo-list',
              title: dataToProcess.result.message || '任务清单',
              value: taskList,
              showProgress: true,
              editable: true,
              stats: uiData.stats,
              progress: uiData.progress
            };
          }
          // 📋 处理 create_todo_list 工具返回的结构
          else if (dataToProcess.result && dataToProcess.result.todoListId && dataToProcess.result.tasks) {
            const taskList2 = [];
            if (dataToProcess.result.tasks && Array.isArray(dataToProcess.result.tasks)) {
              for (const task of dataToProcess.result.tasks) {
                taskList2.push({
                  text: task.title || task.text || '',
                  completed: task.status === 'completed',
                  priority: task.priority || 'normal'
                });
              }
            }
            parsedData.value = {
              type: 'todo-list',
              title: dataToProcess.result.title || '任务清单',
              value: taskList2,
              showProgress: true,
              editable: true
            };
          }
          // 默认：直接使用原始数据
          else {
            parsedData.value = dataToProcess;
          }
        }

        console.log('✅ [ComponentRenderer] 解析完成:', {
          type: parsedData.value?.type,
          title: parsedData.value?.title,
          dataLength: parsedData.value?.data?.length,
          columns: parsedData.value?.columns,
          parsedData: parsedData.value
        });

        parseError.value = null;

        // 🆕 检查解析耗时
        const parseDuration = Date.now() - parseStartTime;
        if (parseDuration > PARSE_TIMEOUT) {
          console.warn('⚠️ [ComponentRenderer] 解析耗时过长:', parseDuration + 'ms');
          parseError.value = `解析超时: 耗时${parseDuration}ms，可能数据格式有问题`;
          parsedData.value = null;
          return;
        }

        // 增加key以强制组件重新渲染
        renderKey.value += 1;
      } catch (error) {
        console.error('❌ [ComponentRenderer] 解析失败:', error);
        parseError.value = `解析失败: ${error.message}`;
        parsedData.value = null;

        // 🆕 错误恢复：如果解析失败，显示原始数据的预览
        if (typeof props.jsonData === 'string' && props.jsonData.length > 1000) {
          parsedData.value = {
            type: 'error',
            title: '数据解析失败',
            message: '数据格式可能有问题，请检查后端返回的数据格式',
            preview: props.jsonData.substring(0, 500) + '...'
          };
        }
      }
    };
    
    // 格式化的JSON字符串，用于显示
    const jsonString = computed(() => {
      if (typeof props.jsonData === 'string') {
        return props.jsonData;
      } else {
        return JSON.stringify(props.jsonData, null, 2);
      }
    });
    
    // 处理组件内部数据变更
    const handleComponentChange = (newData) => {
      if (parsedData.value) {
        parsedData.value.data = newData;
        emit('update:jsonData', parsedData.value);
        emit('component-change', {
          type: parsedData.value.type,
          data: newData
        });
      }
    };
    
    // 处理图表类型变更
    const handleChartTypeChange = (newType) => {
      if (parsedData.value && parsedData.value.type === 'chart') {
        parsedData.value.chartType = newType;
        emit('update:jsonData', parsedData.value);
        emit('component-change', {
          type: 'chart',
          chartType: newType
        });
      }
    };
    
    // 处理操作面板事件
    const handleOperationRetry = () => {
      emit('component-change', {
        type: 'operation-panel',
        action: 'retry'
      });
    };
    
    const handleOperationContinue = () => {
      emit('component-change', {
        type: 'operation-panel',
        action: 'continue'
      });
    };
    
    const handleOperationClose = () => {
      emit('component-change', {
        type: 'operation-panel',
        action: 'close'
      });
    };

    // 📄 处理文档下载
    const handleDocumentDownload = (url) => {
      // 创建隐藏的a标签进行下载
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      emit('component-change', {
        type: 'document',
        action: 'download',
        url
      });
    };

    // 📄 处理文档关闭
    const handleDocumentClose = () => {
      emit('component-change', {
        type: 'document',
        action: 'close'
      });
    };

    // 🔧 格式化统计卡片标题
    const formatStatTitle = (key) => {
      const titleMap = {
        totalClasses: '班级总数',
        totalStudents: '学生总数',
        totalTeachers: '教师总数',
        enrollmentRate: '入学率',
        activeStudents: '活跃学生',
        teacherStudentRatio: '师生比',
        capacityUtilization: '容量利用率'
      };
      return titleMap[key] || key;
    };

    // 🔧 获取统计卡片图标
    const getStatIcon = (key) => {
      const iconMap = {
        totalClasses: 'School',
        totalStudents: 'User',
        totalTeachers: 'UserFilled',
        enrollmentRate: 'TrendCharts',
        activeStudents: 'Checked',
        teacherStudentRatio: 'DataAnalysis',
        capacityUtilization: 'PieChart'
      };
      return iconMap[key] || 'DataLine';
    };

    // 🔧 获取统计卡片类型
    const getStatType = (key) => {
      const typeMap = {
        totalClasses: 'primary',
        totalStudents: 'success',
        totalTeachers: 'warning',
        enrollmentRate: 'info',
        activeStudents: 'success',
        teacherStudentRatio: 'primary',
        capacityUtilization: 'warning'
      };
      return typeMap[key] || 'default';
    };

    // 监听数据变化，重新解析
    watch(() => props.jsonData, () => {
      parseJsonData();
    }, { immediate: true });

    return {
      parsedData,
      parseError,
      jsonString,
      renderKey,
      convertStatisticsToChartData,
      handleComponentChange,
      handleChartTypeChange,
      handleOperationRetry,
      handleOperationContinue,
      handleOperationClose,
      handleDocumentDownload,
      handleDocumentClose,
      formatStatTitle,
      getStatIcon,
      getStatType
    };
  }
};
</script>

<style scoped lang="scss">
.ai-component-renderer {
  width: 100%;
  font-size: inherit; /* 继承父组件的字体大小，允许动态调整 */
}

// 🔧 统计卡片容器样式
.stat-cards-container {
  margin: var(--text-lg) 0;

  .stat-cards-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--text-sm);
  }

  .stat-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--text-sm);
  }
}

.error-component,
.unknown-component,
.parse-error {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--border-color-light);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.unknown-header,
.error-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.unknown-header i,
.error-header i {
  color: var(--warning-color);
}

.error-header i {
  color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  margin-bottom: var(--spacing-md);
}

.error-preview {
  margin-top: var(--spacing-md);

  details {
    summary {
      cursor: pointer;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      padding: var(--spacing-sm);
      background-color: var(--bg-secondary);
      border-radius: var(--border-radius-sm);
      margin-bottom: var(--spacing-sm);

      &:hover {
        background-color: var(--bg-tertiary);
      }
    }

    pre {
      background-color: var(--bg-secondary);
      border-radius: var(--border-radius-sm);
      padding: var(--spacing-md);
      overflow-x: auto;
      font-family: monospace;
      font-size: var(--font-size-sm);
      color: var(--text-regular);
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 60px;
      height: auto;
      overflow-y: auto;
    }
  }
}

.json-data {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  overflow-x: auto;
  font-family: monospace;
  font-size: var(--font-size-sm);
  color: var(--text-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 深色模式适配 */
:root[data-theme="dark"] .unknown-component,
:root[data-theme="dark"] .parse-error {
  border-color: var(--border-color);
}

:root[data-theme="dark"] .json-data {
  background-color: var(--bg-tertiary);
}
</style> 