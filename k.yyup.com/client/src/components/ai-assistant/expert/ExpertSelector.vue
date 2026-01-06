<!--
  AI专家选择组件
  替换原来的对话历史侧边栏
-->

<template>
  <div 
    class="expert-selector-sidebar" 
    :class="{ 'collapsed': collapsed }"
  >
    <!-- 折叠/展开按钮 -->
    <div class="toggle-btn" @click="$emit('toggle')">
      <el-icon>
        <DArrowLeft v-if="!collapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content" v-show="!collapsed">
      <!-- 标题区域 -->
      <div class="sidebar-header">
        <div class="header-icon">
          <UnifiedIcon name="ai-center" />
        </div>
        <div class="header-text">
          <h3>🎯 AI专家助手</h3>
          <p>选择专家获得专业建议</p>
        </div>
      </div>

      <!-- 系统内置专家 -->
      <div class="expert-section">
        <!-- 隐藏标题 -->
        <!-- <div class="section-title">
          <span>━━━ 系统内置专家 ━━━</span>
        </div> -->
        
        <div class="expert-list">
          <div
            v-for="expert in systemExperts"
            :key="expert.id"
            class="expert-card"
            :class="{ 'selected': isSelected(expert.id) }"
            :style="{ '--expert-color': expert.color }"
            @click="toggleExpert(expert.id)"
          >
            <div class="expert-checkbox">
              <UnifiedIcon name="ai-center" />
              <UnifiedIcon name="close" />
            </div>
            <div class="expert-icon">{{ expert.icon }}</div>
            <div class="expert-info">
              <div class="expert-name">{{ expert.name }}</div>
              <div class="expert-desc">{{ expert.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义专家 -->
      <div class="expert-section" v-if="customExperts.length > 0">
        <div class="section-title">
          <span>━━━ 自定义专家 ━━━</span>
        </div>
        
        <div class="expert-list">
          <div
            v-for="expert in customExperts"
            :key="expert.id"
            class="expert-card custom"
            :class="{ 'selected': isSelected(expert.id) }"
            :style="{ '--expert-color': expert.color }"
            @click="toggleExpert(expert.id)"
          >
            <div class="expert-checkbox">
              <UnifiedIcon name="ai-center" />
              <UnifiedIcon name="close" />
            </div>
            <div class="expert-icon">{{ expert.icon }}</div>
            <div class="expert-info">
              <div class="expert-name">{{ expert.name }}</div>
              <div class="expert-desc">{{ expert.description }}</div>
            </div>
            <div class="expert-actions" @click.stop>
              <el-button 
                size="small" 
                text 
                @click="editCustomExpert(expert)"
                title="编辑"
              >
                <UnifiedIcon name="Edit" />
              </el-button>
              <el-button 
                size="small" 
                text 
                type="danger"
                @click="deleteCustomExpert(expert.id)"
                title="删除"
              >
                <UnifiedIcon name="delete" />
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加自定义专家按钮 -->
      <div class="add-expert-btn">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="openCustomExpertDialog"
          class="full-width"
        >
          添加自定义专家
        </el-button>
      </div>

      <!-- 底部操作区 -->
      <div class="sidebar-footer">
        <div class="selected-count">
          已选择: {{ selectedExperts.length }} 个专家
        </div>
        <el-button 
          v-if="selectedExperts.length > 0"
          type="danger" 
          size="small"
          :icon="RefreshLeft"
          @click="clearSelection"
          class="full-width"
        >
          清除所有选择
        </el-button>
      </div>
    </div>

    <!-- 自定义专家编辑对话框 -->
    <CustomExpertDialog
      v-model:visible="customExpertDialogVisible"
      :expert="editingExpert"
      @save="handleSaveCustomExpert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  DArrowLeft,
  DArrowRight,
  Select,
  CircleClose,
  Edit,
  Delete,
  Plus,
  RefreshLeft
} from '@element-plus/icons-vue'
import { SYSTEM_EXPERTS } from '@/config/ai-experts'
import type { AIExpert, CustomExpert } from '@/config/ai-experts'
import CustomExpertDialog from './CustomExpertDialog.vue'

// ==================== Props ====================
interface Props {
  collapsed: boolean
  selectedExperts: string[]
  customExperts?: CustomExpert[]
}

const props = withDefaults(defineProps<Props>(), {
  customExperts: () => []
})

// ==================== Emits ====================
const emit = defineEmits<{
  toggle: []
  'update:selectedExperts': [expertIds: string[]]
  'add-custom-expert': [expert: Partial<CustomExpert>]
  'update-custom-expert': [expert: CustomExpert]
  'delete-custom-expert': [expertId: string]
}>()

// ==================== State ====================
const systemExperts = ref(SYSTEM_EXPERTS)
const customExpertDialogVisible = ref(false)
const editingExpert = ref<CustomExpert | null>(null)

// ==================== Computed ====================
const isSelected = (expertId: string) => {
  return props.selectedExperts.includes(expertId)
}

// ==================== Methods ====================
/**
 * 切换专家选择状态
 */
const toggleExpert = (expertId: string) => {
  const newSelection = [...props.selectedExperts]
  const index = newSelection.indexOf(expertId)
  
  if (index > -1) {
    // 取消选择
    newSelection.splice(index, 1)
  } else {
    // 添加选择
    newSelection.push(expertId)
  }
  
  emit('update:selectedExperts', newSelection)
}

/**
 * 清除所有选择
 */
const clearSelection = () => {
  ElMessageBox.confirm(
    '确定要清除所有已选择的专家吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('update:selectedExperts', [])
    ElMessage.success('已清除所有选择')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 打开自定义专家对话框
 */
const openCustomExpertDialog = () => {
  editingExpert.value = null
  customExpertDialogVisible.value = true
}

/**
 * 编辑自定义专家
 */
const editCustomExpert = (expert: CustomExpert) => {
  editingExpert.value = expert
  customExpertDialogVisible.value = true
}

/**
 * 删除自定义专家
 */
const deleteCustomExpert = (expertId: string) => {
  ElMessageBox.confirm(
    '确定要删除这个自定义专家吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete-custom-expert', expertId)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 保存自定义专家
 */
const handleSaveCustomExpert = (expert: Partial<CustomExpert>) => {
  if (editingExpert.value) {
    // 更新现有专家
    emit('update-custom-expert', { ...editingExpert.value, ...expert } as CustomExpert)
    ElMessage.success('专家信息已更新')
  } else {
    // 添加新专家
    emit('add-custom-expert', expert)
    ElMessage.success('自定义专家已添加')
  }
  customExpertDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入
.full-width {
  width: 100%;
}
</style>

