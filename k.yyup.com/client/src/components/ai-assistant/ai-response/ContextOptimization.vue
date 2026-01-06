<!--
  智能上下文优化显示组件
  显示记忆压缩、token优化等信息
-->

<template>
  <div class="context-optimization-container" :class="{ collapsed: collapsed }">
    <div class="optimization-header" @click="handleToggle">
      <div class="optimization-title">
        <span class="optimization-icon">🧠</span>
        <span class="optimization-text">智能上下文优化</span>
        <span v-if="isOptimizing" class="optimization-status">正在优化...</span>
        <el-tag v-if="optimizationData" :type="getOptimizationTagType()" size="small" class="optimization-tag">
          节省 {{ optimizationData.tokensSaved }} tokens
        </el-tag>
      </div>
      <span class="collapse-icon">{{ collapsed ? '▶' : '▼' }}</span>
    </div>
    
    <div class="optimization-content" v-show="!collapsed">
      <!-- 优化进度 -->
      <div v-if="isOptimizing" class="optimization-progress">
        <el-progress 
          :percentage="progressPercentage" 
          :show-text="false" 
          :stroke-width="3"
          color="var(--el-color-primary)"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>
      
      <!-- 优化结果 -->
      <div v-if="optimizationData" class="optimization-results">
        <!-- Token统计 -->
        <div class="token-stats">
          <div class="stat-item">
            <div class="stat-label">压缩前</div>
            <div class="stat-value original">{{ optimizationData.originalTokens }} tokens</div>
          </div>
          <div class="stat-arrow">→</div>
          <div class="stat-item">
            <div class="stat-label">压缩后</div>
            <div class="stat-value optimized">{{ optimizationData.optimizedTokens }} tokens</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">节省</div>
            <div class="stat-value saved">{{ optimizationData.tokensSaved }} tokens</div>
            <div class="stat-percentage">({{ optimizationData.compressionRatio }}%)</div>
          </div>
        </div>
        
        <!-- 记忆优化详情 -->
        <div v-if="optimizationData.memoryOptimization" class="memory-optimization">
          <div class="memory-title">📚 记忆优化详情</div>
          <div class="memory-stats">
            <div class="memory-item">
              <span class="memory-label">原始记忆:</span>
              <span class="memory-value">{{ optimizationData.memoryOptimization.originalCount }} 条</span>
            </div>
            <div class="memory-item">
              <span class="memory-label">过滤后:</span>
              <span class="memory-value">{{ optimizationData.memoryOptimization.filteredCount }} 条</span>
            </div>
            <div class="memory-item">
              <span class="memory-label">相关性阈值:</span>
              <span class="memory-value">{{ optimizationData.memoryOptimization.relevanceThreshold }}%</span>
            </div>
          </div>
        </div>
        
        <!-- 上下文层级 -->
        <div v-if="optimizationData.contextLayers" class="context-layers">
          <div class="layers-title">🏗️ 上下文层级</div>
          <div class="layers-list">
            <div 
              v-for="layer in optimizationData.contextLayers" 
              :key="layer.name"
              class="layer-item"
              :class="{ active: layer.included }"
            >
              <div class="layer-info">
                <span class="layer-name">{{ layer.name }}</span>
                <span class="layer-tokens">{{ layer.tokens }} tokens</span>
              </div>
              <div class="layer-status">
                <UnifiedIcon name="Check" />
                <UnifiedIcon name="close" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 优化策略 -->
        <div v-if="optimizationData.strategies" class="optimization-strategies">
          <div class="strategies-title">⚡ 应用的优化策略</div>
          <div class="strategies-list">
            <el-tag 
              v-for="strategy in optimizationData.strategies" 
              :key="strategy"
              size="small"
              type="info"
              class="strategy-tag"
            >
              {{ strategy }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <!-- 优化建议 -->
      <div v-if="optimizationData?.suggestions" class="optimization-suggestions">
        <div class="suggestions-title">💡 优化建议</div>
        <ul class="suggestions-list">
          <li v-for="suggestion in optimizationData.suggestions" :key="suggestion">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ==================== 类型定义 ====================
interface MemoryOptimization {
  originalCount: number
  filteredCount: number
  relevanceThreshold: number
}

interface ContextLayer {
  name: string
  tokens: number
  included: boolean
  description?: string
}

interface OptimizationData {
  originalTokens: number
  optimizedTokens: number
  tokensSaved: number
  compressionRatio: number
  memoryOptimization?: MemoryOptimization
  contextLayers?: ContextLayer[]
  strategies?: string[]
  suggestions?: string[]
  optimizationTime?: number
}

// ==================== Props ====================
interface Props {
  collapsed: boolean
  isOptimizing?: boolean
  progressPercentage?: number
  progressText?: string
  optimizationData?: OptimizationData | null
}

const props = withDefaults(defineProps<Props>(), {
  isOptimizing: false,
  progressPercentage: 0,
  progressText: '正在分析上下文...',
  optimizationData: null
})

// ==================== Emits ====================
interface Emits {
  'toggle': []
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const getOptimizationTagType = () => {
  if (!props.optimizationData) return 'info'
  const ratio = props.optimizationData.compressionRatio
  if (ratio >= 30) return 'success'
  if (ratio >= 15) return 'warning'
  return 'info'
}

// ==================== 事件处理 ====================
const handleToggle = () => {
  emit('toggle')
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.context-optimization-container {
  background: linear-gradient(135deg, #f8fafc 0%, var(--dark-bg-secondary) 100%);
  border: var(--border-width) solid var(--el-border-color-lighter);
  border-radius: var(--text-sm);
  margin-bottom: var(--text-lg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: all var(--transition-normal) ease;
}

.context-optimization-container:hover {
  border-color: var(--el-color-primary-light-7);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.1);
}

.optimization-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--text-sm) var(--text-lg);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  color: var(--text-on-primary);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
  user-select: none;
}

.optimization-header:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.optimization-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.optimization-icon {
  font-size: var(--text-lg);
}

.optimization-text {
  font-weight: 600;
  font-size: var(--text-base);
}

.optimization-status {
  font-size: var(--text-sm);
  opacity: 0.9;
  animation: pulse 2s infinite;
}

.optimization-tag {
  margin-left: var(--spacing-sm);
}

.collapse-icon {
  font-size: var(--text-sm);
  transition: transform 0.2s ease;
}

.optimization-content {
  padding: var(--text-lg);
}

.optimization-progress {
  margin-bottom: var(--text-lg);
}

.progress-text {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-top: var(--spacing-sm);
}

.token-stats {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--text-lg);
  background: white;
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--el-border-color-extra-light);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.stat-value.original {
  color: var(--el-color-warning);
}

.stat-value.optimized {
  color: var(--el-color-primary);
}

.stat-value.saved {
  color: var(--el-color-success);
}

.stat-percentage {
  font-size: var(--text-sm);
  color: var(--el-color-success);
}

.stat-arrow {
  font-size: var(--text-xl);
  color: var(--el-color-primary);
  font-weight: bold;
}

.memory-optimization,
.context-layers,
.optimization-strategies {
  margin-bottom: var(--text-lg);
  padding: var(--text-sm);
  background: white;
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--el-border-color-extra-light);
}

.memory-title,
.layers-title,
.strategies-title,
.suggestions-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--text-sm);
  color: var(--el-text-color-primary);
}

.memory-stats {
  display: flex;
  gap: var(--text-lg);
}

.memory-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.memory-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.memory-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--text-sm);
  border-radius: var(--radius-md);
  background: var(--el-fill-color-extra-light);
  transition: all var(--transition-fast) ease;
}

.layer-item.active {
  background: var(--el-color-primary-light-9);
  border: var(--border-width) solid var(--el-color-primary-light-7);
}

.layer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.layer-name {
  font-size: var(--text-sm);
  font-weight: 500;
}

.layer-tokens {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.strategies-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.strategy-tag {
  font-size: var(--text-sm);
}

.optimization-suggestions {
  padding: var(--text-sm);
  background: var(--el-color-info-light-9);
  border-radius: var(--spacing-sm);
  border: var(--border-width) solid var(--el-color-info-light-7);
}

.suggestions-list {
  margin: 0;
  padding-left: var(--text-lg);
}

.suggestions-list li {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-xs);
}

@keyframes pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.6; }
}
</style>
