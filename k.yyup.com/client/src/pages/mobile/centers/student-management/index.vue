<template>
  <MobileCenterLayout title="学生管理" back-path="/mobile/centers">
    <!-- 统计卡片 -->
    <div class="stats-container">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <div class="stat-item">
            <van-icon name="contact" size="32" color="#409eff" />
            <div class="stat-info">
              <div class="stat-value">{{ studentStats.total }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <van-icon name="star-o" size="32" color="#ff976a" />
            <div class="stat-info">
              <div class="stat-value">{{ studentStats.active }}</div>
              <div class="stat-label">在园学生</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <van-icon name="friends-o" size="32" color="#07c160" />
            <div class="stat-info">
              <div class="stat-value">{{ studentStats.assigned }}</div>
              <div class="stat-label">已分班</div>
            </div>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="stat-item">
            <van-icon name="user-circle-o" size="32" color="#f56c6c" />
            <div class="stat-info">
              <div class="stat-value">{{ studentStats.unassigned }}</div>
              <div class="stat-label">未分班</div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter-container">
      <van-search
        v-model="searchForm.keyword"
        placeholder="搜索学生姓名或学号"
        @search="handleSearch"
        @clear="handleClear"
      />

      <van-dropdown-menu>
        <van-dropdown-item
          v-model="searchForm.classId"
          :options="classOptions"
          title="班级"
          @change="handleFilter"
        />
        <van-dropdown-item
          v-model="searchForm.gender"
          :options="genderOptions"
          title="性别"
          @change="handleFilter"
        />
        <van-dropdown-item
          v-model="searchForm.status"
          :options="statusOptions"
          title="状态"
          @change="handleFilter"
        />
      </van-dropdown-menu>
    </div>

    <!-- 学生列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="student-list">
          <van-card
            v-for="student in studentList"
            :key="student.id"
            :title="student.name"
            :desc="student.studentNo"
            :thumb="student.avatar || '/default-avatar.png'"
            @click="viewStudentDetail(student)"
          >
            <template #tags>
              <van-tag
                :type="getGenderTagType(student.gender)"
                size="medium"
              >
                {{ student.gender === 'MALE' ? '男' : '女' }}
              </van-tag>
              <van-tag
                :type="getStatusTagType(student.status)"
                size="medium"
              >
                {{ getStatusText(student.status) }}
              </van-tag>
              <van-tag
                v-if="student.className"
                type="primary"
                size="medium"
              >
                {{ student.className }}
              </van-tag>
            </template>

            <template #price>
              <div class="student-info">
                <div class="info-item">
                  <van-icon name="birthday-cake-o" size="14" />
                  <span>{{ calculateAge(student.birthDate) }}岁</span>
                </div>
                <div class="info-item" v-if="student.guardian?.name">
                  <van-icon name="friends" size="14" />
                  <span>{{ student.guardian.name }}</span>
                </div>
                <div class="info-item" v-if="student.guardian?.phone">
                  <van-icon name="phone-o" size="14" />
                  <span>{{ formatPhone(student.guardian.phone) }}</span>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="action-buttons">
                <van-button
                  size="medium"
                  type="primary"
                  @click.stop="editStudent(student)"
                >
                  编辑
                </van-button>
                <van-button
                  size="medium"
                  type="success"
                  @click.stop="viewGrades(student)"
                >
                  成绩
                </van-button>
                <van-button
                  size="medium"
                  type="info"
                  @click.stop="viewAttendance(student)"
                >
                  考勤
                </van-button>
                <van-dropdown-menu direction="up">
                  <van-dropdown-item>
                    <div class="dropdown-actions">
                      <div @click.stop="transferClass(student)">转班</div>
                      <div @click.stop="deleteStudent(student)" class="danger">删除</div>
                    </div>
                  </van-dropdown-item>
                </van-dropdown-menu>
              </div>
            </template>
          </van-card>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 悬浮添加按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      @click="createStudent"
    />

    <!-- 学生编辑弹窗 -->
    <StudentEditDialog
      v-model:show="showEditDialog"
      :student="editingStudent"
      :class-list="classList"
      @save="handleSaveStudent"
    />

    <!-- 转班弹窗 -->
    <TransferClassDialog
      v-model:show="showTransferDialog"
      :student="transferringStudent"
      :class-list="classList"
      @confirm="handleTransferClass"
    />
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import StudentEditDialog from './components/StudentEditDialog.vue'
import TransferClassDialog from './components/TransferClassDialog.vue'
import { studentApi } from '@/api/modules/student'
import { classApi } from '@/api/modules/class'
import type { Student, StudentQueryParams } from '@/api/modules/student'
import type { Class } from '@/api/modules/class'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const studentList = ref<Student[]>([])
const classList = ref<Class[]>([])
const showEditDialog = ref(false)
const showTransferDialog = ref(false)
const editingStudent = ref<Student | null>(null)
const transferringStudent = ref<Student | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive<StudentQueryParams>({
  keyword: '',
  classId: '',
  gender: '',
  status: ''
})

// 学生统计数据
const studentStats = ref({
  total: 0,
  active: 0,
  assigned: 0,
  unassigned: 0
})

// 筛选选项
const classOptions = computed(() => [
  { text: '全部班级', value: '' },
  ...classList.value.map(cls => ({ text: cls.name, value: cls.id }))
])

const genderOptions = [
  { text: '全部性别', value: '' },
  { text: '男', value: 'MALE' },
  { text: '女', value: 'FEMALE' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '在读', value: 'ACTIVE' },
  { text: '毕业', value: 'GRADUATED' },
  { text: '转校', value: 'TRANSFERRED' },
  { text: '休学', value: 'SUSPENDED' }
]

// 加载学生列表
const loadStudents = async (reset = false) => {
  if (reset) {
    pagination.page = 1
    finished.value = false
    studentList.value = []
  }

  if (finished.value) return

  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    const response = await studentApi.getStudents(params)

    if (response.success) {
      const newStudents = response.data.list || []

      if (reset) {
        studentList.value = newStudents
      } else {
        studentList.value.push(...newStudents)
      }

      pagination.total = response.data.total
      pagination.page++

      if (studentList.value.length >= pagination.total) {
        finished.value = true
      }
    } else {
      showToast(response.message || '加载学生列表失败')
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
    showToast('加载学生列表失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载班级列表
const loadClasses = async () => {
  try {
    const response = await classApi.getClasses({ pageSize: 100 })
    if (response.success) {
      classList.value = response.data.list || []
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await studentApi.getStudentStats()
    if (response.success) {
      studentStats.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 事件处理
const onLoad = () => loadStudents()
const onRefresh = () => {
  refreshing.value = true
  loadStudents(true)
}

const handleSearch = () => {
  loadStudents(true)
}

const handleClear = () => {
  searchForm.keyword = ''
  loadStudents(true)
}

const handleFilter = () => {
  loadStudents(true)
}

// 学生操作
const viewStudentDetail = (student: Student) => {
  router.push(`/mobile/student/detail/${student.id}`)
}

const createStudent = () => {
  editingStudent.value = null
  showEditDialog.value = true
}

const editStudent = (student: Student) => {
  editingStudent.value = { ...student }
  showEditDialog.value = true
}

const handleSaveStudent = async (studentData: any) => {
  try {
    if (editingStudent.value) {
      await studentApi.updateStudent(editingStudent.value.id, studentData)
      showToast('更新成功')
    } else {
      await studentApi.createStudent(studentData)
      showToast('创建成功')
    }

    showEditDialog.value = false
    loadStudents(true)
    loadStats()
  } catch (error) {
    console.error('保存学生失败:', error)
    showToast('保存失败')
  }
}

const deleteStudent = async (student: Student) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除学生 ${student.name} 吗？`,
    })

    await studentApi.deleteStudent(student.id)
    showToast('删除成功')
    loadStudents(true)
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      showToast('删除失败')
    }
  }
}

const transferClass = (student: Student) => {
  transferringStudent.value = student
  showTransferDialog.value = true
}

const handleTransferClass = async (transferData: { classId: string }) => {
  try {
    await studentApi.transferClass(transferringStudent.value!.id, transferData.classId)
    showToast('转班成功')
    showTransferDialog.value = false
    loadStudents(true)
    loadStats()
  } catch (error) {
    console.error('转班失败:', error)
    showToast('转班失败')
  }
}

const viewGrades = (student: Student) => {
  router.push(`/mobile/student/grades/${student.id}`)
}

const viewAttendance = (student: Student) => {
  router.push(`/mobile/student/attendance/${student.id}`)
}

// 工具函数
const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getGenderTagType = (gender: string): TagType => {
  return gender === 'MALE' ? 'primary' : 'danger'
}

const getStatusTagType = (status: string): TagType => {
  const statusMap: Record<string, TagType> = {
    ACTIVE: 'success',
    GRADUATED: 'default',
    TRANSFERRED: 'warning',
    SUSPENDED: 'danger'
  }
  return statusMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    ACTIVE: '在读',
    GRADUATED: '毕业',
    TRANSFERRED: '转校',
    SUSPENDED: '休学'
  }
  return statusMap[status] || status
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadClasses()
  ])
  loadStudents(true)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';

.stats-container {
  margin-bottom: 16px;
  background: var(--van-background-color-light);

  .stat-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);

    .stat-info {
      margin-left: 12px;
      text-align: left;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: var(--van-text-color);
      }

      .stat-label {
        font-size: var(--text-xs);
        color: var(--van-text-color-3);
        margin-top: 4px;
      }
    }
  }
}

.search-filter-container {
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--van-background-color);
}

.student-list {
  padding: 0 16px;

  .van-card {
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .student-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .info-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;

      .van-button {
        flex: 1;
      }

      .van-dropdown-menu {
        flex-shrink: 0;

        .dropdown-actions {
          padding: var(--spacing-sm) 0;

          div {
            padding: var(--spacing-sm) 16px;
            font-size: var(--text-sm);

            &.danger {
              color: var(--van-danger-color);
            }

            &:hover {
              background: var(--van-background-color-light);
            }
          }
        }
      }
    }
  }
}

:deep(.van-card__thumb) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

:deep(.van-card__content) {
  padding: var(--spacing-md) 0;
}

:deep(.van-tags) {
  margin-bottom: 8px;
  gap: var(--spacing-xs);
}

:deep(.van-tag) {
  margin-right: 4px;
}
</style>