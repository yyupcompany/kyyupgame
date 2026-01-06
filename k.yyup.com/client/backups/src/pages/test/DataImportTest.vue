<template>
  <div class="data-import-test">
    <h1>数据导入工作流测试</h1>
    
    <div class="test-section">
      <h2>1. 权限检查测试</h2>
      <el-button @click="testPermissionCheck" type="primary">测试权限检查</el-button>
      <div v-if="permissionResult" class="result">
        <pre>{{ JSON.stringify(permissionResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>2. 文件上传测试</h2>
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        drag
        accept=".xlsx,.xls,.csv,.txt,.docx"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel、CSV、Word、TXT 格式文件
          </div>
        </template>
      </el-upload>
    </div>

    <div class="test-section" v-if="uploadedFile">
      <h2>3. 文档解析测试</h2>
      <el-button @click="testDocumentParsing" type="success">解析文档</el-button>
      <div v-if="parseResult" class="result">
        <h3>解析结果：</h3>
        <pre>{{ JSON.stringify(parseResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section" v-if="parseResult">
      <h2>4. 字段映射测试</h2>
      <el-button @click="testFieldMapping" type="warning">生成字段映射</el-button>
      <div v-if="mappingResult" class="result">
        <h3>字段映射结果：</h3>
        <pre>{{ JSON.stringify(mappingResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section" v-if="mappingResult">
      <h2>5. 数据预览测试</h2>
      <el-button @click="testDataPreview" type="info">预览数据</el-button>
      <div v-if="previewResult" class="result">
        <h3>数据预览：</h3>
        <pre>{{ JSON.stringify(previewResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section" v-if="previewResult">
      <h2>6. 数据插入测试</h2>
      <el-button @click="testDataInsertion" type="danger">执行数据插入</el-button>
      <div v-if="insertResult" class="result">
        <h3>插入结果：</h3>
        <pre>{{ JSON.stringify(insertResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { 
  checkImportPermission,
  uploadDocument,
  parseDocument,
  generateFieldMapping,
  previewData,
  executeImport
} from '@/api/data-import'

// 响应式数据
const permissionResult = ref(null)
const uploadedFile = ref(null)
const parseResult = ref(null)
const mappingResult = ref(null)
const previewResult = ref(null)
const insertResult = ref(null)

// 上传配置
const uploadUrl = ref('/api/data-import/upload')
const uploadHeaders = ref({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// 测试权限检查
const testPermissionCheck = async () => {
  try {
    const result = await checkImportPermission({
      importType: 'parent',
      query: '我想上传家长信息表'
    })
    permissionResult.value = result
    ElMessage.success('权限检查完成')
  } catch (error) {
    ElMessage.error('权限检查失败: ' + error.message)
  }
}

// 文件上传前检查
const beforeUpload = (file) => {
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-excel',
                      'text/csv',
                      'text/plain',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('请上传正确格式的文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  
  return true
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
  uploadedFile.value = {
    filename: file.name,
    path: response.data.filePath,
    size: file.size
  }
  ElMessage.success('文件上传成功')
}

// 上传失败处理
const handleUploadError = (error) => {
  ElMessage.error('文件上传失败: ' + error.message)
}

// 测试文档解析
const testDocumentParsing = async () => {
  try {
    const result = await parseDocument({
      filePath: uploadedFile.value.path,
      importType: 'parent'
    })
    parseResult.value = result
    ElMessage.success('文档解析完成')
  } catch (error) {
    ElMessage.error('文档解析失败: ' + error.message)
  }
}

// 测试字段映射
const testFieldMapping = async () => {
  try {
    const result = await generateFieldMapping({
      parsedData: parseResult.value.data,
      importType: 'parent'
    })
    mappingResult.value = result
    ElMessage.success('字段映射生成完成')
  } catch (error) {
    ElMessage.error('字段映射失败: ' + error.message)
  }
}

// 测试数据预览
const testDataPreview = async () => {
  try {
    const result = await previewData({
      parsedData: parseResult.value.data,
      fieldMapping: mappingResult.value.mapping,
      importType: 'parent'
    })
    previewResult.value = result
    ElMessage.success('数据预览生成完成')
  } catch (error) {
    ElMessage.error('数据预览失败: ' + error.message)
  }
}

// 测试数据插入
const testDataInsertion = async () => {
  try {
    const result = await executeImport({
      previewData: previewResult.value.data,
      importType: 'parent',
      confirmed: true
    })
    insertResult.value = result
    ElMessage.success('数据插入完成')
  } catch (error) {
    ElMessage.error('数据插入失败: ' + error.message)
  }
}
</script>

<style scoped>
.data-import-test {
  padding: var(--text-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: var(--spacing-8xl);
  padding: var(--text-2xl);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
}

.test-section h2 {
  margin-bottom: var(--spacing-4xl);
  color: var(--text-primary);
}

.result {
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-4xl);
  background-color: var(--bg-hover);
  border-radius: var(--spacing-xs);
  max-height: 300px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.4;
}

.el-upload {
  width: 100%;
}
</style>
