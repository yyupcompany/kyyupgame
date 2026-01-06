<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">家长管理</div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAddParent">添加家长</el-button>
        </div>
      </div>
      
      <div class="app-card-content">
        <div class="search-filter">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="24" :md="8" :lg="8">
              <el-input
                v-model="searchText"
                placeholder="搜索家长姓名/电话"
                clearable
                class="search-input"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleSearch"></el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :xs="24" :sm="24" :md="16" :lg="16">
              <div class="filter-actions">
                <el-radio-group v-model="parentStatus" @change="handleStatusChange" class="status-radio-group">
                  <el-radio-button value="">全部</el-radio-button>
                  <el-radio-button value="潜在家长">潜在家长</el-radio-button>
                  <el-radio-button value="在读家长">在读家长</el-radio-button>
                  <el-radio-button value="毕业家长">毕业家长</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
        </div>
      
      <!-- 响应式表格容器 -->
      <div class="responsive-table-container">
        <el-table
          :data="filteredParents"
          style="width: 100%"
          border
          v-loading="loading"
          class="desktop-table"
        >
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="联系电话" min-width="120" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getParentStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="孩子信息" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.children && scope.row.children.length > 0">
              <div v-for="child in scope.row.children" :key="child.id">
                {{ child.name }} ({{ child.status }})
              </div>
            </div>
            <span v-else>无孩子信息</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerDate" label="注册时间" width="120" />
        <el-table-column prop="source" label="来源渠道" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewParent(scope.row)">查看</el-button>
            <el-button type="success" size="small" @click="handleEditParent(scope.row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleAddFollowUp(scope.row)">跟进</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 移动端卡片视图 -->
      <div class="mobile-cards" v-if="filteredParents.length > 0">
        <div
          v-for="parent in filteredParents"
          :key="parent.id"
          class="parent-card"
        >
          <div class="card-header">
            <div class="parent-info">
              <h4 class="parent-name">{{ parent.name }}</h4>
              <p class="parent-phone">{{ parent.phone }}</p>
            </div>
            <el-tag :type="getParentStatusType(parent.status)">
              {{ parent.status }}
            </el-tag>
          </div>

          <div class="card-content">
            <div class="info-row">
              <span class="label">孩子信息:</span>
              <span class="value">
                <div v-if="parent.children && parent.children.length > 0">
                  <div v-for="child in parent.children" :key="child.id">
                    {{ child.name }} ({{ child.status }})
                  </div>
                </div>
                <span v-else>无孩子信息</span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">注册时间:</span>
              <span class="value">{{ parent.registerDate }}</span>
            </div>
            <div class="info-row">
              <span class="label">来源渠道:</span>
              <span class="value">{{ parent.source }}</span>
            </div>
          </div>

          <div class="card-actions">
            <el-button type="primary" size="small" @click="handleViewParent(parent)">查看</el-button>
            <el-button type="success" size="small" @click="handleEditParent(parent)">编辑</el-button>
            <el-button type="info" size="small" @click="handleAddFollowUp(parent)">跟进</el-button>
          </div>
        </div>
      </div>

      <!-- 移动端无数据状态 -->
      <div class="mobile-empty" v-if="filteredParents.length === 0">
        <el-empty description="暂无数据" />
      </div>
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
    </div>
    
    <!-- 家长详情抽屉 -->
    <el-drawer
      v-model="showParentDetail"
      title="家长详情"
      size="50%"
      :destroy-on-close="true"
    >
      <div v-if="currentParent" class="parent-detail">
        <div class="parent-header">
          <el-avatar :size="64" :src="currentParent.avatar || defaultAvatar"></el-avatar>
          <div class="parent-info">
            <h2>{{ currentParent.name }}</h2>
            <div class="parent-meta">
              <el-tag :type="getParentStatusType(currentParent.status)">{{ currentParent.status }}</el-tag>
              <span class="parent-phone">{{ currentParent.phone }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="姓名">{{ currentParent.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentParent.phone }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getParentStatusType(currentParent.status)">{{ currentParent.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentParent.registerDate }}</el-descriptions-item>
          <el-descriptions-item label="来源渠道">{{ currentParent.source }}</el-descriptions-item>
          <el-descriptions-item label="居住地址">{{ currentParent.address }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="section-title">
          <h3>孩子信息</h3>
        </div>
        <el-table
          v-if="currentParent.children && currentParent.children.length > 0"
          :data="currentParent.children"
          style="width: 100%"
          border
        >
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="gender" label="性别" width="80" />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="birthday" label="出生日期" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getChildStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无孩子信息" />
        
        <div class="section-title">
          <h3>跟进记录</h3>
          <el-button type="primary" size="small" @click="handleAddFollowUp(currentParent)">添加跟进</el-button>
        </div>
        <el-table
          v-if="currentParent.followUpRecords && currentParent.followUpRecords.length > 0"
          :data="currentParent.followUpRecords"
          style="width: 100%"
          border
        >
          <el-table-column prop="title" label="标题" min-width="150" />
          <el-table-column prop="time" label="时间" width="150" />
          <el-table-column prop="creator" label="创建人" width="100" />
          <el-table-column label="类型" width="100">
            <template #default="scope">
              <el-tag :type="getFollowUpType(scope.row.type)">{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="text" @click="handleViewFollowUp(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无跟进记录" />
        
        <div class="section-title">
          <h3>活动参与</h3>
          <el-button type="primary" size="small" @click="handleAssignActivity(currentParent)">分配活动</el-button>
        </div>
        <el-table
          v-if="currentParent.activities && currentParent.activities.length > 0"
          :data="currentParent.activities"
          style="width: 100%"
          border
        >
          <el-table-column prop="title" label="活动名称" min-width="200" />
          <el-table-column prop="time" label="活动时间" width="150" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getActivityStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="text" @click="handleViewActivity(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无活动参与记录" />
      </div>
    </el-drawer>
    
    <!-- 跟进记录详情对话框 -->
    <el-dialog
      v-model="showFollowUpDetail"
      title="跟进记录详情"
      width="500px"
    >
      <div v-if="currentFollowUp" class="follow-up-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentFollowUp.title }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentFollowUp.time }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentFollowUp.creator }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getFollowUpType(currentFollowUp.type)">{{ currentFollowUp.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="内容">{{ currentFollowUp.content || '无详细内容' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { PARENT_ENDPOINTS } from '@/api/endpoints'
import request from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

// 类型定义
interface Parent {
  id: number
  name: string
  phone: string
  status: string
  registerDate: string
  source: string
  address?: string
  children?: any[]
  followUpRecords?: any[]
  activities?: any[]
}

interface ParentListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
}

export default defineComponent({
  name: 'ParentList',
  components: {
    Search
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const searchText = ref('')
    const parentStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    const showParentDetail = ref(false)
    const currentParent = ref<Parent | null>(null)
    
    const showFollowUpDetail = ref(false)
    const currentFollowUp = ref<any>(null)
    
    // 默认头像
    const defaultAvatar = ''
    
    // 存储家长数据 - 后端原始数据
    const parentsData = ref<ParentData[]>([])
    
    // 存储转换后的前端数据
    const parents = ref<Parent[]>([])
    
    // 查询参数
    const queryParams = reactive<ParentListParams>({
      page: 1,
      pageSize: 10,
      keyword: '',
      // 后端可能支持更多参数，如studentId、relationship等
    })
    
    // 根据搜索条件过滤家长列表，这里我们直接使用API获取的过滤结果
    const filteredParents = computed(() => {
      return parents.value
    })
    
    // 获取家长状态对应的类型
    const getParentStatusType = (status: string): "success" | "warning" | "info" | "danger" | "primary" => {
      switch (status) {
        case '潜在家长':
          return 'warning'
        case '在读家长':
          return 'success'
        case '毕业家长':
          return 'info'
        default:
          return 'info'
      }
    }
    
    // 获取孩子状态对应的类型
    const getChildStatusType = (status: string): "success" | "warning" | "info" | "danger" | "primary" => {
      switch (status) {
        case '已入学':
          return 'success'
        case '已申请':
          return 'warning'
        case '已毕业':
          return 'info'
        default:
          return 'info'
      }
    }
    
    // 获取跟进记录类型对应的类型
    const getFollowUpType = (type: string): "success" | "warning" | "info" | "danger" | "primary" => {
      switch (type) {
        case '电话':
        case '电话沟通':
          return 'primary'
        case '访问':
        case '家访':
          return 'success'
        case '短信':
          return 'warning'
        case '邮件':
          return 'info'
        default:
          return 'info'
      }
    }
    
    // 获取活动状态对应的类型
    const getActivityStatusType = (status: string): "success" | "warning" | "info" | "danger" | "primary" => {
      switch (status) {
        case '已报名':
          return 'warning'
        case '已参加':
          return 'success'
        case '已取消':
          return 'danger'
        default:
          return 'info'
      }
    }
    
    // 处理搜索
    const handleSearch = () => {
      queryParams.keyword = searchText.value
      queryParams.page = 1
      fetchData()
    }
    
    // 处理状态变化
    const handleStatusChange = () => {
      // 后端没有直接的状态过滤，可以在前端筛选
      // 或者根据需要修改为适当的后端参数
      queryParams.page = 1
      fetchData()
    }
    
    // 处理页码变化
    const handleCurrentChange = (val: number) => {
      queryParams.page = val
      fetchData()
    }
    
    // 处理每页条数变化
    const handleSizeChange = (val: number) => {
      queryParams.pageSize = val
      queryParams.page = 1
      fetchData()
    }
    
    // 处理后端数据转换为前端格式
    const processParentData = (data: ParentData[]): Parent[] => {
      return data.map(item => transformParentData(item))
    }
    
    // 查看家长详情 - 使用统一API
    const handleViewParent = async (parent: Parent) => {
      loading.value = true
      try {
        const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parent.id))
        
        if (response.success && response.data) {
          // 获取孩子信息
          try {
            const childrenResponse: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_CHILDREN(parent.id))
            if (childrenResponse.success && childrenResponse.data) {
              response.data.children = childrenResponse.data
            }
          } catch (error) {
            console.warn('获取孩子信息失败:', error)
          }
          
          // 获取沟通记录
          try {
            const commResponse: ApiResponse = await request.get(PARENT_ENDPOINTS.COMMUNICATION_HISTORY(parent.id))
            if (commResponse.success && commResponse.data) {
              response.data.followUpRecords = commResponse.data
            }
          } catch (error) {
            console.warn('获取沟通记录失败:', error)
          }
          
          currentParent.value = response.data
          showParentDetail.value = true
        } else {
          ElMessage.error(response.message || '获取家长详情失败')
        }
      } catch (error) {
        console.error('获取家长详情失败:', error)
        ElMessage.error('获取家长详情失败')
      } finally {
        loading.value = false
      }
    }
    
    // 编辑家长信息
    const handleEditParent = (parent: Parent) => {
      router.push(`/parent/edit/${parent.id}`)
    }
    
    // 添加家长
    const handleAddParent = () => {
      router.push('/parent/create')
    }
    
    // 添加跟进记录
    const handleAddFollowUp = (parent: Parent) => {
      router.push(`/parent/follow-up/create?parentId=${parent.id}`)
    }
    
    // 分配活动
    const handleAssignActivity = (parent: Parent) => {
      router.push(`/parent/assign-activity/${parent.id}`)
    }
    
    // 查看跟进详情
    const handleViewFollowUp = (record: any) => {
      currentFollowUp.value = record
      showFollowUpDetail.value = true
    }
    
    // 查看活动详情
    const handleViewActivity = (activity: any) => {
      router.push(`/activity/detail/${activity.id}`)
    }
    
    // 获取数据 - 使用统一API
    const fetchData = async () => {
      loading.value = true
      try {
        const params = {
          ...queryParams,
          status: parentStatus.value || undefined
        }

        const response: ApiResponse = await request.get(PARENT_ENDPOINTS.BASE, { params })

        // 家长API返回格式: { data: { list: [...], total: number }, message: "..." }
        if (response.data && response.data.list && Array.isArray(response.data.list)) {
          // 转换API数据格式为前端期望的格式
          const transformedData = response.data.list.map((item: any) => ({
            id: item.id,
            name: item.real_name || item.user?.realName || '未知',
            phone: item.user_phone || item.user?.phone || '',
            status: getParentStatusFromData(item),
            registerDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
            source: item.source || '未知',
            children: [], // 需要单独获取
            // 保留原始数据以备后用
            ...item
          }))

          parents.value = transformedData
          total.value = response.data.total || transformedData.length
        } else {
          parents.value = []
          total.value = 0
          ElMessage.error(response.message || '获取家长列表失败')
        }
      } catch (error) {
        console.error('获取家长列表失败:', error)
        ElMessage.error('获取家长列表失败')
        parents.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 从API数据推断家长状态
    const getParentStatusFromData = (item: any): string => {
      // 根据API数据推断状态，这里需要根据实际业务逻辑调整
      if (item.user_status === 'active') {
        return '在读家长'
      } else if (item.user_status === 'inactive') {
        return '毕业家长'
      } else {
        return '潜在家长'
      }
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      searchText,
      parentStatus,
      currentPage,
      pageSize,
      total,
      parents,
      filteredParents,
      showParentDetail,
      currentParent,
      showFollowUpDetail,
      currentFollowUp,
      defaultAvatar,
      Search,
      
      getParentStatusType,
      getChildStatusType,
      getFollowUpType,
      getActivityStatusType,
      handleSearch,
      handleStatusChange,
      handleCurrentChange,
      handleSizeChange,
      handleViewParent,
      handleEditParent,
      handleAddParent,
      handleAddFollowUp,
      handleAssignActivity,
      handleViewFollowUp,
      handleViewActivity
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* 使用全局样式：.page-container, .pagination-container */

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
.parent-card {
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

    .parent-info {
      flex: 1;

      .parent-name {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }

      .parent-phone {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
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

.search-filter {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);

  /* 移动端优化 */
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-md);

    .el-row {
      .el-col {
        margin-bottom: var(--spacing-sm);
      }
    }
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.parent-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.parent-info {
  margin-left: var(--spacing-lg);
}

.parent-info h2 {
  margin: 0 0 var(--spacing-sm) 0;
}

.parent-meta {
  display: flex;
  align-items: center;
}

.parent-phone {
  margin-left: var(--spacing-sm);
  color: var(--text-secondary);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-lg) 0 var(--spacing-sm);
}

.section-title h3 {
  margin: 0;
}

.app-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
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