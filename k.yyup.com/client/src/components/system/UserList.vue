<template>
  <div class="user-list-container">
    <!-- 搜索栏 -->
    <div class="app-card">
      <div class="search-container">
        <el-form :model="searchForm" label-width="80px" inline>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.roleId" placeholder="请选择角色" clearable>
              <el-option 
                v-for="role in roleOptions" 
                :key="role.id" 
                :label="role.name" 
                :value="role.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <UnifiedIcon name="Refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">用户列表</div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAdd">
            <UnifiedIcon name="Plus" />
            新增用户
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="userList"
        class="full-width"
        border
        stripe
      >
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="mobile" label="手机号" min-width="120" />
        <el-table-column label="角色" min-width="150">
          <template #default="scope">
            <template v-if="Array.isArray(scope.row.roles) && scope.row.roles.length > 0">
              <el-tag 
                v-for="role in scope.row.roles" 
                :key="role.id" 
                class="role-tag"
              >
                {{ role.name }}
              </el-tag>
            </template>
            <span v-else class="text-gray-400">暂无角色</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最近登录时间" min-width="160" />
        <el-table-column prop="status" label="状态" min-width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'active'"
              type="warning"
              size="small"
              text
              @click="handleStatusChange(scope.row, 'inactive')"
            >
              <UnifiedIcon name="Lock" />
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              text
              @click="handleStatusChange(scope.row, 'active')"
            >
              <UnifiedIcon name="Unlock" />
              启用
            </el-button>
            <el-button
              type="primary"
              size="small"
              text
              @click="handleEdit(scope.row)"
            >
              <UnifiedIcon name="Edit" />
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              text
              @click="handleRoles(scope.row)"
            >
              <UnifiedIcon name="User" />
              角色
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDelete(scope.row)"
            >
              <UnifiedIcon name="Delete" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="PaginationConfigManager.getScenarioConfig('table').pageSizes"
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
import type { User, Role } from '@/types/system';
import { getUsers, getRoles, updateUserStatus, deleteUser, UserStatus } from '@/api/modules/system';
import PaginationConfigManager from '@/config/pagination-config';

interface SearchForm {
  username: string;
  realName: string;
  roleId: string | '';
  status: string | '';
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export default defineComponent({
  name: 'UserList',
  
  emits: ['add', 'edit', 'roles', 'delete'],
  
  setup(props, { emit }) {
    // 用户列表数据
    const userList = ref<User[]>([]);
    const loading = ref(false);
    
    // 角色选项
    const roleOptions = ref<Role[]>([]);
    
    // 搜索表单
    const searchForm = reactive<SearchForm>({
      username: '',
      realName: '',
      roleId: '',
      status: ''
    });
    
    // 分页信息
    const pagination = reactive<Pagination>({
      currentPage: 1,
      pageSize: PaginationConfigManager.getScenarioConfig('table').defaultPageSize,
      total: 0
    });
    
    // 初始化加载数据
    onMounted(() => {
      loadRoleOptions();
      loadUserList();
    });
    
    // 监听搜索条件变化
    watch([() => pagination.currentPage, () => pagination.pageSize], () => {
      loadUserList();
    });
    
    // 加载角色选项
    const loadRoleOptions = async (): Promise<void> => {
      try {
        const res = await getRoles();
        
        if (res.success) {
          // 确保roleOptions是数组格式
          const data = res.data || [];
          roleOptions.value = Array.isArray(data) ? data : [];
        } else {
          ElMessage.error(res.message || '获取角色选项失败');
        }
      } catch (error) {
        console.error('加载角色选项失败:', error);
        ElMessage.error('加载角色选项失败');
      }
    };
    
    // 加载用户列表
    const loadUserList = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          username: searchForm.username || undefined,
          realName: searchForm.realName || undefined,
          roleId: searchForm.roleId || undefined,
          status: searchForm.status || undefined
        };
        
        const res = await getUsers(params);
        
        if (res.success) {
          // 使用统一的数据转换，确保字段名一致
          userList.value = res.items || [];
          pagination.total = res.total || 0;
        } else {
          ElMessage.error(res.message || '获取用户列表失败');
        }
      } catch (error) {
        console.error('加载用户列表失败:', error);
        ElMessage.error('加载用户列表失败');
        // 确保在错误情况下也设置为空数组
        userList.value = [];
        pagination.total = 0;
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索
    const handleSearch = (): void => {
      pagination.currentPage = 1;
      loadUserList();
    };
    
    // 重置搜索
    const resetSearch = (): void => {
      searchForm.username = '';
      searchForm.realName = '';
      searchForm.roleId = '';
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
    
    // 新增用户
    const handleAdd = (): void => {
      emit('add');
    };
    
    // 编辑用户
    const handleEdit = (user: User): void => {
      emit('edit', user);
    };
    
    // 管理用户角色
    const handleRoles = (user: User): void => {
      emit('roles', user);
    };
    
    // 改变用户状态
    const handleStatusChange = async (user: User, status: 'active' | 'inactive'): Promise<void> => {
      try {
        // 将状态映射为API需要的枚举值
        const apiStatus = status === 'active' ? UserStatus.ACTIVE : UserStatus.INACTIVE;
        
        const res = await updateUserStatus(user.id, apiStatus);
        
        if (res.success) {
          ElMessage.success(`用户${status === 'active' ? '启用' : '禁用'}成功`);
          loadUserList();
        } else {
          ElMessage.error(res.message || `用户${status === 'active' ? '启用' : '禁用'}失败`);
        }
      } catch (error) {
        console.error('更新用户状态失败:', error);
        ElMessage.error('更新用户状态失败');
      }
    };
    
    // 删除用户
    const handleDelete = (user: User): void => {
      ElMessageBox.confirm(`确定要删除用户"${user.username}"吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteUser(user.id);
          
          if (res.success) {
            ElMessage.success('用户删除成功');
            loadUserList();
          } else {
            ElMessage.error(res.message || '删除用户失败');
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          ElMessage.error('删除用户失败');
        }
      }).catch(() => {
        // 用户取消删除，不做处理
      });
    };

    return {
      userList,
      loading,
      roleOptions,
      searchForm,
      pagination,
      handleSearch,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleRoles,
      handleStatusChange,
      handleDelete,
      loadUserList
    };
  }
});
</script>

<style lang="scss" scoped>
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";
@use '@/styles/index.scss' as *;

.user-list-container {
  .app-card {
    background-color: var(--bg-primary);
    border-radius: var(--spacing-xs);
    box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
    margin-bottom: var(--spacing-xl);
    padding: var(--app-gap);
    
    .app-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      
      .app-card-title {
        font-size: var(--text-lg);
        color: var(--text-primary);
        font-weight: bold;
      }
    }
  }
  
  .search-container {
    margin-bottom: var(--spacing-2xl);
  }
  
  .pagination-container {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: flex-end;
  }
  
  .role-tag {
    margin-right: var(--spacing-base);
    margin-bottom: var(--spacing-base);
  }
}
.full-width {
  width: 100%;
}
</style> 