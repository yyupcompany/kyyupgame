<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="card">
      <div class="card-header">
        <h1 class="card-title">学生管理</h1>
        <div class="card-actions">
          <el-button type="primary" @click="handleCreate">
            <UnifiedIcon name="Plus" />
            新增学生
          </el-button>
          <el-button @click="exportStudents">
            <UnifiedIcon name="Download" />
            导出
          </el-button>
        </div>
      </div>

      <!-- 搜索过滤区域 -->
      <div class="card-body">
        <div class="card filter-card">
          <div class="card-body">
            <el-form :model="searchForm" class="filter-form">
              <div class="filter-group">
                <el-form-item label="学生姓名">
                  <el-input v-model="searchForm.keyword" placeholder="请输入学生姓名" clearable />
                </el-form-item>
                <el-form-item label="所属班级">
                  <el-select v-model="searchForm.classId" placeholder="选择班级" clearable>
                    <el-option 
                      v-for="cls in classList" 
                      :key="cls.id" 
                      :label="cls.name" 
                      :value="cls.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="searchForm.gender" placeholder="选择性别" clearable>
                    <el-option label="男" value="MALE" />
                    <el-option label="女" value="FEMALE" />
                  </el-select>
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                    <el-option label="在读" value="ACTIVE" />
                    <el-option label="毕业" value="GRADUATED" />
                    <el-option label="转校" value="TRANSFERRED" />
                    <el-option label="休学" value="SUSPENDED" />
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

        <!-- 学生列表 -->
        <div class="table-container">
          <div class="table-wrapper">
<el-table class="responsive-table student-table"
        :data="items"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="学号" prop="id" width="100" />
        <el-table-column label="姓名" prop="name" min-width="120" />
        <el-table-column label="性别" prop="gender" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'" size="small">
              {{ row.gender === 'MALE' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="年龄" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.birth_date">
              {{ calculateAge(row.birth_date) }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="所属班级" min-width="140">
          <template #default="{ row }">
            <span v-if="row.class_name">
              {{ row.class_name }}
            </span>
            <span v-else class="text-muted">未分班</span>
          </template>
        </el-table-column>
        <el-table-column label="家长姓名" min-width="120">
          <template #default="{ row }">
            <span v-if="row.guardian && row.guardian.name">
              {{ row.guardian.name }}
            </span>
            <span v-else class="text-muted">未绑定</span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" width="120" class-name="mobile-hidden">
          <template #default="{ row }">
            <span v-if="row.guardian && row.guardian.phone">
              {{ row.guardian.phone }}
            </span>
            <span v-else class="text-muted">暂未登记</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入学时间" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.enrollment_date">
              {{ formatDate(row.enrollment_date) }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewStudent(row)">
                查看
              </el-button>
              <el-button type="success" size="small" @click="editStudent(row)">
                编辑
              </el-button>
              <el-dropdown trigger="click" size="small">
                <el-button type="info" size="small">
                  更多
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="transferStudent(row)">
                      转班
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDeleteStudent(row)">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
</div>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.currentPage"
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
    </div>

    <!-- 学生编辑对话框 -->
    <StudentEditDialog 
      v-model="editDialogVisible"
      :student="editingStudent"
      :class-list="classList"
      @save="handleSaveStudent"
    />

    <!-- 转班对话框 -->
    <TransferDialog
      v-model="transferDialogVisible"
      :student="transferringStudent"
      :class-list="classList"
      @transfer="handleTransferConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCrudOperations } from '@/composables/useCrudOperations'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import request from '@/utils/request'
import type { Student, StudentQueryParams } from '@/api/modules/student'
import StudentEditDialog from '@/components/StudentEditDialog.vue'
import TransferDialog from '@/components/TransferDialog.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'  // ✨ 添加图标组件导入

// 路由
const router = useRouter()

// 学生API配置
const studentApi = {
  list: (params: StudentQueryParams) => request.get(STUDENT_ENDPOINTS.BASE, { params }),
  create: (data: any) => request.post(STUDENT_ENDPOINTS.BASE, data),
  update: (id: string, data: any) => request.put(STUDENT_ENDPOINTS.UPDATE(id), data),
  delete: (id: string) => request.delete(STUDENT_ENDPOINTS.DELETE(id))
}

// 使用CRUD操作组合式函数
const { 
  loading, 
  items, 
  total, 
  pagination,
  loadItems, 
  createItem, 
  updateItem, 
  deleteItem,
  search,
  resetSearch,
  handlePageChange,
  handleSizeChange
} = useCrudOperations<Student>(studentApi as any)

// 页面状态
const searchForm = ref<StudentQueryParams>({
  keyword: '',
  classId: '',
  gender: undefined,
  status: undefined
})

const classList = ref<Array<{ id: string; name: string }>>([])
const selectedStudents = ref<Student[]>([])
const editDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const editingStudent = ref<Student | null>(null)
const transferringStudent = ref<Student | null>(null)

// 加载班级列表
const loadClassList = async () => {
  try {
    // 这里应该调用班级API
    classList.value = [
      { id: '1', name: '小班A' },
      { id: '2', name: '中班B' }, 
      { id: '3', name: '大班C' }
    ]
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

// 搜索功能
const handleSearch = async () => {
  await search(searchForm.value)
}

const handleReset = async () => {
  searchForm.value = {
    keyword: '',
    classId: '',
    gender: undefined,
    status: undefined
  }
  await resetSearch()
}

// 学生操作
const handleCreate = () => {
  editingStudent.value = null
  editDialogVisible.value = true
}

const viewStudent = (student: Student) => {
  router.push(`/student/detail/${student.id}`)
}

const editStudent = (student: Student) => {
  editingStudent.value = student
  editDialogVisible.value = true
}

const handleSaveStudent = async (studentData: any) => {
  try {
    if (editingStudent.value) {
      await updateItem(editingStudent.value.id, studentData)
    } else {
      await createItem(studentData)
    }
    editDialogVisible.value = false
  } catch (error) {
    console.error('保存学生信息失败:', error)
  }
}

const handleDeleteStudent = async (student: Student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 ${student.name} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteItem(student.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
    }
  }
}

// 转班功能
const transferStudent = (student: Student) => {
  // 将student转换为TransferDialog期望的格式（id保持number类型，在emit时转换）
  transferringStudent.value = student
  transferDialogVisible.value = true
}

const handleTransferConfirm = async (data: { studentId: string; newClassId: string }) => {
  try {
    // 这里应该调用转班 API
    ElMessage.success('学生转班成功')
    transferDialogVisible.value = false
    await loadItems()
  } catch (error) {
    ElMessage.error('转班失败')
    console.error('转班失败:', error)
  }
}

// 表格选择
const handleSelectionChange = (selection: Student[]) => {
  selectedStudents.value = selection
}

// 导出功能
const exportStudents = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要导出的学生')
    return
  }

  try {
    // 准备导出数据
    const exportData = selectedStudents.value.map(student => ({
      '姓名': student.name,
      '学号': String(student.id),
      '性别': student.gender === 'MALE' ? '男' : '女',
      '年龄': student.age,
      '班级': student.currentClassName || '未分配',
      '状态': student.status === 'ACTIVE' ? '在读' : student.status === 'GRADUATED' ? '已毕业' : '其他'
    }))

    // 创建CSV内容
    const headers = Object.keys(exportData[0]) as Array<keyof typeof exportData[0]>
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `学生信息_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`成功导出 ${selectedStudents.value.length} 条学生信息`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'success',
    GRADUATED: 'info',
    TRANSFERRED: 'warning',
    SUSPENDED: 'danger',
    INACTIVE: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: '在读',
    GRADUATED: '毕业', 
    TRANSFERRED: '转校',
    SUSPENDED: '休学',
    INACTIVE: '非活动'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未填写'  // ✨ 中文说明
  
  try {
    const date = new Date(dateString)
    // 检查是否是有效日期
    if (isNaN(date.getTime())) {
      return '日期格式错误'  // ✨ 中文错误提示
    }
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '日期格式错误'  // ✨ 中文错误提示
  }
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age + '岁'
}

// 生命周期
onMounted(async () => {
  console.log('🚀 学生管理页面加载...')
  await loadClassList()
  console.log('📋 开始加载学生数据...')
  await loadItems()
  console.log('✅ 学生数据加载完成:', {
    total: total.value,
    itemsLength: items.value.length,
    items: items.value
  })
})
</script>

<style lang="scss" scoped>
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

// 页面特定样式
.table-container {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-light);
  overflow: hidden;

  .table-wrapper {
    border-radius: var(--border-radius-base);

    .responsive-table {
      border-radius: var(--border-radius-base);
      box-shadow: var(--shadow-sm);

      :deep(.el-table__header) {
        background-color: var(--bg-color-page);

        th {
          background-color: var(--bg-color-page);
          border-bottom: 1px solid var(--border-color-light);
          color: var(--text-color-primary);
          font-weight: 600;
          font-size: var(--text-sm);
        }
      }

      :deep(.el-table__body) {
        tr {
          transition: background-color var(--transition-base);

          &:hover {
            background-color: var(--bg-color-hover);
          }

          td {
            border-bottom: 1px solid var(--border-color-lighter);
            color: var(--text-color-regular);
            font-size: var(--text-sm);
            padding: var(--spacing-md);
          }
        }
      }

      :deep(.el-table__empty-text) {
        color: var(--text-color-placeholder);
        font-size: var(--text-sm);
      }
    }
  }
}

.pagination-container {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;

  :deep(.el-pagination) {
    .el-pager li {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color-light);
      border-radius: 6px;  /* 圆角 */
      margin: 0 4px;
      color: var(--text-color-regular);
      font-size: var(--text-sm);  /* 字体大小 */
      transition: all 0.2s ease;

      &:hover {
        background-color: #e8f4ff;  /* hover背景 */
        border-color: var(--button-primary-border);
        color: var(--button-primary-bg);
      }

      &.is-active {
        background-color: var(--button-primary-bg);
        border-color: var(--button-primary-border);
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);  /* 阴影 */
      }
    }

    .btn-prev,
    .btn-next {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color-light);
      border-radius: 6px;  /* 圆角 */
      color: var(--text-color-regular);
      font-size: var(--text-sm);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: #e8f4ff;
        border-color: var(--button-primary-border);
        color: var(--button-primary-bg);
      }
    }
  }
}

// 操作按钮样式 - 紧凑版
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);  /* ✨ 更紧凑的间距 */
  justify-content: center;
  flex-wrap: nowrap;

  .el-button {
    min-width: auto;
    padding: var(--spacing-xs) 8px;  /* ✨ 更小的内边距 */
    border-radius: 4px;
    font-size: var(--text-xs);  /* ✨ 更小的字体 */
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    height: 26px;  /* ✨ 固定高度 */
    line-height: 1;

    /* ✨ 使用主题系统的按钮变量 */
    &.el-button--primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      color: #ffffff !important;

      &:hover {
        background-color: var(--primary-hover) !important;
        border-color: var(--primary-hover) !important;
      }
    }

    &.el-button--success {
      background-color: var(--success-color) !important;
      border-color: var(--success-color) !important;
      color: #ffffff !important;

      &:hover {
        background-color: var(--success-hover, #85ce61) !important;
        border-color: var(--success-hover, #85ce61) !important;
      }
    }

    &.el-button--info {
      background-color: var(--info-color, #909399) !important;
      border-color: var(--info-color, #909399) !important;
      color: #ffffff !important;

      &:hover {
        background-color: var(--info-hover, #a6a9ad) !important;
        border-color: var(--info-hover, #a6a9ad) !important;
      }
    }
  }
}

/* ✨ 表格样式优化 */
.student-table {
  :deep(.el-table__header-wrapper) {
    th {
      background-color: #fafbfc;
      color: #2c3e50;
      font-weight: 600;
      font-size: var(--text-sm);
      padding: var(--spacing-md) 0;
      border-bottom: 2px solid #e4e7ed;
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__row {
      td {
        padding: var(--spacing-md) 0;
        font-size: var(--text-sm);
        color: #2c3e50;
        border-bottom: 1px solid #f0f2f5;
      }

      &:hover {
        background-color: #f7f8fa !important;
      }
    }
  }

  :deep(.el-tag) {
    border-radius: 12px;
    padding: 2px 10px;
    font-size: var(--text-xs);
    border: none;
    
    &.el-tag--danger {
      background-color: #ffe5e5;
      color: #f56c6c;
    }
    
    &.el-tag--primary {
      background-color: #e8f4ff;
      color: #409eff;
    }
    
    &.el-tag--success {
      background-color: #e8f8f0;
      color: #52c41a;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .card {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }
  }

  // 隐藏移动端不重要的列
  :deep(.mobile-hidden) {
    display: none;
  }

  // 优化表格在移动端的显示
  .student-table {
    :deep(.el-table__body-wrapper) {
      overflow-x: auto;
      background: var(--bg-card);
    }
  }

  // 优化操作按钮在移动端的显示
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-xs);

    .el-button {
      min-width: var(--btn-width-sm);
      width: 100%;
      justify-content: center;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .filter-form {
    .filter-group {
      flex-direction: column;

      .el-form-item {
        margin-bottom: var(--spacing-md);
      }
    }
  }

  .table-container {
    margin-top: var(--spacing-md);
  }

  .action-buttons {
    .primary-actions {
      flex-direction: column;
      width: 100%;
    }
  }
}
</style>