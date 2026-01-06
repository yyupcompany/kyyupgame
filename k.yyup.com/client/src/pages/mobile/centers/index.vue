<!--
  Mobile Centers Index - 移动端中心目录页面
  使用新组件重构，确保四个角色视觉统一
-->
<template>
  <!-- Admin 布局 -->
  <AdminMobileLayout
    v-if="userRole === 'admin'"
    v-model:active-tab="activeTab"
    :show-back="false"
    :show-footer="true"
    header-title="中心目录"
  >
    <CentersContent />
  </AdminMobileLayout>

  <!-- Principal 布局 -->
  <PrincipalMobileLayout
    v-else-if="userRole === 'principal'"
    v-model:active-tab="activeTab"
    :show-back="false"
    :show-footer="true"
    header-title="中心目录"
  >
    <CentersContent />
  </PrincipalMobileLayout>

  <!-- Teacher 布局 -->
  <TeacherMobileLayout
    v-else-if="userRole === 'teacher'"
    v-model:active-tab="activeTab"
    :show-back="false"
    :show-footer="true"
    header-title="中心目录"
  >
    <CentersContent />
  </TeacherMobileLayout>

  <!-- Parent 布局 -->
  <ParentMobileLayout
    v-else-if="userRole === 'parent'"
    v-model:active-tab="activeTab"
    :show-back="false"
    :show-footer="true"
    header-title="中心目录"
  >
    <CentersContent />
  </ParentMobileLayout>

  <!-- 默认布局（兜底） -->
  <AdminMobileLayout
    v-else
    v-model:active-tab="activeTab"
    :show-back="false"
    :show-footer="true"
    header-title="中心目录"
  >
    <CentersContent />
  </AdminMobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import AdminMobileLayout from '@/components/mobile/layouts/AdminMobileLayout.vue'
import PrincipalMobileLayout from '@/components/mobile/layouts/PrincipalMobileLayout.vue'
import TeacherMobileLayout from '@/components/mobile/layouts/TeacherMobileLayout.vue'
import ParentMobileLayout from '@/components/mobile/layouts/ParentMobileLayout.vue'
import CentersContent from './CentersContent.vue'

const router = useRouter()
const userStore = useUserStore()

// 当前用户角色
const userRole = computed(() => {
  const role = userStore.user?.role || 'admin'
  console.log('📱 [Mobile Centers] 当前用户角色:', {
    user: userStore.user,
    role: role,
    rawRole: userStore.user?.role
  })
  return role
})

// 当前激活的 Tab
const activeTab = ref('dashboard')

// 监听用户角色变化
watch(userRole, (newRole) => {
  console.log('📱 [Mobile Centers] 用户角色变化:', newRole)
})

// 组件挂载
onMounted(() => {
  console.log('📱 [Mobile Centers] 页面挂载', {
    user: userStore.user,
    userRole: userRole.value,
    isLoggedIn: !!userStore.user
  })
})
</script>

<style lang="scss" scoped>
// 样式移至 CentersContent.vue 组件中
</style>
