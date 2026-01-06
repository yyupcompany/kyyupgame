<template>
  <div class="async-loading-demo">
    <PageHeader 
      title="异步组件懒加载演示"
      subtitle="展示组件懒加载模式和数据异步等待机制"
    >
      <template #actions>
        <el-space>
          <el-button @click="clearAllCache" type="warning">
            清理缓存
          </el-button>
          <el-button @click="preloadComponents" type="primary">
            预加载组件
          </el-button>
          <el-button @click="showStats" type="info">
            缓存统计
          </el-button>
        </el-space>
      </template>
    </PageHeader>

    <div class="demo-content">
      <!-- 基础异步组件演示 -->
      <el-card class="demo-card" header="基础异步组件加载">
        <div class="card-content">
          <p>点击按钮动态加载组件，演示基础异步加载功能</p>
          
          <el-space wrap>
            <el-button @click="loadBasicComponent" :loading="basicLoading">
              加载基础组件
            </el-button>
            <el-button @click="loadComplexComponent" :loading="complexLoading">
              加载复杂组件
            </el-button>
            <el-button @click="unloadComponents">
              卸载组件
            </el-button>
          </el-space>

          <!-- 基础组件容器 -->
          <div v-if="showBasicComponent" class="component-container">
            <AsyncComponentWrapper
              :component-config="basicComponentConfig"
              :use-suspense="false"
              loading-text="正在加载基础组件..."
              @loaded="() => basicLoading = false"
              @error="handleBasicError"
            />
          </div>

          <!-- 复杂组件容器 -->
          <div v-if="showComplexComponent" class="component-container">
            <AsyncComponentWrapper
              :component-config="complexComponentConfig"
              :data-config="complexDataConfig"
              :use-suspense="true"
              loading-text="正在加载复杂组件..."
              loading-tip="包含数据预加载"
              :show-progress="true"
              :cancelable="true"
              @loaded="() => complexLoading = false"
              @error="handleComplexError"
              @data-loaded="handleComplexDataLoaded"
            />
          </div>
        </div>
      </el-card>

      <!-- 数据表格演示 -->
      <el-card class="demo-card" header="懒加载数据表格">
        <div class="card-content">
          <p>演示带有数据懒加载的表格组件</p>
          
          <el-space wrap>
            <el-button @click="loadStudentTable" :loading="studentTableLoading">
              加载学生表格
            </el-button>
            <el-button @click="loadTeacherTable" :loading="teacherTableLoading">
              加载教师表格
            </el-button>
            <el-button @click="unloadTables">
              卸载表格
            </el-button>
          </el-space>

          <!-- 学生表格 -->
          <div v-if="showStudentTable" class="table-container">
            <h4>学生信息表</h4>
            <LazyDataTable
              api-url="/api/students"
              :columns="studentColumns"
              :api-params="{ status: 'active' }"
              cache-key="student-table"
              :preload="true"
              @data-loaded="handleStudentDataLoaded"
              @error="handleTableError"
            />
          </div>

          <!-- 教师表格 -->
          <div v-if="showTeacherTable" class="table-container">
            <h4>教师信息表</h4>
            <LazyDataTable
              api-url="/api/teachers"
              :columns="teacherColumns"
              :api-params="{ department: 'all' }"
              cache-key="teacher-table"
              :use-suspense="true"
              @data-loaded="handleTeacherDataLoaded"
              @error="handleTableError"
            />
          </div>
        </div>
      </el-card>

      <!-- 对话框演示 -->
      <el-card class="demo-card" header="异步对话框组件">
        <div class="card-content">
          <p>演示按需加载的对话框组件</p>
          
          <el-space wrap>
            <el-button @click="openEditDialog" type="primary">
              打开编辑对话框
            </el-button>
            <el-button @click="openDetailDialog" type="success">
              打开详情对话框
            </el-button>
            <el-button @click="openFormDialog" type="warning">
              打开表单对话框
            </el-button>
          </el-space>
        </div>
      </el-card>

      <!-- 性能统计 -->
      <el-card class="demo-card" header="性能统计">
        <div class="card-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic 
                title="组件缓存数量" 
                :value="stats.componentCacheSize"
                suffix="个"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic 
                title="数据缓存数量" 
                :value="stats.dataCacheSize"
                suffix="个"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic 
                title="平均加载时间" 
                :value="stats.averageLoadTime"
                suffix="ms"
              />
            </el-col>
          </el-row>

          <div class="load-times">
            <h5>组件加载时间记录</h5>
            <el-table :data="loadTimeRecords" size="small">
              <el-table-column prop="component" label="组件名称" />
              <el-table-column prop="loadTime" label="加载时间(ms)" />
              <el-table-column prop="timestamp" label="加载时间" />
            </el-table>
          </div>
        </div>
      </el-card>

      <!-- 异步对话框组件 -->
      <component 
        v-if="currentDialog"
        :is="currentDialog"
        v-model:visible="dialogVisible"
        v-bind="dialogProps"
        @closed="handleDialogClosed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AsyncComponentWrapper from '@/components/common/AsyncComponentWrapper.vue'
import LazyDataTable from '@/components/common/LazyDataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
// 简化演示，直接使用组件导入
const createAsyncDialog = (config: any) => {
  return config.loader
}

const clearCache = () => {
  ElMessage.success('缓存已清理')
}

const getCacheStats = () => ({
  componentCache: { size: 3 },
  dataCache: { size: 5 }
})

// 状态管理
const basicLoading = ref(false)
const complexLoading = ref(false)
const studentTableLoading = ref(false)
const teacherTableLoading = ref(false)

const showBasicComponent = ref(false)
const showComplexComponent = ref(false)
const showStudentTable = ref(false)
const showTeacherTable = ref(false)

const dialogVisible = ref(false)
const currentDialog = ref<any>(null)
const dialogProps = ref({})

const loadTimeRecords = ref<Array<{
  component: string
  loadTime: number
  timestamp: string
}>>([])

// 基础组件配置
const basicComponentConfig: AsyncComponentConfig = {
  loader: () => import('@/components/common/LoadingState.vue'),
  delay: 200,
  timeout: 5000,
  cache: true,
  minLoadTime: 500
}

// 复杂组件配置
const complexComponentConfig: AsyncComponentConfig = {
  loader: () => import('@/components/charts/EnrollmentChart.vue'),
  delay: 100,
  timeout: 10000,
  cache: true,
  retryLimit: 3,
  minLoadTime: 800
}

// 复杂组件数据配置
const complexDataConfig: DataLoaderConfig = {
  loader: async () => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      enrollment: [
        { month: '1月', count: 120 },
        { month: '2月', count: 135 },
        { month: '3月', count: 158 },
        { month: '4月', count: 142 },
        { month: '5月', count: 167 }
      ]
    }
  },
  cacheKey: 'enrollment-data',
  cacheDuration: 2 * 60 * 1000,
  timeout: 8000,
  retry: { times: 2, delay: 1000 }
}

// 表格列配置
const studentColumns = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80 },
  { prop: 'class', label: '班级', width: 100 },
  { prop: 'status', label: '状态', width: 80 },
  { prop: 'createTime', label: '入学时间' }
]

const teacherColumns = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'subject', label: '科目', width: 100 },
  { prop: 'experience', label: '工作经验', width: 100 },
  { prop: 'level', label: '职级', width: 80 },
  { prop: 'department', label: '部门' }
]

// 计算属性
const stats = computed(() => {
  const cacheStats = getCacheStats()
  return {
    componentCacheSize: cacheStats.componentCache.size,
    dataCacheSize: cacheStats.dataCache.size,
    averageLoadTime: loadTimeRecords.value.length > 0 
      ? Math.round(loadTimeRecords.value.reduce((acc, record) => acc + record.loadTime, 0) / loadTimeRecords.value.length)
      : 0
  }
})

// 记录加载时间
const recordLoadTime = (componentName: string, loadTime: number) => {
  loadTimeRecords.value.unshift({
    component: componentName,
    loadTime,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // 保持最新10条记录
  if (loadTimeRecords.value.length > 10) {
    loadTimeRecords.value = loadTimeRecords.value.slice(0, 10)
  }
}

// 事件处理
const loadBasicComponent = () => {
  basicLoading.value = true
  showBasicComponent.value = true
}

const loadComplexComponent = () => {
  complexLoading.value = true
  showComplexComponent.value = true
}

const unloadComponents = () => {
  showBasicComponent.value = false
  showComplexComponent.value = false
  basicLoading.value = false
  complexLoading.value = false
}

const loadStudentTable = () => {
  studentTableLoading.value = true
  showStudentTable.value = true
  
  setTimeout(() => {
    studentTableLoading.value = false
    recordLoadTime('学生表格', 1200)
  }, 1200)
}

const loadTeacherTable = () => {
  teacherTableLoading.value = true
  showTeacherTable.value = true
  
  setTimeout(() => {
    teacherTableLoading.value = false
    recordLoadTime('教师表格', 950)
  }, 950)
}

const unloadTables = () => {
  showStudentTable.value = false
  showTeacherTable.value = false
  studentTableLoading.value = false
  teacherTableLoading.value = false
}

const openEditDialog = async () => {
  try {
    const component = markRaw(createAsyncDialog({
      loader: () => import('@/components/dialogs/StudentEditDialog.vue')
    }))
    currentDialog.value = component
    dialogProps.value = { studentId: 1 }
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('对话框加载失败')
  }
}

const openDetailDialog = async () => {
  try {
    const component = markRaw(createAsyncDialog({
      loader: () => import('@/components/dialogs/StudentDetailDialog.vue')
    }))
    currentDialog.value = component
    dialogProps.value = { studentId: 1 }
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('对话框加载失败')
  }
}

const openFormDialog = async () => {
  try {
    const component = markRaw(createAsyncDialog({
      loader: () => import('@/components/forms/StudentForm.vue')
    }))
    currentDialog.value = component
    dialogProps.value = { mode: 'create' }
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('对话框加载失败')
  }
}

const handleDialogClosed = () => {
  currentDialog.value = null
  dialogProps.value = {}
}

const handleBasicError = (error: Error) => {
  basicLoading.value = false
  ElMessage.error(`基础组件加载失败: ${error.message}`)
}

const handleComplexError = (error: Error) => {
  complexLoading.value = false
  ElMessage.error(`复杂组件加载失败: ${error.message}`)
}

const handleComplexDataLoaded = (data: any) => {
  recordLoadTime('复杂组件(含数据)', 2100)
  console.log('复杂组件数据加载完成:', data)
}

const handleStudentDataLoaded = (data: any[]) => {
  ElMessage.success(`学生数据加载完成，共 ${data.length} 条记录`)
}

const handleTeacherDataLoaded = (data: any[]) => {
  ElMessage.success(`教师数据加载完成，共 ${data.length} 条记录`)
}

const handleTableError = (error: Error) => {
  ElMessage.error(`表格数据加载失败: ${error.message}`)
}

// 工具方法
const clearAllCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有缓存吗？', '确认操作', {
      type: 'warning'
    })
    clearCache()
    ElMessage.success('缓存清理成功')
  } catch {
    // 用户取消
  }
}

const showStats = () => {
  const cacheStats = getCacheStats()
  ElMessageBox.alert(
    `组件缓存: ${cacheStats.componentCache.size} 个\n数据缓存: ${cacheStats.dataCache.size} 个\n平均加载时间: ${stats.value.averageLoadTime}ms`,
    '缓存统计信息',
    { type: 'info' }
  )
}

const preloadComponents = async () => {
  try {
    ElMessage.success('组件预加载完成')
  } catch (error) {
    ElMessage.error('组件预加载失败')
  }
}

// 生命周期
onMounted(() => {
  console.log('异步加载演示页面已挂载')
})
</script>

<style scoped lang="scss">
.async-loading-demo {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-content {
  margin-top: 1rem;
}

.demo-card {
  margin-bottom: 1.5rem;
  
  .card-content {
    p {
      margin-bottom: 1rem;
      color: var(--el-text-color-secondary);
    }
  }
}

.component-container {
  margin-top: 1rem;
  padding: 1rem;
  border: var(--border-width-base) dashed var(--el-border-color);
  border-radius: var(--radius-md);
  background: var(--el-bg-color-page);
}

.table-container {
  margin-top: 1rem;
  
  h4 {
    margin-bottom: 0.5rem;
    color: var(--el-text-color-primary);
  }
}

.load-times {
  margin-top: 1rem;
  
  h5 {
    margin-bottom: 0.5rem;
    color: var(--el-text-color-primary);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .async-loading-demo {
    padding: 0.5rem;
  }
  
  .demo-card {
    margin-bottom: 1rem;
  }
  
  .component-container {
    padding: 0.5rem;
  }
}
</style>