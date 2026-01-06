<template>
  <div class="screenshot-upload">
    <el-upload
      :action="uploadAction"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleUploadSuccess"
      accept="image/*"
    >
      <el-button type="primary">
        <UnifiedIcon name="Upload" />
        上传截图
      </el-button>
    </el-upload>
    
    <div v-if="screenshots.length > 0" class="screenshots-list">
      <div
        v-for="screenshot in screenshots"
        :key="screenshot.id"
        class="screenshot-item"
      >
        <el-image
          :src="screenshot.imageUrl"
          :preview-src-list="[screenshot.imageUrl]"
          fit="cover"
        />
        <div class="screenshot-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleAnalyze(screenshot.id)"
          >
            <UnifiedIcon name="default" />
            AI分析
          </el-button>
        </div>
        <div v-if="screenshot.recognizedText" class="recognized-text">
          <p><strong>识别文字：</strong></p>
          <p>{{ screenshot.recognizedText }}</p>
        </div>
      </div>
    </div>
    
    <el-empty v-else description="暂无截图" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Upload, MagicStick } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { ConversationScreenshot } from '@/api/modules/teacher-sop';

interface Props {
  customerId: number;
  screenshots: ConversationScreenshot[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  upload: [data: any];
  analyze: [screenshotId: number];
}>();

const uploadAction = computed(() => {
  return `/api/upload/screenshot`;
});

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }
  return true;
}

function handleUploadSuccess(response: any) {
  if (response.success) {
    emit('upload', {
      imageUrl: response.data.url
    });
  }
}

function handleAnalyze(screenshotId: number) {
  emit('analyze', screenshotId);
}
</script>

<style scoped lang="scss">
.screenshot-upload {
  .screenshots-list {
    margin-top: var(--text-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);
    
    .screenshot-item {
      border: var(--border-width-base) solid var(--border-color-light);
      border-radius: var(--spacing-sm);
      padding: var(--text-sm);
      
      .el-image {
        width: 100%;
        min-height: 60px; height: auto;
        border-radius: var(--spacing-xs);
        margin-bottom: var(--text-sm);
      }
      
      .screenshot-actions {
        margin-bottom: var(--text-sm);
      }
      
      .recognized-text {
        font-size: var(--text-sm);
        color: var(--text-regular);
        line-height: 1.6;
        
        p {
          margin: var(--spacing-xs) 0;
        }
      }
    }
  }
}
</style>
