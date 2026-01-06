<template>
  <el-dialog
    v-model="dialogVisible"
    title="生成分享链接"
    width="600px"
    :before-close="handleClose"
  >
    <div class="share-link-dialog">
      <!-- 分享类型选择 -->
      <el-form :model="form" label-width="100px">
        <el-form-item label="分享类型">
          <el-radio-group v-model="form.shareType">
            <el-radio label="teacher">老师分享</el-radio>
            <el-radio label="principal">园长分享</el-radio>
            <el-radio label="wechat">微信分享</el-radio>
            <el-radio label="qrcode">二维码</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="分享链接">
          <el-input
            v-model="shareLink"
            readonly
            placeholder="点击生成按钮生成分享链接"
          >
            <template #append>
              <el-button @click="handleCopy" :icon="CopyDocument">
                复制
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="二维码">
          <div class="qrcode-container">
            <div v-if="qrcodeUrl" class="qrcode-image">
              <img :src="qrcodeUrl" alt="分享二维码" />
            </div>
            <div v-else class="qrcode-placeholder">
              <el-icon :size="48"><DocumentCopy /></el-icon>
              <p>点击生成按钮生成二维码</p>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <!-- 使用说明 -->
      <el-alert
        title="使用说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <ul class="usage-tips">
            <li>选择分享类型后，点击"生成链接"按钮</li>
            <li>复制链接分享给家长，家长通过链接报名后会自动分配给您</li>
            <li>可以下载二维码图片，打印后张贴或分享</li>
            <li>通过分享链接报名的家长会自动记录来源信息</li>
          </ul>
        </template>
      </el-alert>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleGenerate">
          生成链接
        </el-button>
        <el-button 
          v-if="qrcodeUrl" 
          type="success" 
          @click="handleDownloadQRCode"
        >
          下载二维码
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, DocumentCopy } from '@element-plus/icons-vue'
import { generateActivityShareLink, copyToClipboard } from '@/utils/share-link'
import { useUserStore } from '@/stores/user'
import QRCode from 'qrcode'

interface Props {
  modelValue: boolean
  activityId: number | string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const form = ref({
  shareType: 'teacher' as 'teacher' | 'principal' | 'wechat' | 'qrcode'
})

// 分享链接
const shareLink = ref('')

// 二维码URL
const qrcodeUrl = ref('')

// 生成分享链接
const handleGenerate = async () => {
  const userId = userStore.user?.id
  if (!userId) {
    ElMessage.error('请先登录')
    return
  }
  
  // 生成链接
  shareLink.value = generateActivityShareLink(
    props.activityId,
    userId,
    form.value.shareType
  )
  
  // 生成二维码
  try {
    qrcodeUrl.value = await QRCode.toDataURL(shareLink.value, {
      width: 200,
      margin: 2,
      color: {
        dark: 'var(--text-primary)',
        light: 'var(--color-white)'
      }
    })
    ElMessage.success('分享链接和二维码生成成功')
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败')
  }
}

// 复制链接
const handleCopy = async () => {
  if (!shareLink.value) {
    ElMessage.warning('请先生成分享链接')
    return
  }
  
  const success = await copyToClipboard(shareLink.value)
  if (success) {
    ElMessage.success('链接已复制到剪贴板')
  } else {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 下载二维码
const handleDownloadQRCode = () => {
  if (!qrcodeUrl.value) {
    ElMessage.warning('请先生成二维码')
    return
  }
  
  const link = document.createElement('a')
  link.href = qrcodeUrl.value
  link.download = `activity-${props.activityId}-qrcode.png`
  link.click()
  ElMessage.success('二维码下载成功')
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 监听对话框打开，自动生成链接
watch(dialogVisible, (newVal) => {
  if (newVal) {
    // 对话框打开时自动生成链接
    setTimeout(() => {
      handleGenerate()
    }, 100)
  } else {
    // 对话框关闭时清空数据
    shareLink.value = ''
    qrcodeUrl.value = ''
  }
})
</script>

<style lang="scss" scoped>
.share-link-dialog {
  .qrcode-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 220px;
    
    .qrcode-image {
      img {
        width: 200px;
        height: 200px;
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--spacing-xs);
      }
    }
    
    .qrcode-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--info-color);
      
      p {
        margin-top: var(--text-sm);
        font-size: var(--text-base);
      }
    }
  }
  
  .usage-tips {
    margin: 0;
    padding-left: var(--text-2xl);
    
    li {
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-base);
      line-height: 1.6;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
</style>

