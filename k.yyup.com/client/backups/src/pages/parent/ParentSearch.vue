<template>
  <div class="parent-search-container">
    <!-- 页面头部 -->
    <div class="search-header">
      <div class="header-content">
        <div class="page-title">
          <h1>家长搜索</h1>
          <p>快速查找和筛选家长信息</p>
        </div>
        <div class="header-stats">
          <el-statistic title="搜索结果" :value="searchStats.total" />
          <el-statistic title="在读家长" :value="searchStats.enrolled" />
          <el-statistic title="潜在家长" :value="searchStats.potential" />
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
              <el-form-item label="家长姓名">
                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入家长姓名"
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
              <el-form-item label="孩子姓名">
                <el-input
                  v-model="searchForm.childName"
                  placeholder="请输入孩子姓名"
                  clearable
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Avatar /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 高级搜索选项 -->
          <div v-show="showAdvanced">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="家长状态">
                  <el-select
                    v-model="searchForm.status"
                    placeholder="请选择家长状态"
                    clearable
                  >
                    <el-option label="全部" value="" />
                    <el-option label="在读" value="enrolled" />
                    <el-option label="潜在" value="potential" />
                    <el-option label="已毕业" value="graduated" />
                    <el-option label="已流失" value="lost" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="所在班级">
                  <el-select
                    v-model="searchForm.classId"
                    placeholder="请选择班级"
                    clearable
                  >
                    <el-option label="全部班级" value="" />
                    <el-option 
                      v-for="cls in classList" 
                      :key="cls.id" 
                      :label="cls.name" 
                      :value="cls.id" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="入园时间">
                  <el-date-picker
                    v-model="searchForm.enrollmentDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="家长类型">
                  <el-select
                    v-model="searchForm.parentType"
                    placeholder="请选择家长类型"
                    clearable
                  >
                    <el-option label="全部" value="" />
                    <el-option label="父亲" value="father" />
                    <el-option label="母亲" value="mother" />
                    <el-option label="爷爷" value="grandfather" />
                    <el-option label="奶奶" value="grandmother" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="居住区域">
                  <el-input
                    v-model="searchForm.address"
                    placeholder="请输入居住区域"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Location /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="标签">
                  <el-select
                    v-model="searchForm.tags"
                    placeholder="请选择标签"
                    multiple
                    clearable
                  >
                    <el-option 
                      v-for="tag in tagList" 
                      :key="tag.id" 
                      :label="tag.name" 
                      :value="tag.id" 
                    />
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
                <el-button @click="handleExport" :loading="exporting">
                  <el-icon><Download /></el-icon>
                  导出结果
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <el-card shadow="never">
        <template #header>
          <div class="section-header">
            <el-icon><List /></el-icon>
            <span>搜索结果 ({{ searchStats.total }})</span>
            <div class="result-actions">
              <el-button-group>
                <el-button 
                  :type="viewMode === 'table' ? 'primary' : ''" 
                  @click="viewMode = 'table'"
                >
                  <el-icon><Grid /></el-icon>
                  表格视图
                </el-button>
                <el-button 
                  :type="viewMode === 'card' ? 'primary' : ''" 
                  @click="viewMode = 'card'"
                >
                  <el-icon><Postcard /></el-icon>
                  卡片视图
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'">
          <el-table 
            :data="parentList" 
            v-loading="searching"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="家长姓名" width="120" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="childName" label="孩子姓名" width="120" />
            <el-table-column prop="className" label="所在班级" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="parentType" label="家长类型" width="100" />
            <el-table-column prop="address" label="居住区域" show-overflow-tooltip />
            <el-table-column prop="enrollmentDate" label="入园时间" width="120" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewDetail(row)">
                  查看详情
                </el-button>
                <el-button type="success" size="small" @click="editParent(row)">
                  编辑
                </el-button>
                <el-button type="info" size="small" @click="contactParent(row)">
                  联系
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="searchStats.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col :span="8" v-for="parent in parentList" :key="parent.id">
              <el-card class="parent-card" shadow="hover">
                <div class="parent-info">
                  <div class="parent-avatar">
                    <el-avatar :size="60" :src="parent.avatar">
                      {{ parent.name.charAt(0) }}
                    </el-avatar>
                  </div>
                  <div class="parent-details">
                    <h3>{{ parent.name }}</h3>
                    <p><el-icon><Phone /></el-icon> {{ parent.phone }}</p>
                    <p><el-icon><Avatar /></el-icon> {{ parent.childName }}</p>
                    <p><el-icon><School /></el-icon> {{ parent.className }}</p>
                    <div class="parent-tags">
                      <el-tag :type="getStatusType(parent.status)" size="small">
                        {{ getStatusText(parent.status) }}
                      </el-tag>
                      <el-tag size="small">{{ parent.parentType }}</el-tag>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewDetail(parent)">
                    查看详情
                  </el-button>
                  <el-button type="success" size="small" @click="editParent(parent)">
                    编辑
                  </el-button>
                  <el-button type="info" size="small" @click="contactParent(parent)">
                    联系
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!searching && parentList.length === 0" description="暂无搜索结果" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, User, Phone, Avatar, Location, Refresh, Download, 
  List, Grid, Postcard, ArrowUp, ArrowDown, School 
} from '@element-plus/icons-vue'

// 响应式数据
const showAdvanced = ref(false)
const searching = ref(false)
const exporting = ref(false)
const viewMode = ref('table')

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  childName: '',
  status: '',
  classId: '',
  enrollmentDate: [],
  parentType: '',
  address: '',
  tags: []
})

// 搜索统计
const searchStats = reactive({
  total: 0,
  enrolled: 0,
  potential: 0,
  time: 0
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 数据列表
const parentList = ref([])
const classList = ref([])
const tagList = ref([])
const selectedParents = ref([])

// 方法
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = async () => {
  searching.value = true
  const startTime = Date.now()
  
  try {
    // 模拟搜索API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟搜索结果
    parentList.value = [
      {
        id: 1,
        name: '张三',
        phone: '13800138001',
        childName: '张小明',
        className: '大班A',
        status: 'enrolled',
        parentType: '父亲',
        address: '朝阳区',
        enrollmentDate: '2023-09-01',
        avatar: ''
      },
      {
        id: 2,
        name: '李四',
        phone: '13800138002',
        childName: '李小红',
        className: '中班B',
        status: 'potential',
        parentType: '母亲',
        address: '海淀区',
        enrollmentDate: '2024-01-15',
        avatar: ''
      }
    ]
    
    searchStats.total = parentList.value.length
    searchStats.enrolled = parentList.value.filter(p => p.status === 'enrolled').length
    searchStats.potential = parentList.value.filter(p => p.status === 'potential').length
    searchStats.time = Date.now() - startTime
    
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索失败：' + error.message)
  } finally {
    searching.value = false
  }
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  parentList.value = []
  searchStats.total = 0
  searchStats.enrolled = 0
  searchStats.potential = 0
  searchStats.time = 0
}

const handleExport = async () => {
  if (parentList.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  exporting.value = true
  try {
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  } finally {
    exporting.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedParents.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.page = page
  handleSearch()
}

const getStatusType = (status) => {
  const types = {
    enrolled: 'success',
    potential: 'warning',
    graduated: 'info',
    lost: 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    enrolled: '在读',
    potential: '潜在',
    graduated: '已毕业',
    lost: '已流失'
  }
  return texts[status] || status
}

const viewDetail = (parent) => {
  // 跳转到家长详情页
  console.log('查看家长详情:', parent)
}

const editParent = (parent) => {
  // 跳转到家长编辑页
  console.log('编辑家长:', parent)
}

const contactParent = (parent) => {
  // 联系家长
  console.log('联系家长:', parent)
}

// 初始化数据
onMounted(async () => {
  // 加载班级列表
  classList.value = [
    { id: 1, name: '大班A' },
    { id: 2, name: '大班B' },
    { id: 3, name: '中班A' },
    { id: 4, name: '中班B' },
    { id: 5, name: '小班A' },
    { id: 6, name: '小班B' }
  ]
  
  // 加载标签列表
  tagList.value = [
    { id: 1, name: 'VIP家长' },
    { id: 2, name: '积极配合' },
    { id: 3, name: '需要关注' },
    { id: 4, name: '意向强烈' }
  ]
})
</script>

<style scoped>
.parent-search-container {
  padding: var(--text-2xl);
}

.search-header {
  margin-bottom: var(--text-2xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title h1 {
  margin: 0;
  color: var(--text-primary);
}

.page-title p {
  margin: var(--spacing-base) 0 0 0;
  color: var(--info-color);
}

.header-stats {
  display: flex;
  gap: var(--spacing-5xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header span {
  margin-left: var(--spacing-sm);
  font-weight: 500;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.search-actions {
  text-align: center;
  margin-top: var(--text-2xl);
}

.search-actions .el-button {
  margin: 0 var(--spacing-sm);
}

.search-results {
  margin-top: var(--text-2xl);
}

.result-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.pagination-container {
  margin-top: var(--text-2xl);
  text-align: center;
}

.card-view {
  margin-top: var(--text-2xl);
}

.parent-card {
  margin-bottom: var(--text-2xl);
}

.parent-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.parent-avatar {
  margin-right: var(--spacing-4xl);
}

.parent-details h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.parent-details p {
  margin: var(--spacing-xs) 0;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.parent-tags {
  margin-top: var(--spacing-sm);
}

.parent-tags .el-tag {
  margin-right: var(--spacing-sm);
}

.card-actions {
  text-align: center;
}

.card-actions .el-button {
  margin: 0 var(--spacing-xs);
}
</style>
