<template>
  <UnifiedCenterLayout
    title="园所管理"
    description="管理集团下的所有分园，包括直营、加盟和合营园所"
    :full-width="true"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreate">
        <UnifiedIcon name="Plus" />
        添加园所
      </el-button>
    </template>

    <div class="overview-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="园所名称/编码"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="园所类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable>
              <el-option label="直营" :value="1" />
              <el-option label="加盟" :value="2" />
              <el-option label="合营" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="正常" :value="1" />
              <el-option label="停业" :value="0" />
              <el-option label="筹建中" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 园所列表 -->
      <div class="group-list-section">
        <div class="section-header">
          <h3>园所列表</h3>
        </div>
        <div class="group-table-container">
          <el-table
            v-loading="loading"
            :data="groupList"
            stripe
            :show-overflow-tooltip="true"
          >
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="园所名称" width="120" show-overflow-tooltip />
            <el-table-column prop="code" label="园所编码" width="100" />
            <el-table-column label="类型" width="70">
              <template #default="{ row }">
                <span class="status-tag status-tag--type" :class="`status-tag--type-${row.type}`">
                  {{ getTypeName(row.type) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="学生数" width="70" align="center">
              <template #default="{ row }">
                <span class="stat-number">{{ row.totalStudents }}</span>
              </template>
            </el-table-column>
            <el-table-column label="教师数" width="70" align="center">
              <template #default="{ row }">
                <span class="stat-number">{{ row.totalTeachers }}</span>
              </template>
            </el-table-column>
            <el-table-column label="班级数" width="70" align="center">
              <template #default="{ row }">
                <span class="stat-number">{{ row.classCount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70">
              <template #default="{ row }">
                <span class="status-tag status-tag--status" :class="`status-tag--status-${row.status}`">
                  {{ getStatusName(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="150">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button link type="primary" @click="handleView(row)">查看</el-button>
                  <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                  <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import { useGroupStore } from '@/stores/group';
import kindergartenApi, { type Kindergarten } from '@/api/modules/kindergarten';

const router = useRouter();
const groupStore = useGroupStore();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined,
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 数据
const groupList = ref<Kindergarten[]>([]);
const loading = ref(false);

// 获取园所列表
async function fetchGroupList() {
  try {
    loading.value = true;
    const result = await kindergartenApi.getKindergartenList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type,
      status: searchForm.status,
      groupId: 1, // 获取集团ID为1的园所
    });

    groupList.value = result.data.items;
    pagination.total = result.data.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取园所列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1;
  fetchGroupList();
}

// 重置
function handleReset() {
  searchForm.keyword = '';
  searchForm.type = undefined;
  searchForm.status = undefined;
  handleSearch();
}

// 创建园所
function handleCreate() {
  router.push('/group/create');
}

// 查看详情
function handleView(row: Kindergarten) {
  router.push(`/kindergarten/detail/${row.id}`);
}

// 编辑
function handleEdit(row: Kindergarten) {
  router.push(`/kindergarten/edit/${row.id}`);
}

// 删除
async function handleDelete(row: Kindergarten) {
  try {
    await ElMessageBox.confirm(
      `确定要删除园所"${row.name}"吗？删除后可以恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await kindergartenApi.deleteKindergarten(row.id);
    ElMessage.success('删除成功');
    fetchGroupList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
}

// 获取类型名称
function getTypeName(type: number) {
  const typeMap: Record<number, string> = {
    1: '直营',
    2: '加盟',
    3: '合营',
  };
  return typeMap[type] || '未知';
}

// 获取类型标签类型
function getTypeTagType(type: number) {
  const typeMap: Record<number, any> = {
    1: 'success',
    2: 'primary',
    3: 'warning',
  };
  return typeMap[type] || '';
}

// 获取状态名称
function getStatusName(status: number) {
  const statusMap: Record<number, string> = {
    0: '停业',
    1: '正常',
    2: '筹建中',
  };
  return statusMap[status] || '未知';
}

// 获取状态标签类型
function getStatusTagType(status: number) {
  const statusMap: Record<number, any> = {
    0: 'danger',
    1: 'success',
    2: 'warning',
  };
  return statusMap[status] || '';
}

// 格式化日期
function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN');
}

onMounted(() => {
  fetchGroupList();
});
</script>

<style scoped lang="scss">
// 导入全局样式变量
@use '@/styles/design-tokens.scss' as *;

// ==================== 全宽布局覆盖 ====================
.unified-center-layout .main-content.full-width .content-section.full-width,
:deep(.unified-center-layout .main-content.full-width .content-section.full-width) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  padding: var(--spacing-lg) !important;
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
}

// ==================== 主内容容器 ====================
.overview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 0;
  overflow: hidden;
  width: 100%;
  max-width: none;

  // ==================== 搜索区域 ====================
  .search-section {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--border-color);
    flex-shrink: 0;

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      align-items: flex-end;
      margin: 0;

      .el-form-item {
        margin: 0;
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);

        .el-form-item__label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-regular);
          line-height: var(--leading-normal);
          padding: 0;
        }

        .el-input,
        .el-select {
          width: 180px;

          .el-input__wrapper,
          .el-select__wrapper {
            border-radius: var(--radius-md);
            border-color: var(--border-color);
            transition: all var(--transition-fast) ease;

            &:hover {
              border-color: var(--border-focus);
            }

            &.is-focused {
              border-color: var(--primary-color);
            }
          }
        }

        .el-button {
          height: 32px;
          padding: 0 var(--spacing-md);
          font-size: var(--text-sm);
          font-weight: 500;
          border-radius: var(--radius-md);

          &.el-button--primary {
            background: var(--primary-color);
            border-color: var(--primary-color);
          }
        }
      }
    }
  }

  // ==================== 园所列表区域 ====================
  .group-list-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        &::before {
          content: '';
          display: block;
          width: 4px;
          height: 20px;
          background: var(--primary-color);
          border-radius: var(--radius-xs);
        }
      }
    }

    .group-table-container {
      flex: 1;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;

      // ==================== 表格样式 ====================
      :deep(.el-table) {
        flex: 1;
        overflow: auto;

        // 表头样式
        .el-table__header-wrapper {
          th.el-table__cell {
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-weight: 600;
            font-size: var(--text-sm);
            padding: var(--spacing-md) var(--spacing-sm);
            border-bottom: 2px solid var(--border-color);
          }
        }

        // 表体样式
        .el-table__body-wrapper {
          .el-table__body {
            tr {
              transition: background-color var(--transition-fast) ease;

              &:hover {
                background: var(--bg-hover) !important;
              }

              td.el-table__cell {
                padding: var(--spacing-md) var(--spacing-sm);
                border-bottom: 1px solid var(--border-color-light);
                color: var(--text-regular);
                font-size: var(--text-sm);
              }
            }

            // 斑马纹
            tr:not(:hover):nth-child(even) {
              background: var(--bg-page);
            }
          }
        }

        // 移除边框
        &.el-table--border {
          &::after,
          .el-table__inner-wrapper::before {
            display: none;
          }
        }
      }

      // ==================== 状态标签样式 ====================
      .status-tag {
        display: inline-flex;
        align-items: center;
        padding: 4px var(--spacing-sm);
        font-size: var(--text-xs);
        font-weight: 500;
        border-radius: var(--radius-sm);
        line-height: 1.5;
        transition: all var(--transition-fast) ease;

        // 类型标签 - 直营/加盟/合营
        &.status-tag--type {
          &.status-tag--type-1 {
            background: #d1fae5;
            color: #059669;
            border: 1px solid #a7f3d0;
          }

          &.status-tag--type-2 {
            background: #dbeafe;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          &.status-tag--type-3 {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
          }
        }

        // 状态标签 - 正常/停业/筹建中
        &.status-tag--status {
          &.status-tag--status-1 {
            background: #d1fae5;
            color: #059669;
            border: 1px solid #a7f3d0;
          }

          &.status-tag--status-0 {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          &.status-tag--status-2 {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
          }
        }

        &:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-xs);
        }
      }

      // ==================== 统计数字样式 ====================
      .stat-number {
        font-weight: 600;
        font-size: var(--text-sm);
        color: var(--primary-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 2px var(--spacing-xs);
        background: var(--primary-light-bg);
        border-radius: var(--radius-sm);
      }

      // ==================== 操作按钮样式 ====================
      .action-buttons {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        .el-button.el-button--text {
          padding: 4px var(--spacing-sm);
          font-size: var(--text-sm);
          font-weight: 500;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast) ease;

          &:hover {
            background: var(--bg-hover);
          }

          &.el-button--primary {
            color: var(--primary-color);

            &:hover {
              background: var(--primary-light-bg);
              color: var(--primary-hover);
            }
          }

          &.el-button--danger {
            color: var(--danger-color);

            &:hover {
              background: var(--danger-light-bg);
              color: var(--danger-hover);
            }
          }
        }
      }

      // ==================== 分页样式 ====================
      .pagination {
        padding: var(--spacing-md) var(--spacing-lg);
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-shrink: 0;

        :deep(.el-pagination) {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .el-pagination__total,
          .el-pagination__sizes {
            font-size: var(--text-sm);
            color: var(--text-regular);
          }

          .el-pager li,
          .btn-prev,
          .btn-next {
            min-width: 32px;
            height: 32px;
            line-height: 30px;
            border-radius: var(--radius-sm);
            font-size: var(--text-sm);
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-regular);
            margin: 0 2px;
            transition: all var(--transition-fast) ease;

            &:hover {
              background: var(--bg-hover);
              border-color: var(--primary-color);
              color: var(--primary-color);
            }

            &.is-active {
              background: var(--primary-color);
              border-color: var(--primary-color);
              color: var(--text-on-primary);
            }
          }

          .el-pagination__jump,
          .el-select {
            font-size: var(--text-sm);
            color: var(--text-regular);
          }
        }
      }
    }
  }
}

// ==================== 响应式布局 ====================
@media (max-width: var(--breakpoint-lg)) {
  .overview-content {
    gap: var(--spacing-md);

    .search-section {
      padding: var(--spacing-md);

      .search-form {
        .el-form-item {
          flex: 1 1 calc(50% - var(--spacing-md));

          .el-input,
          .el-select {
            width: 100%;
          }
        }
      }
    }

    .group-list-section {
      .group-table-container {
        :deep(.el-table) {
          .el-table__header-wrapper th,
          .el-table__body-wrapper td {
            padding: var(--spacing-sm) var(--spacing-xs);
            font-size: var(--text-xs);
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .overview-content {
    gap: var(--spacing-sm);

    .search-section {
      padding: var(--spacing-md);

      .search-form {
        flex-direction: column;
        gap: var(--spacing-sm);

        .el-form-item {
          width: 100%;
          flex: none;

          .el-input,
          .el-select {
            width: 100%;
          }

          &:has(.el-button) {
            flex-direction: row;
            gap: var(--spacing-sm);

            .el-button {
              flex: 1;
            }
          }
        }
      }
    }

    .group-list-section {
      .section-header {
        h3 {
          font-size: var(--text-lg);
        }
      }

      .group-table-container {
        .pagination {
          padding: var(--spacing-sm);
          flex-direction: column;
          gap: var(--spacing-sm);

          :deep(.el-pagination) {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>

