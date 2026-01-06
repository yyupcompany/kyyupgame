<template>
  <div class="student-attendance-list-tab">
    <!-- 搜索和筛选 -->
    <div class="search-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索学生姓名"
        @search="handleSearch"
      />
      <div class="filter-buttons">
        <van-button
          v-for="filter in filters"
          :key="filter.value"
          :type="selectedFilter === filter.value ? 'primary' : 'default'"
          size="small"
          plain
          @click="handleFilter(filter.value)"
        >
          {{ filter.label }}
        </van-button>
      </div>
    </div>

    <!-- 学生列表 -->
    <div class="student-list">
      <van-cell-group inset>
        <van-cell
          v-for="student in filteredStudents"
          :key="student.id"
          :title="student.name"
          :label="student.className"
          :is-link="true"
          @click="$emit('student-click', student)"
        >
          <template #icon>
            <van-avatar
              :src="student.avatar"
              :size="40"
              fit="cover"
            />
          </template>

          <template #right-icon>
            <van-tag
              :type="getStatusType(student.status)"
              size="small"
            >
              {{ getStatusText(student.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 统计信息 -->
    <div class="list-stats">
      <van-row :gutter="12">
        <van-col span="6" v-for="stat in listStats" :key="stat.type">
          <div class="stat-item">
            <div class="stat-count">{{ stat.count }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

interface Student {
  id: string
  name: string
  className: string
  status: 'present' | 'absent' | 'late' | 'leave'
  avatar: string
}

interface StatItem {
  type: string
  label: string
  count: number
}

interface Props {
  studentsList?: Student[]
  listStats?: StatItem[]
}

const props = withDefaults(defineProps<Props>(), {
  studentsList: () => [],
  listStats: () => []
})

const emit = defineEmits<{
  'student-click': [student: Student]
}>()

const searchKeyword = ref('')
const selectedFilter = ref('all')

const filters = [
  { label: '全部', value: 'all' },
  { label: '出勤', value: 'present' },
  { label: '缺勤', value: 'absent' },
  { label: '迟到', value: 'late' },
  { label: '请假', value: 'leave' }
]

const filteredStudents = computed(() => {
  let students = props.studentsList

  // 搜索过滤
  if (searchKeyword.value) {
    students = students.filter(student =>
      student.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 状态过滤
  if (selectedFilter.value !== 'all') {
    students = students.filter(student => student.status === selectedFilter.value)
  }

  return students
})

const handleSearch = (value: string) => {
  searchKeyword.value = value
}

const handleFilter = (filterValue: string) => {
  selectedFilter.value = filterValue
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'present': 'success',
    'absent': 'danger',
    'late': 'warning',
    'leave': 'primary'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    'present': '出勤',
    'absent': '缺勤',
    'late': '迟到',
    'leave': '请假'
  }
  return textMap[status] || status
}
</script>

<style lang="scss" scoped>
.student-attendance-list-tab {
  padding: var(--van-padding-sm);

  .search-section {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);

    .filter-buttons {
      display: flex;
      gap: var(--van-padding-xs);
      margin-top: var(--van-padding-sm);
      overflow-x: auto;
    }
  }

  .student-list {
    margin-bottom: var(--van-padding-md);
  }

  .list-stats {
    background: white;
    border-radius: var(--van-border-radius-lg);
    padding: var(--van-padding-md);

    .stat-item {
      text-align: center;

      .stat-count {
        font-size: var(--van-font-size-lg);
        font-weight: var(--van-font-weight-bold);
        color: var(--van-primary-color);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);
      }
    }
  }
}
</style>