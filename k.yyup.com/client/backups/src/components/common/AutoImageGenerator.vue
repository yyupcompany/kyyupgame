<template>
  <div class="auto-image-generator">
    <!-- 自动配图按钮 -->
    <el-button
      v-if="!isGenerating && !generatedImageUrl"
      type="primary"
      :icon="Picture"
      size="small"
      @click="showGenerateDialog = true"
    >
      {{ buttonText }}
    </el-button>

    <!-- 生成中状态 -->
    <div v-if="isGenerating" class="generating-status">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span class="ml-2">AI配图生成中...</span>
    </div>

    <!-- 生成的图片预览 -->
    <div v-if="generatedImageUrl && !isGenerating" class="generated-image-preview">
      <el-image
        :src="generatedImageUrl"
        :preview-src-list="[generatedImageUrl]"
        fit="cover"
        class="preview-image"
      />
      <div class="image-actions">
        <el-button size="small" @click="useGeneratedImage">使用此图</el-button>
        <el-button size="small" @click="regenerateImage">重新生成</el-button>
        <el-button size="small" type="danger" @click="clearGeneratedImage">清除</el-button>
      </div>
    </div>

    <!-- 生成配置对话框 -->
    <el-dialog
      v-model="showGenerateDialog"
      title="AI自动配图"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="80px">
        <el-form-item label="描述词" prop="prompt">
          <el-input
            v-model="generateForm.prompt"
            type="textarea"
            :rows="3"
            placeholder="请描述您想要生成的图片内容，例如：3-6岁的小朋友们在温馨的幼儿园教室里快乐地学习和游戏"
            maxlength="500"
            show-word-limit
          />
          <div class="prompt-tips">
            <el-tag size="small" type="info">💡 提示：描述中可以包含年龄段(3-6岁)、活动内容、环境氛围等</el-tag>
          </div>
        </el-form-item>

        <el-form-item label="图片分类" prop="category">
          <el-select v-model="generateForm.category" placeholder="请选择图片分类">
            <el-option label="🎮 幼儿园活动场景" value="activity" />
            <el-option label="📢 招生宣传海报" value="poster" />
            <el-option label="📋 教学模板素材" value="template" />
            <el-option label="🎯 家长营销宣传" value="marketing" />
            <el-option label="📚 学前教育场景" value="education" />
          </el-select>
          <div class="category-tips">
            <el-tag size="small" type="success">推荐：活动场景和教育场景最适合日常使用</el-tag>
          </div>
        </el-form-item>

        <el-form-item label="图片风格" prop="style">
          <el-select v-model="generateForm.style" placeholder="请选择图片风格">
            <el-option label="🎨 卡通可爱风格 (推荐)" value="cartoon" />
            <el-option label="🌟 自然温馨风格" value="natural" />
            <el-option label="📸 写实摄影风格" value="realistic" />
            <el-option label="🎭 艺术创意风格" value="artistic" />
          </el-select>
          <div class="style-tips">
            <el-tag size="small" type="warning">💡 卡通风格最受3-6岁孩子喜爱</el-tag>
          </div>
        </el-form-item>

        <el-form-item label="图片尺寸" prop="size">
          <el-select v-model="generateForm.size" placeholder="请选择图片尺寸">
            <el-option label="正方形 (1024x1024)" value="1024x1024" />
            <el-option label="横向 (1024x768)" value="1024x768" />
            <el-option label="纵向 (768x1024)" value="768x1024" />
            <el-option label="小尺寸 (512x512)" value="512x512" />
          </el-select>
        </el-form-item>

        <el-form-item label="图片质量" prop="quality">
          <el-select v-model="generateForm.quality" placeholder="请选择图片质量">
            <el-option label="标准质量" value="standard" />
            <el-option label="高清质量" value="hd" />
          </el-select>
        </el-form-item>

        <el-form-item label="添加水印">
          <el-switch v-model="generateForm.watermark" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showGenerateDialog = false">取消</el-button>
          <el-button type="primary" @click="generateImage" :loading="isGenerating">
            生成图片
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { autoImageApi } from '@/api/auto-image'

interface Props {
  // 按钮文本
  buttonText?: string
  // 默认提示词
  defaultPrompt?: string
  // 默认分类
  defaultCategory?: 'activity' | 'poster' | 'template' | 'marketing' | 'education'
  // 默认风格
  defaultStyle?: 'natural' | 'cartoon' | 'realistic' | 'artistic'
  // 默认尺寸
  defaultSize?: '512x512' | '1024x1024' | '1024x768' | '768x1024'
  // 是否自动使用生成的图片
  autoUse?: boolean
}

interface Emits {
  (e: 'image-generated', imageUrl: string): void
  (e: 'image-used', imageUrl: string): void
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: '🎨 AI智能配图',
  defaultCategory: 'activity',
  defaultStyle: 'cartoon',  // 默认使用卡通风格，更适合幼儿园
  defaultSize: '1024x768',
  autoUse: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const showGenerateDialog = ref(false)
const isGenerating = ref(false)
const generatedImageUrl = ref('')
const generateFormRef = ref()

// 生成表单
const generateForm = reactive({
  prompt: props.defaultPrompt || '', // 取消默认提示词
  category: props.defaultCategory,
  style: props.defaultStyle,
  size: props.defaultSize,
  quality: 'standard' as 'standard' | 'hd',
  watermark: true
})

// 表单验证规则
const generateRules = {
  prompt: [
    { required: true, message: '请输入图片描述词', trigger: 'blur' },
    { min: 1, max: 500, message: '描述词长度应在1-500字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ],
  style: [
    { required: true, message: '请选择图片风格', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请选择图片尺寸', trigger: 'change' }
  ],
  quality: [
    { required: true, message: '请选择图片质量', trigger: 'change' }
  ]
}

// 生成图片
const generateImage = async () => {
  try {
    // 表单验证
    const valid = await generateFormRef.value?.validate()
    if (!valid) return

    isGenerating.value = true

    const response = await autoImageApi.generateImage({
      prompt: generateForm.prompt,
      category: generateForm.category,
      style: generateForm.style,
      size: generateForm.size,
      quality: generateForm.quality,
      watermark: generateForm.watermark
    })

    if (response.success && response.data.imageUrl) {
      generatedImageUrl.value = response.data.imageUrl
      showGenerateDialog.value = false
      
      ElMessage.success('图片生成成功！')
      emit('image-generated', response.data.imageUrl)

      // 如果设置了自动使用，直接使用生成的图片
      if (props.autoUse) {
        useGeneratedImage()
      }
    } else {
      ElMessage.error(response.message || '图片生成失败')
    }
  } catch (error: any) {
    console.error('图片生成失败:', error)
    ElMessage.error(error.message || '图片生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 使用生成的图片
const useGeneratedImage = () => {
  if (generatedImageUrl.value) {
    emit('image-used', generatedImageUrl.value)
    ElMessage.success('已使用生成的图片')
  }
}

// 重新生成图片
const regenerateImage = () => {
  showGenerateDialog.value = true
}

// 清除生成的图片
const clearGeneratedImage = async () => {
  try {
    await ElMessageBox.confirm('确定要清除生成的图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    generatedImageUrl.value = ''
    ElMessage.success('已清除生成的图片')
  } catch {
    // 用户取消
  }
}

// 处理对话框关闭
const handleDialogClose = (done: () => void) => {
  if (isGenerating.value) {
    ElMessage.warning('图片生成中，请稍候...')
    return
  }
  done()
}

// 暴露方法给父组件
defineExpose({
  generateImage,
  clearGeneratedImage,
  generatedImageUrl: computed(() => generatedImageUrl.value)
})
</script>

<style scoped lang="scss">
.auto-image-generator {
  .generating-status {
    display: flex;
    align-items: center;
    color: var(--primary-color);
    font-size: var(--text-base);
    
    .el-icon {
      font-size: var(--text-lg);
    }
  }

  .generated-image-preview {
    margin-top: var(--spacing-2xl);
    
    .preview-image {
      width: 200px;
      height: 150px;
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);
    }
    
    .image-actions {
      margin-top: var(--spacing-sm);
      display: flex;
      gap: var(--spacing-sm);
      
      .el-button {
        flex: 1;
      }
    }
  }
}

.dialog-footer {
  .el-button {
    margin-left: var(--spacing-2xl);
  }
}

.prompt-tips,
.category-tips,
.style-tips {
  margin-top: var(--spacing-sm);

  .el-tag {
    font-size: var(--text-sm);
  }
}
</style>
