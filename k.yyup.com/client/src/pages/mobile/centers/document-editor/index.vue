<template>
  <MobileMainLayout
    :title="template.name || '文档编辑器'"
    :show-back="true"
    @back="handleGoBack"
  >
    <div class="mobile-document-editor">
      <!-- 头部状态栏 -->
      <div class="status-header">
        <div class="document-info">
          <div class="document-title">{{ template.name }}</div>
          <div class="document-status">
            <van-tag :type="getStatusType(document.status)">
              {{ getStatusLabel(document.status) }}
            </van-tag>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-section">
          <div class="progress-label">
            完成度: {{ document.progress }}%
          </div>
          <van-progress
            :percentage="document.progress"
            :color="getProgressColor(document.progress)"
            stroke-width="6"
          />
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <van-button
            size="small"
            type="default"
            icon="passed"
            :loading="saving"
            @click="handleSaveDraft"
          >
            保存草稿
          </van-button>
          <van-button
            size="small"
            type="primary"
            icon="eye-o"
            @click="handlePreview"
          >
            预览
          </van-button>
          <van-button
            size="small"
            type="success"
            icon="success"
            @click="handleSubmit"
          >
            提交
          </van-button>
        </div>
      </div>

      <!-- 主编辑区域 -->
      <div class="editor-layout">
        <!-- 编辑器区域 -->
        <div class="editor-section">
          <van-cell-group inset>
            <van-cell>
              <template #title>
                <div class="editor-header">
                  <span>文档编辑</span>
                  <van-space>
                    <van-button
                      size="mini"
                      icon="play"
                      :loading="autoFilling"
                      @click="handleAutoFill"
                    >
                      自动填充
                    </van-button>
                    <van-button
                      size="mini"
                      icon="bulb-o"
                      @click="handleAIAssist"
                    >
                      AI辅助
                    </van-button>
                  </van-space>
                </div>
              </template>
            </van-cell>

            <!-- Markdown编辑器 -->
            <van-cell>
              <template #default>
                <div class="editor-wrapper">
                  <textarea
                    v-model="document.content"
                    class="markdown-editor"
                    placeholder="开始编辑文档内容..."
                    @input="handleContentChange"
                  ></textarea>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 变量填充区域 -->
        <div class="variables-section">
          <van-cell-group inset>
            <van-cell>
              <template #title>
                <div class="section-header">
                  <span>变量填充</span>
                  <van-badge :content="unfilledCount.toString()" :show-zero="false" />
                </div>
              </template>
            </van-cell>

            <!-- 变量列表 -->
            <div class="variables-list">
              <van-collapse v-model="activeNames" accordion>
                <van-collapse-item
                  v-for="variable in variableList"
                  :key="variable.name"
                  :name="variable.name"
                  :title="variable.label"
                >
                  <template #title>
                    <div class="variable-title">
                      <span class="variable-label">{{ variable.label }}</span>
                      <van-tag v-if="variable.source === 'auto'" type="success" size="small">
                        自动
                      </van-tag>
                      <van-tag v-if="variable.required" type="danger" size="small">
                        必填
                      </van-tag>
                    </div>
                  </template>

                  <div class="variable-field">
                    <!-- 文本输入 -->
                    <van-field
                      v-if="variable.type === 'string'"
                      v-model="filledVariables[variable.name]"
                      :placeholder="`请输入${variable.label}`"
                      :readonly="variable.source === 'auto'"
                      @input="handleVariableChange"
                    />

                    <!-- 数字输入 -->
                    <van-field
                      v-else-if="variable.type === 'number'"
                      v-model="filledVariables[variable.name]"
                      type="digit"
                      :placeholder="`请输入${variable.label}`"
                      :readonly="variable.source === 'auto'"
                      @input="handleVariableChange"
                    />

                    <!-- 日期选择 -->
                    <van-field
                      v-else-if="variable.type === 'date'"
                      v-model="filledVariables[variable.name]"
                      :placeholder="`请选择${variable.label}`"
                      readonly
                      @click="showDatePicker(variable.name)"
                    />

                    <!-- 布尔选择 -->
                    <van-cell v-else-if="variable.type === 'boolean'">
                      <template #default>
                        <van-switch
                          v-model="filledVariables[variable.name]"
                          :disabled="variable.source === 'auto'"
                          @change="handleVariableChange"
                        />
                      </template>
                    </van-cell>

                    <!-- 默认文本 -->
                    <van-field
                      v-else
                      v-model="filledVariables[variable.name]"
                      :placeholder="`请输入${variable.label}`"
                      :readonly="variable.source === 'auto'"
                      @input="handleVariableChange"
                    />
                  </div>
                </van-collapse-item>
              </van-collapse>
            </div>
          </van-cell-group>
        </div>

        <!-- 快捷操作区域 -->
        <div class="shortcuts-section">
          <van-cell-group inset>
            <van-cell title="快捷操作" />
            <van-cell>
              <template #default>
                <van-grid :column-num="2" :gutter="12">
                  <van-grid-item @click="handleInsertTable">
                    <van-icon name="friends-o" size="24" />
                    <span class="shortcut-text">插入表格</span>
                  </van-grid-item>
                  <van-grid-item @click="handleInsertList">
                    <van-icon name="list-switch" size="24" />
                    <span class="shortcut-text">插入列表</span>
                  </van-grid-item>
                  <van-grid-item @click="handleInsertImage">
                    <van-icon name="photo-o" size="24" />
                    <span class="shortcut-text">插入图片</span>
                  </van-grid-item>
                  <van-grid-item @click="handleFormat">
                    <van-icon name="edit" size="24" />
                    <span class="shortcut-text">格式化</span>
                  </van-grid-item>
                </van-grid>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>

      <!-- 预览弹窗 -->
      <van-popup
        v-model:show="previewVisible"
        position="top"
        :style="{ height: '100%' }"
        round
        closeable
        close-icon="cross"
        @close="previewVisible = false"
      >
        <div class="preview-popup">
          <div class="preview-header">
            <h3>文档预览</h3>
            <van-space>
              <van-button
                size="small"
                type="primary"
                icon="down"
                @click="handleExport"
              >
                导出PDF
              </van-button>
            </van-space>
          </div>

          <div class="preview-content" v-html="previewHtml"></div>
        </div>
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePickerVisible" position="bottom">
        <van-date-picker
          v-model="selectedDate"
          type="date"
          title="选择日期"
          @confirm="onDateConfirm"
          @cancel="showDatePickerVisible = false"
        />
      </van-popup>

      <!-- 提交确认弹窗 -->
      <van-dialog
        v-model:show="submitDialogVisible"
        title="提交确认"
        :show-cancel-button="true"
        @confirm="confirmSubmit"
      >
        <div class="submit-confirm">
          <p>确定要提交文档吗？</p>
          <p v-if="unfilledCount > 0" class="warning-text">
            还有 {{ unfilledCount }} 个必填变量未填写
          </p>
        </div>
      </van-dialog>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showDialog } from 'vant'
import { marked } from 'marked'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { getTemplateById } from '@/api/endpoints/document-templates'

// 路由
const router = useRouter()
const route = useRoute()

// 数据
const template = ref<any>({
  id: 0,
  name: '',
  templateContent: '',
  variables: {}
})

const document = ref({
  id: 0,
  templateId: 0,
  title: '',
  content: '',
  status: 'draft',
  progress: 0
})

const filledVariables = ref<Record<string, any>>({})
const saving = ref(false)
const autoFilling = ref(false)
const previewVisible = ref(false)
const submitDialogVisible = ref(false)
const autoSaveTimer = ref<any>(null)

// 折叠面板
const activeNames = ref<string[]>([])

// 日期选择器
const showDatePickerVisible = ref(false)
const selectedDate = ref(new Date())
const currentVariableName = ref('')

// 计算属性
const variableList = computed(() => {
  if (!template.value.variables) return []
  return Object.entries(template.value.variables).map(([name, config]: [string, any]) => ({
    name,
    label: config.label || name,
    type: config.type || 'string',
    source: config.source || 'auto',
    required: config.required !== false
  }))
})

const unfilledCount = computed(() => {
  return variableList.value.filter(v =>
    v.required && !filledVariables.value[v.name]
  ).length
})

const previewHtml = computed(() => {
  if (!document.value.content) return ''
  return marked(document.value.content)
})

// 方法
const handleGoBack = async () => {
  if (document.value.content) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: '确定要离开吗？未保存的内容将丢失。',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      router.back()
    } catch (error) {
      // 用户取消
    }
  } else {
    router.back()
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'default',
    filling: 'warning',
    review: 'primary',
    completed: 'success'
  }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    completed: '已完成'
  }
  return map[status] || status
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#07c160'
  if (percentage >= 75) return '#ff976a'
  if (percentage >= 50) return '#1989fa'
  return '#ee0a24'
}

const handleContentChange = () => {
  calculateProgress()
  scheduleAutoSave()
}

const handleVariableChange = () => {
  updateContentWithVariables()
  calculateProgress()
  scheduleAutoSave()
}

const calculateProgress = () => {
  const totalVariables = variableList.value.filter(v => v.required).length
  const filledCount = variableList.value.filter(v =>
    v.required && filledVariables.value[v.name]
  ).length

  const contentProgress = document.value.content ? 50 : 0
  const variableProgress = totalVariables > 0
    ? (filledCount / totalVariables) * 50
    : 50

  document.value.progress = Math.round(contentProgress + variableProgress)
}

const updateContentWithVariables = () => {
  let content = template.value.templateContent

  for (const [name, value] of Object.entries(filledVariables.value)) {
    const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g')
    content = content.replace(regex, String(value || ''))
  }

  document.value.content = content
}

const handleAutoFill = async () => {
  autoFilling.value = true
  try {
    // TODO: 调用自动填充API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟自动填充
    filledVariables.value = {
      kindergarten_name: '阳光幼儿园',
      kindergarten_address: '北京市朝阳区XX街道XX号',
      principal_name: '张园长',
      inspection_date: new Date().toISOString().split('T')[0],
      teacher_count: 25,
      student_count: 150
    }

    updateContentWithVariables()
    showToast('自动填充成功')
  } catch (error) {
    showToast('自动填充失败')
  } finally {
    autoFilling.value = false
  }
}

const handleAIAssist = () => {
  showToast('AI辅助功能开发中...')
}

const handleSaveDraft = async () => {
  saving.value = true
  try {
    // TODO: 调用保存API
    await new Promise(resolve => setTimeout(resolve, 500))
    showToast('保存成功')
  } catch (error) {
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

const scheduleAutoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }

  autoSaveTimer.value = setTimeout(() => {
    handleSaveDraft()
  }, 3000) // 3秒后自动保存
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleSubmit = () => {
  if (unfilledCount.value > 0) {
    showDialog({
      title: '提示',
      message: `还有 ${unfilledCount.value} 个必填变量未填写，请先完善后再提交。`,
      confirmButtonText: '确定'
    })
    return
  }
  submitDialogVisible.value = true
}

const confirmSubmit = async () => {
  try {
    // TODO: 调用提交API
    document.value.status = 'review'
    showToast('提交成功')
    router.back()
  } catch (error) {
    showToast('提交失败')
  }
}

const handleExport = () => {
  showToast('导出功能开发中...')
}

const handleInsertTable = () => {
  const table = '\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n\n'
  document.value.content += table
}

const handleInsertList = () => {
  const list = '\n\n- 列表项1\n- 列表项2\n- 列表项3\n\n'
  document.value.content += list
}

const handleInsertImage = () => {
  const image = '\n\n![图片描述](图片URL)\n\n'
  document.value.content += image
}

const handleFormat = () => {
  showToast('格式化功能开发中...')
}

const showDatePicker = (variableName: string) => {
  currentVariableName.value = variableName
  selectedDate.value = new Date()
  showDatePickerVisible.value = true
}

const onDateConfirm = (value: Date) => {
  filledVariables.value[currentVariableName.value] = value.toISOString().split('T')[0]
  handleVariableChange()
  showDatePickerVisible.value = false
}

// 加载数据
const loadTemplate = async () => {
  try {
    const id = route.params.id as string
    const response = await getTemplateById(id)
    if (response.success) {
      template.value = response.data
      document.value.content = template.value.templateContent
      document.value.templateId = template.value.id
      document.value.title = template.value.name
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    showToast('加载模板失败')
  }
}

onMounted(() => {
  loadTemplate()
})

onBeforeUnmount(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-document-editor {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);
}

.status-header {
  background: var(--card-bg);
  padding: var(--spacing-md);
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .document-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .document-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: #323233;
      flex: 1;
      margin-right: 12px;
    }

    .document-status {
      flex-shrink: 0;
    }
  }

  .progress-section {
    margin-bottom: 16px;

    .progress-label {
      font-size: var(--text-xs);
      color: #969799;
      margin-bottom: 6px;
    }
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;

    .van-button {
      min-width: 80px;
    }
  }
}

.editor-layout {
  padding: 0 8px;
}

.editor-section,
.variables-section,
.shortcuts-section {
  margin-bottom: 12px;

  .editor-header,
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .variable-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .variable-label {
      flex: 1;
      margin-right: 8px;
    }
  }

  .variable-field {
    padding: var(--spacing-md) 0;
  }
}

.editor-wrapper {
  .markdown-editor {
    width: 100%;
    min-height: 300px;
    padding: var(--spacing-md);
    border: 1px solid #ebedf0;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: var(--text-sm);
    line-height: 1.6;
    resize: vertical;
    background: var(--app-bg-color);
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #1989fa;
      background: var(--card-bg);
    }

    &::placeholder {
      color: #c8c9cc;
    }
  }
}

.variables-list {
  max-height: 400px;
  overflow-y: auto;
}

.shortcuts-section {
  .shortcut-text {
    font-size: var(--text-xs);
    color: #646566;
    margin-top: 4px;
    display: block;
    text-align: center;
  }

  .van-grid-item {
    text-align: center;
    cursor: pointer;

    &:active {
      transform: scale(0.95);
    }
  }
}

.preview-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .preview-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--card-bg);
    position: sticky;
    top: 0;
    z-index: 1;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      color: #323233;
    }
  }

  .preview-content {
    flex: 1;
    padding: var(--spacing-md);
    overflow-y: auto;
    background: var(--card-bg);

    :deep(h1) {
      font-size: var(--text-2xl);
      margin-bottom: 16px;
      border-bottom: 2px solid #ebedf0;
      padding-bottom: 8px;
    }

    :deep(h2) {
      font-size: var(--text-xl);
      margin: var(--spacing-lg) 0 12px;
    }

    :deep(h3) {
      font-size: var(--text-lg);
      margin: var(--spacing-md) 0 8px;
    }

    :deep(p) {
      line-height: 1.6;
      margin-bottom: 12px;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: var(--spacing-md) 0;
      font-size: var(--text-sm);

      th, td {
        border: 1px solid #ebedf0;
        padding: var(--spacing-sm) 12px;
        text-align: left;
      }

      th {
        background: #f7f8fa;
        font-weight: 600;
      }
    }

    :deep(ul), :deep(ol) {
      margin: var(--spacing-md) 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        line-height: 1.5;
      }
    }

    :deep(blockquote) {
      margin: var(--spacing-md) 0;
      padding: var(--spacing-sm) 16px;
      border-left: 4px solid #1989fa;
      background: #f7f8fa;
      color: #646566;
    }

    :deep(code) {
      background: #f7f8fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: var(--text-xs);
    }

    :deep(pre) {
      background: #f7f8fa;
      padding: var(--spacing-md);
      border-radius: 8px;
      overflow-x: auto;
      margin: var(--spacing-md) 0;

      code {
        background: none;
        padding: 0;
        font-size: var(--text-sm);
      }
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: var(--spacing-md) 0;
    }
  }
}

.submit-confirm {
  padding: var(--spacing-md);
  text-align: center;

  .warning-text {
    color: #ee0a24;
    font-size: var(--text-sm);
    margin-top: 8px;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-editor {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .editor-layout {
    padding: 0 16px;
  }

  .status-header {
    padding: var(--spacing-lg);
  }

  .markdown-editor {
    min-height: 400px;
  }
}

// 触摸优化
.van-button {
  min-height: 44px;
}

.van-cell {
  min-height: 48px;
}

.van-field__control {
  min-height: 44px;
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
  .mobile-document-editor {
    background: #1a1a1a;
  }

  .status-header {
    background: #2a2a2a;
    color: white;
  }

  .document-title {
    color: white;
  }

  .markdown-editor {
    background: #2a2a2a;
    border-color: #3a3a3a;
    color: white;

    &:focus {
      background: #333;
      border-color: #1989fa;
    }
  }

  .preview-content {
    background: #1a1a1a;
    color: white;
  }

  :deep(table) {
    th {
      background: #2a2a2a;
    }

    th, td {
      border-color: #3a3a3a;
    }
  }

  :deep(blockquote) {
    background: #2a2a2a;
    color: #aaa;
  }

  :deep(code) {
    background: #2a2a2a;
    color: #ddd;
  }

  :deep(pre) {
    background: #2a2a2a;
  }
}
</style>