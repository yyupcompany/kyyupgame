<template>
  <div class="layout-adjustment-tool">
    <el-card class="tool-card">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Setting /></el-icon>
            布局调整工具
          </h3>
          <p>实时调整Dashboard欢迎区域的边距和内边距</p>
        </div>
      </template>

      <div class="adjustment-controls">
        <!-- 欢迎区域整体内边距控制 -->
        <div class="control-group">
          <h4>欢迎区域内边距</h4>
          <div class="control-row">
            <label>水平内边距 (padding-x):</label>
            <el-slider
              v-model="welcomeSectionPaddingX"
              :min="0"
              :max="80"
              :step="4"
              show-input
              input-size="small"
              @change="updateStyles"
            />
            <span class="value-display">{{ welcomeSectionPaddingX }}px</span>
          </div>
          <div class="control-row">
            <label>垂直内边距 (padding-y):</label>
            <el-slider
              v-model="welcomeSectionPaddingY"
              :min="0"
              :max="60"
              :step="4"
              show-input
              input-size="small"
              @change="updateStyles"
            />
            <span class="value-display">{{ welcomeSectionPaddingY }}px</span>
          </div>
        </div>

        <!-- 内容区域左右边距控制 -->
        <div class="control-group">
          <h4>内容区域边距</h4>
          <div class="control-row">
            <label>左右边距 (margin-x):</label>
            <el-slider
              v-model="welcomeContentMarginX"
              :min="0"
              :max="80"
              :step="4"
              show-input
              input-size="small"
              @change="updateStyles"
            />
            <span class="value-display">{{ welcomeContentMarginX }}px</span>
          </div>
        </div>

        <!-- 快速预设 -->
        <div class="control-group">
          <h4>快速预设</h4>
          <div class="preset-buttons">
            <el-button-group>
              <el-button @click="applyPreset('compact')">紧凑</el-button>
              <el-button @click="applyPreset('normal')">标准</el-button>
              <el-button @click="applyPreset('comfortable')">舒适</el-button>
              <el-button @click="applyPreset('spacious')">宽敞</el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 当前CSS变量值 -->
        <div class="control-group">
          <h4>当前CSS变量</h4>
          <div class="css-variables">
            <el-input
              v-model="cssVariables.welcomeSectionPaddingX"
              label="--welcome-section-padding-x"
              readonly
              class="css-var-input"
            />
            <el-input
              v-model="cssVariables.welcomeSectionPaddingY"
              label="--welcome-section-padding-y"
              readonly
              class="css-var-input"
            />
            <el-input
              v-model="cssVariables.welcomeContentMarginX"
              label="--welcome-content-margin-x"
              readonly
              class="css-var-input"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="saveStyles">
            <el-icon><Download /></el-icon>
            保存配置
          </el-button>
          <el-button @click="resetStyles">
            <el-icon><RefreshLeft /></el-icon>
            重置默认
          </el-button>
          <el-button @click="copyToClipboard">
            <el-icon><DocumentCopy /></el-icon>
            复制CSS代码
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 实时预览区域 -->
    <el-card class="preview-card">
      <template #header>
        <h4>实时预览</h4>
      </template>
      <div class="preview-dashboard">
        <!-- 模拟Dashboard欢迎区域 -->
        <div class="mock-welcome-section" :style="previewStyles">
          <div class="mock-welcome-content">
            <h2 class="mock-title">
              <el-icon><House /></el-icon>
              综合工作台
            </h2>
            <p class="mock-description">
              这里是幼儿园管理系统的核心枢纽，您可以快速总览各业务中心数据与入口，掌握园区运营状况
            </p>
          </div>
          <div class="mock-actions">
            <el-button type="primary">刷新数据</el-button>
            <el-button>快捷操作</el-button>
          </div>
        </div>

        <!-- 模拟统计卡片 -->
        <div class="mock-stats-grid">
          <div class="mock-stat-card">在读学生: 150</div>
          <div class="mock-stat-card">教职员工: 25</div>
          <div class="mock-stat-card">班级数量: 8</div>
          <div class="mock-stat-card">活动数量: 12</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Download,
  RefreshLeft,
  DocumentCopy,
  House
} from '@element-plus/icons-vue'

// 响应式数据
const welcomeSectionPaddingX = ref(24) // 默认var(--text-3xl)
const welcomeSectionPaddingY = ref(24) // 默认var(--text-3xl)
const welcomeContentMarginX = ref(32)  // 默认var(--spacing-3xl)

// CSS变量显示
const cssVariables = reactive({
  welcomeSectionPaddingX: '',
  welcomeSectionPaddingY: '',
  welcomeContentMarginX: ''
})

// 预设配置
const presets = {
  compact: { paddingX: 16, paddingY: 16, marginX: 16 },
  normal: { paddingX: 24, paddingY: 24, marginX: 32 },
  comfortable: { paddingX: 32, paddingY: 28, marginX: 40 },
  spacious: { paddingX: 40, paddingY: 32, marginX: 48 }
}

// 计算预览样式
const previewStyles = computed(() => {
  return {
    padding: `${welcomeSectionPaddingY.value}px ${welcomeSectionPaddingX.value}px`,
    '--preview-content-margin-x': `${welcomeContentMarginX.value}px`
  }
})

// 更新样式
const updateStyles = () => {
  // 更新CSS变量
  document.documentElement.style.setProperty('--welcome-section-padding-x', `${welcomeSectionPaddingX.value}px`)
  document.documentElement.style.setProperty('--welcome-section-padding-y', `${welcomeSectionPaddingY.value}px`)
  document.documentElement.style.setProperty('--welcome-content-margin-x', `${welcomeContentMarginX.value}px`)

  // 更新显示值
  cssVariables.welcomeSectionPaddingX = `--welcome-section-padding-x: ${welcomeSectionPaddingX.value}px;`
  cssVariables.welcomeSectionPaddingY = `--welcome-section-padding-y: ${welcomeSectionPaddingY.value}px;`
  cssVariables.welcomeContentMarginX = `--welcome-content-margin-x: ${welcomeContentMarginX.value}px;`
}

// 应用预设
const applyPreset = (presetName: keyof typeof presets) => {
  const preset = presets[presetName]
  welcomeSectionPaddingX.value = preset.paddingX
  welcomeSectionPaddingY.value = preset.paddingY
  welcomeContentMarginX.value = preset.marginX
  updateStyles()
  ElMessage.success(`已应用"${presetName}"预设`)
}

// 保存样式
const saveStyles = () => {
  const cssCode = `/* Dashboard 布局配置 */
:root {
  --welcome-section-padding-x: ${welcomeSectionPaddingX.value}px;
  --welcome-section-padding-y: ${welcomeSectionPaddingY.value}px;
  --welcome-content-margin-x: ${welcomeContentMarginX.value}px;
}`

  // 创建下载
  const blob = new Blob([cssCode], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dashboard-layout.css'
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('配置已保存并下载')
}

// 重置样式
const resetStyles = () => {
  welcomeSectionPaddingX.value = 24
  welcomeSectionPaddingY.value = 24
  welcomeContentMarginX.value = 32
  updateStyles()
  ElMessage.success('已重置为默认值')
}

// 复制CSS代码到剪贴板
const copyToClipboard = async () => {
  const cssCode = `:root {
  --welcome-section-padding-x: ${welcomeSectionPaddingX.value}px;
  --welcome-section-padding-y: ${welcomeSectionPaddingY.value}px;
  --welcome-content-margin-x: ${welcomeContentMarginX.value}px;
}`

  try {
    await navigator.clipboard.writeText(cssCode)
    ElMessage.success('CSS代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 组件挂载时初始化
onMounted(() => {
  updateStyles()
})
</script>

<style scoped lang="scss">
.layout-adjustment-tool {
  padding: var(--text-3xl);
  max-width: 1200px;
  margin: 0 auto;

  .tool-card,
  .preview-card {
    margin-bottom: var(--text-3xl);

    .card-header {
      h3 {
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: var(--text-base);
      }
    }
  }

  .adjustment-controls {
    .control-group {
      margin-bottom: var(--spacing-3xl);

      h4 {
        margin: 0 0 var(--text-lg) 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--el-text-color-primary);
        border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
        padding-bottom: var(--spacing-sm);
      }

      .control-row {
        display: flex;
        align-items: center;
        gap: var(--text-lg);
        margin-bottom: var(--text-lg);

        label {
          min-width: 180px;
          font-size: var(--text-base);
          color: var(--el-text-color-regular);
        }

        .el-slider {
          flex: 1;
        }

        .value-display {
          min-width: 60px;
          text-align: right;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .preset-buttons {
        margin-top: var(--text-lg);
      }

      .css-variables {
        .css-var-input {
          margin-bottom: var(--text-sm);

          :deep(.el-input__inner) {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: var(--text-sm);
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: var(--text-sm);
        margin-top: var(--text-3xl);
        padding-top: var(--text-lg);
        border-top: var(--border-width-base) solid var(--el-border-color-lighter);
      }
    }
  }

  .preview-dashboard {
    background: var(--el-bg-color-page);
    border-radius: var(--spacing-sm);
    padding: var(--text-2xl);

    .mock-welcome-section {
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
      color: white;
      border-radius: var(--text-sm);
      margin-bottom: var(--text-3xl);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;

      .mock-welcome-content {
        flex: 1;

        .mock-title {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-3xl);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .mock-description {
          margin: 0;
          opacity: 0.9;
          font-size: var(--text-base);
          line-height: 1.5;
        }
      }

      .mock-actions {
        display: flex;
        gap: var(--text-sm);
        flex-shrink: 0;
      }
    }

    .mock-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-lg);

      .mock-stat-card {
        background: var(--el-bg-color);
        border: var(--border-width-base) solid var(--el-border-color-lighter);
        border-radius: var(--spacing-sm);
        padding: var(--text-2xl);
        text-align: center;
        font-weight: 600;
        color: var(--el-text-color-primary);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .layout-adjustment-tool {
    padding: var(--text-lg);

    .control-row {
      flex-direction: column;
      align-items: stretch;
      gap: var(--text-sm);

      label {
        min-width: auto;
      }
    }

    .action-buttons {
      flex-direction: column;
    }

    .preview-dashboard {
      .mock-welcome-section {
        flex-direction: column;
        text-align: center;
        gap: var(--text-lg);

        .mock-actions {
          justify-content: center;
        }
      }

      .mock-stats-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>