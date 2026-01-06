<template>
  <MobileMainLayout
    title="创意课程"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="creative-curriculum-page">
      <van-search v-model="searchQuery" placeholder="搜索课程" />
      <van-grid :column-num="2" :gutter="10">
        <van-grid-item v-for="course in courses" :key="course.id" :icon="course.icon" :text="course.name" @click="viewCourse(course)" />
      </van-grid>
      <van-floating-bubble axis="xy" icon="plus" @click="createCourse" />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Course {
  id: number
  name: string
  icon: string
  description?: string
  studentCount?: number
}

const searchQuery = ref('')
const loading = ref(false)
const courses = ref<Course[]>([])

const iconMap: Record<string, string> = {
  '艺术': 'brush-o',
  '音乐': 'music-o',
  '科学': 'experiment-o',
  '阅读': 'reading',
  '体育': 'guide-o',
  '数学': 'calculator-o'
}

const loadCourses = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })
    
    const response = await teachingCenterApi.getCourseProgressStats()
    
    if (response.success && response.data) {
      courses.value = (response.data.courses || []).map((course: any) => ({
        id: course.id,
        name: course.name,
        icon: getIconForCourse(course.name),
        description: course.description,
        studentCount: course.studentCount
      }))
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const getIconForCourse = (name: string): string => {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key)) return icon
  }
  return 'column'
}

const viewCourse = (course: Course) => {
  router.push(`/mobile/teacher-center/course/${course.id}`)
}

const createCourse = () => {
  router.push('/mobile/teacher-center/course/create')
}

onMounted(() => {
  loadCourses()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.creative-curriculum-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  padding: var(--spacing-md);
}
</style>

