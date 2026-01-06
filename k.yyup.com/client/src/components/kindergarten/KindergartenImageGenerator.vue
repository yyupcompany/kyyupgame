<template>
  <div class="kindergarten-image-generator">
    <!-- 快速生成按钮 -->
    <el-button
      v-if="!isGenerating && !generatedImageUrl"
      type="primary"
      :icon="Picture"
      size="small"
      @click="showQuickOptions = true"
      class="quick-generate-btn"
    >
      🎨 幼儿园AI配图
    </el-button>

    <!-- 生成中状态 -->
    <div v-if="isGenerating" class="generating-status">
      <UnifiedIcon name="default" />
      <span class="ml-2">正在为小朋友们生成可爱的图片...</span>
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
        <el-button size="small" type="primary" @click="useGeneratedImage">
          ✨ 使用这张图片
        </el-button>
        <el-button size="small" @click="regenerateImage">
          🔄 重新生成
        </el-button>
        <el-button size="small" type="danger" @click="clearGeneratedImage">
          🗑️ 清除
        </el-button>
      </div>
    </div>

    <!-- 快速选项对话框 -->
    <el-dialog
      v-model="showQuickOptions"
      title="🎨 幼儿园AI智能配图"
      width="600px"
      :before-close="handleDialogClose"
    >
      <div class="quick-options">
        <h4>🚀 快速生成 (推荐)</h4>
        <div class="quick-templates">
          <el-button
            v-for="template in quickTemplates"
            :key="template.key"
            @click="generateFromTemplate(template)"
            :loading="isGenerating"
            class="template-btn"
          >
            {{ template.icon }} {{ template.name }}
          </el-button>
        </div>

        <el-divider>或者自定义生成</el-divider>

        <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="80px">
          <el-form-item label="活动描述" prop="prompt">
            <el-input
              v-model="generateForm.prompt"
              type="textarea"
              :rows="3"
              placeholder="描述您想要的幼儿园场景，例如：小朋友们在操场上快乐地做游戏"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="年龄段" prop="ageGroup">
            <el-select v-model="generateForm.ageGroup" placeholder="选择年龄段">
              <el-option label="👶 小班 (3-4岁)" value="small" />
              <el-option label="🧒 中班 (4-5岁)" value="medium" />
              <el-option label="👦 大班 (5-6岁)" value="large" />
              <el-option label="👨‍👩‍👧‍👦 混龄 (3-6岁)" value="mixed" />
            </el-select>
          </el-form-item>

          <el-form-item label="场景类型" prop="sceneType">
            <el-select v-model="generateForm.sceneType" placeholder="选择场景类型">
              <el-option label="🏫 室内教室" value="indoor" />
              <el-option label="🌳 户外操场" value="outdoor" />
              <el-option label="🍽️ 餐厅用餐" value="dining" />
              <el-option label="😴 午休时间" value="nap" />
              <el-option label="🎭 表演活动" value="performance" />
              <el-option label="🎨 手工制作" value="craft" />
            </el-select>
          </el-form-item>

          <el-form-item label="图片风格" prop="style">
            <el-radio-group v-model="generateForm.style">
              <el-radio value="cartoon">🎨 卡通可爱 (推荐)</el-radio>
              <el-radio value="natural">🌟 自然温馨</el-radio>
              <el-radio value="realistic">📸 真实摄影</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="图片尺寸" prop="size">
            <el-radio-group v-model="generateForm.size">
              <el-radio value="1024x768">📱 横向 (1024x768)</el-radio>
              <el-radio value="1024x1024">⬜ 正方形 (1024x1024)</el-radio>
              <el-radio value="768x1024">📱 纵向 (768x1024)</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showQuickOptions = false">取消</el-button>
          <el-button type="primary" @click="generateCustomImage" :loading="isGenerating">
            🎨 生成图片
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { autoImageApi } from '@/api/auto-image'

interface Props {
  // 自动使用生成的图片
  autoUse?: boolean
  // 默认活动类型
  defaultActivityType?: string
}

interface Emits {
  (e: 'image-generated', imageUrl: string): void
  (e: 'image-used', imageUrl: string): void
}

const props = withDefaults(defineProps<Props>(), {
  autoUse: false,
  defaultActivityType: 'activity'
})

const emit = defineEmits<Emits>()

// 响应式数据
const showQuickOptions = ref(false)
const isGenerating = ref(false)
const generatedImageUrl = ref('')
const generateFormRef = ref()

// 快速模板
const quickTemplates = [
  {
    key: 'morning-exercise',
    name: '晨间锻炼',
    icon: '🏃‍♀️',
    prompt: '3-6岁的小朋友们在幼儿园操场上做晨间锻炼，大家排成整齐的队伍，跟着老师一起做体操，阳光明媚，充满活力'
  },
  {
    key: 'art-class',
    name: '美术课堂',
    icon: '🎨',
    prompt: '幼儿园美术教室里，小朋友们正在专心致志地画画，桌上摆满了彩色画笔和颜料，孩子们脸上洋溢着创作的快乐'
  },
  {
    key: 'story-time',
    name: '故事时间',
    icon: '📚',
    prompt: '温馨的图书角，老师正在给围坐成圆圈的小朋友们讲故事，孩子们聚精会神地听着，眼中充满好奇和想象'
  },
  {
    key: 'lunch-time',
    name: '快乐用餐',
    icon: '🍽️',
    prompt: '幼儿园餐厅里，小朋友们坐在小桌子旁安静地用餐，餐具摆放整齐，营养丰富的饭菜，培养良好的用餐习惯'
  },
  {
    key: 'outdoor-play',
    name: '户外游戏',
    icon: '🌳',
    prompt: '幼儿园花园里，孩子们在滑梯、秋千等游乐设施上快乐地玩耍，绿树成荫，安全的游戏环境，充满欢声笑语'
  },
  {
    key: 'music-dance',
    name: '音乐舞蹈',
    icon: '🎵',
    prompt: '音乐教室里，小朋友们跟着老师学习唱歌跳舞，手拉手围成圆圈，音符在空中飞舞，培养艺术素养'
  }
]

// 生成表单
const generateForm = reactive({
  prompt: '小朋友们在幼儿园里快乐地学习和游戏',
  ageGroup: 'mixed',
  sceneType: 'indoor',
  style: 'cartoon',
  size: '1024x768'
})

// 表单验证规则
const generateRules = {
  prompt: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 5, max: 300, message: '描述长度应在5-300字符之间', trigger: 'blur' }
  ]
}

// 从模板生成图片
const generateFromTemplate = async (template: any) => {
  try {
    isGenerating.value = true
    showQuickOptions.value = false
    
    ElMessage.info(`正在生成"${template.name}"场景图片...`)
    
    const response = await autoImageApi.generateImage({
      prompt: template.prompt,
      category: 'activity',
      style: 'cartoon',
      size: '1024x768',
      quality: 'standard',
      watermark: true
    })
    
    if (response.success && response.data.imageUrl) {
      generatedImageUrl.value = response.data.imageUrl
      ElMessage.success(`${template.name}场景图片生成成功！`)
      emit('image-generated', response.data.imageUrl)
      
      if (props.autoUse) {
        useGeneratedImage()
      }
    } else {
      ElMessage.error(response.message || '图片生成失败')
    }
  } catch (error: any) {
    console.error('模板图片生成失败:', error)
    ElMessage.error(error.message || '图片生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 自定义生成图片
const generateCustomImage = async () => {
  try {
    const valid = await generateFormRef.value?.validate()
    if (!valid) return

    isGenerating.value = true
    showQuickOptions.value = false
    
    // 构建详细的提示词
    const ageGroupMap = {
      small: '3-4岁小班',
      medium: '4-5岁中班', 
      large: '5-6岁大班',
      mixed: '3-6岁混龄'
    }
    
    const sceneTypeMap = {
      indoor: '室内教室环境',
      outdoor: '户外操场环境',
      dining: '餐厅用餐环境',
      nap: '午休室环境',
      performance: '表演舞台环境',
      craft: '手工制作环境'
    }
    
    const detailedPrompt = `${ageGroupMap[generateForm.ageGroup]}的小朋友们在${sceneTypeMap[generateForm.sceneType]}中，${generateForm.prompt}，温馨安全的幼儿园氛围，孩子们天真可爱的笑容`
    
    const response = await autoImageApi.generateImage({
      prompt: detailedPrompt,
      category: 'activity',
      style: generateForm.style,
      size: generateForm.size,
      quality: 'standard',
      watermark: true
    })
    
    if (response.success && response.data.imageUrl) {
      generatedImageUrl.value = response.data.imageUrl
      ElMessage.success('自定义图片生成成功！')
      emit('image-generated', response.data.imageUrl)
      
      if (props.autoUse) {
        useGeneratedImage()
      }
    } else {
      ElMessage.error(response.message || '图片生成失败')
    }
  } catch (error: any) {
    console.error('自定义图片生成失败:', error)
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
  showQuickOptions.value = true
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
  generateFromTemplate,
  generateCustomImage,
  clearGeneratedImage,
  generatedImageUrl: () => generatedImageUrl.value
})
</script>

<style scoped lang="scss">
.kindergarten-image-generator {
  .quick-generate-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    border: none;
    border-radius: var(--radius-xl);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-weight: 500;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--glow-primary);
    }
  }

  .generating-status {
    display: flex;
    align-items: center;
    color: var(--primary-color);
    font-size: var(--text-base);
    padding: var(--spacing-sm);
    background: var(--primary-light-bg);
    border-radius: var(--radius-sm);
    border-left: var(--spacing-xs) solid var(--primary-color);
    
    .el-icon {
      font-size: var(--text-lg);
      margin-right: var(--spacing-sm);
    }
  }

  .generated-image-preview {
    margin-top: var(--text-sm);
    
    .preview-image {
      width: 100%;
      max-width: 100%; max-width: 300px;
      min-min-height: 60px; height: auto; height: auto;
      border-radius: var(--radius-sm);
      border: 2px solid var(--border-color-lighter);
      box-shadow: var(--shadow-md);
    }
    
    .image-actions {
      margin-top: var(--text-sm);
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      
      .el-button {
        border-radius: var(--text-lg);
        font-size: var(--text-sm);
      }
    }
  }

  .quick-options {
    h4 {
      margin: 0 0 var(--text-lg) 0;
      color: var(--text-primary);
      font-size: var(--text-lg);
    }

    .quick-templates {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--text-sm);
      margin-bottom: var(--spacing-xl);

      .template-btn {
        height: 60px;
        border-radius: var(--radius-lg);
        border: 2px solid var(--border-color-lighter);
        background: var(--bg-card);
        color: var(--text-regular);
        font-size: var(--text-sm);
        transition: var(--transition-base);

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }
    }
  }

  .dialog-footer {
    .el-button {
      border-radius: var(--text-lg);
      padding: var(--spacing-sm) var(--spacing-xl);
    }
  }
}
</style>
