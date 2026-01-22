<template>
  <div class="document-import-page">
    <!-- 页面头部 -->
    <PageHeader 
      title="AI文档导入" 
      subtitle="智能解析文档内容，快速导入数据到系统"
      :breadcrumb="breadcrumb"
    >
      <template #actions>
        <el-button 
          type="primary" 
          :icon="QuestionFilled"
          @click="showHelpDialog = true"
        >
          使用帮助
        </el-button>
      </template>
    </PageHeader>

    <!-- 文档导入组件 -->
    <DocumentImport />

    <!-- 帮助对话框 -->
    <el-dialog
      v-model="showHelpDialog"
      title="AI文档导入使用指南"
      width="70%"
      :before-close="() => showHelpDialog = false"
    >
      <div class="help-content">
        <el-steps :active="4" direction="vertical" class="help-steps">
          <el-step 
            title="检查权限" 
            description="确认您拥有导入教师或家长数据的权限"
          >
            <template #icon>
              <UnifiedIcon name="default" />
            </template>
          </el-step>
          
          <el-step 
            title="选择类型" 
            description="根据需要选择导入教师数据或家长数据"
          >
            <template #icon>
              <UnifiedIcon name="default" />
            </template>
          </el-step>
          
          <el-step 
            title="输入内容" 
            description="将文档内容粘贴到输入框，支持文本、表格、JSON等多种格式"
          >
            <template #icon>
              <UnifiedIcon name="Edit" />
            </template>
          </el-step>
          
          <el-step 
            title="预览解析" 
            description="点击预览解析，AI将智能提取和验证数据"
          >
            <template #icon>
              <UnifiedIcon name="eye" />
            </template>
          </el-step>
          
          <el-step 
            title="确认导入" 
            description="检查解析结果无误后，点击导入数据到系统"
          >
            <template #icon>
              <UnifiedIcon name="Upload" />
            </template>
          </el-step>
        </el-steps>

        <el-divider />

        <div class="help-tips">
          <h4>💡 使用技巧</h4>
          <ul>
            <li><strong>数据格式</strong>：支持纯文本、表格（Tab/逗号分隔）、JSON格式</li>
            <li><strong>必填字段</strong>：教师和家长数据都要求至少包含姓名字段</li>
            <li><strong>AI智能</strong>：系统会自动识别并映射不同的字段名称</li>
            <li><strong>数据验证</strong>：导入前会进行格式验证和重复性检查</li>
            <li><strong>权限控制</strong>：只有相应权限的用户才能导入对应类型数据</li>
          </ul>

          <h4>⚠️ 注意事项</h4>
          <ul>
            <li>确保数据准确性，导入后建议及时检查</li>
            <li>大量数据建议分批导入，避免系统负载过高</li>
            <li>敏感信息（如密码）不会通过此功能导入</li>
            <li>导入的数据会记录操作日志便于追溯</li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QuestionFilled, Key, Select, EditPen, View, Upload } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DocumentImport from '@/components/ai/DocumentImport.vue'

// 响应式数据
const showHelpDialog = ref(false)

// 面包屑导航
const breadcrumb = [
  { text: '首页', to: '/dashboard' },
  { text: 'AI中心', to: '/ai' },
  { text: '文档导入' }
]

// 页面元数据
defineOptions({
  name: 'DocumentImportPage'
})
</script>

<style scoped>
.document-import-page {
  padding: var(--text-2xl);
  background-color: var(--bg-page);
  min-height: calc(100vh - 60px);
}

.help-content {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.help-steps {
  margin-bottom: var(--text-2xl);
}

.help-steps :deep(.el-step__description) {
  font-size: var(--text-sm);
  color: var(--text-regular);
  line-height: 1.4;
}

.help-tips {
  padding: 0 var(--text-2xl);
}

.help-tips h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-lg);
}

.help-tips ul {
  margin: var(--spacing-2xl) 0 var(--text-2xl) var(--text-2xl);
  color: var(--text-regular);
}

.help-tips li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.help-tips li strong {
  color: var(--primary-color);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .document-import-page {
    padding: var(--spacing-2xl);
  }
  
  .help-content {
    padding: var(--spacing-2xl);
  }
  
  .help-tips {
    padding: 0 10px;
  }
}
</style>