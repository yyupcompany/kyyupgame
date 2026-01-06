<template>
  <div class="mobile-class-management">
    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <van-search
        v-model="filterForm.keyword"
        placeholder="搜索班级名称"
        @search="handleFilter"
        @clear="handleClearSearch"
        show-action
      >
        <template #action>
          <van-button
            size="small"
            @click="showFilterSheet = true"
          >
            筛选
          </van-button>
        </template>
      </van-search>
    </div>

    <!-- 班级列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="classItem in filteredClasses"
          :key="classItem.id"
          class="class-card"
          @click="handleViewClass(classItem)"
        >
          <div class="card-header">
            <div class="class-title">{{ classItem.name }}</div>
            <van-tag
              :type="getGradeTagType(classItem.grade)"
              size="small"
            >
              {{ classItem.grade }}
            </van-tag>
          </div>

          <div class="card-content">
            <div class="info-row">
              <van-icon name="friends-o" size="16" />
              <span>{{ classItem.studentCount }}名学生</span>
            </div>
            <div class="info-row">
              <van-icon name="location-o" size="16" />
              <span>{{ classItem.classroom }}</span>
            </div>
            <div class="info-row">
              <van-icon name="clock-o" size="16" />
              <span>{{ classItem.schedule }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">教学进度</span>
              <span class="progress-value">{{ classItem.progress || 0 }}%</span>
            </div>
            <van-progress
              :percentage="classItem.progress || 0"
              stroke-width="6"
              :show-pivot="false"
              color="#409EFF"
            />
          </div>

          <div class="card-actions">
            <van-button
              size="small"
              type="primary"
              plain
              @click.stop="handleViewStudents(classItem)"
            >
              <van-icon name="friends-o" size="14" />
              学生列表
            </van-button>
            <van-dropdown-menu @click.stop>
              <van-dropdown-item
                :model-value="null"
                :options="[
                  { text: '课程表', value: 'schedule' },
                  { text: '教学进度', value: 'progress' },
                  { text: '教学记录', value: 'records' },
                  { text: '考勤统计', value: 'attendance' }
                ]"
                @change="(value) => handleDropdownCommand(value, classItem)"
              />
            </van-dropdown-menu>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="filteredClasses.length === 0 && !loading"
      description="暂无班级数据"
      image="search"
    />

    <!-- 筛选弹窗 -->
    <van-action-sheet
      v-model:show="showFilterSheet"
      title="筛选条件"
      :closeable="true"
    >
      <div class="filter-content">
        <van-field name="grade" label="年级">
          <template #input>
            <van-radio-group v-model="filterForm.grade" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="小班">小班</van-radio>
              <van-radio name="中班">中班</van-radio>
              <van-radio name="大班">大班</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <div class="filter-actions">
          <van-button block @click="handleResetFilter">重置</van-button>
          <van-button block type="primary" @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-action-sheet>

    <!-- 班级详情弹窗 -->
    <van-popup
      v-model:show="classDetailVisible"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div v-if="currentClass" class="class-detail">
        <div class="detail-header">
          <div class="detail-title">{{ currentClass.name }}</div>
          <van-button
            icon="cross"
            size="small"
            @click="classDetailVisible = false"
          />
        </div>

        <div class="detail-content">
          <van-cell-group inset title="班级信息">
            <van-cell title="年级" :value="currentClass.grade" />
            <van-cell title="学生人数" :value="`${currentClass.studentCount}名`" />
            <van-cell title="教室" :value="currentClass.classroom" />
            <van-cell title="上课时间" :value="currentClass.schedule" />
            <van-cell title="班主任" :value="currentClass.headTeacher || '未分配'" />
            <van-cell title="副班主任" :value="currentClass.assistantTeacher || '未分配'" />
          </van-cell-group>

          <van-cell-group inset title="最近教学记录">
            <div v-if="currentClass.recentRecords && currentClass.recentRecords.length > 0">
              <div
                v-for="record in currentClass.recentRecords"
                :key="record.id"
                class="record-item"
              >
                <div class="record-date">{{ formatDate(record.date) }}</div>
                <div class="record-content">{{ record.content }}</div>
                <div class="record-attendance">出勤: {{ record.attendance }}人</div>
              </div>
            </div>
            <van-empty
              v-else
              description="暂无教学记录"
              :image-size="60"
            />
          </van-cell-group>
        </div>

        <div class="detail-footer">
          <van-button block @click="classDetailVisible = false">关闭</van-button>
          <van-button block type="primary" @click="handleEditClass(currentClass)">
            编辑班级
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface ClassItem {
  id: number
  name: string
  grade: string
  studentCount: number
  classroom: string
  schedule: string
  progress?: number
  headTeacher?: string
  assistantTeacher?: string
  recentRecords?: Array<{
    id: number
    date: string
    content: string
    attendance: number
  }>
}

interface Props {
  classes?: ClassItem[]
}

interface Emits {
  (e: 'view-class', classItem: ClassItem): void
  (e: 'edit-class', classItem: ClassItem): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  classes: () => []
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showFilterSheet = ref(false)
const classDetailVisible = ref(false)
const currentClass = ref<ClassItem | null>(null)

const filterForm = reactive({
  grade: '',
  keyword: ''
})

// 模拟数据
const mockClasses: ClassItem[] = [
  {
    id: 1,
    name: '小班A班',
    grade: '小班',
    studentCount: 25,
    classroom: '教室101',
    schedule: '周一至周五 8:30-16:30',
    progress: 65,
    headTeacher: '张老师',
    assistantTeacher: '李老师',
    recentRecords: [
      {
        id: 1,
        date: '2024-01-15',
        content: '学习数字1-10的认读',
        attendance: 24
      },
      {
        id: 2,
        date: '2024-01-14',
        content: '音乐律动活动',
        attendance: 25
      }
    ]
  },
  {
    id: 2,
    name: '中班B班',
    grade: '中班',
    studentCount: 30,
    classroom: '教室102',
    schedule: '周一至周五 8:30-16:30',
    progress: 78,
    headTeacher: '王老师',
    assistantTeacher: '赵老师'
  },
  {
    id: 3,
    name: '大班C班',
    grade: '大班',
    studentCount: 28,
    classroom: '教室103',
    schedule: '周一至周五 8:30-16:30',
    progress: 92,
    headTeacher: '刘老师'
  }
]

const classes = ref<ClassItem[]>(props.classes.length > 0 ? props.classes : mockClasses)

// 计算属性
const filteredClasses = computed(() => {
  let result = classes.value

  if (filterForm.grade) {
    result = result.filter(item => item.grade === filterForm.grade)
  }

  if (filterForm.keyword) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(filterForm.keyword.toLowerCase())
    )
  }

  return result
})

// 方法
const onLoad = () => {
  // 模拟异步加载
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const onRefresh = () => {
  refreshing.value = true
  // 模拟刷新
  setTimeout(() => {
    refreshing.value = false
    emit('refresh')
    showSuccessToast('刷新成功')
  }, 1000)
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
  showToast('搜索完成')
}

const handleClearSearch = () => {
  filterForm.keyword = ''
}

const applyFilter = () => {
  showFilterSheet.value = false
  showSuccessToast('筛选已应用')
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    grade: '',
    keyword: ''
  })
  showFilterSheet.value = false
  showSuccessToast('筛选已重置')
}

const handleViewClass = (classItem: ClassItem) => {
  currentClass.value = classItem
  classDetailVisible.value = true
  emit('view-class', classItem)
}

const handleEditClass = (classItem: ClassItem) => {
  emit('edit-class', classItem)
  classDetailVisible.value = false
}

const handleViewStudents = (classItem: ClassItem) => {
  showToast(`查看${classItem.name}的学生列表`)
  // 这里可以跳转到学生列表页面
}

const handleDropdownCommand = (command: string, classItem: ClassItem) => {
  switch (command) {
    case 'schedule':
      showToast(`查看${classItem.name}的课程表`)
      break
    case 'progress':
      showToast(`查看${classItem.name}的教学进度`)
      break
    case 'records':
      showToast(`查看${classItem.name}的教学记录`)
      break
    case 'attendance':
      showToast(`查看${classItem.name}的考勤统计`)
      break
  }
}

// 工具方法
const getGradeTagType = (grade: string) => {
  const typeMap = {
    '小班': 'success',
    '中班': 'warning',
    '大班': 'danger'
  }
  return typeMap[grade] || 'primary'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  console.log('ClassManagement组件已挂载')
})
</script>

<style lang="scss" scoped>
.mobile-class-management {
  min-height: 100vh;
  background-color: var(--van-background-color);
  padding: var(--spacing-md);

  .filter-section {
    margin-bottom: var(--spacing-md);
  }

  .class-card {
    background: white;
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      .class-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--van-text-color);
        flex: 1;
        margin-right: var(--spacing-sm);
      }
    }

    .card-content {
      margin-bottom: var(--spacing-md);

      .info-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-sm);
        color: var(--van-text-color-2);

        &:last-child {
          margin-bottom: 0;
        }

        .van-icon {
          color: var(--van-text-color-3);
        }
      }
    }

    .progress-section {
      margin-bottom: var(--spacing-md);

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);

        .progress-label {
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);
        }

        .progress-value {
          font-size: var(--font-size-sm);
          color: var(--van-primary-color);
          font-weight: var(--font-weight-bold);
        }
      }
    }

    .card-actions {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;

      .van-button {
        flex: 1;
      }

      .van-dropdown-menu {
        flex-shrink: 0;
      }
    }
  }
}

.filter-content {
  padding: var(--spacing-lg);

  .filter-actions {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);

    .van-button {
      flex: 1;
    }
  }
}

.class-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--van-border-color);

    .detail-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--van-text-color);
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);

    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      background-color: var(--van-background-color);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);

      .record-date {
        font-size: var(--font-size-sm);
        color: var(--van-text-color-2);
      }

      .record-content {
        flex: 1;
        margin: 0 var(--spacing-md);
        font-size: var(--font-size-base);
        color: var(--van-text-color);
        text-align: center;
      }

      .record-attendance {
        font-size: var(--font-size-sm);
        color: var(--van-text-color-2);
      }
    }
  }

  .detail-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--van-border-color);

    .van-button {
      flex: 1;
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .mobile-class-management {
    padding: var(--spacing-sm);

    .class-card {
      padding: var(--spacing-md);

      .card-actions {
        flex-direction: column;

        .van-button {
          width: 100%;
        }

        .van-dropdown-menu {
          width: 100%;
        }
      }
    }
  }
}
</style>