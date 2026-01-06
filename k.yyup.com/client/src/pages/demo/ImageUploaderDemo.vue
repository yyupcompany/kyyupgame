<template>
  <div class="page-container">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>Element Plus 图片上传组件演示</span>
        </div>
      </template>
      
      <div class="demo-section">
        <h3>基础用法</h3>
        <ElementImageUploader
          v-model="basicFiles"
          title="基础图片上传"
          :max-count="1"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
        />
        <div class="demo-result">
          <p>当前文件：{{ basicFiles.length }} 个</p>
          <pre>{{ JSON.stringify(basicFiles, null, 2) }}</pre>
        </div>
      </div>
      
      <el-divider />
      
      <div class="demo-section">
        <h3>多文件上传</h3>
        <ElementImageUploader
          v-model="multipleFiles"
          title="多文件上传"
          :max-count="5"
          :multiple="true"
          button-text="选择多个图片"
          tips="最多可上传5张图片，每张不超过2MB"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
        />
        <div class="demo-result">
          <p>当前文件：{{ multipleFiles.length }} 个</p>
        </div>
      </div>
      
      <el-divider />
      
      <div class="demo-section">
        <h3>列表模式</h3>
        <ElementImageUploader
          v-model="listFiles"
          title="列表模式上传"
          list-type="text"
          :max-count="3"
          :multiple="true"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
        />
      </div>
      
      <el-divider />
      
      <div class="demo-section">
        <h3>禁用状态</h3>
        <ElementImageUploader
          v-model="disabledFiles"
          title="禁用状态"
          :disabled="true"
          button-text="已禁用"
        />
      </div>
      
      <div class="demo-actions">
        <el-button @click="clearAll">清空所有</el-button>
        <el-button type="primary" @click="showResults">查看结果</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ElementImageUploader from '@/components/common/ElementImageUploader.vue'
import type { UploadUserFile, UploadFile } from 'element-plus'

// 响应式数据
const basicFiles = ref<UploadUserFile[]>([])
const multipleFiles = ref<UploadUserFile[]>([])
const listFiles = ref<UploadUserFile[]>([])
const disabledFiles = ref<UploadUserFile[]>([
  {
    name: 'example.jpg',
  url: 'https://via.placeholder.com/300x200',
  uid: Date.now()
  }
])

// 上传成功回调
const onUploadSuccess = (response: any, file: UploadFile) => {
  console.log('上传成功:', response, file)
  ElMessage.success(`${file.name} 上传成功`)
}

// 上传失败回调
const onUploadError = (error: Error, file: UploadFile) => {
  console.error('上传失败:', error, file)
  ElMessage.error(`${file.name} 上传失败`)
}

// 清空所有文件
const clearAll = () => {
  basicFiles.value = []
  multipleFiles.value = []
  listFiles.value = []
  ElMessage.success('已清空所有文件')
}

// 显示结果
const showResults = () => {
  const results = {
    基础上传: basicFiles.value,
    多文件上传: multipleFiles.value,
    列表模式: listFiles.value,
    禁用状态: disabledFiles.value
  }
  
  ElMessageBox.alert(
    `<pre>${JSON.stringify(results, null, 2)}</pre>`,
    '上传结果',
    {
      dangerouslyUseHTMLString: true,
      customStyle: {
        width: '80%'
      }
    }
  )
}
</script>

<style scoped>
.demo-card {
  margin-bottom: var(--text-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-base);
  font-weight: 500;

.demo-section {
  margin-bottom: var(--spacing-8xl);
}

.demo-section h3 {
  margin-bottom: var(--spacing-4xl);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-weight: 500;
}

.demo-result {
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-4xl);
  background-color: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  border: var(--border-width-base) solid #e9ecef;

.demo-result p {
  margin: 0 0 10px 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.demo-result pre {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-primary);
  background: transparent;
  max-min-height: 60px; height: auto;
  overflow-y: auto;

.demo-actions {
  margin-top: var(--spacing-8xl);
  text-align: center;
}

.demo-actions .el-button {
  margin: 0 10px;
}
}
}
}
</style>
