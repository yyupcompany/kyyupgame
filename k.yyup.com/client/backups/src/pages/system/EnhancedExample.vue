<template>
  <PageWrapper
    title="系统设置管理"
    subtitle="管理系统全局配置和参数"
    :page-loading="pageState.loading.value"
    loading-text="正在加载系统配置..."
    loading-tip="请稍候，正在获取最新配置信息"
    :auto-empty-state="true"
    entity-name="配置项"
    @error="handlePageError"
    @recover="handlePageRecover"
  >
    <!-- 页面操作按钮 -->
    <template #actions>
      <el-button type="primary" @click="addNewConfig">
        <el-icon><Plus /></el-icon>
        新增配置
      </el-button>
      <el-button @click="refreshData" :loading="pageState.loading.value">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </template>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form inline>
        <el-form-item label="配置名称">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入配置名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="selectedType" placeholder="选择类型" clearable>
            <el-option label="基础配置" value="basic" />
            <el-option label="安全配置" value="security" />
            <el-option label="邮件配置" value="email" />
            <el-option label="存储配置" value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="pageState.searchLoading.value">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 数据表格 -->
      <el-card v-if="pageState.data.value.length > 0" shadow="hover">
        <el-table :data="pageState.data.value" style="width: 100%" stripe>
          <el-table-column prop="name" label="配置名称" min-width="150" />
          <el-table-column prop="key" label="配置键" min-width="200" />
          <el-table-column prop="value" label="配置值" min-width="200" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="editConfig(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="deleteConfig(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageState.pagination.current"
            v-model:page-size="pageState.pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pageState.pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 使用自动空状态管理 -->
      <!-- PageWrapper 会根据 pageState 自动显示相应的空状态 -->
    </div>

    <!-- 配置编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingConfig.id ? '编辑配置' : '新增配置'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editingConfig" :rules="configRules" ref="configFormRef" label-width="100px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="editingConfig.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置键" prop="key">
          <el-input v-model="editingConfig.key" placeholder="请输入配置键" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input
            v-model="editingConfig.value"
            type="textarea"
            :rows="3"
            placeholder="请输入配置值"
          />
        </el-form-item>
        <el-form-item label="配置类型" prop="type">
          <el-select v-model="editingConfig.type" placeholder="选择类型" style="width: 100%">
            <el-option label="基础配置" value="basic" />
            <el-option label="安全配置" value="security" />
            <el-option label="邮件配置" value="email" />
            <el-option label="存储配置" value="storage" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editingConfig.description"
            type="textarea"
            :rows="2"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="saving">
          {{ saving ? '保存中...' : '确定' }}
        </el-button>
      </template>
    </el-dialog>
  </PageWrapper>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Edit, Delete } from '@element-plus/icons-vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import { usePageState } from '@/composables/usePageState'

// 使用页面状态管理
const pageState = usePageState({
  entityName: '配置项',
  autoNotify: true,
  enableRetry: true,
  maxRetries: 3,
  showDetailedError: true
})

// 搜索相关
const searchKeyword = ref('')
const selectedType = ref('')

// 对话框相关
const dialogVisible = ref(false)
const saving = ref(false)
const configFormRef = ref()

// 编辑表单
const editingConfig = reactive({
  id: null,
  name: '',
  key: '',
  value: '',
  type: 'basic',
  description: ''
})

// 表单验证规则
const configRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9._]*$/, message: '配置键格式不正确', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择配置类型', trigger: 'change' }
  ]
}

// 模拟 API 函数
const mockApi = {
  async getConfigs(params: any) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟可能的错误
    if (Math.random() < 0.1) {
      throw new Error('网络连接异常，请检查网络后重试')
    }
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        name: '系统名称',
        key: 'system.name',
        value: '幼儿园管理系统',
        type: 'basic',
        description: '系统显示名称',
        updatedAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '邮件服务器',
        key: 'mail.host',
        value: 'smtp.example.com',
        type: 'email',
        description: '邮件发送服务器地址',
        updatedAt: '2024-01-14 16:20:00'
      }
    ]
    
    // 模拟搜索过滤
    let filteredData = mockData
    if (params.keyword) {
      filteredData = mockData.filter(item => 
        item.name.includes(params.keyword) || item.key.includes(params.keyword)
      )
    }
    if (params.type) {
      filteredData = filteredData.filter(item => item.type === params.type)
    }
    
    return {
      items: filteredData,
      total: filteredData.length
    }
  },

  async saveConfig(config: any) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (Math.random() < 0.05) {
      throw new Error('保存失败，请重试')
    }
    
    return { success: true }
  },

  async deleteConfig(id: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
  }
}

// 加载数据
const loadData = async () => {
  await pageState.loadListData(
    () => mockApi.getConfigs({
      keyword: searchKeyword.value,
      type: selectedType.value,
      page: pageState.pagination.current,
      size: pageState.pagination.size
    }),
    (result) => ({
      items: result.items,
      total: result.total
    })
  )
}

// 搜索处理
const handleSearch = async () => {
  pageState.pagination.current = 1
  pageState.searchKeyword.value = searchKeyword.value
  await loadData()
}

// 重置搜索
const resetSearch = async () => {
  searchKeyword.value = ''
  selectedType.value = ''
  pageState.clearSearch()
  await loadData()
}

// 刷新数据
const refreshData = async () => {
  await loadData()
}

// 分页处理
const handleSizeChange = async (size: number) => {
  pageState.pagination.size = size
  pageState.pagination.current = 1
  await loadData()
}

const handleCurrentChange = async (page: number) => {
  await pageState.handlePageChange(page, 
    (page, size) => mockApi.getConfigs({
      keyword: searchKeyword.value,
      type: selectedType.value,
      page,
      size
    }),
    (result) => ({
      items: result.items,
      total: result.total
    })
  )
}

// 新增配置
const addNewConfig = () => {
  Object.assign(editingConfig, {
    id: null,
    name: '',
    key: '',
    value: '',
    type: 'basic',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑配置
const editConfig = (config: any) => {
  Object.assign(editingConfig, config)
  dialogVisible.value = true
}

// 保存配置
const saveConfig = async () => {
  try {
    await configFormRef.value.validate()
    
    saving.value = true
    await mockApi.saveConfig(editingConfig)
    
    ElMessage.success(editingConfig.id ? '更新成功' : '创建成功')
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('保存配置失败:', error)
  } finally {
    saving.value = false
  }
}

// 删除配置
const deleteConfig = async (config: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除配置"${config.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    
    await mockApi.deleteConfig(config.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
    }
  }
}

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, any> = {
    basic: 'primary',
    security: 'danger',
    email: 'warning',
    storage: 'success'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    basic: '基础配置',
    security: '安全配置',
    email: '邮件配置',
    storage: '存储配置'
  }
  return typeMap[type] || type
}

// 页面错误处理
const handlePageError = (error: Error, errorInfo: any) => {
  console.error('页面错误:', error, errorInfo)
  // 可以在这里添加错误上报逻辑
}

// 页面恢复处理
const handlePageRecover = () => {
  console.log('页面已恢复')
  // 可以在这里添加恢复后的处理逻辑
  loadData()
}

// 页面初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.search-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
}

.main-content {
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding: 1rem 0;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .search-section {
    :deep(.el-form) {
      .el-form-item {
        margin-right: 0;
        margin-bottom: 0.75rem;
        
        .el-form-item__content {
          margin-left: 0 !important;
        }
      }
    }
  }
  
  .main-content {
    .pagination-wrapper {
      justify-content: center;
    }
  }
}
</style>