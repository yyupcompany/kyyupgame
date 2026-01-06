<template>
  <MobileMainLayout
    title="学生管理"
    :show-back="true"
  >
    <!-- 搜索 -->
    <van-search
      v-model="searchQuery"
      placeholder="搜索学生姓名"
      @search="handleSearch"
    />

    <!-- 统计 -->
    <div class="stats-container">
      <div class="stat-card">
        <van-icon name="contact" size="32" color="#409eff" />
        <div class="stat-info">
          <div class="stat-value">{{ studentStats.total }}</div>
          <div class="stat-label">学生总数</div>
        </div>
      </div>
      <div class="stat-card">
        <van-icon name="star-o" size="32" color="#ff976a" />
        <div class="stat-info">
          <div class="stat-value">{{ studentStats.active }}</div>
          <div class="stat-label">在园学生</div>
        </div>
      </div>
    </div>

    <!-- 班级筛选 -->
    <van-dropdown-menu>
      <van-dropdown-item v-model="classFilter" :options="classOptions" @change="handleClassFilter" />
    </van-dropdown-menu>

    <!-- 学生列表 -->
    <MobileList
      :items="filteredStudents"
      :loading="loading"
      clickable
      @item-click="handleStudentClick"
      @refresh="handleRefresh"
    >
      <template #item="{ item }">
        <van-cell-group inset>
          <van-cell :title="item.name" :label="`${item.age}岁 | ${item.class}`">
            <template #icon>
              <van-image
                :src="item.avatar"
                width="48"
                height="48"
                round
              />
            </template>
            <template #value>
              <van-tag :type="item.status === '在园' ? 'success' : 'warning'">
                {{ item.status }}
              </van-tag>
            </template>
          </van-cell>

          <van-cell title="家长" :value="item.parentName" />
          <van-cell title="联系电话" :value="item.phone" />

          <van-cell v-if="item.notes">
            <template #title>
              <span>备注</span>
            </template>
            <template #value>
              <span class="notes">{{ item.notes }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </template>
    </MobileList>

    <!-- 悬浮操作 -->
    <van-back-top right="20" bottom="80" />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { useRouter } from 'vue-router'
import MobilePage from '@/pages/mobile/components/common/MobilePage.vue'
import MobileList from '@/pages/mobile/components/common/MobileList.vue'
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

const searchQuery = ref('')
const classFilter = ref('all')
const loading = ref(false)

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
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.stats-container {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-color);
  margin-bottom: 12px;

  .stat-card {
    flex: 1;
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    background-color: var(--app-bg-color);
    border-radius: 8px;

    .stat-info {
      margin-left: 12px;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }
  }
}

.notes {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

:deep(.van-search) {
  margin-bottom: 12px;
}

:deep(.van-dropdown-menu) {
  margin-bottom: 12px;
}
</style>
