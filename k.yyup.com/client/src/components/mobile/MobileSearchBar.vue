<!--
  MobileSearchBar.vue - 移动端搜索栏组件
  Mobile Search Bar Component

  功能特性:
  - 实时搜索过滤
  - 清除按钮
  - 热门搜索标签
  - 搜索历史
  - 防抖输入处理

  设计令牌: 使用 design-tokens.scss
-->
<template>
  <div class="mobile-search-bar">
    <!-- 搜索输入框 -->
    <div class="search-input-wrapper">
      <!-- 搜索图标 -->
      <div class="search-icon">
        <UnifiedIcon
          :name="isSearching ? 'loader' : 'search'"
          :size="18"
          :class="{ 'is-spinning': isSearching }"
        />
      </div>

      <!-- 输入框 -->
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleEnter"
      />

      <!-- 清除按钮 -->
      <Transition name="fade">
        <button
          v-if="searchQuery"
          class="search-clear"
          @click="clearSearch"
        >
          <UnifiedIcon name="x" :size="16" />
        </button>
      </Transition>
    </div>

    <!-- 热门搜索标签 -->
    <Transition name="slide-down">
      <div v-if="showHotSearches && !searchQuery && hotSearches.length > 0" class="hot-searches">
        <div class="hot-searches-title">热门搜索</div>
        <div class="hot-searches-tags">
          <button
            v-for="(tag, index) in hotSearches"
            :key="index"
            class="hot-search-tag"
            @click="selectHotSearch(tag)"
          >
            <UnifiedIcon v-if="tag.icon" :name="tag.icon" :size="14" />
            <span>{{ tag.label || tag }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 搜索历史 -->
    <Transition name="slide-down">
      <div v-if="showHistory && !searchQuery && searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span class="history-title">搜索历史</span>
          <button class="history-clear" @click="clearHistory">
            <UnifiedIcon name="trash-2" :size="14" />
            清空
          </button>
        </div>
        <div class="history-list">
          <button
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="selectHistory(item)"
          >
            <UnifiedIcon name="clock" :size="14" />
            <span>{{ item }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 搜索结果提示 -->
    <Transition name="fade">
      <div v-if="searchQuery && resultCount !== undefined" class="search-results-info">
        找到 <strong>{{ resultCount }}</strong> 个结果
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { debounce } from 'lodash-es'

/**
 * 组件属性定义
 */
interface Props {
  /** 占位符文本 */
  placeholder?: string
  /** 热门搜索标签 */
  hotSearches?: Array<string | { label: string; icon?: string }>
  /** 最大历史记录数 */
  maxHistory?: number
  /** 防抖延迟（毫秒） */
  debounceDelay?: number
  /** 搜索数据源（用于自动补全） */
  searchData?: Array<{ name: string; description?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索中心...',
  hotSearches: () => [],
  maxHistory: 5,
  debounceDelay: 300,
  searchData: () => [],
})

/**
 * Emits 定义
 */
interface Emits {
  (event: 'search', query: string): void
  (event: 'clear'): void
  (event: 'focus'): void
  (event: 'blur'): void
}

const emit = defineEmits<Emits>()

/**
 * 状态管理
 */
const inputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const isSearching = ref(false)
const isFocused = ref(false)
const searchHistory = ref<string[]>([])
const resultCount = ref<number>()

// 本地存储键
const STORAGE_KEY = 'mobile-centers-search-history'

/**
 * 计算属性
 */
const showHotSearches = computed(() => isFocused.value)
const showHistory = computed(() => isFocused.value)

/**
 * 防抖搜索处理
 */
const debouncedSearch = debounce((query: string) => {
  isSearching.value = false
  emit('search', query)

  // 计算结果数量
  if (props.searchData.length > 0) {
    const results = props.searchData.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
    )
    resultCount.value = results.length
  }
}, props.debounceDelay)

/**
 * 输入处理
 */
function handleInput() {
  isSearching.value = true
  debouncedSearch(searchQuery.value)
}

/**
 * 聚焦处理
 */
function handleFocus() {
  isFocused.value = true
  loadSearchHistory()
  emit('focus')
}

/**
 * 失焦处理
 */
function handleBlur() {
  // 延迟失焦，允许点击历史记录
  setTimeout(() => {
    isFocused.value = false
    emit('blur')
  }, 200)
}

/**
 * 回车处理
 */
function handleEnter() {
  if (searchQuery.value.trim()) {
    saveToHistory(searchQuery.value)
    debouncedSearch.flush()
  }
}

/**
 * 清除搜索
 */
function clearSearch() {
  searchQuery.value = ''
  resultCount.value = undefined
  emit('clear')
  inputRef.value?.focus()
}

/**
 * 选择热门搜索
 */
function selectHotSearch(tag: string | { label: string; icon?: string }) {
  const query = typeof tag === 'string' ? tag : tag.label
  searchQuery.value = query
  saveToHistory(query)
  debouncedSearch.flush()
}

/**
 * 选择历史记录
 */
function selectHistory(item: string) {
  searchQuery.value = item
  debouncedSearch.flush()
}

/**
 * 加载搜索历史
 */
function loadSearchHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load search history:', error)
  }
}

/**
 * 保存到历史记录
 */
function saveToHistory(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return

  // 移除重复项
  searchHistory.value = searchHistory.value.filter((item) => item !== trimmed)

  // 添加到开头
  searchHistory.value.unshift(trimmed)

  // 限制数量
  if (searchHistory.value.length > props.maxHistory) {
    searchHistory.value = searchHistory.value.slice(0, props.maxHistory)
  }

  // 保存到本地存储
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.warn('Failed to save search history:', error)
  }
}

/**
 * 清空历史记录
 */
function clearHistory() {
  searchHistory.value = []
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear search history:', error)
  }
}

/**
 * 监听搜索查询变化
 */
watch(searchQuery, (newQuery) => {
  if (!newQuery) {
    resultCount.value = undefined
  }
})

/**
 * 组件挂载
 */
onMounted(() => {
  loadSearchHistory()
})

/**
 * 暴露方法
 */
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: clearSearch,
})
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;
@use '@/styles/mobile-centers-theme.scss' as *;
@use '@/styles/mobile-centers-animations.scss' as *;
@use '@/styles/mobile-centers-responsive.scss' as *;

.mobile-search-bar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

// ==================== 搜索输入框 ====================

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-duration-base) var(--transition-timing-ease);

  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.1);
  }
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  flex-shrink: 0;

  .is-spinning {
    animation: spin 1s linear infinite;
  }
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--text-primary);
  min-width: 0;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--bg-color-secondary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:hover {
    background: var(--error-color);
    color: white;
  }

  &:active {
    transform: scale(0.9);
  }
}

// ==================== 热门搜索 ====================

.hot-searches {
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.hot-searches-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.hot-searches-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.hot-search-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
}

// ==================== 搜索历史 ====================

.search-history {
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-light);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.history-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.history-clear {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:hover {
    background: var(--error-color);
    color: white;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.history-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

// ==================== 搜索结果提示 ====================

.search-results-info {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-align: center;

  strong {
    font-weight: 700;
  }
}

// ==================== 过渡动画 ====================

.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 200ms ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 300px;
  opacity: 1;
  margin-top: var(--spacing-sm);
}

// ==================== 响应式调整 ====================

// 小屏设备
@media (max-width: 479px) {
  .search-input-wrapper {
    padding: var(--spacing-xs) var(--spacing-sm);

    .search-input {
      font-size: var(--mobile-text-base);
    }
  }

  .hot-searches,
  .search-history {
    padding: var(--spacing-sm);
  }
}

// ==================== 深色主题适配 ====================

[data-theme='dark'] {
  .search-input-wrapper {
    background: var(--bg-card-dark, #1a1625);
    border-color: var(--border-color-dark, #2a2635);

    &:focus-within {
      box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.2);
    }
  }

  .search-input {
    color: var(--text-primary-dark, #f8fafc);

    &::placeholder {
      color: var(--text-tertiary-dark, #64748b);
    }
  }

  .hot-searches,
  .search-history {
    background: var(--bg-card-dark, #1a1625);
    border-color: var(--border-color-dark, #2a2635);
  }

  .hot-search-tag,
  .history-item {
    background: var(--bg-color-secondary-dark, #0f172a);
    border-color: var(--border-color-dark, #2a2635);
  }
}

// ==================== 辅助功能 ====================

// 减少动画模式
@media (prefers-reduced-motion: reduce) {
  .is-spinning {
    animation: none;
  }

  .fade-enter-active,
  .fade-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>
