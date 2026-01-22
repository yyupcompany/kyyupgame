<!--
  欢迎消息组件
  从 AIAssistant.vue 第70-85行模板提取
  支持根据用户角色显示定制化的欢迎消息和快捷问题
-->

<template>
  <div class="message-item assistant welcome-message">
    <div class="message-avatar">
      <UnifiedIcon name="ai-center" />
    </div>
    <div class="message-content welcome-card">
      <div class="message-text">
        <div class="welcome-title">
          <UnifiedIcon name="ai-center" />
          {{ welcomeConfig.title }}
        </div>
        <div class="welcome-subtitle">
          {{ welcomeConfig.subtitle }}
        </div>
      </div>
      <div class="suggestion-buttons">
        <!-- 根据角色显示不同的快捷问题 -->
        <button
          v-for="(suggestion, index) in welcomeConfig.suggestions"
          :key="index"
          class="suggestion-btn"
          :class="{ 'html-preview-btn': suggestion.htmlPreview }"
          @click="handleSuggestion(suggestion.text)"
          :title="suggestion.description"
        >
          <UnifiedIcon :name="suggestion.icon || 'ai-center'" />
          {{ suggestion.text }}
        </button>
      </div>
      <div class="welcome-tips">
        <div class="tip-item">
          <UnifiedIcon name="ChatDotRound" />
          <span>{{ welcomeConfig.tips.talk }}</span>
        </div>
        <div class="tip-item">
          <UnifiedIcon name="Tools" />
          <span>{{ welcomeConfig.tips.actions }}</span>
        </div>
        <div class="tip-item">
          <UnifiedIcon name="Microphone" :size="16" />
          <span>{{ welcomeConfig.tips.voice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Service,
  School,
  TrendCharts,
  EditPen,
  ChatDotRound,
  Tools,
  Microphone,
  Histogram,
  Orange,
  Grid
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

// ==================== Emits ====================
interface Emits {
  'suggestion': [text: string]
}

const emit = defineEmits<Emits>()

// 获取用户角色
const userStore = useUserStore()

// 角色类型定义
type UserRole = 'admin' | 'principal' | 'teacher' | 'parent' | 'default'

// 获取当前用户角色
const currentRole = computed<UserRole>(() => {
  const role = userStore.userInfo?.role?.toLowerCase() || ''
  const roles = userStore.userInfo?.roles || []

  // 根据角色信息判断
  if (role === 'admin' || role === 'super_admin' || roles.includes('admin')) {
    return 'admin'
  } else if (role === 'principal' || role === '园长' || roles.includes('principal')) {
    return 'principal'
  } else if (role === 'teacher' || role === '教师' || roles.includes('teacher')) {
    return 'teacher'
  } else if (role === 'parent' || role === '家长' || roles.includes('parent')) {
    return 'parent'
  }
  return 'default'
})

// 不同角色的欢迎消息配置
const roleConfigs: Record<UserRole, {
  title: string
  subtitle: string
  suggestions: Array<{
    text: string
    icon?: string
    description?: string
    htmlPreview?: boolean
  }>
  tips: {
    talk: string
    actions: string
    voice: string
  }
}> = {
  // 园长角色
  principal: {
    title: '🌈 尊敬的园长您好！',
    subtitle: '我是您的AI管理助手，专注园区运营管理，助您科学决策、高效管理！',
    suggestions: [
      { text: '👶 现在有多少小朋友呀？', icon: 'Orange', description: '查看当前在园儿童总数' },
      { text: '🏆 哪个班小朋友最多？', icon: 'Histogram', description: '查看班级人数统计排名' },
      { text: '📊 本月的出勤率怎么样？', icon: 'TrendCharts', description: '查看月度出勤数据分析' },
      { text: '📋 生成今日工作报告', icon: 'EditPen', description: '自动生成园区日常工作报告' },
      { text: '💰 查看月度财务概览', icon: 'Service', description: '了解园区财务收支情况' },
      { text: '👨‍🏫 老师们的排班情况如何？', icon: 'Grid', description: '查看教师值班安排' }
    ],
    tips: {
      talk: '用大白话聊天',
      actions: '会做各种事情',
      voice: '还能语音对话'
    }
  },

  // 教师角色
  teacher: {
    title: '🌈 亲爱的老师您好！',
    subtitle: '我是您的AI教学助手，专注教学支持，助您轻松备课、高效教学！',
    suggestions: [
      { text: '🔢 帮我设计数字认知小游戏', icon: 'Grid', description: '生成数字教学互动游戏' },
      { text: '🐾 讲个关于小动物的故事吧', icon: 'ChatDotRound', description: '获取儿童故事内容' },
      { text: '🎨 设计形状颜色认知活动', icon: 'EditPen', description: '创建形状颜色教学方案' },
      { text: '📝 帮我写一篇教学反思', icon: 'EditPen', description: '辅助撰写教学反思文档' },
      { text: '👶 班级小朋友的个性特点分析', icon: 'Service', description: '了解幼儿个体差异' },
      { text: '🎉 设计一个亲子互动游戏', icon: 'Tools', description: '创建家园互动活动方案' }
    ],
    tips: {
      talk: '用大白话聊天',
      actions: '会做各种事情',
      voice: '还能语音对话'
    }
  },

  // 家长角色
  parent: {
    title: '🌈 亲爱的家长您好！',
    subtitle: '我是您的AI育儿助手，专注家庭教育，助您科学育儿、快乐成长！',
    suggestions: [
      { text: '👶 适合3岁宝宝的绘本推荐', icon: 'Service', description: '获取适龄绘本推荐' },
      { text: '🍎 宝宝挑食怎么办？', icon: 'ChatDotRound', description: '获取幼儿饮食建议' },
      { text: '😴 如何培养宝宝午睡习惯？', icon: 'Tools', description: '获取作息培养建议' },
      { text: '🎨 和宝宝玩什么亲子游戏？', icon: 'EditPen', description: '获取亲子互动游戏' },
      { text: '📚 如何培养孩子的阅读习惯？', icon: 'School', description: '获取阅读习惯培养方法' },
      { text: '👫 宝宝在幼儿园不合群怎么办？', icon: 'Service', description: '获取社交能力培养建议' }
    ],
    tips: {
      talk: '用大白话聊天',
      actions: '会做各种事情',
      voice: '还能语音对话'
    }
  },

  // 管理员角色
  admin: {
    title: '🌈 尊敬的系统管理员您好！',
    subtitle: '我是您的AI系统助手，专注系统管理，助您高效运维、智慧管理！',
    suggestions: [
      { text: '📊 查看系统使用统计', icon: 'TrendCharts', description: '获取系统运营数据' },
      { text: '🔧 系统运行状态如何？', icon: 'Service', description: '监控系统健康状况' },
      { text: '👥 用户活跃度分析', icon: 'Histogram', description: '分析用户活跃情况' },
      { text: '📋 生成运营报告', icon: 'EditPen', description: '生成系统运营报告' }
    ],
    tips: {
      talk: '用大白话聊天',
      actions: '会做各种事情',
      voice: '还能语音对话'
    }
  },

  // 默认角色（未登录或未知角色）
  default: {
    title: '🌈 您好！',
    subtitle: '我是您的AI助手，有什么想知道的尽管问我，我会用最简单的方式回答您！',
    suggestions: [
      { text: '👶 有多少小朋友呀？', icon: 'Orange', description: '查看学生总数' },
      { text: '🏆 哪个班小朋友最多？', icon: 'Histogram', description: '查看班级人数统计' },
      { text: '🎉 最近有什么好玩的活动？', icon: 'EditPen', description: '查看近期活动安排' },
      { text: '🔢 数字小游戏', icon: 'Grid', description: '生成数字认知游戏' },
      { text: '🐾 小动物故事', icon: 'ChatDotRound', description: '获取动物故事' },
      { text: '🎨 形状颜色认知', icon: 'EditPen', description: '形状颜色教学游戏' }
    ],
    tips: {
      talk: '用大白话聊天',
      actions: '会做各种事情',
      voice: '还能语音对话'
    }
  }
}

// 根据当前角色获取配置
const welcomeConfig = computed(() => {
  return roleConfigs[currentRole.value] || roleConfigs.default
})

// ==================== 事件处理 ====================
const handleSuggestion = (text: string) => {
  console.log('🔍 [WelcomeMessage] 建议按钮点击:', text, '角色:', currentRole.value)
  emit('suggestion', text)
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入

.welcome-message {
  margin-bottom: var(--text-3xl);

  /* 🎯 欢迎消息宽度控制：使用响应式变量 */
  width: var(--ai-content-width);
  max-width: var(--ai-content-max-width);
  margin: 0 auto var(--text-3xl);

  /* 🔧 防止缩放时变形 */
  transform-origin: center center;
  flex-shrink: 0;

  /* 🎨 平滑过渡 */
  transition: all var(--ai-transition-normal);
}

.message-item {
  display: flex;
  gap: var(--text-sm);
  margin-bottom: var(--text-lg);
}

.message-item.assistant {
  justify-content: flex-start;
}

.message-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--el-color-primary);
  font-size: var(--text-xl);
}

.message-content {
  flex: 1;
  min-width: 0;
}

// 🎨 3️⃣ 欢迎消息卡片 - 使用主题变量
.welcome-card {
  background: linear-gradient(135deg, var(--ai-welcome-bg-start) 0%, var(--ai-welcome-bg-end) 100%);
  border: var(--border-width) solid var(--ai-welcome-border);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--ai-welcome-shadow);
  backdrop-filter: blur(var(--spacing-xl)) saturate(180%);
  transition: all var(--ai-transition-normal);
}

.message-text {
  margin-bottom: var(--spacing-xl);
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-sm);
}

.welcome-icon {
  font-size: var(--spacing-xl);
  color: var(--el-color-primary);
}

.welcome-subtitle {
  font-size: var(--text-base);
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.suggestion-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
  margin-bottom: var(--spacing-xl);
}

.suggestion-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--text-sm) var(--text-lg);
  background: var(--el-bg-color);
  border: var(--border-width) solid var(--el-border-color-light);
  border-radius: var(--spacing-sm);
  color: var(--el-text-color-primary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.suggestion-btn:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  transform: translateY(var(--z-index-below));
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

.suggestion-btn:active {
  transform: translateY(0);
}

// 🎨 HTML预览按钮特殊样式
.suggestion-btn.html-preview-btn {
  background: linear-gradient(135deg, var(--bg-white)5f5 0%, #ffe9f0 100%);
  border-color: var(--primary-color-ultra-light);
  color: var(--text-primary); // 🔧 修复：深紫色文字，确保在粉色背景上清晰可见

  &:hover {
    background: linear-gradient(135deg, #ffe9f0 0%, #ffd6e0 100%);
    border-color: var(--primary-color-light);
    color: var(--text-secondary); // 🔧 修复：悬停时更深的文字颜色

    .el-icon {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }

  .el-icon {
    color: var(--primary-color-light);
    transition: all var(--transition-fast);
  }
}

.welcome-tips {
  display: flex;
  gap: var(--text-lg);
  padding-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
}

.tip-item .el-icon {
  font-size: var(--text-base);
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .welcome-card {
    padding: var(--spacing-xl);
  }
  
  .welcome-tips {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .suggestion-btn {
    padding: var(--spacing-2xl) var(--text-base);
    font-size: var(--text-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .welcome-card {
    padding: var(--text-lg);
  }
  
  .welcome-title {
    font-size: var(--text-lg);
  }
  
  .welcome-subtitle {
    font-size: var(--text-sm);
  }
}
</style>
