<template>
  <UnifiedCenterLayout
    title="园所管理"
    description="管理集团下的所有分园，包括直营、加盟和合营园所"
  >
    <template #header-actions>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        添加园所
      </el-button>
    </template>

    <div class="center-container group-list-timeline">

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
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

    <!-- 集团列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="groupList"
        stripe
        border
        class="full-width-table"
        :show-overflow-tooltip="true"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="园所名称" width="140" />
        <el-table-column prop="code" label="园所编码" width="110" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学生数" width="80" align="center">
          <template #default="{ row }">
            <span class="stat-number">{{ row.totalStudents }}</span>
          </template>
        </el-table-column>
        <el-table-column label="教师数" width="80" align="center">
          <template #default="{ row }">
            <span class="stat-number">{{ row.totalTeachers }}</span>
          </template>
        </el-table-column>
        <el-table-column label="班级数" width="80" align="center">
          <template #default="{ row }">
            <span class="stat-number">{{ row.classCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="140">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
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
  router.push('/kindergarten/create');
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
@import '@/styles/design-tokens.scss';

.group-list-timeline {
  background: var(--bg-secondary, var(--bg-container));  // ✅ 与考勤中心一致
  padding: var(--text-2xl);

  .search-bar {
    background: var(--bg-white);
    padding: var(--text-2xl);
    border-radius: var(--spacing-xs);
    margin-bottom: var(--text-2xl);
  }

  .stat-number {
    font-weight: 600;
    color: var(--primary-color);
  }

  .pagination {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }
}
</style>

