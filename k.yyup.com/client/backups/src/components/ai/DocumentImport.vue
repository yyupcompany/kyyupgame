<template>
  <div class="document-import">
    <!-- 标题 -->
    <div class="import-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <h3>AI文档导入助手</h3>
      <p>智能解析文档内容，快速导入教师和家长数据</p>
    </div>

    <!-- 权限状态卡片 -->
    <el-card class="permission-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Key /></el-icon>
          <span>导入权限</span>
        </div>
      </template>
      <div class="permission-info">
        <div class="permission-item">
          <el-tag 
            :type="permissions.teacher ? 'success' : 'info'"
            :effect="permissions.teacher ? 'dark' : 'plain'"
          >
            <el-icon><User /></el-icon>
            教师数据导入: {{ permissions.teacher ? '已授权' : '无权限' }}
          </el-tag>
          <span class="permission-desc">{{ permissionInfo.teacher }}</span>
        </div>
        <div class="permission-item">
          <el-tag 
            :type="permissions.parent ? 'success' : 'info'"
            :effect="permissions.parent ? 'dark' : 'plain'"
          >
            <el-icon><UserFilled /></el-icon>
            家长数据导入: {{ permissions.parent ? '已授权' : '无权限' }}
          </el-tag>
          <span class="permission-desc">{{ permissionInfo.parent }}</span>
        </div>
      </div>
    </el-card>

    <!-- 导入类型选择 -->
    <el-card class="type-select-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Select /></el-icon>
          <span>导入类型</span>
        </div>
      </template>
      <el-radio-group v-model="selectedType" class="type-radio-group">
        <el-radio 
          value="teacher" 
          :disabled="!permissions.teacher"
          class="type-radio"
        >
          <div class="radio-content">
            <el-icon class="radio-icon"><User /></el-icon>
            <div class="radio-text">
              <div class="radio-title">教师数据</div>
              <div class="radio-desc">导入教师姓名、邮箱、电话、资格等信息</div>
            </div>
          </div>
        </el-radio>
        <el-radio 
          value="parent" 
          :disabled="!permissions.parent"
          class="type-radio"
        >
          <div class="radio-content">
            <el-icon class="radio-icon"><UserFilled /></el-icon>
            <div class="radio-text">
              <div class="radio-title">家长数据</div>
              <div class="radio-desc">导入家长姓名、邮箱、电话、关系等信息</div>
            </div>
          </div>
        </el-radio>
      </el-radio-group>
    </el-card>

    <!-- 文档内容输入 -->
    <el-card class="content-input-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><EditPen /></el-icon>
          <span>文档内容</span>
          <div class="header-actions">
            <el-button 
              type="primary" 
              size="small" 
              :icon="View"
              @click="showFormatHelp = true"
            >
              格式说明
            </el-button>
          </div>
        </div>
      </template>
      
      <el-input
        v-model="documentContent"
        type="textarea"
        :rows="12"
        :placeholder="getPlaceholder()"
        class="content-textarea"
        :disabled="!selectedType"
        show-word-limit
        maxlength="100000"
      />
      
      <div class="content-actions">
        <el-button 
          type="info" 
          :icon="View"
          @click="handlePreview"
          :disabled="!canPreview"
          :loading="previewLoading"
        >
          预览解析
        </el-button>
        <el-button 
          type="primary" 
          :icon="Upload"
          @click="handleImport"
          :disabled="!canImport"
          :loading="importLoading"
        >
          导入数据
        </el-button>
      </div>
    </el-card>

    <!-- 预览结果 -->
    <el-card v-if="previewResult" class="preview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>AI解析预览</span>
          <el-tag 
            :type="previewResult.canImport ? 'success' : 'warning'"
            class="preview-status"
          >
            {{ previewResult.canImport ? '可以导入' : '需要调整' }}
          </el-tag>
        </div>
      </template>
      
      <div class="preview-content">
        <div class="preview-stats">
          <el-statistic title="解析条目" :value="previewResult.totalParsed" />
          <el-statistic title="验证错误" :value="previewResult.validationErrors?.length || 0" />
        </div>
        
        <div v-if="previewResult.parsedData?.length > 0" class="parsed-data">
          <h4>解析结果：</h4>
          <el-table :data="previewResult.parsedData" stripe>
            <el-table-column 
              v-for="field in getTableColumns()"
              :key="field.prop"
              :prop="field.prop"
              :label="field.label"
              :width="field.width"
              show-overflow-tooltip
            />
          </el-table>
        </div>
        
        <div v-if="previewResult.validationErrors?.length > 0" class="validation-errors">
          <h4>验证错误：</h4>
          <el-alert
            v-for="(error, index) in previewResult.validationErrors"
            :key="index"
            :title="error"
            type="warning"
            :closable="false"
            class="error-item"
          />
        </div>
      </div>
    </el-card>

    <!-- 导入历史 -->
    <el-card v-if="showHistory" class="history-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>导入历史</span>
          <el-button 
            type="text" 
            size="small"
            @click="loadHistory"
          >
            刷新
          </el-button>
        </div>
      </template>
      <div class="history-content">
        <el-empty v-if="historyList.length === 0" description="暂无导入历史" />
        <!-- 历史记录列表 TODO: 后端实现后展示 -->
      </div>
    </el-card>

    <!-- 格式说明对话框 -->
    <el-dialog
      v-model="showFormatHelp"
      title="文档格式说明"
      width="60%"
      :before-close="() => showFormatHelp = false"
    >
      <div class="format-help">
        <el-tabs v-model="activeFormatTab">
          <el-tab-pane label="支持格式" name="formats">
            <div class="format-examples">
              <div 
                v-for="format in supportedFormats" 
                :key="format.type"
                class="format-item"
              >
                <h4>{{ format.description }}</h4>
                <div
                  v-for="(example, index) in format.examples"
                  :key="index"
                  class="format-example"
                >
                  <el-scrollbar max-height="180">
                    <pre class="code-block">{{ example }}</pre>
                  </el-scrollbar>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`${selectedType === 'teacher' ? '教师' : '家长'}字段`" name="fields">
            <el-table 
              :data="getFieldsData()" 
              stripe
              class="fields-table"
            >
              <el-table-column prop="field" label="字段名称" width="120" />
              <el-table-column prop="required" label="是否必须" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.required ? 'danger' : 'info'" size="small">
                    {{ scope.row.required ? '必须' : '可选' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="字段说明" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Key, User, UserFilled, Select, EditPen, 
  View, Upload, DataAnalysis, Clock, Plus
} from '@element-plus/icons-vue'
import request from '@/utils/request'

// 响应式数据
const permissions = ref({
  teacher: false,
  parent: false
})

const permissionInfo = ref({
  teacher: '',
  parent: ''
})

const selectedType = ref<'teacher' | 'parent'>('teacher')
const documentContent = ref('')
const previewResult = ref<any>(null)
const previewLoading = ref(false)
const importLoading = ref(false)
const showFormatHelp = ref(false)
const activeFormatTab = ref('formats')
const showHistory = ref(false)
const historyList = ref([])

// 支持的格式信息
const supportedFormats = ref([])
const teacherFields = ref([])
const parentFields = ref([])

// 计算属性
const canPreview = computed(() => {
  return selectedType.value && 
         documentContent.value.trim().length >= 10 && 
         permissions.value[selectedType.value]
})

const canImport = computed(() => {
  return canPreview.value && 
         previewResult.value?.canImport
})

// 方法
const getPlaceholder = () => {
  if (!selectedType.value) {
    return '请先选择导入类型...'
  }
  
  if (selectedType.value === 'teacher') {
    return `请输入教师数据，支持多种格式：

文本格式示例：
姓名: 张三
邮箱: zhang@example.com
电话: 13800138000
资格: 幼师证
经验: 3年

表格格式示例：
姓名	邮箱	电话	资格
张三	zhang@example.com	13800138000	幼师证
李四	li@example.com	13900139000	小学教师证

JSON格式示例：
[
  {
    "name": "张三",
    "email": "zhang@example.com", 
    "phone": "13800138000",
    "qualification": "幼师证"
  }
]`
  } else {
    return `请输入家长数据，支持多种格式：

文本格式示例：
姓名: 李四
邮箱: lisi@example.com
电话: 13900139000
关系: 父亲
职业: 工程师
学生: 李小明

表格格式示例：
姓名	邮箱	电话	关系	学生
李四	lisi@example.com	13900139000	父亲	李小明
王五	wang@example.com	13800138000	母亲	王小红`
  }
}

const getTableColumns = () => {
  if (selectedType.value === 'teacher') {
    return [
      { prop: 'name', label: '姓名', width: '100' },
      { prop: 'email', label: '邮箱', width: '180' },
      { prop: 'phone', label: '电话', width: '120' },
      { prop: 'qualification', label: '资格', width: '120' },
      { prop: 'experience', label: '经验', width: '80' },
      { prop: 'specialization', label: '专业', width: '100' }
    ]
  } else {
    return [
      { prop: 'name', label: '姓名', width: '100' },
      { prop: 'email', label: '邮箱', width: '180' },
      { prop: 'phone', label: '电话', width: '120' },
      { prop: 'relationship', label: '关系', width: '80' },
      { prop: 'occupation', label: '职业', width: '100' },
      { prop: 'studentName', label: '学生', width: '100' }
    ]
  }
}

const getFieldsData = () => {
  return selectedType.value === 'teacher' ? teacherFields.value : parentFields.value
}

// API 调用方法
const loadPermissions = async () => {
  try {
    const response = await request.get('/api/document-import/permissions')
    if (response.data.success) {
      permissions.value = response.data.data.permissions
      permissionInfo.value = response.data.data.permissionInfo
      
      // 如果当前选择的类型没有权限，自动切换
      if (!permissions.value[selectedType.value]) {
        if (permissions.value.parent) {
          selectedType.value = 'parent'
        } else if (permissions.value.teacher) {
          selectedType.value = 'teacher'
        }
      }
    }
  } catch (error) {
    console.error('获取权限信息失败:', error)
    ElMessage.error('获取权限信息失败')
  }
}

const loadFormats = async () => {
  try {
    const response = await request.get('/api/document-import/formats')
    if (response.data.success) {
      const data = response.data.data
      supportedFormats.value = data.supportedFormats
      teacherFields.value = data.teacherFields
      parentFields.value = data.parentFields
    }
  } catch (error) {
    console.error('获取格式信息失败:', error)
  }
}

const handlePreview = async () => {
  if (!canPreview.value) return
  
  previewLoading.value = true
  try {
    const response = await request.post('/api/document-import/preview', {
      documentType: selectedType.value,
      documentContent: documentContent.value
    })
    
    if (response.data.success) {
      previewResult.value = response.data.data
      ElMessage.success('文档预览解析完成')
    } else {
      ElMessage.error(response.data.message || '预览解析失败')
    }
  } catch (error: any) {
    console.error('预览解析失败:', error)
    ElMessage.error(error.response?.data?.message || '预览解析失败')
  } finally {
    previewLoading.value = false
  }
}

const handleImport = async () => {
  if (!canImport.value) return
  
  try {
    await ElMessageBox.confirm(
      `确认导入 ${previewResult.value.totalParsed} 条${selectedType.value === 'teacher' ? '教师' : '家长'}数据吗？`,
      '确认导入',
      {
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    importLoading.value = true
    const response = await request.post('/api/document-import/import', {
      documentType: selectedType.value,
      documentContent: documentContent.value
    })
    
    if (response.data.success) {
      const result = response.data.data
      ElMessage.success(
        `导入成功！导入 ${result.importedCount} 条数据${result.skippedCount > 0 ? `，跳过 ${result.skippedCount} 条` : ''}`
      )
      
      // 清空输入内容
      documentContent.value = ''
      previewResult.value = null
      
      // 刷新历史记录
      if (showHistory.value) {
        loadHistory()
      }
    } else {
      ElMessage.error(response.data.message || '导入失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导入失败:', error)
      ElMessage.error(error.response?.data?.message || '导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

const loadHistory = async () => {
  try {
    const response = await request.get('/api/document-import/history')
    if (response.data.success) {
      historyList.value = response.data.data.history || []
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
  }
}

// 监听选择类型变化，清空预览结果
watch(selectedType, () => {
  previewResult.value = null
  documentContent.value = ''
})

// 组件挂载时加载数据
onMounted(() => {
  loadPermissions()
  loadFormats()
})
</script>

<style scoped>
.document-import {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--text-2xl);
}

.import-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
}

.import-header .header-icon {
  font-size: var(--text-5xl);
  color: var(--primary-color);
  margin-bottom: var(--spacing-2xl);
}

.import-header h3 {
  font-size: var(--text-3xl);
  margin: var(--spacing-2xl) 0;
  color: var(--text-primary);
}

.import-header p {
  color: var(--text-regular);
  font-size: var(--text-base);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-header .header-actions {
  margin-left: auto;
}

.permission-card,
.type-select-card,
.content-input-card,
.preview-card,
.history-card {
  margin-bottom: var(--text-2xl);
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
}

.permission-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.permission-desc {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.type-radio-group {
  width: 100%;
}

.type-radio {
  width: 100%;
  margin-right: 0;
  margin-bottom: var(--spacing-4xl);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-4xl);
  transition: all 0.3s;
}

.type-radio:hover {
  border-color: var(--primary-color);
  background-color: #f0f9ff;
}

.type-radio.is-checked {
  border-color: var(--primary-color);
  background-color: #f0f9ff;
}

.type-radio:last-child {
  margin-bottom: 0;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
}

.radio-icon {
  font-size: var(--text-2xl);
  color: var(--primary-color);
}

.radio-text {
  flex: 1;
}

.radio-title {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.radio-desc {
  color: var(--info-color);
  font-size: var(--text-sm);
}

.content-textarea {
  margin-bottom: var(--spacing-4xl);
}

.content-actions {
  display: flex;
  gap: var(--spacing-2xl);
  justify-content: flex-end;
}

.preview-card {
  border: var(--border-width-base) solid var(--success-extra-light);
  background-color: #f0f9ff;
}

.preview-status {
  margin-left: auto;
}

.preview-content {
  padding: 0;
}

.preview-stats {
  display: flex;
  gap: var(--spacing-5xl);
  margin-bottom: var(--text-2xl);
  padding: var(--spacing-4xl);
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
}

.parsed-data {
  margin-bottom: var(--text-2xl);
}

.parsed-data h4 {
  margin-bottom: var(--spacing-2xl);
  color: var(--text-primary);
}

.validation-errors h4 {
  margin-bottom: var(--spacing-2xl);
  color: var(--warning-color);
}

.error-item {
  margin-bottom: var(--spacing-sm);
}

.format-help {
  max-height: 500px;
  overflow-y: auto;
}

.format-examples {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);
}

.format-item h4 {
  margin-bottom: var(--spacing-2xl);
  color: var(--text-primary);
}

.format-example {
  margin-bottom: var(--spacing-2xl);
  background: var(--bg-hover);
  padding: var(--text-sm);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-size: var(--text-sm);
  white-space: pre-wrap;
  border: var(--border-width-base) solid var(--border-color-light);
}

.fields-table {
  margin-top: var(--spacing-2xl);
}

.history-content {
  min-height: 100px;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .document-import {
    padding: var(--spacing-2xl);
  }
  
  .permission-info {
    gap: var(--spacing-2xl);
  }
  
  .permission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-base);
  }
  
  .preview-stats {
    flex-direction: column;
    gap: var(--spacing-4xl);
  }
  
  .content-actions {
    flex-direction: column;
  }
}
</style>