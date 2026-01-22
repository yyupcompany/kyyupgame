<template>
  <MobileCenterLayout title="学生管理" back-path="/mobile/centers">
    <!-- 搜索 -->
    <van-search
      v-model="searchQuery"
      placeholder="搜索学生姓名"
      :background="isDark ? '#1e293b' : '#ffffff'"
      @search="handleSearch"
    />

    <!-- 统计 -->
    <div class="stats-container" :style="statsContainerStyle">
      <div class="stat-card" :style="statCardStyle">
        <van-icon name="contact" size="32" color="var(--primary-color)" />
        <div class="stat-info">
          <div class="stat-value" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">{{ studentStats.total }}</div>
          <div class="stat-label" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">学生总数</div>
        </div>
      </div>
      <div class="stat-card" :style="statCardStyle">
        <van-icon name="star-o" size="32" color="#ff976a" />
        <div class="stat-info">
          <div class="stat-value" :style="{ color: isDark ? '#f1f5f9' : '#2c3e50' }">{{ studentStats.active }}</div>
          <div class="stat-label" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">在园学生</div>
        </div>
      </div>
    </div>

    <!-- 班级筛选 -->
    <van-dropdown-menu :style="{ marginBottom: '12px' }">
      <van-dropdown-item v-model="classFilter" :options="classOptions" @change="handleClassFilter" />
    </van-dropdown-menu>

    <!-- 学生列表 -->
    <div class="student-list" :style="listStyle">
      <van-pull-refresh v-model="refreshing" @refresh="handleRefresh" :style="listStyle">
        <van-list
          v-model:loading="loading"
          :finished="true"
          finished-text="没有更多了"
          :style="listStyle"
        >
          <div
            v-for="student in filteredStudents"
            :key="student.id"
            class="student-card"
            @click="handleStudentClick(student)"
          >
            <van-cell-group inset :style="cellGroupStyle">
              <van-cell :title="student.name" :label="`${student.age}岁 | ${student.class}`">
                <template #icon>
                  <van-image
                    :src="student.avatar"
                    width="48"
                    height="48"
                    round
                    style="margin-right: 12px"
                  />
                </template>
                <template #value>
                  <van-tag :type="student.status === '在园' ? 'success' : 'warning'">
                    {{ student.status }}
                  </van-tag>
                </template>
              </van-cell>

              <van-cell title="家长" :value="student.parentName" />
              <van-cell title="联系电话" :value="student.phone" />

              <van-cell v-if="student.notes">
                <template #title>
                  <span>备注</span>
                </template>
                <template #value>
                  <span class="notes" :style="{ color: isDark ? '#94a3b8' : '#8492a6' }">{{ student.notes }}</span>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 悬浮操作 -->
    <van-back-top right="20" bottom="80" />
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface Student {
  id: string
  name: string
  age: number
  class: string
  status: string
  parentName: string
  phone: string
  avatar: string
  notes?: string
}

const router = useRouter()

// 主题状态
const isDark = ref(false)

const detectTheme = () => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

let observer: MutationObserver | null = null

// 样式计算
const statsContainerStyle = computed(() => ({
  background: isDark.value ? '#1e293b' : '#ffffff',
  borderColor: isDark.value ? '#334155' : '#e4e7ed'
}))

const statCardStyle = computed(() => ({
  background: isDark.value ? '#0f172a' : '#f7f8fa',
  borderColor: isDark.value ? '#334155' : '#e4e7ed'
}))

const listStyle = computed(() => ({
  background: isDark.value ? '#0f172a' : '#f7f8fa',
  minHeight: '200px'
}))

const cellGroupStyle = computed(() => ({
  background: isDark.value ? '#1e293b' : '#ffffff',
  marginBottom: '12px'
}))

const searchQuery = ref('')
const classFilter = ref('all')
const loading = ref(false)
const refreshing = ref(false)

const studentStats = ref({
  total: 342,
  active: 320
})

const students = ref<Student[]>([
  {
    id: '1',
    name: '张小明',
    age: 6,
    class: '大班A',
    status: '在园',
    parentName: '张先生',
    phone: '138****8888',
    avatar: 'https://via.placeholder.com/48',
    notes: '活泼好动，喜欢画画'
  },
  {
    id: '2',
    name: '李小红',
    age: 5,
    class: '中班B',
    status: '在园',
    parentName: '李女士',
    phone: '139****9999',
    avatar: 'https://via.placeholder.com/48'
  },
  {
    id: '3',
    name: '王小刚',
    age: 4,
    class: '小班C',
    status: '请假',
    parentName: '王先生',
    phone: '137****7777',
    avatar: 'https://via.placeholder.com/48'
  }
])

const classOptions = [
  { text: '全部班级', value: 'all' },
  { text: '大班A', value: '大班A' },
  { text: '中班B', value: '中班B' },
  { text: '小班C', value: '小班C' }
]

const filteredStudents = computed(() => {
  let result = students.value

  if (searchQuery.value) {
    result = result.filter(student =>
      student.name.includes(searchQuery.value)
    )
  }

  if (classFilter.value !== 'all') {
    result = result.filter(student => student.class === classFilter.value)
  }

  return result
})

const handleSearch = (query: string) => {
  console.log('Search:', query)
}

const handleClassFilter = (value: string) => {
  console.log('Class filter:', value)
}

const handleStudentClick = (student: Student) => {
  router.push(`/mobile/centers/student-center/detail?id=${student.id}`)
}

const handleRefresh = () => {
  loadStudents()
}

const loadStudents = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 加载数据
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => {
  detectTheme()
  observer = new MutationObserver(detectTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  loadStudents()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


.stats-container {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid;

  .stat-card {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid;

    .stat-info {
      margin-left: 12px;

      .stat-value {
        font-size: 20px;
        font-weight: bold;
      }

      .stat-label {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
}

.student-list {
  border-radius: 8px;
  overflow: hidden;
}

.student-card {
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.8;
  }
}

.notes {
  font-size: 12px;
}

:deep(.van-search__content) {
  border-radius: 20px;
}

:deep(.van-cell) {
  .theme-dark & {
    background: #1e293b !important;
    
    .van-cell__title, .van-cell__value {
      color: #f1f5f9 !important;
    }
    
    .van-cell__label {
      color: #94a3b8 !important;
    }
  }
}
</style>
