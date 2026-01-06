<template>
  <div class="class-course-container class-detail-page">
    <div class="page-header">
      <h2>班级详情</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/class' }">班级管理</el-breadcrumb-item>
        <el-breadcrumb-item>班级详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <class-detail-view 
      :class-id="classId" 
      @edit="handleEdit" 
      @back="goBack" 
      @view-student="viewStudentDetail"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 2. Element Plus 导入
// 无需导入Element Plus组件

// 3. 公共工具函数导入
// 无需导入公共工具函数

// 4. 页面内部类型定义和组件导入
import ClassDetailView from '@/components/class/ClassDetailView.vue'

const route = useRoute()
const router = useRouter()

// 获取路由中的班级ID
const classId = computed(() => route.params.id as string)

// 编辑班级
const handleEdit = (id: string) => {
  router.push(`/class/edit/${id}`)
}

// 返回班级列表
const goBack = () => {
  router.push('/class')
}

// 查看学生详情
const viewStudentDetail = (studentId: string) => {
  router.push(`/student/detail/${studentId}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use '../class-course-ux-styles.scss' as *;

/* 页面容器样式已通过全局样式提供，保留特定样式 */

/* 使用全局样式，移除冗余样式定义 */
</style> 