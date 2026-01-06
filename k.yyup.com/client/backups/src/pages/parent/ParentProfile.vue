<template>
  <div class="parent-profile-container">
    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="header-content">
        <div class="page-title">
          <h1>家长档案</h1>
          <p>查看和管理家长的详细档案信息</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh" :loading="refreshing">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            <el-icon><Download /></el-icon>
            导出档案
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-card shadow="never">
        <el-form :model="searchForm" inline class="search-form">
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
          <el-form-item label="家长状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="在读" value="enrolled" />
              <el-option label="潜在" value="potential" />
              <el-option label="已毕业" value="graduated" />
              <el-option label="已流失" value="lost" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="searching">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 档案列表 -->
    <div class="profile-list">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>家长档案列表 ({{ profileStats.total }})</span>
            <div class="header-stats">
              <el-statistic title="在读家长" :value="profileStats.enrolled" />
              <el-statistic title="潜在家长" :value="profileStats.potential" />
              <el-statistic title="已毕业" :value="profileStats.graduated" />
            </div>
          </div>
        </template>

        <!-- 档案卡片视图 -->
        <div class="profile-grid" v-loading="searching">
          <div 
            v-for="parent in parentList" 
            :key="parent.id" 
            class="profile-card"
            @click="viewProfile(parent)"
          >
            <div class="card-header">
              <div class="parent-avatar">
                <el-avatar :size="60" :src="parent.avatar">
                  {{ parent.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="parent-basic">
                <h3>{{ parent.name }}</h3>
                <p><el-icon><Phone /></el-icon> {{ parent.phone }}</p>
                <el-tag :type="getStatusType(parent.status)" size="small">
                  {{ getStatusText(parent.status) }}
                </el-tag>
              </div>
            </div>
            
            <div class="card-content">
              <div class="info-row">
                <span class="label">孩子姓名：</span>
                <span class="value">{{ parent.childName || '未填写' }}</span>
              </div>
              <div class="info-row">
                <span class="label">所在班级：</span>
                <span class="value">{{ parent.className || '未分配' }}</span>
              </div>
              <div class="info-row">
                <span class="label">入园时间：</span>
                <span class="value">{{ parent.enrollmentDate || '未入园' }}</span>
              </div>
              <div class="info-row">
                <span class="label">居住地址：</span>
                <span class="value">{{ parent.address || '未填写' }}</span>
              </div>
              <div class="info-row">
                <span class="label">家长类型：</span>
                <span class="value">{{ parent.parentType || '未填写' }}</span>
              </div>
              <div class="info-row">
                <span class="label">最后联系：</span>
                <span class="value">{{ parent.lastContact || '无记录' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="tags">
                <el-tag 
                  v-for="tag in parent.tags" 
                  :key="tag" 
                  size="small" 
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="actions">
                <el-button type="primary" size="small" @click.stop="viewDetail(parent)">
                  查看详情
                </el-button>
                <el-button type="success" size="small" @click.stop="editParent(parent)">
                  编辑
                </el-button>
                <el-button type="info" size="small" @click.stop="contactParent(parent)">
                  联系
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!searching && parentList.length === 0" description="暂无家长档案" />

        <!-- 分页 -->
        <div class="pagination-container" v-if="parentList.length > 0">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[12, 24, 48, 96]"
            :total="profileStats.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 档案详情弹窗 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="家长档案详情"
      width="800px"
      :before-close="handleCloseDialog"
    >
      <div v-if="selectedParent" class="profile-detail">
        <div class="detail-header">
          <div class="parent-info">
            <el-avatar :size="80" :src="selectedParent.avatar">
              {{ selectedParent.name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <h2>{{ selectedParent.name }}</h2>
              <p>{{ selectedParent.phone }}</p>
              <el-tag :type="getStatusType(selectedParent.status)">
                {{ getStatusText(selectedParent.status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">家长姓名：</span>
                <span class="value">{{ selectedParent.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ selectedParent.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">家长类型：</span>
                <span class="value">{{ selectedParent.parentType }}</span>
              </div>
              <div class="info-item">
                <span class="label">孩子姓名：</span>
                <span class="value">{{ selectedParent.childName }}</span>
              </div>
              <div class="info-item">
                <span class="label">所在班级：</span>
                <span class="value">{{ selectedParent.className }}</span>
              </div>
              <div class="info-item">
                <span class="label">入园时间：</span>
                <span class="value">{{ selectedParent.enrollmentDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">居住地址：</span>
                <span class="value">{{ selectedParent.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册时间：</span>
                <span class="value">{{ selectedParent.registerDate }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="联系记录" name="contact">
            <div class="contact-records">
              <div v-for="record in selectedParent.contactRecords" :key="record.id" class="record-item">
                <div class="record-header">
                  <span class="record-type">{{ record.type }}</span>
                  <span class="record-date">{{ record.date }}</span>
                </div>
                <div class="record-content">{{ record.content }}</div>
              </div>
              <el-empty v-if="!selectedParent.contactRecords?.length" description="暂无联系记录" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="孩子信息" name="children">
            <div class="children-info">
              <div v-for="child in selectedParent.children" :key="child.id" class="child-item">
                <div class="child-basic">
                  <h4>{{ child.name }}</h4>
                  <p>年龄：{{ child.age }}岁</p>
                  <p>班级：{{ child.className }}</p>
                </div>
              </div>
              <el-empty v-if="!selectedParent.children?.length" description="暂无孩子信息" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="备注信息" name="notes">
            <div class="notes-section">
              <el-input
                v-model="selectedParent.notes"
                type="textarea"
                :rows="6"
                placeholder="请输入备注信息..."
                readonly
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="profileDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editSelectedParent">编辑档案</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, User, Phone, Refresh, Download 
} from '@element-plus/icons-vue'

// 响应式数据
const searching = ref(false)
const refreshing = ref(false)
const exporting = ref(false)
const profileDialogVisible = ref(false)
const activeTab = ref('basic')

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  status: ''
})

// 档案统计
const profileStats = reactive({
  total: 0,
  enrolled: 0,
  potential: 0,
  graduated: 0
})

// 分页
const pagination = reactive({
  page: 1,
  size: 12
})

// 数据列表
const parentList = ref([])
const selectedParent = ref(null)

// 方法
const handleSearch = async () => {
  searching.value = true
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
        address: '朝阳区某某小区',
        enrollmentDate: '2023-09-01',
        registerDate: '2023-08-15',
        lastContact: '2024-01-20',
        avatar: '',
        tags: ['VIP家长', '积极配合'],
        contactRecords: [
          { id: 1, type: '电话', date: '2024-01-20', content: '询问孩子在园情况' }
        ],
        children: [
          { id: 1, name: '张小明', age: 5, className: '大班A' }
        ],
        notes: '家长很关心孩子的学习情况，经常主动联系老师。'
      },
      {
        id: 2,
        name: '李四',
        phone: '13800138002',
        childName: '李小红',
        className: '中班B',
        status: 'potential',
        parentType: '母亲',
        address: '海淀区某某街道',
        enrollmentDate: '',
        registerDate: '2024-01-10',
        lastContact: '2024-01-18',
        avatar: '',
        tags: ['意向强烈'],
        contactRecords: [
          { id: 1, type: '微信', date: '2024-01-18', content: '咨询入园事宜' }
        ],
        children: [
          { id: 1, name: '李小红', age: 4, className: '待分配' }
        ],
        notes: '有强烈的入园意向，正在考虑中。'
      }
    ]
    
    profileStats.total = parentList.value.length
    profileStats.enrolled = parentList.value.filter(p => p.status === 'enrolled').length
    profileStats.potential = parentList.value.filter(p => p.status === 'potential').length
    profileStats.graduated = parentList.value.filter(p => p.status === 'graduated').length
    
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索失败：' + error.message)
  } finally {
    searching.value = false
  }
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  parentList.value = []
  profileStats.total = 0
  profileStats.enrolled = 0
  profileStats.potential = 0
  profileStats.graduated = 0
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await handleSearch()
  } finally {
    refreshing.value = false
  }
}

const handleExport = async () => {
  if (parentList.value.length === 0) {
    ElMessage.warning('没有可导出的档案数据')
    return
  }
  
  exporting.value = true
  try {
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('档案导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  } finally {
    exporting.value = false
  }
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

const viewProfile = (parent) => {
  selectedParent.value = parent
  profileDialogVisible.value = true
  activeTab.value = 'basic'
}

const viewDetail = (parent) => {
  // 跳转到家长详情页
  console.log('查看家长详情:', parent)
}

const editParent = (parent) => {
  // 跳转到家长编辑页
  console.log('编辑家长:', parent)
}

const editSelectedParent = () => {
  if (selectedParent.value) {
    editParent(selectedParent.value)
    profileDialogVisible.value = false
  }
}

const contactParent = (parent) => {
  // 联系家长
  console.log('联系家长:', parent)
}

const handleCloseDialog = () => {
  profileDialogVisible.value = false
  selectedParent.value = null
}

// 初始化数据
onMounted(async () => {
  await handleSearch()
})
</script>

<style scoped>
.parent-profile-container {
  padding: var(--text-2xl);
}

.profile-header {
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

.header-actions {
  display: flex;
  gap: var(--spacing-2xl);
}

.search-section {
  margin-bottom: var(--text-2xl);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-stats {
  display: flex;
  gap: var(--spacing-5xl);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--text-2xl);
  margin-top: var(--text-2xl);
}

.profile-card {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  cursor: pointer;
  transition: all 0.3s;
}

.profile-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
}

.profile-card .card-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.parent-avatar {
  margin-right: var(--spacing-4xl);
}

.parent-basic h3 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.parent-basic p {
  margin: var(--spacing-base) 0;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.card-content {
  margin: var(--spacing-4xl) 0;
}

.info-row {
  display: flex;
  margin-bottom: var(--spacing-sm);
}

.info-row .label {
  width: 80px;
  color: var(--info-color);
  font-size: var(--text-base);
}

.info-row .value {
  flex: 1;
  color: var(--text-primary);
  font-size: var(--text-base);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-4xl);
  padding-top: var(--spacing-4xl);
  border-top: var(--border-width-base) solid var(--bg-gray-light);
}

.tags {
  display: flex;
  gap: var(--spacing-base);
}

.tag-item {
  font-size: var(--text-sm);
}

.actions {
  display: flex;
  gap: var(--spacing-base);
}

.pagination-container {
  margin-top: var(--text-2xl);
  text-align: center;
}

.profile-detail .detail-header {
  margin-bottom: var(--text-2xl);
}

.parent-info {
  display: flex;
  align-items: center;
  gap: var(--text-2xl);
}

.parent-info .info h2 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.parent-info .info p {
  margin: var(--spacing-base) 0;
  color: var(--text-regular);
}

.detail-tabs {
  margin-top: var(--text-2xl);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4xl);
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 100px;
  color: var(--info-color);
  font-weight: 500;
}

.info-item .value {
  flex: 1;
  color: var(--text-primary);
}

.contact-records {
  max-height: 300px;
  overflow-y: auto;
}

.record-item {
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--bg-gray-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-2xl);
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.record-type {
  color: var(--primary-color);
  font-weight: 500;
}

.record-date {
  color: var(--info-color);
  font-size: var(--text-base);
}

.record-content {
  color: var(--text-primary);
  line-height: 1.5;
}

.children-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-4xl);
}

.child-item {
  padding: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--bg-gray-light);
  border-radius: var(--radius-md);
}

.child-basic h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.child-basic p {
  margin: var(--spacing-xs) 0;
  color: var(--text-regular);
  font-size: var(--text-base);
}

.notes-section {
  margin-top: var(--spacing-2xl);
}

.dialog-footer {
  text-align: right;
}
</style>
