<template>
  <div class="async-data-example">
    <el-card header="异步数据获取示例">
      <div class="example-content">
        <!-- 控制面板 -->
        <div class="control-panel">
          <el-space wrap>
            <el-button 
              @click="loadStudents" 
              :loading="studentsLoading"
              type="primary"
            >
              加载学生数据
            </el-button>
            
            <el-button 
              @click="loadTeachers" 
              :loading="teachersLoading"
              type="success"
            >
              加载教师数据
            </el-button>
            
            <el-button 
              @click="loadBatchData" 
              :loading="batchLoading"
              type="warning"
            >
              批量加载数据
            </el-button>
            
            <el-button 
              @click="refreshAll"
              :loading="refreshing"
              type="info"
            >
              刷新所有
            </el-button>
            
            <el-button 
              @click="cancelAll"
              type="danger"
            >
              取消所有
            </el-button>
          </el-space>
        </div>

        <!-- 批量操作进度 -->
        <div v-if="batchLoading" class="batch-progress">
          <el-progress 
            :percentage="batchProgress" 
            :show-text="true"
            :text-inside="true"
            status="success"
          />
          <p class="progress-text">
            批量加载进度: {{ batchCompleted }}/{{ batchTotal }}
          </p>
        </div>

        <!-- 数据展示区域 -->
        <div class="data-display">
          <el-row :gutter="20">
            <!-- 学生数据 -->
            <el-col :span="12">
              <div class="data-section">
                <h4>
                  学生数据
                  <el-tag v-if="studentsLoading" type="warning" size="small">加载中</el-tag>
                  <el-tag v-else-if="studentsHasError" type="danger" size="small">加载失败</el-tag>
                  <el-tag v-else-if="studentsHasData" type="success" size="small">已加载</el-tag>
                </h4>
                
                <div v-if="studentsLoading" class="loading-placeholder">
                  <LoadingState 
                    text="正在获取学生数据..."
                    variant="minimal"
                    size="small"
                    spinner-type="dots"
                  />
                </div>
                
                <div v-else-if="studentsHasError" class="error-placeholder">
                  <el-alert 
                    :title="studentsError?.message || '加载失败'"
                    type="error"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click="refreshStudents"
                      >
                        重试
                      </el-button>
                    </template>
                  </el-alert>
                </div>
                
                <div v-else-if="studentsHasData" class="data-content">
                  <div class="table-wrapper">
<el-table class="responsive-table" :data="studentsData" size="small" max-height="300">
                    <el-table-column prop="id" label="ID" width="60" />
                    <el-table-column prop="name" label="姓名" />
                    <el-table-column prop="age" label="年龄" width="80" />
                    <el-table-column prop="class" label="班级" />
                  </el-table>
</div>
                  
                  <div class="data-actions">
                    <el-button size="small" @click="exportStudents">
                      导出
                    </el-button>
                    <el-button size="small" @click="refreshStudents">
                      刷新
                    </el-button>
                  </div>
                </div>
                
                <div v-else class="empty-placeholder">
                  <el-empty description="暂无数据" :image-size="80" />
                </div>
              </div>
            </el-col>

            <!-- 教师数据 -->
            <el-col :span="12">
              <div class="data-section">
                <h4>
                  教师数据
                  <el-tag v-if="teachersLoading" type="warning" size="small">加载中</el-tag>
                  <el-tag v-else-if="teachersHasError" type="danger" size="small">加载失败</el-tag>
                  <el-tag v-else-if="teachersHasData" type="success" size="small">已加载</el-tag>
                </h4>
                
                <div v-if="teachersLoading" class="loading-placeholder">
                  <LoadingState 
                    text="正在获取教师数据..."
                    variant="minimal"
                    size="small"
                    spinner-type="circle"
                  />
                </div>
                
                <div v-else-if="teachersHasError" class="error-placeholder">
                  <el-alert 
                    :title="teachersError?.message || '加载失败'"
                    type="error"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click="refreshTeachers"
                      >
                        重试
                      </el-button>
                    </template>
                  </el-alert>
                </div>
                
                <div v-else-if="teachersHasData" class="data-content">
                  <el-table class="responsive-table" :data="teachersData" size="small" max-height="300">
                    <el-table-column prop="id" label="ID" width="60" />
                    <el-table-column prop="name" label="姓名" />
                    <el-table-column prop="subject" label="科目" />
                    <el-table-column prop="experience" label="经验" />
                  </el-table>
                  
                  <div class="data-actions">
                    <el-button size="small" @click="exportTeachers">
                      导出
                    </el-button>
                    <el-button size="small" @click="refreshTeachers">
                      刷新
                    </el-button>
                  </div>
                </div>
                
                <div v-else class="empty-placeholder">
                  <el-empty description="暂无数据" :image-size="80" />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 操作统计 -->
        <div class="operation-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="成功操作" :value="successCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="失败操作" :value="errorCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="平均耗时" :value="averageTime" suffix="ms" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="缓存命中" :value="cacheHitCount" />
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAsyncOperation, useBatchAsyncOperation } from '@/composables/useAsyncOperation'
import LoadingState from '@/components/common/LoadingState.vue'

// 模拟API函数
const fetchStudents = async (): Promise<any[]> => {
  console.log('📚 开始获取学生数据...')
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // 模拟随机失败
  if (Math.random() < 0.2) {
    throw new Error('学生数据服务暂时不可用')
  }
  
  return [
    { id: 1, name: '张小明', age: 6, class: '大班A' },
    { id: 2, name: '李小红', age: 5, class: '中班B' },
    { id: 3, name: '王小强', age: 6, class: '大班A' },
    { id: 4, name: '刘小美', age: 5, class: '中班A' },
    { id: 5, name: '陈小东', age: 4, class: '小班B' }
  ]
}

const fetchTeachers = async (): Promise<any[]> => {
  console.log('👨‍🏫 开始获取教师数据...')
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))
  
  // 模拟随机失败
  if (Math.random() < 0.15) {
    throw new Error('教师数据服务连接超时')
  }
  
  return [
    { id: 1, name: '张老师', subject: '语言', experience: '5年' },
    { id: 2, name: '李老师', subject: '数学', experience: '3年' },
    { id: 3, name: '王老师', subject: '音乐', experience: '8年' },
    { id: 4, name: '刘老师', subject: '美术', experience: '6年' }
  ]
}

const fetchClasses = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return [
    { id: 1, name: '大班A', studentCount: 25 },
    { id: 2, name: '中班B', studentCount: 22 }
  ]
}

// 统计数据
const successCount = ref(0)
const errorCount = ref(0)
const operationTimes = ref<number[]>([])
const cacheHitCount = ref(0)

const averageTime = computed(() => {
  if (operationTimes.value.length === 0) return 0
  return Math.round(operationTimes.value.reduce((a, b) => a + b, 0) / operationTimes.value.length)
})

// 学生数据异步操作
const {
  loading: studentsLoading,
  error: studentsError,
  data: studentsData,
  hasError: studentsHasError,
  hasData: studentsHasData,
  execute: loadStudents,
  refresh: refreshStudents
} = useAsyncOperation({
  operation: fetchStudents,
  cache: {
    key: 'students-data',
    duration: 2 * 60 * 1000 // 2分钟缓存
  },
  retry: {
    times: 2,
    delay: 1000,
    backoff: 2
  },
  timeout: 10000,
  onSuccess: (data) => {
    successCount.value++
    operationTimes.value.push(1500)
    ElMessage.success(`学生数据加载成功，共 ${data.length} 条记录`)
  },
  onError: (error) => {
    errorCount.value++
    console.error('学生数据加载失败:', error)
  },
  errorMessage: {
    show: true,
    custom: (error) => `学生数据加载失败: ${error.message}`
  }
})

// 教师数据异步操作
const {
  loading: teachersLoading,
  error: teachersError,
  data: teachersData,
  hasError: teachersHasError,
  hasData: teachersHasData,
  execute: loadTeachers,
  refresh: refreshTeachers,
  cancel: cancelTeachers
} = useAsyncOperation({
  operation: fetchTeachers,
  cache: {
    key: 'teachers-data',
    duration: 3 * 60 * 1000 // 3分钟缓存
  },
  retry: {
    times: 3,
    delay: 800,
    backoff: 1.5
  },
  debounce: {
    delay: 500 // 防抖500ms
  },
  onSuccess: (data) => {
    successCount.value++
    operationTimes.value.push(1200)
    ElMessage.success(`教师数据加载成功，共 ${data.length} 条记录`)
  },
  onError: (error) => {
    errorCount.value++
    console.error('教师数据加载失败:', error)
  }
})

// 批量异步操作
const {
  loading: batchLoading,
  errors: batchErrors,
  results: batchResults,
  progress: batchProgress,
  execute: executeBatch
} = useBatchAsyncOperation([
  fetchStudents,
  fetchTeachers,
  fetchClasses
], {
  concurrency: 2,
  failFast: false,
  onProgress: (completed, total) => {
    batchCompleted.value = completed
    batchTotal.value = total
  }
})

const batchCompleted = ref(0)
const batchTotal = ref(0)
const refreshing = ref(false)

// 方法
const loadBatchData = async () => {
  try {
    await executeBatch()
    if (batchErrors.value.length === 0) {
      ElMessage.success('批量数据加载完成')
      successCount.value++
    } else {
      ElMessage.warning(`批量加载完成，${batchErrors.value.length} 个操作失败`)
      errorCount.value += batchErrors.value.length
    }
  } catch (error) {
    ElMessage.error('批量数据加载失败')
    errorCount.value++
  }
}

const refreshAll = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      refreshStudents(),
      refreshTeachers()
    ])
    ElMessage.success('所有数据刷新完成')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

const cancelAll = () => {
  cancelTeachers()
  ElMessage.info('已取消所有正在进行的操作')
}

const exportStudents = () => {
  if (!studentsData.value) return
  
  const csv = [
    'ID,姓名,年龄,班级',
    ...studentsData.value.map(student => 
      `${student.id},${student.name},${student.age},${student.class}`
    )
  ].join('\n')
  
  downloadCSV(csv, 'students.csv')
  ElMessage.success('学生数据导出成功')
}

const exportTeachers = () => {
  if (!teachersData.value) return
  
  const csv = [
    'ID,姓名,科目,经验',
    ...teachersData.value.map(teacher => 
      `${teacher.id},${teacher.name},${teacher.subject},${teacher.experience}`
    )
  ].join('\n')
  
  downloadCSV(csv, 'teachers.csv')
  ElMessage.success('教师数据导出成功')
}

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
</script>

<style scoped lang="scss">
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";
.async-data-example {
  .example-content {
    .control-panel {
      padding: 1rem 0;
      border-bottom: var(--z-index-dropdown) solid var(--el-border-color-lighter);
      margin-bottom: 1rem;
    }
    
    .batch-progress {
      margin: 1rem 0;
      padding: 1rem;
      background: var(--el-bg-color-page);
      border-radius: var(--radius-md);
      
      .progress-text {
        margin-top: 0.5rem;
        text-align: center;
        color: var(--el-text-color-secondary);
        font-size: var(--text-base);
      }
    }
    
    .data-display {
      margin: 1rem 0;
    }
    
    .data-section {
      border: var(--border-width) solid var(--el-border-color-lighter);
      border-radius: var(--radius-md);
      padding: 1rem;
      min-height: 60px; height: auto;
      
      h4 {
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--el-text-color-primary);
      }
      
      .loading-placeholder,
      .error-placeholder,
      .empty-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px; height: auto;
      }
      
      .data-content {
        .data-actions {
          margin-top: 1rem;
          text-align: right;
          
          .el-button {
            margin-left: 0.5rem;
          }
        }
      }
    }
    
    .operation-stats {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--el-bg-color-page);
      border-radius: var(--radius-md);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .async-data-example {
    .data-display {
      .el-col {
        margin-bottom: 1rem;
      }
    }
    
    .data-section {
      height: auto;
      min-min-height: 60px; height: auto;
    }
    
    .operation-stats {
      .el-col {
        margin-bottom: 1rem;
      }
    }
  }
}
</style>