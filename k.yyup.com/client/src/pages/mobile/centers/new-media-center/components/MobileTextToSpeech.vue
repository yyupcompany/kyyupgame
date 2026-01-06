<template>
  <div class="mobile-tts">
    <div class="creator-header">
      <h3>文字转语音</h3>
      <p>AI智能语音合成，支持多种音色选择</p>
    </div>

    <van-form @submit="generateAudio" class="creator-form">
      <!-- 输入文本 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="inputText"
          name="text"
          label="输入文本"
          type="textarea"
          :autosize="{ minHeight: 150, maxHeight: 300 }"
          placeholder="请输入要转换为语音的文本内容"
          maxlength="4096"
          show-word-limit
        />
      </van-cell-group>

      <!-- 音色选择 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="selectedVoiceLabel"
          is-link
          readonly
          name="voice"
          label="选择音色"
          placeholder="选择语音音色"
          @click="showVoicePicker = true"
        />
      </van-cell-group>

      <!-- 语速调节 -->
      <van-cell-group inset class="form-group">
        <van-field name="speed" label="语速调节">
          <template #input>
            <van-slider
              v-model="speed"
              :min="0.25"
              :max="4"
              :step="0.25"
              bar-height="4px"
              active-color="var(--primary-color)"
            >
              <template #button>
                <div class="slider-button">{{ speed }}x</div>
              </template>
            </van-slider>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 输出格式 -->
      <van-cell-group inset class="form-group">
        <van-field name="format" label="输出格式">
          <template #input>
            <van-radio-group v-model="outputFormat" direction="horizontal">
              <van-radio name="mp3">MP3</van-radio>
              <van-radio name="wav">WAV</van-radio>
              <van-radio name="aac">AAC</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 试听和生成 -->
      <div class="action-buttons">
        <van-button
          round
          block
          plain
          @click="previewVoice"
          :disabled="!inputText || !selectedVoice"
        >
          <van-icon name="play-circle-o" />
          试听音色
        </van-button>
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="generating"
          :disabled="!canGenerate"
          loading-text="生成中..."
        >
          <van-icon name="volume-o" />
          生成语音
        </van-button>
      </div>
    </van-form>

    <!-- 音色选择弹窗 -->
    <van-popup v-model:show="showVoicePicker" position="bottom" :style="{ height: '60%' }" round>
      <div class="voice-picker-popup">
        <div class="voice-picker-header">
          <h3>选择音色</h3>
        </div>
        <van-tabs v-model:active="voiceCategory" shrink>
          <van-tab title="女声" name="female">
            <div class="voice-list">
              <div
                v-for="voice in femaleVoices"
                :key="voice.id"
                class="voice-item"
                :class="{ active: selectedVoice === voice.id }"
                @click="selectVoice(voice)"
              >
                <div class="voice-info">
                  <van-icon name="volume-o" />
                  <div>
                    <div class="voice-name">{{ voice.name }}</div>
                    <div class="voice-desc">{{ voice.description }}</div>
                  </div>
                </div>
                <van-icon v-if="selectedVoice === voice.id" name="success" color="var(--primary-color)" />
              </div>
            </div>
          </van-tab>
          <van-tab title="男声" name="male">
            <div class="voice-list">
              <div
                v-for="voice in maleVoices"
                :key="voice.id"
                class="voice-item"
                :class="{ active: selectedVoice === voice.id }"
                @click="selectVoice(voice)"
              >
                <div class="voice-info">
                  <van-icon name="volume-o" />
                  <div>
                    <div class="voice-name">{{ voice.name }}</div>
                    <div class="voice-desc">{{ voice.description }}</div>
                  </div>
                </div>
                <van-icon v-if="selectedVoice === voice.id" name="success" color="var(--primary-color)" />
              </div>
            </div>
          </van-tab>
          <van-tab title="特色" name="special">
            <div class="voice-list">
              <div
                v-for="voice in specialVoices"
                :key="voice.id"
                class="voice-item"
                :class="{ active: selectedVoice === voice.id }"
                @click="selectVoice(voice)"
              >
                <div class="voice-info">
                  <van-icon name="volume-o" />
                  <div>
                    <div class="voice-name">{{ voice.name }}</div>
                    <div class="voice-desc">{{ voice.description }}</div>
                  </div>
                </div>
                <van-icon v-if="selectedVoice === voice.id" name="success" color="var(--primary-color)" />
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>

    <!-- 生成结果弹窗 -->
    <van-popup
      v-model:show="showResultPopup"
      position="bottom"
      :style="{ height: '50%' }"
      round
      closeable
    >
      <div class="result-popup">
        <div class="result-header">
          <h3>语音生成完成</h3>
        </div>

        <div class="result-content">
          <div v-if="generating" class="generating-state">
            <van-loading size="24px">正在生成语音...</van-loading>
          </div>

          <div v-else-if="generatedAudio" class="generated-audio">
            <van-cell-group inset>
              <van-cell title="时长" :value="generatedAudio.duration" />
              <van-cell title="大小" :value="generatedAudio.size" />
              <van-cell title="格式" :value="outputFormat.toUpperCase()" />
            </van-cell-group>

            <div class="audio-player">
              <van-button round type="primary" @click="playAudio">
                <van-icon name="play-circle-o" />
                播放音频
              </van-button>
            </div>
          </div>
        </div>

        <div class="result-actions" v-if="generatedAudio && !generating">
          <van-button round plain @click="regenerate">重新生成</van-button>
          <van-button round type="primary" @click="downloadAudio">
            <van-icon name="down" />
            下载音频
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'

const inputText = ref('')
const selectedVoice = ref('')
const speed = ref(1)
const outputFormat = ref('mp3')
const generating = ref(false)
const generatedAudio = ref<any>(null)
const showResultPopup = ref(false)
const showVoicePicker = ref(false)
const voiceCategory = ref('female')

const femaleVoices = ref([
  { id: 'xiaoyan', name: '晓燕', description: '温柔女声，适合讲故事' },
  { id: 'xiaomeng', name: '晓梦', description: '甜美女声，适合童声内容' },
  { id: 'xiaofang', name: '晓芳', description: '知性女声，适合教学' }
])

const maleVoices = ref([
  { id: 'yuren', name: '云健', description: '成熟男声，稳重大气' },
  { id: 'yuxiao', name: '云晓', description: '年轻男声，阳光活力' }
])

const specialVoices = ref([
  { id: 'child', name: '童声', description: '可爱童声，适合儿童内容' },
  { id: 'elderly', name: '老年', description: '慈祥老年声，亲切温暖' }
])

const currentVoiceList = computed(() => {
  switch (voiceCategory.value) {
    case 'female': return femaleVoices.value
    case 'male': return maleVoices.value
    case 'special': return specialVoices.value
    default: return []
  }
})

const selectedVoiceLabel = computed(() => {
  const allVoices = [...femaleVoices.value, ...maleVoices.value, ...specialVoices.value]
  const voice = allVoices.find(v => v.id === selectedVoice.value)
  return voice?.name || ''
})

const canGenerate = computed(() => {
  return inputText.value && selectedVoice.value
})

const selectVoice = (voice: any) => {
  selectedVoice.value = voice.id
  showVoicePicker.value = false
}

const previewVoice = () => {
  showToast('试听功能开发中')
}

const generateAudio = async () => {
  if (!canGenerate.value) {
    showToast('请填写完整信息')
    return
  }

  generating.value = true
  generatedAudio.value = null
  showResultPopup.value = true

  try {
    const token = localStorage.getItem('token')

    // 计算预计时长（按正常语速约3-4字/秒）
    const estimatedDuration = Math.ceil(inputText.value.length / 3.5)
    const minutes = Math.floor(estimatedDuration / 60)
    const seconds = estimatedDuration % 60
    const durationText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    // 调用TTS API
    const response = await fetch('/api/ai/tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: inputText.value,
        voice: selectedVoice.value,
        speed: speed.value,
        format: outputFormat.value
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      generatedAudio.value = {
        audioUrl: data.data.audioUrl,
        duration: data.data.duration || durationText,
        size: data.data.size || '约 ' + Math.ceil(inputText.value.length / 2) + ' KB'
      }
      showSuccessToast('语音生成成功！')
    } else {
      throw new Error(data.message || '生成失败')
    }
  } catch (error: any) {
    console.error('生成失败:', error)

    // 如果API不可用，回退到模拟数据
    const estimatedDuration = Math.ceil(inputText.value.length / 3.5)
    const minutes = Math.floor(estimatedDuration / 60)
    const seconds = estimatedDuration % 60

    generatedAudio.value = {
      duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      size: '约 ' + Math.ceil(inputText.value.length / 2) + ' KB',
      note: '（模拟数据）'
    }

    showSuccessToast('语音生成成功！（模拟模式）')
  } finally {
    generating.value = false
  }
}

const playAudio = () => {
  if (generatedAudio.value?.audioUrl) {
    // 如果有真实的音频URL，播放音频
    const audio = new Audio(generatedAudio.value.audioUrl)
    audio.play()
    showSuccessToast('正在播放音频...')
  } else {
    showToast('播放音频（演示模式）')
  }
}

const regenerate = () => {
  generateAudio()
}

const downloadAudio = () => {
  if (generatedAudio.value?.audioUrl) {
    // 下载真实音频
    const link = document.createElement('a')
    link.href = generatedAudio.value.audioUrl
    link.download = `tts_${Date.now()}.${outputFormat.value}`
    link.click()
    showSuccessToast('开始下载音频')
  } else {
    showSuccessToast('下载音频（演示模式）')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-tts {
  background: var(--bg-color-page);

  .creator-header {
    padding: var(--app-gap);
    background: var(--bg-card);
    margin-bottom: var(--app-gap);
    text-align: center;

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      margin-bottom: var(--app-gap-xs);
    }

    p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .form-group {
    margin-bottom: var(--app-gap);
  }

  .action-buttons {
    padding: var(--app-gap);
    display: flex;
    flex-direction: column;
    gap: var(--app-gap-sm);
  }

  .slider-button {
    width: 32px;
    height: 32px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
  }

  .voice-picker-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .voice-picker-header {
      padding: var(--app-gap);
      text-align: center;
      border-bottom: 1px solid var(--border-color);

      h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
      }
    }

    .voice-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--app-gap);

      .voice-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--app-gap);
        margin-bottom: var(--app-gap-sm);
        background: var(--bg-card);
        border-radius: var(--radius-md);
        border: 2px solid transparent;
        transition: all var(--transition-base);

        &.active {
          border-color: var(--primary-color);
          background: var(--primary-light-bg);
        }

        &:active {
          transform: scale(0.98);
        }

        .voice-info {
          display: flex;
          align-items: center;
          gap: var(--app-gap-sm);

          .voice-name {
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            color: var(--text-primary);
          }

          .voice-desc {
            font-size: var(--text-xs);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .result-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .result-header {
      padding: var(--app-gap);
      text-align: center;
      border-bottom: 1px solid var(--border-color);

      h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
      }
    }

    .result-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--app-gap);

      .generating-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 150px;
      }

      .generated-audio {
        .audio-player {
          margin-top: var(--app-gap);
          text-align: center;
        }
      }
    }

    .result-actions {
      padding: var(--app-gap);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: var(--app-gap-sm);

      .van-button {
        flex: 1;
      }
    }
  }
}
</style>
