<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">孩子管理</div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAddChild">添加孩子</el-button>
        </div>
      </div>
      
      <div class="search-filter">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-input
              v-model="searchText"
              placeholder="搜索孩子姓名/班级"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <UnifiedIcon name="Search" :size="14" />
                </el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="16">
            <div class="filter-actions">
              <el-radio-group v-model="childStatus" @change="handleStatusChange">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button value="小班">小班</el-radio-button>
                <el-radio-button value="中班">中班</el-radio-button>
                <el-radio-button value="大班">大班</el-radio-button>
              </el-radio-group>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 卡片视图（4个以内） -->
      <div v-if="showCardView" v-loading="loading" class="children-cards">
        <el-row :gutter="20">
          <el-col 
            v-for="child in filteredChildren" 
            :key="child.id" 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6"
            class="child-card-col"
          >
            <el-card class="child-card" shadow="hover" @click="handleViewChild(child)">
              <template #header>
                <div class="card-header">
                  <el-avatar :size="60" :src="child.avatar || defaultAvatar" class="child-avatar">
                    {{ child.name?.charAt(0) || '孩' }}
                  </el-avatar>
                  <div class="card-title">
                    <h3>{{ child.name }}</h3>
                    <el-tag :type="child.gender === '男' ? 'primary' : 'danger'" size="small">
                      {{ child.gender }}
                    </el-tag>
                  </div>
                </div>
              </template>
              <div class="card-content">
                <div class="card-info-item">
                  <UnifiedIcon name="Calendar" :size="16" />
                  <span>{{ child.age || 0 }}岁</span>
                </div>
                <div class="card-info-item">
                  <UnifiedIcon name="School" :size="16" />
                  <el-tag :type="getClassType(child.className)" size="small">
                    {{ child.className || '未分配班级' }}
                  </el-tag>
                </div>
                <div class="card-info-item">
                  <UnifiedIcon name="User" :size="16" />
                  <span>{{ child.birthday || '未知' }}</span>
                </div>
              </div>
              <template #footer>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click.stop="handleViewChild(child)">查看</el-button>
                  <el-button type="success" size="small" @click.stop="handleEditChild(child)">编辑</el-button>
                  <el-button type="info" size="small" @click.stop="handleViewGrowth(child)">成长档案</el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 表格视图（超过4个） -->
      <div v-else class="table-wrapper">
<el-table class="responsive-table"
        :data="filteredChildren"
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column type="index" width="var(--size-avatar-sm)" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="gender" label="性别" width="var(--spacing-5xl)" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="var(--spacing-5xl)" align="center" />
        <el-table-column prop="birthday" label="出生日期" width="calc(var(--spacing-3xl) + var(--spacing-sm))" />
        <el-table-column prop="className" label="班级" width="calc(var(--spacing-3xl) + var(--spacing-sm))">
          <template #default="scope">
            <el-tag :type="getClassType(scope.row.className)" size="small">
              {{ scope.row.className }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="家长信息" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.parents && scope.row.parents.length > 0">
              <div v-for="parent in scope.row.parents" :key="parent.id">
                {{ parent.name }} ({{ parent.relation }})
              </div>
            </div>
            <span v-else>无家长信息</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="calc(var(--spacing-5xl) * 2 + var(--spacing-md))" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewChild(scope.row)">查看</el-button>
            <el-button type="success" size="small" @click="handleEditChild(scope.row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleViewGrowth(scope.row)">成长档案</el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
      
      <div class="pagination-container">
        <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 孩子详情抽屉 -->
    <el-drawer
      v-model="showChildDetail"
      title="孩子详情"
      size="calc(50%)"
      :destroy-on-close="true"
    >
      <div v-if="currentChild" class="child-detail">
        <div class="child-header">
          <el-avatar size="large" :src="currentChild.avatar || defaultAvatar"></el-avatar>
          <div class="child-info">
            <h2>{{ currentChild.name || '未知' }}</h2>
            <div class="child-meta">
              <el-tag :type="currentChild.gender === '男' ? 'primary' : 'danger'" size="small">
                {{ currentChild.gender || '未知' }}
              </el-tag>
              <span class="child-age">{{ currentChild.age || 0 }}岁</span>
            </div>
          </div>
        </div>

        <el-divider />

        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="姓名">{{ currentChild.name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentChild.gender || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ currentChild.age || 0 }}岁</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ currentChild.birthday || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="班级">
            <el-tag :type="getClassType(currentChild.className)" size="small">
              {{ currentChild.className || '未分配班级' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="入园时间">{{ currentChild.enrollmentDate || '未知' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="section-title">
          <h3>家长信息</h3>
        </div>
        <el-table class="responsive-table"
          v-if="currentChild.parents && currentChild.parents.length > 0"
          :data="currentChild.parents"
          style="width: 100%"
          border
        >
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="relation" label="关系" width="calc(var(--spacing-3xl) - var(--spacing-sm))" />
          <el-table-column prop="phone" label="联系电话" min-width="calc(var(--spacing-3xl) + var(--spacing-sm))" />
          <el-table-column label="操作" width="calc(var(--spacing-3xl) - var(--spacing-sm))">
            <template #default="scope">
              <el-button type="text" @click="handleViewParent(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无家长信息" />
        
        <div class="section-title">
          <h3>健康记录</h3>
        </div>
        <el-table class="responsive-table"
          v-if="currentChild.healthRecords && currentChild.healthRecords.length > 0"
          :data="currentChild.healthRecords"
          style="width: 100%"
          border
        >
          <el-table-column prop="date" label="日期" width="calc(var(--spacing-3xl) + var(--spacing-sm))" />
          <el-table-column prop="type" label="类型" width="calc(var(--spacing-3xl) - var(--spacing-sm))">
            <template #default="scope">
              <el-tag :type="getHealthRecordType(scope.row.type)" size="small">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="calc(var(--spacing-5xl) * 2 + var(--spacing-md))" />
          <el-table-column prop="recorder" label="记录人" width="calc(var(--spacing-3xl) - var(--spacing-sm))" />
        </el-table>
        <el-empty v-else description="暂无健康记录" />
        
        <div class="section-title">
          <h3>最近评价</h3>
        </div>
        <el-table class="responsive-table"
          v-if="currentChild.evaluations && currentChild.evaluations.length > 0"
          :data="currentChild.evaluations"
          style="width: 100%"
          border
        >
          <el-table-column prop="date" label="日期" width="calc(var(--spacing-3xl) + var(--spacing-sm))" />
          <el-table-column prop="title" label="标题" min-width="calc(var(--spacing-5xl) + var(--spacing-sm))" />
          <el-table-column prop="teacher" label="评价老师" width="calc(var(--spacing-3xl) - var(--spacing-sm))" />
          <el-table-column label="操作" width="calc(var(--spacing-3xl) - var(--spacing-sm))">
            <template #default="scope">
              <el-button type="text" @click="handleViewEvaluation(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评价记录" />
      </div>
    </el-drawer>
    
    <!-- 评价详情对话框 -->
    <el-dialog
      v-model="showEvaluationDetail"
      title="评价详情"
      width="calc(var(--container-md) + var(--spacing-lg))"
    >
      <div v-if="currentEvaluation" class="evaluation-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentEvaluation.title }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ currentEvaluation.date }}</el-descriptions-item>
          <el-descriptions-item label="评价老师">{{ currentEvaluation.teacher }}</el-descriptions-item>
          <el-descriptions-item label="评价内容">{{ currentEvaluation.content }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { STUDENT_ENDPOINTS, PARENT_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';
import defaultAvatar from '@/assets/logo.png';
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';
import { useUserStore } from '@/stores/user';

interface Parent {
  id: number;
  name: string;
  relation: string;
  phone: string;
}

interface HealthRecord {
  id: number;
  date: string;
  type: string;
  description: string;
  recorder: string;
}

interface Evaluation {
  id: number;
  date: string;
  title: string;
  teacher: string;
  content: string;
}

interface Child {
  id: number;
  name?: string;
  gender?: string;
  age?: number;
  birthday?: string;
  className?: string;
  enrollmentDate?: string;
  avatar?: string;
  parents?: Parent[];
  healthRecords?: HealthRecord[];
  evaluations?: Evaluation[];
}

export default defineComponent({
  name: 'ChildrenList',
  components: {
    UnifiedIcon
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(false);
    const searchText = ref('');
    const childStatus = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    
    const showChildDetail = ref(false);
    const currentChild = ref<Child | null>(null);
    
    const showEvaluationDetail = ref(false);
    const currentEvaluation = ref<Evaluation | null>(null);
    
    // 孩子数据
    const children = ref<Child[]>([
      {
        id: 1,
        name: '李小红',
        gender: '女',
        age: 5,
        birthday: '2018-07-20',
        className: '大班-星星',
        enrollmentDate: '2020-09-01',
        parents: [
          { id: 3, name: '李明', relation: '父亲', phone: '13765432198' },
          { id: 4, name: '赵芳', relation: '母亲', phone: '13876543210' }
        ],
        healthRecords: [
          { id: 3, date: '2023-05-15', type: '体检', description: '身高115cm，体重22kg，视力正常', recorder: '王医生' }
        ],
        evaluations: [
          { id: 3, date: '2023-05-20', title: '五月月度评价', teacher: '王老师', content: '小红表现出色，尤其在艺术创作方面有很强的天赋。能自主完成手工制作，并乐于展示自己的作品。建议家长提供更多绘画材料，支持其创作兴趣。' }
        ]
      }
    ]);
    
    // 数据将从 API 获取
    
    // 根据搜索条件和状态过滤孩子
    const filteredChildren = computed(() => {
      let result = children.value;
      
      // 按班级筛选
      if (childStatus.value) {
        result = result.filter(child => child.className.includes(childStatus.value));
      }
      
      // 按搜索文本筛选
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase();
        result = result.filter(child => 
          child.name.toLowerCase().includes(searchLower) || 
          child.className.toLowerCase().includes(searchLower)
        );
      }
      
      // 计算总数
      total.value = result.length;
      
      // 模拟分页
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return result.slice(startIndex, endIndex);
    });

    // 判断是否显示卡片视图（4个以内显示卡片）
    const showCardView = computed(() => {
      return filteredChildren.value.length <= 4 && filteredChildren.value.length > 0;
    });
    
    // 获取班级对应的类型
    const getClassType = (className: string | undefined): "success" | "warning" | "info" | "danger" | "primary" => {
      if (!className) return 'info';
      if (className.includes('小班')) {
        return 'primary';
      } else if (className.includes('中班')) {
        return 'success';
      } else if (className.includes('大班')) {
        return 'warning';
      }
      return 'info';
    };
    
    // 获取健康记录类型对应的类型
    const getHealthRecordType = (type: string): "success" | "warning" | "info" | "danger" | "primary" => {
      switch (type) {
        case '体检':
          return 'primary';
        case '生病':
          return 'danger';
        case '疫苗':
          return 'success';
        case '过敏':
          return 'warning';
        default:
          return 'info';
      }
    };
    
    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1; // 重置到第一页
    };
    
    // 处理状态变化
    const handleStatusChange = () => {
      currentPage.value = 1; // 重置到第一页
    };
    
    // 处理页码变化
    const handleCurrentChange = (val: number) => {
      currentPage.value = val;
    };
    
    // 处理每页条数变化
    const handleSizeChange = (val: number) => {
      pageSize.value = val;
      currentPage.value = 1; // 重置到第一页
    };
    
    // 编辑孩子信息
    const handleEditChild = (child: Child) => {
      router.push(`/parent/child/edit/${child.id}`);
    };
    
    // 添加孩子
    const handleAddChild = () => {
      router.push('/parent/child/create');
    };
    
    // 查看成长档案
    const handleViewGrowth = (child: Child) => {
      // 跳转到成长报告页面，通过query参数传递childId
      router.push({
        path: '/parent-center/child-growth',
        query: { id: child.id }
      });
    };
    
    // 查看家长信息
    const handleViewParent = (parent: Parent) => {
      router.push(`/parent/detail/${parent.id}`);
    };
    
    // 查看孩子详情
    const handleViewChild = async (child: Child) => {
      try {
        loading.value = true;
        const response: ApiResponse = await request.get(STUDENT_ENDPOINTS.GET_BY_ID(child.id));
        
        if (response.success && response.data) {
          // 获取孩子的家长信息
          try {
            const parentsResponse: ApiResponse = await request.get(STUDENT_ENDPOINTS.GET_PARENTS(child.id));
            if (parentsResponse.success && parentsResponse.data) {
              response.data.parents = parentsResponse.data;
            }
          } catch (error) {
            console.warn('获取家长信息失败:', error);
          }
          
          currentChild.value = response.data;
          showChildDetail.value = true;
        } else {
          ElMessage.error(response.message || '获取孩子详情失败');
        }
      } catch (error) {
        console.error('获取孩子详情失败:', error);
        ElMessage.error('获取孩子详情失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 查看评价详情
    const handleViewEvaluation = (evaluation: Evaluation) => {
      currentEvaluation.value = evaluation;
      showEvaluationDetail.value = true;
    };
    
    // 获取数据
    const fetchData = async () => {
      loading.value = true;
      try {
        const parentId = userStore.userInfo?.id;
        if (!parentId) {
          ElMessage.error('无法获取家长信息');
          return;
        }

        const params = {
          keyword: searchText.value,
          className: childStatus.value || undefined,
          page: currentPage.value,
          pageSize: pageSize.value,
          parentId: parentId  // ✅ 添加 parentId 过滤，只显示当前家长的孩子
        };

        const response: ApiResponse = await request.get(STUDENT_ENDPOINTS.BASE, { params });

        if (response.success && response.data) {
          const data = response.data;
          if (Array.isArray(data)) {
            children.value = data;
            total.value = data.length;
          } else if (data.items && Array.isArray(data.items)) {
            children.value = data.items;
            total.value = data.total || data.items.length;
          } else if (data.rows && Array.isArray(data.rows)) {
            children.value = data.rows;
            total.value = data.count || data.rows.length;
          } else {
            children.value = [];
            total.value = 0;
          }
        } else {
          children.value = [];
          total.value = 0;
          ElMessage.error(response.message || '获取孩子列表失败');
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error);
        ElMessage.error('获取孩子列表失败');
        children.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchData();
    });
    
    return {
      loading,
      searchText,
      childStatus,
      currentPage,
      pageSize,
      total,
      children,
      filteredChildren,
      showCardView,
      showChildDetail,
      currentChild,
      showEvaluationDetail,
      currentEvaluation,
      defaultAvatar,

      getClassType,
      getHealthRecordType,
      handleSearch,
      handleStatusChange,
      handleCurrentChange,
      handleSizeChange,
      handleViewChild,
      handleEditChild,
      handleAddChild,
      handleViewGrowth,
      handleViewParent,
      handleViewEvaluation
    };
  }
});
</script>

<style scoped lang="scss">
/* 使用设计令牌，不引入外部SCSS */

/* ==================== 页面容器 ==================== */
.page-container {
  padding: var(--spacing-xl);
  max-width: var(--breakpoint-2xl);
  margin: 0 auto;
}

/* ==================== 应用卡片 ==================== */
.app-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-lighter);
}

.app-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* ==================== 搜索筛选 ==================== */
.search-filter {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-lighter);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

/* ==================== 分页容器 ==================== */
.pagination-container {
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-lighter);
}

/* ==================== 孩子卡片视图 ==================== */
.children-cards {
  margin-bottom: var(--spacing-xl);
}

.child-card-col {
  margin-bottom: var(--spacing-lg);
}

.child-card {
  cursor: pointer;
  transition: all var(--transition-base);
  height: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-lighter);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--el-color-primary-light-3);
  }

  :deep(.el-card__header) {
    padding: var(--spacing-md);
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--border-color-lighter);
  }

  :deep(.el-card__footer) {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--el-fill-color-light);
    border-top: 1px solid var(--border-color-lighter);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .child-avatar {
      flex-shrink: 0;
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
      color: white;
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .card-title {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--el-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .card-content {
    padding: var(--spacing-md) 0;

    .card-info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      color: var(--el-text-color-secondary);
      font-size: var(--text-sm);

      &:last-child {
        margin-bottom: 0;
      }

      .unified-icon {
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }
    }
  }

  .card-actions {
    display: flex;
    gap: var(--spacing-xs);
    justify-content: center;
    flex-wrap: wrap;

    .el-button {
      flex: 1;
      min-width: 60px;
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

/* ==================== 表格样式 ==================== */
.table-wrapper {
  margin-bottom: var(--spacing-xl);
}

:deep(.el-table) {
  border-radius: var(--radius-md);
  overflow: hidden;

  &::before {
    display: none;
  }

  .el-table__header-wrapper th {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
    font-weight: 600;
  }

  .el-table__row {
    transition: all var(--transition-base);

    &:hover {
      background: var(--el-fill-color-light) !important;
    }
  }
}

/* ==================== 孩子详情抽屉 ==================== */
.child-detail {
  padding: var(--spacing-md);
}

.child-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-lighter);

  .el-avatar {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    box-shadow: var(--shadow-md);
  }

  .child-info {
    h2 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .child-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .child-age {
        color: var(--el-text-color-secondary);
        font-size: var(--text-sm);
      }
    }
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-xl) 0 var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color-lighter);

  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  h3 {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

/* ==================== 评价详情对话框 ==================== */
.evaluation-detail {
  padding: var(--spacing-md);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);
  }

  .app-card {
    padding: var(--spacing-md);
  }

  .app-card-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .search-filter {
    padding: var(--spacing-md);

    .el-row {
      gap: var(--spacing-md);
    }

    .el-col {
      width: 100% !important;
    }
  }

  .filter-actions {
    justify-content: flex-start;
  }

  .pagination-container {
    justify-content: center;

    .el-pagination {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  .child-card-col {
    margin-bottom: var(--spacing-md);
  }

  .child-card .card-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }

  .child-header {
    flex-direction: column;
    text-align: center;

    .child-info {
      h2 {
        font-size: var(--text-lg);
      }

      .child-meta {
        justify-content: center;
      }
    }
  }
}
</style> 