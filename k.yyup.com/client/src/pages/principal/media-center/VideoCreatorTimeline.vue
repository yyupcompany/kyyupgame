<template>
  <div class="video-creator-timeline">
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-text">
          <h2>🎬 智能视频制作</h2>
          <p class="subtitle">7步完成专业视频制作，从创意到发布</p>
        </div>
        <el-button type="primary" size="large" @click="handleCreateNewVideo">
          <UnifiedIcon name="Plus" />
          创作视频
        </el-button>
      </div>
    </el-card>

    <!-- Timeline 时间线 -->
    <el-timeline class="creation-timeline">
      <!-- 步骤1: 创意输入 -->
      <el-timeline-item
        :icon="getStepIcon(1)"
        :type="getStepType(1)"
        :hollow="currentStep !== 1"
        :size="currentStep === 1 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 1 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">💡 步骤1: 创意输入</span>
              <el-tag v-if="currentStep > 1" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 1" type="primary">进行中</el-tag>
            </div>
          </template>

          <el-form v-if="currentStep === 1" :model="formData" label-width="100px">
            <el-form-item label="视频主题">
              <el-input
                v-model="formData.topic"
                placeholder="例如：春季招生宣传"
                clearable
              />
            </el-form-item>

            <el-form-item label="发布平台">
              <el-select v-model="formData.platform" placeholder="选择平台">
                <el-option label="抖音" value="douyin" />
                <el-option label="快手" value="kuaishou" />
                <el-option label="视频号" value="wechat_video" />
                <el-option label="小红书" value="xiaohongshu" />
              </el-select>
            </el-form-item>

            <el-form-item label="视频类型">
              <el-select v-model="formData.videoType" placeholder="选择类型">
                <el-option label="招生宣传" value="enrollment" />
                <el-option label="活动展示" value="activity" />
                <el-option label="课程介绍" value="course" />
                <el-option label="园所风采" value="showcase" />
              </el-select>
            </el-form-item>

            <el-form-item label="视频时长">
              <el-radio-group v-model="formData.duration">
                <el-radio label="short">短视频 (15-30秒)</el-radio>
                <el-radio label="medium">中视频 (30-60秒)</el-radio>
                <el-radio label="long">长视频 (1-3分钟)</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="视频方向">
              <el-radio-group v-model="formData.orientation">
                <el-radio label="horizontal">
                  <span>📺 横版 (16:9)</span>
                  <span style="font-size: var(--text-sm); color: var(--info-color); margin-left: var(--spacing-sm)">854x480 (480p)</span>
                </el-radio>
                <el-radio label="vertical">
                  <span>📱 竖版 (9:16)</span>
                  <span style="font-size: var(--text-sm); color: var(--info-color); margin-left: var(--spacing-sm)">480x854 (480p)</span>
                </el-radio>
              </el-radio-group>
              <div style="margin-top: var(--spacing-sm); font-size: var(--text-sm); color: var(--info-color)">
                <span v-if="formData.orientation === 'horizontal'">适合：视频号、B站、YouTube等横屏平台</span>
                <span v-else-if="formData.orientation === 'vertical'">适合：抖音、快手、小红书等竖屏平台</span>
              </div>
            </el-form-item>

            <el-form-item label="关键要点">
              <el-input
                v-model="formData.keyPoints"
                type="textarea"
                :rows="3"
                placeholder="输入视频要突出的关键信息..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="startCreation">
                开始创作 →
              </el-button>
            </el-form-item>
          </el-form>

          <div v-else class="step-summary">
            <div class="summary-content">
              <p><strong>主题:</strong> {{ formData.topic || '未填写' }}</p>
              <p><strong>平台:</strong> {{ getPlatformName(formData.platform) }}</p>
              <p><strong>类型:</strong> {{ getTypeName(formData.videoType) }}</p>
              <p><strong>时长:</strong> {{ getDurationName(formData.duration) }}</p>
              <p><strong>方向:</strong> {{ getOrientationName(formData.orientation) }}</p>
              <p v-if="formData.keyPoints"><strong>关键要点:</strong> {{ formData.keyPoints }}</p>
            </div>
            <el-button
              type="primary"
              size="small"
              @click="editStep1"
              style="margin-top: var(--spacing-2xl)"
            >
              📝 编辑创意
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤2: 脚本生成 -->
      <el-timeline-item
        :icon="getStepIcon(2)"
        :type="getStepType(2)"
        :hollow="currentStep !== 2"
        :size="currentStep === 2 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 2 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">📝 步骤2: 脚本生成</span>
              <el-tag v-if="currentStep > 2" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 2" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 2" class="step-content">
            <el-progress
              v-if="scriptGenerating"
              :percentage="scriptProgress"
              :status="scriptProgress === 100 ? 'success' : undefined"
            />
            <p v-if="scriptGenerating" class="progress-text">{{ scriptProgressText }}</p>

            <div v-if="scriptData" class="script-preview">
              <h4>{{ scriptData.title || '生成的脚本' }}</h4>
              <p v-if="scriptData.description" class="script-description">{{ scriptData.description }}</p>

              <div v-for="(scene, index) in scriptData.scenes" :key="index" class="scene-item">
                <div class="scene-header">
                  <h5>场景{{ index + 1 }}: {{ scene.sceneTitle || `场景${index + 1}` }}</h5>
                  <el-tag size="small">{{ scene.duration }}秒</el-tag>
                </div>

                <div class="scene-details">
                  <div class="detail-row">
                    <strong>📹 画面描述:</strong>
                    <p>{{ scene.visualDescription }}</p>
                  </div>

                  <div class="detail-row">
                    <strong>🎤 旁白文案:</strong>
                    <p>{{ scene.narration }}</p>
                  </div>

                  <div v-if="scene.subtitle" class="detail-row">
                    <strong>📝 字幕文本:</strong>
                    <p>{{ scene.subtitle }}</p>
                  </div>

                  <div class="detail-row technical-info">
                    <span><strong>镜头角度:</strong> {{ scene.cameraAngle }}</span>
                    <span><strong>镜头运动:</strong> {{ scene.cameraMovement }}</span>
                    <span><strong>转场效果:</strong> {{ scene.transition }}</span>
                  </div>

                  <div v-if="scene.emotionalTone" class="detail-row">
                    <strong>情感基调:</strong> {{ scene.emotionalTone }}
                  </div>
                </div>
              </div>

              <div v-if="scriptData.bgmSuggestion || scriptData.colorTone" class="script-meta">
                <p v-if="scriptData.bgmSuggestion"><strong>🎵 背景音乐:</strong> {{ scriptData.bgmSuggestion }}</p>
                <p v-if="scriptData.colorTone"><strong>🎨 色调建议:</strong> {{ scriptData.colorTone }}</p>
                <p v-if="scriptData.visualStyle"><strong>🖼️ 视觉风格:</strong> {{ scriptData.visualStyle }}</p>
                <p v-if="scriptData.callToAction"><strong>📢 行动号召:</strong> {{ scriptData.callToAction }}</p>
              </div>

              <el-button type="primary" @click="approveScript" style="margin-top: var(--text-2xl)" size="large">
                <UnifiedIcon name="Check" />
                确认脚本，继续下一步 →
              </el-button>
            </div>

            <!-- 如果脚本生成完成但还没有点击确认 -->
            <div v-else-if="!scriptGenerating && !scriptData" class="empty-state">
              <p class="info-text">等待脚本生成...</p>
            </div>
          </div>

          <div v-else-if="currentStep > 2" class="step-summary">
            <p>✅ 脚本已生成，共 {{ scriptData?.scenes?.length || 0 }} 个场景</p>
            <el-button type="primary" text @click="viewScript">
              <UnifiedIcon name="default" />
              查看脚本
            </el-button>
            <el-button type="warning" text @click="regenerateScript">
              <UnifiedIcon name="Refresh" />
              重新生成
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤3: 配音合成 -->
      <el-timeline-item
        :icon="getStepIcon(3)"
        :type="getStepType(3)"
        :hollow="currentStep !== 3"
        :size="currentStep === 3 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 3 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">🎤 步骤3: 配音合成</span>
              <el-tag v-if="currentStep > 3" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 3" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 3" class="step-content">
            <el-form-item label="配音风格">
              <el-select v-model="formData.voiceStyle" placeholder="请选择配音风格">
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

            <el-progress
              v-if="audioGenerating"
              :percentage="audioProgress"
              :status="audioProgress === 100 ? 'success' : undefined"
            />
            <p v-if="audioGenerating" class="progress-text">{{ audioProgressText }}</p>

            <!-- 音频列表 -->
            <div v-if="audioData && audioData.length > 0" class="audio-list">
              <el-divider content-position="left">
                <span class="audio-list-title">
                  <UnifiedIcon name="default" />
                  生成的配音列表（共 {{ audioData.length }} 个）
                </span>
              </el-divider>

              <el-space direction="vertical" :size="12" style="width: 100%">
                <el-card
                  v-for="(audio, index) in audioData"
                  :key="index"
                  shadow="hover"
                  class="audio-item-card"
                >
                  <div class="audio-item">
                    <div class="audio-info">
                      <div class="audio-title">
                        <el-tag type="primary" size="small">场景 {{ audio.sceneNumber }}</el-tag>
                        <span class="audio-narration">{{ audio.narration }}</span>
                      </div>
                      <div class="audio-meta">
                        <UnifiedIcon name="default" />
                        <span>时长: {{ formatDuration(audio.duration) }}</span>
                      </div>
                    </div>
                    <div class="audio-actions">
                      <el-button
                        type="primary"
                        size="small"
                        @click="toggleAudioPlay(index, audio.audioUrl)"
                        circle
                      >
                        <el-icon :size="16" color="var(--bg-color)">
                          <VideoPause v-if="playingAudioIndex === index" />
                          <VideoPlay v-else />
                        </el-icon>
                      </el-button>
                      <audio
                        :ref="el => audioRefs[index] = el"
                        :src="audio.audioUrl"
                        @ended="onAudioEnded(index)"
                        style="display: none"
                      />
                    </div>
                  </div>
                </el-card>
              </el-space>

              <el-button
                type="primary"
                @click="approveAudio"
                style="margin-top: var(--text-2xl); width: 100%"
                size="large"
              >
                <UnifiedIcon name="Check" />
                确认配音，继续下一步 →
              </el-button>
            </div>

            <el-button
              v-else
              type="primary"
              @click="generateAudio"
              :loading="audioGenerating"
              :disabled="!formData.voiceStyle"
              size="large"
            >
              <UnifiedIcon name="default" />
              生成配音
            </el-button>
          </div>

          <div v-else-if="currentStep > 3" class="step-summary">
            <p>✅ 配音已生成（共 {{ audioData.length }} 个音频）</p>
            <el-button type="primary" text @click="showAudioListDialog">
              <UnifiedIcon name="default" />
              查看配音列表
            </el-button>
            <el-button type="warning" text @click="regenerateAudio">
              <UnifiedIcon name="Refresh" />
              重新生成配音
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤4: 分镜生成 -->
      <el-timeline-item
        :icon="getStepIcon(4)"
        :type="getStepType(4)"
        :hollow="currentStep !== 4"
        :size="currentStep === 4 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 4 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">🎬 步骤4: 分镜生成</span>
              <el-tag v-if="currentStep > 4" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 4" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 4" class="step-content">
            <!-- 首帧生视频选项 -->
            <div class="image-to-video-option" style="margin-bottom: var(--text-2xl)">
              <el-checkbox v-model="enableImageToVideo" @change="onImageToVideoChange">
                <span style="font-weight: 500">🖼️ 启用首帧生视频</span>
                <el-tooltip content="勾选后可为每个场景上传首帧图片，AI将基于图片生成视频" placement="top">
                  <UnifiedIcon name="default" />
                </el-tooltip>
              </el-checkbox>
              <p style="margin: var(--spacing-sm) 0 0 var(--text-3xl); font-size: var(--text-sm); color: var(--info-color)">
                启用后，可为每个场景上传首帧图片，AI将基于图片和提示词生成视频
              </p>
            </div>

            <!-- 场景图片上传区域 -->
            <div v-if="enableImageToVideo && !scenesGenerating" class="scenes-image-upload" style="margin-bottom: var(--text-2xl)">
              <el-alert
                title="请为每个场景上传首帧图片"
                type="info"
                :closable="false"
                style="margin-bottom: var(--spacing-4xl)"
              >
                <template #default>
                  <p>上传图片后，AI将基于图片内容和场景描述生成视频</p>
                  <p style="margin-top: var(--spacing-base)">支持格式：JPG、PNG，建议尺寸：1280x720或1920x1080</p>
                </template>
              </el-alert>

              <el-row :gutter="16">
                <el-col :span="8" v-for="(scene, index) in scriptData.scenes" :key="index">
                  <el-card shadow="hover" class="scene-image-card">
                    <template #header>
                      <div class="scene-card-header">
                        <el-tag type="primary" size="small">场景 {{ index + 1 }}</el-tag>
                        <span class="scene-title">{{ scene.sceneTitle }}</span>
                      </div>
                    </template>
                    <div class="scene-image-upload-area">
                      <el-upload
                        v-if="!sceneImages[index]"
                        class="image-uploader"
                        :show-file-list="false"
                        :before-upload="(file) => beforeImageUpload(file, index)"
                        :http-request="(options) => handleImageUpload(options, index)"
                        accept="image/jpeg,image/png,image/jpg"
                        drag
                      >
                        <UnifiedIcon name="Plus" />
                        <div class="upload-text">点击或拖拽上传</div>
                        <div class="upload-hint">JPG/PNG，建议16:9</div>
                      </el-upload>
                      <div v-else class="uploaded-image-preview">
                        <img :src="sceneImages[index]" alt="场景图片" />
                        <div class="image-overlay">
                          <el-button
                            type="danger"
                            size="small"
                            circle
                            @click="removeSceneImage(index)"
                          >
                            <UnifiedIcon name="Delete" />
                          </el-button>
                        </div>
                      </div>
                    </div>
                    <div class="scene-description" style="margin-top: var(--spacing-2xl); font-size: var(--text-sm); color: var(--text-regular)">
                      {{ scene.visualDescription?.substring(0, 50) }}...
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <el-progress
              v-if="scenesGenerating"
              :percentage="scenesProgress"
              :status="scenesProgress === 100 ? 'success' : undefined"
            />
            <p v-if="scenesGenerating" class="progress-text">{{ scenesProgressText }}</p>

            <div v-if="sceneVideos.length > 0" class="scenes-preview">
              <el-row :gutter="16">
                <el-col :span="8" v-for="(scene, index) in sceneVideos" :key="index">
                  <el-card shadow="hover" class="scene-video-card" @click="previewSceneVideo(scene, index)">
                    <template #header>
                      <div class="scene-card-header">
                        <el-tag type="primary" size="small">场景 {{ index + 1 }}</el-tag>
                        <span class="scene-title">{{ scene.sceneTitle }}</span>
                      </div>
                    </template>
                    <div class="scene-thumbnail">
                      <video
                        v-if="scene.videoUrl"
                        :src="scene.videoUrl"
                        class="thumbnail-video"
                        @click.stop
                      ></video>
                      <div v-else-if="scene.error" class="error-placeholder">
                        <UnifiedIcon name="default" />
                        <p class="error-text">{{ scene.error }}</p>
                      </div>
                      <div class="play-overlay">
                        <UnifiedIcon name="default" />
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <el-button type="primary" @click="approveScenes" style="margin-top: var(--text-2xl); width: 100%" size="large">
                <UnifiedIcon name="Check" />
                确认分镜，继续下一步 →
              </el-button>
            </div>

            <el-button v-else type="primary" @click="generateScenes" :loading="scenesGenerating" size="large">
              <UnifiedIcon name="default" />
              生成分镜视频
            </el-button>
          </div>

          <div v-else-if="currentStep > 4" class="step-summary">
            <p>✅ 分镜已生成，共 {{ sceneVideos.length }} 个场景</p>
            <el-button type="primary" text @click="showSceneVideosDialog">
              <UnifiedIcon name="default" />
              查看分镜列表
            </el-button>
            <el-button type="warning" text @click="regenerateScenes">
              <UnifiedIcon name="Refresh" />
              重新生成分镜
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤5: 视频剪辑 -->
      <el-timeline-item
        :icon="getStepIcon(5)"
        :type="getStepType(5)"
        :hollow="currentStep !== 5"
        :size="currentStep === 5 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 5 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">✂️ 步骤5: 视频剪辑</span>
              <el-tag v-if="currentStep > 5" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 5" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 5" class="step-content">
            <p class="info-text">使用火山引擎VOD进行视频剪辑合成...</p>

            <el-progress
              v-if="merging"
              :percentage="mergeProgress"
              :status="mergeProgress === 100 ? 'success' : undefined"
            />
            <p v-if="merging" class="progress-text">{{ mergeProgressText }}</p>

            <el-button v-if="!merging && !finalVideoUrl" type="primary" @click="mergeVideos">
              开始剪辑合成
            </el-button>

            <div v-if="finalVideoUrl" class="final-video-preview">
              <h4>合成后的视频</h4>
              <video :src="finalVideoUrl" controls width="100%"></video>
              <el-button type="primary" @click="approveFinalVideo" style="margin-top: var(--spacing-2xl)">
                确认视频，继续 →
              </el-button>
            </div>
          </div>

          <div v-else-if="currentStep > 5" class="step-summary">
            <p>✅ 视频剪辑完成</p>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤6: 预览调整 -->
      <el-timeline-item
        :icon="getStepIcon(6)"
        :type="getStepType(6)"
        :hollow="currentStep !== 6"
        :size="currentStep === 6 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 6 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">👁️ 步骤6: 预览调整</span>
              <el-tag v-if="currentStep > 6" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 6" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 6" class="step-content">
            <div class="preview-section">
              <video v-if="finalVideoUrl" :src="finalVideoUrl" controls width="100%"></video>

              <div class="preview-actions">
                <el-button @click="regenerateVideo">重新生成</el-button>
                <el-button type="primary" @click="approvePreview">
                  确认无误，继续 →
                </el-button>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep > 6" class="step-summary">
            <p>✅ 预览确认完成</p>
          </div>
        </el-card>
      </el-timeline-item>

      <!-- 步骤7: 导出发布 -->
      <el-timeline-item
        :icon="getStepIcon(7)"
        :type="getStepType(7)"
        :hollow="currentStep !== 7"
        :size="currentStep === 7 ? 'large' : 'normal'"
      >
        <el-card :class="{ 'active-step': currentStep === 7 }">
          <template #header>
            <div class="step-header">
              <span class="step-title">🚀 步骤7: 导出发布</span>
              <el-tag v-if="currentStep > 7" type="success">已完成</el-tag>
              <el-tag v-else-if="currentStep === 7" type="primary">进行中</el-tag>
            </div>
          </template>

          <div v-if="currentStep === 7" class="step-content">
            <div class="export-section">
              <h4>视频制作完成！</h4>
              <video v-if="finalVideoUrl" :src="finalVideoUrl" controls width="100%"></video>

              <div class="export-actions">
                <el-button type="primary" @click="downloadVideo">
                  <UnifiedIcon name="Download" />
                  下载视频
                </el-button>
                <el-button type="success" @click="publishVideo">
                  <UnifiedIcon name="Upload" />
                  发布到平台
                </el-button>
                <el-button @click="saveProject">
                  <UnifiedIcon name="default" />
                  保存项目
                </el-button>
              </div>

              <el-divider />

              <el-button type="primary" @click="createNewVideo">
                创建新视频
              </el-button>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 脚本查看对话框 -->
    <el-dialog
      v-model="scriptDialogVisible"
      title="📝 视频脚本详情"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="scriptData" class="script-dialog-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="视频标题" :span="2">
            {{ scriptData.title || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="视频简介" :span="2">
            {{ scriptData.description || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="总时长">
            {{ scriptData.totalDuration || 0 }}秒
          </el-descriptions-item>
          <el-descriptions-item label="场景数量">
            {{ scriptData.scenes?.length || 0 }} 个场景
          </el-descriptions-item>
          <el-descriptions-item label="视觉风格" v-if="scriptData.visualStyle">
            {{ scriptData.visualStyle }}
          </el-descriptions-item>
          <el-descriptions-item label="色调建议" v-if="scriptData.colorTone">
            {{ scriptData.colorTone }}
          </el-descriptions-item>
          <el-descriptions-item label="背景音乐" :span="2" v-if="scriptData.bgmSuggestion">
            {{ scriptData.bgmSuggestion }}
          </el-descriptions-item>
          <el-descriptions-item label="行动号召" :span="2" v-if="scriptData.callToAction">
            {{ scriptData.callToAction }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">场景详情</el-divider>

        <div v-for="(scene, index) in scriptData.scenes" :key="index" class="scene-detail-item">
          <el-card shadow="hover" style="margin-bottom: var(--text-2xl)">
            <template #header>
              <div class="scene-header">
                <span class="scene-number">
                  场景 {{ index + 1 }}: {{ scene.sceneTitle || `场景${index + 1}` }}
                </span>
                <div class="scene-tags">
                  <el-tag type="primary" size="small">{{ scene.duration }}秒</el-tag>
                  <el-tag v-if="scene.emotionalTone" type="success" size="small">
                    {{ scene.emotionalTone }}
                  </el-tag>
                </div>
              </div>
            </template>

            <div class="scene-content">
              <div class="content-section">
                <h4>📹 画面描述</h4>
                <p class="visual-description">{{ scene.visualDescription }}</p>
              </div>

              <div class="content-section">
                <h4>🎤 旁白文案</h4>
                <p class="narration">{{ scene.narration }}</p>
              </div>

              <div v-if="scene.subtitle" class="content-section">
                <h4>📝 字幕文本</h4>
                <p class="subtitle">{{ scene.subtitle }}</p>
              </div>

              <div class="content-section technical-details">
                <h4>🎬 技术参数</h4>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="tech-item">
                      <span class="tech-label">镜头角度:</span>
                      <span class="tech-value">{{ scene.cameraAngle }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="tech-item">
                      <span class="tech-label">镜头运动:</span>
                      <span class="tech-value">{{ scene.cameraMovement }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="tech-item">
                      <span class="tech-label">转场效果:</span>
                      <span class="tech-value">{{ scene.transition }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div v-if="scene.keyVisualElements && scene.keyVisualElements.length > 0" class="content-section">
                <h4>🎨 关键视觉元素</h4>
                <div class="visual-elements">
                  <el-tag
                    v-for="(element, idx) in scene.keyVisualElements"
                    :key="idx"
                    type="info"
                    size="small"
                    style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm)"
                  >
                    {{ element }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <el-divider v-if="scriptData.hashtags && scriptData.hashtags.length > 0" content-position="left">
          推荐话题标签
        </el-divider>
        <div v-if="scriptData.hashtags && scriptData.hashtags.length > 0" class="hashtags">
          <el-tag
            v-for="(tag, index) in scriptData.hashtags"
            :key="index"
            type="warning"
            size="large"
            style="margin-right: var(--spacing-2xl); margin-bottom: var(--spacing-2xl)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="scriptDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="scriptDialogVisible = false">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 配音列表对话框 -->
    <el-dialog
      v-model="audioListDialogVisible"
      title="🎤 配音列表"
      width="60%"
      :close-on-click-modal="false"
    >
      <div v-if="audioData && audioData.length > 0">
        <el-space direction="vertical" :size="12" style="width: 100%">
          <el-card v-for="(audio, index) in audioData" :key="index" shadow="hover" class="audio-item-card">
            <div class="audio-item">
              <div class="audio-info">
                <div class="audio-title">
                  <el-tag type="primary" size="small">场景 {{ audio.sceneNumber }}</el-tag>
                  <span class="audio-narration">{{ audio.narration }}</span>
                </div>
                <div class="audio-meta">
                  <UnifiedIcon name="default" />
                  <span>时长: {{ formatDuration(audio.duration) }}</span>
                </div>
              </div>
              <div class="audio-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="toggleAudioPlay(index, audio.audioUrl)"
                  circle
                >
                  <el-icon :size="16" color="var(--bg-color)">
                    <VideoPause v-if="playingAudioIndex === index" />
                    <VideoPlay v-else />
                  </el-icon>
                </el-button>
                <audio
                  :ref="el => audioRefs[index] = el"
                  :src="audio.audioUrl"
                  @ended="onAudioEnded(index)"
                  style="display: none"
                />
              </div>
            </div>
          </el-card>
        </el-space>
      </div>
      <el-empty v-else description="暂无配音数据" />

      <template #footer>
        <el-button @click="audioListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分镜视频列表对话框 -->
    <el-dialog
      v-model="sceneVideosDialogVisible"
      title="🎬 分镜视频列表"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="sceneVideos && sceneVideos.length > 0">
        <el-row :gutter="20">
          <el-col :span="8" v-for="(scene, index) in sceneVideos" :key="index">
            <el-card shadow="hover" class="scene-video-card-dialog" @click="previewSceneVideo(scene, index)">
              <template #header>
                <div class="scene-card-header">
                  <el-tag type="primary" size="small">场景 {{ index + 1 }}</el-tag>
                  <span class="scene-title">{{ scene.sceneTitle }}</span>
                </div>
              </template>
              <div class="scene-thumbnail">
                <video
                  v-if="scene.videoUrl"
                  :src="scene.videoUrl"
                  class="thumbnail-video"
                  @click.stop
                ></video>
                <div class="play-overlay">
                  <UnifiedIcon name="default" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="暂无分镜数据" />

      <template #footer>
        <el-button @click="sceneVideosDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分镜视频预览对话框 -->
    <el-dialog
      v-model="sceneVideoPreviewVisible"
      :title="`场景 ${currentPreviewSceneIndex + 1}: ${currentPreviewScene?.sceneTitle || ''}`"
      width="720px"
      :close-on-click-modal="false"
    >
      <div v-if="currentPreviewScene" class="scene-video-preview">
        <video
          v-if="currentPreviewScene.videoUrl"
          :src="currentPreviewScene.videoUrl"
          controls
          autoplay
          style="width: 100%; border-radius: var(--spacing-sm);"
        ></video>
        <div v-else class="error-placeholder">
          <UnifiedIcon name="default" />
          <p>视频加载失败</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="sceneVideoPreviewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑步骤1对话框 -->
    <el-dialog
      v-model="editStep1Visible"
      title="📝 编辑创意信息"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="视频主题">
          <el-input
            v-model="formData.topic"
            placeholder="例如：春季招生宣传"
            clearable
          />
        </el-form-item>

        <el-form-item label="发布平台">
          <el-select v-model="formData.platform" placeholder="选择平台">
            <el-option label="抖音" value="douyin" />
            <el-option label="快手" value="kuaishou" />
            <el-option label="视频号" value="wechat_video" />
            <el-option label="小红书" value="xiaohongshu" />
          </el-select>
        </el-form-item>

        <el-form-item label="视频类型">
          <el-select v-model="formData.videoType" placeholder="选择类型">
            <el-option label="招生宣传" value="enrollment" />
            <el-option label="活动展示" value="activity" />
            <el-option label="课程介绍" value="course" />
            <el-option label="园所风采" value="showcase" />
          </el-select>
        </el-form-item>

        <el-form-item label="视频时长">
          <el-radio-group v-model="formData.duration">
            <el-radio label="short">短视频 (15-30秒)</el-radio>
            <el-radio label="medium">中视频 (30-60秒)</el-radio>
            <el-radio label="long">长视频 (1-3分钟)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="关键要点">
          <el-input
            v-model="formData.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="输入视频要突出的关键信息..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editStep1Visible = false">取消</el-button>
        <el-button type="primary" @click="saveStep1Edit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { Download, Upload, Document, VideoPlay, VideoPause, Headset, Clock, Check, Microphone, Refresh, VideoCamera, Plus, QuestionFilled, Delete } from '@element-plus/icons-vue'
import { videoCreationRequest } from '@/utils/request'
import request from '@/utils/request'
import { checkAuthToken } from '@/utils/test-auth'


// 向父组件上报创作完成事件（用于写入“创作历史”）
const emit = defineEmits<{
  (e: 'content-created', payload: {
    title: string
    type: 'video'
    platform: string
    preview?: string
    projectId?: string
    finalVideoUrl?: string
  }): void
}>()

// 音色预览相关
const previewingVoice = ref<string>('')
const previewAudioUrl = ref<string>('')

// 音色配置接口
interface VoiceOption {
  value: string
  label: string
  description: string
  previewText?: string
  scene?: string
}

// 音色分组配置（从TextToSpeech.vue复制）
const voiceGroups = ref([
  {
    label: '🎓 教育专用',
    options: [
      {
        value: 'zh_female_cancan_mars_bigtts',
        label: '灿灿（女声）',
        description: '温柔甜美，适合视频配音',
        previewText: '欢迎来到我们的幼儿园，这里充满了欢声笑语。',
        scene: '通用'
      },
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
      }
    ]
  },
  {
    label: '👶 儿童卡通',
    options: [
      {
        value: 'zh_male_tiancaitongsheng_mars_bigtts',
        label: '天才童声',
        description: '活泼可爱的儿童音色',
        previewText: '大家好，我是小明，很高兴认识你们！',
        scene: '儿童'
      },
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
      }
    ]
  },
  {
    label: '🎙️ 通用音色',
    options: [
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
        value: 'zh_male_chunhui_mars_bigtts',
        label: '广告解说',
        description: '专业广告配音',
        previewText: '选择我们的幼儿园，给孩子一个美好的未来。',
        scene: '广告'
      }
    ]
  }
])

// 表单数据
const formData = ref({
  topic: '',
  platform: '',
  videoType: '',
  duration: 'short',
  orientation: 'vertical', // 默认竖版（适合抖音、快手等）
  style: 'warm', // 默认温馨风格
  keyPoints: '',
  targetAudience: 'parents', // 默认目标受众：家长
  voiceStyle: 'zh_female_cancan_mars_bigtts' // 默认使用灿灿女声
})

// 当前步骤
const currentStep = ref(1)

// 项目ID
const projectId = ref('')

// 步骤2: 脚本数据
const scriptGenerating = ref(false)
const scriptProgress = ref(0)
const scriptProgressText = ref('')
const scriptData = ref<any>(null)

// 步骤3: 配音数据
const audioGenerating = ref(false)
const audioProgress = ref(0)
const audioProgressText = ref('')
const audioUrl = ref('') // 保留用于兼容性
const audioData = ref<any[]>([]) // 音频列表
const playingAudioIndex = ref<number | null>(null) // 当前播放的音频索引
const audioRefs = ref<any[]>([]) // 音频元素引用

// 步骤4: 分镜数据
const scenesGenerating = ref(false)
const scenesProgress = ref(0)
const scenesProgressText = ref('')
const sceneVideos = ref<any[]>([])

// 首帧生视频相关
const enableImageToVideo = ref(false) // 是否启用首帧生视频
const sceneImages = ref<Record<number, string>>({}) // 场景图片 {sceneIndex: imageUrl}
const uploadingImages = ref<Record<number, boolean>>({}) // 上传状态

// 步骤5: 合成数据
const merging = ref(false)
const mergeProgress = ref(0)
const mergeProgressText = ref('')
const finalVideoUrl = ref('')

// 轮询相关
let pollingTimer: number | null = null
const isPolling = ref(false)
const realProgress = ref(0) // 真实进度（从后端获取）
const realProgressMessage = ref('') // 真实进度消息

// 对话框状态
const scriptDialogVisible = ref(false) // 脚本查看对话框
const editStep1Visible = ref(false) // 编辑步骤1对话框
const audioListDialogVisible = ref(false) // 配音列表对话框
const sceneVideosDialogVisible = ref(false) // 分镜视频列表对话框
const sceneVideoPreviewVisible = ref(false) // 分镜视频预览对话框
const currentPreviewScene = ref<any>(null) // 当前预览的场景
const currentPreviewSceneIndex = ref(0) // 当前预览的场景索引

// 获取步骤图标
const getStepIcon = (step: number) => {
  if (currentStep.value > step) return 'Check'
  if (currentStep.value === step) return 'Loading'
  return 'Clock'
}

// 获取步骤类型
const getStepType = (step: number) => {
  if (currentStep.value > step) return 'success'
  if (currentStep.value === step) return 'primary'
  return 'info'
}

// 获取平台名称
const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    douyin: '抖音',
    kuaishou: '快手',
    wechat_video: '视频号',
    xiaohongshu: '小红书'
  }
  return names[platform] || platform
}

// 获取类型名称
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    enrollment: '招生宣传',
    activity: '活动展示',
    course: '课程介绍',
    showcase: '园所风采'
  }
  return names[type] || type
}

// 获取时长名称
const getDurationName = (duration: string) => {
  const names: Record<string, string> = {
    short: '短视频 (15-30秒)',
    medium: '中视频 (30-60秒)',
    long: '长视频 (1-3分钟)'
  }
  return names[duration] || duration
}

// 获取视频方向名称
const getOrientationName = (orientation: string) => {
  const names: Record<string, string> = {
    horizontal: '📺 横版 (16:9) - 854x480 (480p)',
    vertical: '📱 竖版 (9:16) - 480x854 (480p)'
  }
  return names[orientation] || orientation
}

// 查看脚本
const viewScript = () => {
  scriptDialogVisible.value = true
}

// 编辑步骤1
const editStep1 = () => {
  editStep1Visible.value = true
}

// 保存步骤1编辑
const saveStep1Edit = () => {
  editStep1Visible.value = false
  ElMessage.success('创意信息已更新')
}

/**
 * 轮询项目状态
 */
const pollProjectStatus = async () => {
  if (!projectId.value || !isPolling.value) return

  try {
    const response = await videoCreationRequest.get(`/video-creation/projects/${projectId.value}/status`)

    if (response.success && response.data) {
      // 更新真实进度
      realProgress.value = response.data.progress || 0
      realProgressMessage.value = response.data.progressMessage || ''

      // 根据状态更新UI（后端返回小写状态）
      const status = response.data.status.toLowerCase()

      if (status === 'draft' && response.data.scriptData) {
        // 脚本生成完成
        scriptData.value = response.data.scriptData
        scriptProgress.value = 100
        scriptProgressText.value = '脚本生成完成！'
        scriptGenerating.value = false
        stopPolling()
        ElNotification({
          title: '脚本生成完成',
          message: '您的视频脚本已生成，请查看并确认',
          type: 'success',
          duration: 5000
        })
      } else if (status === 'generating_script') {
        // 更新脚本生成进度
        scriptProgress.value = realProgress.value
        scriptProgressText.value = realProgressMessage.value || `正在生成脚本... ${realProgress.value}%`
      }

      // 检查是否有错误
      if (response.data.errorMessage) {
        ElMessage.error(response.data.errorMessage)
        stopPolling()
      }
    }
  } catch (error) {
    console.error('轮询项目状态失败:', error)
  }
}

/**
 * 开始轮询
 */
const startPolling = () => {
  if (isPolling.value) return

  isPolling.value = true
  pollingTimer = window.setInterval(() => {
    pollProjectStatus()
  }, 3000) // 每3秒轮询一次
}

/**
 * 停止轮询
 */
const stopPolling = () => {
  isPolling.value = false
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

/**
 * 检查未完成的项目
 */
const checkUnfinishedProjects = async () => {
  try {
    const response = await videoCreationRequest.get('/video-creation/unfinished')

    if (response.success && response.data && response.data.length > 0) {
      const project = response.data[0] // 获取最新的未完成项目

      // 询问用户是否要恢复项目
      ElMessageBox.confirm(
        `您有一个未完成的视频项目"${project.title || '未命名'}"，是否要继续完成？`,
        '发现未完成项目',
        {
          confirmButtonText: '继续完成',
          cancelButtonText: '忽略并删除',
          type: 'info',
          distinguishCancelAndClose: true,
          closeOnClickModal: false
        }
      ).then(async () => {
        // 用户选择恢复项目
        try {
        // 恢复项目基本信息
        projectId.value = project.id
        realProgress.value = project.progress || 0
        realProgressMessage.value = project.progressMessage || ''

        // 根据状态恢复到对应步骤
        // 将status转换为小写进行比较（后端返回小写）
        const statusLower = project.status.toLowerCase()

        // 检查scriptData是否有效（不是null、undefined、空对象或空字符串）
        const hasValidScriptData = project.scriptData &&
          typeof project.scriptData === 'object' &&
          Object.keys(project.scriptData).length > 0 &&
          project.scriptData.scenes &&
          Array.isArray(project.scriptData.scenes) &&
          project.scriptData.scenes.length > 0

        console.log('项目恢复检查:', {
          projectId: project.id,
          status: statusLower,
          hasScriptData: !!project.scriptData,
          scriptDataType: typeof project.scriptData,
          scriptDataKeys: project.scriptData ? Object.keys(project.scriptData) : [],
          hasValidScriptData: hasValidScriptData
        })

        if (statusLower === 'draft' && hasValidScriptData) {
          // 脚本已生成完成
          console.log('恢复已完成的脚本项目:', project.id)

          // 恢复表单数据
          if (project.topic) formData.value.topic = project.topic
          if (project.platform) formData.value.platform = project.platform
          if (project.videoType) formData.value.videoType = project.videoType
          if (project.duration) formData.value.duration = project.duration
          if (project.style) formData.value.style = project.style
          if (project.keyPoints) formData.value.keyPoints = project.keyPoints
          if (project.targetAudience) formData.value.targetAudience = project.targetAudience
          if (project.voiceStyle) formData.value.voiceStyle = project.voiceStyle

          // 恢复脚本数据
          scriptData.value = project.scriptData
          scriptProgress.value = 100
          scriptProgressText.value = '脚本生成完成！'
          scriptGenerating.value = false

          // 解析和恢复分镜数据
          let parsedSceneVideos: any[] = []
          if (project.sceneVideos) {
            // 处理JSON字符串或数组
            if (typeof project.sceneVideos === 'string') {
              try {
                parsedSceneVideos = JSON.parse(project.sceneVideos)
                console.log('✅ 恢复分镜数据:', parsedSceneVideos.length, '个场景')
              } catch (e) {
                console.error('❌ 解析分镜数据失败:', e)
                parsedSceneVideos = []
              }
            } else if (Array.isArray(project.sceneVideos)) {
              parsedSceneVideos = project.sceneVideos
              console.log('✅ 恢复分镜数据:', parsedSceneVideos.length, '个场景')
            } else {
              console.warn('⚠️ 分镜数据格式错误')
              parsedSceneVideos = []
            }
          }

          // 解析和恢复配音数据
          let parsedAudioData: any[] = []
          if (project.audioData) {
            // 处理JSON字符串或数组
            if (typeof project.audioData === 'string') {
              try {
                parsedAudioData = JSON.parse(project.audioData)
                console.log('✅ 恢复配音数据:', parsedAudioData.length, '个音频')
              } catch (e) {
                console.error('❌ 解析配音数据失败:', e)
                parsedAudioData = []
              }
            } else if (Array.isArray(project.audioData)) {
              parsedAudioData = project.audioData
              console.log('✅ 恢复配音数据:', parsedAudioData.length, '个音频')
            } else {
              console.warn('⚠️ 配音数据格式错误')
              parsedAudioData = []
            }
          }

          // 根据解析后的数据恢复步骤
          if (parsedSceneVideos.length > 0) {
            currentStep.value = 4
            sceneVideos.value = parsedSceneVideos
            scenesProgress.value = 100
            scenesProgressText.value = '分镜生成完成！'

            // 同时恢复配音数据
            if (parsedAudioData.length > 0) {
              audioData.value = parsedAudioData
              audioProgress.value = 100
              audioProgressText.value = '配音生成完成！'
            }

            ElNotification({
              title: '项目已恢复',
              message: `您的视频分镜已生成完成（${parsedSceneVideos.length}个场景），可以继续下一步操作`,
              type: 'success',
              duration: 5000
            })
          }
          // 检查是否有配音数据（无分镜）
          else if (parsedAudioData.length > 0) {
            currentStep.value = 3
            audioData.value = parsedAudioData
            audioProgress.value = 100
            audioProgressText.value = '配音生成完成！'

            ElNotification({
              title: '项目已恢复',
              message: `您的视频配音已生成完成（${parsedAudioData.length}个音频），可以继续下一步操作`,
              type: 'success',
              duration: 5000
            })
          } else {
            currentStep.value = 2

            ElNotification({
              title: '项目已恢复',
              message: '您的视频脚本已生成完成，可以继续下一步操作',
              type: 'success',
              duration: 5000
            })
          }
        } else if (statusLower === 'generating_script') {
          // 脚本正在生成中
          console.log('恢复正在生成脚本的项目:', project.id)
          currentStep.value = 2
          scriptGenerating.value = true
          scriptProgress.value = realProgress.value
          scriptProgressText.value = realProgressMessage.value || `正在生成脚本... ${realProgress.value}%`
          startPolling()

          ElNotification({
            title: '项目已恢复',
            message: '正在继续生成视频脚本，请稍候...',
            type: 'info',
            duration: 5000
          })
        } else if (statusLower === 'generating_audio') {
          // 配音正在生成中
          console.log('恢复正在生成配音的项目:', project.id)
          currentStep.value = 3
          scriptData.value = project.scriptData
          audioGenerating.value = true
          audioProgress.value = realProgress.value
          audioProgressText.value = realProgressMessage.value || `正在生成配音... ${realProgress.value}%`
          startPolling()

          ElNotification({
            title: '项目已恢复',
            message: '正在继续生成配音，请稍候...',
            type: 'info',
            duration: 5000
          })
        } else if (statusLower === 'generating_video') {
          // 视频正在生成中
          console.log('恢复正在生成视频的项目:', project.id)
          currentStep.value = 4
          scriptData.value = project.scriptData
          audioData.value = project.audioData || []
          sceneVideos.value = project.sceneVideos || []
          
          // 只有在确实有场景视频数据时才设置为生成中并启动轮询
          if (sceneVideos.value && sceneVideos.value.length > 0) {
            scenesGenerating.value = true
            scenesProgress.value = realProgress.value
            scenesProgressText.value = realProgressMessage.value || `正在生成视频... ${realProgress.value}%`
            startPolling()

            // 启动视频状态轮询（只在有场景数据时）
            startVideoStatusPolling()
          } else {
            console.warn('⚠️ 没有场景视频数据，跳过轮询')
          }

          ElNotification({
            title: '项目已恢复',
            message: '正在继续生成视频，请稍候...',
            type: 'info',
            duration: 5000
          })
        } else if (statusLower === 'editing') {
          // 视频剪辑中
          console.log('恢复正在剪辑的项目:', project.id)
          currentStep.value = 5
          scriptData.value = project.scriptData
          audioData.value = project.audioData || []
          sceneVideos.value = project.sceneVideos || []
          merging.value = true
          mergeProgress.value = realProgress.value
          mergeProgressText.value = realProgressMessage.value || `正在剪辑视频... ${realProgress.value}%`
          startPolling()

          ElNotification({
            title: '项目已恢复',
            message: '正在继续剪辑视频，请稍候...',
            type: 'info',
            duration: 5000
          })
        } else {
          // 其他状态，默认恢复到步骤1
          console.log('恢复项目到默认状态:', project.id, project.status)
          currentStep.value = 1

          ElNotification({
            title: '项目已恢复',
            message: '项目已恢复，您可以继续编辑',
            type: 'info',
            duration: 5000
          })
        }

        // 标记为已通知
        try {
          await videoCreationRequest.post(`/video-creation/projects/${project.id}/notified`)
          console.log('项目已标记为已通知:', project.id)
        } catch (error) {
          console.error('标记已通知失败:', error)
        }
      } catch (error) {
        console.error('恢复项目失败:', error)
        ElMessage.error('恢复项目失败，请重试')
      }
      }).catch(async (action) => {
        // 用户选择"忽略并删除"或关闭对话框
        console.log('📌 用户操作:', action, '项目ID:', project.id)
        
        if (action === 'cancel') {
          // 用户点击了"忽略并删除"按钮
          try {
            console.log(`🗑️ 开始删除未完成项目: ${project.id}`)
            const deleteResponse = await videoCreationRequest.delete(`/video-creation/projects/${project.id}`)
            console.log('删除响应:', deleteResponse)
            
            if (deleteResponse.success) {
              ElMessage.success('已删除未完成项目及所有相关文件')
              console.log('✅ 未完成项目已成功删除')
            } else {
              ElMessage.warning('删除项目失败: ' + (deleteResponse.message || '未知错误'))
              console.warn('⚠️ 删除响应不成功:', deleteResponse)
            }
          } catch (error: any) {
            console.error('❌ 删除未完成项目失败:', error)
            ElMessage.error('删除项目失败: ' + (error.message || '请稍后重试'))
          }
        } else {
          // 用户点击了关闭按钮（X）或按了ESC
          console.log('用户关闭了恢复提示，操作类型:', action)
        }
      })
    }
  } catch (error) {
    console.error('检查未完成项目失败:', error)
  }
}

// 开始创作
const startCreation = async () => {
  if (!formData.value.topic || !formData.value.platform || !formData.value.videoType) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    // 检查是否已经有projectId（恢复的项目）
    if (!projectId.value) {
      console.log('🆕 创建新项目...')
      // 创建新项目
      const response = await videoCreationRequest.post('/video-creation/projects', formData.value)
      projectId.value = response.data.projectId // 修复：使用正确的字段名
      console.log('✅ 项目创建成功，ID:', projectId.value)
    } else {
      console.log('🔄 使用已恢复的项目，ID:', projectId.value)
    }

    // 进入下一步
    currentStep.value = 2

    // 自动生成脚本（异步，不等待）
    generateScript()
  } catch (error) {
    ElMessage.error('创建项目失败')
    console.error(error)
  }
}

// 将duration字符串转换为实际秒数（必须是5的倍数）
const getDurationInSeconds = (duration: string): number => {
  const durationMap: Record<string, number> = {
    short: 15,    // 短视频 (15秒) → 3个场景 × 5秒
    medium: 30,   // 中视频 (30秒) → 6个场景 × 5秒
    long: 60      // 长视频 (60秒) → 12个场景 × 5秒
  }
  return durationMap[duration] || 15 // 默认15秒
}

// 生成脚本
const generateScript = async () => {
  scriptGenerating.value = true
  scriptProgress.value = 10
  scriptProgressText.value = '正在准备生成脚本...'

  try {
    // 启动轮询
    startPolling()

    // 将duration转换为实际秒数
    const durationInSeconds = getDurationInSeconds(formData.value.duration)
    console.log(`📊 视频时长: ${formData.value.duration} → ${durationInSeconds}秒`)

    // 发起异步请求（不等待完成）
    videoCreationRequest.post(`/video-creation/projects/${projectId.value}/script`, {
      topic: formData.value.topic,
      platform: formData.value.platform,
      videoType: formData.value.videoType,
      duration: durationInSeconds, // 使用转换后的秒数
      orientation: formData.value.orientation, // 视频方向（横版/竖版）
      style: formData.value.style, // 视频风格
      keyPoints: formData.value.keyPoints,
      targetAudience: formData.value.targetAudience, // 目标受众
      voiceStyle: formData.value.voiceStyle // 音色风格
    }).then(response => {
      // 请求成功，但实际完成由轮询检测
      console.log('脚本生成请求已发送')
    }).catch(error => {
      // 请求失败
      ElMessage.error('脚本生成请求失败')
      console.error(error)
      scriptGenerating.value = false
      stopPolling()
    })

    // 显示提示信息
    ElMessage.info({
      message: '脚本生成中，请稍候...这可能需要30-60秒',
      duration: 5000
    })
  } catch (error) {
    ElMessage.error('脚本生成失败')
    console.error(error)
    scriptGenerating.value = false
    stopPolling()
  }
}

// 确认脚本
const approveScript = () => {
  currentStep.value = 3
}

// 生成配音
const generateAudio = async () => {
  audioGenerating.value = true
  audioProgress.value = 0

  try {
    const progressInterval = setInterval(() => {
      if (audioProgress.value < 90) {
        audioProgress.value += 10
        audioProgressText.value = `正在生成配音... ${audioProgress.value}%`
      }
    }, 500)

    const response = await videoCreationRequest.post(`/video-creation/projects/${projectId.value}/audio`, {
      script: scriptData.value,
      voiceStyle: formData.value.voiceStyle
    })

    clearInterval(progressInterval)
    audioProgress.value = 100
    audioProgressText.value = '配音生成完成！'

    // 保存音频数据列表
    if (response.data && Array.isArray(response.data)) {
      audioData.value = response.data
      console.log(`✅ 配音生成成功，共 ${audioData.value.length} 个音频文件`)
    } else {
      // 兼容旧格式
      audioUrl.value = response.data?.audioUrl || ''
    }

    ElMessage.success(`配音生成成功！共生成 ${audioData.value.length} 个音频文件`)
  } catch (error) {
    ElMessage.error('配音生成失败')
    console.error('❌ 配音生成失败:', error)
  } finally {
    audioGenerating.value = false
  }
}

// 重新生成脚本
const regenerateScript = async () => {
  const result = await ElMessageBox.confirm(
    '重新生成脚本将清除当前脚本和后续所有步骤的数据，是否继续？',
    '确认重新生成',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (!result) return

  // 清除脚本和后续数据
  scriptData.value = null
  audioData.value = []
  sceneVideos.value = []
  finalVideoUrl.value = ''

  // 重置步骤
  currentStep.value = 2

  // 重新生成脚本
  await generateScript()
}

// 重新生成配音
const regenerateAudio = async () => {
  const result = await ElMessageBox.confirm(
    '重新生成配音将清除当前配音和后续所有步骤的数据，是否继续？',
    '确认重新生成',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (!result) return

  // 清除配音和后续数据
  audioData.value = []
  sceneVideos.value = []
  finalVideoUrl.value = ''

  // 重置步骤
  currentStep.value = 3

  // 重新生成配音
  await generateAudio()
}

// 重新生成分镜
const regenerateScenes = async () => {
  const result = await ElMessageBox.confirm(
    '重新生成分镜将清除当前分镜和后续所有步骤的数据，是否继续？',
    '确认重新生成',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).catch(() => false)

  if (!result) return

  // 清除分镜和后续数据
  sceneVideos.value = []
  finalVideoUrl.value = ''

  // 重置步骤
  currentStep.value = 4

  // 重新生成分镜
  await generateScenes()
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
    // 🔍 调试：检查token
    console.log('🔍 [配音预览] 开始预览音色:', voice.label)
    const token = checkAuthToken()
    if (!token) {
      ElMessage.error('认证token不存在，请重新登录')
      return
    }

    previewingVoice.value = voice.value

    // 调用后端API生成预览音频（最多10秒）
    const previewText = voice.previewText.substring(0, 100) // 限制文本长度
    console.log('📡 [配音预览] 发送请求到 /ai/text-to-speech')
    console.log('📡 [配音预览] 请求参数:', { text: previewText, voice: voice.value, speed: 1.0, format: 'mp3' })

    const response = await request.post('/ai/text-to-speech', {
      text: previewText,
      voice: voice.value,
      speed: 1.0,
      format: 'mp3'
    }, {
      responseType: 'blob'
    })

    console.log('✅ [配音预览] 请求成功，响应类型:', response.type, '大小:', response.size)

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
  } catch (error: any) {
    console.error('❌ 音色预览失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })

    if (error.response?.status === 403) {
      ElMessage.error('配音服务认证失败(403)，请检查登录状态')
    } else if (error.response?.status === 401) {
      ElMessage.error('未授权(401)，请重新登录')
    } else {
      ElMessage.error('音色预览失败，请重试')
    }
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

// 切换音频播放
const toggleAudioPlay = (index: number, audioUrl: string) => {
  const audioElement = audioRefs.value[index]

  if (!audioElement) {
    console.error('音频元素未找到')
    return
  }

  // 如果当前正在播放这个音频，则暂停
  if (playingAudioIndex.value === index) {
    audioElement.pause()
    playingAudioIndex.value = null
  } else {
    // 停止其他正在播放的音频
    if (playingAudioIndex.value !== null) {
      const currentAudio = audioRefs.value[playingAudioIndex.value]
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
    }

    // 播放当前音频
    audioElement.play()
    playingAudioIndex.value = index
  }
}

// 音频播放结束
const onAudioEnded = (index: number) => {
  if (playingAudioIndex.value === index) {
    playingAudioIndex.value = null
  }
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return '0秒'

  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  if (minutes > 0) {
    return `${minutes}分${secs}秒`
  }
  return `${secs}秒`
}

// 显示配音列表对话框
const showAudioListDialog = () => {
  audioListDialogVisible.value = true
}

// 确认配音
const approveAudio = () => {
  currentStep.value = 4
  // 重置分镜生成状态，确保按钮可用
  scenesGenerating.value = false
  scenesProgress.value = 0
  scenesProgressText.value = ''
  ElMessage.success('配音确认成功，请生成分镜视频')
}

// 显示分镜视频列表对话框
const showSceneVideosDialog = () => {
  sceneVideosDialogVisible.value = true
}

// 预览分镜视频
const previewSceneVideo = (scene: any, index: number) => {
  currentPreviewScene.value = scene
  currentPreviewSceneIndex.value = index
  sceneVideoPreviewVisible.value = true
}

// 首帧生视频选项变化
const onImageToVideoChange = (value: boolean) => {
  if (!value) {
    // 取消勾选时清空所有图片
    sceneImages.value = {}
  }
}

// 图片上传前验证
const beforeImageUpload = (file: File, sceneIndex: number) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

// 处理图片上传
const handleImageUpload = async (options: any, sceneIndex: number) => {
  const { file } = options

  try {
    uploadingImages.value[sceneIndex] = true

    // 读取图片并转换为base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      sceneImages.value[sceneIndex] = result
      ElMessage.success(`场景${sceneIndex + 1}图片上传成功`)
    }
    reader.onerror = () => {
      ElMessage.error(`场景${sceneIndex + 1}图片上传失败`)
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadingImages.value[sceneIndex] = false
  }
}

// 删除场景图片
const removeSceneImage = (sceneIndex: number) => {
  delete sceneImages.value[sceneIndex]
  ElMessage.success(`已删除场景${sceneIndex + 1}的图片`)
}

// 生成分镜
const generateScenes = async () => {
  // 如果启用了首帧生视频，检查是否所有场景都上传了图片
  if (enableImageToVideo.value) {
    const totalScenes = scriptData.value.scenes.length
    const uploadedCount = Object.keys(sceneImages.value).length

    if (uploadedCount < totalScenes) {
      ElMessage.warning(`请为所有${totalScenes}个场景上传首帧图片（已上传${uploadedCount}个）`)
      return
    }
  }

  scenesGenerating.value = true
  scenesProgress.value = 0

  try {
    const progressInterval = setInterval(() => {
      if (scenesProgress.value < 30) {
        scenesProgress.value += 5
        const mode = enableImageToVideo.value ? '首帧生视频' : '文生视频'
        scenesProgressText.value = `正在提交视频生成任务（${mode}）... ${scenesProgress.value}%`
      }
    }, 1000)

    // 准备场景数据，如果启用了首帧生视频，添加图片URL
    const scenesWithImages = scriptData.value.scenes.map((scene: any, index: number) => {
      if (enableImageToVideo.value && sceneImages.value[index]) {
        return {
          ...scene,
          imageUrl: sceneImages.value[index] // 添加图片URL
        }
      }
      return scene
    })

    const response = await videoCreationRequest.post(`/video-creation/projects/${projectId.value}/scenes`, {
      scenes: scenesWithImages,
      enableImageToVideo: enableImageToVideo.value // 告诉后端是否使用图生视频
    })

    clearInterval(progressInterval)

    // 保存场景视频数据
    sceneVideos.value = response.data.sceneVideos

    const mode = enableImageToVideo.value ? '首帧生视频' : '文生视频'
    ElMessage.success(`视频生成任务已提交（${mode}），正在生成中...`)

    // 开始轮询视频生成状态
    scenesProgress.value = 30
    scenesProgressText.value = '视频生成中，请稍候...'
    startVideoStatusPolling()

  } catch (error) {
    ElMessage.error('分镜生成失败')
    console.error(error)
    scenesGenerating.value = false
  }
}

// 视频状态轮询定时器
let videoStatusPollingTimer: any = null

// 开始轮询视频生成状态
const startVideoStatusPolling = () => {
  // 检查必要条件：必须有有效的 projectId 且处于生成视频状态
  if (!projectId.value || !scenesGenerating.value) {
    console.log('⏸️ 跳过视频状态轮询：没有正在生成的视频项目')
    return
  }

  // 清除之前的定时器
  if (videoStatusPollingTimer) {
    clearInterval(videoStatusPollingTimer)
  }

  let pollCount = 0
  const maxPolls = 60 // 最多轮询60次（5分钟）

  videoStatusPollingTimer = setInterval(async () => {
    pollCount++

    try {
      console.log(`🔍 轮询视频状态 (${pollCount}/${maxPolls})`)

      // 再次检查必要条件
      if (!projectId.value || !scenesGenerating.value) {
        console.warn('⚠️ 轮询条件不满足，停止轮询')
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        return
      }

      const response = await videoCreationRequest.post(`/video-creation/projects/${projectId.value}/check-video-status`)

      // 响应不成功或无数据，停止轮询
      if (!response.success || !response.data) {
        console.warn('⚠️ 响应无效，停止轮询')
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        return
      }

      const { allCompleted, hasError, sceneVideos: updatedSceneVideos } = response.data

      // 数据格式验证：必须是数组且长度大于0
      if (!updatedSceneVideos || !Array.isArray(updatedSceneVideos) || updatedSceneVideos.length === 0) {
        console.warn('⚠️ 场景视频数据无效，停止轮询')
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        return
      }

      // 更新场景视频数据
      sceneVideos.value = updatedSceneVideos

      // 计算进度
      const completedCount = updatedSceneVideos.filter((scene: any) => scene.videoUrl).length
      const totalCount = updatedSceneVideos.length
      const progress = Math.floor((completedCount / totalCount) * 70) + 30 // 30-100%

      scenesProgress.value = progress
      scenesProgressText.value = `视频生成中... ${completedCount}/${totalCount} 个场景已完成`

      // 如果全部完成
      if (allCompleted) {
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        scenesProgress.value = 100
        scenesProgressText.value = '所有视频生成完成！'
        ElMessage.success('所有分镜视频生成完成！')
        console.log('✅ 所有视频生成完成')
        return
      }

      // 如果有错误
      if (hasError) {
        console.warn('⚠️ 部分视频生成失败')
      }

      // 如果超过最大轮询次数
      if (pollCount >= maxPolls) {
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        ElMessage.warning('视频生成超时，请稍后刷新页面查看')
        console.warn('⚠️ 视频生成超时')
        return
      }
    } catch (error) {
      console.error('❌ 查询视频状态失败:', error)

      // 如果连续失败3次，停止轮询
      if (pollCount >= 3) {
        console.warn('⚠️ 连续失败3次，停止轮询')
        clearInterval(videoStatusPollingTimer)
        videoStatusPollingTimer = null
        scenesGenerating.value = false
        ElMessage.error('查询视频状态失败，请刷新页面重试')
        return
      }
    }
  }, 5000) // 每5秒轮询一次
}

// 停止轮询
const stopVideoStatusPolling = () => {
  if (videoStatusPollingTimer) {
    console.log('⏹️ 停止视频状态轮询')
    clearInterval(videoStatusPollingTimer)
    videoStatusPollingTimer = null
    scenesGenerating.value = false
  }
}

// 确认分镜
const approveScenes = () => {
  currentStep.value = 5
}

// 合并视频
const mergeVideos = async () => {
  merging.value = true
  mergeProgress.value = 0

  try {
    const progressInterval = setInterval(() => {
      if (mergeProgress.value < 90) {
        mergeProgress.value += 5
        mergeProgressText.value = `正在剪辑合成视频... ${mergeProgress.value}%`
      }
    }, 1000)

    // 准备合并数据
    const mergeData = {
      sceneVideos: sceneVideos.value,
      audioData: audioData.value, // 使用音频数据数组

      audioUrl: audioUrl.value // 保留兼容性
    }

    console.log('🎬 开始合并视频，场景数:', sceneVideos.value.length, '音频数:', audioData.value.length)

    const response = await videoCreationRequest.post(`/video-creation/projects/${projectId.value}/merge`, mergeData)

    clearInterval(progressInterval)
    mergeProgress.value = 100
    mergeProgressText.value = '视频合成完成！'
    finalVideoUrl.value = response.data.videoUrl


    // 合成成功后，上报历史项，便于“创作历史”一键下载
    try {
      emit('content-created', {
        title: formData.value.topic || '未命名视频',
        type: 'video',
        platform: formData.value.platform || '未选择平台',
        preview: '视频已合成完成，可下载或发布',
        projectId: projectId.value,
        finalVideoUrl: finalVideoUrl.value
      })
    } catch (e) {
      console.warn('上报 content-created 事件失败:', e)
    }

    ElMessage.success('视频合成成功')
  } catch (error) {
    ElMessage.error('视频合成失败')
    console.error('❌ 视频合成失败:', error)
  } finally {
    merging.value = false
  }
}

// 确认最终视频
const approveFinalVideo = () => {
  currentStep.value = 6
}

// 确认预览
const approvePreview = () => {
  // 若已生成最终视频，则同步一次历史项（避免用户跳过“合并后提示”场景漏记历史）
  if (projectId.value && finalVideoUrl.value) {
    try {
      emit('content-created', {
        title: formData.value.topic || '未命名视频',
        type: 'video',
        platform: formData.value.platform || '未选择平台',
        preview: '预览已确认，可下载或发布',
        projectId: projectId.value,
        finalVideoUrl: finalVideoUrl.value
      })
    } catch (e) {
      console.warn('approvePreview: 上报 content-created 事件失败:', e)
    }
  }
  currentStep.value = 7
}

// 重新生成
const regenerateVideo = () => {
  ElMessage.info('重新生成功能开发中...')
}

// 下载视频（携带鉴权，支持外链跳转与本地直下）
const downloadVideo = async () => {
  try {
    if (!projectId.value && !finalVideoUrl.value) {
      ElMessage.warning('暂无可下载视频')
      return
    }

    if (projectId.value) {
      const token =
        localStorage.getItem('kindergarten_token') || ''

      const res = await fetch(`/api/video-creation/projects/${projectId.value}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // 若后端对外链做了302跳转，fetch 可能标记为已重定向
      if (res.redirected && res.url) {
        window.open(res.url, '_blank')
        ElMessage.success('开始下载视频')
        return
      }

      if (!res.ok) {
        throw new Error(`下载失败(${res.status})`)
      }

      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') || ''
      const m = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i)
      const filename = m ? decodeURIComponent(m[1]) : `video_${projectId.value}.mp4`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      ElMessage.success('开始下载视频')
      return
    }

    // 兜底：若没有项目ID，则尝试直接打开生成的URL
    if (finalVideoUrl.value) {
      window.open(finalVideoUrl.value, '_blank')
      ElMessage.success('开始下载视频')
    }
  } catch (err) {
    console.error('下载视频失败:', err)
    ElMessage.error('下载失败，请稍后再试')
  }
}

// 发布视频
const publishVideo = () => {
  ElMessage.info('发布功能开发中...')
}

// 保存项目
const saveProject = () => {
  ElMessage.success('项目已保存')
}

// 处理创建新视频（带确认）
const handleCreateNewVideo = async () => {
  // 检查是否有正在进行的项目
  const hasContent = projectId.value ||
                     formData.value.topic ||
                     scriptData.value ||
                     audioData.value.length > 0 ||
                     sceneVideos.value.length > 0 ||
                     finalVideoUrl.value

  if (hasContent) {
    try {
      await ElMessageBox.confirm(
        '当前有正在进行的视频项目，创建新视频将清除所有数据，是否继续？',
        '确认创建新视频',
        {
          confirmButtonText: '确认创建',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true
        }
      )
      // 用户确认，执行创建新视频
      createNewVideo()
    } catch (error) {
      // 用户取消
      ElMessage.info('已取消创建新视频')
    }
  } else {
    // 没有内容，直接创建
    createNewVideo()
  }
}

// 创建新视频
const createNewVideo = async () => {
  // 如果有正在进行的项目，先删除
  if (projectId.value) {
    try {
      console.log(`🗑️ 删除当前项目: ${projectId.value}`)
      await videoCreationRequest.delete(`/video-creation/projects/${projectId.value}`)
      console.log('✅ 项目及相关文件已删除')
    } catch (error: any) {
      console.error('❌ 删除项目失败:', error)
      ElMessage.warning('删除旧项目失败，但将继续创建新项目')
    }
  }

  // 停止所有轮询
  stopPolling()
  stopVideoStatusPolling()

  // 重置所有状态
  currentStep.value = 1
  projectId.value = ''
  formData.value = {
    topic: '',
    platform: '',
    videoType: '',
    duration: 'short',
    style: 'warm', // 默认温馨风格
    keyPoints: '',
    targetAudience: 'parents', // 默认目标受众：家长
    voiceStyle: 'zh_female_cancan_mars_bigtts' // 默认使用灿灿女声
  }
  scriptData.value = null
  audioUrl.value = ''
  audioData.value = []
  sceneVideos.value = []
  finalVideoUrl.value = ''
  realProgress.value = 0
  realProgressMessage.value = ''

  ElMessage.success('已重置，可以创建新视频')
}

// 生命周期钩子
onMounted(() => {
  // 只在页面初始化时静默检查未完成项目，不自动启动轮询
  // 轮询只在视频真正开始生成时才启动
  checkUnfinishedProjects()
})

onUnmounted(() => {
  // 组件卸载时停止轮询
  stopPolling()
  stopVideoStatusPolling()
})
</script>

<style scoped lang="scss">
.video-creator-timeline {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;

  .header-card {
    margin-bottom: var(--spacing-8xl);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-text {
        flex: 1;

        h2 {
          margin: 0 0 10px 0;
          font-size: var(--text-3xl);
          color: var(--el-text-color-primary);
        }

        .subtitle {
          margin: 0;
          color: var(--el-text-color-secondary);
          font-size: var(--text-base);
        }
      }
    }
  }

  .creation-timeline {
    padding: var(--text-2xl) 0;

    .active-step {
      border: 2px solid var(--el-color-primary);
      box-shadow: 0 2px var(--text-sm) var(--el-color-primary-light-7);
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .step-title {
        font-size: var(--text-xl);
        font-weight: 600;
      }
    }

    .step-content {
      padding: var(--text-2xl) 0;
    }

    .step-summary {
      padding: var(--spacing-2xl) 0;
      color: var(--el-color-success);
      font-weight: 500;
    }

    .progress-text {
      margin-top: var(--spacing-2xl);
      color: var(--el-color-primary);
      font-weight: 500;
    }

    .info-text {
      color: var(--el-text-color-secondary);
      margin-bottom: var(--spacing-4xl);
    }

    .error-text {
      color: var(--el-color-danger);
    }

    .script-preview,
    .audio-preview,
    .scenes-preview,
    .final-video-preview,
    .preview-section,
    .export-section {
      margin-top: var(--text-2xl);

      h4 {
        margin-bottom: var(--spacing-4xl);
        color: var(--el-text-color-primary);
      }

      .scene-item {
        padding: var(--spacing-4xl);
        margin-bottom: var(--spacing-4xl);
        background: var(--el-fill-color-light);
        border-radius: var(--spacing-xs);

        h5 {
          margin: 0 0 10px 0;
          color: var(--el-color-primary);
        }

        p {
          margin: var(--spacing-base) 0;
          color: var(--el-text-color-regular);
        }
      }

      .scene-video {
        margin-bottom: var(--text-2xl);
        padding: var(--spacing-4xl);
        background: var(--el-fill-color-light);
        border-radius: var(--spacing-xs);

        h5 {
          margin: 0 0 10px 0;
          color: var(--el-color-primary);
        }

        video {
          border-radius: var(--spacing-xs);
        }
      }
    }

    .preview-actions,
    .export-actions {
      margin-top: var(--text-2xl);
      display: flex;
      gap: var(--spacing-2xl);
      flex-wrap: wrap;
    }
  }
}

// 脚本预览样式
.script-preview {
  .script-description {
    color: var(--el-text-color-regular);
    font-size: var(--text-base);
    margin-bottom: var(--text-2xl);
    padding: var(--spacing-2xl);
    background-color: var(--el-fill-color-light);
    border-radius: var(--spacing-xs);
  }

  .scene-item {
    margin-bottom: var(--text-2xl);
    padding: var(--spacing-4xl);
    background-color: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);
    border: var(--border-width-base) solid var(--el-border-color);

    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4xl);

      h5 {
        margin: 0;
        font-size: var(--text-lg);
        color: var(--el-text-color-primary);
      }
    }

    .scene-details {
      .detail-row {
        margin-bottom: var(--text-sm);

        strong {
          display: block;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-base);
          font-size: var(--text-base);
        }

        p {
          margin: 0;
          color: var(--el-text-color-regular);
          line-height: 1.6;
          padding-left: var(--spacing-2xl);
        }

        &.technical-info {
          display: flex;
          gap: var(--text-2xl);
          flex-wrap: wrap;
          padding: var(--spacing-2xl);
          background-color: var(--el-fill-color-light);
          border-radius: var(--spacing-xs);

          span {
            color: var(--el-text-color-regular);

            strong {
              display: inline;
              margin-right: var(--spacing-base);
              color: var(--el-text-color-primary);
            }
          }
        }
      }
    }
  }

  .script-meta {
    margin-top: var(--text-2xl);
    padding: var(--spacing-4xl);
    background-color: var(--el-color-primary-light-9);
    border-radius: var(--spacing-sm);
    border-left: var(--spacing-xs) solid var(--el-color-primary);

    p {
      margin: var(--spacing-sm) 0;
      color: var(--el-text-color-regular);

      strong {
        color: var(--el-text-color-primary);
        margin-right: var(--spacing-sm);
      }
    }
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

// 脚本对话框样式
.script-dialog-content {
  .scene-detail-item {
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .scene-number {
        font-weight: bold;
        font-size: var(--text-lg);
        color: var(--el-text-color-primary);
      }

      .scene-tags {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .scene-content {
      .content-section {
        margin-bottom: var(--text-2xl);

        h4 {
          font-size: var(--text-base);
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-base);
          border-bottom: var(--z-index-dropdown) solid var(--el-border-color);
        }

        p {
          margin: 0;
          line-height: 1.8;
          color: var(--el-text-color-regular);
          padding: var(--spacing-2xl);
          background-color: var(--el-fill-color-light);
          border-radius: var(--spacing-xs);

          &.visual-description {
            font-size: var(--text-base);
            text-align: justify;
          }

          &.narration {
            font-size: var(--text-base);
            font-weight: 500;
            color: var(--el-color-primary);
          }

          &.subtitle {
            font-size: var(--text-base);
            color: var(--el-color-success);
          }
        }

        &.technical-details {
          .tech-item {
            padding: var(--spacing-2xl);
            background-color: var(--el-fill-color-light);
            border-radius: var(--spacing-xs);
            text-align: center;

            .tech-label {
              display: block;
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);
              margin-bottom: var(--spacing-base);
            }

            .tech-value {
              display: block;
              font-size: var(--text-base);
              color: var(--el-text-color-primary);
              font-weight: 500;
            }
          }
        }

        .visual-elements {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
      }
    }
  }

  .hashtags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2xl);
  }
}

// 步骤摘要样式
.step-summary {
  .summary-content {
    p {
      margin: var(--spacing-sm) 0;
      color: var(--el-text-color-regular);

      strong {
        color: var(--el-text-color-primary);
        margin-right: var(--spacing-sm);
      }
    }
  }
}

// 音频列表样式
.audio-list {
  margin-top: var(--text-2xl);

  .audio-list-title {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .audio-item-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(var(--transform-hover-lift));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--el-box-shadow-light);
    }
  }

  .audio-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--text-lg);

    .audio-info {
      flex: 1;
      min-width: 0;

      .audio-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        .audio-narration {
          font-size: var(--text-base);
          color: var(--el-text-color-primary);
          font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .audio-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);

        .el-icon {
          font-size: var(--text-base);
        }
      }
    }

    .audio-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  }
}

// 分镜视频卡片样式
.scene-video-card,
.scene-video-card-dialog {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: var(--text-lg);

  &:hover {
    transform: translateY(-var(--spacing-xs));
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  }

  .scene-card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .scene-title {
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
  }

  .scene-thumbnail {
    position: relative;
    width: 100%;
    padding-top: 56.25%; // 16:9 宽高比
    background: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);
    overflow: hidden;

    .thumbnail-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .error-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);

      .el-icon {
        margin-bottom: var(--spacing-sm);
        color: var(--el-text-color-placeholder);
      }

      .error-text {
        font-size: var(--text-sm);
        margin: 0;
      }
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--black-alpha-30);
      opacity: 0;
      transition: opacity 0.3s ease;

      .el-icon {
        color: white;
        filter: drop-shadow(0 2px var(--spacing-xs) var(--black-alpha-50));
      }
    }

    &:hover .play-overlay {
      opacity: 1;
    }
  }
}

// 分镜视频预览样式
.scene-video-preview {
  video {
    max-height: 70vh;
  }

  .error-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-15xl) var(--text-2xl);
    color: var(--el-text-color-secondary);

    .el-icon {
      margin-bottom: var(--text-lg);
      color: var(--el-text-color-placeholder);
    }

    p {
      font-size: var(--text-base);
      margin: 0;
    }
  }
}

// 场景图片上传样式
.scene-image-card {
  .scene-card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .scene-title {
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .scene-image-upload-area {
    min-height: 60px; height: auto;
    display: flex;
    align-items: center;
    justify-content: center;

    .image-uploader {
      width: 100%;
      height: 100%;

      :deep(.el-upload) {
        width: 100%;
        height: 100%;
        border: 2px dashed var(--el-border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--text-2xl);
        border: none;
        background-color: var(--el-fill-color-light);

        &:hover {
          background-color: var(--el-fill-color);
        }
      }

      .upload-icon {
        font-size: var(--text-5xl);
        color: var(--el-text-color-placeholder);
        margin-bottom: var(--spacing-2xl);
      }

      .upload-text {
        font-size: var(--text-base);
        color: var(--el-text-color-regular);
        margin-bottom: var(--spacing-base);
      }

      .upload-hint {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }

    .uploaded-image-preview {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--black-alpha-50);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .scene-description {
    line-height: 1.6;
  }
}
</style>

