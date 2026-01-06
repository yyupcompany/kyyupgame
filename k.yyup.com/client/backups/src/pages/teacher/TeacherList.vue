<template>
  <div class="page-container">
    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="searchForm" label-width="80px" class="search-form">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="关键词">
                <el-input 
                  v-model="searchForm.keyword" 
                  placeholder="姓名/电话/职称" 
                  clearable 
                  class="search-input"
                  @keyup.enter="handleSearch" 
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="状态">
                <el-select 
                  v-model="searchForm.status" 
                  placeholder="全部状态" 
                  clearable
                  class="search-select"
                >
                  <el-option v-for="(label, value) in statusOptions" :key="value" :label="label" :value="value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="类型">
                <el-select 
                  v-model="searchForm.type" 
                  placeholder="全部类型" 
                  clearable
                  class="search-select"
                >
                  <el-option v-for="(label, value) in typeOptions" :key="value" :label="label" :value="value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label=" " class="search-actions">
                <div class="action-buttons">
                  <el-button type="primary" @click="handleSearch" class="search-btn">
                    <el-icon><Search /></el-icon>
                    <span class="btn-text">搜索</span>
                  </el-button>
                  <el-button @click="handleReset" class="reset-btn">
                    <el-icon><Refresh /></el-icon>
                    <span class="btn-text">重置</span>
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <!-- 教师列表区域 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">教师列表</div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAddTeacher">
            <el-icon><Plus /></el-icon>
            添加教师
          </el-button>
        </div>
      </div>
      
      <div class="app-card-content">
        <!-- 响应式表格容器 -->
        <div class="responsive-table-container">
          <el-table :data="teacherList" border v-loading="loading" style="width: 100%" class="desktop-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="phone" label="联系电话" min-width="130" />
          <el-table-column label="职称" min-width="100">
            <template #default="{ row }">
              <span v-if="row.position">
                {{ getPositionText(row.position) }}
              </span>
              <span v-else class="text-muted">未知</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hireDate" label="入职时间" width="120" />
          <el-table-column label="操作" :width="operationColumnWidth" align="center" :fixed="isDesktop ? 'right' : false">
            <template #default="{ row }">
              <el-button size="small" text @click="handleViewTeacher(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="primary" text @click="handleEditTeacher(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" text @click="handleDeleteTeacher(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 移动端卡片视图 -->
        <div class="mobile-cards" v-if="teacherList.length > 0">
          <div
            v-for="teacher in teacherList"
            :key="teacher.id"
            class="teacher-card"
          >
            <div class="card-header">
              <div class="teacher-info">
                <h4 class="teacher-name">{{ teacher.name }}</h4>
                <p class="teacher-phone">{{ teacher.phone }}</p>
              </div>
              <div class="teacher-tags">
                <el-tag :type="getStatusTagType(teacher.status)" size="small">
                  {{ getStatusText(teacher.status) }}
                </el-tag>
                <el-tag :type="getTypeTagType(teacher.type)" size="small" style="margin-left: var(--spacing-sm);">
                  {{ getTypeText(teacher.type) }}
                </el-tag>
              </div>
            </div>

            <div class="card-content">
              <div class="info-row">
                <span class="label">职称:</span>
                <span class="value">
                  <span v-if="teacher.position">
                    {{ getPositionText(teacher.position) }}
                  </span>
                  <span v-else class="text-muted">未知</span>
                </span>
              </div>
              <div class="info-row">
                <span class="label">入职时间:</span>
                <span class="value">{{ teacher.hireDate }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button size="small" @click="handleViewTeacher(teacher)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="primary" @click="handleEditTeacher(teacher)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteTeacher(teacher)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 移动端无数据状态 -->
        <div class="mobile-empty" v-if="teacherList.length === 0">
          <el-empty description="暂无数据" />
        </div>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { getTeacherList, deleteTeacher, TeacherStatus, TeacherType } from '@/api/modules/teacher'
import type { Teacher, TeacherQueryParams } from '@/api/modules/teacher'

type TeacherStatusType = typeof TeacherStatus[keyof typeof TeacherStatus]
type TeacherTypeType = typeof TeacherType[keyof typeof TeacherType]

export default defineComponent({
  name: 'TeacherList',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const teacherList = ref<Teacher[]>([])
    
    // 分页数据
    const pagination = reactive({
      page: 1,
      pageSize: 10,
  total: 0
    })
    
    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      status: '' as '' | TeacherStatusType,
      type: '' as '' | TeacherTypeType
    })
    
    // 响应式计算属性
    const isDesktop = computed(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 768
      }
      return true
    })

    const operationColumnWidth = computed(() => {
      return isDesktop.value ? 250 : 200
    })
    
    // 状态选项
    const statusOptions = {
      [TeacherStatus.ACTIVE]: '在职',
      [TeacherStatus.LEAVE]: '请假',
      [TeacherStatus.RESIGNED]: '离职',
      [TeacherStatus.SUSPENDED]: '停职'
    }
    
    // 类型选项
    const typeOptions = {
      [TeacherType.FULL_TIME]: '全职',
      [TeacherType.PART_TIME]: '兼职',
      [TeacherType.CONTRACT]: '合同工',
      [TeacherType.INTERN]: '实习生'
    }
    
    // 获取状态文本
    const getStatusText = (status: TeacherStatusType) => {
      return statusOptions[status] || '未知'
    }
    
    // 获取类型文本
    const getTypeText = (type: TeacherTypeType) => {
      return typeOptions[type] || '未知'
    }

    // 获取职称文本
    const getPositionText = (position: number) => {
      const positionMap: Record<number, string> = {
        1: '园长',
        2: '副园长',
        3: '主任',
        4: '教师',
        5: '助教',
        6: '保育员',
        7: '后勤'
      }
      return positionMap[position] || '未知'
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status: TeacherStatusType): 'success' | 'warning' | 'info' | 'danger' | undefined => {
      const map: Record<TeacherStatusType, 'success' | 'warning' | 'info' | 'danger'> = {
        [TeacherStatus.ACTIVE]: 'success',
        [TeacherStatus.LEAVE]: 'warning',
        [TeacherStatus.RESIGNED]: 'info',
        [TeacherStatus.SUSPENDED]: 'danger'
      }
      return status ? map[status] : undefined
    }
    
    // 获取类型标签类型
    const getTypeTagType = (type: TeacherTypeType): 'primary' | 'success' | 'warning' | 'info' | undefined => {
      const map: Record<TeacherTypeType, 'primary' | 'success' | 'warning' | 'info'> = {
        [TeacherType.FULL_TIME]: 'primary',
        [TeacherType.PART_TIME]: 'success',
        [TeacherType.CONTRACT]: 'warning',
        [TeacherType.INTERN]: 'info'
      }
      return type ? map[type] : undefined
    }
    
    // 获取教师列表
    const fetchTeacherList = async () => {
      loading.value = true
      try {
        // 构造查询参数
        const params: TeacherQueryParams = {
          page: pagination.page,
          pageSize: pagination.pageSize
        }
        
        if (searchForm.keyword) {
          params.keyword = searchForm.keyword
        }
        
        if (searchForm.status) {
          params.status = searchForm.status as TeacherStatusType
        }
        
        if (searchForm.type) {
          params.type = searchForm.type as TeacherTypeType
        }
        
        const res = await getTeacherList(params)
        
        if (res.success || res.items) {
          teacherList.value = res.items || []
          pagination.total = res.total || 0
        } else {
          ElMessage.error(res.message || '获取教师列表失败')
        }
      } catch (error) {
        console.error('获取教师列表失败:', error)
        ElMessage.error('获取教师列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchTeacherList()
    }
    
    // 重置搜索
    const handleReset = () => {
      searchForm.keyword = ''
      searchForm.status = ''
      searchForm.type = ''
      pagination.page = 1
      fetchTeacherList()
    }
    
    // 处理页码变化
    const handleCurrentChange = (page: number) => {
      pagination.page = page
      fetchTeacherList()
    }
    
    // 处理每页条数变化
    const handleSizeChange = (size: number) => {
      pagination.pageSize = size
      pagination.page = 1
      fetchTeacherList()
    }
    
    // 添加教师
    const handleAddTeacher = () => {
      router.push('/teacher/add')
    }
    
    // 查看教师详情
    const handleViewTeacher = (teacher: Teacher) => {
      if (!teacher.id || teacher.id === 'undefined') {
        ElMessage.error('教师ID无效，无法查看详情')
        console.error('教师ID无效:', teacher)
        return
      }
      router.push(`/teacher/detail/${teacher.id}`)
    }
    
    // 编辑教师
    const handleEditTeacher = (teacher: Teacher) => {
      if (!teacher.id || teacher.id === 'undefined') {
        ElMessage.error('教师ID无效，无法编辑')
        console.error('教师ID无效:', teacher)
        return
      }
      router.push(`/teacher/edit/${teacher.id}`)
    }
    
    // 删除教师
    const handleDeleteTeacher = (teacher: Teacher) => {
      ElMessageBox.confirm(
        `确定要删除教师 ${teacher.name} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            const res = await deleteTeacher(teacher.id.toString())
            
            if (res.success) {
              ElMessage.success('删除成功')
              fetchTeacherList()
            } else {
              ElMessage.error(res.message || '删除失败')
            }
          } catch (error) {
            console.error('删除教师失败:', error)
            ElMessage.error('删除教师失败')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    }
    
    onMounted(() => {
      fetchTeacherList()
    })
    
    return {
      loading,
      teacherList,
      pagination,
      searchForm,
      statusOptions,
      typeOptions,
      isDesktop,
      operationColumnWidth,
      getStatusText,
      getTypeText,
      getPositionText,
      getStatusTagType,
      getTypeTagType,
      handleSearch,
      handleReset,
      handleCurrentChange,
      handleSizeChange,
      handleAddTeacher,
      handleViewTeacher,
      handleEditTeacher,
      handleDeleteTeacher
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 搜索区域优化 */
.search-section {
  margin-bottom: var(--spacing-lg);
}

.search-form {
  .search-input,
  .search-select {
    width: 100%;
  }
  
  .search-actions {
    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
      width: 100%;
      
      .search-btn,
      .reset-btn {
        flex: 1;
        
        .btn-text {
          margin-left: var(--spacing-xs);
        }
      }
    }
  }
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* 表格优化 */
:deep(.el-table) {
  .el-table__header {
    background-color: var(--bg-primary);
    
    th {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-weight: 600;
    }
  }
  
  .el-table__row {
    &:hover {
      background-color: var(--bg-hover);
    }
  }
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

/* ==================== 响应式表格设计 ==================== */
.responsive-table-container {
  width: 100%;
  overflow: hidden;

  /* 桌面端显示表格 */
  .desktop-table {
    display: table;

    @media (max-width: var(--breakpoint-md)) {
      display: none;
    }
  }

  /* 移动端显示卡片 */
  .mobile-cards {
    display: none;

    @media (max-width: var(--breakpoint-md)) {
      display: block;
      gap: var(--spacing-md);
    }
  }

  .mobile-empty {
    display: none;

    @media (max-width: var(--breakpoint-md)) {
      display: block;
      padding: var(--spacing-xl);
      text-align: center;
    }
  }
}

/* ==================== 移动端卡片样式 ==================== */
.teacher-card {
  background: var(--bg-card);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);

    .teacher-info {
      flex: 1;

      .teacher-name {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }

      .teacher-phone {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }

    .teacher-tags {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-end;
    }
  }

  .card-content {
    margin-bottom: var(--spacing-md);

    .info-row {
      display: flex;
      margin-bottom: var(--spacing-sm);

      .label {
        min-width: 80px;
        font-weight: var(--font-medium);
        color: var(--text-secondary);
        font-size: var(--text-sm);
      }

      .value {
        flex: 1;
        color: var(--text-primary);
        font-size: var(--text-sm);
      }
    }
  }

  .card-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;

    .el-button {
      flex: 1;
      min-width: 60px;
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .app-card {
    .app-card-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;

      .card-actions {
        width: 100%;
        justify-content: flex-start;

        .el-button {
          flex: 1;
        }
      }
    }
  }
  
  .search-section {
    .search-form {
      .search-actions {
        .action-buttons {
          flex-direction: column;
          gap: var(--spacing-sm);
          
          .search-btn,
          .reset-btn {
            width: 100%;
          }
        }
      }
    }
  }
  
  :deep(.el-table) {
    .el-table__body-wrapper {
      overflow-x: auto;
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .app-card {
    .app-card-header {
      .card-actions {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
  .app-card {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }
  
  :deep(.el-table) {
    .el-table__header th {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
  }
}
</style> 