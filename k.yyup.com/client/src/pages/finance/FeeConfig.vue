<template>
  <div class="fee-config">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2>收费配置</h2>
          <p>管理幼儿园各类收费项目和标准</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleRefresh" :loading="loading">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
          <el-button type="primary" @click="showCreateDialog = true">
            <UnifiedIcon name="Plus" />
            新增收费项
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="费用类别">
            <el-select v-model="filterForm.category" placeholder="选择类别" clearable>
              <el-option label="全部" value="" />
              <el-option label="基础费用" value="基础费用" />
              <el-option label="可选费用" value="可选费用" />
              <el-option label="教学费用" value="教学费用" />
              <el-option label="其他费用" value="其他费用" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="启用" value="active" />
              <el-option label="停用" value="inactive" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="是否必需">
            <el-select v-model="filterForm.isRequired" placeholder="选择类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="必选" :value="true" />
              <el-option label="可选" :value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 费用项目列表 -->
    <div class="fee-list">
      <el-card>
        <div v-loading="loading" class="list-content">
          <div class="table-wrapper">
<el-table class="responsive-table" :data="feeItems" style="width: 100%">
            <el-table-column prop="name" label="费用名称" min-width="120">
              <template #default="{ row }">
                <div class="fee-name">
                  <span class="name">{{ row.name }}</span>
                  <el-tag 
                    v-if="row.isRequired" 
                    type="danger" 
                    size="small" 
                    class="required-tag"
                  >
                    必选
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="category" label="类别" width="100">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category)" size="small">
                  {{ row.category }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="period" label="计费周期" width="100" align="center">
              <template #default="{ row }">
                {{ row.period }}
              </template>
            </el-table-column>
            
            <el-table-column prop="description" label="说明" min-width="200">
              <template #default="{ row }">
                <span class="description">{{ row.description || '-' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  active-value="active"
                  inactive-value="inactive"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleCopy(row)"
                >
                  复制
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="handleDelete(row)"
                  class="danger"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingItem ? '编辑收费项' : '新增收费项'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="费用名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入费用名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="费用类别" prop="category">
          <el-select v-model="formData.category" placeholder="选择费用类别" style="width: 100%">
            <el-option label="基础费用" value="基础费用" />
            <el-option label="可选费用" value="可选费用" />
            <el-option label="教学费用" value="教学费用" />
            <el-option label="其他费用" value="其他费用" />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="费用金额" prop="amount">
              <el-input-number
                v-model="formData.amount"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计费周期" prop="period">
              <el-select v-model="formData.period" placeholder="选择计费周期" style="width: 100%">
                <el-option label="月" value="月" />
                <el-option label="学期" value="学期" />
                <el-option label="年" value="年" />
                <el-option label="次" value="次" />
                <el-option label="天" value="天" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="是否必选">
          <el-radio-group v-model="formData.isRequired">
            <el-radio :label="true">必选项目</el-radio>
            <el-radio :label="false">可选项目</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="费用说明">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入费用说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingItem ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import financeAPI, { type FeeItem } from '@/api/modules/finance'

const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const editingItem = ref<FeeItem | null>(null)
const formRef = ref<InstanceType<typeof ElForm>>()

// 筛选表单
const filterForm = reactive({
  category: '',
  status: '',
  isRequired: ''
})

// 费用项目列表
const feeItems = ref<FeeItem[]>([])

// 表单数据
const formData = reactive({
  name: '',
  category: '',
  amount: 0,
  period: '月',
  isRequired: true,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入费用名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择费用类别', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入费用金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '费用金额必须大于0', trigger: 'blur' }
  ],
  period: [
    { required: true, message: '请选择计费周期', trigger: 'change' }
  ]
}

// 获取类别标签类型
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    '基础费用': 'primary',
    '可选费用': 'success',
    '教学费用': 'warning',
    '其他费用': 'info'
  }
  return typeMap[category] || 'info'
}

// 加载费用项目
const loadFeeItems = async () => {
  loading.value = true
  try {
    console.log('🔄 开始加载收费项目...')
    const response = await financeAPI.getFeeItems()
    console.log('📊 收费项目API响应:', response)

    // 修复：axios响应拦截器已经解包了，response 直接是数据数组
    if (Array.isArray(response)) {
      console.log('✅ 收费项目数据:', response)
      feeItems.value = response
      console.log('📈 更新后的feeItems:', feeItems.value)
    } else if (response && response.success && response.data) {
      // 兼容未解包的情况
      console.log('✅ 收费项目数据（未解包）:', response.data)
      feeItems.value = response.data || []
    } else {
      console.warn('⚠️ 收费项目API响应格式异常:', response)
      feeItems.value = []
    }
  } catch (error) {
    console.error('❌ 加载费用项目失败:', error)
    ElMessage.error('加载费用项目失败')
    feeItems.value = []
  } finally {
    loading.value = false
  }
}

// 处理状态切换
const handleStatusChange = (item: FeeItem) => {
  ElMessage.success(`${item.name} 已${item.status === 'active' ? '启用' : '停用'}`)
}

// 编辑项目
const handleEdit = (item: FeeItem) => {
  editingItem.value = item
  Object.assign(formData, {
    name: item.name,
    category: item.category,
    amount: item.amount,
    period: item.period,
    isRequired: item.isRequired,
    description: item.description || ''
  })
  showCreateDialog.value = true
}

// 复制项目
const handleCopy = (item: FeeItem) => {
  editingItem.value = null
  Object.assign(formData, {
    name: `${item.name}（副本）`,
    category: item.category,
    amount: item.amount,
    period: item.period,
    isRequired: item.isRequired,
    description: item.description || ''
  })
  showCreateDialog.value = true
}

// 删除项目
const handleDelete = async (item: FeeItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除收费项目"${item.name}"吗？删除后不可恢复！`,
      '确认删除',
      {
        type: 'warning'
      }
    )
    
    // 这里应该调用删除API
    ElMessage.success('删除成功')
    await loadFeeItems()
  } catch {
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(editingItem.value ? '更新成功' : '创建成功')
    showCreateDialog.value = false
    await loadFeeItems()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  editingItem.value = null
  Object.assign(formData, {
    name: '',
    category: '',
    amount: 0,
    period: '月',
    isRequired: true,
    description: ''
  })
  formRef.value?.clearValidate()
}

// 搜索
const handleSearch = () => {
  loadFeeItems()
}

// 重置筛选
const handleReset = () => {
  Object.assign(filterForm, {
    category: '',
    status: '',
    isRequired: ''
  })
  loadFeeItems()
}

// 刷新
const handleRefresh = () => {
  loadFeeItems()
}

onMounted(() => {
  loadFeeItems()
})
</script>

<style scoped lang="scss">
.fee-config {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: var(--text-3xl);
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--text-3xl);
    
    .header-left {
      h2 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: var(--text-base);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.filter-section {
  margin-bottom: var(--text-3xl);
  
  .el-form {
    margin-bottom: 0;
  }
}

.fee-list {
  .fee-name {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .name {
      font-weight: 500;
    }
    
    .required-tag {
      font-size: var(--text-2xs);
    }
  }
  
  .amount {
    font-weight: 600;
    color: #059669;
  }
  
  .description {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
  
  .danger {
    color: var(--danger-color);
    
    &:hover {
      color: #dc2626;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

:deep(.el-card) {
  border-radius: var(--text-sm);
  border: none;
  box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-6);
}

:deep(.el-card__header) {
  padding: var(--text-2xl);
  border-bottom: var(--z-index-dropdown) solid #f3f4f6;
  font-weight: 500;
}

:deep(.el-card__body) {
  padding: var(--text-2xl);
}

@media (max-width: var(--breakpoint-md)) {
  .fee-config {
    padding: var(--text-lg);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
  
  .el-form--inline .el-form-item {
    display: block;
    margin-bottom: var(--text-lg);
  }
}
</style>