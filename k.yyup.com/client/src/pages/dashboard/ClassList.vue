<template>
  <div class="dashboard-container">
    <!-- 页头 -->
    <div class="dashboard-page-header">
      <h1 class="page-title">班级管理</h1>
      <div class="page-actions">
        <el-button type="primary" class="dashboard-action-btn primary" @click="handleCreate">创建班级</el-button>
      </div>
    </div>

    <!-- 搜索过滤区 - 深度UX优化 -->
    <div class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">筛选条件</h3>
      </div>
      <div class="data-content">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="班级名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入班级名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="班级类型">
            <el-select
              v-model="filterForm.type"
              placeholder="选择班级类型"
              clearable
            >
              <el-option
                v-for="item in classTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级状态">
            <el-select
              v-model="filterForm.status"
              placeholder="选择班级状态"
              clearable
            >
              <el-option
                v-for="item in classStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="filterForm.startDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="data-action-btn" @click="handleSearch">搜索</el-button>
            <el-button class="data-action-btn" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 数据展示 - 深度UX优化 -->
    <div v-else-if="!loading && !error" class="dashboard-data-section">
      <div class="data-header">
        <h3 class="data-title">班级列表</h3>
        <div class="data-actions">
          <span class="data-stats">共 {{ pagination.total }} 个班级</span>
        </div>
      </div>
      <div class="data-content">
        <!-- 数据表格 -->
        <div class="table-wrapper">
          <!-- 空状态 -->
          <div v-if="!classList.length" class="empty-state">
            <div class="empty-icon">🏠</div>
            <div class="empty-title">暂无班级数据</div>
            <div class="empty-description">还没有创建任何班级，立即创建第一个班级吧！</div>
            <button class="empty-action" @click="handleCreate">创建班级</button>
          </div>

          <el-table
            v-else
            :data="classList"
            class="responsive-table dashboard-table"
            border
            style="width: 100%"
          >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="班级名称" min-width="120" />
          <el-table-column label="班级类型" width="100">
            <template #default="{ row }">
              <class-type-tag :type="row.type" />
            </template>
          </el-table-column>
          <el-table-column label="班级状态" width="100">
            <template #default="{ row }">
              <class-status-tag :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="headTeacherName" label="班主任" width="120">
            <template #default="{ row }">
              {{ row.headTeacherName || '未分配' }}
            </template>
          </el-table-column>
          <el-table-column label="学生人数" width="120">
            <template #default="{ row }">
              {{ row.currentCount }}/{{ row.capacity }}
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="结束日期" width="120" />
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <class-actions
                :class-data="row"
                @view="handleView"
                @edit="handleEdit"
                @manage-students="handleManageStudents"
                @manage-teachers="handleManageTeachers"
                @set-status="handleSetStatus"
                @delete="confirmDelete"
              />
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>
      
      <!-- 分页 -->
      <div class="dashboard-pagination" v-if="classList.length > 0">
        <el-pagination
          v-model:currentPage="pagination.page"
                  v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
    >
      <span>您确定要删除班级 "{{ selectedClass?.name }}" 吗？此操作不可逆。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 枚举定义
enum ClassType {
  TODDLER = 'TODDLER',
  NURSERY = 'NURSERY',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR'
}

enum ClassStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

// 类型定义
interface ClassInfo {
  id: string;
  name: string;
  type: ClassType;
  status: ClassStatus;
  capacity: number
  currentCount: number
  headTeacherId?: string
  headTeacherName?: string
  assistantTeacherIds?: string[]
  assistantTeacherNames?: string[]
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// 查询过滤参数
interface ClassFilter {
  name: string
  type?: ClassType
  status?: ClassStatus
  teacherId?: string
  startDateRange?: [string, string];
  page: number;
  size: number
}

// 模拟组件
const ClassStatusTag = defineComponent({
  name: 'ClassStatusTag',
  props: {
    status: {
      type: String,
  required: true
    }
  },
  template: '<span>{{ status }}</span>'
})

const ClassTypeTag = defineComponent({
  name: 'ClassTypeTag',
  props: {
    type: {
      type: String,
  required: true
    }
  },
  template: '<span>{{ type }}</span>'
})

const ClassActions = defineComponent({
  name: 'ClassActions',
  props: {
    classData: {
      type: Object,
  required: true
    }
  },
  emits: ['view', 'edit', 'manage-students', 'manage-teachers', 'set-status', 'delete'],
  template: '<div></div>'
})

// 模拟获取班级列表
const mockGetClassList = () => {
  const mockData = [
    {
      id: '1',
  name: '向日葵班',
  type: ClassType.NURSERY,
  status: ClassStatus.ACTIVE,
  capacity: 30,
      currentCount: 28,
      startDate: '2023-09-01',
      endDate: '2024-07-31',
      createdAt: '2023-08-15T10:00:00Z',
      updatedAt: '2023-08-15T10:00:00Z',
      headTeacherId: '101',
      headTeacherName: '张老师',
      assistantTeacherIds: ['102', '103'],
      assistantTeacherNames: ['李老师', '王老师']
    },
    {
      id: '2',
  name: '蒲公英班',
  type: ClassType.JUNIOR,
  status: ClassStatus.ACTIVE,
  capacity: 28,
      currentCount: 26,
      startDate: '2023-09-01',
      endDate: '2024-07-31',
      createdAt: '2023-08-15T11:30:00Z',
      updatedAt: '2023-08-15T11:30:00Z',
      headTeacherId: '104',
      headTeacherName: '赵老师',
      assistantTeacherIds: ['105'],
      assistantTeacherNames: ['孙老师']
    },
    {
      id: '3',
  name: '樱花班',
  type: ClassType.SENIOR,
  status: ClassStatus.ACTIVE,
  capacity: 25,
      currentCount: 24,
      startDate: '2023-09-01',
      endDate: '2024-07-31',
      createdAt: '2023-08-16T09:15:00Z',
      updatedAt: '2023-08-16T09:15:00Z',
      headTeacherId: '106',
      headTeacherName: '钱老师',
      assistantTeacherIds: ['107', '108'],
      assistantTeacherNames: ['周老师', '吴老师']
    }
  ]

  return {
    items: mockData,
  total: mockData.length
  }
}

// 模拟更新班级状态
const mockUpdateClassStatus = (id: string, data: { status: ClassStatus }) => {
  console.log(`更新班级状态: ID=${id}, 状态=${data.status}`)
  return Promise.resolve(true)
}

// 模拟删除班级
const mockDeleteClass = (id: string) => {
  console.log(`删除班级: ID=${id}`)
  return Promise.resolve(true)
}

const router = useRouter()

// 状态定义
const loading = ref(false)
const error = ref<string | null>(null)
const classList = ref<ClassInfo[]>([])
const selectedClass = ref<ClassInfo | null>(null)
const deleteDialogVisible = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 过滤条件
const filterForm = ref<ClassFilter>({
  name: '',
  type: undefined,
  status: undefined,
  teacherId: undefined,
  startDateRange: undefined,
  page: 1,
  size: 10
})

// 班级类型选项
const classTypeOptions = computed(() => [
  { value: ClassType.TODDLER, label: '托班' },
  { value: ClassType.NURSERY, label: '小班' },
  { value: ClassType.JUNIOR, label: '中班' },
  { value: ClassType.SENIOR, label: '大班' }
])

// 班级状态选项
const classStatusOptions = computed(() => [
  { value: ClassStatus.ACTIVE, label: '正常' },
  { value: ClassStatus.INACTIVE, label: '暂停' },
  { value: ClassStatus.ARCHIVED, label: '已归档' }
])

// 获取班级列表
const getClassList = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { items, total } = mockGetClassList()
    classList.value = items
    pagination.value.total = total
  } catch (err) {
    error.value = '加载班级数据失败，请稍后重试'
    console.error('Failed to load classes:', err)
  } finally {
    loading.value = false
  }
}

// 搜索班级
const handleSearch = () => {
  pagination.value.page = 1
  getClassList()
}

// 重置搜索条件
const handleReset = () => {
  filterForm.value = {
    name: '',
  type: undefined,
  status: undefined,
    teacherId: undefined,
    startDateRange: undefined,
  page: 1,
  size: 10
  }
  pagination.value.page = 1
  getClassList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  getClassList()
}

// 每页条数变化
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  getClassList()
}

// 处理创建班级
const handleCreate = () => {
  router.push('/dashboard/class/create')
}

// 查看班级详情
const handleView = (classData: ClassInfo) => {
  router.push(`/dashboard/class/${classData.id}`)
}

// 编辑班级
const handleEdit = (classData: ClassInfo) => {
  router.push(`/dashboard/class/${classData.id}/edit`)
}

// 学生管理
const handleManageStudents = (classData: ClassInfo) => {
  router.push(`/dashboard/class/${classData.id}/students`)
}

// 教师管理
const handleManageTeachers = (classData: ClassInfo) => {
  router.push(`/dashboard/class/${classData.id}/teachers`)
}

// 修改班级状态
const handleSetStatus = async (classData: ClassInfo) => {
  loading.value = true
  
  try {
    const success = await mockUpdateClassStatus(classData.id, {
      status: classData.status
    })
    
    if (success) {
      ElMessage.success('班级状态更新成功')
      getClassList()
    } else {
      ElMessage.error('班级状态更新失败')
    }
  } catch (err) {
    ElMessage.error('班级状态更新失败，请稍后重试')
    console.error('Failed to update class status:', err)
  } finally {
    loading.value = false
  }
}

// 确认删除
const confirmDelete = (classData: ClassInfo) => {
  selectedClass.value = classData
  deleteDialogVisible.value = true
}

// 处理删除
const handleDelete = async () => {
  if (!selectedClass.value) return
  
  loading.value = true
  
  try {
    const success = await mockDeleteClass(selectedClass.value.id)
    
    if (success) {
      ElMessage.success('班级删除成功')
      deleteDialogVisible.value = false
      getClassList()
    } else {
      ElMessage.error('班级删除失败')
    }
  } catch (err) {
    ElMessage.error('班级删除失败，请稍后重试')
    console.error('Failed to delete class:', err)
  } finally {
    loading.value = false
    selectedClass.value = null
  }
}

// 组件挂载时加载数据
onMounted(() => {
  getClassList()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './dashboard-ux-styles.scss' as *;

.page-container {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.filter-container {
  margin-bottom: var(--text-2xl);
  padding: var(--spacing-4xl);
  background-color: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
}

.loading-container {
  padding: var(--spacing-lg) 0;
}

.data-container {
  margin-bottom: var(--text-2xl);
}

.pagination-container {
  margin-top: var(--text-2xl);
  text-align: right;
}
</style>

