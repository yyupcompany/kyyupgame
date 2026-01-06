<template>
  <!-- 遮罩层 -->
  <Transition name="drawer-fade">
    <div v-if="internalVisible" class="drawer-overlay" @click="handleOverlayClick"></div>
  </Transition>

  <!-- 抽屉主体 -->
  <Transition name="drawer-slide">
    <div v-if="internalVisible" class="mobile-drawer" :class="drawerClasses">
      <!-- 关闭按钮 -->
      <div v-if="closeable" class="drawer-close-btn" @click="handleClose">
        <van-icon name="cross" size="20" />
      </div>

      <!-- 用户信息卡片 -->
      <div v-if="showUserInfo" class="user-info-card">
        <div class="user-avatar">
          <van-image
            :src="userAvatar"
            round
            width="48"
            height="48"
            fit="cover"
          >
            <template #error>
              <van-icon name="user-o" size="24" />
            </template>
          </van-image>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRoleName }}</div>
        </div>
        <van-button
          v-if="showLogoutButton"
          type="danger"
          size="small"
          plain
          @click="handleLogout"
        >
          退出
        </van-button>
      </div>

      <!-- 菜单分类列表 -->
      <div class="drawer-menu-list">
        <DrawerCategory
          v-for="category in menuCategories"
          :key="category.id"
          :category="category"
          @item-click="handleItemClick"
        />
      </div>

      <!-- 底部占位（安全区域） -->
      <div v-if="useSafeArea" class="bottom-safe-area"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import DrawerCategory from './DrawerCategory.vue'
import type { DrawerCategory as DrawerCategoryType } from '@/config/mobile-navigation.types'
import type { DrawerMenuItem as DrawerMenuItemType } from '@/config/mobile-navigation.types'
import { getMobileNavigationConfig } from '@/config/mobile-navigation.config'

interface Props {
  visible?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  showUserInfo?: boolean
  showLogoutButton?: boolean
  useSafeArea?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  closeable: false,
  closeOnClickOverlay: true,
  showUserInfo: true,
  showLogoutButton: true,
  useSafeArea: true
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'open': []
  'close': []
  'item-click': [item: DrawerMenuItemType]
  'logout': []
}>()

const router = useRouter()
const userStore = useUserStore()

// 内部可见状态
const internalVisible = ref(props.visible)

// 监听外部visible变化
watch(() => props.visible, (newVal) => {
  internalVisible.value = newVal
})

// 监听内部visible变化，同步到外部
watch(internalVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 当前用户角色
const userRole = computed(() => {
  return (userStore.user?.role as any) || 'parent'
})

// 获取导航配置
const navigationConfig = computed(() => {
  return getMobileNavigationConfig(userRole.value)
})

// 菜单分类列表
const menuCategories = computed(() => {
  return navigationConfig.value.drawerMenu?.categories || []
})

// 用户头像
const userAvatar = computed(() => {
  return userStore.user?.avatar || ''
})

// 用户名称
const userName = computed(() => {
  return userStore.user?.name || userStore.user?.username || '用户'
})

// 用户角色名称
const userRoleName = computed(() => {
  const roleMap: Record<string, string> = {
    parent: '家长',
    teacher: '教师',
    principal: '园长',
    admin: '管理员'
  }
  return roleMap[userRole.value] || '用户'
})

// 抽屉样式类
const drawerClasses = computed(() => ({
  'with-user-info': props.showUserInfo,
  'with-safe-area': props.useSafeArea
}))

// 处理打开
const handleOpen = () => {
  emit('open')
}

// 处理关闭
const handleClose = () => {
  internalVisible.value = false
  emit('close')
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 处理菜单项点击
const handleItemClick = (item: DrawerMenuItemType) => {
  emit('item-click', item)
  // 点击菜单项后自动关闭抽屉
  internalVisible.value = false
}

// 处理退出登录
const handleLogout = () => {
  showDialog({
    title: '退出登录',
    message: '确定要退出登录吗？',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    confirmButtonColor: 'var(--danger-color)'
  }).then(() => {
    emit('logout')
    internalVisible.value = false
    // 执行退出登录逻辑
    userStore.logout()
    router.push('/mobile/login')
  }).catch(() => {
    // 用户取消
  })
}

// 暴露方法
defineExpose({
  open: () => {
    internalVisible.value = true
  },
  close: () => {
    internalVisible.value = false
  },
  toggle: () => {
    internalVisible.value = !internalVisible.value
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

// 遮罩层
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

// 抽屉主体
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-color);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

// 关闭按钮
.drawer-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-color-light);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-timing-ease);

  &:hover {
    background: var(--bg-color-hover);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }
}

// 用户信息卡片
.user-info-card {
  display: flex;
  align-items: center;
  gap: var(--app-gap);
  padding: var(--app-gap-lg) var(--app-gap);
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.05) 100%);
  border-bottom: 1px solid var(--border-color-light);
  flex-shrink: 0;

  .user-avatar {
    flex-shrink: 0;

    :deep(.van-image) {
      border: 2px solid var(--primary-color);
    }

    :deep(.van-icon) {
      color: var(--text-tertiary);
      background: var(--bg-color-light);
      padding: 12px;
      border-radius: 50%;
    }
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-role {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.3;
    margin-top: 2px;
  }

  :deep(.van-button) {
    flex-shrink: 0;
  }
}

// 菜单列表
.drawer-menu-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--app-gap) 0;
  -webkit-overflow-scrolling: touch;

  // 隐藏滚动条但保持可滚动
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

// 底部安全区域
.bottom-safe-area {
  height: env(safe-area-inset-bottom);
  flex-shrink: 0;
  background: var(--bg-color);
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .mobile-drawer {
    background: var(--bg-color-dark);
  }

  .user-info-card {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2) 0%, rgba(var(--primary-rgb), 0.1) 100%);
    border-bottom-color: var(--border-color-dark);

    .user-avatar {
      :deep(.van-icon) {
        background: var(--bg-color-light-dark);
      }
    }

    .user-name {
      color: var(--text-primary-dark);
    }

    .user-role {
      color: var(--text-secondary-dark);
    }
  }

  .bottom-safe-area {
    background: var(--bg-color-dark);
  }
}

// Vue Transition 动画
// 遮罩层淡入淡出
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

// 抽屉滑动效果
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}
</style>
