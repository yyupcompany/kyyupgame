<template>
  <MobileSubPageLayout title="创意课程" back-path="/mobile/teacher-center">
    <div class="creative-curriculum-page">
      <van-search v-model="searchQuery" placeholder="搜索课程" />
      <van-grid :column-num="2" :gutter="10">
        <van-grid-item v-for="course in courses" :key="course.id" :icon="course.icon" :text="course.name" @click="viewCourse(course)" />
      </van-grid>
      <van-floating-bubble axis="xy" icon="plus" @click="createCourse" />
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Course {
  id: number
  name: string
  icon: string
  description?: string
  domain?: string
  ageGroup?: string
  status?: string
  thumbnail?: string
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
  '数学': 'calculator-o',
  'health': 'flower-o',
  'language': 'chat-o',
  'social': 'friends-o'
}

const loadCourses = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })

    // 调用正确的创意课程API端点
    const response = await request.get('/api/teacher-center-creative-curriculum', {
      page: 1,
      limit: 50
    })

    if (response.success && response.data) {
      courses.value = (response.data.rows || []).map((course: any) => ({
        id: course.id,
        name: course.name,
        icon: getIconForCourse(course.domain || course.name),
        description: course.description,
        domain: course.domain,
        ageGroup: course.ageGroup,
        status: course.status,
        thumbnail: course.thumbnail
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
  router.push(`/mobile/teacher-center/creative-curriculum/preview?id=${course.id}`)
}

const createCourse = () => {
  router.push('/mobile/teacher-center/creative-curriculum/create')
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadCourses()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';
.creative-curriculum-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  padding: var(--spacing-md);
}
</style>

