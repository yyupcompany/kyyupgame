<template>
  <div class="page-container">
    <!-- 搜索区域 - 优化移动端布局 -->
    <div class="app-card search-section">
      <div class="app-card-content">
        <el-form :model="searchForm" label-width="120" class="search-form">
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
                    <UnifiedIcon name="Search" />
                    <span class="btn-text">搜索</span>
                  </el-button>
                  <el-button @click="handleReset" class="reset-btn">
                    <UnifiedIcon name="Refresh" />
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
          <el-button
            type="primary"
            @click="handleAddTeacher"
            class="add-teacher-btn"
            size="default"
          >
            <UnifiedIcon name="Plus" :size="16" />
            <span class="btn-text">添加教师</span>
          </el-button>
        </div>
      </div>
      
      <div class="app-card-content">
        <!-- 响应式表格容器 -->
        <div class="responsive-table-container">
          <div class="table-wrapper">
<el-table
  class="responsive-table desktop-table enhanced-table"
  :data="teacherList"
  border
  v-loading="loading"
  style="width: 100%"
  :row-class-name="tableRowClassName"
  :header-row-class-name="'table-header-row'"
>
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="姓名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="phone" label="联系电话" min-width="140" show-overflow-tooltip />
          <el-table-column label="职称" min-width="110" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="position-cell">
                <UnifiedIcon v-if="row.position" name="User" :size="16" class="position-icon" />
                <span v-if="row.position">
                  {{ getPositionText(row.position) }}
                </span>
                <span v-else class="text-muted">未知</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getStatusTagType(row.status)"
                size="default"
                class="status-tag"
                effect="light"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getTypeTagType(row.type)"
                size="default"
                class="type-tag"
                effect="light"
              >
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hireDate" label="入职时间" width="130" align="center" />
          <el-table-column label="操作" :width="operationColumnWidth" align="center" :fixed="isDesktop ? 'right' : false" class-name="action-column">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  size="small"
                  type="info"
                  plain
                  @click="handleViewTeacher(row)"
                  class="action-btn view-btn"
                >
                  <UnifiedIcon name="eye" :size="14" />
                  <span class="btn-text">查看</span>
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click="handleEditTeacher(row)"
                  class="action-btn edit-btn"
                >
                  <UnifiedIcon name="Edit" :size="14" />
                  <span class="btn-text">编辑</span>
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  @click="handleDeleteTeacher(row)"
                  class="action-btn delete-btn"
                >
                  <UnifiedIcon name="Delete" :size="14" />
                  <span class="btn-text">删除</span>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
</div>

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
                <UnifiedIcon name="eye" />
                查看
              </el-button>
              <el-button size="small" type="primary" @click="handleEditTeacher(teacher)">
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteTeacher(teacher)">
                <UnifiedIcon name="Delete" />
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
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { getTeacherList, deleteTeacher, TeacherStatus, TeacherType } from '@/api/modules/teacher'
import type { Teacher, TeacherQueryParams } from '@/api/modules/teacher'

type TeacherStatusType = typeof TeacherStatus[keyof typeof TeacherStatus]
type TeacherTypeType = typeof TeacherType[keyof typeof TeacherType]

export default defineComponent({
  name: 'TeacherList',
  components: {
    UnifiedIcon
  },
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
      return isDesktop.value ? 280 : 220
    })

    // 表格行样式类名
    const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
      return rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd'
    }
    
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
      tableRowClassName,
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
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

/* 🚀 搜索区域优化 */
.search-section {
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-page) 100%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--border-width-sm);
    background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color-light) 50%, var(--primary-color) 100%);
  }

  .app-card-content {
    padding: var(--spacing-lg);
  }
}

.search-form {
  .search-input,
  .search-select {
    width: 100%;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-normal);
      border: 1px solid var(--border-color-light);

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
      }

      &.is-focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
      }
    }
  }

  .search-actions {
    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
      width: 100%;

      .search-btn,
      .reset-btn {
        flex: 1;
        border-radius: var(--radius-md);
        font-weight: var(--font-medium);
        height: var(--button-height-md);
        position: relative;
        overflow: hidden;
        transition: all var(--transition-normal);

        .btn-text {
          margin-left: var(--spacing-xs);
        }

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        &:active::before {
          width: var(--size-6xl);
          height: var(--size-6xl);
        }
      }

      .search-btn {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
        border: none;
        color: white;

        &:hover {
          transform: translateY(calc(-1 * var(--spacing-xs)));
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
        }
      }

      .reset-btn {
        background: var(--bg-page);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);

        &:hover {
          background: var(--bg-hover);
          border-color: var(--primary-color);
          color: var(--primary-color);
          transform: translateY(calc(-1 * var(--spacing-xs)));
          box-shadow: 0 4px 12px var(--shadow-color);
        }
      }
    }
  }

  :deep(.el-form-item__label) {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    font-size: var(--text-sm);
  }
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .add-teacher-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
    border: none;
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    height: var(--button-height-md);
    position: relative;
    overflow: hidden;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);

    .btn-text {
      margin-left: var(--spacing-xs);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.8s;
    }

    &:hover {
      transform: translateY(calc(-1 * var(--spacing-xs)));
      box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
    }
  }
}

/* 🚀 增强表格优化 */
:deep(.enhanced-table) {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  // 表头样式
  .el-table__header-wrapper {
    .el-table__header {
      background: linear-gradient(135deg, var(--bg-page) 0%, var(--bg-card) 100%);

      th {
        background: transparent !important;
        color: var(--text-primary) !important;
        font-weight: var(--font-semibold);
        font-size: var(--text-sm);
        padding: var(--spacing-md) var(--spacing-lg);
        border-bottom: var(--border-width-md) solid var(--border-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: calc(-1 * var(--border-width-sm));
          left: 0;
          right: 0;
          height: var(--border-width-sm);
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
          transform: scaleX(0);
          transition: transform var(--transition-normal);
        }

        &:hover::after {
          transform: scaleX(1);
        }
      }
    }
  }

  // 表格行样式
  .el-table__body-wrapper {
    .el-table__body {

      .table-row-even {
        background-color: var(--bg-card);
        transition: all var(--transition-normal);

        &:hover {
          background-color: var(--bg-hover);
          transform: translateY(calc(-0.5 * var(--spacing-xs)));
          box-shadow: 0 2px 8px var(--shadow-color);
        }
      }

      .table-row-odd {
        background-color: var(--bg-page);
        transition: all var(--transition-normal);

        &:hover {
          background-color: var(--bg-hover);
          transform: translateY(calc(-0.5 * var(--spacing-xs)));
          box-shadow: 0 2px 8px var(--shadow-color);
        }
      }

      td {
        padding: var(--spacing-lg) var(--spacing-lg);
        border-bottom: 1px solid var(--border-color-light);
        transition: all var(--transition-normal);

        // 职称单元格样式
        .position-cell {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          .position-icon {
            color: var(--primary-color);
            flex-shrink: 0;
          }

          span {
            font-weight: var(--font-medium);
          }
        }

        // 状态标签样式
        .status-tag {
          font-weight: var(--font-medium);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 1px 3px var(--shadow-color);
          transition: all var(--transition-fast);

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 6px var(--shadow-color);
          }
        }

        // 类型标签样式
        .type-tag {
          font-weight: var(--font-medium);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          box-shadow: 0 1px 3px var(--shadow-color);
          transition: all var(--transition-fast);

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 6px var(--shadow-color);
          }
        }
      }

      // 操作列样式
      .action-column {
        .action-buttons {
          display: flex;
          gap: var(--spacing-xs);
          justify-content: center;
          align-items: center;

          .action-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--radius-md);
            font-size: var(--text-xs);
            font-weight: var(--font-medium);
            transition: all var(--transition-fast);
            min-width: auto;
            flex: 1;
            justify-content: center;

            .btn-text {
              margin-left: var(--spacing-xs);
            }

            &.view-btn {
              border-color: var(--info-color);
              color: var(--info-color);

              &:hover {
                background-color: var(--info-color);
                color: white;
                transform: translateY(calc(-0.5 * var(--spacing-xs)));
                box-shadow: 0 2px 8px rgba(var(--info-color-rgb), 0.3);
              }
            }

            &.edit-btn {
              border-color: var(--primary-color);
              color: var(--primary-color);

              &:hover {
                background-color: var(--primary-color);
                color: white;
                transform: translateY(calc(-0.5 * var(--spacing-xs)));
                box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
              }
            }

            &.delete-btn {
              border-color: var(--danger-color);
              color: var(--danger-color);

              &:hover {
                background-color: var(--danger-color);
                color: white;
                transform: translateY(calc(-0.5 * var(--spacing-xs)));
                box-shadow: 0 2px 8px rgba(var(--danger-color-rgb), 0.3);
              }
            }
          }
        }
      }
    }
  }

  // 加载状态优化
  &.el-loading-mask {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);

    .el-loading-spinner {
      .circular {
        stroke: var(--primary-color);
      }
    }
  }
}

/* 🚀 分页容器优化 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  border-top: 1px solid var(--border-color-light);

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: var(--radius-md);
      margin: 0 calc(var(--spacing-xs) * 0.5);
      transition: all var(--transition-fast);
      font-weight: var(--font-medium);

      &:hover {
        transform: translateY(calc(-0.5 * var(--spacing-xs)));
        box-shadow: 0 2px 8px var(--shadow-color);
      }

      &.is-active {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
        color: white;
        transform: translateY(calc(-0.5 * var(--spacing-xs)));
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
      }
    }

    .btn-prev,
    .btn-next {
      border-radius: var(--radius-md);
      margin: 0 calc(var(--spacing-xs) * 0.5);
      transition: all var(--transition-fast);

      &:hover {
        transform: translateY(calc(-0.5 * var(--spacing-xs)));
        box-shadow: 0 2px 8px var(--shadow-color);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .el-pagination__sizes,
    .el-pagination__jump {
      .el-select .el-input .el-input__wrapper,
      .el-input__wrapper {
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);

        &:hover {
          border-color: var(--primary-color);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
        }
      }
    }
  }
}

/* ==================== 响应式表格设计 ==================== */
.responsive-table-container {
  width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

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
        min-width: auto;
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
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: var(--border-width-base) solid var(--border-color-light);

    .el-button {
      flex: 1;
      min-width: auto;
      border-radius: var(--radius-md);
      font-weight: var(--font-medium);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }

      &:hover::before {
        left: 100%;
      }

      &:hover {
        transform: translateY(calc(-1 * var(--spacing-xs)));
        box-shadow: 0 4px 12px var(--shadow-color);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px var(--shadow-color);
      }
    }
  }
}

/* 🚀 响应式设计优化 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-sm);
  }

  .app-card {
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);

    .app-card-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;
      padding: var(--spacing-md);

      .app-card-title {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
      }

      .card-actions {
        width: 100%;
        justify-content: flex-start;

        .add-teacher-btn {
          width: 100%;
          height: var(--button-height-lg);
          font-size: var(--text-sm);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md) var(--spacing-lg);

          .btn-text {
            margin-left: var(--spacing-sm);
          }
        }
      }
    }
  }

  .search-section {
    margin-bottom: var(--spacing-md);
    border-radius: var(--radius-md);

    .app-card-content {
      padding: var(--spacing-md);
    }

    .search-form {
      .search-actions {
        .action-buttons {
          flex-direction: column;
          gap: var(--spacing-sm);

          .search-btn,
          .reset-btn {
            width: 100%;
            height: var(--button-height-lg);
            font-size: var(--text-sm);
            border-radius: var(--radius-lg);
          }
        }
      }
    }
  }

  // 移动端表格优化
  :deep(.enhanced-table) {
    .el-table__header-wrapper {
      .el-table__header {
        th {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--text-xs);
        }
      }
    }

    .el-table__body-wrapper {
      overflow-x: auto;

      .el-table__body {
        td {
          padding: var(--spacing-md) var(--spacing-sm);
          font-size: var(--text-sm);

          .action-buttons {
            .action-btn {
              padding: var(--spacing-xs) var(--spacing-xs);
              font-size: var(--text-xs);
              min-width: 32px;

              .btn-text {
                display: none; // 移动端只显示图标
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-container {
    padding: var(--spacing-xs);
  }

  .app-card {
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-sm);

    .app-card-header {
      padding: var(--spacing-sm);

      .app-card-title {
        font-size: var(--text-base);
      }

      .card-actions {
        .add-teacher-btn {
          height: var(--button-height-md);
          font-size: var(--text-xs);
        }
      }
    }
  }

  .search-section {
    .app-card-content {
      padding: var(--spacing-sm);
    }

    .search-form {
      :deep(.el-form-item) {
        margin-bottom: var(--spacing-sm);
      }

      .search-actions {
        .action-buttons {
          .search-btn,
          .reset-btn {
            height: var(--button-height-md);
            font-size: var(--text-xs);
          }
        }
      }
    }
  }

  // 超小屏幕优化
  :deep(.enhanced-table) {
    .el-table__body-wrapper {
      .el-table__body {
        td {
          padding: var(--spacing-sm) var(--spacing-xs);
          font-size: var(--text-xs);

          .status-tag,
          .type-tag {
            padding: 2px var(--spacing-xs);
            font-size: var(--text-xs) - 2px;
          }

          .action-buttons {
            gap: calc(var(--spacing-xs) * 0.5);

            .action-btn {
              padding: var(--spacing-xs) calc(var(--spacing-xs) + 2px);
              min-width: calc(var(--text-xs) * 2 + 4px);
              border-radius: var(--radius-sm);
            }
          }
        }
      }
    }
  }

  // 分页组件移动端优化
  .pagination-container {
    :deep(.el-pagination) {
      .el-pager li {
        min-width: calc(var(--text-xs) * 2 + 4px);
        height: calc(var(--text-xs) * 2 + 4px);
        line-height: calc(var(--text-xs) * 2 + 4px - 2px);
        font-size: var(--text-xs);
        margin: 0 1px;
      }

      .btn-prev,
      .btn-next {
        min-width: calc(var(--text-xs) * 2 + 4px);
        height: calc(var(--text-xs) * 2 + 4px);
        font-size: var(--text-xs);
      }
    }
  }
}

/* 横屏优化 */
@media (max-width: var(--breakpoint-md)) and (orientation: landscape) {
  .search-section {
    .app-card-content {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .search-form {
      .search-actions {
        .action-buttons {
          flex-direction: row;
          gap: var(--spacing-sm);

          .search-btn,
          .reset-btn {
            width: auto;
            flex: 1;
          }
        }
      }
    }
  }
}

/* 🚀 增强交互体验 */
.page-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(var(--spacing-lg));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-card {
  transition: all var(--transition-normal);
  animation: slideInLeft 0.8s ease-out;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &:nth-child(2) {
    animation-delay: 0.1s;
  }

  &:nth-child(3) {
    animation-delay: 0.2s;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(calc(-1 * var(--spacing-xl) - var(--spacing-sm)));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 搜索区域动画
.search-section {
  animation: slideInRight 0.7s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(calc(var(--spacing-xl) + var(--spacing-sm)));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 表格加载动画
:deep(.enhanced-table) {
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 表格行进入动画
:deep(.enhanced-table) {
  .el-table__body {
    .el-table__row {
      animation: tableRowSlideIn 0.5s ease-out;
      animation-fill-mode: both;

      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.05}s;
        }
      }
    }
  }
}

@keyframes tableRowSlideIn {
  from {
    opacity: 0;
    transform: translateX(calc(-1 * var(--spacing-md) - var(--spacing-xs)));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 按钮点击波纹效果增强
.ripple-effect {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: var(--glass-bg-medium);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
    z-index: 1;
  }

  &:active::after {
    width: 300px;
    height: 300px;
  }
}

// 加载状态优化
.loading-container {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(3px);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: var(--icon-md);
    height: var(--button-height-md);
    border: var(--border-width-md) solid var(--border-color);
    border-top: var(--border-width-md) solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 11;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

// 空状态动画
.empty-state {
  animation: bounceIn 1s ease-out;
  text-align: center;
  padding: var(--spacing-xl);

  .empty-icon {
    font-size: calc(var(--text-4xl) + var(--text-xl));
    color: var(--text-placeholder);
    margin-bottom: var(--spacing-md);
    animation: pulse 2s infinite;
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
}

// 搜索输入框聚焦效果
.search-input-enhanced {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: calc(-1 * var(--border-width-sm));
    left: calc(-1 * var(--border-width-sm));
    right: calc(-1 * var(--border-width-sm));
    bottom: calc(-1 * var(--border-width-sm));
    background: linear-gradient(45deg, var(--primary-color), var(--primary-color-light), var(--primary-color));
    border-radius: var(--radius-md);
    opacity: 0;
    z-index: -1;
    transition: opacity var(--transition-normal);
  }

  &:focus-within::before {
    opacity: 1;
    animation: borderGlow 2s linear infinite;
  }

  @keyframes borderGlow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}

// 表格滚动条美化
:deep(.enhanced-table) {
  .el-table__body-wrapper {
    &::-webkit-scrollbar {
      width: calc(var(--spacing-xs) * 2);
      height: calc(var(--spacing-xs) * 2);
    }

    &::-webkit-scrollbar-track {
      background: var(--bg-page);
      border-radius: calc(var(--radius-xs) + 1px);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: calc(var(--radius-xs) + 1px);
      transition: background var(--transition-fast);

      &:hover {
        background: var(--primary-color-dark);
      }
    }
  }
}

// 成功/错误提示动画
.notification-toast {
  animation: slideInDown 0.3s ease-out;

  &.success {
    border-left: calc(var(--border-width-md) + 1px) solid var(--success-color);
  }

  &.error {
    border-left: calc(var(--border-width-md) + 1px) solid var(--danger-color);
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
  .app-card {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }

  :deep(.enhanced-table) {
    .el-table__header {
      th {
        background-color: var(--bg-page);
        color: var(--text-primary);
      }
    }

    .el-table__body-wrapper {
      &::-webkit-scrollbar-track {
        background: var(--bg-page);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--primary-color);
      }
    }
  }

  .loading-container::before {
    background: rgba(0, 0, 0, 0.6);
  }
}

/* 🚨 修复：页面布局延伸问题 */
.page-container {
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.app-card {
  max-width: 100%;
  box-sizing: border-box;
}

/* 限制主要内容区域的宽度，防止过度延伸 */
:deep(.unified-center-layout) {
  .main-content {
    max-width: 100%; max-width: 1200px;
    margin: 0 auto;
    padding-left: clamp(16px, 2vw, 32px) !important;
    padding-right: clamp(16px, 2vw, 32px) !important;
    padding-top: clamp(16px, 2vw, 24px) !important;
    padding-bottom: clamp(16px, 2vw, 24px) !important;
  }
}

/* 针对教师列表的特殊优化 */
:deep(.teacher-page) {
  .content-section {
    max-width: 100%;
    overflow-x: hidden;
  }
}
</style> 