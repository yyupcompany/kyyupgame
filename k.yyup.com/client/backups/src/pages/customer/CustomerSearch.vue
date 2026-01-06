<template>
  <div class="customer-search-container">
    <!-- 页面头部 -->
    <div class="search-header">
      <div class="header-content">
        <div class="page-title">
          <h1>客户搜索</h1>
          <p>快速查找和筛选客户信息</p>
        </div>
        <div class="header-stats">
          <el-statistic title="搜索结果" :value="searchStats.total" />
          <el-statistic title="潜在客户" :value="searchStats.potential" />
          <el-statistic title="成交客户" :value="searchStats.converted" />
          <el-statistic title="搜索用时" :value="searchStats.time" suffix="ms" />
        </div>
      </div>
    </div>

    <!-- 高级搜索表单 -->
    <div class="advanced-search">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><Search /></el-icon>
            <span>高级搜索</span>
            <el-button 
              type="text" 
              @click="toggleAdvanced"
              class="toggle-btn"
            >
              {{ showAdvanced ? '收起' : '展开' }}
              <el-icon>
                <component :is="showAdvanced ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </el-button>
          </div>
        </template>
        
        <el-form :model="searchForm" label-width="100px" class="search-form">
          <!-- 基础搜索 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="客户姓名">
                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入客户姓名"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="联系电话">
                <el-input
                  v-model="searchForm.phone"
                  placeholder="请输入联系电话"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Phone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="客户状态">
                <el-select
                  v-model="searchForm.status"
                  placeholder="选择客户状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="潜在客户" value="potential" />
                  <el-option label="意向客户" value="interested" />
                  <el-option label="成交客户" value="converted" />
                  <el-option label="流失客户" value="lost" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- 高级搜索选项 -->
          <div v-show="showAdvanced" class="advanced-options">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="客户来源">
                  <el-select v-model="searchForm.source" placeholder="选择来源" clearable>
                    <el-option label="线上推广" value="online" />
                    <el-option label="朋友推荐" value="referral" />
                    <el-option label="地推活动" value="offline" />
                    <el-option label="电话营销" value="telemarketing" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="跟进状态">
                  <el-select v-model="searchForm.followStatus" placeholder="选择状态" clearable>
                    <el-option label="待跟进" value="pending" />
                    <el-option label="跟进中" value="following" />
                    <el-option label="已成交" value="closed" />
                    <el-option label="已流失" value="lost" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="负责人">
                  <el-select v-model="searchForm.assignee" placeholder="选择负责人" clearable>
                    <el-option label="张老师" value="teacher_zhang" />
                    <el-option label="李老师" value="teacher_li" />
                    <el-option label="王老师" value="teacher_wang" />
                    <el-option label="刘老师" value="teacher_liu" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="孩子年龄">
                  <el-select v-model="searchForm.childAge" placeholder="选择年龄" clearable>
                    <el-option label="2-3岁" value="2-3" />
                    <el-option label="3-4岁" value="3-4" />
                    <el-option label="4-5岁" value="4-5" />
                    <el-option label="5-6岁" value="5-6" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="创建时间">
                  <el-date-picker
                    v-model="searchForm.createDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="最后跟进">
                  <el-date-picker
                    v-model="searchForm.lastFollowDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="客户标签">
                  <el-select v-model="searchForm.tags" placeholder="选择标签" multiple clearable>
                    <el-option label="高意向" value="high_intent" />
                    <el-option label="价格敏感" value="price_sensitive" />
                    <el-option label="VIP客户" value="vip" />
                    <el-option label="重点关注" value="key_focus" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <!-- 搜索按钮 -->
          <el-row>
            <el-col :span="24">
              <div class="search-actions">
                <el-button type="primary" @click="handleSearch" :loading="searching">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
                <el-button @click="handleSaveSearch" v-if="hasSearchResults">
                  <el-icon><Star /></el-icon>
                  保存搜索
                </el-button>
                <el-button @click="handleExport" v-if="hasSearchResults">
                  <el-icon><Download /></el-icon>
                  导出结果
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 快速筛选 -->
    <div class="quick-filters">
      <el-card shadow="never">
        <template #header>
          <span>快速筛选</span>
        </template>
        
        <div class="filter-tags">
          <el-tag
            v-for="filter in quickFilters"
            :key="filter.key"
            :type="filter.active ? 'primary' : ''"
            :effect="filter.active ? 'dark' : 'plain'"
            @click="handleQuickFilter(filter)"
            class="filter-tag"
          >
            <el-icon><component :is="filter.icon" /></el-icon>
            {{ filter.label }}
            <span class="filter-count">({{ filter.count }})</span>
          </el-tag>
        </div>
      </el-card>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <el-card shadow="never">
        <template #header>
          <div class="results-header">
            <span>搜索结果 ({{ searchResults.length }})</span>
            <div class="view-controls">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="list">列表视图</el-radio-button>
                <el-radio-button label="card">卡片视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        
        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" v-loading="searching">
          <el-table
            :data="paginatedResults"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="name" label="客户姓名" min-width="100" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="email" label="邮箱" width="180" />
            
            <el-table-column label="客户状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="客户来源" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getSourceTagType(row.source)" size="small">
                  {{ getSourceText(row.source) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="childName" label="孩子姓名" width="100" />
            <el-table-column prop="childAge" label="孩子年龄" width="80" align="center">
              <template #default="{ row }">
                {{ row.childAge }}岁
              </template>
            </el-table-column>
            
            <el-table-column prop="assignee" label="负责人" width="100" />
            
            <el-table-column label="最后跟进" width="120">
              <template #default="{ row }">
                {{ formatDate(row.lastFollowDate) }}
              </template>
            </el-table-column>
            
            <el-table-column label="下次跟进" width="120">
              <template #default="{ row }">
                {{ formatDate(row.nextFollowDate) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleView(row)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="handleFollow(row)">
                  跟进
                </el-button>
                <el-button type="text" size="small" @click="handleCall(row)">
                  拨打
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 卡片视图 -->
        <div v-else class="card-view" v-loading="searching">
          <div class="customer-cards">
            <el-card
              v-for="customer in paginatedResults"
              :key="customer.id"
              class="customer-card"
              shadow="hover"
              @click="handleView(customer)"
            >
              <div class="card-content">
                <div class="customer-header">
                  <div class="customer-avatar">
                    <el-avatar :size="50">
                      {{ getAvatarText(customer.name) }}
                    </el-avatar>
                  </div>
                  
                  <div class="customer-basic">
                    <h4 class="customer-name">{{ customer.name }}</h4>
                    <p class="customer-phone">{{ customer.phone }}</p>
                    <p class="customer-email">{{ customer.email }}</p>
                  </div>
                  
                  <div class="customer-status">
                    <el-tag :type="getStatusTagType(customer.status)" size="small">
                      {{ getStatusText(customer.status) }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="customer-details">
                  <div class="detail-row">
                    <span class="label">孩子信息:</span>
                    <span class="value">{{ customer.childName }} ({{ customer.childAge }}岁)</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">客户来源:</span>
                    <el-tag :type="getSourceTagType(customer.source)" size="small">
                      {{ getSourceText(customer.source) }}
                    </el-tag>
                  </div>
                  <div class="detail-row">
                    <span class="label">负责人:</span>
                    <span class="value">{{ customer.assignee }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">最后跟进:</span>
                    <span class="value">{{ formatDate(customer.lastFollowDate) }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <el-button size="small" @click.stop="handleEdit(customer)">编辑</el-button>
                  <el-button size="small" @click.stop="handleFollow(customer)">跟进</el-button>
                  <el-button size="small" @click.stop="handleCall(customer)">拨打</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="searchResults.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="searchResults.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
        
        <!-- 空状态 -->
        <div v-if="!searching && searchResults.length === 0 && hasSearched" class="empty-state">
          <el-empty description="未找到符合条件的客户">
            <el-button type="primary" @click="handleReset">重新搜索</el-button>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search, User, Phone, Refresh, Star, Download, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import { get } from '@/utils/request'
import { formatDate } from '@/utils/date'

// 路由
const router = useRouter()

// 响应式数据
const searching = ref(false)
const hasSearched = ref(false)
const showAdvanced = ref(false)
const viewMode = ref('list')
const selectedCustomers = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  status: '',
  source: '',
  followStatus: '',
  assignee: '',
  childAge: '',
  createDate: [],
  lastFollowDate: [],
  tags: []
})

// 搜索统计
const searchStats = reactive({
  total: 0,
  potential: 0,
  converted: 0,
  time: 0
})

// 快速筛选
const quickFilters = ref([
  { key: 'all', label: '全部客户', icon: 'User', count: 0, active: false },
  { key: 'potential', label: '潜在客户', icon: 'Clock', count: 0, active: false },
  { key: 'interested', label: '意向客户', icon: 'Star', count: 0, active: false },
  { key: 'converted', label: '成交客户', icon: 'Check', count: 0, active: false },
  { key: 'pending', label: '待跟进', icon: 'Warning', count: 0, active: false }
])

// 搜索结果
const searchResults = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 计算属性
const hasSearchResults = computed(() => searchResults.value.length > 0)

const paginatedResults = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return searchResults.value.slice(start, end)
})

// 方法
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = async () => {
  searching.value = true
  hasSearched.value = true
  const startTime = Date.now()
  
  try {
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成模拟搜索结果
    const mockResults = generateMockResults()
    searchResults.value = mockResults
    
    // 更新统计信息
    searchStats.total = mockResults.length
    searchStats.potential = mockResults.filter(c => c.status === 'potential').length
    searchStats.converted = mockResults.filter(c => c.status === 'converted').length
    searchStats.time = Date.now() - startTime
    
    // 重置分页
    pagination.currentPage = 1
    
    ElMessage.success(`找到 ${mockResults.length} 位客户`)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

const generateMockResults = () => {
  // 生成模拟客户数据
  const mockCustomers = []
  const names = ['张女士', '李先生', '王女士', '刘先生', '陈女士', '赵先生', '孙女士', '周先生']
  const statuses = ['potential', 'interested', 'converted', 'lost']
  const sources = ['online', 'referral', 'offline', 'telemarketing', 'other']
  const assignees = ['张老师', '李老师', '王老师', '刘老师']
  
  for (let i = 0; i < 60; i++) {
    mockCustomers.push({
      id: i + 1,
      name: names[i % names.length] + (i + 1),
      phone: `138${String(i + 1).padStart(8, '0')}`,
      email: `customer${i + 1}@example.com`,
      status: statuses[i % statuses.length],
      source: sources[i % sources.length],
      childName: '小' + names[i % names.length].charAt(0) + (i + 1),
      childAge: 3 + (i % 4),
      assignee: assignees[i % assignees.length],
      lastFollowDate: new Date(2024, 0, (i % 30) + 1).toISOString().split('T')[0],
      nextFollowDate: new Date(2024, 1, (i % 28) + 1).toISOString().split('T')[0],
      createDate: new Date(2023, i % 12, (i % 28) + 1).toISOString().split('T')[0]
    })
  }
  
  return mockCustomers.filter(customer => {
    // 应用搜索条件
    if (searchForm.name && !customer.name.includes(searchForm.name)) return false
    if (searchForm.phone && !customer.phone.includes(searchForm.phone)) return false
    if (searchForm.status && customer.status !== searchForm.status) return false
    if (searchForm.source && customer.source !== searchForm.source) return false
    if (searchForm.assignee && customer.assignee !== searchForm.assignee) return false
    
    return true
  })
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    status: '',
    source: '',
    followStatus: '',
    assignee: '',
    childAge: '',
    createDate: [],
    lastFollowDate: [],
    tags: []
  })
  
  searchResults.value = []
  hasSearched.value = false
  searchStats.total = 0
  searchStats.potential = 0
  searchStats.converted = 0
  searchStats.time = 0
  
  // 重置快速筛选
  quickFilters.value.forEach(filter => {
    filter.active = false
  })
}

const handleQuickFilter = (filter: any) => {
  // 重置其他筛选
  quickFilters.value.forEach(f => {
    f.active = f.key === filter.key
  })
  
  // 应用快速筛选
  switch (filter.key) {
    case 'potential':
      searchForm.status = 'potential'
      break
    case 'interested':
      searchForm.status = 'interested'
      break
    case 'converted':
      searchForm.status = 'converted'
      break
    case 'pending':
      searchForm.followStatus = 'pending'
      break
    default:
      handleReset()
      return
  }
  
  handleSearch()
}

const handleSelectionChange = (selection: any[]) => {
  selectedCustomers.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const handleView = (customer: any) => {
  router.push(`/customer/detail/${customer.id}`)
}

const handleEdit = (customer: any) => {
  router.push(`/customer/edit/${customer.id}`)
}

const handleFollow = (customer: any) => {
  ElMessage.info(`跟进客户: ${customer.name}`)
}

const handleCall = (customer: any) => {
  ElMessage.info(`拨打电话: ${customer.phone}`)
}

const handleSaveSearch = () => {
  ElMessage.info('保存搜索功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 工具方法
const getAvatarText = (name: string) => {
  return name.charAt(0)
}

const getStatusText = (status: string) => {
  const statusMap = {
    'potential': '潜在客户',
    'interested': '意向客户',
    'converted': '成交客户',
    'lost': '流失客户'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    'potential': 'info',
    'interested': 'warning',
    'converted': 'success',
    'lost': 'danger'
  }
  return typeMap[status] || 'info'
}

const getSourceText = (source: string) => {
  const sourceMap = {
    'online': '线上推广',
    'referral': '朋友推荐',
    'offline': '地推活动',
    'telemarketing': '电话营销',
    'other': '其他'
  }
  return sourceMap[source] || '未知'
}

const getSourceTagType = (source: string) => {
  const typeMap = {
    'online': 'primary',
    'referral': 'success',
    'offline': 'warning',
    'telemarketing': 'info',
    'other': 'danger'
  }
  return typeMap[source] || 'info'
}

// 生命周期
onMounted(() => {
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search)
  const keyword = urlParams.get('q')
  if (keyword) {
    searchForm.name = keyword
    handleSearch()
  }
})
</script>

<style lang="scss">
.customer-search-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-3xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-sm);
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-stats {
      display: flex;
      gap: var(--spacing-5xl);
    }
  }
}

.advanced-search {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .toggle-btn {
      margin-left: auto;
    }
  }
  
  .search-form {
    .advanced-options {
      margin-top: var(--text-2xl);
      padding-top: var(--text-2xl);
      border-top: var(--border-width-base) solid #f3f4f6;
    }
    
    .search-actions {
      display: flex;
      gap: var(--text-sm);
      justify-content: center;
      margin-top: var(--text-2xl);
      padding-top: var(--text-2xl);
      border-top: var(--border-width-base) solid #f3f4f6;
    }
  }
}

.quick-filters {
  margin-bottom: var(--text-3xl);
  
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--text-sm);
    
    .filter-tag {
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
      }
      
      .filter-count {
        margin-left: var(--spacing-xs);
        opacity: 0.7;
      }
    }
  }
}

.search-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-view {
    .customer-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--text-2xl);
      
      .customer-card {
        cursor: pointer;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-var(--spacing-xs));
        }
        
        .card-content {
          .customer-header {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            margin-bottom: var(--text-lg);
            
            .customer-basic {
              flex: 1;
              
              .customer-name {
                font-size: var(--text-lg);
                font-weight: 600;
                color: var(--text-primary);
                margin: 0 0 var(--spacing-xs) 0;
              }
              
              .customer-phone,
              .customer-email {
                font-size: var(--text-sm);
                color: var(--text-secondary);
                margin: var(--spacing-sm) 0;
              }
            }
          }
          
          .customer-details {
            margin-bottom: var(--text-lg);
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--spacing-sm);
              
              .label {
                font-size: var(--text-sm);
                color: var(--text-tertiary);
              }
              
              .value {
                font-size: var(--text-sm);
                color: var(--color-gray-700);
              }
            }
          }
          
          .card-actions {
            display: flex;
            gap: var(--spacing-sm);
            justify-content: center;
          }
        }
      }
    }
  }
  
  .pagination-wrapper {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: center;
  }
  
  .empty-state {
    text-align: center;
    padding: var(--spacing-15xl) var(--text-2xl);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .customer-search-container {
    padding: var(--text-lg);
  }
  
  .search-header .header-content {
    flex-direction: column;
    gap: var(--text-2xl);
    text-align: center;
    
    .header-stats {
      flex-direction: column;
      gap: var(--text-lg);
    }
  }
  
  .search-form {
    .el-col {
      margin-bottom: var(--text-lg);
    }
    
    .search-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
  
  .filter-tags {
    justify-content: center;
  }
  
  .customer-cards {
    grid-template-columns: 1fr;
  }
}
</style>
