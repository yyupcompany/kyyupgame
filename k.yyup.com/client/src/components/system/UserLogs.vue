<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户操作日志"
    width="70%"
    @close="handleClose"
  >
    <div class="user-logs-container">
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="操作类型">
            <el-select v-model="filterForm.actionType" placeholder="请选择操作类型" clearable>
              <el-option label="登录" value="login" />
              <el-option label="登出" value="logout" />
              <el-option label="修改密码" value="changePassword" />
              <el-option label="修改信息" value="updateProfile" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input v-model="filterForm.ipAddress" placeholder="请输入IP地址" clearable />
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="filterForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="logList"
        border
        stripe
        class="full-width"
      >
        <el-table-column prop="actionTime" label="操作时间" width="180" sortable />
        <el-table-column prop="actionType" label="操作类型" width="120">
          <template #default="scope">
            <el-tag :type="getActionTypeTag(scope.row.actionType)">
              {{ getActionTypeLabel(scope.row.actionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actionDesc" label="操作描述" min-width="250" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="location" label="地理位置" width="180" />
        <el-table-column prop="device" label="设备信息" min-width="200" />
        <el-table-column prop="browser" label="浏览器" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
</div>
      
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
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { User, UserLog } from '@/types/system';

interface FilterForm {
  actionType: string | undefined;
  ipAddress: string;
  timeRange: [Date, Date] | undefined;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 定义查询参数接口
interface UserLogQueryParams {
  userId: string;
  page: number;
  pageSize: number;
  actionType?: string | undefined;
  ipAddress?: string;
  startTime?: string;
  endTime?: string;
}

// 定义操作类型标签映射
type ActionTagType = 'success' | 'warning' | 'info' | 'primary' | 'danger';

export default defineComponent({
  name: 'UserLogs',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object as () => User | null,
      default: null
    }
  },
  
  emits: ['update:visible'],
  
  setup(props, { emit }) {
    // 对话框可见性
    const dialogVisible = ref(props.visible);
    
    // 日志列表
    const logList = ref<UserLog[]>([]);
    
    // 加载状态
    const loading = ref(false);
    
    // 过滤表单
    const filterForm = reactive<FilterForm>({
      actionType: undefined,
      ipAddress: '',
      timeRange: undefined
    });
    
    // 分页信息
    const pagination = reactive<Pagination>({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });
    
    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一周',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        }
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          return [start, end];
        }
      },
      {
        text: '最近三个月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          return [start, end];
        }
      }
    ];
    
    // 监听visible属性变化
    watch(() => props.visible, (val) => {
      dialogVisible.value = val;
      if (val && props.user) {
        loadLogs();
      }
    });
    
    // 监听dialogVisible变化
    watch(dialogVisible, (val) => {
      emit('update:visible', val);
    });
    
    // 监听用户变化
    watch(() => props.user, (val) => {
      if (val && dialogVisible.value) {
        loadLogs();
      }
    });
    
    // 加载日志
    const loadLogs = async (): Promise<void> => {
      if (!props.user || !props.user.id) return;
      
      loading.value = true;
      try {
        // 构建查询参数
        const params: UserLogQueryParams = {
          userId: props.user.id,
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          actionType: filterForm.actionType,
          ipAddress: filterForm.ipAddress || undefined,
          startTime: filterForm.timeRange ? filterForm.timeRange[0].toISOString().split('T')[0] : undefined,
          endTime: filterForm.timeRange ? filterForm.timeRange[1].toISOString().split('T')[0] : undefined
        };
        
        // 这里应该调用实际的API
        // const { data, total } = await getUserLogs(params);
        // logList.value = data;
        // pagination.total = total;
        
        // 模拟数据
        setTimeout(() => {
          const mockLogs: UserLog[] = [
            {
              id: '1',
              userId: props.user?.id || '',
              actionTime: '2023-12-15 10:30:45',
              actionType: 'login',
              actionDesc: '用户登录系统',
              ipAddress: '192.168.1.1',
              location: '中国 广东 深圳',
              device: 'Windows 10',
              browser: 'Chrome 96',
              status: 'success'
            },
            {
              id: '2',
              userId: props.user?.id || '',
              actionTime: '2023-12-14 15:20:30',
              actionType: 'logout',
              actionDesc: '用户退出系统',
              ipAddress: '192.168.1.1',
              location: '中国 广东 深圳',
              device: 'Windows 10',
              browser: 'Chrome 96',
              status: 'success'
            },
            {
              id: '3',
              userId: props.user?.id || '',
              actionTime: '2023-12-14 09:10:15',
              actionType: 'login',
              actionDesc: '用户登录系统',
              ipAddress: '192.168.1.1',
              location: '中国 广东 深圳',
              device: 'Windows 10',
              browser: 'Chrome 96',
              status: 'success'
            },
            {
              id: '4',
              userId: props.user?.id || '',
              actionTime: '2023-12-13 16:45:12',
              actionType: 'changePassword',
              actionDesc: '用户修改密码',
              ipAddress: '192.168.1.1',
              location: '中国 广东 深圳',
              device: 'Windows 10',
              browser: 'Chrome 96',
              status: 'success'
            },
            {
              id: '5',
              userId: props.user?.id || '',
              actionTime: '2023-12-12 11:30:20',
              actionType: 'login',
              actionDesc: '用户登录失败，密码错误',
              ipAddress: '192.168.1.1',
              location: '中国 广东 深圳',
              device: 'Windows 10',
              browser: 'Chrome 96',
              status: 'failure'
            }
          ];
          
          logList.value = mockLogs;
          pagination.total = 5;
          loading.value = false;
        }, 500);
      } catch (error) {
        console.error('加载用户日志失败:', error);
        ElMessage.error('加载用户日志失败');
        loading.value = false;
      }
    };
    
    // 获取操作类型标签样式
    const getActionTypeTag = (type: string): ActionTagType => {
      const typeMap: Record<string, ActionTagType> = {
        login: 'success',
        logout: 'info',
        changePassword: 'warning',
        updateProfile: 'primary',
        other: 'info'
      };
      return typeMap[type] || 'info';
    };
    
    // 获取操作类型标签文本
    const getActionTypeLabel = (type: string): string => {
      const labelMap: Record<string, string> = {
        login: '登录',
        logout: '登出',
        changePassword: '修改密码',
        updateProfile: '更新信息',
        other: '其他'
      };
      return labelMap[type] || type;
    };
    
    // 过滤操作
    const handleFilter = (): void => {
      pagination.currentPage = 1;
      loadLogs();
    };
    
    // 重置过滤
    const resetFilter = (): void => {
      filterForm.actionType = undefined;
      filterForm.ipAddress = '';
      filterForm.timeRange = undefined;
      handleFilter();
    };
    
    // 分页大小变化
    const handleSizeChange = (size: number): void => {
      pagination.pageSize = size;
      pagination.currentPage = 1;
      loadLogs();
    };
    
    // 当前页变化
    const handleCurrentChange = (page: number): void => {
      pagination.currentPage = page;
      loadLogs();
    };
    
    // 关闭对话框
    const handleClose = (): void => {
      dialogVisible.value = false;
    };
    
    return {
      dialogVisible,
      logList,
      loading,
      filterForm,
      pagination,
      dateShortcuts,
      handleFilter,
      resetFilter,
      handleSizeChange,
      handleCurrentChange,
      handleClose,
      getActionTypeTag,
      getActionTypeLabel
    };
  }
});
</script>

<style lang="scss" scoped>
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";
@use '@/styles/index.scss' as *;
.user-logs-container {
  .filter-container {
    margin-bottom: var(--spacing-xl);
  }
  
  .pagination-container {
    margin-top: var(--spacing-xl);
    display: flex;
    justify-content: flex-end;
  }
}
.full-width {
  width: 100%;
}
</style> 