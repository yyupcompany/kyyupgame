<template>
  <MobileSubPageLayout title="文档编辑器" back-path="/mobile/centers">
    <div class="wrapper">
    <div class="header">
      <van-nav-bar
        title="文档编辑器"
        left-arrow
        @click-left="handleBack"
      >
        <template #right>
          <van-icon name="ellipsis" size="20" @click="showActions = true" />
        </template>
      </van-nav-bar>
    </div>

    <div class="content">
      <!-- 文档信息 -->
      <div class="doc-info">
        <van-field
          v-model="documentTitle"
          placeholder="输入文档标题"
          :border="false"
          class="title-input"
        />
        <div class="doc-meta">
          <span>最后编辑: {{ lastEditTime }}</span>
          <van-tag type="primary" size="medium">{{ documentStatus }}</van-tag>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="tool-group">
          <div class="tool-btn" :class="{ active: formatOptions.bold }" @click="toggleFormat('bold')">
            <van-icon name="bold" />
          </div>
          <div class="tool-btn" :class="{ active: formatOptions.italic }" @click="toggleFormat('italic')">
            <van-icon name="italic" />
          </div>
          <div class="tool-btn" :class="{ active: formatOptions.underline }" @click="toggleFormat('underline')">
            <van-icon name="underline" />
          </div>
        </div>
        <div class="tool-divider"></div>
        <div class="tool-group">
          <div class="tool-btn" @click="showHeadingPicker = true">
            <van-icon name="font-o" />
          </div>
          <div class="tool-btn" @click="insertList('bullet')">
            <van-icon name="bars" />
          </div>
          <div class="tool-btn" @click="insertList('number')">
            <van-icon name="orders-o" />
          </div>
        </div>
        <div class="tool-divider"></div>
        <div class="tool-group">
          <div class="tool-btn" @click="showImagePicker">
            <van-icon name="photo-o" />
          </div>
          <div class="tool-btn" @click="insertLink">
            <van-icon name="link-o" />
          </div>
          <div class="tool-btn" @click="insertTable">
            <van-icon name="apps-o" />
          </div>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="editor-area">
        <van-field
          v-model="documentContent"
          type="textarea"
          placeholder="开始编写文档内容..."
          :border="false"
          autosize
          class="content-editor"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button type="default" @click="handleSaveDraft">
          <van-icon name="records" />
          草稿
        </van-button>
        <van-button type="primary" @click="handleSave">
          <van-icon name="success" />
          保存
        </van-button>
        <van-button type="success" @click="handlePreview">
          <van-icon name="eye-o" />
          预览
        </van-button>
      </div>
    </div>

    <!-- 操作菜单 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="actionOptions"
      @select="onActionSelect"
      cancel-text="取消"
    />

    <!-- 标题级别选择器 -->
    <van-popup v-model:show="showHeadingPicker" position="bottom" round>
      <van-picker
        :columns="headingOptions"
        @confirm="onHeadingConfirm"
        @cancel="showHeadingPicker = false"
      />
    </van-popup>

    <!-- 预览弹窗 -->
    <van-popup v-model:show="showPreview" position="bottom" :style="{ height: '80%' }" round>
      <div class="preview-popup">
        <div class="popup-header">
          <span>文档预览</span>
          <van-icon name="cross" @click="showPreview = false" />
        </div>
        <div class="preview-content">
          <h1>{{ documentTitle || '无标题' }}</h1>
          <div class="preview-body" v-html="renderedContent"></div>
        </div>
      </div>
    </van-popup>

    <!-- 链接弹窗 -->
    <van-dialog
      v-model:show="showLinkDialog"
      title="插入链接"
      show-cancel-button
      @confirm="confirmInsertLink"
    >
      <div class="link-form">
        <van-field v-model="linkForm.text" label="链接文字" placeholder="输入显示文字" />
        <van-field v-model="linkForm.url" label="链接地址" placeholder="https://" />
      </div>
    </van-dialog>

    <!-- 图片上传弹窗 -->
    <van-popup v-model:show="showImageUpload" position="bottom" round :style="{ padding: '16px' }">
      <div class="image-upload-popup">
        <div class="popup-title">插入图片</div>
        <van-uploader
          v-model="uploadedImages"
          :after-read="handleImageUpload"
          :max-count="9"
          :max-size="5 * 1024 * 1024"
          @oversize="onOversize"
          multiple
          preview-size="80"
        />
        <div class="upload-tips">
          <p>支持 jpg, png, gif 格式，单张不超过 5MB</p>
        </div>
        <van-button 
          type="primary" 
          block 
          :loading="uploading"
          @click="confirmInsertImages"
        >
          插入已上传图片
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog, showLoadingToast, closeToast, showFailToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import type { UploaderFileListItem } from 'vant'
import { request } from '@/utils/request'
import { FILE_UPLOAD_ENDPOINTS } from '@/api/endpoints/file'

const router = useRouter()

// 文档数据
const documentTitle = ref('活动计划书')
const documentContent = ref('')
const documentStatus = ref('编辑中')
const lastEditTime = ref('刚刚')

// 格式选项
const formatOptions = reactive({
  bold: false,
  italic: false,
  underline: false
})

// 弹窗状态
const showActions = ref(false)
const showHeadingPicker = ref(false)
const showPreview = ref(false)
const showLinkDialog = ref(false)
const showImageUpload = ref(false)

// 图片上传状态
const uploadedImages = ref<UploaderFileListItem[]>([])
const uploading = ref(false)

// 链接表单
const linkForm = reactive({
  text: '',
  url: ''
})

// 操作菜单选项
const actionOptions = [
  { name: '导出文档', value: 'export' },
  { name: '分享文档', value: 'share' },
  { name: '历史版本', value: 'history' },
  { name: '文档设置', value: 'settings' },
  { name: '删除文档', value: 'delete', color: '#ee0a24' }
]

// 标题级别选项
const headingOptions = [
  { text: '正文', value: 'p' },
  { text: '标题 1', value: 'h1' },
  { text: '标题 2', value: 'h2' },
  { text: '标题 3', value: 'h3' },
  { text: '标题 4', value: 'h4' }
]

// 渲染内容
const renderedContent = computed(() => {
  if (!documentContent.value) return '<p style="color: #999;">暂无内容</p>'
  // 简单的Markdown转HTML
  let html = documentContent.value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
  return html
})

// 切换格式
const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
  formatOptions[format] = !formatOptions[format]
  const markers: Record<string, string> = {
    bold: '**',
    italic: '*',
    underline: '__'
  }
  showToast(`${formatOptions[format] ? '开启' : '关闭'}${format}`)
}

// 标题确认
const onHeadingConfirm = ({ selectedValues, selectedOptions }: any) => {
  showToast(`设置为${selectedOptions[0]?.text}`)
  showHeadingPicker.value = false
}

// 插入列表
const insertList = (type: 'bullet' | 'number') => {
  const prefix = type === 'bullet' ? '- ' : '1. '
  documentContent.value += '\n' + prefix
  showToast(`插入${type === 'bullet' ? '无序' : '有序'}列表`)
}

// 显示图片选择
const showImagePicker = () => {
  uploadedImages.value = []
  showImageUpload.value = true
}

// 图片上传处理
const handleImageUpload = async (file: UploaderFileListItem | UploaderFileListItem[]) => {
  const files = Array.isArray(file) ? file : [file]
  
  for (const item of files) {
    if (!item.file) continue
    
    uploading.value = true
    
    try {
      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('type', 'document')
      
      const response = await request.post<{ url: string; filename: string }>(
        FILE_UPLOAD_ENDPOINTS.UPLOAD_IMAGE,
        formData
      )
      
      if (response.data?.url) {
        item.url = response.data.url
        item.status = 'done'
        item.message = ''
      } else {
        item.status = 'failed'
        item.message = '上传失败'
      }
    } catch (error: any) {
      item.status = 'failed'
      item.message = error?.message || '上传失败'
    }
    
    uploading.value = false
  }
}

// 图片超过大小
const onOversize = () => {
  showFailToast('图片大小不能超过 5MB')
}

// 确认插入图片
const confirmInsertImages = () => {
  const successImages = uploadedImages.value.filter(img => img.url && img.status === 'done')
  
  if (successImages.length === 0) {
    showToast('请先上传图片')
    return
  }
  
  // 插入图片Markdown标记
  const imageMarkdown = successImages
    .map(img => `![image](${img.url})`)
    .join('\n')
  
  documentContent.value += '\n' + imageMarkdown + '\n'
  showImageUpload.value = false
  showSuccessToast(`已插入 ${successImages.length} 张图片`)
}

// 插入链接
const insertLink = () => {
  linkForm.text = ''
  linkForm.url = ''
  showLinkDialog.value = true
}

// 确认插入链接
const confirmInsertLink = () => {
  if (linkForm.url) {
    documentContent.value += `[${linkForm.text || linkForm.url}](${linkForm.url})`
    showToast('链接已插入')
  }
}

// 插入表格
const insertTable = () => {
  const tableTemplate = '\n| 列名 | 列名 |\n| --- | --- |\n| 内容 | 内容 |\n'
  documentContent.value += tableTemplate
  showToast('表格已插入')
}

// 分享文档
const shareDocument = async () => {
  const shareUrl = `${window.location.origin}/document/${Date.now()}`
  const shareText = `查看文档：${documentTitle.value}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: documentTitle.value || '文档',
        text: shareText,
        url: shareUrl
      })
      showSuccessToast('分享成功')
    } catch (error) {
      await copyShareLink(shareUrl)
    }
  } else {
    await copyShareLink(shareUrl)
  }
}

// 复制分享链接
const copyShareLink = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('链接已复制')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showSuccessToast('链接已复制')
  }
}

// 导出文档
const exportDocument = async () => {
  if (!documentTitle.value && !documentContent.value) {
    showToast('文档内容为空')
    return
  }
  
  showLoadingToast({ message: '导出中...', forbidClick: true })
  
  try {
    // 生成文档内容
    const content = `# ${documentTitle.value}\n\n${documentContent.value}`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${documentTitle.value || '文档'}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    closeToast()
    showSuccessToast('导出成功')
  } catch (error: any) {
    closeToast()
    showFailToast(error?.message || '导出失败')
  }
}

// 操作选择
const onActionSelect = async (action: any) => {
  switch (action.value) {
    case 'export':
      await exportDocument()
      break
    case 'share':
      await shareDocument()
      break
    case 'history':
      showToast('历史版本功能暂未开放')
      break
    case 'settings':
      showToast('文档设置功能暂未开放')
      break
    case 'delete':
      showConfirmDialog({
        title: '删除文档',
        message: '确定要删除这个文档吗？'
      }).then(() => {
        showToast('文档已删除')
        router.back()
      }).catch(() => {})
      break
  }
}

// 保存草稿
const handleSaveDraft = () => {
  documentStatus.value = '草稿'
  lastEditTime.value = new Date().toLocaleTimeString()
  showToast('草稿已保存')
}

// 保存文档
const handleSave = () => {
  if (!documentTitle.value) {
    showToast('请输入文档标题')
    return
  }
  documentStatus.value = '已保存'
  lastEditTime.value = new Date().toLocaleTimeString()
  showSuccessToast('文档已保存')
}

// 预览文档
const handlePreview = () => {
  showPreview.value = true
}

// 返回
const handleBack = () => {
  if (documentContent.value) {
    showConfirmDialog({
      title: '提示',
      message: '文档未保存，是否放弃编辑？'
    }).then(() => {
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.mobile-document-editor {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.doc-info {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;

  .title-input {
    padding: 0;
    font-size: 18px;
    font-weight: 600;

    :deep(.van-field__control) {
      font-weight: 600;
    }
  }

  .doc-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  overflow-x: auto;

  .tool-group {
    display: flex;
    gap: 4px;
  }

  .tool-divider {
    width: 1px;
    height: 24px;
    background: #e0e0e0;
    margin: 0 8px;
  }

  .tool-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: #666;

    &:active {
      background: #e6f4ff;
    }

    &.active {
      background: #e6f4ff;
      color: #1677ff;
    }
  }
}

.editor-area {
  flex: 1;
  padding: 16px;

  .content-editor {
    padding: 0;

    :deep(.van-field__control) {
      min-height: 300px;
      line-height: 1.6;
    }
  }
}

.action-bar {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;

  .van-button {
    flex: 1;
  }
}

.preview-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 16px;
    font-weight: 600;
  }

  .preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    h1 {
      font-size: 22px;
      margin-bottom: 16px;
      color: #333;
    }

    .preview-body {
      line-height: 1.8;
      color: #333;
    }
  }
}

.link-form {
  padding: 16px;
}

.image-upload-popup {
  .popup-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .upload-tips {
    margin: 12px 0;
    font-size: 12px;
    color: #999;
    
    p {
      margin: 0;
    }
  }
}
</style>
