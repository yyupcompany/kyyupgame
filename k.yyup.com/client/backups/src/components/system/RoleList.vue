<template>
  <div class="role-list-container">
    <!-- 搜索栏 -->
    <div class="app-card">
      <div class="search-container">
        <el-form :model="searchForm" label-width="80px" inline>
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 角色列表 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">角色列表</div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="roleList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="description" label="角色描述" min-width="200" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'active'"
              type="warning"
              size="small"
              text
              @click="handleStatusChange(scope.row, 'inactive')"
            >禁用</el-button>
            <el-button
              v-else
              type="success"
              size="small"
              text
              @click="handleStatusChange(scope.row, 'active')"
            >启用</el-button>
            <el-button
              type="primary"
              size="small"
              text
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              type="info"
              size="small"
              text
              @click="handlePermission(scope.row)"
            >权限</el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
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
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Role, PaginatedResult } from '../../types/system';
import { SYSTEM_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

interface SearchForm {
  name: string;
  status: string | '';
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export default defineComponent({
  name: 'RoleList',
  
  emits: ['add', 'edit', 'permission', 'delete'],
  
  setup(props, { emit }) {
    // 角色列表数据
    const roleList = ref<Role[]>([]);
    const loading = ref(false);
    
    // 搜索表单
    const searchForm = reactive<SearchForm>({
      name: '',
      status: ''
    });
    
    // 分页信息
    const pagination = reactive<Pagination>({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });
    
    // 初始化加载数据
    onMounted(() => {
      loadRoleList();
    });
    
    // 监听搜索条件变化
    watch([() => pagination.currentPage, () => pagination.pageSize], () => {
      loadRoleList();
    });
    
    // 加载角色列表
    const loadRoleList = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          name: searchForm.name || undefined,
          status: searchForm.status || undefined
        };
        
        const res: ApiResponse = await request.get(SYSTEM_ENDPOINTS.ROLES, { params });
        
        if (res.code === 200 || res.success) {
          // 检查响应数据格式
          if (Array.isArray(res.data)) {
            roleList.value = res.data;
            pagination.total = res.data.length || 0;
          } else if (res.data && typeof res.data === 'object' && 'items' in res.data) {
            roleList.value = (res.data as PaginatedResult<Role>).items || [];
            pagination.total = (res.data as PaginatedResult<Role>).total || 0;
          } else {
            roleList.value = [];
            pagination.total = 0;
            console.error('角色列表数据格式不正确:', res.data);
          }
        } else {
          ElMessage.error(res.message || '获取角色列表失败');
        }
      } catch (error) {
        console.error('加载角色列表失败:', error);
        ElMessage.error('加载角色列表失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const handleSearch = (): void => {
      pagination.currentPage = 1;
      loadRoleList();
    };
    
    // 重置搜索
    const resetSearch = (): void => {
      searchForm.name = '';
      searchForm.status = '';
      handleSearch();
    };
    
    // 分页大小变化
    const handleSizeChange = (size: number): void => {
      pagination.pageSize = size;
      pagination.currentPage = 1;
    };
    
    // 当前页变化
    const handleCurrentChange = (page: number): void => {
      pagination.currentPage = page;
    };
    
    // 新增角色
    const handleAdd = (): void => {
      emit('add');
    };
    
    // 编辑角色
    const handleEdit = (role: Role): void => {
      emit('edit', role);
    };
    
    // 管理角色权限
    const handlePermission = (role: Role): void => {
      emit('permission', role);
    };
    
    // 改变角色状态
    const handleStatusChange = async (role: Role, status: 'active' | 'inactive'): Promise<void> => {
      try {
        const res: ApiResponse = await request.put(SYSTEM_ENDPOINTS.ROLE_STATUS(role.id), { status });
        
        if (res.code === 200) {
          ElMessage.success(`角色${status === 'active' ? '启用' : '禁用'}成功`);
          loadRoleList();
        } else {
          ElMessage.error(res.message || `角色${status === 'active' ? '启用' : '禁用'}失败`);
        }
      } catch (error) {
        console.error('更新角色状态失败:', error);
        ElMessage.error('更新角色状态失败');
      }
    };
    
    // 删除角色
    const handleDelete = (role: Role): void => {
      ElMessageBox.confirm(`确定要删除角色"${role.name}"吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res: ApiResponse = await request.delete(SYSTEM_ENDPOINTS.ROLE_DELETE(role.id));
          
          if (res.code === 200) {
            ElMessage.success('角色删除成功');
            loadRoleList();
          } else {
            ElMessage.error(res.message || '删除角色失败');
          }
        } catch (error) {
          console.error('删除角色失败:', error);
          ElMessage.error('删除角色失败');
        }
      }).catch(() => {
        // 用户取消删除，不做处理
      });
    };

    return {
      roleList,
      loading,
      searchForm,
      pagination,
      handleSearch,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handlePermission,
      handleStatusChange,
      handleDelete,
      loadRoleList
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.role-list-container {
  .app-card {
    background-color: var(--el-bg-color);
    border-radius: var(--spacing-xs);
    box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
    margin-bottom: var(--text-2xl);
    padding: var(--spacing-lg);
    
    .app-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-2xl);
      
      .app-card-title {
        font-size: var(--text-lg);
        font-weight: bold;
      }
    }
  }
  
  .search-container {
    margin-bottom: var(--spacing-2xl);
  }
  
  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }
}
</style> 