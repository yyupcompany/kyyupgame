<template>
  <div class="page-container">
    <page-header title="教师管理">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <UnifiedIcon name="Plus" />
          新增教师
        </el-button>
        <el-button @click="exportTeachers" :loading="exporting">
          <UnifiedIcon name="Download" />
          导出
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <UnifiedIcon name="Refresh" />
          刷新数据
        </el-button>
      </template>
    </page-header>

    <!-- 搜索过滤区域 -->
    <div class="filter-card">
      <div class="card-body">
        <el-form :model="searchForm" inline class="filter-form">
          <div class="filter-group">
            <el-form-item label="教师姓名">
              <el-input v-model="searchForm.keyword" placeholder="请输入教师姓名" clearable />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="searchForm.type" placeholder="选择类型" clearable>
                <el-option label="全职" value="FULL_TIME" />
                <el-option label="兼职" value="PART_TIME" />
                <el-option label="合同工" value="CONTRACT" />
                <el-option label="实习生" value="INTERN" />
              </el-select>
            </el-form-item>
            <el-form-item label="部门">
              <el-select v-model="searchForm.department" placeholder="选择部门" clearable>
                <el-option label="教学部" value="教学部" />
                <el-option label="保育部" value="保育部" />
                <el-option label="后勤部" value="后勤部" />
                <el-option label="行政部" value="行政部" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option label="在职" value="ACTIVE" />
                <el-option label="请假" value="ON_LEAVE" />
                <el-option label="离职" value="RESIGNED" />
                <el-option label="见习期" value="PROBATION" />
              </el-select>
            </el-form-item>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 教师列表 -->
    <div class="table-card">
      <div class="table-content">
        <div class="table-header">
          <div class="table-title">教师列表</div>
        </div>
        <div class="table-body">
          <div class="table-wrapper" style="overflow-x: auto;">
            <el-table 
              class="responsive-table"
              :data="items"
              v-loading="loading"
              stripe
              :max-height="500"
              table-layout="fixed"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="45" />
              <el-table-column label="工号" prop="employeeId" width="90" show-overflow-tooltip />
              <el-table-column label="姓名" prop="name" width="70" show-overflow-tooltip />
              <el-table-column label="性别" prop="gender" width="60" align="center">
              <template #default="{ row }">
                <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'" size="small">
                  {{ row.gender === 'MALE' ? '男' : '女' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="职位" prop="position" width="80" show-overflow-tooltip>
              <template #default="{ row }">
                {{ getPositionText(row.position) }}
              </template>
            </el-table-column>
            <el-table-column label="类型" prop="type" width="60" align="center">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="电话" prop="phone" width="110" show-overflow-tooltip />
            <el-table-column label="状态" prop="status" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="入职时间" prop="hireDate" width="100" show-overflow-tooltip>
              <template #default="{ row }">
                {{ formatDate(row.hireDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" @click="viewTeacherDetail(row)">查看</el-button>
                  <el-button type="success" size="small" @click="editTeacher(row)">编辑</el-button>
                  <el-dropdown trigger="click" size="small">
                    <el-button type="info" size="small">更多</el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="assignTeacherToClass(row)">分配班级</el-dropdown-item>
                        <el-dropdown-item divided @click="handleDeleteTeacher(row)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="data-footer">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 教师编辑对话框 -->
    <TeacherEditDialog 
      v-model="editDialogVisible"
      :teacher="editingTeacher"
      @save="handleSaveTeacher"
    />

    <!-- 班级分配对话框 -->
    <ClassAssignDialog
      v-model="assignDialogVisible"
      :teacher="assigningTeacher"
      :class-list="classList"
      @assign="handleClassAssignConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post, put, del } from '@/utils/request'
import { TEACHER_ENDPOINTS, CLASS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'
import TeacherEditDialog from '@/components/TeacherEditDialog.vue'
import ClassAssignDialog from '@/components/ClassAssignDialog.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

// 路由
const router = useRouter()

// 接口定义
interface Teacher {
  id: string
  employeeId: string
  name: string
  gender: 'MALE' | 'FEMALE'
  position: string
  department: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
  phone: string
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'PROBATION' | 'SUSPENDED'
  hireDate: string
  classIds?: string[]
  classNames?: string[]
}

interface TeacherQueryParams {
  keyword?: string
  type?: string
  department?: string
  status?: string
  page?: number
  pageSize?: number
}

interface ClassItem {
  id: string
  name: string
}

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const items = ref<Teacher[]>([])
const selectedTeachers = ref<Teacher[]>([])
const classList = ref<ClassItem[]>([])
const editDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const editingTeacher = ref<Teacher | null>(null)
const assigningTeacher = ref<Teacher | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 搜索表单
const searchForm = ref<TeacherQueryParams>({
  keyword: '',
  type: undefined,
  department: '',
  status: undefined
})

// 加载数据
const loadTeachers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm.value
    }
    
    const response = await get(TEACHER_ENDPOINTS.LIST, params)

    if (response.success && response.data) {
      // 映射后端数据字段到前端期望的字段
      items.value = (response.data.items || []).map((item: any) => ({
        ...item,
        employeeId: item.teacherNo || item.employeeId, // 将teacherNo映射到employeeId
        name: item.userName || item.name, // 将userName映射到name
        phone: item.phone || item.user?.phone,
        department: item.department || '', // 后端没有department字段，设为空字符串
        type: item.type || 'FULL_TIME', // 后端没有type字段，设为默认值
        classNames: item.classes?.map((c: any) => c.name) || [] // 从classes对象数组中提取班级名称
      }))
      pagination.total = response.data.total || 0
    } else {
      ErrorHandler.handle(new Error(response.message || '获取教师列表失败'), true)
    }
  } catch (error) {
    ErrorHandler.handle(error, true)
    items.value = []
  } finally {
    loading.value = false
  }
}

const loadClassList = async () => {
  try {
    const response = await get(CLASS_ENDPOINTS.BASE)

    if (response.success && response.data) {
      // 班级列表也可能使用items字段
      classList.value = response.data.items || response.data.list || []
    } else {
      ErrorHandler.handle(new Error(response.message || '获取班级列表失败'), false)
    }
  } catch (error) {
    ErrorHandler.handle(error, false)
    classList.value = []
  }
}

const refreshData = async () => {
  await Promise.all([loadTeachers(), loadClassList()])
  ElMessage.success('数据刷新成功')
}

// 搜索功能
const handleSearch = async () => {
  pagination.page = 1
  await loadTeachers()
}

const handleReset = async () => {
  searchForm.value = {
    keyword: '',
    type: undefined,
    department: '',
    status: undefined
  }
  pagination.page = 1
  await loadTeachers()
}

const handlePageChange = async (page: number) => {
  pagination.page = page
  await loadTeachers()
}

const handleSizeChange = async (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  await loadTeachers()
}

// 教师操作
const handleCreate = () => {
  editingTeacher.value = null
  editDialogVisible.value = true
}

const viewTeacherDetail = (teacher: Teacher) => {
  if (!teacher.id || teacher.id === 'undefined') {
    ElMessage.error('教师ID无效，无法查看详情')
    console.error('教师ID无效:', teacher)
    return
  }
  router.push(`/teacher/detail/${teacher.id}`)
}

const editTeacher = (teacher: Teacher) => {
  editingTeacher.value = teacher
  editDialogVisible.value = true
}

const handleSaveTeacher = async (teacherData: any) => {
  try {
    let response
    if (editingTeacher.value) {
      response = await put(TEACHER_ENDPOINTS.UPDATE(editingTeacher.value.id), teacherData)
    } else {
      response = await post(TEACHER_ENDPOINTS.CREATE, teacherData)
    }
    
    if (response.success) {
      ElMessage.success(editingTeacher.value ? '教师信息更新成功' : '教师创建成功')
      editDialogVisible.value = false
      await loadTeachers()
    } else {
      ErrorHandler.handle(new Error(response.message || '保存失败'), true)
    }
  } catch (error) {
    ErrorHandler.handle(error, true)
  }
}

const handleDeleteTeacher = async (teacher: Teacher) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教师 ${teacher.name} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await del(TEACHER_ENDPOINTS.DELETE(teacher.id))
    
    if (response.success) {
      ElMessage.success('教师删除成功')
      await loadTeachers()
    } else {
      ErrorHandler.handle(new Error(response.message || '删除失败'), true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ErrorHandler.handle(error, true)
    }
  }
}

// 班级分配功能
const assignTeacherToClass = async (teacher: Teacher) => {
  try {
    const response = await get(TEACHER_ENDPOINTS.GET_CLASSES(teacher.id))

    if (response.success) {
      // 获取教师详情以获取班级信息
      const teacherDetailResponse = await get(TEACHER_ENDPOINTS.GET_BY_ID(teacher.id))

      if (teacherDetailResponse.success && teacherDetailResponse.data) {
        const teacherData = teacherDetailResponse.data
        assigningTeacher.value = {
          ...teacher,
          classIds: teacherData.classes?.map((c: any) => c.id) || [],
          classNames: teacherData.classes?.map((c: any) => c.name) || []
        }
        assignDialogVisible.value = true
      } else {
        // 如果无法获取详情，使用基本信息
        assigningTeacher.value = {
          ...teacher,
          classIds: [],
          classNames: []
        }
        assignDialogVisible.value = true
      }
    } else {
      ErrorHandler.handle(new Error(response.message || '获取教师班级信息失败'), true)
    }
  } catch (error) {
    ErrorHandler.handle(error, true)
  }
}

const handleClassAssignConfirm = async (assignData: { teacherId: string; classIds: string[] }) => {
  try {
    const response = await post(TEACHER_ENDPOINTS.ASSIGN_CLASSES(assignData.teacherId), {
      classIds: assignData.classIds
    })
    
    if (response.success) {
      ElMessage.success('教师班级分配成功')
      assignDialogVisible.value = false
      await loadTeachers()
    } else {
      ErrorHandler.handle(new Error(response.message || '分配失败'), true)
    }
  } catch (error) {
    ErrorHandler.handle(error, true)
  }
}

// 表格选择
const handleSelectionChange = (selection: Teacher[]) => {
  selectedTeachers.value = selection
}

// 导出功能
const exportTeachers = async () => {
  exporting.value = true
  try {
    const response = await post(TEACHER_ENDPOINTS.EXPORT, {
      ...searchForm.value,
      format: 'excel'
    })
    
    if (response.success) {
      ElMessage.success('教师数据导出成功')
      // TODO: 处理文件下载
    } else {
      ErrorHandler.handle(new Error(response.message || '导出失败'), true)
    }
  } catch (error) {
    ErrorHandler.handle(error, true)
  } finally {
    exporting.value = false
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'success',
    ON_LEAVE: 'warning',
    RESIGNED: 'danger',
    PROBATION: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: '在职',
    ON_LEAVE: '请假中',
    RESIGNED: '离职',
    PROBATION: '见习期'
  }
  return statusMap[status] || status
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    FULL_TIME: 'success',
    PART_TIME: 'warning',
    CONTRACT: 'info',
    INTERN: 'primary'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    FULL_TIME: '全职',
    PART_TIME: '兼职',
    CONTRACT: '合同工',
    INTERN: '实习生'
  }
  return typeMap[type] || type
}

const getPositionText = (position: string) => {
  const positionMap: Record<string, string> = {
    'PRINCIPAL': '园长',
    'VICE_PRINCIPAL': '副园长',
    'RESEARCH_DIRECTOR': '教研主任',
    'HEAD_TEACHER': '班主任',
    'REGULAR_TEACHER': '普通教师',
    'ASSISTANT_TEACHER': '助教'
  }
  return positionMap[position] || position
}

// const getPositionTagType = (position: string) => {
//   const typeMap: Record<string, string> = {
//     'PRINCIPAL': 'danger',
//     'VICE_PRINCIPAL': 'warning',
//     'RESEARCH_DIRECTOR': 'success',
//     'HEAD_TEACHER': 'primary',
//     'REGULAR_TEACHER': 'info',
//     'ASSISTANT_TEACHER': ''
//   }
//   return typeMap[position] || 'info'
// }

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await Promise.all([loadTeachers(), loadClassList()])
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* 使用全局布局样式，只需要少量自定义样式 */
.text-muted {
  color: var(--text-secondary);
}

/* ✨ 表格容器样式 - 防止无限扩大 */
.table-card {
  .table-wrapper {
    overflow: hidden;
    
    .responsive-table {
      width: 100% !important;
    }
  }
}

/* ✨ 操作按钮样式 - 紧凑版 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  justify-content: center;
  flex-wrap: nowrap;

  .el-button {
    min-width: auto;
    padding: var(--spacing-xs) 8px;
    border-radius: 4px;
    font-size: var(--text-xs);
    font-weight: 500;
    height: 26px;
    line-height: 1;

    &.el-button--primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      color: #ffffff !important;
    }

    &.el-button--success {
      background-color: var(--success-color) !important;
      border-color: var(--success-color) !important;
      color: #ffffff !important;
    }

    &.el-button--info {
      background-color: var(--info-color, #909399) !important;
      border-color: var(--info-color, #909399) !important;
      color: #ffffff !important;
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .filter-form {
    .el-form-item {
      margin-right: var(--spacing-2xl);
      margin-bottom: var(--spacing-4xl);
    }
  }
}
</style>