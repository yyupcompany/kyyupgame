<template>
  <div class="page-container">
    <h1>广告管理</h1>
    <p class="description">
      管理系统中的广告内容，包括横幅广告、弹窗广告等。
    </p>
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>
    
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="广告名称">
          <el-input v-model="searchForm.name" placeholder="请输入广告名称" />
        </el-form-item>
        <el-form-item label="广告类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型">
            <el-option v-for="option in typeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">新增广告</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>
    
    <!-- 空状态处理 -->
    <EmptyState
      v-if="!loading.table && advertisementList.length === 0"
      type="no-data"
      title="暂无广告内容"
      description="还没有创建任何广告，开始添加您的第一个广告内容吧！"
      size="medium"
      :primary-action="{
        text: '新增广告',
        type: 'primary',
        handler: handleCreate
      }"
      :suggestions="[
        '点击新增广告按钮开始创建',
        '选择合适的广告类型和位置',
        '编写吸引人的广告内容'
      ]"
      :show-suggestions="true"
    />

    <!-- 数据表格 -->
    <el-table
      v-else
      v-loading="loading.table"
      :data="advertisementList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="广告名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="position" label="位置" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    
    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑广告' : '新增广告'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="广告标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入广告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="广告名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入广告名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="广告类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="option in typeOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="广告位置" prop="position">
              <el-select v-model="formData.position" placeholder="请选择位置" style="width: 100%">
                <el-option v-for="option in positionOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="formData.priority" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="链接目标" prop="linkTarget">
              <el-select v-model="formData.linkTarget" placeholder="请选择链接目标" style="width: 100%">
                <el-option label="新窗口打开" value="_blank" />
                <el-option label="当前窗口打开" value="_self" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="广告描述" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="3" placeholder="请输入广告描述" />
        </el-form-item>
        
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="formData.linkUrl" placeholder="请输入链接地址" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.submit" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import EmptyState from '@/components/common/EmptyState.vue'
import request from '@/utils/request'

// Import advertisement API
import {
  advertisementApi,
  type Advertisement,
  type AdvertisementQueryParams,
  type CreateAdvertisementRequest,
  type AdvertisementStats,
  AdvertisementType,
  AdvertisementStatus,
  AdvertisementPosition
} from '@/api/modules/advertisement'

// Extended advertisement interface for local use
interface LocalAdvertisement extends Advertisement {
  name: string; // Add name field for backward compatibility
  content?: string; // Make content optional for backward compatibility
}

// 统计卡片数据
const statCards = ref([
  { label: '广告总数', value: 0 },
  { label: '活跃广告', value: 0 },
  { label: '总展示量', value: '0' },
  { label: '平均点击率', value: '0%' }
])

// 搜索表单
const searchForm = ref({
  name: '',
  type: '',
  position: '',
  status: ''
})

// 表单数据
const formRef = ref<FormInstance>()
const formData = ref<Partial<CreateAdvertisementRequest & { name: string; content: string; status: number }>>({
  title: '',
  name: '',
  type: AdvertisementType.BANNER,
  position: AdvertisementPosition.HOME_TOP,
  description: '',
  content: '',
  linkUrl: '',
  linkTarget: '_blank',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  priority: 1,
  status: 1
})

// 表单验证规则
const formRules: FormRules = {
  title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
  name: [{ required: true, message: '请输入广告名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择广告类型', trigger: 'change' }],
  position: [{ required: true, message: '请选择广告位置', trigger: 'change' }],
  content: [{ required: true, message: '请输入广告内容', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 数据列表
const advertisementList = ref<LocalAdvertisement[]>([])
const selectedRows = ref<LocalAdvertisement[]>([])

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)

// 加载状态
const loading = ref({
  table: false,
  submit: false
})

// 选项数据
const typeOptions = [
  { label: '横幅广告', value: AdvertisementType.BANNER },
  { label: '弹窗广告', value: AdvertisementType.POPUP },
  { label: '内嵌广告', value: AdvertisementType.INLINE },
  { label: '视频广告', value: AdvertisementType.VIDEO }
]

const positionOptions = [
  { label: '首页顶部', value: AdvertisementPosition.HOME_TOP },
  { label: '首页中部', value: AdvertisementPosition.HOME_MIDDLE },
  { label: '首页底部', value: AdvertisementPosition.HOME_BOTTOM },
  { label: '侧边栏', value: AdvertisementPosition.SIDEBAR },
  { label: '招生页面', value: AdvertisementPosition.ENROLLMENT_PAGE },
  { label: '活动页面', value: AdvertisementPosition.ACTIVITY_PAGE }
]

const statusOptions = [
  { label: '激活', value: AdvertisementStatus.ACTIVE },
  { label: '草稿', value: AdvertisementStatus.DRAFT },
  { label: '暂停', value: AdvertisementStatus.PAUSED },
  { label: '已过期', value: AdvertisementStatus.EXPIRED }
]

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await advertisementApi.getAdvertisementStats()
    if (response.success && response.data) {
      const data = response.data
      statCards.value[0].value = data.totalAds || 0
      statCards.value[1].value = data.activeAds || 0
      statCards.value[2].value = data.totalImpressions || 0
      statCards.value[3].value = `${(data.clickThroughRate * 100).toFixed(1)}%`
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 设置默认值
    statCards.value.forEach((card, index) => {
      if (index < 2) {
        card.value = 0
      } else if (index === 2) {
        card.value = '0'
      } else {
        card.value = '0%'
      }
    })
  }
}

// 加载广告列表
const loadAdvertisementList = async () => {
  loading.value.table = true
  try {
    const params: AdvertisementQueryParams = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      title: searchForm.value.name || undefined,
      type: searchForm.value.type as AdvertisementType || undefined,
      status: searchForm.value.status as AdvertisementStatus || undefined,
      position: searchForm.value.position as AdvertisementPosition || undefined
    }
    
    const response = await advertisementApi.getAdvertisements(params)
    if (response.success && response.data) {
      // Transform to local format
      advertisementList.value = response.data.items.map(ad => ({
        ...ad,
        name: ad.title, // Use title as name for backward compatibility
        content: ad.description || '',
        link: ad.linkUrl || ''
      }))
      pagination.value.total = response.data.total || 0
    } else {
      advertisementList.value = []
      pagination.value.total = 0
      ElMessage.warning(response.message || '获取广告列表失败')
    }
  } catch (error) {
    console.error('加载广告列表失败:', error)
    ElMessage.error('加载广告列表失败')
    advertisementList.value = []
    pagination.value.total = 0
  } finally {
    loading.value.table = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadAdvertisementList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    name: '',
  type: '',
  position: '',
  status: ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  loadAdvertisementList()
}

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val
  loadAdvertisementList()
}

// 选择变化
const handleSelectionChange = (val: LocalAdvertisement[]) => {
  selectedRows.value = val
}

// 新增广告
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    title: '',
    name: '',
    type: AdvertisementType.BANNER,
    position: AdvertisementPosition.HOME_TOP,
    description: '',
    content: '',
    linkUrl: '',
    linkTarget: '_blank',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 1,
    status: 1
  }
  dialogVisible.value = true
}

// 编辑广告
const handleEdit = (row: LocalAdvertisement) => {
  isEdit.value = true
  formData.value = {
    ...row,
    title: row.title || row.name,
    name: row.name || row.title,
    linkUrl: row.linkUrl || row.link || '',
    status: typeof row.status === 'string' ? (row.status === AdvertisementStatus.ACTIVE ? 1 : 0) : row.status
  }
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: LocalAdvertisement) => {
  try {
    const response = await advertisementApi.getAdvertisement(row.id)
    if (response.success && response.data) {
      // Show performance stats in a dialog
      const statsResponse = await advertisementApi.getAdvertisementStats({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
      
      let message = `广告详情: ${row.name || row.title}\n`
      message += `类型: ${getTypeLabel(row.type)}\n`
      message += `位置: ${getPositionLabel(row.position)}\n`
      message += `状态: ${getStatusLabel(row.status)}`
      
      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data
        message += `\n\n性能数据:\n`
        message += `展示次数: ${stats.totalImpressions}\n`
        message += `点击次数: ${stats.totalClicks}\n`
        message += `点击率: ${(stats.clickThroughRate * 100).toFixed(2)}%`
      }
      
      ElMessage.info(message)
    } else {
      ElMessage.error('获取广告详情失败')
    }
  } catch (error) {
    console.error('查看广告详情失败:', error)
    ElMessage.error('查看广告详情失败')
  }
}

// 删除广告
const handleDelete = async (row: LocalAdvertisement) => {
  try {
    await ElMessageBox.confirm('确定要删除这个广告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await advertisementApi.deleteAdvertisement(row.id)
    if (response.success) {
      ElMessage.success('删除成功')
      await Promise.all([loadAdvertisementList(), loadStats()])
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的广告')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedRows.value.length}个广告吗？此操作不可恢复。`, 
      '批量删除确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    const response = await advertisementApi.batchUpdateAdvertisements({
      ids,
      action: 'delete'
    })
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      await Promise.all([loadAdvertisementList(), loadStats()])
      selectedRows.value = []
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value.submit = true
    
    // Prepare data for API
    const submitData: CreateAdvertisementRequest = {
      title: formData.value.title || formData.value.name || '',
      description: formData.value.content || formData.value.description || '',
      type: formData.value.type as AdvertisementType,
      position: formData.value.position as AdvertisementPosition,
      linkUrl: formData.value.linkUrl || formData.value.link || '',
      linkTarget: formData.value.linkTarget || '_blank',
      startDate: formData.value.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.value.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: formData.value.priority || 1
    }
    
    let response
    if (isEdit.value && formData.value.id) {
      response = await advertisementApi.updateAdvertisement(formData.value.id, submitData)
    } else {
      response = await advertisementApi.createAdvertisement(submitData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      await Promise.all([loadAdvertisementList(), loadStats()])
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('请检查表单输入')
  } finally {
    loading.value.submit = false
  }
}

// 工具函数
const getTypeLabel = (type: string) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

const getPositionLabel = (position: string) => {
  const option = positionOptions.find(opt => opt.value === position)
  return option ? option.label : position
}

const getStatusLabel = (status: string | number) => {
  const statusValue = typeof status === 'number' 
    ? (status === 1 ? AdvertisementStatus.ACTIVE : AdvertisementStatus.DRAFT)
    : status
  const option = statusOptions.find(opt => opt.value === statusValue)
  return option ? option.label : String(status)
}

// 初始化
onMounted(async () => {
  await Promise.all([loadStats(), loadAdvertisementList()])
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  /* 样式已通过全局样式文件管理 */
}

.page-container h1 {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background-color: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.page-container .description {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  text-align: center;
  font-size: var(--text-base);
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.stat-card {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  text-align: center;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  transform: translateY(-2px);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  font-size: var(--text-sm);
  font-weight: 500;
}

.search-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

/* 按钮排版修复：工具栏按钮 */
.toolbar {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  display: flex;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
  flex-wrap: wrap;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.el-table {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  overflow: hidden;
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

/* 白色区域修复：表单组件主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &:focus {
      border-color: var(--primary-color) !important;
    }
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：表格组件主题化 */
:deep(.el-table) {
  background: transparent !important;
  
  .el-table__header-wrapper {
    background: var(--bg-tertiary) !important;
  }
  
  tr {
    background: transparent !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.el-table__row--striped {
      background: var(--bg-tertiary) !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
    }
  }
  
  th {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
    font-weight: 600;
  }
  
  td {
    background: transparent !important;
    color: var(--text-primary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
  }
  
  .el-table__empty-block {
    background: var(--bg-card) !important;
    color: var(--text-muted) !important;
  }
}

/* 白色区域修复：Tag组件主题化 */
:deep(.el-tag) {
  &.el-tag--success {
    background: var(--success-light-9) !important;
    color: var(--success-color) !important;
    border-color: var(--success-light-8) !important;
  }
  
  &.el-tag--danger {
    background: var(--danger-light-9) !important;
    color: var(--danger-color) !important;
    border-color: var(--danger-light-8) !important;
  }
}

/* 白色区域修复：Pagination组件主题化 */
:deep(.el-pagination) {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  
  .el-pagination__total,
  .el-pagination__jump {
    color: var(--text-primary) !important;
  }
  
  .el-pager li {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-active {
      background: var(--primary-color) !important;
      color: white !important;
    }
  }
  
  .btn-prev,
  .btn-next {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
  }
  
  .el-select .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：Dialog组件主题化 */
:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-dialog__header {
    background: var(--bg-tertiary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
    
    .el-dialog__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary) !important;
    border-top: var(--border-width-base) solid var(--border-color) !important;
  }
}

/* 白色区域修复：Loading组件主题化 */
:deep(.el-loading-mask) {
  background: rgba(var(--bg-card-rgb), 0.8) !important;
  
  .el-loading-spinner {
    .el-loading-text {
      color: var(--text-primary) !important;
    }
    
    .circular {
      color: var(--primary-color) !important;
    }
  }
}

/* 白色区域修复：MessageBox组件主题化 */
:deep(.el-message-box) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-message-box__header {
    .el-message-box__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-message-box__content {
    color: var(--text-primary) !important;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    /* 移动端样式已通过全局样式文件管理 */
  }
  
  h1 {
    font-size: var(--text-2xl);
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .description {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  font-size: var(--text-sm);
  }
  
  .stat-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-card {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .stat-value {
    font-size: var(--text-2xl);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
  
  /* 按钮排版修复：移动端工具栏优化 */
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
    
    .el-button {
      width: 100%;
      justify-content: center;
      margin-bottom: var(--app-gap-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  /* 表格在移动端的优化 */
  :deep(.el-table) {
    font-size: var(--text-xs);
    
    .el-table__cell {
      padding: var(--app-gap-xs) !important;
    }
  }
  
  /* 表单项在移动端的优化 */
  :deep(.el-form-item) {
    margin-bottom: var(--app-gap-sm);
  }
  
  /* 分页在移动端的优化 */
  :deep(.el-pagination) {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
    
    .el-pagination__sizes,
    .el-pagination__jump {
      display: none;
    }
  }
}

@media (max-width: 992px) {
  .stat-cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  /* 中等屏幕下的表格优化 */
  :deep(.el-table) {
    .el-table__cell {
      padding: var(--app-gap-xs) var(--app-gap-sm) !important;
    }
  }
}

/* 特殊样式：表格操作按钮优化 */
:deep(.el-table) {
}

.el-table .el-table__body .el-button {
  margin-right: var(--app-gap-xs);
}

.el-table .el-table__body .el-button:last-child {
  margin-right: 0;
}

/* 特殊样式：对话框表单优化 */
:deep(.el-dialog .el-form .el-form-item) {
  margin-bottom: var(--app-gap);
}
}
</style> 