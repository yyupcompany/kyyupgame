<template>
  <UnifiedCenterLayout
    title="互动AI课程生成器"
    description="✨ 一键生成精美互动课程 | 包含代码、图片、视频"
    icon="Sparkles"
    :show-breadcrumb="false"
  >
    <!-- 页面头部操作区 -->
    <template #header-actions>
      <el-button @click="goBack" size="small">
        <UnifiedIcon name="ArrowLeft" />
        返回列表
      </el-button>
      <el-tag type="success">AI 驱动</el-tag>
      <el-tag type="info">快速生成</el-tag>
    </template>

  <div class="interactive-curriculum-container">

    <!-- 主容器 - 左右布局 -->
    <div class="icc-main">
      <!-- 左侧：输入表单区域 -->
      <div class="left-panel">
        <!-- 欢迎卡片 - 首次访问显示 -->
        <div v-if="showWelcome" class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-icon">🎓</div>
            <h2>欢迎使用课程生成器</h2>
            <p>只需简单描述你想要的课程，AI 将为你生成完整的互动教学内容</p>

            <!-- 快速开始步骤 -->
            <div class="quick-start-steps">
              <div class="step">
                <div class="step-number">1️⃣</div>
                <div class="step-content">
                  <h4>描述课程</h4>
                  <p>告诉我们你想要什么样的课程</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2️⃣</div>
                <div class="step-content">
                  <h4>选择领域</h4>
                  <p>选择课程所属的教学领域</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3️⃣</div>
                <div class="step-content">
                  <h4>AI 生成</h4>
                  <p>AI 自动生成代码、图片和视频</p>
                </div>
              </div>
            </div>

            <!-- 示例提示 -->
            <div class="tips-section">
              <h4>💡 点击快速填充示例</h4>
              <div class="tips-list">
                <div class="tip-item" @click="fillExample('生成一个关于《春晓》古诗的互动课程，适合中班幼儿，包含卡通风格的图片和朗读互动')">
                  <span class="tip-icon">📖</span>
                  <span>古诗学习课程</span>
                </div>
                <div class="tip-item" @click="fillExample('创建一个数字1-10认知的互动游戏课程，适合小班幼儿，包含数数子游戏和拖拽排序')">
                  <span class="tip-icon">🔢</span>
                  <span>数字认知游戏</span>
                </div>
                <div class="tip-item" @click="fillExample('设计一个认识小动物的互动课程，包括小猫、小狗、小兔子，适合托班幼儿，配合可爱卡通图片')">
                  <span class="tip-icon">🐾</span>
                  <span>认识小动物</span>
                </div>
                <div class="tip-item" @click="fillExample('创建一个安全教育课程，教幼儿认识交通标志和过马路规则，适合大班幼儿')">
                  <span class="tip-icon">🚦</span>
                  <span>安全教育</span>
                </div>
                <div class="tip-item" @click="fillExample('设计一个认识颜色的互动课程，包含红黄蓝绿等基础色，通过游戏学习颜色名称')">
                  <span class="tip-icon">🎨</span>
                  <span>认识颜色</span>
                </div>
                <div class="tip-item" @click="fillExample('创建一个健康饮食习惯的互动课程，教幼儿认识水果和蔬菜，培养不挑食的好习惯')">
                  <span class="tip-icon">🥦</span>
                  <span>健康饮食</span>
                </div>
              </div>
            </div>

            <!-- 开始按钮 -->
            <div class="welcome-actions">
              <el-button type="primary" size="large" @click="startCreating">
                🚀 开始创建课程
              </el-button>
            </div>
          </div>
        </div>

        <!-- 输入表单卡片 -->
        <div v-else class="input-card">
          <div class="input-header">
            <h3>📝 课程需求</h3>
            <p v-if="!isGenerating && !generationComplete">请填写以下信息来生成你的课程</p>
            <p v-else-if="isGenerating" class="generating-text">正在生成中，请稍候...</p>
          </div>

          <div class="input-form">
            <!-- 课程描述 -->
            <div class="form-group">
              <label>课程描述 <span class="required">*</span></label>
              <el-input
                v-model="prompt"
                type="textarea"
                :rows="4"
                placeholder="例如：生成一个认识小猫咪的互动课程，适合4-5岁幼儿，包含卡通风格的图片和动画视频"
                :disabled="isGenerating"
                maxlength="500"
                show-word-limit
              />
              <div class="form-hint">💡 提示：描述越详细，生成的课程质量越好</div>
            </div>

            <!-- 课程领域 -->
            <div class="form-group">
              <label>课程领域 <span class="required">*</span></label>
              <el-select
                v-model="selectedDomain"
                placeholder="选择课程所属的教学领域"
                :disabled="isGenerating"
                style="width: 100%"
              >
                <el-option label="🏃 健康领域" value="health" />
                <el-option label="💬 语言领域" value="language" />
                <el-option label="👥 社会领域" value="social" />
                <el-option label="🔬 科学领域" value="science" />
                <el-option label="🎨 艺术领域" value="art" />
              </el-select>
            </div>

            <!-- 年龄段 -->
            <div class="form-group">
              <label>年龄段 <span class="required">*</span></label>
              <el-select
                v-model="ageGroup"
                placeholder="选择适合的年龄段"
                :disabled="isGenerating"
                style="width: 100%"
              >
                <el-option label="👶 托班 (2-3岁)" value="托班(2-3岁)" />
                <el-option label="🌱 小班 (3-4岁)" value="小班(3-4岁)" />
                <el-option label="🌿 中班 (4-5岁)" value="中班(4-5岁)" />
                <el-option label="🌳 大班 (5-6岁)" value="大班(5-6岁)" />
              </el-select>
              <div class="form-hint">💡 提示：AI将根据年龄段调整内容难度和互动方式</div>
            </div>

            <!-- 🎨 媒体生成选项 -->
            <div class="form-group media-options">
              <label>媒体选项</label>
              <div class="media-options-grid">
                <el-checkbox 
                  v-model="enableImage" 
                  :disabled="isGenerating"
                  class="media-option"
                >
                  <div class="option-content">
                    <span class="option-icon">🖼️</span>
                    <span class="option-label">生成图片</span>
                  </div>
                </el-checkbox>
                <el-checkbox 
                  v-model="enableVoice" 
                  :disabled="isGenerating"
                  class="media-option"
                >
                  <div class="option-content">
                    <span class="option-icon">🗣️</span>
                    <span class="option-label">启用语音</span>
                  </div>
                </el-checkbox>
                <el-checkbox 
                  v-model="enableSoundEffect" 
                  :disabled="isGenerating"
                  class="media-option"
                >
                  <div class="option-content">
                    <span class="option-icon">🔔</span>
                    <span class="option-label">启用音效</span>
                  </div>
                </el-checkbox>
              </div>
              <div class="form-hint">💡 勾选后AI将生成对应的多媒体内容，增强课程互动性</div>
            </div>

            <!-- 🧱 渲染模式开关（默认使用A2UI，对普通用户隐藏） -->
            <!-- 如需调试可取消注释
            <div class="form-group mode-switch">
              <label>🧱 渲染模式</label>
              <div class="mode-toggle">
                <el-switch
                  v-model="useA2UIMode"
                  :disabled="isGenerating"
                  active-text="A2UI搭积木"
                  inactive-text="传统HTML"
                  inline-prompt
                />
                <span class="mode-hint" v-if="useA2UIMode">✨ 实时渲染，边生成边显示</span>
                <span class="mode-hint" v-else>等待完成后显示</span>
              </div>
            </div>
            -->

            <!-- 生成按钮 -->
            <div class="form-actions">
              <el-button
                type="primary"
                size="large"
                :loading="isGenerating"
                @click="handleGenerate"
                class="generate-btn"
                style="width: 100%"
              >
                <UnifiedIcon name="default" />
                {{ isGenerating ? '生成中...' : '🚀 开始生成课程' }}
              </el-button>
              <div class="generate-time-hint" v-if="!isGenerating">
                ⏱️ 预计生成时间：2-3分钟，请耐心等待
              </div>
              <el-button
                v-if="prompt"
                @click="clearForm"
                :disabled="isGenerating"
                style="width: 100%; margin-top: var(--spacing-sm)"
              >
                🔄 清空
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：结果展示区域 -->
      <div class="right-panel">
        <!-- AI Think 思考过程卡片 -->
        <div v-if="thinkingProcess && showThinking" class="thinking-process-card">
          <div class="thinking-header">
            <h4>🧠 AI 思考过程</h4>
            <el-button
              link
              type="primary"
              @click="showThinking = false"
              size="small"
            >
              收起
            </el-button>
          </div>
          <div class="thinking-content">
            <el-scrollbar max-height="200px">
              <div class="thinking-text">{{ thinkingProcess }}</div>
            </el-scrollbar>
          </div>
        </div>

        <!-- 显示 Think 思考过程的按钮 -->
        <div v-if="thinkingProcess && !showThinking" class="thinking-toggle">
          <el-button
            link
            type="primary"
            @click="showThinking = true"
            size="small"
          >
            💭 查看 AI 思考过程
          </el-button>
        </div>

        <!-- 进度显示卡片 -->
        <div v-if="isGenerating" class="progress-card">
          <div class="progress-header">
            <h3>⏳ 生成进度</h3>
            <p>{{ currentStage }}</p>
          </div>
          <ProgressPanel :progress="progress" :stage="currentStage" />
        </div>

        <!-- 成功提示卡片 -->
        <div v-if="generationComplete && !isGenerating" class="success-card">
          <div class="success-icon">✅</div>
          <h3>🎉 课程生成完成！</h3>
          <p class="success-message">你的互动课程已准备就绪，现在可以开始体验了</p>

          <div class="success-actions">
            <el-button
              type="primary"
              size="large"
              @click="startInteractiveCourse"
              class="start-course-btn"
            >
              <UnifiedIcon name="default" />
              🎓 立即体验课程
            </el-button>
            <el-button
              type="default"
              size="large"
              @click="activeTab = 'info'"
              class="view-details-btn"
            >
              <UnifiedIcon name="default" />
              📋 查看课程详情
            </el-button>
          </div>

          <div class="success-tips">
            <p>💡 提示：点击"立即体验课程"进入全屏互动模式，按 ESC 键可退出</p>
          </div>
        </div>

        <!-- 预览区域 - 标签页 -->
        <div v-if="curriculum" class="preview-card">
          <div class="preview-header">
            <h3>📱 课程预览</h3>
            <div class="preview-actions">
              <el-button type="primary" @click="editCurriculum" size="small">
                <UnifiedIcon name="Edit" />
                编辑课程
              </el-button>
              <el-button type="success" @click="saveCurriculum" :loading="isSaving" size="small">
                <UnifiedIcon name="default" />
                保存课程
              </el-button>
            </div>
          </div>

          <el-tabs v-model="activeTab" class="preview-tabs">
            <!-- 🧱 A2UI实时渲染体验 -->
            <el-tab-pane label="🧱 A2UI体验" name="a2ui">
              <div v-if="a2uiSessionId" class="a2ui-preview">
                <div class="a2ui-info-bar">
                  <span>🧱 组件数量: {{ a2uiComponentCount }}</span>
                  <span v-if="isGenerating" class="generating-indicator">✨ 实时渲染中...</span>
                </div>
                <A2UIRenderer
                  :key="a2uiSessionId"
                  :node="a2uiRootNode"
                  :session-id="a2uiSessionId"
                  theme="light"
                  debug-mode
                  @ready="() => console.log('A2UI渲染器就绪')"
                  @error="(e: any) => console.error('A2UI错误:', e)"
                />
              </div>
              <div v-else class="empty-state">
                <p>生成课程后显示A2UI实时体验</p>
                <p class="empty-hint">🧱 启用A2UI模式后，可看到组件逐个搭建</p>
              </div>
            </el-tab-pane>

            <!-- 互动体验（智能选择A2UI或传统HTML/CSS/JS） -->
            <el-tab-pane label="🎓 互动体验" name="code">
              <!-- 优先使用A2UI渲染器（如果有A2UI数据） -->
              <div v-if="a2uiSessionId && a2uiRootNode" class="a2ui-preview">
                <div class="a2ui-info-bar">
                  <span>🧱 A2UI互动模式 | 组件数量: {{ a2uiComponentCount }}</span>
                </div>
                <A2UIRenderer
                  :key="'interactive-' + a2uiSessionId"
                  :node="a2uiRootNode"
                  :session-id="a2uiSessionId"
                  theme="light"
                  @ready="() => console.log('互动体验A2UI渲染器就绪')"
                  @error="(e: any) => console.error('互动体验A2UI错误:', e)"
                />
              </div>
              <!-- 传统HTML/CSS/JS预览（如果有代码数据） -->
              <div v-else-if="curriculum && curriculum.htmlCode" class="code-preview">
                <CurriculumPreview
                  ref="curriculumPreviewRef"
                  :html-code="curriculum.htmlCode"
                  :css-code="curriculum.cssCode"
                  :js-code="curriculum.jsCode"
                />
              </div>
              <!-- 空状态 -->
              <div v-else class="empty-state">
                <el-empty description="暂无课程内容">
                  <p class="empty-hint">请先生成课程或选择一个已有课程</p>
                </el-empty>
              </div>
            </el-tab-pane>

            <!-- 图片预览 -->
            <el-tab-pane label="🖼️ 课程图片" name="images">
              <div v-if="curriculum?.media?.images?.length" class="images-preview">
                <ImageCarousel :images="curriculum.media.images" />
              </div>
              <div v-else class="empty-state">
                <p>生成课程后显示课程图片</p>
              </div>
            </el-tab-pane>

            <!-- 视频预览 - 暂时隐藏 -->
            <!-- <el-tab-pane label="🎬 课程视频" name="video">
              <div v-if="curriculum?.media?.video?.url" class="video-preview">
                <VideoPlayer :video="curriculum.media.video" />
              </div>
              <div v-else class="empty-state">
                <p>生成课程后显示课程视频</p>
              </div>
            </el-tab-pane> -->

            <!-- 课程信息 -->
            <el-tab-pane label="📋 课程信息" name="info">
              <div v-if="curriculum" class="info-preview">
                <el-form label-width="100px">
                  <el-form-item label="课程名称">
                    <span>{{ curriculum.name }}</span>
                  </el-form-item>
                  <el-form-item label="课程描述">
                    <span>{{ curriculum.description }}</span>
                  </el-form-item>
                  <el-form-item label="课程领域">
                    <span>{{ curriculum.domain }}</span>
                  </el-form-item>
                  <el-form-item label="年龄段">
                    <span>{{ curriculum.ageGroup }}</span>
                  </el-form-item>
                  <el-form-item label="课程类型">
                    <span>{{ curriculum.curriculumType }}</span>
                  </el-form-item>
                </el-form>
              </div>
              <div v-else class="empty-state">
                <p>生成课程后显示课程信息</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 空状态提示 -->
        <div v-if="!isGenerating && !curriculum && !showWelcome" class="empty-result">
          <div class="empty-icon">📋</div>
          <p>填写左侧表单后，点击"开始生成课程"按钮</p>
          <p class="empty-hint">生成结果将在这里显示</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 🎯 全屏课程体验弹窗 - 使用A2UISlideshow幻灯片模式 -->
  <el-dialog
    v-model="showFullscreenDialog"
    :fullscreen="true"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="fullscreen-course-dialog"
    @close="closeFullscreenDialog"
  >
    <div class="fullscreen-slideshow-wrapper">
      <A2UISlideshow
        v-if="slidesData.length > 0"
        ref="fullscreenSlideshowRef"
        :key="'fullscreen-slideshow-' + a2uiSessionId"
        :slides="slidesData"
        :session-id="a2uiSessionId || 'fullscreen-session'"
        theme="colorful"
        :show-navigation="true"
        :show-score="true"
        :show-exit-button="false"
        @change="handleSlideChange"
        @event="handleSlideshowEvent"
        @complete="handleCourseComplete"
        @score-change="handleScoreChange"
      />
      <div v-else class="fullscreen-empty">
        <el-empty description="暂无课程内容" />
      </div>
      
      <!-- 退出全屏按钮 -->
      <button class="exit-fullscreen-btn" @click="closeFullscreenDialog">
        <el-icon><Close /></el-icon>
        <span>退出全屏 (ESC)</span>
      </button>
    </div>
  </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Edit, DocumentAdd, VideoPlay, Document, Close } from '@element-plus/icons-vue';
import { interactiveCurriculumAPI } from '@/api/modules/interactive-curriculum';
import { useRouter } from 'vue-router';
import CurriculumPreview from './components/CurriculumPreview.vue';
import ImageCarousel from './components/ImageCarousel.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import ProgressPanel from './components/ProgressPanel.vue';
import A2UIRenderer from '@/components/a2ui/A2UIRenderer.vue';
import A2UISlideshow from '@/components/a2ui/components/slideshow/A2UISlideshow.vue';
import type { SlideData } from '@/components/a2ui/components/slideshow';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import { useA2UIStore } from '@/stores/a2ui';
import { useA2UIAudio } from '@/composables/useA2UIAudio';

const router = useRouter();
const a2uiStore = useA2UIStore();

/**
 * 返回课程列表页面
 */
function goBack() {
  router.push('/teacher-center/creative-curriculum');
}

// 🎵 初始化音频处理
const audioComposable = useA2UIAudio({
  enabled: true,
  voiceEnabled: true,
  effectsEnabled: true,
  voiceVolume: 80,
  effectsVolume: 80,
  autoPlayWelcome: true
});

// 状态
const prompt = ref('');
const selectedDomain = ref('science');
const ageGroup = ref('中班(4-5岁)');
const isGenerating = ref(false);
const isSaving = ref(false);
const progress = ref(0);
const currentStage = ref('');
const generationComplete = ref(false);
const activeTab = ref('code');
const curriculum = ref<any>(null);
const taskId = ref('');
const hasStarted = ref(false); // 是否已开始创建
const thinkingProcess = ref(''); // AI Think 的思考过程
const showThinking = ref(false); // 是否显示 Think 思考过程
const curriculumPreviewRef = ref<InstanceType<typeof CurriculumPreview>>(); // CurriculumPreview 组件引用

// 🎨 媒体生成选项
const enableImage = ref(true);        // 是否生成图片（默认启用）
const enableVoice = ref(true);        // 是否启用语音（默认启用）
const enableSoundEffect = ref(true);  // 是否启用音效（默认启用）

// 🧱 A2UI搭积木模式新增状态
const useA2UIMode = ref(true); // 默认使用A2UI模式
const a2uiSessionId = ref<string | null>(null);
const a2uiComponentCount = ref(0);

// 🎯 全屏弹窗状态
const showFullscreenDialog = ref(false);
const abortController = ref<AbortController | null>(null);
const fullscreenSlideshowRef = ref<InstanceType<typeof A2UISlideshow>>();
const currentScore = ref(0);

// 🧱 A2UI rootNode 计算属性 - 从 store 获取当前会话的根节点
const a2uiRootNode = computed(() => {
  if (!a2uiSessionId.value) return undefined;
  const session = a2uiStore.getSession(a2uiSessionId.value);
  return session?.rootNode || undefined;
});

// 🎓 幻灯片数据 - 从curriculum或a2uiRootNode转换
const slidesData = computed<SlideData[]>(() => {
  console.log('🎓 [slidesData] 计算幻灯片数据...');
  console.log('  - curriculum.value:', curriculum.value ? '存在' : '不存在');
  console.log('  - curriculum.value?.slides:', curriculum.value?.slides?.length || 0);
  console.log('  - curriculum.value?.courseAnalysis:', curriculum.value?.courseAnalysis ? '存在' : '不存在');
  console.log('  - curriculum.value?.courseAnalysis?.activities:', curriculum.value?.courseAnalysis?.activities?.length || 0);
  console.log('  - a2uiRootNode.value:', a2uiRootNode.value ? '存在' : '不存在');
  
  // 优先使用curriculum中的slides字段
  if (curriculum.value?.slides?.length) {
    console.log('✅ [slidesData] 使用 curriculum.slides');
    return curriculum.value.slides;
  }
  
  // 从courseAnalysis转换为幻灯片格式
  if (curriculum.value?.courseAnalysis) {
    console.log('✅ [slidesData] 使用 courseAnalysis 转换');
    const slides = convertCourseAnalysisToSlides(curriculum.value);
    console.log('📊 [slidesData] 转换后的幻灯片数量:', slides.length);
    return slides;
  }
  
  // 从A2UI rootNode转换为幻灯片格式
  if (a2uiRootNode.value) {
    console.log('✅ [slidesData] 使用 a2uiRootNode 转换');
    const slides = convertA2UIToSlides(a2uiRootNode.value);
    console.log('📊 [slidesData] 转换后的幻灯片数量:', slides.length);
    return slides;
  }
  
  console.log('⚠️ [slidesData] 没有可用的数据源，返回空数组');
  return [];
});

/**
 * 将courseAnalysis数据转换为幻灯片格式
 */
function convertCourseAnalysisToSlides(data: any): SlideData[] {
  console.log('🔄 [convertCourseAnalysisToSlides] 开始转换...');
  console.log('📦 [convertCourseAnalysisToSlides] 输入数据:', JSON.stringify(data?.courseAnalysis, null, 2)?.slice(0, 500));
  
  if (!data?.courseAnalysis) {
    console.warn('⚠️ [convertCourseAnalysisToSlides] courseAnalysis 为空');
    return [];
  }
  
  const courseAnalysis = data.courseAnalysis;
  // 兼容多种数据格式
  const title = courseAnalysis.title || data.name || '互动课程';
  const objectives = courseAnalysis.objectives || [];
  // 🔧 修复：活动数据可能在多个位置
  const activities = courseAnalysis.activities || courseAnalysis.activity || [];
  const images = data.media?.images || courseAnalysis.images || [];
  
  console.log('📊 [convertCourseAnalysisToSlides] 解析结果:');
  console.log('  - 标题:', title);
  console.log('  - 目标数:', objectives?.length || 0);
  console.log('  - 活动数:', activities?.length || 0);
  console.log('  - 图片数:', images?.length || 0);
  
  // 如果活动是数组但第一层是对象，展开处理
  let processedActivities = activities;
  if (activities && !Array.isArray(activities)) {
    console.log('⚠️ [convertCourseAnalysisToSlides] activities不是数组，尝试转换');
    processedActivities = Object.values(activities);
  }
  
  console.log('📋 [convertCourseAnalysisToSlides] 处理后的活动:', processedActivities);
  
  const slides: SlideData[] = [];
  
  // 1. 标题页
  slides.push({
    id: 'slide-title',
    type: 'title',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    components: [
      {
        type: 'title',
        id: 'title-comp',
        props: {
          text: title,
          subtitle: `${data.ageGroup || courseAnalysis.ageGroup || '幼儿园'} · 互动学习`
        }
      },
      ...(objectives?.length ? [{
        type: 'objectives',
        id: 'objectives-comp',
        props: { items: objectives }
      }] : [])
    ]
  });
  
  // 2. 图片内容页
  if (images.length > 0) {
    console.log('🖼️ [convertCourseAnalysisToSlides] 添加图片页');
    slides.push({
      id: 'slide-media',
      type: 'media',
      components: [{
        type: 'image-carousel',
        id: 'carousel-comp',
        props: {
          images: images.map((img: any) => ({
            id: img.id || `img-${Math.random().toString(36).slice(2)}`,
            url: img.url || img.src,
            alt: img.description || img.alt || '课程图片'
          }))
        }
      }]
    });
  }
  
  // 3. 活动页 - 遍历每个活动创建独立页面
  if (processedActivities?.length) {
    console.log('🎮 [convertCourseAnalysisToSlides] 添加活动页面...');
    processedActivities.forEach((activity: any, index: number) => {
      console.log(`  - 活动${index + 1}: type=${activity.type}, title=${activity.title}`);
      slides.push({
        id: `slide-activity-${index}`,
        type: 'activity',
        components: [convertActivityToSlideComponent(activity, index)]
      });
    });
  } else {
    console.warn('⚠️ [convertCourseAnalysisToSlides] 没有活动数据！');
  }
  
  // 4. 总结页
  slides.push({
    id: 'slide-summary',
    type: 'summary',
    components: [{
      type: 'summary',
      id: 'summary-comp',
      props: {
        title: '课程完成',
        points: objectives?.length ? objectives : ['完成了所有学习内容', '掌握了新知识', '表现很棒']
      }
    }]
  });
  
  console.log('✅ [convertCourseAnalysisToSlides] 转换完成，总页数:', slides.length);
  return slides;
}

/**
 * 将单个活动转换为幻灯片组件
 */
function convertActivityToSlideComponent(activity: any, index: number): any {
  switch (activity.type) {
    case 'choice':
      return {
        type: 'choice-question',
        id: activity.id || `choice-${index}`,
        props: {
          title: activity.title,
          question: activity.question || activity.instruction,
          options: activity.options || [],
          points: activity.points || 10,
          hint: activity.instruction
        }
      };
    case 'drag-sort':
      return {
        type: 'drag-sort',
        id: activity.id || `drag-${index}`,
        props: {
          title: activity.title,
          instructions: activity.instruction || '拖拽项目到正确位置',
          items: activity.items || [],
          correctOrder: activity.correctOrder || [],
          points: activity.points || 15
        }
      };
    default:
      return {
        type: 'text',
        id: activity.id || `text-${index}`,
        props: {
          title: activity.title,
          content: activity.instruction || '活动内容'
        }
      };
  }
}

/**
 * 从A2UI rootNode转换为幻灯片格式
 */
function convertA2UIToSlides(rootNode: any): SlideData[] {
  console.log('🔄 [convertA2UIToSlides] 开始转换A2UI rootNode...');
  console.log('📦 [convertA2UIToSlides] rootNode:', rootNode?.type, rootNode?.id);
  console.log('📦 [convertA2UIToSlides] children数量:', rootNode?.children?.length || 0);
  
  if (!rootNode?.children?.length) {
    console.warn('⚠️ [convertA2UIToSlides] rootNode没有children');
    return [];
  }
  
  const slides: SlideData[] = [];
  const children = rootNode.children || [];
  
  // 打印所有子组件类型，用于调试
  console.log('📋 [convertA2UIToSlides] 所有子组件:');
  children.forEach((c: any, i: number) => {
    console.log(`  ${i + 1}. type=${c.type}, id=${c.id}, children=${c.children?.length || 0}`);
  });
  
  // 🔧 递归查找特定类型组件的辅助函数
  const findComponentsByType = (node: any, types: string[]): any[] => {
    const results: any[] = [];
    if (!node) return results;
    
    if (types.includes(node.type)) {
      results.push(node);
    }
    
    // 递归搜索子节点
    if (node.children?.length) {
      for (const child of node.children) {
        results.push(...findComponentsByType(child, types));
      }
    }
    
    return results;
  };
  
  // 🔧 递归查找活动卡片（包含活动组件的卡片）
  const findActivityCards = (node: any): any[] => {
    const results: any[] = [];
    if (!node) return results;
    
    // 查找id包含"activity"的卡片
    if (node.type === 'card' && node.id?.includes('activity')) {
      results.push(node);
    }
    
    // 递归搜索子节点
    if (node.children?.length) {
      for (const child of node.children) {
        results.push(...findActivityCards(child));
      }
    }
    
    return results;
  };
  
  // 查找标题卡片
  const titleCards = findComponentsByType(rootNode, ['card']).filter(
    (c: any) => c.id?.includes('title') || c.props?.title
  );
  const titleCard = titleCards[0];
  
  // 查找图片轮播
  const carousels = findComponentsByType(rootNode, ['image-carousel']);
  const carousel = carousels[0];
  
  // 🔧 修复：查找活动卡片（活动组件被包装在卡片中）
  const activityCards = findActivityCards(rootNode);
  
  // 🔧 支持的活动类型
  const activityTypes = [
    'choice', 'choice-question', 
    'drag-sort', 'drag-sorting',
    'fill-blank', 'fill-blank-question', 
    'puzzle-game', 'puzzle',
    'matching', 'matching-game',
    'sorting', 'sequence',
    'whiteboard'
  ];
  
  // 直接的活动组件（非嵌套）
  const directActivities = findComponentsByType(rootNode, activityTypes);
  
  console.log('🔍 [convertA2UIToSlides] 找到的组件:');
  console.log('  - 标题卡片:', titleCard ? '有' : '无');
  console.log('  - 图片轮播:', carousel ? '有' : '无');
  console.log('  - 活动卡片:', activityCards.length, '个');
  console.log('  - 直接活动组件:', directActivities.length, '个');
  
  // 1. 标题页
  if (titleCard || rootNode.props?.title) {
    slides.push({
      id: 'slide-title',
      type: 'title',
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      components: [{
        type: 'title',
        id: 'title-comp',
        props: {
          text: titleCard?.props?.title || rootNode.props?.title || '互动课程',
          subtitle: ageGroup.value || '幼儿园互动学习'
        }
      }]
    });
  }
  
  // 2. 图片轮播页
  if (carousel) {
    slides.push({
      id: 'slide-media',
      type: 'media',
      components: [{
        type: 'image-carousel',
        id: carousel.id,
        props: {
          images: (carousel.props?.images || []).map((img: any) => ({
            id: img.id,
            url: img.src || img.url,
            alt: img.alt || '课程图片'
          }))
        }
      }]
    });
  }
  
  // 3. 活动页 - 优先使用活动卡片
  if (activityCards.length > 0) {
    console.log('🎮 [convertA2UIToSlides] 使用活动卡片创建活动页...');
    activityCards.forEach((card: any, index: number) => {
      console.log(`  ${index + 1}. 卡片: ${card.id}, 标题: ${card.props?.title}`);
      
      // 从卡片中提取活动组件
      const activityComp = findComponentsByType(card, activityTypes)[0];
      
      slides.push({
        id: `slide-activity-${index}`,
        type: 'activity',
        components: [{
          type: activityComp?.type || 'card',
          id: card.id,
          props: {
            title: card.props?.title || `活动 ${index + 1}`,
            ...activityComp?.props
          }
        }]
      });
    });
  } else if (directActivities.length > 0) {
    // 没有活动卡片时使用直接的活动组件
    console.log('🎮 [convertA2UIToSlides] 使用直接活动组件创建活动页...');
    directActivities.forEach((activity: any, index: number) => {
      console.log(`  ${index + 1}. 活动: ${activity.type}, ${activity.id}`);
      
      // 标准化活动类型名称
      let normalizedType = activity.type;
      if (activity.type === 'choice') normalizedType = 'choice-question';
      if (activity.type === 'drag-sorting') normalizedType = 'drag-sort';
      
      slides.push({
        id: `slide-activity-${index}`,
        type: 'activity',
        components: [{
          type: normalizedType,
          id: activity.id,
          props: activity.props
        }]
      });
    });
  } else {
    console.warn('⚠️ [convertA2UIToSlides] 没有找到任何活动组件！');
  }
  
  // 4. 总结页
  slides.push({
    id: 'slide-summary',
    type: 'summary',
    components: [{
      type: 'summary',
      id: 'summary-comp',
      props: {
        title: '课程完成',
        points: ['完成了所有学习内容', '掌握了新知识', '表现很棒']
      }
    }]
  });
  
  console.log('✅ [convertA2UIToSlides] 转换完成，总页数:', slides.length);
  return slides;
}

// 计算属性
const isGenerating_computed = computed(() => isGenerating.value);

// 是否显示欢迎卡片
const showWelcome = computed(() => {
  return !hasStarted.value && !isGenerating.value && !generationComplete.value && !curriculum.value;
});

/**
 * 生成课程（智能选择模式）
 */
async function handleGenerate() {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入课程需求');
    return;
  }

  if (!selectedDomain.value) {
    ElMessage.warning('请选择课程领域');
    return;
  }

  // 根据模式选择生成方式
  if (useA2UIMode.value) {
    await handleGenerateA2UI();
  } else {
    await handleGenerateStream();
  }
}

/**
 * 🧱 A2UI搭积木模式生成课程
 * 实时分段发送组件，前端增量渲染
 */
async function handleGenerateA2UI() {
  isGenerating.value = true;
  hasStarted.value = true;
  progress.value = 0;
  currentStage.value = '🧱 初始化A2UI搭积木模式...';
  generationComplete.value = false;
  thinkingProcess.value = '';
  showThinking.value = true;
  activeTab.value = 'a2ui'; // 切换到A2UI预览标签页

  // 创建A2UI会话
  const sessionId = `curriculum-${Date.now()}`;
  a2uiSessionId.value = sessionId;
  a2uiStore.createSession(sessionId);
  a2uiComponentCount.value = 0;

  try {
    // 使用A2UI流式API生成课程
    abortController.value = interactiveCurriculumAPI.generateA2UIStream(
      {
        prompt: prompt.value,
        domain: selectedDomain.value,
        ageGroup: ageGroup.value,
        // 🎨 传递媒体选项
        enableImage: enableImage.value,
        enableVoice: enableVoice.value,
        enableSoundEffect: enableSoundEffect.value
      },
      {
        onConnected: (newTaskId: string) => {
          taskId.value = newTaskId;
          console.log('✅ [A2UI搭积木] 连接已建立，taskId:', newTaskId);
          ElMessage.success('🧱 开始搭建课程，实时渲染中...');
          currentStage.value = '已连接，等待AI响应...';
        },
        onComponent: (msg) => {
          console.log(`🧱 [A2UI搭积木] 收到组件: ${msg.action} - ${msg.component.id}`);

          try {
            // 🎵 增强组件音频配置（如果组件有音频属性）
            const enhancedComponent = audioComposable.enhanceComponentTree(msg.component);

            // 调用store处理组件消息
            a2uiStore.handleComponentMessage(sessionId, {
              type: 'component',
              action: msg.action,
              targetId: msg.targetId,
              component: enhancedComponent || undefined
            });

            // 🎵 如果组件有欢迎语音且标记为自动播放，触发播放
            if (msg.component.audio?.autoPlay && msg.component.audio.ttsUrl) {
              audioComposable.autoPlayWelcome(
                msg.component.audio.ttsUrl,
                msg.component.audio.ttsText || '',
                msg.component.audio.playDelay || 1000
              );
            }

            // 更新组件计数
            a2uiComponentCount.value = a2uiStore.getComponentCount(sessionId);
          } catch (e) {
            console.error('❌ [A2UI搭积木] onComponent处理失败:', e);
          }
        },
        onThinking: (content: string) => {
          // 实时追加思考内容，确保不会出现undefined
          thinkingProcess.value = (thinkingProcess.value || '') + content;
          console.log('🧠 [A2UI搭积木] 收到思考内容，当前总长度:', thinkingProcess.value?.length || 0);
        },
        onProgress: (message: string) => {
          currentStage.value = message;
          console.log('📊 [A2UI搭积木] 进度:', message);

          // 根据消息更新进度条
          if (message.includes('初始化') || message.includes('分析')) {
            progress.value = 20;
          } else if (message.includes('加载') || message.includes('标题') || message.includes('目标')) {
            progress.value = 40;
          } else if (message.includes('图片')) {
            progress.value = 60;
          } else if (message.includes('活动')) {
            progress.value = 80;
          } else if (message.includes('完成')) {
            progress.value = 95;
          }
        },
        onImageReady: (imageId: string, imageUrl: string) => {
          console.log(`🖼️ [A2UI搭积木] 图片就绪: ${imageId}`);
          // 更新轮播组件中的图片
          a2uiStore.updateImageInCarousel(sessionId, 'media-carousel', imageId, imageUrl);
        },
        onComplete: (message: string) => {
          console.log('✅ [A2UI搭积木]', message);
        },
        onFinished: async (curriculumId: number, plan: any) => {
          console.log('🎉 [A2UI搭积木] 课程生成完成，ID:', curriculumId);
          console.log('📋 [A2UI搭积木] 课程计划:', plan);

          try {
            // 更新UI状态
            progress.value = 100;
            currentStage.value = '🎉 课程搭建完成！';
            generationComplete.value = true;
            isGenerating.value = false;
            ElMessage.success('🧱 课程搭建完成！可以开始体验了');

            // 无论A2UI模式还是传统模式，只要有curriculumId就加载课程详情
            // 这样curriculum.value会被正确设置，保存功能才能正常工作
            if (curriculumId) {
              console.log('📦 [A2UI搭积木] 加载课程详情用于保存功能...');
              await loadCurriculumDetail(curriculumId);
              console.log('✅ [A2UI搭积木] 课程详情已加载，curriculum.value.id:', curriculum.value?.id);
            } else {
              console.log('⚠️ [A2UI搭积木] 无curriculumId，仅使用流式数据（保存功能将不可用）');
            }
            
            console.log('✅ [A2UI搭积木] 处理完成');
          } catch (e) {
            console.error('❌ [A2UI搭积木] onFinished处理失败:', e);
          }
        },
        onError: (error: string) => {
          console.error('❌ [A2UI搭积木] 错误:', error);
          ElMessage.error(`生成失败: ${error}`);
          isGenerating.value = false;
          currentStage.value = `生成失败: ${error}`;
          a2uiStore.setSessionError(sessionId, { code: 'GENERATE_ERROR', message: error });
        }
      }
    );

  } catch (error) {
    console.error('❌ A2UI生成课程失败:', error);
    ElMessage.error('生成失败，请重试');
    isGenerating.value = false;
    currentStage.value = '生成失败';
  }
}

/**
 * 旧版流式生成课程（作为备用）
 */
async function handleGenerateStream() {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入课程需求');
    return;
  }

  if (!selectedDomain.value) {
    ElMessage.warning('请选择课程领域');
    return;
  }

  isGenerating.value = true;
  hasStarted.value = true;
  progress.value = 0;
  currentStage.value = '初始化...';
  generationComplete.value = false;
  thinkingProcess.value = '';
  showThinking.value = true;

  try {
    // 使用流式API生成课程
    interactiveCurriculumAPI.generateCurriculumStream(
      {
        prompt: prompt.value,
        domain: selectedDomain.value,
        ageGroup: ageGroup.value,
        // 🎨 传递媒体选项
        enableImage: enableImage.value,
        enableVoice: enableVoice.value,
        enableSoundEffect: enableSoundEffect.value
      },
      {
        onConnected: (newTaskId: string) => {
          taskId.value = newTaskId;
          console.log('✅ [流式生成] 连接已建立，taskId:', newTaskId);
          ElMessage.success('课程生成已启动，正在处理中...');
          currentStage.value = '已连接，等待AI响应...';
        },
        onThinking: (content: string) => {
          // 实时追加思考内容
          thinkingProcess.value = (thinkingProcess.value || '') + content;
          console.log('🧠 [流式生成] 收到思考内容，当前总长度:', thinkingProcess.value?.length || 0);
        },
        onProgress: (message: string) => {
          currentStage.value = message;
          console.log('📊 [流式生成] 进度更新:', message);

          // 根据进度消息更新进度条
          if (message.includes('初始化')) {
            progress.value = 5;
          } else if (message.includes('深度分析')) {
            progress.value = 20;
          } else if (message.includes('生成资源')) {
            progress.value = 60;
          } else if (message.includes('保存')) {
            progress.value = 90;
          }
        },
        onComplete: () => {
          console.log('✅ [流式生成] 思考过程完成');
        },
        onFinished: async (curriculumId: number, plan?: any) => {
          console.log('🎉 [流式生成] 课程生成完成，ID:', curriculumId);
          console.log('📋 [流式生成] 课程计划:', plan);

          // 如果没有curriculumId但有plan，说明生成在A2UI模式下完成，数据已经在store中
          if (!curriculumId && plan) {
            console.log('✅ [流式生成] A2UI模式生成完成，使用流式数据');
            progress.value = 100;
            currentStage.value = '生成完成';
            generationComplete.value = true;
            isGenerating.value = false;
            ElMessage.success('课程生成完成！');
            return;
          }

          progress.value = 100;
          currentStage.value = '生成完成';
          generationComplete.value = true;
          isGenerating.value = false;

          ElMessage.success('课程生成完成！');

          // 加载课程详情（仅当curriculumId存在时）
          if (curriculumId) {
            await loadCurriculumDetail(curriculumId);
          }
        },
        onError: (error: string) => {
          console.error('❌ [流式生成] 错误:', error);
          ElMessage.error(`生成失败: ${error}`);
          isGenerating.value = false;
          currentStage.value = `生成失败: ${error}`;
        }
      }
    );

  } catch (error) {
    console.error('❌ 生成课程失败:', error);
    ElMessage.error('生成失败，请重试');
    isGenerating.value = false;
    currentStage.value = '生成失败';
  }
}

/**
 * 开始互动课程体验 - 打开全屏弹窗
 */
function startInteractiveCourse() {
  // A2UI 模式：打开全屏弹窗体验
  if (useA2UIMode.value && a2uiSessionId.value && a2uiRootNode.value) {
    showFullscreenDialog.value = true;
    ElMessage.success('🎓 进入全屏互动体验模式，按 ESC 键可退出');
    return;
  }

  // 传统模式：需要课程数据
  if (!curriculum.value) {
    ElMessage.warning('请先生成课程');
    return;
  }

  // 传统模式：打开全屏弹窗
  showFullscreenDialog.value = true;
  ElMessage.success('🎓 进入全屏互动体验模式，按 ESC 键可退出');
}

/**
 * 关闭全屏弹窗
 */
function closeFullscreenDialog() {
  showFullscreenDialog.value = false;
  ElMessage.info('已退出全屏互动体验');
}

/**
 * 处理幻灯片切换
 */
function handleSlideChange(index: number, slide: SlideData) {
  console.log('[互动课程] 切换到幻灯片:', index, slide.type);
}

/**
 * 处理幻灯片事件
 */
function handleSlideshowEvent(event: any) {
  console.log('[互动课程] 幻灯片事件:', event);
}

/**
 * 处理课程完成
 */
function handleCourseComplete() {
  console.log('[互动课程] 课程完成');
  ElMessage.success('🎉 恭喜完成课程！');
}

/**
 * 处理得分变化
 */
function handleScoreChange(score: number) {
  currentScore.value = score;
  console.log('[互动课程] 得分更新:', score);
}

/**
 * 加载课程详情
 * 用于流式生成完成后，根据后端返回的课程 ID 拉取完整课程数据并填充预览
 */
async function loadCurriculumDetail(curriculumId: number) {
  if (!curriculumId) return;

  try {
    console.log('📦 [加载课程详情] 开始加载课程ID:', curriculumId);
    const response = await interactiveCurriculumAPI.getCurriculumDetail(curriculumId);
    console.log('📦 [加载课程详情] API响应:', response);

    // API返回格式: { success: boolean; data: CurriculumDetail }
    if (response && response.success && response.data) {
      curriculum.value = response.data;
      console.log('✅ [加载课程详情] 课程数据已设置:', curriculum.value?.id, curriculum.value?.name);
      // 确保切换到互动体验标签页，方便老师一键全屏上课
      activeTab.value = 'code';
    } else {
      console.error('❌ 获取课程详情返回结构异常:', response);
      ElMessage.error('获取课程详情失败');
    }
  } catch (error) {
    console.error('❌ 获取课程详情失败:', error);
    ElMessage.error('获取课程详情失败，请稍后重试');
  }
}

/**
 * 旧版本生成课程（非流式，保留作为备份）
 */
async function handleGenerateOld() {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入课程需求');
    return;
  }

  if (!selectedDomain.value) {
    ElMessage.warning('请选择课程领域');
    return;
  }

  isGenerating.value = true;
  progress.value = 0;
  currentStage.value = '初始化...';
  generationComplete.value = false;

  try {
    // 调用生成API
    const response = await interactiveCurriculumAPI.generateCurriculum({
      prompt: prompt.value,
      domain: selectedDomain.value,
      ageGroup: ageGroup.value
    });

    // 调试：打印响应结构
    console.log('🔍 生成API响应:', response);
    console.log('🔍 响应类型:', typeof response);
    console.log('🔍 响应keys:', Object.keys(response || {}));

    // API返回格式: { success: boolean; data: { taskId: string; message: string } }
    if (!response || !response.success || !response.data?.taskId) {
      console.error('❌ 响应结构错误:', { response });
      throw new Error('生成失败：无法获取任务ID');
    }

    taskId.value = response.data.taskId;
    ElMessage.success('课程生成已启动，正在处理中...');

    // 使用 SSE 流式获取 Think 思考过程（实时推送）
    interactiveCurriculumAPI.getThinkingProcessStream(
      taskId.value,
      (data) => {
        console.log('🌊 [Think SSE] 收到事件:', data.type);

        if (data.type === 'connected') {
          console.log('✅ Think SSE 连接已建立');
        } else if (data.type === 'thinking') {
          // 收到思考过程内容
          thinkingProcess.value = data.content || '';
          console.log('🧠 获取 Think 思考过程成功，长度:', data.content?.length || 0);
        } else if (data.type === 'complete') {
          console.log('✅ Think 思考过程已完成');
        } else if (data.type === 'timeout') {
          console.warn('⚠️ Think 思考过程获取超时');
        }
      },
      (error) => {
        console.warn('⚠️ Think SSE 连接错误:', error);
      }
    );

    // 轮询进度
    const result = await interactiveCurriculumAPI.pollProgress(taskId.value);
    progress.value = result.progress;
    currentStage.value = result.stage;

    // 获取课程详情
    // 注意：这里需要从后端返回的响应中获取课程ID
    // 暂时使用模拟数据，实际应该从后端获取
    ElMessage.success('课程生成完成！');
    generationComplete.value = true;
  } catch (error) {
    console.error('❌ 生成失败:', error);
    ElMessage.error('课程生成失败，请重试');
  } finally {
    isGenerating.value = false;
  }
}

/**
 * 开始创建课程
 */
function startCreating() {
  hasStarted.value = true;
}

/**
 * 填充示例
 */
function fillExample(example: string) {
  prompt.value = example;
  hasStarted.value = true; // 点击示例后自动进入创建模式
}

/**
 * 清空表单
 */
function clearForm() {
  prompt.value = '';
  selectedDomain.value = 'science';
  ageGroup.value = '4-5岁';
  curriculum.value = null;
  generationComplete.value = false;
  hasStarted.value = false; // 重置为欢迎页面
  thinkingProcess.value = ''; // 清除 Think 思考过程
  showThinking.value = false; // 隐藏 Think 思考过程
  
  // 🎨 重置媒体选项为默认值
  enableImage.value = true;
  enableVoice.value = true;
  enableSoundEffect.value = true;
  
  // 🧱 清理A2UI会话
  if (a2uiSessionId.value) {
    a2uiStore.clearSession(a2uiSessionId.value);
    a2uiSessionId.value = null;
  }
  a2uiComponentCount.value = 0;
}

/**
 * 🧱 取消生成
 */
function cancelGenerate() {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
    isGenerating.value = false;
    currentStage.value = '已取消';
    ElMessage.info('已取消生成');
  }
}

// 🧱 组件销毁时清理
onUnmounted(() => {
  // 取消正在进行的请求
  if (abortController.value) {
    abortController.value.abort();
  }
  // 清理A2UI会话
  if (a2uiSessionId.value) {
    a2uiStore.clearSession(a2uiSessionId.value);
  }
});

/**
 * 编辑课程
 */
function editCurriculum() {
  if (!curriculum.value) return;
  // 跳转到编辑页面
  router.push({
    path: '/teacher-center/creative-curriculum',
    query: { id: curriculum.value.id }
  });
}

/**
 * 保存课程
 */
async function saveCurriculum() {
  if (!curriculum.value) return;

  isSaving.value = true;
  try {
    await interactiveCurriculumAPI.saveCurriculum(curriculum.value.id, {
      status: 'published'
    });
    ElMessage.success('课程已保存');
  } catch (error) {
    console.error('❌ 保存失败:', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
}

// 布局修复已通过 CSS 完成，不再需要 JavaScript 动态设置
</script>

<style scoped lang="scss">
.interactive-curriculum-container {
  width: 100%;
  margin: 0 !important;
  padding: var(--spacing-lg);
  background: var(--bg-page);
  min-height: 100vh;

  .page-header {
    margin-bottom: var(--spacing-2xl);
    padding: var(--spacing-2xl);
    background: var(--gradient-purple);
    border-radius: var(--radius-lg);
    box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--glow-purple);
    color: var(--text-on-primary);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-lg);
    }

    .header-title {
      flex: 1;

      h1 {
        font-size: var(--text-3xl);
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        color: var(--text-on-primary);
        font-weight: var(--font-bold);
      }

      .subtitle {
        margin: 0;
        color: var(--text-on-primary-secondary);
        font-size: var(--text-base);
        font-weight: var(--font-medium);
      }
    }

    .header-badge {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      justify-content: flex-end;

      :deep(.el-tag) {
        background: color-mix(in oklab, var(--el-color-white) 20%, transparent);
        border-color: color-mix(in oklab, var(--el-color-white) 30%, transparent);
        color: var(--text-on-primary);
      }
    }
  }

  .icc-main {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-xl);
    width: 100%;
    max-width: none;
    margin-top: 0;
    align-items: flex-start;
    min-height: calc(100vh - 200px);

    // 左侧面板
    .left-panel {
      flex: 0 0 480px;
      width: 480px;
      min-width: 480px;
      max-width: 480px;
      position: sticky;
      top: var(--spacing-lg);
      max-height: calc(100vh - 120px);
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: auto;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: var(--radius-xs);
      }
    }

    // 右侧面板
    .right-panel {
      flex: 1 1 auto;
      min-width: 400px;
      max-width: calc(100% - 500px);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    // 空状态提示
    .empty-result {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-3xl);
      text-align: center;
      border: 2px dashed var(--border-color);

      .empty-icon {
        font-size: var(--text-6xl);
        margin-bottom: var(--spacing-lg);
        opacity: 0.5;
      }

      p {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-base);
        color: var(--text-secondary);
      }

      .empty-hint {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
      }
    }

    // 欢迎卡片
    .welcome-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      margin-top: var(--spacing-lg);
      box-shadow: var(--shadow-md);
      border: var(--border-width-base) solid var(--border-color);
      width: 100%;

      .welcome-content {
        text-align: center;
      }

      .welcome-icon {
        font-size: var(--text-6xl);
        margin-bottom: var(--spacing-lg);
        display: block;
      }

      h2 {
        font-size: var(--text-2xl);
        margin: 0 0 var(--spacing-md) 0;
        color: var(--text-primary);
        font-weight: var(--font-bold);
      }

      > p {
        font-size: var(--text-base);
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-2xl) 0;
      }

      .quick-start-steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-2xl);

        .step {
          display: flex;
          gap: var(--spacing-md);
          align-items: flex-start;
          padding: var(--spacing-lg);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: var(--spacing-xs) solid var(--primary-color);

          .step-number {
            font-size: var(--text-2xl);
            flex-shrink: 0;
          }

          .step-content {
            text-align: left;

            h4 {
              margin: 0 0 var(--spacing-sm) 0;
              font-size: var(--text-base);
              font-weight: var(--font-semibold);
              color: var(--text-primary);
            }

            p {
              margin: 0;
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }
          }
        }
      }

      .tips-section {
        text-align: left;
        padding: var(--spacing-lg);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        border-left: var(--spacing-xs) solid var(--primary-color);

        h4 {
          margin: 0 0 var(--spacing-md) 0;
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .tips-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--bg-card);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-normal);
          border: var(--border-width-base) solid var(--border-color);

          &:hover {
            background: var(--primary-color);
            color: var(--text-on-primary);
            border-color: var(--primary-color);
            transform: translateY(var(--transform-hover-lift));
          }

          .tip-icon {
            font-size: var(--text-lg);
          }

          span:last-child {
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
          }
        }
      }

      .welcome-actions {
        margin-top: var(--spacing-2xl);
        text-align: center;

        .el-button {
          padding: var(--spacing-lg) var(--spacing-2xl);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          border-radius: var(--radius-md);
        }
      }
    }

    // Think 思考过程卡片
    .thinking-process-card {
      background: var(--bg-page);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      border: var(--border-width-base) solid var(--border-color);
      border-left: var(--spacing-xs) solid var(--primary-color);

      .thinking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);

        h4 {
          margin: 0;
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }
      }

      .thinking-content {
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        padding: var(--spacing-md);

        .thinking-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }

    // Think 思考过程切换按钮
    .thinking-toggle {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--bg-page);
      border-radius: var(--radius-sm);
      border: var(--border-width-base) dashed var(--border-color);
      text-align: center;
    }

    // 输入卡片
    .input-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-md);
      border: var(--border-width-base) solid var(--border-color);
      width: 100%;

      .input-header {
        margin-bottom: var(--spacing-lg);

        h3 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--text-secondary);

          &.generating-text {
            color: var(--primary-color);
            font-weight: var(--font-medium);
          }
        }
      }

      .input-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);

          label {
            font-size: var(--text-sm);
            font-weight: var(--font-semibold);
            color: var(--text-primary);

            .required {
              color: var(--danger-color);
              margin-left: var(--spacing-xs);
            }
          }

          .form-hint {
            font-size: var(--text-xs);
            color: var(--text-muted);
            margin-top: var(--spacing-sm);
          }
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);

          .generate-btn {
            width: 100%;
            height: var(--button-height-lg);
            font-size: var(--text-sm);
            font-weight: var(--font-semibold);
            background: var(--gradient-purple);
            border: none;

            &:hover {
              background: var(--gradient-purple);
            }
          }
        }

        // 🎨 媒体选项样式
        .media-options {
          .media-options-grid {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            background: var(--bg-tertiary);
            border-radius: var(--radius-md);
            border: var(--border-width-base) solid var(--border-color);

            .media-option {
              flex: 1;
              min-width: 100px;
              padding: var(--spacing-sm) var(--spacing-md);
              background: var(--bg-card);
              border-radius: var(--radius-sm);
              border: var(--border-width-base) solid var(--border-color);
              transition: var(--transition-normal);

              &:hover {
                border-color: var(--primary-color);
                box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15);
              }

              :deep(.el-checkbox__label) {
                padding-left: var(--spacing-sm);
              }

              .option-content {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);

                .option-icon {
                  font-size: var(--text-lg);
                }

                .option-label {
                  font-size: var(--text-sm);
                  font-weight: var(--font-medium);
                  color: var(--text-primary);
                }
              }
            }

            // 选中状态
            .media-option:has(.el-checkbox.is-checked) {
              background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1) 0%, rgba(var(--primary-color-rgb), 0.05) 100%);
              border-color: var(--primary-color);
            }
          }
        }
      }
    }

    // 进度卡片
    .progress-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-md);
      border: var(--border-width-base) solid var(--border-color);
      width: 100%;
      position: relative;
      z-index: var(--z-index-dropdown);

      .progress-header {
        margin-bottom: var(--spacing-md);

        h3 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }

    // 成功卡片
    .success-card {
      background: var(--gradient-success);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      text-align: center;
      box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--glow-success);
      color: var(--text-on-primary);
      width: 100%;
      position: relative;
      z-index: var(--z-index-dropdown);

      .success-icon {
        font-size: var(--text-5xl);
        margin-bottom: var(--spacing-md);
        display: block;
      }

      h3 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
        color: var(--text-on-primary);
      }

      p {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--text-on-primary-secondary);
      }

      .success-message {
        font-size: var(--text-base);
        margin-bottom: var(--spacing-lg);
      }

      .success-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        margin-bottom: var(--spacing-md);

        .start-course-btn {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          padding: var(--spacing-md) var(--spacing-2xl);
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 var(--spacing-xs) 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(var(--transform-hover-lift));
            box-shadow: 0 6px var(--text-2xl) rgba(102, 126, 234, 0.6);
          }

          &:active {
            transform: translateY(0);
          }
        }

        .view-details-btn {
          font-size: var(--text-base);
          padding: var(--spacing-md) var(--spacing-xl);
        }
      }

      .success-tips {
        text-align: center;
        padding: var(--spacing-sm);
        background: color-mix(in oklab, var(--el-color-white) 20%, transparent);
        border-radius: var(--radius-sm);
        border: var(--border-width-base) dashed color-mix(in oklab, var(--el-color-white) 30%, transparent);

        p {
          margin: 0;
          font-size: var(--text-xs);
          color: var(--text-on-primary-secondary);
        }
      }
    }

    // 预览卡片
    .preview-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-2xl);
      box-shadow: var(--shadow-md);
      border: var(--border-width-base) solid var(--border-color);
      width: 100%;
      position: relative;
      z-index: var(--z-index-dropdown);

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);

        h3 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        .preview-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .preview-tabs {
        :deep(.el-tabs__content) {
          padding: var(--spacing-lg) 0;
        }
      }

      .empty-state {
        text-align: center;
        padding: var(--spacing-2xl) var(--spacing-lg);
        color: var(--text-secondary);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        border: var(--border-width-base) dashed var(--border-color);

        p {
          margin: 0;
          font-size: var(--text-base);
        }
      }
    }
  }
}

/* 全局样式 - 覆盖 .page-content 和 .main-container 的高度限制 */
:global(.interactive-curriculum-container) {
  :global(.icc-main) {
    height: auto !important;
    max-height: none !important;
    min-height: auto !important;
    overflow: visible !important;
  }

  :global(.page-content) {
    height: auto !important;
    max-height: none !important;
    min-height: auto !important;
    overflow: visible !important;
  }
}

/* 移除父容器的 padding，让 .interactive-curriculum-container 填满整个区域 */
:global(.creative-curriculum:has(.interactive-curriculum-container)) {
  padding: 0 !important;
}

/* 仅本页：去掉 page-content 的内边距，避免左右留黑 */
:global(.page-content:has(.interactive-curriculum-container)) {
  padding: 0 !important;
}

/* 仅本页：取消 page-content 子容器的居中/最大宽度限制，铺满可用宽度 */
:global(.page-content:has(.interactive-curriculum-container) > .creative-curriculum),
:global(.page-content:has(.interactive-curriculum-container) > .page-container),
:global(.page-content:has(.interactive-curriculum-container) > .center-page) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-xl)) {
  .interactive-curriculum-container {
    .icc-main {
      flex-direction: column;

      .left-panel {
        flex: 1;
        min-width: 100%;
        max-width: 100%;
        position: relative;
        top: 0;
        max-height: none;
      }

      .right-panel {
        width: 100%;
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .interactive-curriculum-container {
    padding: var(--spacing-md);

    .page-header {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);

      .header-content {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .header-title h1 {
        font-size: var(--text-2xl);
      }

      .header-badge {
        justify-content: flex-start;
      }
    }

    .icc-main {
      gap: var(--spacing-lg);

      .welcome-card {
        padding: var(--spacing-lg);
        margin-top: var(--spacing-md);

        .welcome-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--spacing-md);
        }

        h2 {
          font-size: var(--text-xl);
        }

        .quick-start-steps {
          grid-template-columns: 1fr;
          gap: var(--spacing-md);
        }
      }

      .input-card,
      .progress-card,
      .preview-card {
        padding: var(--spacing-md);
      }

      .success-card {
        padding: var(--spacing-md);

        .success-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--spacing-sm);
        }

        h3 {
          font-size: var(--text-base);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .interactive-curriculum-container {
    padding: var(--spacing-sm);

    .page-header {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);

      .header-title h1 {
        font-size: var(--text-xl);
        gap: var(--spacing-sm);
      }

      .header-badge {
        gap: var(--spacing-xs);
      }
    }

    .icc-main {
      gap: var(--spacing-md);

      .welcome-card {
        padding: var(--spacing-md);

        .welcome-icon {
          font-size: var(--text-5xl);
        }

        h2 {
          font-size: var(--text-lg);
        }

        .quick-start-steps {
          grid-template-columns: 1fr;
        }

        .tips-list {
          grid-template-columns: 1fr;
        }
      }

      .input-card,
      .progress-card,
      .preview-card {
        padding: var(--spacing-md);
      }

      .success-card {
        padding: var(--spacing-md);

        .success-icon {
          font-size: var(--text-5xl);
        }
      }
    }
  }
}

// 🧱 A2UI搭积木模式样式
.mode-switch {
  .mode-toggle {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    
    .mode-hint {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
  }
}

.a2ui-preview {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  min-height: 500px;
  
  .a2ui-info-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    
    .generating-indicator {
      color: var(--el-color-success);
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 生成时间提示
.generate-time-hint {
  margin-top: var(--spacing-sm);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

// 示例模板网格布局（6个卡片）
.tips-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

// 🎯 全屏课程体验弹窗样式 - 幻灯片模式
:deep(.fullscreen-course-dialog) {
  .el-dialog__header {
    display: none !important;
  }
  
  .el-dialog__body {
    padding: 0 !important;
    height: 100vh;
    overflow: hidden;
    background: #000;
  }
  
  .fullscreen-slideshow-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    :deep(.a2ui-slideshow) {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      border-radius: 0;
      aspect-ratio: auto;
    }
    
    .exit-fullscreen-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
      }
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
  
  .fullscreen-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
  }
}
</style>

