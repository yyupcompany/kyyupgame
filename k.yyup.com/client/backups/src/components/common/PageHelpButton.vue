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
  if (props.position === 'left') {
    return {
      right: '60px',
      left: 'auto'
    }
  }
  return {
    left: '60px',
    right: 'auto'
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
  top: 100px;
  right: var(--text-3xl);
  z-index: 1000;
}

.help-button {
  width: var(--icon-size); height: var(--icon-size);
  font-size: var(--text-3xl);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px var(--text-lg) var(--shadow-heavy);
  }
}

.help-popover {
  position: absolute;
  top: 0;
  width: 400px;
  max-height: 600px;
  overflow-y: auto;
  background: white;
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-medium);
  padding: 0;
  z-index: 1001;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) var(--text-2xl);
  border-bottom: var(--border-width-base) solid #ebeef5;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: white;
  border-radius: var(--text-sm) var(--text-sm) 0 0;

  .help-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-lg);
    font-weight: 600;

    .el-icon {
      font-size: var(--text-2xl);
    }
  }

  .close-btn {
    background: var(--white-alpha-20);
    border: none;
    color: white;

    &:hover {
      background: var(--white-alpha-30);
    }
  }
}

.help-body {
  padding: var(--text-2xl);
  max-height: 450px;
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
    padding-left: var(--text-2xl);

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
    padding: var(--text-sm) var(--text-sm) var(--text-sm) var(--text-2xl);
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
  padding: var(--text-sm) var(--text-2xl);
  border-top: var(--border-width-base) solid #ebeef5;
  background: var(--bg-tertiary);
  border-radius: 0 0 var(--text-sm) var(--text-sm);
}

// 动画
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateX(var(--text-2xl));
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(var(--text-2xl));
  opacity: 0;
}

// 滚动条样式
.help-body::-webkit-scrollbar {
  width: 6px;
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

