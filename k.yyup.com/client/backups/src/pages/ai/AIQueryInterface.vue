<template>
  <div class="ai-query-interface">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="connection-status">
        <el-tag
          :type="aiConnected ? 'success' : connectionStatus === 'connecting' ? 'warning' : 'info'"
          effect="light"
          size="small"
        >
          <el-icon><Connection /></el-icon>
          {{ connectionStatusText }}
        </el-tag>
      </div>
      <h1 class="page-title">
        <el-icon><DataAnalysis /></el-icon>
        AI智能查询
      </h1>
      <p class="page-description">
        通过自然语言描述您的查询需求，AI将自动生成SQL查询并返回结果
      </p>
    </div>

    <!-- 查询输入区域 -->
    <el-card class="input-section" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><ChatLineRound /></el-icon>
          <span>智能查询</span>
          <div class="header-actions">
            <el-tooltip content="查看示例查询">
              <el-button size="small" @click="showExamples = true">
                <el-icon><QuestionFilled /></el-icon>
                示例
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看查询历史">
              <el-button size="small" @click="showHistory = true">
                <el-icon><Clock /></el-icon>
                历史
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
      
      <div class="query-input-container">
        <el-input
          v-model="naturalLanguageQuery"
          type="textarea"
          :rows="4"
          placeholder="请用中文描述您的查询需求，例如：查询本月新入学的学生人数"
          class="query-textarea"
          :maxlength="1000"
          show-word-limit
          @input="onQueryInput"
          @keydown.ctrl.enter="executeQuery"
        />
        
        <div class="input-tools">
          <div class="tools-left">
            <el-button size="small" @click="clearQuery" :disabled="!naturalLanguageQuery?.value">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
            <el-button size="small" @click="showTemplates = true">
              <el-icon><Collection /></el-icon>
              模板
            </el-button>
          </div>
          <div class="tools-right">
            <el-button
              type="primary"
              @click="executeQuery"
              :loading="querying"
              :disabled="!naturalLanguageQuery?.value?.trim?.()"
            >
              <el-icon><Search /></el-icon>
              执行查询
              <span class="shortcut-hint">(Ctrl+Enter)</span>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 智能提示 -->
      <div class="suggestions" v-if="suggestions.length > 0">
        <div class="suggestions-header">
          <el-icon><Star /></el-icon>
          <span>智能建议</span>
        </div>
        <div class="suggestions-list">
          <el-tag
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="applySuggestion(suggestion)"
            class="suggestion-tag"
            type="info"
          >
            {{ suggestion.displayName }}
            <el-tooltip :content="suggestion.description" placement="top">
              <el-icon class="suggestion-info"><InfoFilled /></el-icon>
            </el-tooltip>
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- AI处理状态 -->
    <el-card class="processing-section" v-if="processing" shadow="never">
      <div class="ai-processing">
        <el-steps :active="currentStep" finish-status="success" simple>
          <el-step title="获取AI模型" />
          <el-step title="获取权限表" />
          <el-step title="分析查询意图" />
          <el-step title="获取表结构" />
          <el-step title="生成SQL语句" />
          <el-step title="执行查询" />
          <el-step title="生成可视化" />
          <el-step title="组装响应" />
        </el-steps>
        
        <div class="processing-details">
          <p class="processing-message">{{ processingMessage }}</p>
          <el-progress 
            :percentage="processingProgress" 
            :stroke-width="8"
            :show-text="false"
          />
          <div class="processing-stats">
            <span>耗时: {{ Math.round(processingTime / 1000) }}s</span>
            <span v-if="currentSessionId && typeof currentSessionId === 'string'">会话: {{ currentSessionId.substring(0, 8) }}...</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- SQL预览与编辑 -->
    <el-card class="sql-section" v-if="generatedSQL" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>生成的SQL查询</span>
          <div class="header-actions">
            <el-tooltip content="编辑SQL">
              <el-button @click="toggleSQLEdit" size="small" :type="editingSQL ? 'success' : 'default'">
                <el-icon><Edit /></el-icon>
                {{ editingSQL ? '完成编辑' : '编辑SQL' }}
              </el-button>
            </el-tooltip>
            <el-tooltip content="复制SQL">
              <el-button @click="copySQLToClipboard" size="small">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
      
      <div class="sql-editor-container">
        <MonacoEditor
          v-model="editableSQL"
          language="sql"
          :options="editorOptions"
          height="200px"
          @change="onSQLChange"
        />
      </div>
      
      <div class="sql-info">
        <el-descriptions :column="3" size="small" border>
          <el-descriptions-item label="查询类型">
            <el-tag size="small" :type="getQueryTypeTagType(queryType)">
              {{ queryType || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="涉及表">
            {{ involvedTables.join(', ') || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="预估耗时">
            {{ estimatedTime }}ms
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- AI回答展示 -->
    <el-card class="ai-response-section" v-if="queryResults && queryResults.type === 'ai_response'" shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><ChatLineRound /></el-icon>
          <span>AI回答</span>
        </div>
      </template>
      
      <div class="ai-response-content">
        <div class="response-text">{{ queryResults.response }}</div>
        <div class="response-meta">
          <el-tag size="small" type="success">非数据库查询</el-tag>
          <span class="session-info">会话ID: {{ queryResults.sessionId?.substring(0, 8) }}...</span>
        </div>
      </div>
    </el-card>

    <!-- 查询结果展示 -->
    <QueryResultDisplay
      v-if="queryResults && queryResults.type === 'data_query'"
      :results="queryResults"
      :loading="querying"
      @export="exportResults"
      @refresh="refreshQuery"
      @feedback="showFeedbackDialog"
    />

    <!-- 查询模板对话框 -->
    <QueryTemplatesDialog
      v-model="showTemplates"
      @select="selectTemplate"
    />

    <!-- 查询历史对话框 -->
    <QueryHistoryDialog
      v-model="showHistory"
      @select="selectHistoryQuery"
    />

    <!-- 示例查询对话框 -->
    <ExampleQueriesDialog
      v-model="showExamples"
      @select="selectExample"
    />

    <!-- 反馈对话框 -->
    <FeedbackDialog
      v-model="showFeedback"
      :query-log-id="currentQueryLogId"
      @submitted="onFeedbackSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis, ChatLineRound, QuestionFilled, Clock, Delete,
  Collection, Search, Star, InfoFilled, Document, Edit,
  CopyDocument, Connection
} from '@element-plus/icons-vue'
import MonacoEditor from '@/components/common/MonacoEditor.vue'
import QueryResultDisplay from './components/QueryResultDisplay.vue'
import QueryTemplatesDialog from './components/QueryTemplatesDialog.vue'
import QueryHistoryDialog from './components/QueryHistoryDialog.vue'
import ExampleQueriesDialog from './components/ExampleQueriesDialog.vue'
import FeedbackDialog from './components/FeedbackDialog.vue'
import { useAIQuery } from '@/composables/useAIQuery'
import { debounce } from 'lodash-es'

// ==================== 移除WebSocket，使用简单的连接状态管理 ====================
// 🔧 移除了 usePersistentProgress 和 WebSocket 连接
// 现在直接通过 HTTP API 调用后端服务
const aiConnected = ref(false) // 保持兼容性，但始终为false
const connectionStatus = ref<'disconnected'>('disconnected')
const connectionStatusText = computed(() => '已断开')

// 空函数保持兼容性
const establishConnection = () => Promise.resolve()
const updateActivity = () => {}
const subscribeProgress = () => {}

// 使用AI查询组合式函数
const {
  naturalLanguageQuery,
  generatedSQL,
  queryResults,
  processing,
  querying,
  executeQuery: execute,
  currentStep,
  processingMessage,
  processingProgress,
  processingTime,
  currentSessionId,
  clearQuery: clear,
  refreshQuery: refresh
} = useAIQuery()

// 响应式数据
const editingSQL = ref(false)
const editableSQL = ref('')
const suggestions = ref([])
const showTemplates = ref(false)
const showHistory = ref(false)
const showExamples = ref(false)
const showFeedback = ref(false)
const currentQueryLogId = ref<number | null>(null)

// 计算属性
const editorOptions = computed(() => ({
  readOnly: !editingSQL.value,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  automaticLayout: true,
  theme: 'vs-light'
}))

const queryType = computed(() => {
  if (!generatedSQL.value) return ''
  const sql = generatedSQL.value.toUpperCase()
  if (sql.includes('SELECT')) return 'SELECT'
  if (sql.includes('COUNT')) return 'COUNT'
  if (sql.includes('SUM')) return 'SUM'
  if (sql.includes('AVG')) return 'AVG'
  return 'QUERY'
})

const involvedTables = computed(() => {
  if (!generatedSQL.value) return []
  const matches = generatedSQL.value.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi)
  if (!matches) return []
  return Array.from(new Set(
    matches.map(match => match.replace(/FROM\s+|JOIN\s+/gi, '').trim())
  ))
})

const estimatedTime = computed(() => {
  // 简单的执行时间估算逻辑
  const baseTime = 100
  const complexity = involvedTables.value.length * 50
  const hasJoin = generatedSQL.value?.includes('JOIN') ? 100 : 0
  return baseTime + complexity + hasJoin
})

// 方法
const executeQuery = async () => {
  try {
    await execute()
    if (queryResults.value) {
      // 查询成功，可以设置查询日志ID用于反馈
      currentQueryLogId.value = queryResults.value.queryLogId
    }
  } catch (error: any) {
    ElMessage.error(error.message || '查询执行失败')
  }
}

const clearQuery = () => {
  clear()
  editableSQL.value = ''
  suggestions.value = []
  currentQueryLogId.value = null
}

const refreshQuery = async () => {
  try {
    await refresh()
  } catch (error: any) {
    ElMessage.error(error.message || '刷新查询失败')
  }
}

const toggleSQLEdit = () => {
  editingSQL.value = !editingSQL.value
  if (editingSQL.value) {
    editableSQL.value = generatedSQL.value || ''
  } else {
    // 保存编辑的SQL
    if (editableSQL.value !== generatedSQL.value) {
      generatedSQL.value = editableSQL.value
    }
  }
}

const onSQLChange = (value: string) => {
  editableSQL.value = value
}

const copySQLToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedSQL.value || '')
    ElMessage.success('SQL已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const getQueryTypeTagType = (type: string) => {
  const typeMap: { [key: string]: string } = {
    'SELECT': 'primary',
    'COUNT': 'success',
    'SUM': 'warning',
    'AVG': 'info'
  }
  return typeMap[type] || 'default'
}

// 智能提示相关
const onQueryInput = debounce(async (value: string) => {
  if (value.length > 5) {
    await generateSuggestions(value)
  } else {
    suggestions.value = []
  }
}, 500)

const generateSuggestions = async (query: string) => {
  try {
    // 这里应该调用API获取建议
    // const response = await aiQueryApi.getSuggestions(query)
    // suggestions.value = response.data
    
    // 临时模拟数据
    suggestions.value = [
      {
        id: 1,
        displayName: '学生人数统计',
        description: '统计在校学生总数'
      },
      {
        id: 2,
        displayName: '按班级统计',
        description: '按班级统计学生分布'
      }
    ]
  } catch (error) {
    console.error('获取建议失败:', error)
  }
}

const applySuggestion = (suggestion: any) => {
  naturalLanguageQuery.value = suggestion.displayName
  suggestions.value = []
}

// 模板选择
const selectTemplate = (template: any) => {
  naturalLanguageQuery.value = template.exampleQueries?.[0] || template.displayName
  showTemplates.value = false
}

// 历史查询选择
const selectHistoryQuery = (historyItem: any) => {
  naturalLanguageQuery.value = historyItem.naturalQuery
  showHistory.value = false
}

// 示例选择
const selectExample = (example: any) => {
  naturalLanguageQuery.value = example.query
  showExamples.value = false
}

// 导出结果
const exportResults = async (format: string) => {
  if (!currentQueryLogId.value) {
    ElMessage.error('没有可导出的查询结果')
    return
  }

  try {
    // 调用导出API
    // const response = await aiQueryApi.exportResult(currentQueryLogId.value, format)
    ElMessage.success(`${format.toUpperCase()}文件导出中...`)
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

// 反馈相关
const showFeedbackDialog = () => {
  if (!currentQueryLogId.value) {
    ElMessage.error('没有可反馈的查询记录')
    return
  }
  showFeedback.value = true
}

const onFeedbackSubmitted = () => {
  showFeedback.value = false
  ElMessage.success('感谢您的反馈！')
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    if (naturalLanguageQuery?.value?.trim?.() && !querying.value) {
      executeQuery()
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 监听SQL变化
watch(generatedSQL, (newValue) => {
  if (newValue && !editingSQL.value) {
    editableSQL.value = newValue
  }
})
</script>

<style scoped lang="scss">
.ai-query-interface {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;

  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    .page-title {
      font-size: var(--text-3xl);
      color: var(--text-primary);
      margin-bottom: var(--spacing-2xl);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2xl);
    }

    .page-description {
      color: var(--text-regular);
      font-size: var(--text-lg);
      margin: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .input-section {
    margin-bottom: var(--text-2xl);

    .query-input-container {
      .query-textarea {
        margin-bottom: var(--spacing-4xl);

        :deep(.el-textarea__inner) {
          font-size: var(--text-lg);
          line-height: 1.6;
          border-radius: var(--spacing-sm);
          border: 2px solid var(--border-color);
          transition: border-color 0.3s;

          &:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
          }
        }
      }

      .input-tools {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tools-left,
        .tools-right {
          display: flex;
          gap: var(--spacing-2xl);
        }

        .shortcut-hint {
          font-size: var(--text-sm);
          opacity: 0.7;
          margin-left: var(--spacing-base);
        }
      }
    }

    .suggestions {
      margin-top: var(--spacing-4xl);
      padding: var(--spacing-4xl);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      .suggestions-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-2xl);
        font-weight: 500;
        color: var(--text-regular);
      }

      .suggestions-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);

        .suggestion-tag {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          transition: all 0.3s;

          &:hover {
            transform: translateY(-var(--border-width-base));
            box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
          }

          .suggestion-info {
            font-size: var(--text-sm);
            opacity: 0.6;
          }
        }
      }
    }
  }

  .processing-section {
    margin-bottom: var(--text-2xl);

    .ai-processing {
      text-align: center;

      .el-steps {
        margin-bottom: var(--text-2xl);
      }

      .processing-details {
        .processing-message {
          font-size: var(--text-lg);
          color: var(--text-regular);
          margin-bottom: var(--spacing-4xl);
        }

        .processing-stats {
          display: flex;
          justify-content: center;
          gap: var(--text-2xl);
          margin-top: var(--spacing-2xl);
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }
  }

  .sql-section {
    margin-bottom: var(--text-2xl);

    .sql-editor-container {
      margin-bottom: var(--spacing-4xl);
      border: var(--border-width-base) solid var(--border-color-light);
      border-radius: var(--spacing-xs);
      overflow: hidden;
    }

    .sql-info {
      margin-top: var(--spacing-4xl);
    }
  }

  .ai-response-section {
    margin-bottom: var(--text-2xl);

    .ai-response-content {
      .response-text {
        background: var(--bg-gray-light);
        border: var(--border-width-base) solid #e9ecef;
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        font-size: var(--text-lg);
        line-height: 1.6;
        color: #2c3e50;
        white-space: pre-wrap;
        margin-bottom: var(--spacing-4xl);
      }

      .response-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: var(--text-base);
        color: #6c757d;

        .session-info {
          font-family: 'Courier New', monospace;
          font-size: var(--text-sm);
          opacity: 0.8;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .ai-query-interface {
    padding: var(--spacing-4xl);

    .page-header .page-title {
      font-size: var(--text-3xl);
    }

    .input-tools {
      flex-direction: column;
      gap: var(--spacing-2xl);

      .tools-left,
      .tools-right {
        justify-content: center;
      }
    }

    .suggestions-list {
      .suggestion-tag {
        font-size: var(--text-sm);
      }
    }
  }
}
</style>