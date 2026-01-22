<template>
  <div class="page-help-button-container">
    <!-- AI帮助按钮 -->
    <el-button
      type="info"
      :icon="QuestionFilled"
      circle
      @click="toggleHelp"
      class="help-button"
      title="查看页面帮助"
    >
    </el-button>

    <!-- 帮助提示框 -->
    <transition name="slide-fade">
      <div v-if="showHelp" class="help-popover" :style="popoverStyle">
        <div class="help-header">
          <div class="help-title">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ helpContent.title }}</span>
          </div>
          <el-button
            :icon="Close"
            circle
            size="small"
            @click="closeHelp"
            class="close-btn"
          />
        </div>

        <div class="help-body">
          <div class="help-description">
            {{ helpContent.description }}
          </div>

          <div class="help-features" v-if="helpContent.features && helpContent.features.length > 0">
            <h4>主要功能：</h4>
            <ul>
              <li v-for="(feature, index) in helpContent.features" :key="index">
                <el-icon><Check /></el-icon>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div class="help-steps" v-if="helpContent.steps && helpContent.steps.length > 0">
            <h4>操作步骤：</h4>
            <ol>
              <li v-for="(step, index) in helpContent.steps" :key="index">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="help-tips" v-if="helpContent.tips && helpContent.tips.length > 0">
            <h4>💡 小贴士：</h4>
            <ul class="tips-list">
              <li v-for="(tip, index) in helpContent.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </div>
        </div>

        <div class="help-footer">
          <el-button size="small" @click="closeHelp">知道了</el-button>
          <el-button size="small" type="primary" @click="contactSupport">
            <el-icon><Service /></el-icon>
            联系客服
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  QuestionFilled,
  InfoFilled,
  Close,
  Check,
  Service
} from '@element-plus/icons-vue'

interface HelpContent {
  title: string
  description: string
  features?: string[]
  steps?: string[]
  tips?: string[]
}

interface Props {
  helpContent: HelpContent
  position?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right'
})

const showHelp = ref(false)

// 计算提示框位置
const popoverStyle = computed(() => {
  // 如果按钮在右侧，提示框应该向左弹出
  if (props.position === 'right') {
    return {
      right: '50px',
      left: 'auto',
      transformOrigin: 'right top'
    }
  }
  // 如果按钮在左侧，提示框应该向右弹出
  return {
    left: '50px',
    right: 'auto',
    transformOrigin: 'left top'
  }
})

// 切换帮助显示
const toggleHelp = () => {
  showHelp.value = !showHelp.value
}

// 关闭帮助
const closeHelp = () => {
  showHelp.value = false
}

// 联系客服
const contactSupport = () => {
  ElMessage.info('客服功能开发中')
  closeHelp()
}
</script>

<style scoped lang="scss">
.page-help-button-container {
  position: fixed;
  bottom: 80px; /* ✨ 优化：改到右下角更符合习惯 */
  right: 30px;
  z-index: 2000;
}

.help-button {
  width: 48px; 
  height: 48px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all var(--transition-normal) ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
}

.help-popover {
  position: absolute;
  bottom: 60px; /* ✨ 优化：相对于按钮向上弹出 */
  width: 360px; 
  min-width: 360px; /* ✨ 修复：确保最小宽度，防止被容器压缩 */
  max-height: 80vh;
  display: flex; /* ✨ 修复：改为 flex 布局以便控制内部滚动 */
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 0;
  z-index: 2001;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5; /* ✨ 修复：巨型边框问题 */
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: var(--text-on-primary);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0; /* ✨ 修复：防止标题栏被压缩 */

  .help-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-lg);
    font-weight: 600;

    .el-icon {
      font-size: var(--spacing-xl);
    }
  }

  .close-btn {
    background: var(--white-alpha-20);
    border: none;
    color: var(--text-on-primary);

    &:hover {
      background: var(--white-alpha-30);
    }
  }
}

.help-body {
  padding: var(--spacing-xl);
  max-min-height: 60px; height: auto;
  overflow-y: auto;

  .help-description {
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--text-regular);
    margin-bottom: var(--text-lg);
  }

  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: var(--text-lg) 0 var(--spacing-sm) 0;
  }

  ul, ol {
    margin: 0;
    padding-left: var(--spacing-xl);

    li {
      font-size: var(--text-sm);
      line-height: 1.8;
      color: var(--text-regular);
      margin-bottom: var(--spacing-sm);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);

      .el-icon {
        color: var(--success-color);
        margin-top: var(--spacing-xs);
        flex-shrink: 0;
      }

      span {
        flex: 1;
      }
    }
  }

  ol li {
    display: list-item;
  }

  .tips-list {
    background: #f0f9ff;
    border-left: 3px solid var(--primary-color);
    padding: var(--text-sm) var(--text-sm) var(--text-sm) var(--spacing-xl);
    border-radius: var(--spacing-xs);

    li {
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.help-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
  padding: 12px 20px;
  border-top: 1px solid #ebeef5; /* ✨ 修复：巨型边框问题 */
  background: var(--bg-tertiary);
  border-radius: 0 0 12px 12px;
  flex-shrink: 0; /* ✨ 修复：防止页脚被压缩 */
}

// 动画
.slide-fade-enter-active {
  transition: all var(--transition-normal) ease;
}

.slide-fade-leave-active {
  transition: all var(--transition-fast) ease;
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

// 滚动条样式
.help-body::-webkit-scrollbar {
  width: auto;
}

.help-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: var(--radius-xs);
}

.help-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: var(--radius-xs);

  &:hover {
    background: #a8a8a8;
  }
}
</style>

