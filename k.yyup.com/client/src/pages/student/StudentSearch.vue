<template>
  <div class="student-search-container">
    <!-- 页面头部 -->
    <div class="search-header">
      <div class="header-content">
        <div class="page-title">
          <h1>学生搜索</h1>
          <p>快速查找和筛选学生信息</p>
        </div>
        <div class="header-stats">
          <el-statistic title="搜索结果" :value="searchStats.total" />
          <el-statistic title="在读学生" :value="searchStats.active" />
          <el-statistic title="搜索用时" :value="searchStats.time" suffix="ms" />
        </div>
      </div>
    </div>

    <!-- 高级搜索表单 -->
    <div class="advanced-search">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="Search" />
            <span>高级搜索</span>
            <el-button 
              type="text" 
              @click="toggleAdvanced"
              class="toggle-btn"
            >
              {{ showAdvanced ? '收起' : '展开' }}
              <UnifiedIcon name="ArrowDown" />
            </el-button>
          </div>
        </template>
        
        <el-form :model="searchForm" label-width="100px" class="search-form">
          <!-- 基础搜索 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="学生姓名">
                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入学生姓名"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <UnifiedIcon name="default" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="学号">
                <el-input
                  v-model="searchForm.studentId"
                  placeholder="请输入学号"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <UnifiedIcon name="default" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="班级">
                <el-select
                  v-model="searchForm.classId"
                  placeholder="选择班级"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="cls in classList"
                    :key="cls.id"
                    :label="cls.name"
                    :value="cls.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- 高级搜索选项 -->
          <div v-show="showAdvanced" class="advanced-options">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="性别">
                  <el-select v-model="searchForm.gender" placeholder="选择性别" clearable>
                    <el-option label="男" value="MALE" />
                    <el-option label="女" value="FEMALE" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="年龄范围">
                  <el-select v-model="searchForm.ageRange" placeholder="选择年龄" clearable>
                    <el-option label="3-4岁" value="3-4" />
                    <el-option label="4-5岁" value="4-5" />
                    <el-option label="5-6岁" value="5-6" />
                    <el-option label="6岁以上" value="6+" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="学生状态">
                  <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                    <el-option label="在读" value="ACTIVE" />
                    <el-option label="请假" value="LEAVE" />
                    <el-option label="毕业" value="GRADUATED" />
                    <el-option label="转学" value="TRANSFERRED" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="6">
                <el-form-item label="入学时间">
                  <el-date-picker
                    v-model="searchForm.enrollmentDate"
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
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="家长姓名">
                  <el-input
                    v-model="searchForm.parentName"
                    placeholder="请输入家长姓名"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="家长电话">
                  <el-input
                    v-model="searchForm.parentPhone"
                    placeholder="请输入家长电话"
                    clearable
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="特殊标记">
                  <el-select v-model="searchForm.tags" placeholder="选择标记" multiple clearable>
                    <el-option label="特殊关注" value="special_care" />
                    <el-option label="过敏体质" value="allergy" />
                    <el-option label="优秀学生" value="excellent" />
                    <el-option label="新生" value="new_student" />
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
                  <UnifiedIcon name="Search" />
                  搜索
                </el-button>
                <el-button @click="handleReset">
                  <UnifiedIcon name="Refresh" />
                  重置
                </el-button>
                <el-button @click="handleSaveSearch" v-if="hasSearchResults">
                  <UnifiedIcon name="default" />
                  保存搜索
                </el-button>
                <el-button @click="handleExport" v-if="hasSearchResults">
                  <UnifiedIcon name="Download" />
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
            <UnifiedIcon name="default" />
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
          <div class="table-wrapper">
<el-table class="responsive-table"
            :data="paginatedResults"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="头像" width="80" align="center">
              <template #default="{ row }">
                <el-avatar :size="40" :src="row.avatar">
                  {{ getAvatarText(row.name) }}
                </el-avatar>
              </template>
            </el-table-column>
            
            <el-table-column prop="name" label="姓名" min-width="100" />
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="className" label="班级" width="100" />
            
            <el-table-column label="性别" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'" size="small">
                  {{ row.gender === 'MALE' ? '男' : '女' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="年龄" width="80" align="center">
              <template #default="{ row }">
                {{ calculateAge(row.birthDate) }}岁
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="parentName" label="家长" width="100" />
            <el-table-column prop="parentPhone" label="联系电话" width="120" />
            
            <el-table-column label="入学时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.enrollmentDate) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleView(row)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="handleContact(row)">
                  联系
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
        
        <!-- 卡片视图 -->
        <div v-else class="card-view" v-loading="searching">
          <div class="student-cards">
            <el-card
              v-for="student in paginatedResults"
              :key="student.id"
              class="student-card"
              shadow="hover"
              @click="handleView(student)"
            >
              <div class="card-content">
                <div class="student-avatar">
                  <el-avatar :size="60" :src="student.avatar">
                    {{ getAvatarText(student.name) }}
                  </el-avatar>
                </div>
                
                <div class="student-info">
                  <h4 class="student-name">{{ student.name }}</h4>
                  <p class="student-id">学号: {{ student.studentId }}</p>
                  <p class="student-class">班级: {{ student.className }}</p>
                  
                  <div class="student-tags">
                    <el-tag :type="student.gender === 'MALE' ? 'primary' : 'danger'" size="small">
                      {{ student.gender === 'MALE' ? '男' : '女' }}
                    </el-tag>
                    <el-tag size="small">{{ calculateAge(student.birthDate) }}岁</el-tag>
                    <el-tag :type="getStatusTagType(student.status)" size="small">
                      {{ getStatusText(student.status) }}
                    </el-tag>
                  </div>
                  
                  <div class="student-contact">
                    <p><UnifiedIcon name="default" /> {{ student.parentName }}</p>
                    <p><UnifiedIcon name="default" /> {{ student.parentPhone }}</p>
                  </div>
                </div>
                
                <div class="card-actions">
                  <el-button size="small" @click.stop="handleEdit(student)">编辑</el-button>
                  <el-button size="small" @click.stop="handleContact(student)">联系</el-button>
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
          <el-empty description="未找到符合条件的学生">
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
  Search, User, Postcard, Refresh, Star, Download, ArrowUp, ArrowDown, Phone
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
const selectedStudents = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  studentId: '',
  classId: '',
  gender: '',
  ageRange: '',
  status: '',
  enrollmentDate: [],
  parentName: '',
  parentPhone: '',
  tags: []
})

// 搜索统计
const searchStats = reactive({
  total: 0,
  active: 0,
  time: 0
})

// 班级列表
const classList = ref([
  { id: '1', name: '小班A' },
  { id: '2', name: '小班B' },
  { id: '3', name: '中班A' },
  { id: '4', name: '中班B' },
  { id: '5', name: '大班A' },
  { id: '6', name: '大班B' }
])

// 快速筛选
const quickFilters = ref([
  { key: 'all', label: '全部学生', icon: 'User', count: 0, active: false },
  { key: 'active', label: '在读学生', icon: 'Check', count: 0, active: false },
  { key: 'new', label: '新生', icon: 'Plus', count: 0, active: false },
  { key: 'special', label: '特殊关注', icon: 'Warning', count: 0, active: false },
  { key: 'excellent', label: '优秀学生', icon: 'star', count: 0, active: false }
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
    searchStats.active = mockResults.filter(s => s.status === 'ACTIVE').length
    searchStats.time = Date.now() - startTime
    
    // 重置分页
    pagination.currentPage = 1
    
    ElMessage.success(`找到 ${mockResults.length} 名学生`)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

const generateMockResults = () => {
  // 生成模拟学生数据
  const mockStudents = []
  const names = ['张小明', '李小红', '王小华', '刘小强', '陈小美', '赵小亮', '孙小丽', '周小刚']
  const statuses = ['ACTIVE', 'LEAVE', 'GRADUATED', 'TRANSFERRED']
  const genders = ['MALE', 'FEMALE']
  
  for (let i = 0; i < 50; i++) {
    mockStudents.push({
      id: i + 1,
      name: names[i % names.length] + (i + 1),
      studentId: `S${String(i + 1).padStart(4, '0')}`,
      className: classList.value[i % classList.value.length].name,
      gender: genders[i % 2],
      birthDate: new Date(2018 + Math.floor(i / 10), i % 12, (i % 28) + 1).toISOString().split('T')[0],
      status: statuses[i % statuses.length],
      parentName: '家长' + (i + 1),
      parentPhone: `138${String(i + 1).padStart(8, '0')}`,
      enrollmentDate: new Date(2023, i % 12, (i % 28) + 1).toISOString().split('T')[0],
      avatar: null
    })
  }
  
  return mockStudents.filter(student => {
    // 应用搜索条件
    if (searchForm.name && !student.name.includes(searchForm.name)) return false
    if (searchForm.studentId && !student.studentId.includes(searchForm.studentId)) return false
    if (searchForm.classId && student.className !== classList.value.find(c => c.id === searchForm.classId)?.name) return false
    if (searchForm.gender && student.gender !== searchForm.gender) return false
    if (searchForm.status && student.status !== searchForm.status) return false
    if (searchForm.parentName && !student.parentName.includes(searchForm.parentName)) return false
    if (searchForm.parentPhone && !student.parentPhone.includes(searchForm.parentPhone)) return false
    
    return true
  })
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    studentId: '',
    classId: '',
    gender: '',
    ageRange: '',
    status: '',
    enrollmentDate: [],
    parentName: '',
    parentPhone: '',
    tags: []
  })
  
  searchResults.value = []
  hasSearched.value = false
  searchStats.total = 0
  searchStats.active = 0
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
    case 'active':
      searchForm.status = 'ACTIVE'
      break
    case 'new':
      searchForm.tags = ['new_student']
      break
    case 'special':
      searchForm.tags = ['special_care']
      break
    case 'excellent':
      searchForm.tags = ['excellent']
      break
    default:
      handleReset()
      return
  }
  
  handleSearch()
}

const handleSelectionChange = (selection: any[]) => {
  selectedStudents.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const handleView = (student: any) => {
  router.push(`/student/detail/${student.id}`)
}

const handleEdit = (student: any) => {
  router.push(`/student/edit/${student.id}`)
}

const handleContact = (student: any) => {
  ElMessage.info(`联系 ${student.parentName}: ${student.parentPhone}`)
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

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

const getStatusText = (status: string) => {
  const statusMap = {
    'ACTIVE': '在读',
    'LEAVE': '请假',
    'GRADUATED': '毕业',
    'TRANSFERRED': '转学'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    'ACTIVE': 'success',
    'LEAVE': 'warning',
    'GRADUATED': 'info',
    'TRANSFERRED': 'danger'
  }
  return typeMap[status] || 'info'
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
.student-search-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
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
      border-top: var(--z-index-dropdown) solid #f3f4f6;
    }
    
    .search-actions {
      display: flex;
      gap: var(--text-sm);
      justify-content: center;
      margin-top: var(--text-2xl);
      padding-top: var(--text-2xl);
      border-top: var(--z-index-dropdown) solid #f3f4f6;
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
        transform: translateY(var(--transform-hover-lift));
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
    .student-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--text-2xl);
      
      .student-card {
        cursor: pointer;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-var(--spacing-xs));
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          
          .student-avatar {
            margin-bottom: var(--text-lg);
          }
          
          .student-info {
            flex: 1;
            width: 100%;
            
            .student-name {
              font-size: var(--text-xl);
              font-weight: 600;
              color: var(--text-primary);
              margin: 0 0 var(--spacing-sm) 0;
            }
            
            .student-id,
            .student-class {
              font-size: var(--text-base);
              color: var(--text-secondary);
              margin: var(--spacing-xs) 0;
            }
            
            .student-tags {
              display: flex;
              justify-content: center;
              gap: var(--spacing-sm);
              margin: var(--text-sm) 0;
            }
            
            .student-contact {
              margin-top: var(--text-sm);
              
              p {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-xs);
                font-size: var(--text-sm);
                color: var(--text-tertiary);
                margin: var(--spacing-xs) 0;
              }
            }
          }
          
          .card-actions {
            margin-top: var(--text-lg);
            display: flex;
            gap: var(--spacing-sm);
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
  .student-search-container {
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
  
  .student-cards {
    grid-template-columns: 1fr;
  }
}
</style>
