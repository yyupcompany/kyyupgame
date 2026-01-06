<template>
  <div class="mobile-student-management">
    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <van-search
        v-model="filterForm.keyword"
        placeholder="搜索学生姓名"
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

    <!-- 学生列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-card"
          @click="handleViewStudent(student)"
        >
          <div class="card-header">
            <div class="student-avatar">
              <van-image
                :src="student.avatar"
                width="50"
                height="50"
                round
                fit="cover"
              >
                <template #error>
                  <van-icon name="user-circle-o" size="50" color="#ccc" />
                </template>
              </van-image>
            </div>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-meta">
                <van-tag
                  :type="student.gender === '男' ? 'primary' : 'danger'"
                  size="small"
                >
                  {{ student.gender }}
                </van-tag>
                <span class="student-age">{{ student.age }}岁</span>
                <span class="student-class">{{ student.className }}</span>
              </div>
            </div>
            <div class="card-more">
              <van-icon name="arrow" color="#969799" />
            </div>
          </div>

          <div class="card-stats">
            <div class="stat-item">
              <div class="stat-value">{{ student.attendance }}%</div>
              <div class="stat-label">出勤率</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-value" :class="getPerformanceClass(student.performance)">
                {{ student.performance }}
              </div>
              <div class="stat-label">表现</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <van-button
                size="mini"
                type="primary"
                plain
                @click.stop="showActionSheet(student)"
              >
                更多
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="filteredStudents.length === 0 && !loading"
      description="暂无学生数据"
      image="search"
    />

    <!-- 筛选弹窗 -->
    <van-action-sheet
      v-model:show="showFilterSheet"
      title="筛选条件"
      :closeable="true"
    >
      <div class="filter-content">
        <van-field name="classId" label="班级">
          <template #input>
            <van-radio-group v-model="filterForm.classId" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="1">大班A</van-radio>
              <van-radio name="2">中班B</van-radio>
              <van-radio name="3">小班C</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field name="gender" label="性别">
          <template #input>
            <van-radio-group v-model="filterForm.gender" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="男">男</van-radio>
              <van-radio name="女">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <div class="filter-actions">
          <van-button block @click="handleResetFilter">重置</van-button>
          <van-button block type="primary" @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-action-sheet>

    <!-- 操作弹窗 -->
    <van-action-sheet
      v-model:show="showActionSheetVisible"
      :actions="actionSheetActions"
      @select="handleActionSelect"
      cancel-text="取消"
      close-on-click-action
    />

    <!-- 学生详情弹窗 -->
    <van-popup
      v-model:show="studentDetailVisible"
      position="bottom"
      :style="{ height: '85%' }"
      round
    >
      <div v-if="currentStudent" class="student-detail">
        <div class="detail-header">
          <div class="detail-avatar">
            <van-image
              :src="currentStudent.avatar"
              width="80"
              height="80"
              round
              fit="cover"
            >
              <template #error>
                <van-icon name="user-circle-o" size="80" color="#ccc" />
              </template>
            </van-image>
          </div>
          <div class="detail-info">
            <div class="detail-name">{{ currentStudent.name }}</div>
            <div class="detail-meta">
              <van-tag
                :type="currentStudent.gender === '男' ? 'primary' : 'danger'"
                size="small"
              >
                {{ currentStudent.gender }}
              </van-tag>
              <span>{{ currentStudent.age }}岁</span>
              <span>{{ currentStudent.className }}</span>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <van-cell-group inset title="基本信息">
            <van-cell title="学号" :value="currentStudent.studentId || '未分配'" />
            <van-cell title="入学日期" :value="formatDate(currentStudent.enrollmentDate)" />
            <van-cell title="出勤率" :value="`${currentStudent.attendance}%`" />
            <van-cell title="学习表现">
              <template #value>
                <van-tag
                  :type="getPerformanceType(currentStudent.performance)"
                  size="small"
                >
                  {{ currentStudent.performance }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>

          <van-cell-group inset title="家长信息">
            <van-cell title="家长姓名" :value="currentStudent.parentName || '未填写'" />
            <van-cell title="联系电话" :value="currentStudent.parentPhone || '未填写'" />
            <van-cell title="家庭地址" :value="currentStudent.address || '未填写'" />
          </van-cell-group>

          <van-cell-group inset title="备注信息">
            <van-cell title="备注" :value="currentStudent.notes || '无'" />
          </van-cell-group>

          <van-cell-group inset title="最近表现记录">
            <div v-if="currentStudent.performanceRecords && currentStudent.performanceRecords.length > 0">
              <div
                v-for="record in currentStudent.performanceRecords"
                :key="record.id"
                class="performance-record"
              >
                <div class="record-header">
                  <span class="record-date">{{ formatDate(record.date) }}</span>
                  <van-tag
                    :type="getPerformanceType(record.level)"
                    size="small"
                  >
                    {{ record.level }}
                  </van-tag>
                </div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </div>
            <van-empty
              v-else
              description="暂无表现记录"
              :image-size="60"
            />
          </van-cell-group>
        </div>

        <div class="detail-footer">
          <van-button block @click="studentDetailVisible = false">关闭</van-button>
          <van-button block type="primary" @click="handleEditStudent(currentStudent)">
            编辑信息
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface Student {
  id: number
  name: string
  className: string
  age: number
  gender: '男' | '女'
  attendance: number
  performance: '优秀' | '良好' | '一般' | '需改进'
  avatar?: string
  studentId?: string
  enrollmentDate?: string
  parentName?: string
  parentPhone?: string
  address?: string
  notes?: string
  performanceRecords?: Array<{
    id: number
    date: string
    content: string
    level: '优秀' | '良好' | '一般' | '需改进'
  }>
}

interface Props {
  students?: Student[]
}

interface Emits {
  (e: 'view-student', student: Student): void
  (e: 'edit-student', student: Student): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  students: () => []
})

const emit = defineEmits<Emits>()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const showFilterSheet = ref(false)
const showActionSheetVisible = ref(false)
const studentDetailVisible = ref(false)
const currentStudent = ref<Student | null>(null)
const selectedStudent = ref<Student | null>(null)

const filterForm = reactive({
  classId: '',
  gender: '',
  keyword: ''
})

// 操作按钮配置
const actionSheetActions = [
  { name: '考勤记录', value: 'attendance' },
  { name: '学习表现', value: 'performance' },
  { name: '联系家长', value: 'contact' },
  { name: '添加备注', value: 'note' }
]

// 模拟数据
const mockStudents: Student[] = [
  {
    id: 1,
    name: '张小明',
    className: '大班A班',
    age: 6,
    gender: '男',
    attendance: 95,
    performance: '优秀',
    avatar: 'https://picsum.photos/seed/student1/100/100.jpg',
    studentId: '202401001',
    enrollmentDate: '2024-09-01',
    parentName: '张爸爸',
    parentPhone: '13800138001',
    address: '北京市朝阳区XXX街道',
    notes: '性格活泼，喜欢参与集体活动',
    performanceRecords: [
      {
        id: 1,
        date: '2024-01-15',
        content: '在数学活动中表现积极，能够快速完成练习',
        level: '优秀'
      },
      {
        id: 2,
        date: '2024-01-14',
        content: '音乐律动活动中配合很好，节奏感强',
        level: '良好'
      }
    ]
  },
  {
    id: 2,
    name: '李小红',
    className: '大班A班',
    age: 5,
    gender: '女',
    attendance: 98,
    performance: '良好',
    avatar: 'https://picsum.photos/seed/student2/100/100.jpg',
    studentId: '202401002',
    enrollmentDate: '2024-09-01',
    parentName: '李妈妈',
    parentPhone: '13800138002'
  },
  {
    id: 3,
    name: '王小刚',
    className: '中班B班',
    age: 5,
    gender: '男',
    attendance: 88,
    performance: '一般',
    avatar: 'https://picsum.photos/seed/student3/100/100.jpg',
    studentId: '202401003',
    enrollmentDate: '2024-09-01'
  },
  {
    id: 4,
    name: '赵小美',
    className: '小班C班',
    age: 4,
    gender: '女',
    attendance: 92,
    performance: '良好',
    studentId: '202401004',
    enrollmentDate: '2024-09-01'
  }
]

const students = ref<Student[]>(props.students.length > 0 ? props.students : mockStudents)

// 计算属性
const filteredStudents = computed(() => {
  let result = students.value

  if (filterForm.classId) {
    const classNameMap = {
      '1': '大班A班',
      '2': '中班B班',
      '3': '小班C班'
    }
    result = result.filter(student => student.className === classNameMap[filterForm.classId])
  }

  if (filterForm.gender) {
    result = result.filter(student => student.gender === filterForm.gender)
  }

  if (filterForm.keyword) {
    result = result.filter(student =>
      student.name.toLowerCase().includes(filterForm.keyword.toLowerCase())
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
    classId: '',
    gender: '',
    keyword: ''
  })
  showFilterSheet.value = false
  showSuccessToast('筛选已重置')
}

const handleViewStudent = (student: Student) => {
  currentStudent.value = student
  studentDetailVisible.value = true
  emit('view-student', student)
}

const handleEditStudent = (student: Student) => {
  emit('edit-student', student)
  studentDetailVisible.value = false
}

const showActionSheet = (student: Student) => {
  selectedStudent.value = student
  showActionSheetVisible.value = true
}

const handleActionSelect = (action: any) => {
  const student = selectedStudent.value
  if (!student) return

  switch (action.value) {
    case 'attendance':
      showToast(`查看${student.name}的考勤记录`)
      break
    case 'performance':
      showToast(`查看${student.name}的学习表现`)
      break
    case 'contact':
      showToast(`联系${student.name}的家长`)
      break
    case 'note':
      showToast(`为${student.name}添加备注`)
      break
  }
}

// 工具方法
const getPerformanceClass = (performance: string) => {
  const classMap = {
    '优秀': 'excellent',
    '良好': 'good',
    '一般': 'average',
    '需改进': 'poor'
  }
  return classMap[performance] || 'average'
}

const getPerformanceType = (performance: string) => {
  const typeMap = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '需改进': 'danger'
  }
  return typeMap[performance] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  console.log('StudentManagement组件已挂载')
})
</script>

<style lang="scss" scoped>
.mobile-student-management {
  min-height: 100vh;
  background-color: var(--van-background-color);
  padding: var(--spacing-md);

  .filter-section {
    margin-bottom: var(--spacing-md);
  }

  .student-card {
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
      align-items: center;
      margin-bottom: var(--spacing-md);

      .student-avatar {
        margin-right: var(--spacing-md);
      }

      .student-info {
        flex: 1;

        .student-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: var(--spacing-xs);
        }

        .student-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);

          .student-age,
          .student-class {
            color: var(--van-text-color-2);
          }
        }
      }

      .card-more {
        margin-left: var(--spacing-sm);
      }
    }

    .card-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--van-border-color);

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .stat-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: var(--spacing-xs);

          &.excellent {
            color: var(--van-success-color);
          }

          &.good {
            color: var(--van-primary-color);
          }

          &.average {
            color: var(--van-warning-color);
          }

          &.poor {
            color: var(--van-danger-color);
          }
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);
        }
      }

      .stat-divider {
        width: 1px;
        height: 30px;
        background-color: var(--van-border-color);
        margin: 0 var(--spacing-md);
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

.student-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .detail-avatar {
      margin-right: var(--spacing-md);
    }

    .detail-info {
      flex: 1;

      .detail-name {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--spacing-sm);
      }

      .detail-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-sm);
        opacity: 0.9;
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);

    .performance-record {
      padding: var(--spacing-sm);
      background-color: var(--van-background-color);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);

        .record-date {
          font-size: var(--font-size-sm);
          color: var(--van-text-color-2);
        }
      }

      .record-content {
        font-size: var(--font-size-base);
        color: var(--van-text-color);
        line-height: 1.5;
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
  .mobile-student-management {
    padding: var(--spacing-sm);

    .student-card {
      padding: var(--spacing-md);

      .card-header {
        .student-avatar {
          margin-right: var(--spacing-sm);
        }
      }

      .card-stats {
        .stat-item {
          .stat-value {
            font-size: var(--font-size-base);
          }
        }

        .stat-divider {
          margin: 0 var(--spacing-sm);
        }
      }
    }
  }
}
</style>