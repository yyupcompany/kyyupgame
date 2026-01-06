<template>
  <el-dialog
    title="班级详情"
    v-model="dialogVisible"
    :width="isDesktop ? '900px' : '95%'"
    :destroy-on-close="true"
    class="class-detail-dialog"
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <div v-if="classData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="班级名称">{{ classData.name }}</el-descriptions-item>
          <el-descriptions-item label="班级类型">
            <el-tag size="small">{{ getTypeLabel(classData.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="班级状态">
            <el-tag size="small">{{ getStatusLabel(classData.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="班级人数">
            <el-progress
              v-if="classData"
              :percentage="Math.floor((classData.currentCount / classData.capacity) * 100)"
              :format="formatCapacity"
            />
          </el-descriptions-item>
          <el-descriptions-item label="班主任">{{ classData.headTeacherName || '未指定' }}</el-descriptions-item>
          <el-descriptions-item label="助理教师">
            {{ classData.assistantTeacherNames ? classData.assistantTeacherNames.join(', ') : '未指定' }}
          </el-descriptions-item>
          <el-descriptions-item label="教室">{{ classData.classroom || '未指定' }}</el-descriptions-item>
          <el-descriptions-item label="年龄范围">{{ classData.ageRange }}</el-descriptions-item>
          <el-descriptions-item label="开班日期">{{ classData.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结业日期">{{ classData.endDate || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(classData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(classData.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item :span="2" label="班级描述">
            {{ classData.description || '无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 课程表 -->
        <div class="section-title">课程表</div>
        <div class="table-wrapper">
<el-table class="responsive-table" :data="scheduleData" border style="width: 100%">
          <el-table-column label="星期" prop="day" width="100">
            <template #default="{ row }">
              {{ getDayText(row.day) }}
            </template>
          </el-table-column>
          <el-table-column label="上午课程">
            <template #default="{ row }">
              <div v-if="row.morning">
                <div>{{ row.morning.subject }}</div>
                <div class="text-gray">{{ row.morning.startTime }} - {{ row.morning.endTime }}</div>
              </div>
              <span v-else class="text-gray">暂无课程</span>
            </template>
          </el-table-column>
          <el-table-column label="下午课程">
            <template #default="{ row }">
              <div v-if="row.afternoon">
                <div>{{ row.afternoon.subject }}</div>
                <div class="text-gray">{{ row.afternoon.startTime }} - {{ row.afternoon.endTime }}</div>
              </div>
              <span v-else class="text-gray">暂无课程</span>
            </template>
          </el-table-column>
        </el-table>
</div>

        <!-- 学生列表 -->
        <div class="section-title">班级学生 ({{ studentTotal }})</div>
        <el-table class="responsive-table"
          v-loading="loadingStudents"
          :data="students"
          border
          style="width: 100%"
        >
          <el-table-column label="姓名" prop="name" width="120" />
          <el-table-column label="性别" width="80">
            <template #default="{ row }">
              {{ row.gender === 'MALE' ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column label="年龄" prop="age" width="80" />
          <el-table-column label="家长" prop="parentName" width="120" />
          <el-table-column label="联系电话" prop="parentContact" width="150" />
          <el-table-column label="入班日期" prop="joinDate" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'warning' : 'info'"
                size="small"
              >
                {{ row.status === 'ACTIVE' ? '在读' : row.status === 'INACTIVE' ? '休学' : '已转班' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="出勤率" width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="row.attendanceRate"
              />
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="studentTotal > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="studentTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div v-else-if="!loading" class="no-data">
        未找到班级数据
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CLASS_ENDPOINTS, STUDENT_ENDPOINTS } from '@/api/endpoints'
import { get } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// 定义props
interface Props {
  modelValue: boolean
  classId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classId: ''
})

// 定义emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 定义接口类型
interface ClassInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  capacity: number
  currentCount: number
  headTeacherName?: string
  assistantTeacherNames?: string[]
  classroom?: string
  ageRange: string
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  description?: string
  schedule?: ScheduleItem[]
}

interface ScheduleItem {
  day: number;
  subject: string
  startTime: string
  endTime: string;
  period: 'morning' | 'afternoon'
}

interface ClassStudent {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number
  parentName: string
  parentContact: string
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED'
  attendanceRate: number
}

interface ScheduleTableRow {
  day: number
  morning?: {
    subject: string
    startTime: string
    endTime: string
  }
  afternoon?: {
    subject: string
    startTime: string
    endTime: string
  }
}

// 响应式数据
const loading = ref(false)
const loadingStudents = ref(false)
const classData = ref<ClassInfo | null>(null)
const students = ref<ClassStudent[]>([])
const studentTotal = ref(0)
const scheduleData = ref<ScheduleTableRow[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框显示状态
const dialogVisible = ref(false)

// 响应式设计
const isDesktop = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= 768
  }
  return true
})

// 监听props变化
watch(() => props.modelValue, (newVal: boolean) => {
  dialogVisible.value = newVal
})

watch(() => dialogVisible.value, (newVal: boolean) => {
  emit('update:modelValue', newVal)
})

// 监听班级ID变化
watch(() => props.classId, (newVal: string) => {
  if (newVal && dialogVisible.value) {
    loadClassData(newVal)
  }
})

// 监听对话框状态
watch(() => dialogVisible.value, (newVal: boolean) => {
  if (newVal && props.classId) {
    loadClassData(props.classId)
  }
})

// 统一数据加载函数
const loadClassData = async (classId: string) => {
  if (!classId || classId === 'undefined' || classId === 'null') {
    handleError('班级ID无效，无法加载数据')
    return
  }
  
  try {
    await Promise.all([
      fetchClassDetail(classId),
      fetchClassStudents(classId)
    ])
  } catch (error) {
    handleError('加载班级数据失败', error)
  }
}

// 统一错误处理
const handleError = (message: string, error?: unknown) => {
  console.error(message, error)
  ElMessage.error(`${message}${error instanceof Error ? `: ${error.message}` : ''}`)
}

// 获取班级详情
const fetchClassDetail = async (id: string) => {
  loading.value = true
  try {
    const response = await get<ApiResponse<ClassInfo>>(CLASS_ENDPOINTS.GET_BY_ID(id))
    
    if (response.success || response.code === 200) {
      if (response.data && !('items' in response.data)) {
        classData.value = response.data
        buildScheduleData(response.data)
      } else {
        classData.value = null
        handleError('未找到班级数据')
      }
    } else {
      handleError(response.message || '获取班级详情失败')
    }
  } catch (error) {
    handleError('获取班级详情失败', error)
  } finally {
    loading.value = false
  }
}

// 构建课程表数据
const buildScheduleData = (classInfo: ClassInfo) => {
  const days = [1, 2, 3, 4, 5]
  const result: ScheduleTableRow[] = days.map(day => ({ day }))
  
  if (classInfo.schedule && Array.isArray(classInfo.schedule)) {
    classInfo.schedule.forEach((item: ScheduleItem) => {
      const rowIndex = result.findIndex(row => row.day === item.day)
      if (rowIndex !== -1) {
        const period = item.period || (item.startTime < '12:00' ? 'morning' : 'afternoon')
        result[rowIndex][period] = {
          subject: item.subject,
          startTime: item.startTime,
          endTime: item.endTime
        }
      }
    })
  }
  
  scheduleData.value = result
}

// 获取班级学生列表
const fetchClassStudents = async (classId: string) => {
  loadingStudents.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      classId: classId
    }
    
    const response = await get<ApiResponse<ClassStudent[]>>(STUDENT_ENDPOINTS.BASE, { params })
    
    if (response.success || response.code === 200) {
      if (Array.isArray(response.data)) {
        students.value = response.data
        studentTotal.value = response.total || response.data.length
      } else if (response.data && typeof response.data === 'object' && 'items' in response.data) {
        const items = response.data.items
        students.value = Array.isArray(items) ? items : []
        studentTotal.value = 'total' in response.data ? Number(response.data.total) : (Array.isArray(items) ? items.length : 0)
      } else if (Array.isArray(response.items)) {
        students.value = response.items
        studentTotal.value = response.total || response.items.length
      } else {
        students.value = []
        studentTotal.value = 0
      }
    } else {
      handleError(response.message || '获取班级学生失败')
    }
  } catch (error) {
    handleError('获取班级学生失败', error)
  } finally {
    loadingStudents.value = false
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  if (props.classId) {
    fetchClassStudents(props.classId)
  }
}

// 分页页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  if (props.classId) {
    fetchClassStudents(props.classId)
  }
}

// 获取星期文本
const getDayText = (day: number): string => {
  const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return days[day] || '未知'
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return ''
  try {
    const date = new Date(dateTimeStr)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化失败:', error)
    return ''
  }
}

// 获取类型标签
const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'FULL_TIME': '全日制',
    'HALF_TIME': '半日制',
    'SPECIAL': '特色班',
    'MIXED': '混合制'
  }
  return typeMap[type] || type
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': '活跃',
    'INACTIVE': '非活跃',
    'PENDING': '待开班',
    'CLOSED': '已结束',
    'SUSPENDED': '暂停'
  }
  return statusMap[status] || status
}

// 格式化容量显示
const formatCapacity = (): string => {
  return classData.value ? `${classData.value.currentCount}/${classData.value.capacity}` : '0/0'
}
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.class-detail-dialog {
  .el-dialog__body {
    padding: var(--spacing-lg);
  }
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--transform-drop) solid var(--border-color-light);
}

.text-gray {
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.no-data {
  text-align: center;
  color: var(--text-color-placeholder);
  padding: var(--spacing-xl);
  font-size: var(--font-size-base);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.el-table {
  margin-top: var(--spacing-md);
  border: var(--border-width-base) solid var(--border-color-base);
  border-radius: var(--border-radius-base);
}

.el-descriptions {
  margin-bottom: var(--spacing-lg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 移动端表格优化 */
@media (max-width: var(--breakpoint-md)) {
  .el-table {
    font-size: 0.875rem;
    
    .el-table__header th {
      padding: var(--spacing-sm) 6px;
    }
    
    .el-table__body td {
      padding: var(--spacing-sm) 6px;
    }
  }
  
  .pagination-container {
    justify-content: center;
    
    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}
</style> 