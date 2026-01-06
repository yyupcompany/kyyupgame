<template>
  <MobileMainLayout
    title="课程预览"
    :show-back="true"
    :custom-header="true"
  >
    <template #header>
      <div class="preview-header">
        <div class="header-left">
          <van-icon name="arrow-left" size="20" @click="goBack" />
        </div>
        <div class="header-title">课程预览</div>
        <div class="header-right">
          <van-icon name="share-o" size="20" @click="shareCourse" />
          <van-icon name="edit" size="20" @click="editCourse" />
        </div>
      </div>
    </template>

    <div class="preview-container">
      <!-- 课程信息卡片 -->
      <div class="course-info-card">
        <div class="course-thumbnail">
          <van-image
            :src="courseData.thumbnail"
            width="100%"
            height="180"
            fit="cover"
          />
          <div class="course-badge" v-if="courseData.isAI">
            <van-tag type="primary" size="small">AI生成</van-tag>
          </div>
        </div>

        <div class="course-content">
          <h2 class="course-title">{{ courseData.name }}</h2>
          <p class="course-desc">{{ courseData.description }}</p>

          <div class="course-meta">
            <div class="meta-item">
              <van-icon name="user-o" size="14" />
              <span>{{ courseData.ageGroup || '3-6岁' }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="label-o" size="14" />
              <span>{{ getDomainLabel(courseData.domain) }}</span>
            </div>
            <div class="meta-item">
              <van-icon name="clock-o" size="14" />
              <span>{{ courseData.duration || '30分钟' }}</span>
            </div>
          </div>

          <div class="course-tags">
            <van-tag
              v-for="tag in courseData.tags"
              :key="tag"
              type="primary"
              size="small"
              plain
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 预览模式切换 -->
      <div class="preview-modes">
        <van-tabs v-model:active="previewMode" sticky>
          <van-tab title="互动预览" name="interactive">
            <div class="interactive-preview">
              <!-- 课程iframe预览 -->
              <div class="preview-frame">
                <div
                  v-if="courseData.htmlCode"
                  class="course-preview-content"
                  v-html="courseData.htmlCode"
                ></div>
                <div v-else class="preview-placeholder">
                  <van-icon name="eye-o" size="48" />
                  <p>课程内容预览</p>
                  <p>这里将显示生成的互动课程内容</p>
                </div>
              </div>

              <!-- 预览工具栏 -->
              <div class="preview-toolbar">
                <van-button
                  size="small"
                  @click="toggleFullscreen"
                  icon="enlarge"
                >
                  全屏
                </van-button>
                <van-button
                  size="small"
                  @click="refreshPreview"
                  icon="replay"
                >
                  刷新
                </van-button>
                <van-button
                  size="small"
                  @click="previewSettings"
                  icon="setting-o"
                >
                  设置
                </van-button>
              </div>
            </div>
          </van-tab>

          <van-tab title="课程代码" name="code">
            <div class="code-preview">
              <!-- 代码标签页 -->
              <van-tabs v-model:active="codeTab">
                <van-tab title="HTML" name="html">
                  <div class="code-editor">
                    <pre><code>{{ courseData.htmlCode || sampleHTML }}</code></pre>
                  </div>
                </van-tab>
                <van-tab title="CSS" name="css">
                  <div class="code-editor">
                    <pre><code>{{ courseData.cssCode || sampleCSS }}</code></pre>
                  </div>
                </van-tab>
                <van-tab title="JavaScript" name="js">
                  <div class="code-editor">
                    <pre><code>{{ courseData.jsCode || sampleJS }}</code></pre>
                  </div>
                </van-tab>
              </van-tabs>

              <!-- 代码操作按钮 -->
              <div class="code-actions">
                <van-button
                  size="small"
                  type="primary"
                  @click="copyCode"
                  icon="description"
                >
                  复制代码
                </van-button>
                <van-button
                  size="small"
                  @click="downloadCode"
                  icon="down"
                >
                  下载
                </van-button>
              </div>
            </div>
          </van-tab>

          <van-tab title="教学素材" name="resources">
            <div class="resources-preview">
              <!-- 图片素材 -->
              <div v-if="courseData.images && courseData.images.length > 0" class="resource-section">
                <h4>图片素材</h4>
                <div class="image-grid">
                  <div
                    v-for="(image, index) in courseData.images"
                    :key="index"
                    class="image-item"
                    @click="previewImage(image)"
                  >
                    <van-image
                      :src="image.url || image"
                      width="100%"
                      height="100"
                      fit="cover"
                    />
                  </div>
                </div>
              </div>

              <!-- 视频素材 -->
              <div v-if="courseData.videos && courseData.videos.length > 0" class="resource-section">
                <h4>视频素材</h4>
                <div class="video-list">
                  <div
                    v-for="(video, index) in courseData.videos"
                    :key="index"
                    class="video-item"
                    @click="playVideo(video)"
                  >
                    <div class="video-thumbnail">
                      <van-image
                        :src="video.thumbnail"
                        width="100%"
                        height="80"
                        fit="cover"
                      />
                      <div class="play-overlay">
                        <van-icon name="play" size="24" color="white" />
                      </div>
                    </div>
                    <div class="video-info">
                      <div class="video-title">{{ video.title }}</div>
                      <div class="video-duration">{{ video.duration }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 音频素材 -->
              <div v-if="courseData.audios && courseData.audios.length > 0" class="resource-section">
                <h4>音频素材</h4>
                <div class="audio-list">
                  <div
                    v-for="(audio, index) in courseData.audios"
                    :key="index"
                    class="audio-item"
                  >
                    <div class="audio-info">
                      <van-icon name="music-o" size="20" />
                      <span class="audio-title">{{ audio.title }}</span>
                    </div>
                    <van-button
                      size="small"
                      @click="playAudio(audio)"
                      icon="play"
                    >
                      播放
                    </van-button>
                  </div>
                </div>
              </div>

              <!-- 无素材提示 -->
              <div v-if="!hasResources" class="no-resources">
                <van-empty description="暂无教学素材" />
              </div>
            </div>
          </van-tab>

          <van-tab title="教学指南" name="guide">
            <div class="guide-preview">
              <!-- 教学目标 -->
              <div class="guide-section">
                <h4>📚 教学目标</h4>
                <ul class="objective-list">
                  <li v-for="objective in courseData.objectives" :key="objective">
                    {{ objective }}
                  </li>
                </ul>
              </div>

              <!-- 教学流程 -->
              <div class="guide-section">
                <h4>📋 教学流程</h4>
                <div class="flow-steps">
                  <div
                    v-for="(step, index) in courseData.teachingFlow"
                    :key="index"
                    class="flow-step"
                  >
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-content">
                      <h5>{{ step.title }}</h5>
                      <p>{{ step.description }}</p>
                      <div v-if="step.duration" class="step-duration">
                        <van-icon name="clock-o" size="12" />
                        <span>{{ step.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 注意事项 -->
              <div class="guide-section">
                <h4>⚠️ 注意事项</h4>
                <div class="notice-list">
                  <div
                    v-for="(notice, index) in courseData.notices"
                    :key="index"
                    class="notice-item"
                  >
                    <van-icon name="info-o" size="14" />
                    <span>{{ notice }}</span>
                  </div>
                </div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <van-button
          type="primary"
          size="large"
          block
          @click="startLesson"
          icon="play"
        >
          一键上课
        </van-button>
      </div>
    </div>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

    <!-- 视频播放弹窗 -->
    <van-popup
      v-model:show="showVideoPlayer"
      position="center"
      :style="{ width: '95%', maxHeight: '80%' }"
      round
    >
      <div class="video-player">
        <video
          v-if="currentVideo"
          :src="currentVideo.url"
          controls
          autoplay
          style="width: 100%; max-height: 400px;"
        />
        <div class="video-close">
          <van-button size="small" @click="showVideoPlayer = false">
            关闭
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 音频播放弹窗 -->
    <van-popup
      v-model:show="showAudioPlayer"
      position="bottom"
      :style="{ height: '40%' }"
      round
    >
      <div class="audio-player">
        <div class="audio-header">
          <h3>{{ currentAudio?.title }}</h3>
          <van-button size="small" @click="showAudioPlayer = false">
            关闭
          </van-button>
        </div>
        <div class="audio-content">
          <audio
            v-if="currentAudio"
            :src="currentAudio.url"
            controls
            autoplay
            style="width: 100%;"
          />
        </div>
      </div>
    </van-popup>

    <!-- 预览设置对话框 -->
    <van-popup v-model:show="showSettingsDialog" position="bottom" round>
      <div class="settings-dialog">
        <div class="settings-header">
          <h3>预览设置</h3>
        </div>
        <van-cell-group inset>
          <van-field
            v-model="courseData.name"
            label="课程名称"
            placeholder="输入课程名称"
          />
          <van-field
            v-model="courseData.description"
            label="课程描述"
            type="textarea"
            placeholder="输入课程描述"
            rows="3"
          />
          <van-field
            v-model="courseData.ageGroup"
            label="适用年龄"
            placeholder="如: 3-4岁"
          />
          <van-field
            v-model="courseData.duration"
            label="课程时长"
            placeholder="如: 30分钟"
          />
        </van-cell-group>
        <div class="settings-actions">
          <van-button block type="primary" @click="showSettingsDialog = false">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const previewMode = ref('interactive')
const codeTab = ref('html')
const showImagePreview = ref(false)
const showVideoPlayer = ref(false)
const showAudioPlayer = ref(false)
const showSettingsDialog = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const currentVideo = ref(null)
const currentAudio = ref(null)

// 课程数据
const courseData = reactive({
  id: route.params.id,
  name: '春天的发现',
  description: '通过互动游戏学习春天植物生长的特点，培养孩子对自然的兴趣',
  thumbnail: 'https://via.placeholder.com/400x200?text=春天',
  isAI: true,
  domain: 'science',
  ageGroup: '4-5岁',
  duration: '30分钟',
  tags: ['春天', '植物', '科学探索', '互动游戏'],
  htmlCode: '',
  cssCode: '',
  jsCode: '',
  images: [
    'https://via.placeholder.com/200x150?text=花朵1',
    'https://via.placeholder.com/200x150?text=花朵2',
    'https://via.placeholder.com/200x150?text=小树苗'
  ],
  videos: [
    {
      title: '植物生长动画',
      duration: '2:30',
      thumbnail: 'https://via.placeholder.com/300x150?text=视频封面',
      url: 'video-url'
    }
  ],
  audios: [
    {
      title: '春天来了',
      duration: '1:45',
      url: 'audio-url'
    }
  ],
  objectives: [
    '认识春天的基本特征和植物生长现象',
    '培养观察自然和探索科学的兴趣',
    '提高孩子的动手能力和团队合作意识'
  ],
  teachingFlow: [
    {
      title: '导入环节',
      description: '通过图片和视频展示春天的景象，引导孩子观察',
      duration: '5分钟'
    },
    {
      title: '探索环节',
      description: '互动游戏让孩子参与植物生长过程',
      duration: '15分钟'
    },
    {
      title: '实践环节',
      description: '动手制作小盆栽，体验种植乐趣',
      duration: '8分钟'
    },
    {
      title: '总结环节',
      description: '分享收获，巩固学习内容',
      duration: '2分钟'
    }
  ],
  notices: [
    '提前准备好种植材料和工具',
    '注意孩子使用工具的安全',
    '鼓励每个孩子都参与其中',
    '及时给予肯定和鼓励'
  ]
})

// 示例代码
const sampleHTML = `<div class="spring-course">
  <h1>春天的发现</h1>
  <div class="plant-game">
    <div class="seed">🌱</div>
    <div class="stem">🌿</div>
    <div class="flower">🌸</div>
  </div>
</div>`

const sampleCSS = `.spring-course {
  text-align: center;
  padding: var(--spacing-lg);
}

.plant-game {
  margin: var(--spacing-lg) 0;
}

.seed, .stem, .flower {
  font-size: var(--text-5xl);
  margin: 10px;
  cursor: pointer;
  transition: all 0.3s;
}`

const sampleJS = `// 互动课程逻辑
document.addEventListener('DOMContentLoaded', function() {
  const seed = document.querySelector('.seed');
  const stem = document.querySelector('.stem');
  const flower = document.querySelector('.flower');

  // 点击事件处理
  seed.addEventListener('click', function() {
    this.style.transform = 'scale(1.2)';
    setTimeout(() => {
      stem.style.opacity = '1';
    }, 500);
  });
});`

// 计算属性
const hasResources = computed(() => {
  return (
    (courseData.images && courseData.images.length > 0) ||
    (courseData.videos && courseData.videos.length > 0) ||
    (courseData.audios && courseData.audios.length > 0)
  )
})

// 方法
const goBack = () => {
  router.back()
}

const shareCourse = async () => {
  const shareData = {
    title: courseData.value.name,
    text: courseData.value.description || `查看我的创意课程: ${courseData.value.name}`,
    url: window.location.href
  }

  // 检查是否支持 Web Share API
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      showToast('分享成功')
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('分享失败:', err)
        showToast('分享失败')
      }
    }
  } else {
    // 降级方案：复制链接
    const shareUrl = `${shareData.title}\n${shareData.text}\n${shareData.url}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('分享内容已复制到剪贴板')
    } catch {
      showToast('您的浏览器不支持分享功能')
    }
  }
}

const editCourse = () => {
  router.push(`/mobile/teacher-center/creative-curriculum/edit/${courseData.id}`)
}

const toggleFullscreen = () => {
  const elem = document.querySelector('.course-preview-content')
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  }
}

const refreshPreview = () => {
  showToast('预览已刷新')
}

const previewSettings = () => {
  showSettingsDialog.value = true
}

const copyCode = () => {
  const code = courseData.htmlCode || sampleHTML
  navigator.clipboard.writeText(code).then(() => {
    showToast('代码已复制')
  })
}

const downloadCode = () => {
  const code = courseData.htmlCode || sampleHTML
  const fileName = `course_${courseData.id || 'index'}.html`

  try {
    // 创建Blob并下载
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast('代码已下载')
  } catch (error) {
    console.error('下载失败:', error)
    showToast('下载失败，请重试')
  }
}

const previewImage = (image: string) => {
  previewImages.value = [image]
  previewIndex.value = 0
  showImagePreview.value = true
}

const playVideo = (video: any) => {
  currentVideo.value = video
  showVideoPlayer.value = true
}

const playAudio = (audio: any) => {
  currentAudio.value = audio
  showAudioPlayer.value = true
}

const startLesson = () => {
  router.push(`/mobile/teacher-center/creative-curriculum/lesson/${courseData.id}`)
}

const getDomainLabel = (domain: string) => {
  const labels: Record<string, string> = {
    health: '健康',
    language: '语言',
    social: '社会',
    science: '科学',
    art: '艺术'
  }
  return labels[domain] || domain
}

// 生命周期
onMounted(() => {
  // 加载课程数据
  console.log('加载课程数据:', courseData.id)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 16px;
  background: white;

  .header-left,
  .header-right {
    display: flex;
    gap: var(--spacing-md);
  }

  .header-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--van-text-color);
  }

  .van-icon {
    color: var(--van-text-color);
  }
}

.preview-container {
  background: var(--van-background-color-light);
  min-height: 100vh;
  padding-bottom: 80px;
}

.course-info-card {
  background: white;
  margin-bottom: 12px;

  .course-thumbnail {
    position: relative;

    .course-badge {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  .course-content {
    padding: var(--spacing-md);

    .course-title {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: 8px;
    }

    .course-desc {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .course-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-sm);
        color: var(--van-text-color-3);
      }
    }

    .course-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
  }
}

.preview-modes {
  background: white;
  margin-bottom: 12px;

  :deep(.van-tabs__wrap) {
    background: white;
  }

  :deep(.van-tabs__content) {
    padding: var(--spacing-md);
  }
}

.interactive-preview {
  .preview-frame {
    border: 1px solid #ebedf0;
    border-radius: 8px;
    min-height: 300px;
    margin-bottom: 12px;
    background: white;

    .course-preview-content {
      padding: var(--spacing-md);
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--van-text-color-3);

      .van-icon {
        margin-bottom: 12px;
      }

      p {
        margin: var(--spacing-xs) 0;
        text-align: center;
      }
    }
  }

  .preview-toolbar {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;

    .van-button {
      flex: 1;
    }
  }
}

.code-preview {
  .code-editor {
    background: #f8f9fa;
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 12px;
    min-height: 300px;
    overflow: auto;

    pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: var(--text-xs);
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .code-actions {
    display: flex;
    gap: var(--spacing-sm);

    .van-button {
      flex: 1;
    }
  }
}

.resources-preview {
  .resource-section {
    margin-bottom: 24px;

    h4 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: 12px;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);

      .image-item {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
      }
    }

    .video-list {
      .video-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;

        .video-thumbnail {
          position: relative;
          width: 120px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;

          .play-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .video-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;

          .video-title {
            font-size: var(--text-sm);
            font-weight: 500;
            color: var(--van-text-color);
            margin-bottom: 4px;
          }

          .video-duration {
            font-size: var(--text-xs);
            color: var(--van-text-color-3);
          }
        }
      }
    }

    .audio-list {
      .audio-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;

        .audio-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .audio-title {
            font-size: var(--text-sm);
            color: var(--van-text-color);
          }
        }
      }
    }
  }

  .no-resources {
    padding: 40px 20px;
  }
}

.guide-preview {
  .guide-section {
    margin-bottom: 24px;

    h4 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: 12px;
    }

    .objective-list {
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.5;
        color: var(--van-text-color-2);
      }
    }

    .flow-steps {
      .flow-step {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: 16px;
        padding: var(--spacing-md);
        background: #f8f9fa;
        border-radius: 8px;

        .step-number {
          width: 24px;
          height: 24px;
          background: var(--van-primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;

          h5 {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: 4px;
          }

          p {
            font-size: var(--text-sm);
            color: var(--van-text-color-2);
            line-height: 1.4;
            margin-bottom: 4px;
          }

          .step-duration {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--text-xs);
            color: var(--van-text-color-3);
          }
        }
      }
    }

    .notice-list {
      .notice-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);

        .van-icon {
          color: var(--van-warning-color);
          flex-shrink: 0;
        }
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  border-top: 1px solid #ebedf0;
  z-index: 100;

  .van-button {
    height: 48px;
    font-size: var(--text-base);
    font-weight: 600;
    border-radius: 12px;
  }
}

.video-player,
.audio-player {
  padding: var(--spacing-md);

  .video-close,
  .audio-close {
    margin-top: 12px;
    text-align: center;
  }

  .audio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
    }
  }
}
</style>