<template>
  <div class="error-container">
    <div class="error-content">
      <!-- 错误图标和代码 -->
      <div class="error-visual">
        <div class="error-icon">
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
          <UnifiedIcon name="Close" />
        </div>
        
        <div class="error-code">{{ errorCode }}</div>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1 class="error-title">{{ errorTitle }}</h1>
        <p class="error-description">{{ errorDescription }}</p>
        
        <!-- 错误详情（开发模式） -->
        <div v-if="showDetails && errorDetails" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <div class="details-content">
                <div v-if="errorDetails.message" class="detail-item">
                  <strong>错误消息：</strong>
                  <code>{{ errorDetails.message }}</code>
                </div>
                
                <div v-if="errorDetails.stack" class="detail-item">
                  <strong>错误堆栈：</strong>
                  <pre class="stack-trace">{{ errorDetails.stack }}</pre>
                </div>
                
                <div v-if="errorDetails.url" class="detail-item">
                  <strong>请求URL：</strong>
                  <code>{{ errorDetails.url }}</code>
                </div>
                
                <div v-if="errorDetails.timestamp" class="detail-item">
                  <strong>发生时间：</strong>
                  <span>{{ formatDateTime(errorDetails.timestamp) }}</span>
                </div>
                
                <div class="detail-item">
                  <strong>用户代理：</strong>
                  <code>{{ userAgent }}</code>
                </div>
                
                <div class="detail-item">
                  <strong>页面路径：</strong>
                  <code>{{ currentPath }}</code>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry" :loading="retrying">
          <UnifiedIcon name="Refresh" />
          重试
        </el-button>
        
        <el-button @click="goBack">
          <UnifiedIcon name="ArrowLeft" />
          返回上页
        </el-button>
        
        <el-button @click="goHome">
          <UnifiedIcon name="default" />
          返回首页
        </el-button>
        
        <el-button v-if="canReport" @click="reportError">
          <UnifiedIcon name="default" />
          报告错误
        </el-button>
      </div>

      <!-- 建议操作 -->
      <div class="error-suggestions">
        <h3>建议操作</h3>
        <div class="suggestions-grid">
          <div v-for="suggestion in suggestions" :key="suggestion.title" class="suggestion-item">
            <div class="suggestion-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.description }}</p>
              <el-button v-if="suggestion.action" size="small" @click="suggestion.action">
                {{ suggestion.actionText }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系支持 -->
      <div class="support-section">
        <el-card shadow="never">
          <template #header>
            <span>需要帮助？</span>
          </template>
          
          <div class="support-content">
            <p>如果问题持续存在，请联系技术支持团队。</p>
            
            <div class="support-actions">
              <el-button @click="contactSupport">
                <UnifiedIcon name="default" />
                联系支持
              </el-button>
              
              <el-button @click="viewDocs">
                <UnifiedIcon name="default" />
                查看文档
              </el-button>
              
              <el-button @click="checkStatus">
                <UnifiedIcon name="default" />
                系统状态
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 错误报告对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="错误报告"
      width="600px"
      @close="handleReportDialogClose"
    >
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="错误描述">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="请描述您遇到的问题..."
          />
        </el-form-item>
        
        <el-form-item label="重现步骤">
          <el-input
            v-model="reportForm.steps"
            type="textarea"
            :rows="3"
            placeholder="请描述如何重现这个问题..."
          />
        </el-form-item>
        
        <el-form-item label="联系方式">
          <el-input
            v-model="reportForm.contact"
            placeholder="邮箱或电话（可选）"
          />
        </el-form-item>
        
        <el-form-item label="包含技术信息">
          <el-switch v-model="reportForm.includeTechInfo" />
          <span class="form-help">包含错误堆栈、浏览器信息等技术详情</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReport" :loading="submittingReport">
            提交报告
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Connection, Warning, Lock, CircleClose, Refresh, ArrowLeft, House,
  Service, Document, Monitor, Setting, ChatDotRound, Bell
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'
import AnimationConfigManager from '@/config/animation-config'

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const retrying = ref(false)
const reportDialogVisible = ref(false)
const submittingReport = ref(false)

// 错误信息（从路由参数或查询参数获取）
const errorCode = computed(() => route.query.code || route.params.code || '500')
const errorType = computed(() => route.query.type || route.params.type || 'unknown')
const errorMessage = computed(() => route.query.message || route.params.message || '')

// 错误详情
const errorDetails = computed(() => {
  try {
    const details = route.query.details || route.params.details
    return details ? JSON.parse(decodeURIComponent(details as string)) : null
  } catch {
    return null
  }
})

// 环境信息
const userAgent = computed(() => navigator.userAgent)
const currentPath = computed(() => route.fullPath)
const showDetails = computed(() => process.env.NODE_ENV === 'development' || route.query.debug === 'true')

// 错误标题和描述
const errorTitle = computed(() => {
  const titles = {
    '400': '请求错误',
    '401': '未授权',
    '403': '权限不足',
    '404': '页面不存在',
    '500': '服务器错误',
    '502': '网关错误',
    '503': '服务不可用',
    'network': '网络连接错误',
    'server': '服务器错误',
    'permission': '权限错误',
    'unknown': '未知错误'
  }
  return titles[errorCode.value] || titles[errorType.value] || '系统错误'
})

const errorDescription = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value
  }
  
  const descriptions = {
    '400': '请求参数有误，请检查输入信息。',
    '401': '您需要登录才能访问此页面。',
    '403': '您没有权限访问此页面。',
    '404': '您访问的页面不存在或已被移除。',
    '500': '服务器内部错误，请稍后重试。',
    '502': '网关错误，服务暂时不可用。',
    '503': '服务暂时不可用，请稍后重试。',
    'network': '网络连接失败，请检查网络设置。',
    'server': '服务器响应异常，请稍后重试。',
    'permission': '您的权限不足以执行此操作。',
    'unknown': '发生了未知错误，请联系技术支持。'
  }
  return descriptions[errorCode.value] || descriptions[errorType.value] || '系统遇到了问题，请稍后重试。'
})

// 是否可以报告错误
const canReport = computed(() => {
  return !['404', '403'].includes(errorCode.value)
})

// 建议操作
const suggestions = computed(() => {
  const baseSuggestions = [
    {
      title: '检查网络连接',
      description: '确保您的网络连接正常',
      icon: 'link',
      action: () => window.location.reload(),
      actionText: '重新加载'
    },
    {
      title: '清除缓存',
      description: '清除浏览器缓存可能解决问题',
      icon: 'Refresh',
      action: () => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name))
          })
        }
        window.location.reload()
      },
      actionText: '清除缓存'
    },
    {
      title: '联系管理员',
      description: '如果问题持续存在，请联系系统管理员',
      icon: 'Service',
      action: () => contactSupport(),
      actionText: '联系支持'
    }
  ]
  
  // 根据错误类型添加特定建议
  if (errorCode.value === '401') {
    baseSuggestions.unshift({
      title: '重新登录',
      description: '您的登录状态可能已过期',
      icon: 'User',
      action: () => router.push('/login'),
      actionText: '去登录'
    })
  }
  
  return baseSuggestions
})

// 错误报告表单
const reportForm = reactive({
  description: '',
  steps: '',
  contact: '',
  includeTechInfo: true
})

// 方法
const handleRetry = async () => {
  retrying.value = true
  try {
    // 等待一段时间后重新加载
    await new Promise(resolve => {
      AnimationConfigManager.setTimeout(resolve, 'medium')
    })
    window.location.reload()
  } catch (error) {
    ElMessage.error('重试失败，请稍后再试')
  } finally {
    retrying.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}

const goHome = () => {
  router.push('/dashboard')
}

const reportError = () => {
  reportDialogVisible.value = true
}

const contactSupport = () => {
  ElMessage.info('联系支持功能开发中')
}

const viewDocs = () => {
  ElMessage.info('文档查看功能开发中')
}

const checkStatus = () => {
  ElMessage.info('系统状态检查功能开发中')
}

const submitReport = async () => {
  submittingReport.value = true
  try {
    // 构建报告数据
    const reportData = {
      ...reportForm,
      errorCode: errorCode.value,
      errorType: errorType.value,
      errorDetails: reportForm.includeTechInfo ? errorDetails.value : null,
      userAgent: userAgent.value,
      currentPath: currentPath.value,
      timestamp: new Date().toISOString()
    }
    
    // 模拟提交报告
    await new Promise(resolve => {
      AnimationConfigManager.setTimeout(resolve, 'slow')
    })
    
    ElMessage.success('错误报告已提交，感谢您的反馈')
    reportDialogVisible.value = false
  } catch (error) {
    ElMessage.error('提交报告失败，请稍后重试')
  } finally {
    submittingReport.value = false
  }
}

const handleReportDialogClose = () => {
  Object.assign(reportForm, {
    description: '',
    steps: '',
    contact: '',
    includeTechInfo: true
  })
}

// 生命周期
onMounted(() => {
  // 记录错误访问
  console.error('Error page accessed:', {
    code: errorCode.value,
    type: errorType.value,
    message: errorMessage.value,
    details: errorDetails.value,
    path: currentPath.value,
    timestamp: new Date().toISOString()
  })
})
</script>

<style lang="scss">
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);
  padding: var(--text-2xl);
}

.error-content {
  max-width: 100%; max-width: 800px;
  width: 100%;
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: var(--spacing-10xl);
  text-align: center;
}

.error-visual {
  margin-bottom: var(--spacing-3xl);
  
  .error-icon {
    margin-bottom: var(--text-lg);
  }
  
  .error-code {
    font-size: var(--text-5xl);
    font-weight: 700;
    color: var(--danger-color);
    margin: 0;
  }
}

.error-info {
  margin-bottom: var(--spacing-3xl);
  
  .error-title {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 var(--text-lg) 0;
  }
  
  .error-description {
    font-size: var(--text-lg);
    color: #718096;
    line-height: 1.6;
    margin: 0 0 var(--text-3xl) 0;
  }
  
  .error-details {
    text-align: left;
    margin-top: var(--text-3xl);
    
    .details-content {
      .detail-item {
        margin-bottom: var(--text-lg);
        
        strong {
          color: #2d3748;
          display: block;
          margin-bottom: var(--spacing-xs);
        }
        
        code {
          background: #f7fafc;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: var(--text-base);
          color: var(--danger-color);
        }
        
        .stack-trace {
          background: #1a202c;
          color: #e2e8f0;
          padding: var(--text-sm);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          overflow-x: auto;
          white-space: pre-wrap;
          max-min-height: 60px; height: auto;
          overflow-y: auto;
        }
      }
    }
  }
}

.error-actions {
  display: flex;
  gap: var(--text-sm);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3xl);
}

.error-suggestions {
  margin-bottom: var(--spacing-3xl);
  text-align: left;
  
  h3 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 var(--text-2xl) 0;
    text-align: center;
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--text-lg);
    
    .suggestion-item {
      display: flex;
      gap: var(--text-sm);
      padding: var(--text-lg);
      border: var(--border-width-base) solid var(--border-light-dark);
      border-radius: var(--spacing-sm);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #3182ce;
        box-shadow: 0 2px var(--spacing-sm) rgba(49, 130, 206, 0.1);
      }
      
      .suggestion-icon {
        flex-shrink: 0;
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-full);
        background: #ebf8ff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3182ce;
      }
      
      .suggestion-content {
        flex: 1;
        
        h4 {
          font-size: var(--text-lg);
          font-weight: 500;
          color: #2d3748;
          margin: 0 0 var(--spacing-sm) 0;
        }
        
        p {
          font-size: var(--text-base);
          color: #718096;
          margin: 0 0 var(--text-sm) 0;
          line-height: 1.5;
        }
      }
    }
  }
}

.support-section {
  .support-content {
    text-align: center;
    
    p {
      color: #718096;
      margin-bottom: var(--text-2xl);
    }
    
    .support-actions {
      display: flex;
      gap: var(--text-sm);
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

.form-help {
  margin-left: var(--spacing-sm);
  font-size: var(--text-sm);
  color: #a0aec0;
}

@media (max-width: var(--breakpoint-md)) {
  .error-container {
    padding: var(--text-lg);
  }
  
  .error-content {
    padding: var(--text-3xl);
  }
  
  .error-visual .error-code {
    font-size: var(--text-4xl);
  }
  
  .error-info .error-title {
    font-size: var(--text-3xl);
  }
  
  .error-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .support-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
