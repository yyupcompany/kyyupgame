<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">分配活动</div>
        <div class="card-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="assign-activity-content">
        <div class="parent-info-section">
          <h3>家长信息</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="姓名">{{ parentInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ parentInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getParentStatusType(parentInfo.status)">{{ parentInfo.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <div v-if="parentInfo.children && parentInfo.children.length > 0">
            <h4>孩子信息</h4>
            <el-table :data="parentInfo.children" style="width: 100%" border>
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="gender" label="性别" width="80" />
              <el-table-column prop="age" label="年龄" width="80" />
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getChildStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        
        <el-divider />
        
        <div class="activities-section">
          <h3>已参与活动</h3>
          <el-table
            v-if="parentInfo.activities && parentInfo.activities.length > 0"
            :data="parentInfo.activities"
            style="width: 100%"
            border
          >
            <el-table-column prop="title" label="活动名称" min-width="200" />
            <el-table-column prop="time" label="活动时间" width="180" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getActivityStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleCancelActivity(scope.row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无参与活动" />
        </div>
        
        <el-divider />
        
        <div class="available-activities-section">
          <h3>可分配活动</h3>
          <div class="filter-section">
            <el-input
              v-model="searchText"
              placeholder="搜索活动名称"
              style="width: 300px"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch"></el-button>
              </template>
            </el-input>
            
            <el-select v-model="activityType" placeholder="活动类型" style="width: 150px" @change="handleSearch">
              <el-option label="全部类型" value="" />
              <el-option label="招生活动" value="招生活动" />
              <el-option label="亲子活动" value="亲子活动" />
              <el-option label="节日活动" value="节日活动" />
              <el-option label="公益活动" value="公益活动" />
            </el-select>
          </div>
          
          <el-table
            v-if="filteredActivities.length > 0"
            :data="filteredActivities"
            style="width: 100%"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="title" label="活动名称" min-width="200" />
            <el-table-column prop="type" label="活动类型" width="120" />
            <el-table-column prop="time" label="活动时间" width="180" />
            <el-table-column prop="location" label="活动地点" width="150" />
            <el-table-column prop="quota" label="剩余名额" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleViewActivityDetail(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无可分配活动" />
        </div>
        
        <div v-if="selectedActivities.length > 0" class="selected-activities">
          <h3>已选择 {{ selectedActivities.length }} 个活动</h3>
          <el-table :data="selectedActivities" style="width: 100%" border>
            <el-table-column prop="title" label="活动名称" min-width="200" />
            <el-table-column prop="time" label="活动时间" width="180" />
            <el-table-column prop="location" label="活动地点" width="150" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleRemoveSelected(scope.row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    
    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="showActivityDetail"
      title="活动详情"
      width="600px"
    >
      <div v-if="currentActivity" class="activity-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动名称">{{ currentActivity.title }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">{{ currentActivity.type }}</el-descriptions-item>
          <el-descriptions-item label="活动时间">{{ currentActivity.time }}</el-descriptions-item>
          <el-descriptions-item label="活动地点">{{ currentActivity.location }}</el-descriptions-item>
          <el-descriptions-item label="剩余名额">{{ currentActivity.quota }}</el-descriptions-item>
          <el-descriptions-item label="活动描述">{{ currentActivity.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="dialog-footer">
          <el-button @click="showActivityDetail = false">关闭</el-button>
          <el-button
            type="primary"
            @click="handleAssignActivity(currentActivity)"
            :disabled="isActivitySelected(currentActivity)"
          >
            {{ isActivitySelected(currentActivity) ? '已选择' : '选择此活动' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { get, post, put, del } from '@/utils/request';
import { PARENT_ENDPOINTS, ACTIVITY_ENDPOINTS } from '@/api/endpoints';
import { ErrorHandler } from '@/utils/errorHandler';

interface Child {
  id: number;
  name: string;
  gender: string;
  age: number;
  status: string;
}

interface Activity {
  id: number;
  title: string;
  type: string;
  time: string;
  location: string;
  quota: number;
  description?: string;
  status?: string;
}

interface ParentInfo {
  id: number;
  name: string;
  phone: string;
  status: string;
  children: Child[];
  activities: Activity[];
}

export default defineComponent({
  name: 'AssignActivity',
  components: {
    Search
  },
  props: {
    id: {
      type: Number,
  required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const submitting = ref(false);
    const searchText = ref('');
    const activityType = ref('');
    
    const parentInfo = ref<ParentInfo>({
      id: props.id,
  name: '',
  phone: '',
  status: '',
  children: [],
  activities: []
    });
    
    const availableActivities = ref<Activity[]>([]);
    const selectedActivities = ref<Activity[]>([]);
    const showActivityDetail = ref(false);
    const currentActivity = ref<Activity | null>(null);
    
    // 过滤后的活动列表
    const filteredActivities = computed(() => {
      let result = availableActivities.value;
      
      // 按类型筛选
      if (activityType.value) {
        result = result.filter(activity => activity.type === activityType.value);
      }
      
      // 按搜索文本筛选
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase();
        result = result.filter(activity => 
          activity.title.toLowerCase().includes(searchLower)
        );
      }
      
      return result;
    });
    
    // 获取家长信息
    const fetchParentInfo = async () => {
      if (!props.id) {
        ElMessage.error('家长ID不能为空');
        router.back();
        return;
      }

      loading.value = true;
      try {
        const response = await get(PARENT_ENDPOINTS.DETAIL(props.id));
        
        if (response.success && response.data) {
          parentInfo.value = response.data;
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '获取家长信息失败'), true);
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true);
        router.back();
      } finally {
        loading.value = false;
      }
    };

    // 获取可用活动列表
    const fetchAvailableActivities = async () => {
      try {
        const response = await get(ACTIVITY_ENDPOINTS.AVAILABLE_FOR_PARENT(props.id));
        
        if (response.success && response.data) {
          availableActivities.value = response.data.list || [];
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '获取可用活动失败'), false);
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, false);
      }
    };
    
    // 获取家长状态标签类型
    const getParentStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
      switch (status) {
        case '潜在家长':
          return 'primary';
        case '在读家长':
          return 'success';
        case '毕业家长':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // 获取孩子状态标签类型
    const getChildStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
      if (status.includes('在读')) {
        return 'success';
      } else if (status === '未入学') {
        return 'primary';
      } else if (status === '已毕业') {
        return 'info';
      }
      return 'info';
    };
    
    // 获取活动状态标签类型
    const getActivityStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
      switch (status) {
        case '已报名':
          return 'primary';
        case '已参加':
          return 'success';
        default:
          return 'info';
      }
    };
    
    // 处理搜索
    const handleSearch = () => {
      // 已在计算属性中实现
    };
    
    // 处理表格选择变化
    const handleSelectionChange = (selection: Activity[]) => {
      selectedActivities.value = selection;
    };
    
    // 查看活动详情
    const handleViewActivityDetail = (activity: Activity) => {
      currentActivity.value = activity;
      showActivityDetail.value = true;
    };
    
    // 分配活动
    const handleAssignActivity = (activity: Activity) => {
      if (!isActivitySelected(activity)) {
        selectedActivities.value.push(activity);
      }
      showActivityDetail.value = false;
    };
    
    // 移除已选择的活动
    const handleRemoveSelected = (activity: Activity) => {
      selectedActivities.value = selectedActivities.value.filter(item => item.id !== activity.id);
    };
    
    // 取消已参与的活动
    const handleCancelActivity = async (activity: Activity) => {
      try {
        await ElMessageBox.confirm(`确定要取消"${activity.title}"活动的参与吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const response = await del(ACTIVITY_ENDPOINTS.CANCEL_ACTIVITY(activity.id, props.id));
        
        if (response.success) {
          parentInfo.value.activities = parentInfo.value.activities.filter(item => item.id !== activity.id);
          ElMessage.success('取消成功');
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '取消活动失败'), true);
        }
      } catch (error) {
        if (error !== 'cancel') {
          const errorInfo = ErrorHandler.handle(error, true);
        }
      }
    };
    
    // 检查活动是否已被选择
    const isActivitySelected = (activity: Activity): boolean => {
      return selectedActivities.value.some(item => item.id === activity.id);
    };
    
    // 提交表单
    const handleSubmit = async () => {
      if (selectedActivities.value.length === 0) {
        ElMessage.warning('请至少选择一个活动');
        return;
      }
      
      submitting.value = true;
      try {
        const response = await post(PARENT_ENDPOINTS.ASSIGN_ACTIVITIES(props.id), {
          activityIds: selectedActivities.value.map(activity => activity.id)
        });
        
        if (response.success) {
          ElMessage.success('活动分配成功');
          router.push(`/parent/detail/${props.id}`);
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '活动分配失败'), true);
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true);
      } finally {
        submitting.value = false;
      }
    };
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    onMounted(() => {
      fetchParentInfo();
      fetchAvailableActivities();
    });
    
    return {
      loading,
      submitting,
      parentInfo,
      searchText,
      activityType,
      availableActivities,
      filteredActivities,
      selectedActivities,
      showActivityDetail,
      currentActivity,
      Search,
      
      getParentStatusType,
      getChildStatusType,
      getActivityStatusType,
      handleSearch,
      handleSelectionChange,
      handleViewActivityDetail,
      handleAssignActivity,
      handleRemoveSelected,
      handleCancelActivity,
      isActivitySelected,
      handleSubmit,
      goBack
    };
  }
});
</script>

<style scoped>
.loading-container {
  padding: var(--spacing-lg);
}

.parent-info-section {
  margin-bottom: var(--text-2xl);
}

.parent-info-section h3,
.activities-section h3,
.available-activities-section h3,
.selected-activities h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-4xl);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.parent-info-section h4 {
  margin-top: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.filter-section {
  display: flex;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
}

.selected-activities {
  margin-top: var(--text-2xl);
  padding-top: var(--text-2xl);
  border-top: var(--border-width-base) dashed var(--border-color);
}

.dialog-footer {
  margin-top: var(--text-2xl);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.app-card {
  background-color: var(--el-bg-color);
  border-radius: var(--spacing-xs);
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
  padding: var(--spacing-lg);
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.app-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style> 