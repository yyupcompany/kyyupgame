<template>
  <el-dialog
    v-model="visible"
    title="提示词预览"
    width="800px"
    :close-on-click-modal="false"
    class="prompt-preview-dialog"
  >
    <div class="preview-container">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="info-header">
          <h3 class="shortcut-title">{{ data.shortcut_name }}</h3>
          <div class="info-tags">
            <el-tag :type="getCategoryTagType(data.category)">
              {{ getCategoryLabel(data.category) }}
            </el-tag>
            <el-tag :type="getRoleTagType(data.role)">
              {{ getRoleLabel(data.role) }}
            </el-tag>
            <el-tag :type="data.api_endpoint === 'ai_chat' ? 'primary' : 'success'">
              {{ data.api_endpoint === 'ai_chat' ? 'AI聊天' : 'AI查询' }}
            </el-tag>
          </div>
        </div>
        
        <div class="info-details">
          <div class="detail-item">
            <span class="label">提示词名称：</span>
            <span class="value">{{ data.prompt_name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">排序权重：</span>
            <span class="value">{{ data.sort_order }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态：</span>
            <el-tag :type="data.is_active ? 'success' : 'danger'" size="small">
              {{ data.is_active ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 提示词内容 -->
      <div class="prompt-content">
        <div class="content-header">
          <h4>系统提示词</h4>
          <div class="content-actions">
            <el-button size="small" @click="copyPrompt">
              <UnifiedIcon name="document" :size="16" />
              复制
            </el-button>
            <el-button size="small" @click="toggleFormat">
              <UnifiedIcon name="eye" />
              {{ showFormatted ? '原始' : '格式化' }}
            </el-button>
            <el-button size="small" @click="testPrompt" :loading="testing">
              <UnifiedIcon name="ai-center" />
              测试
            </el-button>
          </div>
        </div>
        
        <div class="content-body">
          <div v-if="showFormatted" class="formatted-content" v-html="formattedPrompt"></div>
          <pre v-else class="raw-content">{{ data.system_prompt }}</pre>
        </div>
      </div>

      <!-- 使用示例 -->
      <div class="usage-examples" v-if="examples.length > 0">
        <h4>使用示例</h4>
        <div class="examples-list">
          <div 
            v-for="(example, index) in examples" 
            :key="index"
            class="example-item"
            @click="runExample(example)"
          >
            <div class="example-header">
              <UnifiedIcon name="ai-center" />
              <span class="example-title">{{ example.title }}</span>
              <el-button size="small" type="primary" plain>试用</el-button>
            </div>
            <div class="example-content">{{ example.content }}</div>
          </div>
        </div>
      </div>

      <!-- 测试结果 -->
      <div class="test-result" v-if="testResult">
        <h4>测试结果</h4>
        <div class="result-content">
          <div class="result-header">
            <span class="result-time">{{ testResult.timestamp }}</span>
            <span class="result-status" :class="testResult.success ? 'success' : 'error'">
              {{ testResult.success ? '成功' : '失败' }}
            </span>
          </div>
          <div class="result-body" v-html="formatTestResult(testResult.content)"></div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="editPrompt">编辑</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  View,
  ChatLineRound
} from '@element-plus/icons-vue'
import { executeShortcut } from '@/services/ai-router'

// Props
interface Props {
  modelValue: boolean
  data: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit': [data: any]
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showFormatted = ref(true)
const testing = ref(false)
const testResult = ref<any>(null)

// 格式化的提示词内容
const formattedPrompt = computed(() => {
  if (!props.data.system_prompt) return ''
  
  return props.data.system_prompt
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>')
    .replace(/(├─|└─|│)/g, '<span class="tree-symbol">$1</span>')
})

// 使用示例
const examples = computed(() => {
  const exampleMap: Record<string, any[]> = {
    enrollment_planning: [
      { title: '制定招生目标', content: '我们幼儿园今年应该设定多少招生目标？' },
      { title: '分析市场环境', content: '分析一下当前的招生市场环境和竞争情况' }
    ],
    activity_planning: [
      { title: '春季招生活动', content: '帮我规划一下春季的招生活动方案' },
      { title: '亲子体验活动', content: '设计一个亲子体验活动来吸引家长' }
    ],
    progress_analysis: [
      { title: '查看招生进展', content: '查看本月的招生进展情况' },
      { title: '分析转化数据', content: '分析最近的招生转化数据' }
    ],
    follow_up_reminder: [
      { title: '查看待跟进', content: '哪些家长需要今天跟进？' },
      { title: '跟进策略建议', content: '给我一些家长跟进的策略建议' }
    ]
  }
  
  return exampleMap[props.data.category] || []
})

// 标签映射
const categoryLabels = {
  enrollment_planning: '招生规划',
  activity_planning: '活动策划',
  progress_analysis: '进展分析',
  follow_up_reminder: '跟进提醒',
  conversion_monitoring: '转化监控',
  age_reminder: '年龄提醒',
  task_management: '任务管理',
  comprehensive_analysis: '综合分析'
}

const roleLabels = {
  principal: '园长',
  admin: '管理员',
  teacher: '教师',
  all: '通用'
}

// 工具函数
const getCategoryLabel = (category: string) => categoryLabels[category] || category
const getRoleLabel = (role: string) => roleLabels[role] || role

const getCategoryTagType = (category: string) => {
  const typeMap = {
    enrollment_planning: 'primary',
    activity_planning: 'success',
    progress_analysis: 'info',
    follow_up_reminder: 'warning',
    conversion_monitoring: 'danger',
    age_reminder: '',
    task_management: 'primary',
    comprehensive_analysis: 'success'
  }
  return typeMap[category] || ''
}

const getRoleTagType = (role: string) => {
  const typeMap = {
    principal: 'danger',
    admin: 'warning',
    teacher: 'success',
    all: 'info'
  }
  return typeMap[role] || ''
}

// 事件处理
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(props.data.system_prompt)
    ElMessage.success('提示词已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

const toggleFormat = () => {
  showFormatted.value = !showFormatted.value
}

const testPrompt = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    const result = await executeShortcut(props.data.id, '测试提示词功能')
    
    testResult.value = {
      success: result.success,
      content: result.data.message,
      timestamp: new Date().toLocaleString()
    }
    
    if (result.success) {
      ElMessage.success('测试完成')
    } else {
      ElMessage.error('测试失败')
    }
  } catch (error) {
    console.error('测试失败:', error)
    testResult.value = {
      success: false,
      content: '测试失败：' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toLocaleString()
    }
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}

const runExample = async (example: any) => {
  testing.value = true
  testResult.value = null
  
  try {
    const result = await executeShortcut(props.data.id, example.content)
    
    testResult.value = {
      success: result.success,
      content: result.data.message,
      timestamp: new Date().toLocaleString(),
      example: example.title
    }
    
    ElMessage.success(`示例"${example.title}"执行完成`)
  } catch (error) {
    console.error('示例执行失败:', error)
    testResult.value = {
      success: false,
      content: '执行失败：' + (error instanceof Error ? error.message : '未知错误'),
      timestamp: new Date().toLocaleString(),
      example: example.title
    }
    ElMessage.error('示例执行失败')
  } finally {
    testing.value = false
  }
}

const formatTestResult = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/(📊|🎯|📈|🔍|🔔|🚨|⏰|📅|📋|🔥|📞|🎪)/g, '<span class="emoji">$1</span>')
}

const editPrompt = () => {
  emit('edit', props.data)
  visible.value = false
}

// 监听数据变化，重置状态
watch(() => props.data, () => {
  testResult.value = null
  showFormatted.value = true
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.prompt-preview-dialog {
  .preview-container {
    max-height: 70vh;
    overflow-y: auto;
    
    .basic-info {
      margin-bottom: var(--text-3xl);
      padding: var(--spacing-xl);
      background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);
      border-radius: var(--text-sm);
      
      .info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-lg);
        
        .shortcut-title {
          margin: 0;
          font-size: var(--spacing-xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .info-tags {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
      
      .info-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--text-sm);
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          
          .label {
            font-weight: 500;
            color: var(--text-regular);
          }
          
          .value {
            color: var(--text-primary);
          }
        }
      }
    }
    
    .prompt-content {
      margin-bottom: var(--text-3xl);
      
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-lg);
        
        h4 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .content-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
      
      .content-body {
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--spacing-sm);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
        
        .formatted-content {
          padding: var(--spacing-xl);
          background: white;
          line-height: 1.6;
          
          :deep(.tree-symbol) {
            color: var(--info-color);
            font-family: monospace;
          }
          
          :deep(strong) {
            color: var(--primary-color);
          }
          
          :deep(em) {
            color: var(--success-color);
          }
          
          :deep(code) {
            background: var(--bg-hover);
            padding: var(--spacing-sm) 6px;
            border-radius: var(--spacing-xs);
            font-family: 'Monaco', 'Menlo', monospace;
          }
          
          :deep(pre) {
            background: var(--bg-hover);
            padding: var(--text-lg);
            border-radius: var(--radius-md);
            overflow-x: auto;
          }
        }
        
        .raw-content {
          padding: var(--spacing-xl);
          background: var(--bg-tertiary);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: var(--text-sm);
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
        }
      }
    }
    
    .usage-examples {
      margin-bottom: var(--text-3xl);
      
      h4 {
        margin: 0 0 var(--text-lg) 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .examples-list {
        display: grid;
        gap: var(--text-sm);
        
        .example-item {
          border: var(--border-width) solid var(--border-color-light);
          border-radius: var(--spacing-sm);
          padding: var(--text-lg);
          cursor: pointer;
          transition: all var(--transition-fast) ease;
          
          &:hover {
            border-color: var(--primary-color);
            background: var(--primary-color-ultra-light);
            transform: translateY(var(--transform-hover-lift));
            box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.2);
          }
          
          .example-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            
            .example-title {
              flex: 1;
              font-weight: 500;
              color: var(--text-primary);
            }
          }
          
          .example-content {
            color: var(--text-regular);
            font-size: var(--text-base);
          }
        }
      }
    }
    
    .test-result {
      .result-content {
        border: var(--border-width) solid var(--border-color-light);
        border-radius: var(--spacing-sm);
        overflow: hidden;
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--text-sm) var(--text-lg);
          background: var(--bg-hover);
          border-bottom: var(--z-index-dropdown) solid var(--border-color);
          
          .result-time {
            font-size: var(--text-sm);
            color: var(--info-color);
          }
          
          .result-status {
            font-size: var(--text-sm);
            font-weight: 500;
            
            &.success {
              color: var(--success-color);
            }
            
            &.error {
              color: var(--danger-color);
            }
          }
        }
        
        .result-body {
          padding: var(--text-lg);
          background: white;
          line-height: 1.6;
          
          :deep(.emoji) {
            font-size: var(--text-lg);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .prompt-preview-dialog {
    .preview-container {
      .basic-info {
        .info-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--text-sm);
        }
        
        .info-details {
          grid-template-columns: 1fr;
        }
      }
      
      .prompt-content {
        .content-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--text-sm);
        }
      }
    }
  }
}
</style>
