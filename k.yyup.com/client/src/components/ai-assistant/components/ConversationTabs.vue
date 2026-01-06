<!--
  AI助手会话标签页组件
  显示所有会话，支持创建、切换、删除操作
-->

<template>
  <div class="conversation-tabs" @contextmenu.prevent="handleTabsContextMenu">
    <!-- 标签页头部 -->
    <div class="tabs-header">
      <!-- 会话标签页 -->
      <div class="tabs-scroll">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-tab"
          :class="{ 'active': conversation.id === currentConversationId, 'editing': editingTabId === conversation.id }"
          @click="handleSwitchConversation(conversation.id)"
          @dblclick="startEditTab(conversation)"
          @contextmenu.prevent="handleTabContextMenu(conversation.id, $event)"
        >
          <input
            v-if="editingTabId === conversation.id"
            ref="editInput"
            v-model="editingTitle"
            class="tab-title-input"
            @blur="finishEditTab(conversation)"
            @keydown.enter="finishEditTab(conversation)"
            @keydown.escape="cancelEditTab"
            @click.stop
          />
          <span v-else class="tab-title" :title="conversation.title">
            {{ conversation.title }}
          </span>
          <span class="tab-close" @click.stop="handleDeleteConversation(conversation.id)">
            <el-icon><Close /></el-icon>
          </span>
        </div>
      </div>

      <!-- 新建会话按钮 -->
      <div class="new-conversation-btn" @click="handleCreateConversation">
        <el-icon><Plus /></el-icon>
        <span>新建会话</span>
      </div>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      trigger="contextMenu"
      :show-timeout="0"
      :hide-timeout="0"
    >
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleDeleteCurrentConversation">
            <el-icon style="margin-right: 8px;"><Delete /></el-icon>
            删除此会话
          </el-dropdown-item>
          <el-dropdown-item @click="handleDeleteAllConversations" :divided="true">
            <el-icon style="margin-right: 8px;"><Delete /></el-icon>
            删除所有会话
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 当前会话信息：更紧凑，不重复“会话: 新会话”文案 -->
    <div v-if="currentConversation" class="conversation-info">
      <div class="info-main">
        <span class="info-title" :title="currentConversation.title">
          {{ currentConversation.title }}
        </span>
        <el-button
          type="text"
          size="small"
          @click="showEditTitleDialog = true"
          class="edit-title-btn"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="info-meta">
        <span>消息 {{ currentConversation.messages.length }}/20</span>
        <span class="info-dot" />
        <span>创建 {{ formatDate(currentConversation.createdAt) }}</span>
      </div>
    </div>

    <!-- 编辑标题对话框 -->
    <el-dialog
      v-model="showEditTitleDialog"
      title="编辑会话标题"
      width="400px"
      :append-to-body="false"
    >
      <el-input
        v-model="editingTitle"
        placeholder="请输入会话标题"
        maxlength="50"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showEditTitleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateTitle">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Close, Edit, Delete } from '@element-plus/icons-vue'
import { useConversationManager } from '../composables/useConversationManager'
import { useChatHistory } from '@/composables/useChatHistory'

const {
  conversations,
  currentConversation,
  currentConversationId,
  createConversation,
  deleteConversation,
  switchConversation,
  updateConversationTitle
} = useConversationManager()

// 🔧 获取chatHistory实例，用于同步消息
const chatHistory = useChatHistory()

const showEditTitleDialog = ref(false)
const editingTitle = ref('')

// 直接编辑标签页的状态
const editingTabId = ref<string | null>(null)
const originalTitle = ref('')
const editInput = ref<HTMLInputElement | null>(null)

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 切换会话
const handleSwitchConversation = async (conversationId: string) => {
  await switchConversation(conversationId)

  // 🔧 同步消息到chatHistory，以便AIAssistantFullPage能够显示历史消息
  const targetConversation = conversations.value.find(c => c.id === conversationId)
  if (targetConversation && targetConversation.messages) {
    console.log(`🔄 [ConversationTabs] 同步 ${targetConversation.messages.length} 条消息到chatHistory`)
    chatHistory.setMessages(targetConversation.messages)
  }
}

// 创建新会话
const handleCreateConversation = () => {
  createConversation()
  ElMessage.success('✅ 创建新会话成功')
}

// 删除会话
const handleDeleteConversation = async (conversationId: string) => {
  const conversation = conversations.value.find(c => c.id === conversationId)
  if (!conversation) return

  try {
    await ElMessageBox.confirm(
      `确定要删除会话 "${conversation.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleteConversation(conversationId)
    ElMessage.success('✅ 会话已删除')
  } catch {
    // 用户取消了删除操作
  }
}

// 直接编辑标签页相关方法
const startEditTab = (conversation: any) => {
  editingTabId.value = conversation.id
  originalTitle.value = conversation.title
  editingTitle.value = conversation.title

  // 下一帧聚焦输入框
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

const finishEditTab = async (conversation: any) => {
  if (!editingTitle.value.trim()) {
    ElMessage.warning('⚠️ 标题不能为空')
    cancelEditTab()
    return
  }

  if (editingTitle.value.trim() !== originalTitle.value) {
    try {
      await updateConversationTitle(conversation.id, editingTitle.value.trim())
      ElMessage.success('✅ 标题已更新')
    } catch (error) {
      ElMessage.error('❌ 更新标题失败')
    }
  }

  editingTabId.value = null
  editingTitle.value = ''
  originalTitle.value = ''
}

const cancelEditTab = () => {
  editingTabId.value = null
  editingTitle.value = ''
  originalTitle.value = ''
}

// 更新标题
const handleUpdateTitle = () => {
  if (!editingTitle.value.trim()) {
    ElMessage.warning('⚠️ 标题不能为空')
    return
  }

  if (currentConversation.value) {
    updateConversationTitle(currentConversation.value.id, editingTitle.value.trim())
    ElMessage.success('✅ 标题已更新')
    showEditTitleDialog.value = false
  }
}

// 打开编辑对话框时，填充当前标题
watch(() => showEditTitleDialog.value, (newVal) => {
  if (newVal && currentConversation.value) {
    editingTitle.value = currentConversation.value.title
  }
})

// 处理标签页右键菜单
const handleTabContextMenu = (conversationId: string, event: MouseEvent) => {
  // 可以在这里添加单个标签的右键菜单选项
  // 目前实现删除单个的功能已经有了
}

// 处理整个标签区域的右键菜单 - 删除全部会话
const handleTabsContextMenu = async () => {
  if (conversations.value.length === 0) {
    ElMessage.warning('⚠️ 没有会话可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除全部 ${conversations.value.length} 个会话吗？此操作不可撤销！`,
      '确认删除全部会话',
      {
        confirmButtonText: '删除全部',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 删除所有会话
    for (const conversation of conversations.value) {
      deleteConversation(conversation.id)
    }

    ElMessage.success('✅ 已删除全部会话')
  } catch {
    // 用户取消了删除操作
  }
}

// 处理删除全部会话菜单项
const handleDeleteAllConversations = async () => {
  if (conversations.value.length === 0) {
    ElMessage.warning('⚠️ 没有会话可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除全部 ${conversations.value.length} 个会话吗？此操作不可撤销！`,
      '确认删除全部会话',
      {
        confirmButtonText: '删除全部',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 删除所有会话
    for (const conversation of conversations.value) {
      deleteConversation(conversation.id)
    }

    ElMessage.success('✅ 已删除全部会话')
  } catch {
    // 用户取消了删除操作
  }
}

// 🔧 新增：处理删除当前会话菜单项
const handleDeleteCurrentConversation = async () => {
  if (!currentConversationId.value) {
    ElMessage.warning('⚠️ 没有选中的会话')
    return
  }

  await handleDeleteConversation(currentConversationId.value)
}
</script>

<style scoped>
/* design-tokens 已通过 vite.config 全局注入 */

.conversation-tabs {
  background: var(--bg-card);
  padding: 0;
}

.tabs-header {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  height: 36px;
}

.tabs-scroll {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 2px;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.conversation-tab {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom: none;
  /* ✨ 修复：添加浅色背景,让文字更易读 */
  background: var(--bg-secondary);
  position: relative;
  min-width: 80px;
  max-width: 140px;
  transition: all var(--transition-base);
  gap: var(--spacing-xs);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-size: var(--text-xs);
  color: var(--text-primary);
}

.conversation-tab:hover {
  background: var(--bg-hover);
  border-color: var(--border-color);
}

.conversation-tab.active {
  background: var(--primary-color);
  color: #ffffff; /* ✨ 修复：使用纯白色确保对比度 */
  border-color: var(--primary-color);
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  max-width: 100px;
}

.tab-close {
  display: none;
  opacity: 0.7;
  border-radius: var(--radius-full);
  padding: 2px;
  transition: all var(--transition-base);
  font-size: 10px;
}

.conversation-tab:hover .tab-close {
  display: flex;
}

.tab-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* 编辑输入框样式 */
.tab-title-input {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 11px;
  outline: none;
  max-width: 100px;
}

.conversation-tab.active .tab-title-input {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.conversation-tab.editing {
  background: var(--primary-light-bg) !important;
}

.new-conversation-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-xs);
  cursor: pointer;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: 11px;
  transition: all var(--transition-base);
  margin-left: var(--spacing-xs);
  flex-shrink: 0;
  height: 24px;
}

.new-conversation-btn:hover {
  background: var(--primary-light-bg);
  border-color: var(--primary-color);
}

.conversation-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  font-size: 11px;
  border-top: 1px solid var(--border-color-light);
}

.info-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.info-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: 10px;
}

.info-dot {
  width: 3px;
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--border-color);
}

.edit-title-btn {
  padding: 2px;
  min-height: auto;
  font-size: 10px;
}

.edit-title-btn:hover {
  background: var(--bg-hover);
}

/* 移动端适配 */
@media (max-width: var(--breakpoint-md)) {
  .conversation-info {
    padding: var(--spacing-xs) var(--spacing-xs);
  }

  .info-title {
    max-width: 120px;
  }

  .tabs-header {
    padding: 0 var(--spacing-xs);
  }

  .conversation-tab {
    min-width: 60px;
  }

  .tab-title {
    max-width: 80px;
  }
}
</style>