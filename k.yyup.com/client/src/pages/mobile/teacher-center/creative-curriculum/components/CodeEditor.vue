<template>
  <div class="mobile-code-editor" :class="{ 'fullscreen': isFullscreen }">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <div class="tab-switcher">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab-item', { active: activeTab === tab.name }]"
          @click="switchTab(tab.name)"
        >
          <el-icon class="tab-icon">
            <Document v-if="tab.name === 'html'" />
            <Brush v-else-if="tab.name === 'css'" />
            <Promotion v-else-if="tab.name === 'js'" />
            <View v-else />
          </el-icon>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.unsaved" class="unsaved-indicator">●</span>
        </div>
      </div>

      <div class="editor-controls">
        <el-button
          size="small"
          text
          @click="formatCode"
          :disabled="!canFormat"
          title="格式化代码"
        >
          <el-icon><MagicStick /></el-icon>
        </el-button>

        <el-button
          size="small"
          text
          @click="toggleFullscreen"
          :title="isFullscreen ? '退出全屏' : '全屏编辑'"
        >
          <el-icon>
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
        </el-button>

        <el-button
          size="small"
          text
          @click="showSettings = true"
          title="编辑器设置"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 编辑器内容区域 -->
    <div class="editor-content" ref="editorContentRef">
      <!-- 代码编辑区 -->
      <div class="code-area" v-show="activeTab !== 'preview'">
        <div class="line-numbers" v-if="config.showLineNumbers">
          <div
            v-for="line in currentLineCount"
            :key="line"
            :class="['line-number', { 'current-line': currentLineNumber === line }]"
          >
            {{ line }}
          </div>
        </div>

        <div class="code-input-container">
          <textarea
            ref="codeTextareaRef"
            v-model="currentCode"
            :placeholder="getCurrentPlaceholder()"
            :style="textareaStyle"
            @input="handleInput"
            @keydown="handleKeydown"
            @scroll="handleScroll"
            @focus="handleFocus"
            @blur="handleBlur"
            spellcheck="false"
            class="code-textarea"
          />

          <!-- 语法高亮预览 -->
          <div class="syntax-highlight" v-html="highlightedCode" v-if="config.syntaxHighlighting"></div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-area" v-show="activeTab === 'preview'">
        <div class="preview-toolbar">
          <div class="device-selector">
            <el-select
              v-model="previewDevice"
              size="small"
              @change="handleDeviceChange"
            >
              <el-option label="手机" value="mobile" />
              <el-option label="平板" value="tablet" />
              <el-option label="桌面" value="desktop" />
            </el-select>
          </div>

          <div class="preview-actions">
            <el-button size="small" @click="refreshPreview">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button size="small" @click="openInNewTab">
              <el-icon><Link /></el-icon>
              新窗口
            </el-button>
          </div>
        </div>

        <div class="preview-container" :class="`preview-${previewDevice}`">
          <iframe
            ref="previewFrameRef"
            :src="previewUrl"
            class="preview-frame"
            @load="onPreviewLoad"
          ></iframe>

          <!-- 加载指示器 -->
          <div v-if="isPreviewLoading" class="preview-loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑器底部状态栏 -->
    <div class="editor-status">
      <div class="status-left">
        <span class="cursor-position">
          {{ currentLineNumber }},{{ currentColumnNumber }}
        </span>
        <span class="code-length">{{ currentCode.length }} 字符</span>
        <span class="line-count">{{ currentLineCount }} 行</span>
      </div>

      <div class="status-right">
        <span class="encoding">UTF-8</span>
        <span class="language">{{ getCurrentLanguage() }}</span>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <el-drawer
      v-model="showSettings"
      title="编辑器设置"
      direction="btt"
      size="80%"
      class="settings-drawer"
    >
      <div class="settings-content">
        <div class="setting-group">
          <h4>主题设置</h4>
          <el-radio-group v-model="config.theme" @change="updateConfig">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色</el-radio>
            <el-radio label="auto">跟随系统</el-radio>
          </el-radio-group>
        </div>

        <div class="setting-group">
          <h4>字体设置</h4>
          <el-slider
            v-model="config.fontSize"
            :min="10"
            :max="24"
            :step="1"
            @change="updateConfig"
            show-input
          />
          <el-select
            v-model="config.fontFamily"
            @change="updateConfig"
            class="font-family-select"
          >
            <el-option label="Consolas" value="'Consolas', monospace" />
            <el-option label="Monaco" value="'Monaco', monospace" />
            <el-option label="Fira Code" value="'Fira Code', monospace" />
            <el-option label="Source Code Pro" value="'Source Code Pro', monospace" />
          </el-select>
        </div>

        <div class="setting-group">
          <h4>编辑选项</h4>
          <el-switch
            v-model="config.showLineNumbers"
            label="显示行号"
            @change="updateConfig"
          />
          <el-switch
            v-model="config.wordWrap"
            label="自动换行"
            @change="updateConfig"
          />
          <el-switch
            v-model="config.syntaxHighlighting"
            label="语法高亮"
            @change="updateConfig"
          />
          <el-switch
            v-model="config.autoComplete"
            label="自动完成"
            @change="updateConfig"
          />
        </div>

        <div class="setting-group">
          <h4>移动端优化</h4>
          <el-switch
            v-model="config.touchOptimized"
            label="触摸优化"
            @change="updateConfig"
          />
          <el-slider
            v-model="config.tabSize"
            :min="2"
            :max="8"
            :step="1"
            @change="updateConfig"
            show-input
          />
        </div>
      </div>
    </el-drawer>

    <!-- 自动完成弹窗 -->
    <div
      v-if="showAutoComplete && autoCompleteSuggestions.length > 0"
      class="autocomplete-popup"
      :style="autocompleteStyle"
    >
      <div
        v-for="(suggestion, index) in autoCompleteSuggestions"
        :key="suggestion.text"
        :class="['autocomplete-item', { selected: index === selectedSuggestionIndex }]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="selectedSuggestionIndex = index"
      >
        <span class="suggestion-text">{{ suggestion.text }}</span>
        <span class="suggestion-type">{{ suggestion.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document, Brush, Promotion, View, MagicStick, FullScreen,
  Aim, Setting, Refresh, Link, Loading
} from '@element-plus/icons-vue';
import type { MobileCodeEditorConfig, EditorState } from './types/curriculum';

interface Tab {
  name: 'html' | 'css' | 'js' | 'preview';
  label: string;
  unsaved?: boolean;
}

interface AutoCompleteSuggestion {
  text: string;
  type: string;
  insertText: string;
}

const props = defineProps<{
  modelValue: EditorState;
  config?: Partial<MobileCodeEditorConfig>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: EditorState];
  'change': [tab: string, code: string];
  'save': [];
  'preview': [];
}>();

// 响应式数据
const editorContentRef = ref<HTMLElement>();
const codeTextareaRef = ref<HTMLTextAreaElement>();
const previewFrameRef = ref<HTMLIFrameElement>();

const activeTab = ref<'html' | 'css' | 'js' | 'preview'>('html');
const isFullscreen = ref(false);
const showSettings = ref(false);
const isPreviewLoading = ref(false);
const previewDevice = ref<'mobile' | 'tablet' | 'desktop'>('mobile');

const currentLineNumber = ref(1);
const currentColumnNumber = ref(1);
const selectedSuggestionIndex = ref(0);
const showAutoComplete = ref(false);
const autoCompleteSuggestions = ref<AutoCompleteSuggestion[]>([]);

// 默认配置
const defaultConfig: MobileCodeEditorConfig = {
  theme: 'light',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,
  autoComplete: true,
  touchOptimized: true,
  syntaxHighlighting: true,
  fontFamily: "'Consolas', monospace"
};

const config = ref<MobileCodeEditorConfig>({ ...defaultConfig, ...props.config });

// 标签页配置
const tabs = ref<Tab[]>([
  { name: 'html', label: 'HTML' },
  { name: 'css', label: 'CSS' },
  { name: 'js', label: 'JavaScript' },
  { name: 'preview', label: '预览' }
]);

// 计算属性
const currentCode = computed({
  get: () => props.modelValue[activeTab.value === 'preview' ? 'html' : activeTab.value],
  set: (value: string) => {
    const newState = { ...props.modelValue };
    newState[activeTab.value === 'preview' ? 'html' : activeTab.value] = value;
    emit('update:modelValue', newState);
    emit('change', activeTab.value, value);
  }
});

const currentLineCount = computed(() => {
  return currentCode.value.split('\n').length;
});

const canFormat = computed(() => {
  return activeTab.value !== 'preview' && currentCode.value.trim().length > 0;
});

const textareaStyle = computed(() => ({
  fontSize: `${config.value.fontSize}px`,
  fontFamily: config.value.fontFamily,
  tabSize: config.value.tabSize,
  whiteSpace: config.value.wordWrap ? 'pre-wrap' : 'pre',
  overflowWrap: config.value.wordWrap ? 'break-word' : 'normal'
}));

const highlightedCode = computed(() => {
  if (!config.value.syntaxHighlighting) return '';
  return highlightSyntax(currentCode.value, activeTab.value);
});

const autocompleteStyle = computed(() => {
  if (!codeTextareaRef.value) return {};

  const rect = codeTextareaRef.value.getBoundingClientRect();
  const lineHeight = config.value.fontSize * 1.5;
  const top = rect.top + (currentLineNumber.value - 1) * lineHeight;

  return {
    top: `${top}px`,
    left: `${rect.left + currentColumnNumber.value * 8}px`
  };
});

const previewUrl = computed(() => {
  const { htmlCode, cssCode, jsCode } = props.modelValue;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${cssCode}</style>
    </head>
    <body>
      ${htmlCode}
      <script>${jsCode}</script>
    </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
});

// 方法
function switchTab(tabName: string) {
  if (tabName === 'preview') {
    emit('preview');
  }
  activeTab.value = tabName as any;
}

function getCurrentPlaceholder(): string {
  switch (activeTab.value) {
    case 'html':
      return '输入 HTML 代码...';
    case 'css':
      return '输入 CSS 样式...';
    case 'js':
      return '输入 JavaScript 代码...';
    default:
      return '';
  }
}

function getCurrentLanguage(): string {
  switch (activeTab.value) {
    case 'html':
      return 'HTML';
    case 'css':
      return 'CSS';
    case 'js':
      return 'JavaScript';
    default:
      return '';
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  updateCursorPosition(target);

  if (config.value.autoComplete) {
    checkAutoComplete(target);
  }
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement;

  // Tab键处理
  if (event.key === 'Tab') {
    event.preventDefault();
    insertTab(target);
  }

  // 自动完成快捷键
  if (config.value.autoComplete && (event.ctrlKey || event.metaKey) && event.key === ' ') {
    event.preventDefault();
    showAutoCompleteSuggestions(target);
  }

  // 保存快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    emit('save');
  }

  updateCursorPosition(target);
}

function handleScroll(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  // 同步行号滚动
  const lineNumbers = target.previousElementSibling as HTMLElement;
  if (lineNumbers) {
    lineNumbers.scrollTop = target.scrollTop;
  }
}

function handleFocus() {
  // 移动端键盘弹起时的处理
  if (config.value.touchOptimized && isMobileDevice()) {
    setTimeout(() => {
      editorContentRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
}

function handleBlur() {
  hideAutoComplete();
}

function updateCursorPosition(textarea: HTMLTextAreaElement) {
  const text = textarea.value.substring(0, textarea.selectionStart);
  const lines = text.split('\n');
  currentLineNumber.value = lines.length;
  currentColumnNumber.value = lines[lines.length - 1].length + 1;
}

function insertTab(textarea: HTMLTextAreaElement) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const tabSpaces = ' '.repeat(config.value.tabSize);

  const newValue = textarea.value.substring(0, start) + tabSpaces + textarea.value.substring(end);

  currentCode.value = newValue;

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
    textarea.focus();
  });
}

function formatCode() {
  try {
    let formatted = currentCode.value;

    switch (activeTab.value) {
      case 'html':
        formatted = formatHTML(currentCode.value);
        break;
      case 'css':
        formatted = formatCSS(currentCode.value);
        break;
      case 'js':
        formatted = formatJavaScript(currentCode.value);
        break;
    }

    currentCode.value = formatted;
    ElMessage.success('代码格式化成功');
  } catch (error) {
    ElMessage.error('代码格式化失败');
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;

  nextTick(() => {
    if (isFullscreen.value) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  });
}

function handleDeviceChange() {
  refreshPreview();
}

function refreshPreview() {
  isPreviewLoading.value = true;
  if (previewFrameRef.value) {
    previewFrameRef.value.src = previewUrl.value;
  }
}

function openInNewTab() {
  window.open(previewUrl.value, '_blank');
}

function onPreviewLoad() {
  isPreviewLoading.value = false;
}

function updateConfig() {
  emit('update:modelValue', { ...props.modelValue });
}

function checkAutoComplete(textarea: HTMLTextAreaElement) {
  const text = textarea.value.substring(0, textarea.selectionStart);
  const lastWord = text.match(/[\w$]+$/);

  if (lastWord && lastWord[0].length >= 2) {
    showAutoCompleteSuggestions(textarea, lastWord[0]);
  } else {
    hideAutoComplete();
  }
}

function showAutoCompleteSuggestions(textarea: HTMLTextAreaElement, prefix?: string) {
  const suggestions = getAutoCompleteSuggestions(activeTab.value, prefix);

  if (suggestions.length > 0) {
    autoCompleteSuggestions.value = suggestions;
    selectedSuggestionIndex.value = 0;
    showAutoComplete.value = true;
  } else {
    hideAutoComplete();
  }
}

function hideAutoComplete() {
  showAutoComplete.value = false;
  autoCompleteSuggestions.value = [];
}

function selectSuggestion(suggestion: AutoCompleteSuggestion) {
  const textarea = codeTextareaRef.value;
  if (!textarea) return;

  const text = textarea.value;
  const selectionStart = textarea.selectionStart;
  const beforeCursor = text.substring(0, selectionStart);
  const afterCursor = text.substring(textarea.selectionEnd);

  // 找到要替换的单词
  const wordMatch = beforeCursor.match(/[\w$]+$/);
  if (wordMatch) {
    const newText = beforeCursor.substring(0, wordMatch.index) +
                   suggestion.insertText +
                   afterCursor;

    currentCode.value = newText;

    nextTick(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        wordMatch.index + suggestion.insertText.length;
    });
  }

  hideAutoComplete();
}

// 简化的语法高亮函数
function highlightSyntax(code: string, language: string): string {
  // 这里实现简化的语法高亮逻辑
  // 实际项目中建议使用专业的语法高亮库如 Prism.js
  return code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(".*?")/g, '<span class="string">$1</span>')
    .replace(/(\b\d+\b)/g, '<span class="number">$1</span>');
}

// 格式化函数（简化版）
function formatHTML(code: string): string {
  // 简化的HTML格式化逻辑
  return code.replace(/></g, '>\n<');
}

function formatCSS(code: string): string {
  // 简化的CSS格式化逻辑
  return code.replace(/;/g, ';\n').replace(/{/g, ' {\n  ').replace(/}/g, '\n}');
}

function formatJavaScript(code: string): string {
  // 简化的JS格式化逻辑
  return code.replace(/{/g, '{\n  ').replace(/}/g, '\n}').replace(/;/g, ';\n');
}

// 自动完成建议
function getAutoCompleteSuggestions(language: string, prefix?: string): AutoCompleteSuggestion[] {
  const suggestions: AutoCompleteSuggestion[] = [];

  if (language === 'html') {
    const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'a', 'img', 'button'];
    suggestions.push(...htmlTags.map(tag => ({
      text: `<${tag}>`,
      type: 'tag',
      insertText: `<${tag}></${tag}>`
    })));
  } else if (language === 'css') {
    const cssProperties = ['color', 'background', 'font-size', 'margin', 'padding', 'display'];
    suggestions.push(...cssProperties.map(prop => ({
      text: prop,
      type: 'property',
      insertText: `${prop}: `
    })));
  } else if (language === 'js') {
    const jsKeywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while'];
    suggestions.push(...jsKeywords.map(keyword => ({
      text: keyword,
      type: 'keyword',
      insertText: keyword + ' '
    })));
  }

  if (prefix) {
    return suggestions.filter(s =>
      s.text.toLowerCase().startsWith(prefix.toLowerCase())
    );
  }

  return suggestions;
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 生命周期
onMounted(() => {
  // 初始化编辑器
  updateCursorPosition(codeTextareaRef.value!);
});
</script>

<style scoped lang="scss">
.mobile-code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-lg);
  overflow: hidden;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    border-radius: 0;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-overlay);
    border-bottom: 1px solid var(--border-color-light);
    flex-shrink: 0;

    .tab-switcher {
      display: flex;
      gap: var(--spacing-xs);

      .tab-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: var(--font-size-sm);
        color: var(--text-regular);
        position: relative;

        &:hover {
          background: var(--bg-color);
          color: var(--text-primary);
        }

        &.active {
          background: var(--primary-color);
          color: white;
        }

        .tab-icon {
          font-size: var(--font-size-base);
        }

        .unsaved-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: var(--warning-color);
        }
      }
    }

    .editor-controls {
      display: flex;
      gap: var(--spacing-xs);

      .el-button {
        padding: var(--spacing-xs);
        min-height: auto;
      }
    }
  }

  .editor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .code-area {
      display: flex;
      flex: 1;
      position: relative;

      .line-numbers {
        width: 50px;
        padding: var(--spacing-sm) var(--spacing-xs);
        background: var(--bg-page);
        border-right: 1px solid var(--border-color-light);
        text-align: right;
        user-select: none;
        overflow: hidden;
        font-family: monospace;
        font-size: var(--font-size-sm);

        .line-number {
          line-height: 1.5;
          color: var(--text-placeholder);
          cursor: pointer;

          &.current-line {
            background: var(--primary-color-light-9);
            color: var(--primary-color);
            font-weight: 500;
          }
        }
      }

      .code-input-container {
        flex: 1;
        position: relative;

        .code-textarea {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          resize: none;
          padding: var(--spacing-sm);
          background: transparent;
          color: var(--text-primary);
          font-family: inherit;
          font-size: inherit;
          line-height: 1.5;
          position: relative;
          z-index: 2;
        }

        .syntax-highlight {
          position: absolute;
          top: var(--spacing-sm);
          left: var(--spacing-sm);
          right: var(--spacing-sm);
          bottom: var(--spacing-sm);
          pointer-events: none;
          z-index: 1;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: inherit;
          font-size: inherit;
          line-height: 1.5;

          :deep(.string) {
            color: var(--success-color);
          }

          :deep(.number) {
            color: var(--warning-color);
          }
        }
      }
    }

    .preview-area {
      flex: 1;
      display: flex;
      flex-direction: column;

      .preview-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-overlay);
        border-bottom: 1px solid var(--border-color-light);

        .device-selector {
          .el-select {
            width: 100px;
          }
        }

        .preview-actions {
          display: flex;
          gap: var(--spacing-xs);
        }
      }

      .preview-container {
        flex: 1;
        position: relative;
        background: white;

        &.preview-mobile {
          .preview-frame {
            width: 375px;
            height: 667px;
            margin: var(--spacing-lg) auto;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
          }
        }

        &.preview-tablet {
          .preview-frame {
            width: 768px;
            height: 1024px;
            margin: var(--spacing-lg) auto;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
          }
        }

        &.preview-desktop {
          .preview-frame {
            width: 100%;
            height: 100%;
            border: none;
          }
        }

        .preview-frame {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }

        .preview-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-regular);

          .loading-icon {
            font-size: var(--font-size-2xl);
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }

  .editor-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--bg-page);
    border-top: 1px solid var(--border-color-light);
    font-size: var(--font-size-xs);
    color: var(--text-placeholder);
    flex-shrink: 0;

    .status-left,
    .status-right {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .autocomplete-popup {
    position: fixed;
    background: white;
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-md);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;

    .autocomplete-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);

      &:hover,
      &.selected {
        background: var(--primary-color-light-9);
        color: var(--primary-color);
      }

      .suggestion-type {
        font-size: var(--font-size-xs);
        color: var(--text-placeholder);
        background: var(--bg-page);
        padding: 2px 6px;
        border-radius: var(--border-radius-xs);
      }
    }
  }
}

// 设置抽屉
.settings-drawer {
  :deep(.el-drawer__body) {
    padding: var(--spacing-md);
  }

  .settings-content {
    .setting-group {
      margin-bottom: var(--spacing-lg);

      h4 {
        margin-bottom: var(--spacing-md);
        color: var(--text-primary);
        font-size: var(--font-size-base);
      }

      .el-radio-group {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
      }

      .font-family-select {
        width: 100%;
        margin-top: var(--spacing-sm);
      }

      .el-switch {
        display: block;
        margin-bottom: var(--spacing-sm);
      }

      .el-slider {
        margin-bottom: var(--spacing-md);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .mobile-code-editor {
    .editor-header {
      padding: var(--spacing-xs) var(--spacing-sm);

      .tab-switcher {
        .tab-item {
          padding: var(--spacing-xs) var(--spacing-xs);
          font-size: var(--font-size-xs);

          .tab-icon {
            font-size: var(--font-size-sm);
          }

          .tab-label {
            display: none;
          }
        }
      }

      .editor-controls {
        .el-button {
          padding: var(--spacing-xs);
          min-height: auto;
        }
      }
    }

    .editor-content {
      .code-area {
        .line-numbers {
          width: 40px;
          font-size: var(--font-size-xs);
        }

        .code-input-container {
          .code-textarea {
            padding: var(--spacing-xs);
            font-size: var(--font-size-sm);
          }
        }
      }
    }

    .editor-status {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: 10px;

      .status-left,
      .status-right {
        gap: var(--spacing-xs);
      }
    }
  }
}

// 动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>