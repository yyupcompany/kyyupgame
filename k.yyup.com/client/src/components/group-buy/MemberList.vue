<template>
  <div class="member-list" :class="`layout-${layout}`">
    <!-- 团员列表 -->
    <div 
      v-for="(member, index) in displayMembers" 
      :key="member.id || `member-${index}`"
      class="member-item"
      :class="{ 'is-leader': member.isLeader, 'is-paid': isPaidMember(member) }"
      @click="handleMemberClick(member)"
      @contextmenu.prevent="handleMemberLongPress(member)"
    >
      <div class="member-avatar">
        <el-avatar :size="avatarSize" :src="getMemberAvatar(member)">
          <el-icon><User /></el-icon>
        </el-avatar>
        
        <!-- 团长标识 -->
        <div v-if="member.isLeader" class="leader-badge">
          <el-icon><Star /></el-icon>
        </div>
        
        <!-- 支付状态标识 -->
        <div v-if="showPaymentStatus && isPaidMember(member)" class="payment-badge">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
      </div>
      
      <div class="member-info">
        <div class="member-name">{{ getMemberName(member) }}</div>
        <div v-if="showPaymentStatus" class="payment-status">
          {{ getPaymentStatusText(member) }}
        </div>
      </div>
    </div>

    <!-- 占位符 - 显示还差几人成团 -->
    <div 
      v-if="showPlaceholders && remainingSlots > 0"
      v-for="slot in remainingSlots" 
      :key="`placeholder-${slot}`"
      class="member-item placeholder"
      @click="handlePlaceholderClick"
    >
      <div class="placeholder-avatar">
        <el-avatar :size="avatarSize" class="placeholder-icon">
          <el-icon><Plus /></el-icon>
        </el-avatar>
      </div>
      <div class="placeholder-text">等你参团</div>
    </div>

    <!-- 分享引导提示 -->
    <div 
      v-if="showShareGuide && remainingSlots > 0" 
      class="share-guide"
    >
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          还差 <strong>{{ remainingSlots }}</strong> 人成团，快去分享吧！
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Star, CircleCheckFilled, Plus } from '@element-plus/icons-vue'
import type { MemberListProps, MemberListEmits, MemberInfo, MaskedMemberInfo } from '@/types/group-buy.types'

// Props定义
const props = withDefaults(defineProps<MemberListProps>(), {
  showPaymentStatus: true,
  showPlaceholders: true,
  layout: 'grid',
  columns: 4
})

// Emits定义
const emit = defineEmits<MemberListEmits>()

// 计算属性
const displayMembers = computed(() => {
  return props.members || []
})

const remainingSlots = computed(() => {
  const currentCount = displayMembers.value.length
  return Math.max(0, props.targetPeople - currentCount)
})

const showShareGuide = computed(() => {
  return props.showPlaceholders && remainingSlots.value > 0 && displayMembers.value.length > 0
})

const avatarSize = computed(() => {
  if (props.layout === 'horizontal') return 40
  if (props.layout === 'vertical') return 50
  return 60 // grid
})

// 方法
const getMemberAvatar = (member: MemberInfo | MaskedMemberInfo): string => {
  if ('avatar' in member && member.avatar) {
    return member.avatar
  }
  return ''
}

const getMemberName = (member: MemberInfo | MaskedMemberInfo): string => {
  if ('maskedName' in member) {
    return member.maskedName
  }
  if ('name' in member) {
    return member.name || '匿名用户'
  }
  return '匿名用户'
}

const isPaidMember = (member: MemberInfo | MaskedMemberInfo): boolean => {
  if ('paymentStatus' in member) {
    return member.paymentStatus === 'paid'
  }
  return false
}

const getPaymentStatusText = (member: MemberInfo | MaskedMemberInfo): string => {
  if (!('paymentStatus' in member)) return ''
  
  switch (member.paymentStatus) {
    case 'paid':
      return '已支付'
    case 'unpaid':
      return '待支付'
    case 'refunded':
      return '已退款'
    default:
      return ''
  }
}

const handleMemberClick = (member: MemberInfo | MaskedMemberInfo) => {
  emit('member-click', member)
}

const handleMemberLongPress = (member: MemberInfo | MaskedMemberInfo) => {
  emit('member-longpress', member)
}

const handlePlaceholderClick = () => {
  emit('placeholder-click')
}
</script>

<style scoped lang="scss">
.member-list {
  width: 100%;

  // 网格布局
  &.layout-grid {
    display: grid;
    grid-template-columns: repeat(v-bind('props.columns'), 1fr);
    gap: var(--spacing-md);

    @media (max-width: var(--breakpoint-md)) {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
    }

    @media (max-width: var(--breakpoint-xs)) {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  // 水平布局
  &.layout-horizontal {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-md);
    overflow-x: auto;
    padding-bottom: 8px;

    .member-item {
      flex-shrink: 0;
      width: auto;
    }
  }

  // 垂直布局
  &.layout-vertical {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .member-item {
      flex-direction: row;
      align-items: center;
      padding: var(--spacing-md);
      background: #f5f7fa;
      border-radius: 8px;

      .member-info {
        margin-left: 12px;
        text-align: left;
      }
    }
  }
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: var(--spacing-sm);
  border-radius: 8px;

  &:hover:not(.placeholder) {
    background: #f5f7fa;
    transform: translateY(-2px);
  }

  &.is-leader {
    .member-avatar {
      border: 2px solid #fbbf24;
    }
  }

  &.is-paid {
    .member-avatar {
      border: 2px solid #10b981;
    }
  }

  // 占位符样式
  &.placeholder {
    opacity: 0.6;
    border: 2px dashed #d1d5db;
    background: #f9fafb;

    &:hover {
      opacity: 0.8;
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .placeholder-avatar {
      .el-avatar {
        background: #e5e7eb;
        color: #9ca3af;
      }
    }

    .placeholder-text {
      margin-top: 8px;
      font-size: var(--text-xs);
      color: #9ca3af;
    }
  }
}

.member-avatar {
  position: relative;
  border-radius: 50%;
  
  .leader-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: #fbbf24;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--text-xs);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .payment-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--text-xs);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.member-info {
  margin-top: 8px;
  text-align: center;

  .member-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .payment-status {
    font-size: var(--text-xs);
    color: #6b7280;
  }
}

.share-guide {
  margin-top: 16px;
  grid-column: 1 / -1;

  :deep(.el-alert__title) {
    strong {
      color: #ef4444;
      font-size: var(--text-base);
    }
  }
}

.placeholder-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
