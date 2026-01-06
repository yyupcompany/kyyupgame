<template>
  <div class="poster-mode-selection">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>海报制作方式</h2>
      <p>请选择您希望使用的海报制作方式</p>
    </div>

    <!-- 选项卡片 -->
    <div class="mode-cards">
      <!-- 手动上传海报 -->
      <div
        class="mode-card upload-mode"
        @click="selectMode('upload')"
        :class="{ 'selected': selectedMode === 'upload' }"
      >
        <div class="card-icon">
          <UnifiedIcon name="Upload" />
        </div>
        <h3>手动上传海报</h3>
        <p>上传您已有的海报图片进行编辑和调整</p>
        <ul class="features">
          <li>支持 JPG、PNG、GIF 格式</li>
          <li>可进行基础编辑和调整</li>
          <li>快速便捷，即传即用</li>
        </ul>
        <el-button type="primary" size="large" :icon="UploadFilled">
          选择文件上传
        </el-button>
      </div>

      <!-- 使用AI制作海报 -->
      <div
        class="mode-card ai-mode"
        @click="selectMode('ai')"
        :class="{ 'selected': selectedMode === 'ai' }"
      >
        <div class="card-icon">
          <UnifiedIcon name="default" />
        </div>
        <h3>使用AI制作海报</h3>
        <p>通过AI智能生成符合需求的专业海报</p>
        <ul class="features">
          <li>输入描述即可生成海报</li>
          <li>多种风格模板可选</li>
          <li>智能设计，专业美观</li>
        </ul>
        <el-button type="success" size="large" :icon="MagicStick">
          开始AI创作
        </el-button>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="page-footer">
      <el-button size="large" @click="goBack">
        <UnifiedIcon name="ArrowLeft" />
        返回
      </el-button>

      <el-button
        v-if="selectedMode"
        type="primary"
        size="large"
        @click="confirmSelection"
      >
        确认选择
        <UnifiedIcon name="ArrowRight" />
      </el-button>
    </div>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="posterModeHelp" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  MagicStick,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'

const router = useRouter()
const selectedMode = ref<'upload' | 'ai' | null>(null)

// AI帮助内容
const posterModeHelp = {
  title: '海报制作方式选择',
  description: '提供两种海报制作方式：手动上传已有海报，或使用AI智能生成专业海报。两种方式都支持后续编辑和调整。',
  features: [
    '手动上传：支持JPG、PNG、GIF格式，快速便捷',
    'AI生成：输入描述即可生成，自动包含幼儿园信息',
    '两种方式都支持编辑和调整',
    '生成的海报可直接用于报名页面'
  ],
  steps: [
    '选择制作方式（上传或AI生成）',
    '点击确认进入对应的编辑页面',
    '完成海报制作后保存',
    '海报会自动关联到活动'
  ],
  tips: [
    '如果有现成海报，选择"上传"更快',
    'AI生成会自动添加幼儿园名称和联系方式',
    '两种方式制作的海报都可以重新编辑'
  ]
}

// 选择制作模式
const selectMode = (mode: 'upload' | 'ai') => {
  selectedMode.value = mode
}

// 确认选择并跳转到对应页面
const confirmSelection = () => {
  if (!selectedMode.value) {
    ElMessage.warning('请先选择制作方式')
    return
  }

  if (selectedMode.value === 'upload') {
    // 跳转到海报上传页面
    router.push('/principal/poster-upload')
  } else if (selectedMode.value === 'ai') {
    // 跳转到AI海报编辑器
    router.push('/principal/poster-editor')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.poster-mode-selection {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  padding: var(--spacing-10xl) var(--text-2xl);
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: var(--spacing-10xl);
}

.page-header h2 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-2xl);
  font-weight: 600;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-8xl);
  max-width: 100%; max-width: 800px;
  margin: 0 auto 40px;
  flex: 1;
}

.mode-card {
  background: white;
  border-radius: var(--text-2xl);
  padding: var(--spacing-10xl) 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px var(--shadow-light);
  border: 3px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px var(--shadow-medium);
}

.mode-card.selected {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.mode-card.upload-mode.selected {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.mode-card.ai-mode.selected {
  border-color: var(--success-color);
  background: #f0f9ff;
}

.card-icon {
  margin-bottom: var(--text-2xl);
  display: flex;
  justify-content: center;
}

.mode-card h3 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-4xl);
  color: #2c3e50;
  font-weight: 600;
}

.mode-card p {
  color: #7f8c8d;
  margin-bottom: var(--text-2xl);
  line-height: 1.6;
}

.features {
  list-style: none;
  padding: 0;
  margin: var(--text-2xl) 0;
  text-align: left;
}

.features li {
  padding: var(--spacing-sm) 0;
  color: #555;
  position: relative;
  padding-left: var(--text-2xl);
}

.features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #27ae60;
  font-weight: bold;
}

.page-footer {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);
  padding-top: var(--text-2xl);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .poster-mode-selection {
    padding: var(--text-2xl) 15px;
  }

  .page-header h2 {
    font-size: 2rem;
  }

  .mode-cards {
    grid-template-columns: 1fr;
    gap: var(--text-2xl);
    margin: 0 auto 30px;
  }

  .mode-card {
    padding: var(--spacing-8xl) var(--text-2xl);
  }

  .page-footer {
    flex-direction: column;
    align-items: center;
  }

  .page-footer .el-button {
    width: 100%;
    max-width: 100%; max-width: 300px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(var(--text-2xl));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mode-card {
  animation: fadeIn 0.6s ease-out;
}

.mode-card:nth-child(2) {
  animation-delay: 0.2s;
}

.mode-card:nth-child(3) {
  animation-delay: 0.4s;
}
</style>