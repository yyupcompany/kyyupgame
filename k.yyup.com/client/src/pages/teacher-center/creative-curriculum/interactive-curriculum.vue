<template>
  <div class="interactive-curriculum-container">
    <!-- 页面头部 - 改进版 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1>
            <UnifiedIcon name="default" />
	            互动AI课程生成器
          </h1>
          <p class="subtitle">✨ 一键生成精美互动课程 | 包含代码、图片、视频</p>
        </div>
        <div class="header-badge">
          <el-tag type="success">AI 驱动</el-tag>
          <el-tag type="info">快速生成</el-tag>
        </div>
      </div>
    </div>

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
              <h4>💡 示例提示</h4>
              <div class="tips-list">
                <div class="tip-item" @click="fillExample('生成一个关于《春晓》古诗的互动课程，适合4-5岁幼儿，包含卡通风格的图片和朗诵视频')">
                  <span class="tip-icon">📖</span>
                  <span>古诗学习课程</span>
                </div>
                <div class="tip-item" @click="fillExample('创建一个数字认知的互动游戏课程，适合3-4岁幼儿，包含动画和音效')">
                  <span class="tip-icon">🔢</span>
                  <span>数字认知游戏</span>
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
              <el-input
                v-model="ageGroup"
                placeholder="例如：4-5岁"
                :disabled="isGenerating"
              />
              <div class="form-hint">💡 提示：准确的年龄段有助于生成更适合的内容</div>
            </div>

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
            <!-- 互动体验 -->
            <el-tab-pane label="🎓 互动体验" name="code">
              <div v-if="curriculum" class="code-preview">
                <CurriculumPreview
                  ref="curriculumPreviewRef"
                  :html-code="curriculum.htmlCode"
                  :css-code="curriculum.cssCode"
                  :js-code="curriculum.jsCode"
                />
              </div>
              <div v-else class="empty-state">
                <p>生成课程后显示互动体验</p>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Edit, DocumentAdd, VideoPlay, Document } from '@element-plus/icons-vue';
import { interactiveCurriculumAPI } from '@/api/modules/interactive-curriculum';
import { useRouter } from 'vue-router';
import CurriculumPreview from './components/CurriculumPreview.vue';
import ImageCarousel from './components/ImageCarousel.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import ProgressPanel from './components/ProgressPanel.vue';

const router = useRouter();

// 状态
const prompt = ref('');
const selectedDomain = ref('science');
const ageGroup = ref('4-5岁');
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

// 计算属性
const isGenerating_computed = computed(() => isGenerating.value);

// 是否显示欢迎卡片
const showWelcome = computed(() => {
  return !hasStarted.value && !isGenerating.value && !generationComplete.value && !curriculum.value;
});

/**
 * 生成课程（使用流式API）
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
        ageGroup: ageGroup.value
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
          thinkingProcess.value += content;
          console.log('🧠 [流式生成] 收到思考内容，当前总长度:', thinkingProcess.value.length);
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
        onFinished: async (curriculumId: number) => {
          console.log('🎉 [流式生成] 课程生成完成，ID:', curriculumId);
          progress.value = 100;
          currentStage.value = '生成完成';
          generationComplete.value = true;
          isGenerating.value = false;

          ElMessage.success('课程生成完成！');

          // 加载课程详情
          await loadCurriculumDetail(curriculumId);
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
 * 开始互动课程体验
 */
function startInteractiveCourse() {
  if (!curriculum.value) {
    ElMessage.warning('请先生成课程');
    return;
  }

  // 切换到互动体验标签页
  activeTab.value = 'code';

  // 等待DOM更新后进入全屏
  setTimeout(() => {
    if (curriculumPreviewRef.value) {
      curriculumPreviewRef.value.enterFullscreen();
    } else {
      ElMessage.error('无法启动互动体验，请刷新页面重试');
    }
  }, 300);
}

	/**
	 * 加载课程详情
	 * 用于流式生成完成后，根据后端返回的课程 ID 拉取完整课程数据并填充预览
	 */
	async function loadCurriculumDetail(curriculumId: number) {
	  if (!curriculumId) return;

	  try {
	    const response = await interactiveCurriculumAPI.getCurriculumDetail(curriculumId);

	    if (response && response.success && response.data) {
	      curriculum.value = response.data;
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

    // 修复：API 返回的是 { taskId, message }，不是 { success, data: { taskId, message } }
    // 因为响应拦截器已经提取了 data 部分
    if (!response || !response.taskId) {
      console.error('❌ 响应结构错误:', { response, hasTaskId: !!response?.taskId });
      throw new Error('生成失败：无法获取任务ID');
    }

    taskId.value = response.taskId;
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
          thinkingProcess.value = data.content;
          console.log('🧠 获取 Think 思考过程成功，长度:', data.content.length);
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
}

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
  background: var(--bg-secondary);
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
      flex: 0 0 420px;
      min-width: 100%; max-width: 100%; max-width: 420px;
      max-width: 420px;
      position: sticky;
      top: var(--text-2xl);
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
      flex: 1;
      min-width: 0;
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
      background: var(--bg-secondary);
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
      background: var(--bg-secondary);
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
        border-bottom: var(--z-index-dropdown) solid var(--border-color);

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

</style>

