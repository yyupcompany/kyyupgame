<template>
  <div class="mobile-video-creator">
    <div class="creator-header">
      <h3>AI视频创作</h3>
      <p>AI生成视频脚本，支持多种创作模式</p>
    </div>

    <van-form @submit="generateVideo" class="creator-form">
      <!-- 发布平台 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="platformLabel"
          is-link
          readonly
          name="platform"
          label="发布平台"
          placeholder="选择发布平台"
          @click="showPlatformPicker = true"
        />
      </van-cell-group>

      <!-- 视频类型 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="typeLabel"
          is-link
          readonly
          name="type"
          label="视频类型"
          placeholder="选择视频类型"
          @click="showTypePicker = true"
        />
      </van-cell-group>

      <!-- 视频主题 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.topic"
          name="topic"
          label="视频主题"
          placeholder="请输入视频主题"
          maxlength="50"
          show-word-limit
        />
      </van-cell-group>

      <!-- 视频时长 -->
      <van-cell-group inset class="form-group">
        <van-field name="duration" label="视频时长">
          <template #input>
            <van-radio-group v-model="formData.duration" direction="horizontal">
              <van-radio name="short">短视频</van-radio>
              <van-radio name="medium">中视频</van-radio>
              <van-radio name="long">长视频</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 创作模式 -->
      <van-cell-group inset class="form-group">
        <van-field name="mode" label="创作模式">
          <template #input>
            <van-radio-group v-model="formData.mode" direction="horizontal">
              <van-radio name="script">脚本</van-radio>
              <van-radio name="text_to_video">文生</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 内容描述 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.description"
          name="description"
          label="内容描述"
          type="textarea"
          :autosize="{ minHeight: 100, maxHeight: 200 }"
          placeholder="请详细描述视频内容和要表达的信息"
          maxlength="300"
          show-word-limit
        />
      </van-cell-group>

      <!-- 生成按钮 -->
      <div class="action-buttons">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="generating"
          :disabled="!canGenerate"
          loading-text="AI创作中..."
        >
          生成视频脚本
        </van-button>
      </div>
    </van-form>

    <!-- 平台选择弹窗 -->
    <van-popup v-model:show="showPlatformPicker" position="bottom" round>
      <van-picker
        :columns="platformColumns"
        @confirm="onPlatformConfirm"
        @cancel="showPlatformPicker = false"
      />
    </van-popup>

    <!-- 类型选择弹窗 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 生成结果弹窗 -->
    <van-popup
      v-model:show="showResultPopup"
      position="bottom"
      :style="{ height: '80%' }"
      round
      closeable
    >
      <div class="result-popup">
        <div class="result-header">
          <h3>视频脚本</h3>
          <div class="result-tags">
            <van-tag type="primary">{{ getPlatformLabel(formData.platform) }}</van-tag>
            <van-tag type="success">{{ getTypeLabel(formData.type) }}</van-tag>
          </div>
        </div>

        <div class="result-content">
          <div v-if="generating" class="generating-state">
            <van-loading size="24px">AI正在创作中...</van-loading>
          </div>

          <div v-else-if="generatedContent" class="generated-script">
            <van-steps direction="vertical" :active="-1">
              <van-step
                v-for="(section, index) in generatedContent.script"
                :key="index"
              >
                <div class="script-section">
                  <div class="section-header">
                    <span class="section-number">{{ index + 1 }}</span>
                    <span class="section-title">{{ section.title }}</span>
                    <span class="section-time">{{ section.time }}</span>
                  </div>
                  <div class="section-content">
                    <p><strong>画面：</strong>{{ section.visual }}</p>
                    <p><strong>音频：</strong>{{ section.audio }}</p>
                    <p v-if="section.text"><strong>文字：</strong>{{ section.text }}</p>
                  </div>
                </div>
              </van-step>
            </van-steps>
          </div>

          <div v-else class="empty-state">
            <van-empty description="暂无生成内容" />
          </div>
        </div>

        <div class="result-actions" v-if="generatedContent && !generating">
          <van-button round plain @click="regenerate">重新生成</van-button>
          <van-button round type="primary" @click="saveContent">保存脚本</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'

const generating = ref(false)
const generatedContent = ref<any>(null)
const showResultPopup = ref(false)

const showPlatformPicker = ref(false)
const showTypePicker = ref(false)

const formData = ref({
  platform: '',
  type: '',
  topic: '',
  duration: 'medium',
  mode: 'script',
  description: ''
})

const platformColumns = [
  { text: '抖音', value: 'douyin' },
  { text: '快手', value: 'kuaishou' },
  { text: '视频号', value: 'wechat_video' },
  { text: '小红书', value: 'xiaohongshu' },
  { text: 'B站', value: 'bilibili' },
  { text: '西瓜视频', value: 'xigua' },
  { text: '好看视频', value: 'haokan' }
]

const typeColumns = [
  { text: '招生宣传', value: 'enrollment' },
  { text: '活动记录', value: 'activity' },
  { text: '课程展示', value: 'course' },
  { text: '环境介绍', value: 'environment' },
  { text: '师资介绍', value: 'teacher' },
  { text: '日常生活', value: 'daily' },
  { text: '节日庆典', value: 'festival' }
]

const canGenerate = computed(() => {
  return formData.value.platform && formData.value.type && formData.value.description
})

const platformLabel = computed(() => {
  const platform = platformColumns.find(p => p.value === formData.value.platform)
  return platform?.text || ''
})

const typeLabel = computed(() => {
  const type = typeColumns.find(t => t.value === formData.value.type)
  return type?.text || ''
})

const onPlatformConfirm = ({ selectedOptions }: any) => {
  formData.value.platform = selectedOptions[0].value
  showPlatformPicker.value = false
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  formData.value.type = selectedOptions[0].value
  showTypePicker.value = false
}

const getPlatformLabel = (value: string) => {
  const platform = platformColumns.find(p => p.value === value)
  return platform?.text || ''
}

const getTypeLabel = (value: string) => {
  const type = typeColumns.find(t => t.value === value)
  return type?.text || ''
}

// 构建AI提示词
const buildPrompt = () => {
  const platformText = getPlatformLabel(formData.value.platform)
  const typeText = getTypeLabel(formData.value.type)

  const durationMap: Record<string, { seconds: number; label: string }> = {
    short: { seconds: 30, label: '短视频（15-30秒）' },
    medium: { seconds: 60, label: '中视频（30-60秒）' },
    long: { seconds: 120, label: '长视频（60-120秒）' }
  }
  const durationInfo = durationMap[formData.value.duration] || durationMap.medium

  const modeMap: Record<string, string> = {
    script: '脚本模式（仅生成视频脚本）',
    text_to_video: '文生视频模式（包含拍摄建议）'
  }
  const modeText = modeMap[formData.value.mode] || '脚本模式'

  let prompt = `请为幼儿园生成一个视频脚本。

**发布平台**：${platformText}
**视频类型**：${typeText}
**视频主题**：${formData.value.topic}
**视频时长**：${durationInfo.label}
**创作模式**：${modeText}

**内容描述**：${formData.value.description}

**要求**：
1. 脚本要符合${platformText}平台的特点（如抖音要快速吸引眼球）
2. 场景安排要有逻辑性：开场-引入-内容展开-结尾
3. 每个场景要包含：画面描述、音频/配音、字幕文字（如需要）
4. 时间分配要合理，总时长控制在${durationInfo.seconds}秒左右
5. 内容要突出幼儿园特色和优势
6. 语言简洁生动，适合视频表达

请按以下格式输出，每个场景用"---"分隔：
---
场景1：开场（0-3秒）
【画面】...
【音频/配音】...
【字幕】...
---
场景2：引入（3-10秒）
【画面】...
【音频/配音】...
【字幕】...
---
（继续其他场景）
---`

  return prompt
}

// 调用AI专家
const callAIExpert = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem('token')

  const response = await fetch('/api/ai/unified/stream-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ message: prompt })
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法获取响应流')
  }

  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'answer_chunk' && data.content) {
              fullContent += data.content
            } else if (data.type === 'error') {
              throw new Error(data.error || 'AI生成出错')
            }
          } catch (e) {
            console.warn('解析SSE数据失败:', line, e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

// 解析AI响应为脚本格式
const parseAIResponse = (fullContent: string) => {
  const sections: any[] = []

  // 按 "---" 分割场景
  const sceneBlocks = fullContent.split('---').filter((block: string) => block.trim().length > 0)

  sceneBlocks.forEach((block: string, index: number) => {
    // 提取场景标题
    const titleMatch = block.match(/(?:场景\s*\d+[：:])?\s*([^\n]+)/)
    const title = titleMatch ? titleMatch[1].trim() : `场景${index + 1}`

    // 提取时间
    const timeMatch = block.match(/(\d+-?\d*\s*秒)/)
    const time = timeMatch ? timeMatch[1] : `${index * 10}-${(index + 1) * 10}秒`

    // 提取画面
    const visualMatch = block.match(/【画面】([^\n【]+)/)
    const visual = visualMatch ? visualMatch[1].trim() : '待定画面'

    // 提取音频/配音
    const audioMatch = block.match(/【音频[\/]配音】|【配音】([^\n【]+)/)
    const audio = audioMatch ? audioMatch[1].trim() : '背景音乐'

    // 提取字幕
    const textMatch = block.match(/【字幕】([^\n【]+)/)
    const text = textMatch ? textMatch[1].trim() : ''

    sections.push({
      title: title.replace(/\（.*?\）/g, '').trim(),
      time,
      visual,
      audio,
      text
    })
  })

  // 如果解析失败，使用默认脚本
  if (sections.length === 0) {
    sections.push(
      { title: '开场', time: '0-3秒', visual: '幼儿园外观全景', audio: '欢快的背景音乐', text: '' },
      { title: '引入', time: '3-10秒', visual: '孩子们快乐活动的画面', audio: '温暖解说配音', text: '' },
      { title: '内容', time: '10-45秒', visual: '教学活动、游戏场景', audio: '详细介绍办学特色', text: '' },
      { title: '结尾', time: '45-60秒', visual: '幼儿园LOGO和联系方式', audio: '邀请语', text: '' }
    )
  }

  return { script: sections }
}

const generateVideo = async () => {
  if (!canGenerate.value) {
    showToast('请填写完整信息')
    return
  }

  generating.value = true
  generatedContent.value = null
  showResultPopup.value = true

  try {
    const prompt = buildPrompt()
    const fullContent = await callAIExpert(prompt)

    if (!fullContent || fullContent.trim().length === 0) {
      throw new Error('AI生成内容为空')
    }

    const parsed = parseAIResponse(fullContent)
    generatedContent.value = parsed

    showSuccessToast('视频脚本生成成功！')
  } catch (error: any) {
    console.error('生成失败:', error)
    showFailToast(error.message || '生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const regenerate = () => {
  generateVideo()
}

const saveContent = async () => {
  if (!generatedContent.value) {
    showToast('没有可保存的内容')
    return
  }

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/new-media-center/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'video',
        platform: formData.value.platform,
        contentType: formData.value.type,
        topic: formData.value.topic,
        duration: formData.value.duration,
        mode: formData.value.mode,
        description: formData.value.description,
        script: generatedContent.value.script,
        metadata: {
          sceneCount: generatedContent.value.script.length
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        showSuccessToast('脚本已保存')
      } else {
        showFailToast(data.message || '保存失败')
      }
    } else {
      showFailToast('保存失败，请重试')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showFailToast('保存失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-video-creator {
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
  }

  .result-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .result-header {
      padding: var(--app-gap);
      border-bottom: 1px solid var(--border-color);

      h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        margin-bottom: var(--app-gap-sm);
      }

      .result-tags {
        display: flex;
        gap: var(--app-gap-xs);
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
        height: 200px;
      }

      .generated-script {
        .script-section {
          padding: var(--app-gap-sm);

          .section-header {
            display: flex;
            align-items: center;
            gap: var(--app-gap-sm);
            margin-bottom: var(--app-gap-sm);

            .section-number {
              width: 24px;
              height: 24px;
              background: var(--primary-color);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: var(--text-xs);
              font-weight: var(--font-medium);
            }

            .section-title {
              flex: 1;
              font-size: var(--text-sm);
              font-weight: var(--font-semibold);
              color: var(--text-primary);
            }

            .section-time {
              font-size: var(--text-xs);
              color: var(--text-secondary);
            }
          }

          .section-content {
            p {
              font-size: var(--text-sm);
              color: var(--text-secondary);
              margin-bottom: var(--app-gap-xs);
              line-height: var(--leading-normal);

              strong {
                color: var(--text-primary);
              }
            }
          }
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
