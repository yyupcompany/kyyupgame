<template>
  <div class="text-to-speech">
    <div class="tts-header">
      <h3>AI文字转语音</h3>
      <p>将文字内容转换为自然流畅的语音，支持多种音色和语速调节</p>
    </div>

    <div class="tts-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-form :model="formData" label-width="100px" @submit.prevent>
          <el-form-item label="文本内容">
            <el-input 
              v-model="formData.text"
              type="textarea"
              :rows="8"
              placeholder="请输入要转换为语音的文字内容（最多4096字符）"
              maxlength="4096"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="音色选择">
            <el-select
              v-model="formData.voice"
              placeholder="选择音色"
              filterable
            >
              <el-option-group
                v-for="group in voiceGroups"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="voice in group.options"
                  :key="voice.value"
                  :label="voice.label"
                  :value="voice.value"
                >
                  <div class="voice-option-item">
                    <span class="voice-label">{{ voice.label }}</span>
                    <span class="voice-desc">{{ voice.description }}</span>
                    <el-button
                      v-if="voice.previewText"
                      size="small"
                      text
                      type="primary"
                      @click.stop="previewVoice(voice)"
                      :loading="previewingVoice === voice.value"
                      class="preview-btn"
                    >
                      <UnifiedIcon name="default" />
                      试听
                    </el-button>
                  </div>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item label="语速">
            <el-slider 
              v-model="formData.speed"
              :min="0.25"
              :max="4.0"
              :step="0.25"
              :marks="speedMarks"
              show-stops
            />
            <div class="speed-label">{{ formData.speed }}x</div>
          </el-form-item>

          <el-form-item label="输出格式">
            <el-radio-group v-model="formData.format">
              <el-radio label="mp3">MP3</el-radio>
              <el-radio label="opus">Opus</el-radio>
              <el-radio label="aac">AAC</el-radio>
              <el-radio label="flac">FLAC</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateSpeech"
              :loading="generating"
              :disabled="!canGenerate"
              size="large"
              style="width: 100%"
            >
              <UnifiedIcon name="default" />
              <span v-if="generating">
                <UnifiedIcon name="default" />
                {{ progressText }}
              </span>
              <span v-else>生成语音</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 快速模板 -->
        <div class="quick-templates">
          <h4>快速模板</h4>
          <div class="template-list">
            <div 
              v-for="template in quickTemplates" 
              :key="template.id"
              class="template-item"
              @click="applyTemplate(template)"
            >
              <div class="template-title">{{ template.title }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <h4>语音预览</h4>
        
        <div v-if="!generatedAudio" class="empty-state">
          <UnifiedIcon name="default" />
          <p>请填写左侧信息，开始AI语音生成</p>
        </div>

        <div v-else class="audio-preview">
          <div class="audio-info">
            <UnifiedIcon name="Check" />
            <h3>语音生成成功！</h3>
            <p>文本长度: {{ formData.text.length }} 字符</p>
            <p>音色: {{ getVoiceName(formData.voice) }}</p>
            <p>语速: {{ formData.speed }}x</p>
            <p>格式: {{ formData.format.toUpperCase() }}</p>
          </div>

          <div class="audio-player">
            <audio 
              ref="audioPlayer"
              :src="audioUrl"
              controls
              style="width: 100%"
            ></audio>
          </div>

          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="downloadAudio"
              :icon="Download"
            >
              下载语音文件
            </el-button>
            <el-button 
              @click="regenerate"
              :icon="Refresh"
            >
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Refresh,
  Download,
  Check,
  Loading,
  Document,
  VideoPlay
} from '@element-plus/icons-vue'

// 导入request工具
import { request } from '@/utils/request'

// 组件事件
const emit = defineEmits(['audio-created'])

// 响应式数据
const generating = ref(false)
const generatedAudio = ref<any>(null)
const progressText = ref('')
const audioUrl = ref('')
const audioPlayer = ref<HTMLAudioElement | null>(null)
const previewingVoice = ref<string>('')
const previewAudioUrl = ref<string>('')

// 表单数据
const formData = ref({
  text: '',
  voice: 'zh_female_cancan_mars_bigtts',
  speed: 1.0,
  format: 'mp3'
})

// 音色分组配置
interface VoiceOption {
  value: string
  label: string
  description: string
  previewText?: string
  scene?: string
}

const voiceGroups = ref([
  {
    label: '🎓 教育场景（推荐）',
    options: [
      {
        value: 'zh_female_yingyujiaoyu_mars_bigtts',
        label: 'Tina老师',
        description: '专业教育音色，适合教学',
        previewText: '小朋友们好，今天我们一起来学习新的知识吧！',
        scene: '教育'
      },
      {
        value: 'zh_female_shaoergushi_mars_bigtts',
        label: '少儿故事',
        description: '温柔亲切，适合讲故事',
        previewText: '从前有一座美丽的城堡，里面住着一位善良的公主。',
        scene: '故事'
      },
      {
        value: 'zh_male_tiancaitongsheng_mars_bigtts',
        label: '天才童声',
        description: '活泼可爱的儿童音色',
        previewText: '大家好，我是小明，很高兴认识你们！',
        scene: '儿童'
      }
    ]
  },
  {
    label: '👶 儿童音色',
    options: [
      {
        value: 'zh_female_peiqi_mars_bigtts',
        label: '佩奇猪',
        description: '可爱活泼的卡通音色',
        previewText: '我是佩奇，这是我的弟弟乔治。',
        scene: '卡通'
      },
      {
        value: 'zh_male_xionger_mars_bigtts',
        label: '熊二',
        description: '憨厚可爱的卡通音色',
        previewText: '熊大，我饿了，我们去找蜂蜜吃吧！',
        scene: '卡通'
      },
      {
        value: 'zh_female_yingtaowanzi_mars_bigtts',
        label: '樱桃丸子',
        description: '甜美可爱的少女音色',
        previewText: '今天天气真好，我们一起去玩吧！',
        scene: '儿童'
      }
    ]
  },
  {
    label: '🎭 通用场景',
    options: [
      {
        value: 'zh_female_cancan_mars_bigtts',
        label: '灿灿（女声）',
        description: '温柔甜美，适合视频配音',
        previewText: '欢迎来到我们的幼儿园，这里充满了欢声笑语。',
        scene: '通用'
      },
      {
        value: 'zh_male_chunhou_mars_bigtts',
        label: '淳厚（男声）',
        description: '沉稳大气，适合纪录片',
        previewText: '教育是一项伟大的事业，需要我们用心去做。',
        scene: '通用'
      },
      {
        value: 'zh_female_qingxin_mars_bigtts',
        label: '清新（女声）',
        description: '清新自然，适合教育视频',
        previewText: '让我们一起探索知识的海洋，发现学习的乐趣。',
        scene: '通用'
      },
      {
        value: 'zh_female_wenroushunv_mars_bigtts',
        label: '温柔淑女',
        description: '温柔优雅的女声',
        previewText: '亲爱的家长朋友们，感谢您对我们工作的支持。',
        scene: '通用'
      },
      {
        value: 'zh_male_yangguangqingnian_mars_bigtts',
        label: '阳光青年',
        description: '阳光活力的男声',
        previewText: '大家好，让我们一起开始今天的活动吧！',
        scene: '通用'
      }
    ]
  },
  {
    label: '📢 播报解说',
    options: [
      {
        value: 'zh_male_jieshuonansheng_mars_bigtts',
        label: '磁性解说男声',
        description: '磁性专业，适合解说',
        previewText: '接下来，让我们一起来了解幼儿园的精彩活动。',
        scene: '解说'
      },
      {
        value: 'zh_male_changtianyi_mars_bigtts',
        label: '悬疑解说',
        description: '富有感染力的解说音色',
        previewText: '在这个充满惊喜的世界里，每一天都有新的发现。',
        scene: '解说'
      },
      {
        value: 'zh_male_chunhui_mars_bigtts',
        label: '广告解说',
        description: '专业广告配音',
        previewText: '选择我们的幼儿园，给孩子一个美好的未来。',
        scene: '广告'
      }
    ]
  },
  {
    label: '🎨 特色音色',
    options: [
      {
        value: 'zh_female_gujie_mars_bigtts',
        label: '顾姐',
        description: '亲切温暖的邻家姐姐',
        previewText: '孩子们，今天我们要做一个有趣的手工作品。',
        scene: '特色'
      },
      {
        value: 'zh_male_silang_mars_bigtts',
        label: '四郎',
        description: '稳重可靠的男声',
        previewText: '各位家长，请注意查收本周的活动安排。',
        scene: '特色'
      },
      {
        value: 'zh_female_qiaopinvsheng_mars_bigtts',
        label: '俏皮女声',
        description: '活泼俏皮的女声',
        previewText: '哇，今天的活动真是太有趣啦！',
        scene: '特色'
      }
    ]
  },
  {
    label: '🌟 经典音色',
    options: [
      {
        value: 'alloy',
        label: '女声-温柔',
        description: '经典温柔女声',
        previewText: '您好，欢迎使用语音合成服务。',
        scene: '经典'
      },
      {
        value: 'nova',
        label: '女声-活泼',
        description: '经典活泼女声',
        previewText: '大家好，很高兴为您服务！',
        scene: '经典'
      },
      {
        value: 'shimmer',
        label: '女声-专业',
        description: '经典专业女声',
        previewText: '这是一段专业的语音播报。',
        scene: '经典'
      },
      {
        value: 'echo',
        label: '男声-沉稳',
        description: '经典沉稳男声',
        previewText: '欢迎收听本期节目。',
        scene: '经典'
      },
      {
        value: 'fable',
        label: '男声-年轻',
        description: '经典年轻男声',
        previewText: '嗨，让我们开始吧！',
        scene: '经典'
      },
      {
        value: 'onyx',
        label: '男声-磁性',
        description: '经典磁性男声',
        previewText: '感谢您的聆听。',
        scene: '经典'
      }
    ]
  }
])

// 语速标记
const speedMarks = {
  0.25: '0.25x',
  1: '1x',
  2: '2x',
  4: '4x'
}

// 快速模板
const quickTemplates = ref([
  {
    id: 1,
    title: '招生宣传语音',
    description: '幼儿园招生宣传语音',
    data: {
      text: '亲爱的家长朋友们，我们幼儿园春季招生火热进行中！我们拥有优质的教育资源、专业的师资力量、丰富的课程特色。欢迎您带着宝贝来参观体验！',
      voice: 'zh_female_cancan_mars_bigtts',
      speed: 1.0,
      format: 'mp3'
    }
  },
  {
    id: 2,
    title: '活动通知语音',
    description: '活动通知播报语音',
    data: {
      text: '各位家长请注意，本周六上午9点，我们将举办亲子运动会。请家长们准时参加，和孩子们一起享受快乐时光！',
      voice: 'zh_female_wenroushunv_mars_bigtts',
      speed: 1.0,
      format: 'mp3'
    }
  },
  {
    id: 3,
    title: '儿童故事语音',
    description: '温馨的睡前故事',
    data: {
      text: '从前有一座美丽的城堡，里面住着一位善良的公主。她每天都会去花园里照顾小动物们，和它们一起玩耍。小朋友们，你们想听公主的故事吗？',
      voice: 'zh_female_shaoergushi_mars_bigtts',
      speed: 0.9,
      format: 'mp3'
    }
  },
  {
    id: 4,
    title: '教学指导语音',
    description: '课堂教学引导',
    data: {
      text: '小朋友们好，今天我们一起来学习新的知识。请大家认真听讲，积极思考，有问题可以举手提问哦！',
      voice: 'zh_female_yingyujiaoyu_mars_bigtts',
      speed: 1.0,
      format: 'mp3'
    }
  }
])

// 计算属性
const canGenerate = computed(() => {
  return formData.value.text.trim().length > 0
})

// 获取音色名称
const getVoiceName = (voice: string) => {
  for (const group of voiceGroups.value) {
    const found = group.options.find(v => v.value === voice)
    if (found) return found.label
  }
  return voice
}

// 预览音色
const previewVoice = async (voice: VoiceOption) => {
  if (!voice.previewText) {
    ElMessage.warning('该音色暂无预览')
    return
  }

  if (previewingVoice.value === voice.value) {
    // 停止当前预览
    stopPreview()
    return
  }

  try {
    previewingVoice.value = voice.value

    // 调用后端API生成预览音频（最多10秒）
    const previewText = voice.previewText.substring(0, 100) // 限制文本长度
    const response = await request.post('/ai/text-to-speech', {
      text: previewText,
      voice: voice.value,
      speed: 1.0,
      format: 'mp3'
    }, {
      responseType: 'blob'
    })

    // 创建音频URL并播放
    const blob = new Blob([response], { type: 'audio/mp3' })
    if (previewAudioUrl.value) {
      URL.revokeObjectURL(previewAudioUrl.value)
    }
    previewAudioUrl.value = URL.createObjectURL(blob)

    // 创建临时音频元素播放
    const audio = new Audio(previewAudioUrl.value)
    audio.volume = 0.8

    // 限制播放时长为10秒
    let playTimeout: number | null = null

    audio.onended = () => {
      previewingVoice.value = ''
      if (playTimeout) clearTimeout(playTimeout)
    }

    audio.onerror = () => {
      previewingVoice.value = ''
      ElMessage.error('预览播放失败')
      if (playTimeout) clearTimeout(playTimeout)
    }

    await audio.play()

    // 10秒后自动停止
    playTimeout = window.setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
      previewingVoice.value = ''
    }, 10000)

    ElMessage.success(`正在试听：${voice.label}`)
  } catch (error) {
    console.error('❌ 音色预览失败:', error)
    ElMessage.error('音色预览失败，请重试')
    previewingVoice.value = ''
  }
}

// 停止预览
const stopPreview = () => {
  previewingVoice.value = ''
  if (previewAudioUrl.value) {
    URL.revokeObjectURL(previewAudioUrl.value)
    previewAudioUrl.value = ''
  }
}

// 生成语音
const generateSpeech = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请输入文本内容')
    return
  }

  generating.value = true
  progressText.value = '正在生成语音...'

  try {
    // 调用后端API
    const response = await request.post('/ai/text-to-speech', {
      text: formData.value.text,
      voice: formData.value.voice,
      speed: formData.value.speed,
      format: formData.value.format
    }, {
      responseType: 'blob'
    })

    console.log('✅ 语音生成成功')

    // 创建音频URL
    const blob = new Blob([response], { type: `audio/${formData.value.format}` })
    audioUrl.value = URL.createObjectURL(blob)

    generatedAudio.value = {
      text: formData.value.text,
      voice: formData.value.voice,
      speed: formData.value.speed,
      format: formData.value.format,
      blob: blob
    }

    ElMessage.success('语音生成成功！')
    emit('audio-created', generatedAudio.value)
  } catch (error) {
    console.error('❌ 语音生成失败:', error)
    ElMessage.error('语音生成失败，请重试')
  } finally {
    generating.value = false
    progressText.value = ''
  }
}

// 应用模板
const applyTemplate = (template: any) => {
  Object.assign(formData.value, template.data)
  ElMessage.success('模板已应用')
}

// 重新生成
const regenerate = () => {
  generateSpeech()
}

// 下载音频
const downloadAudio = () => {
  if (!generatedAudio.value) {
    ElMessage.warning('请先生成语音')
    return
  }

  const link = document.createElement('a')
  link.href = audioUrl.value
  link.download = `语音_${Date.now()}.${formData.value.format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('开始下载')
}
</script>

<style scoped lang="scss">
.text-to-speech {
  padding: var(--text-2xl);
  background: var(--el-bg-color);
  border-radius: var(--spacing-sm);
}

.tts-header {
  margin-bottom: var(--text-3xl);

  h3 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

// 音色选项样式
.voice-option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-xs) 0;

  .voice-label {
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-right: var(--spacing-sm);
  }

  .voice-desc {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    margin-right: var(--spacing-sm);
  }

  .preview-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-sm);

    .el-icon {
      margin-right: var(--spacing-sm);
    }
  }
}

.tts-content {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: var(--text-3xl);
}

.config-panel {
  .speed-label {
    text-align: center;
    margin-top: var(--spacing-sm);
    font-size: var(--text-base);
    color: var(--el-text-color-regular);
    font-weight: 500;
  }
}

.quick-templates {
  margin-top: var(--text-3xl);
  padding-top: var(--text-3xl);
  border-top: var(--z-index-dropdown) solid var(--el-border-color);

  h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-lg) 0;
  }
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.template-item {
  padding: var(--text-sm);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--el-color-primary-light-9);
    transform: translateY(var(--transform-hover-lift));
  }

  .template-title {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .template-desc {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
  }
}

.preview-panel {
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-3xl);

  h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-2xl) 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15xl) var(--text-2xl);
  color: var(--el-text-color-secondary);

  p {
    margin-top: var(--text-lg);
    font-size: var(--text-base);
  }
}

.audio-preview {
  .audio-info {
    text-align: center;
    padding: var(--text-3xl);
    background: var(--el-bg-color);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-2xl);

    h3 {
      font-size: var(--text-xl);
      color: var(--el-text-color-primary);
      margin: var(--text-sm) 0;
    }

    p {
      font-size: var(--text-base);
      color: var(--el-text-color-regular);
      margin: var(--spacing-sm) 0;
    }
  }

  .audio-player {
    background: var(--el-bg-color);
    padding: var(--text-2xl);
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-2xl);
  }

  .action-buttons {
    display: flex;
    gap: var(--text-sm);
    justify-content: center;
  }
}
</style>

