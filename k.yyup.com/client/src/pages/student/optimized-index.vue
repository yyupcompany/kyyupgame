<template>
  <!-- 导入优化样式 -->
  <style src="@/styles/list-components-optimization.scss"></style>

  <div class="page-container student-management-page">
    <!-- 页面头部 -->
    <div class="list-container">
      <div class="list-header">
        <h1 class="list-title">
          <UnifiedIcon name="students" />
          学生管理
        </h1>
        <div class="list-actions">
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
      <div class="list-content">
        <div class="search-filter-bar">
          <div class="filter-row">
            <div class="filter-item">
              <span class="filter-label">学生姓名</span>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入学生姓名"
                clearable
                style="max-width: 200px; width: 100%"
                class="hidden-xs"
              />
              <el-input
                v-model="searchForm.keyword"
                placeholder="姓名"
                clearable
                class="mobile-only"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">所属班级</span>
              <el-select
                v-model="searchForm.classId"
                placeholder="选择班级"
                clearable
                style="max-width: 160px; width: 100%"
                class="hidden-xs"
              >
                <el-option
                  v-for="cls in classList"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
              <el-select
                v-model="searchForm.classId"
                placeholder="班级"
                clearable
                class="mobile-only"
              >
                <el-option
                  v-for="cls in classList"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
            </div>
            <div class="filter-item hidden-sm">
              <span class="filter-label">性别</span>
              <el-select v-model="searchForm.gender" placeholder="选择性别" clearable style="max-width: 100px; width: 100%">
                <el-option label="男" value="MALE" />
                <el-option label="女" value="FEMALE" />
              </el-select>
            </div>
            <div class="filter-item hidden-sm">
              <span class="filter-label">状态</span>
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="max-max-width: 120px; width: 100%; width: 100%">
                <el-option label="在读" value="ACTIVE" />
                <el-option label="毕业" value="GRADUATED" />
                <el-option label="转校" value="TRANSFERRED" />
                <el-option label="休学" value="SUSPENDED" />
              </el-select>
            </div>
            <div class="filter-actions">
              <el-button type="primary" @click="handleSearch">
                <UnifiedIcon name="Search" />
                搜索
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </div>
          </div>
        </div>

        <!-- 数据表格容器 -->
        <div class="data-table-container">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-button
                v-if="selectedStudents.length > 0"
                type="danger"
                @click="handleBatchDelete"
              >
                <UnifiedIcon name="Delete" />
                批量删除 ({{ selectedStudents.length }})
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-select v-model="pageSize" @change="handlePageSizeChange" style="width: 120px">
                <el-option label="10条/页" :value="10" />
                <el-option label="20条/页" :value="20" />
                <el-option label="50条/页" :value="50" />
                <el-option label="100条/页" :value="100" />
              </el-select>
            </div>
          </div>

          <div class="table-wrapper">
            <el-table
              :data="items"
              v-loading="loading"
              stripe
              class="student-table responsive-table"
              @selection-change="handleSelectionChange"
              :default-sort="{ prop: 'created_at', order: 'descending' }"
            >
              <el-table-column type="selection" width="55" fixed="left" />

              <!-- 学号列 - 移动端隐藏 -->
              <el-table-column
                label="学号"
                prop="id"
                width="100"
                class-name="hidden-sm"
              />

              <!-- 姓名列 -->
              <el-table-column
                label="姓名"
                prop="name"
                min-width="120"
                fixed="left"
                show-overflow-tooltip
              />

              <!-- 性别列 -->
              <el-table-column
                label="性别"
                prop="gender"
                width="80"
                align="center"
                class-name="hidden-xs"
              >
                <template #default="{ row }">
                  <el-tag
                    :type="row.gender === 'MALE' ? 'primary' : 'danger'"
                    size="small"
                  >
                    {{ row.gender === 'MALE' ? '男' : '女' }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- 年龄列 -->
              <el-table-column
                label="年龄"
                width="70"
                align="center"
                class-name="hidden-md"
              >
                <template #default="{ row }">
                  <span v-if="row.birth_date" class="text-break">
                    {{ calculateAge(row.birth_date) }}岁
                  </span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>

              <!-- 所属班级列 -->
              <el-table-column
                label="所属班级"
                min-width="140"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <el-tag v-if="row.class_name" type="info" size="small">
                    {{ row.class_name }}
                  </el-tag>
                  <span v-else class="text-muted">未分班</span>
                </template>
              </el-table-column>

              <!-- 家长姓名列 - 移动端隐藏 -->
              <el-table-column
                label="家长姓名"
                min-width="120"
                class-name="hidden-sm"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <span v-if="row.parent_name">{{ row.parent_name }}</span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>

              <!-- 联系电话列 - 大屏幕显示 -->
              <el-table-column
                label="联系电话"
                min-width="130"
                class-name="hidden-lg"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <span v-if="row.contact_phone">{{ row.contact_phone }}</span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>

              <!-- 状态列 -->
              <el-table-column
                label="状态"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                  >
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- 操作列 -->
              <el-table-column
                label="操作"
                width="180"
                fixed="right"
                align="center"
              >
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="handleView(row)"
                    >
                      <UnifiedIcon name="eye" />
                      <span class="hidden-xs">查看</span>
                    </el-button>
                    <el-button
                      type="success"
                      link
                      size="small"
                      @click="handleEdit(row)"
                    >
                      <UnifiedIcon name="Edit" />
                      <span class="hidden-xs">编辑</span>
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleDelete(row)"
                    >
                      <UnifiedIcon name="Delete" />
                      <span class="hidden-xs">删除</span>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分页组件 -->
        <div class="list-footer">
          <div class="list-info">
            共 {{ total }} 条记录，当前第 {{ currentPage }} 页
          </div>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 学生详情对话框 -->
    <StudentDetailDialog
      v-model="detailDialogVisible"
      :student-id="selectedStudentId"
      @refresh="loadStudents"
    />

    <!-- 学生编辑对话框 -->
    <StudentEditDialog
      v-model="editDialogVisible"
      :student-id="selectedStudentId"
      @refresh="loadStudents"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import StudentDetailDialog from '@/components/dialogs/StudentDetailDialog.vue'
import StudentEditDialog from '@/components/dialogs/StudentEditDialog.vue'
import { getStudentList, deleteStudent, batchDeleteStudents } from '@/api/student'
import type { Student } from '@/types/student'

// 响应式数据
const loading = ref(false)
const items = ref<Student[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedStudents = ref<Student[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  classId: null,
  gender: '',
  status: ''
})

// 对话框状态
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const selectedStudentId = ref<string | null>(null)

// 班级列表
const classList = ref([
  { id: 1, name: '小一班' },
  { id: 2, name: '小二班' },
  { id: 3, name: '中一班' },
  { id: 4, name: '中二班' },
  { id: 5, name: '大一班' },
  { id: 6, name: '大二班' }
])

// 计算年龄
const calculateAge = (birthDate: string) => {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    ACTIVE: 'success',
    GRADUATED: 'info',
    TRANSFERRED: 'warning',
    SUSPENDED: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    ACTIVE: '在读',
    GRADUATED: '毕业',
    TRANSFERRED: '转校',
    SUSPENDED: '休学'
  }
  return statusMap[status] || '未知'
}

// 加载学生列表
const loadStudents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    const response = await getStudentList(params)
    items.value = response.data.items || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载学生列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadStudents()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    classId: null,
    gender: '',
    status: ''
  })
  handleSearch()
}

// 页面大小改变
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  loadStudents()
}

// 页码改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadStudents()
}

// 选择改变
const handleSelectionChange = (selection: Student[]) => {
  selectedStudents.value = selection
}

// 新增学生
const handleCreate = () => {
  selectedStudentId.value = null
  editDialogVisible.value = true
}

// 查看学生
const handleView = (student: Student) => {
  selectedStudentId.value = student.id
  detailDialogVisible.value = true
}

// 编辑学生
const handleEdit = (student: Student) => {
  selectedStudentId.value = student.id
  editDialogVisible.value = true
}

// 删除学生
const handleDelete = async (student: Student) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    await deleteStudent(student.id)
    ElMessage.success('删除成功')
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要删除的学生')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStudents.value.length} 个学生吗？此操作不可恢复。`,
      '确认批量删除',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    const ids = selectedStudents.value.map(student => student.id)
    await batchDeleteStudents(ids)
    ElMessage.success('批量删除成功')
    loadStudents()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

// 导出学生数据
const exportStudents = () => {
  ElMessage.info('导出功能开发中...')
}

// 页面加载时获取数据
onMounted(() => {
  loadStudents()
})
</script>

<style lang="scss" scoped>
.student-management-page {
  padding: var(--spacing-lg);

  @include respond-below(sm) {
    padding: var(--spacing-md);
  }
}

// 表格操作按钮组样式
.table-actions {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
  flex-wrap: wrap;

  @include respond-below(sm) {
    flex-direction: column;
    gap: 2px;
  }

  .el-button {
    padding: var(--spacing-xs) 8px;
    font-size: var(--text-xs);

    @include respond-below(sm) {
      padding: 6px 4px;
      font-size: 11px;
    }
  }
}

// 响应式表格样式
.responsive-table {
  @include respond-below(sm) {
    font-size: var(--text-xs);

    .el-table__header-wrapper {
      .el-table__header {
        th {
          padding: 6px 4px;
          font-size: 11px;
        }
      }
    }

    .el-table__body-wrapper {
      .el-table__body {
        td {
          padding: 6px 4px;
          font-size: 11px;
        }
      }
    }
  }
}

// 标签样式优化
.el-tag {
  font-size: var(--text-xs);
  padding: 2px 6px;

  @include respond-below(sm) {
    font-size: 10px;
    padding: 1px 4px;
  }
}

// 文本省略和断行
.text-ellipsis {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-break {
  word-wrap: break-word;
  word-break: break-word;
}

.text-muted {
  color: var(--text-color-placeholder);
}

// 分页响应式
.el-pagination {
  @include respond-below(sm) {
    .el-pagination__sizes,
    .el-pagination__jump {
      display: none;
    }
  }
}
</style>