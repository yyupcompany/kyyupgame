<template>
  <div class="page-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <UnifiedIcon name="default" />
            活动模板管理
          </div>
          <div class="card-actions">
            <el-button type="primary" @click="handleCreate">
              <UnifiedIcon name="Plus" />
              新建模板
            </el-button>
            <el-button @click="handleRefresh">
              <UnifiedIcon name="Refresh" />
              刷新
            </el-button>
          </div>
        </app-card-header>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="模板名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入模板名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="模板类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
              <el-option
                v-for="type in templateTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
            <el-button @click="handleReset">
              <UnifiedIcon name="Refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 模板列表 -->
      <div class="template-grid" v-loading="loading">
        <div
          v-for="template in templateList"
          :key="template.id"
          class="template-card"
        >
          <div class="template-preview">
            <div class="template-icon">
              <UnifiedIcon name="default" />
            </div>
            <div class="template-type">
              {{ getTypeLabel(template.type) }}
            </div>
          </div>
          
          <div class="template-info">
            <h3 class="template-title">{{ template.name }}</h3>
            <p class="template-description">{{ template.description }}</p>
            
            <div class="template-meta">
              <el-tag :type="template.status === 1 ? 'success' : 'danger'" size="small">
                {{ template.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <span class="usage-count">使用 {{ template.usageCount || 0 }} 次</span>
            </div>
          </div>
          
          <div class="template-actions">
            <el-button size="small" @click="handlePreview(template)">
              <UnifiedIcon name="eye" />
              预览
            </el-button>
            <el-button size="small" type="primary" @click="handleUse(template)">
              <UnifiedIcon name="Plus" />
              使用
            </el-button>
            <el-dropdown @command="(command) => handleAction(command, template)">
              <el-button size="small">
                更多<UnifiedIcon name="ArrowDown" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="toggle">
                    {{ template.status === 1 ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="templateList.length === 0 && !loading" description="暂无模板数据">
        <el-button type="primary" @click="handleCreate">创建第一个模板</el-button>
      </el-empty>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </app-card>

    <!-- 模板表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="templateForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-select v-model="templateForm.type" placeholder="请选择模板类型">
            <el-option
              v-for="type in templateTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="templateForm.title" placeholder="请输入活动标题模板" />
        </el-form-item>
        <el-form-item label="活动时长" prop="duration">
          <el-input-number
            v-model="templateForm.duration"
            :min="1"
            :max="480"
            placeholder="分钟"
          />
          <span class="form-tip">分钟</span>
        </el-form-item>
        <el-form-item label="参与人数" prop="capacity">
          <el-input-number
            v-model="templateForm.capacity"
            :min="1"
            :max="1000"
            placeholder="人"
          />
          <span class="form-tip">人</span>
        </el-form-item>
        <el-form-item label="活动费用" prop="fee">
          <el-input-number
            v-model="templateForm.fee"
            :min="0"
            :precision="2"
            placeholder="元"
          />
          <span class="form-tip">元</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="templateForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="模板预览" width="800px">
      <div class="template-preview-content" v-if="currentTemplate">
        <h2>{{ currentTemplate.name }}</h2>
        <p><strong>类型：</strong>{{ getTypeLabel(currentTemplate.type) }}</p>
        <p><strong>描述：</strong>{{ currentTemplate.description }}</p>
        <p><strong>活动标题：</strong>{{ currentTemplate.title }}</p>
        <p><strong>时长：</strong>{{ currentTemplate.duration }} 分钟</p>
        <p><strong>人数：</strong>{{ currentTemplate.capacity }} 人</p>
        <p><strong>费用：</strong>{{ currentTemplate.fee }} 元</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Plus,
  Refresh,
  Search,
  RefreshLeft,
  View,
  ArrowDown
} from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const previewVisible = ref(false)
const isEdit = ref(false)
const templateList = ref([])
const total = ref(0)
const currentTemplate = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 12
})

// 模板类型
const templateTypes = [
  { label: '开放日', value: 'open_day' },
  { label: '亲子活动', value: 'parent_child' },
  { label: '招生宣讲', value: 'enrollment' },
  { label: '园区参观', value: 'campus_tour' },
  { label: '家长会', value: 'parent_meeting' },
  { label: '节日活动', value: 'festival' },
  { label: '其他', value: 'other' }
]

// 模板表单
const templateForm = reactive({
  name: '',
  type: '',
  description: '',
  title: '',
  duration: 120,
  capacity: 50,
  fee: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入模板描述', trigger: 'blur' }
  ]
}

const formRef = ref()

// 获取类型标签
const getTypeLabel = (type: string) => {
  const typeItem = templateTypes.find(item => item.value === type)
  return typeItem ? typeItem.label : type
}

// 加载模板列表
const loadTemplateList = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = [
      {
        id: 1,
        name: '春季开放日模板',
        type: 'open_day',
        description: '适用于春季招生的开放日活动模板',
        title: '春季开放日 - 走进美好校园',
        duration: 180,
        capacity: 100,
        fee: 0,
        status: 1,
        usageCount: 15
      },
      {
        id: 2,
        name: '亲子运动会模板',
        type: 'parent_child',
        description: '亲子运动会活动模板，增进家庭关系',
        title: '快乐亲子运动会',
        duration: 240,
        capacity: 80,
        fee: 50,
        status: 1,
        usageCount: 8
      }
    ]
    
    templateList.value = mockData
    total.value = mockData.length
  } catch (error) {
    ElMessage.error('加载模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadTemplateList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadTemplateList()
}

// 新建模板
const handleCreate = () => {
  isEdit.value = false
  Object.assign(templateForm, {
    name: '',
    type: '',
    description: '',
    title: '',
    duration: 120,
    capacity: 50,
    fee: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 预览模板
const handlePreview = (template: any) => {
  currentTemplate.value = template
  previewVisible.value = true
}

// 使用模板
const handleUse = (template: any) => {
  router.push({
    path: '/activity/create',
    query: { templateId: template.id }
  })
}

// 操作处理
const handleAction = async (command: string, template: any) => {
  switch (command) {
    case 'edit':
      isEdit.value = true
      Object.assign(templateForm, template)
      dialogVisible.value = true
      break
    case 'copy':
      isEdit.value = false
      Object.assign(templateForm, {
        ...template,
        name: template.name + ' - 副本'
      })
      dialogVisible.value = true
      break
    case 'toggle':
      // 切换状态
      ElMessage.success(`模板已${template.status === 1 ? '禁用' : '启用'}`)
      break
    case 'delete':
      await ElMessageBox.confirm('确定要删除这个模板吗？', '确认删除', {
        type: 'warning'
      })
      ElMessage.success('模板删除成功')
      loadTemplateList()
      break
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isEdit.value ? '模板更新成功' : '模板创建成功')
    dialogVisible.value = false
    loadTemplateList()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadTemplateList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTemplateList()
}

// 初始化
onMounted(async () => {
  await loadTemplateList()

  // 检查是否有editId查询参数，如果有则自动打开编辑对话框
  const editId = route.query.editId
  if (editId) {
    const template = templateList.value.find((t: any) => t.id == editId)
    if (template) {
      // 自动打开编辑对话框
      isEdit.value = true
      Object.assign(templateForm, template)
      dialogVisible.value = true
      ElMessage.info(`正在编辑模板"${template.name}"`)
    } else {
      ElMessage.warning('未找到指定的模板')
    }
  }
})
</script>

<style scoped lang="scss">
.search-section {
  margin-bottom: var(--text-2xl);
  padding: var(--text-2xl);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.template-card {
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-2xl);
  background: white;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    border-color: var(--primary-color);
  }
}

.template-preview {
  text-align: center;
  margin-bottom: var(--spacing-4xl);
  
  .template-icon {
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  .template-type {
    font-size: var(--text-sm);
    color: var(--info-color);
  }
}

.template-info {
  margin-bottom: var(--spacing-4xl);
  
  .template-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .template-description {
    margin: 0 0 var(--text-sm) 0;
    font-size: var(--text-base);
    color: var(--text-regular);
    line-height: 1.4;
  }
  
  .template-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .usage-count {
      font-size: var(--text-sm);
      color: var(--info-color);
    }
  }
}

.template-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--text-2xl);
}

.form-tip {
  margin-left: var(--spacing-sm);
  color: var(--info-color);
  font-size: var(--text-sm);
}

.template-preview-content {
  line-height: 1.6;
  
  h2 {
    margin-top: 0;
    color: var(--text-primary);
  }
  
  p {
    margin: var(--spacing-sm) 0;
    
    strong {
      color: var(--text-regular);
    }
  }
}
</style>
