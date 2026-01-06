<template>
  <MobileMainLayout
    title="教学中心"
    :show-nav-bar="true"
    :show-back="true"
    :show-tab-bar="true"
  >
    <div class="mobile-teaching-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-info">
          <h1 class="page-title">教学中心</h1>
          <p class="page-desc">管理您的班级、学生和教学进度</p>
        </div>
        <div class="header-actions">
          <van-button
            type="primary"
            size="small"
            round
            icon="plus"
            @click="handleCreateRecord"
          >
            添加记录
          </van-button>
          <van-button
            size="small"
            round
            icon="replay"
            @click="refreshData"
          >
            刷新
          </van-button>
        </div>
      </div>

      <!-- 教学统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <div class="stat-card primary">
              <div class="stat-icon">
                <van-icon name="shop-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ teachingStats.classes }}</div>
                <div class="stat-label">负责班级</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card success">
              <div class="stat-icon">
                <van-icon name="friends-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ teachingStats.students }}</div>
                <div class="stat-label">学生总数</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card warning">
              <div class="stat-icon">
                <van-icon name="calendar-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ teachingStats.weekCourses }}</div>
                <div class="stat-label">本周课程</div>
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-card danger">
              <div class="stat-icon">
                <van-icon name="chart-trending-o" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ teachingStats.completionRate }}%</div>
                <div class="stat-label">教学完成率</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 功能快速导航 -->
      <div class="quick-actions">
        <van-grid :column-num="3" :gutter="8">
          <van-grid-item
            icon="shop-o"
            text="班级管理"
            @click="activeTab = 'classes'"
            :class="{ active: activeTab === 'classes' }"
          />
          <van-grid-item
            icon="chart-trending-o"
            text="教学进度"
            @click="activeTab = 'progress'"
            :class="{ active: activeTab === 'progress' }"
          />
          <van-grid-item
            icon="edit"
            text="教学记录"
            @click="activeTab = 'records'"
            :class="{ active: activeTab === 'records' }"
          />
          <van-grid-item
            icon="friends-o"
            text="学生管理"
            @click="activeTab = 'students'"
            :class="{ active: activeTab === 'students' }"
          />
          <van-grid-item
            icon="photo-o"
            text="媒体上传"
            @click="handleUploadMedia"
          />
          <van-grid-item
            icon="calender-o"
            text="教学日历"
            @click="showCalendar = true"
          />
        </van-grid>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 班级管理 -->
        <div v-if="activeTab === 'classes'" class="tab-content">
          <van-collapse v-model="activeNames" accordion>
            <van-collapse-item
              v-for="classInfo in classList"
              :key="classInfo.id"
              :title="classInfo.name"
              :name="classInfo.id.toString()"
            >
              <div class="class-detail">
                <div class="class-info">
                  <van-cell-group inset>
                    <van-cell title="年级" :value="classInfo.grade" />
                    <van-cell title="教室" :value="classInfo.room" />
                    <van-cell title="学生人数" :value="`${classInfo.studentCount}人`" />
                    <van-cell title="上课时间" :value="classInfo.schedule" />
                    <van-cell
                      v-if="classInfo.description"
                      title="班级描述"
                      :value="classInfo.description"
                    />
                  </van-cell-group>
                </div>
                <div class="class-actions">
                  <van-button
                    type="primary"
                    size="small"
                    round
                    @click="handleViewClass(classInfo)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    size="small"
                    round
                    @click="handleEditClass(classInfo)"
                  >
                    编辑
                  </van-button>
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>

        <!-- 教学进度 -->
        <div v-if="activeTab === 'progress'" class="tab-content">
          <van-list
            v-model:loading="progressLoading"
            :finished="progressFinished"
            finished-text="没有更多了"
            @load="loadProgressData"
          >
            <div
              v-for="progress in progressData"
              :key="progress.id"
              class="progress-card"
            >
              <div class="progress-header">
                <h4>{{ progress.className }}</h4>
                <span class="progress-rate">{{ progress.completionRate }}%</span>
              </div>
              <div class="progress-info">
                <p>{{ progress.courseName }}</p>
                <p>进度: {{ progress.completedSessions }}/{{ progress.totalSessions }}</p>
              </div>
              <van-progress
                :percentage="progress.completionRate"
                :show-pivot="false"
                stroke-width="6"
              />
              <div class="progress-actions">
                <van-button
                  type="primary"
                  size="mini"
                  round
                  @click="handleViewProgressDetails(progress)"
                >
                  查看详情
                </van-button>
                <van-button
                  size="mini"
                  round
                  @click="showUpdateProgressDialog(progress)"
                >
                  更新进度
                </van-button>
              </div>
            </div>
          </van-list>
        </div>

        <!-- 教学记录 -->
        <div v-if="activeTab === 'records'" class="tab-content">
          <div class="records-header">
            <van-button
              type="primary"
              size="small"
              round
              icon="plus"
              @click="handleCreateRecord"
            >
              新建记录
            </van-button>
            <van-field
              v-model="recordSearchText"
              placeholder="搜索记录"
              clearable
              @clear="loadRecordsList"
              @input="onRecordSearch"
            >
              <template #button>
                <van-button size="small" type="primary" @click="searchRecords">
                  搜索
                </van-button>
              </template>
            </van-field>
          </div>

          <van-list
            v-model:loading="recordsLoading"
            :finished="recordsFinished"
            finished-text="没有更多了"
            @load="loadRecordsData"
          >
            <van-card
              v-for="record in recordsList"
              :key="record.id"
              :title="`${record.className} - ${record.courseName}`"
              :desc="record.content"
              :thumb="getRecordThumb(record)"
              class="record-card"
            >
              <template #tags>
                <van-tag type="primary">{{ record.date }}</van-tag>
                <van-tag type="success">{{ record.duration }}分钟</van-tag>
              </template>
              <template #footer>
                <div class="record-actions">
                  <van-button
                    size="mini"
                    round
                    @click="handleEditRecord(record)"
                  >
                    编辑
                  </van-button>
                  <van-button
                    size="mini"
                    round
                    type="danger"
                    @click="handleDeleteRecord(record)"
                  >
                    删除
                  </van-button>
                </div>
              </template>
            </van-card>
          </van-list>
        </div>

        <!-- 学生管理 -->
        <div v-if="activeTab === 'students'" class="tab-content">
          <div class="students-header">
            <van-field
              v-model="studentSearchText"
              placeholder="搜索学生"
              clearable
              @clear="loadStudentsList"
              @input="onStudentSearch"
            >
              <template #button>
                <van-button size="small" type="primary" @click="searchStudents">
                  搜索
                </van-button>
              </template>
            </van-field>
          </div>

          <van-list
            v-model:loading="studentsLoading"
            :finished="studentsFinished"
            finished-text="没有更多了"
            @load="loadStudentsData"
          >
            <van-card
              v-for="student in studentsList"
              :key="student.id"
              :title="student.name"
              :desc="`${student.className} | ${student.age}岁 | ${student.gender}`"
              class="student-card"
            >
              <template #tags>
                <van-tag type="primary">出勤率: {{ student.attendance }}%</van-tag>
                <van-tag type="success">{{ student.performance }}</van-tag>
              </template>
              <template #footer>
                <div class="student-actions">
                  <van-button
                    size="mini"
                    round
                    @click="handleViewStudent(student)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    size="mini"
                    round
                    @click="handleEditStudent(student)"
                  >
                    编辑
                  </van-button>
                </div>
              </template>
            </van-card>
          </van-list>
        </div>
      </div>

      <!-- 媒体上传弹窗 -->
      <van-popup
        v-model:show="mediaUploadVisible"
        position="bottom"
        :style="{ height: '80%' }"
      >
        <div class="media-upload">
          <div class="upload-header">
            <h3>上传教学媒体</h3>
            <van-button size="small" @click="mediaUploadVisible = false">关闭</van-button>
          </div>
          <van-uploader
            v-model="mediaFiles"
            multiple
            :after-read="handleMediaUpload"
            :max-count="9"
          />
        </div>
      </van-popup>

      <!-- 教学记录弹窗 -->
      <van-popup
        v-model:show="recordDialogVisible"
        position="bottom"
        :style="{ height: '90%' }"
      >
        <div class="record-form">
          <div class="form-header">
            <h3>{{ currentRecord ? '编辑教学记录' : '新建教学记录' }}</h3>
            <van-button size="small" @click="recordDialogVisible = false">取消</van-button>
          </div>

          <van-form @submit="handleSaveRecord">
            <van-field
              v-model="recordForm.classId"
              name="classId"
              label="班级"
              placeholder="请选择班级"
              required
              :rules="[{ required: true, message: '请选择班级' }]"
            >
              <template #input>
                <van-picker
                  v-model="selectedClass"
                  :columns="classList.map(c => c.name)"
                  @change="onClassSelect"
                />
              </template>
            </van-field>

            <van-field
              v-model="recordForm.courseName"
              name="courseName"
              label="课程名称"
              placeholder="请输入课程名称"
              required
              :rules="[{ required: true, message: '请输入课程名称' }]"
            />

            <van-field
              v-model="recordForm.date"
              name="date"
              label="授课日期"
              type="date"
              required
              :rules="[{ required: true, message: '请选择授课日期' }]"
            />

            <van-field
              v-model="recordForm.duration"
              name="duration"
              label="授课时长(分钟)"
              type="number"
              placeholder="请输入授课时长"
              required
              :rules="[{ required: true, message: '请输入授课时长' }]"
            />

            <van-field
              v-model="recordForm.content"
              name="content"
              label="授课内容"
              type="textarea"
              rows="4"
              placeholder="请输入授课内容"
              required
              :rules="[{ required: true, message: '请输入授课内容' }]"
            />

            <van-field
              v-model="recordForm.notes"
              name="notes"
              label="备注"
              type="textarea"
              rows="2"
              placeholder="请输入备注信息"
            />

            <div class="form-actions">
              <van-button round block type="primary" native-type="submit">
                保存
              </van-button>
            </div>
          </van-form>
        </div>
      </van-popup>

      <!-- 教学日历弹窗 -->
      <van-popup
        v-model:show="showCalendar"
        position="bottom"
        :style="{ height: '80%' }"
      >
        <div class="calendar-view">
          <div class="calendar-header">
            <h3>教学日历</h3>
            <van-button size="small" @click="showCalendar = false">关闭</van-button>
          </div>
          <van-calendar
            v-model="currentDate"
            :show-confirm="false"
            :formatter="calendarFormatter"
            @select="onCalendarSelect"
          />
        </div>
      </van-popup>

      <!-- 班级详情弹窗 -->
      <ClassDetailDialog
        v-model="classDetailVisible"
        :class-data="selectedClassData"
      />

      <!-- 编辑班级弹窗 -->
      <EditClassDialog
        v-model="editClassVisible"
        :class-data="editingClassData"
        @refresh="loadClassesList"
      />

      <!-- 学生详情弹窗 -->
      <StudentDetailDialog
        v-model="studentDetailVisible"
        :student-data="selectedStudentData"
        @edit="handleEditFromDetail"
      />

      <!-- 编辑学生弹窗 -->
      <EditStudentDialog
        v-model="editStudentVisible"
        :student-data="editingStudentData"
        @refresh="loadStudentsList"
      />
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  showToast,
  showLoadingToast,
  closeToast,
  showConfirmDialog,
  showSuccessToast
} from 'vant'
import {
  teacherTeachingApi,
  type TeachingStats,
  type ClassInfo,
  type ProgressInfo,
  type TeachingRecord,
  type StudentInfo,
  type CreateRecordData
} from '@/api/modules/teacher-teaching'
import MobileMainLayout from "@/components/mobile/layouts/MobileMainLayout.vue"
import ClassDetailDialog from "./components/ClassDetailDialog.vue"
import EditClassDialog from "./components/EditClassDialog.vue"
import StudentDetailDialog from "./components/StudentDetailDialog.vue"
import EditStudentDialog from "./components/EditStudentDialog.vue"

const router = useRouter()

// 响应式数据
const activeTab = ref('classes')
const activeNames = ref([''])
const mediaUploadVisible = ref(false)
const classDetailVisible = ref(false)
const editClassVisible = ref(false)
const selectedClassData = ref(null)
const editingClassData = ref(null)
const studentDetailVisible = ref(false)
const editStudentVisible = ref(false)
const selectedStudentData = ref(null)
const editingStudentData = ref(null)
const recordDialogVisible = ref(false)
const showCalendar = ref(false)
const currentDate = ref(new Date())
const mediaFiles = ref([])
const selectedClass = ref([])

// 搜索相关
const recordSearchText = ref('')
const studentSearchText = ref('')

// 加载状态
const progressLoading = ref(false)
const progressFinished = ref(false)
const recordsLoading = ref(false)
const recordsFinished = ref(false)
const studentsLoading = ref(false)
const studentsFinished = ref(false)

// 分页数据
const progressPage = ref(1)
const recordsPage = ref(1)
const studentsPage = ref(1)

// 教学统计
const teachingStats = reactive<TeachingStats>({
  classes: 0,
  students: 0,
  weekCourses: 0,
  completionRate: 0
})

// 数据列表
const classList = ref<ClassInfo[]>([])
const progressData = ref<ProgressInfo[]>([])
const recordsList = ref<TeachingRecord[]>([])
const studentsList = ref<StudentInfo[]>([])

// 当前记录和表单
const currentRecord = ref<TeachingRecord | null>(null)
const recordForm = reactive<CreateRecordData>({
  classId: 0,
  courseName: '',
  date: '',
  duration: 0,
  content: '',
  notes: ''
})

// 方法
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  loadTabData(tabName)
}

const handleCreateRecord = () => {
  currentRecord.value = null
  Object.assign(recordForm, {
    classId: 0,
    courseName: '',
    date: '',
    duration: 0,
    content: '',
    notes: ''
  })
  selectedClass.value = []
  recordDialogVisible.value = true
}

const handleEditRecord = (record: TeachingRecord) => {
  currentRecord.value = record
  Object.assign(recordForm, {
    classId: record.id,
    courseName: record.courseName,
    date: record.date,
    duration: record.duration,
    content: record.content,
    notes: record.notes || ''
  })
  recordDialogVisible.value = true
}

const handleDeleteRecord = async (record: TeachingRecord) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除这条教学记录吗？`,
    })

    await teacherTeachingApi.deleteTeachingRecord(record.id)
    showSuccessToast('教学记录已删除')
    loadRecordsList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error)
      showToast('删除失败')
    }
  }
}

const handleSaveRecord = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })

    if (currentRecord.value) {
      // 更新记录
      await teacherTeachingApi.updateTeachingRecord(currentRecord.value.id, recordForm)
      showSuccessToast('教学记录更新成功')
    } else {
      // 创建记录
      await teacherTeachingApi.createTeachingRecord(recordForm)
      showSuccessToast('教学记录创建成功')
    }

    recordDialogVisible.value = false
    loadRecordsList()
  } catch (error) {
    console.error('保存记录失败:', error)
    showToast('保存失败')
  } finally {
    closeToast()
  }
}

const handleUploadMedia = () => {
  mediaUploadVisible.value = true
}

const handleMediaUpload = async (file: any) => {
  try {
    const formData = new FormData()
    formData.append('file', file.file)

    await teacherTeachingApi.uploadTeachingMedia(formData)
    showToast('媒体上传成功')
  } catch (error) {
    console.error('媒体上传失败:', error)
    showToast('上传失败')
  }
}

const handleViewClass = (classInfo: ClassInfo) => {
  // 设置班级数据并显示详情弹窗
  selectedClassData.value = {
    class_id: classInfo.id,
    class_name: classInfo.name,
    current_student_count: classInfo.studentCount || 0
  }
  classDetailVisible.value = true
}

const handleEditClass = (classInfo: ClassInfo) => {
  // 设置班级数据并显示编辑弹窗
  editingClassData.value = {
    id: classInfo.id,
    name: classInfo.name,
    grade: classInfo.grade,
    maxCapacity: classInfo.maxCapacity || 30,
    room: classInfo.room || '',
    status: classInfo.status || 'active'
  }
  editClassVisible.value = true
}

const handleViewProgressDetails = (progressInfo: ProgressInfo) => {
  // TODO: 查看进度详情
  showToast('查看进度详情功能开发中...')
}

const showUpdateProgressDialog = (progressInfo: ProgressInfo) => {
  // TODO: 显示更新进度弹窗
  showToast('更新进度功能开发中...')
}

const handleViewStudent = (student: StudentInfo) => {
  // 设置学生数据并显示详情弹窗
  selectedStudentData.value = {
    id: student.id,
    name: student.name,
    studentId: student.studentNo || '',
    gender: student.gender || 'male',
    birthDate: student.birthDate || '',
    classId: String(student.classId || ''),
    enrollmentDate: student.enrollmentDate || '',
    parentName: student.parentName || '',
    phone: student.parentPhone || '',
    relationship: student.relationship || 'mother',
    address: student.address || '',
    notes: student.notes || '',
    healthStatus: student.healthStatus || ['healthy']
  }
  studentDetailVisible.value = true
}

const handleEditStudent = (student: StudentInfo) => {
  // 设置学生数据并显示编辑弹窗
  editingStudentData.value = {
    id: student.id,
    name: student.name,
    studentId: student.studentNo || '',
    gender: student.gender || 'male',
    birthDate: student.birthDate || '',
    classId: String(student.classId || ''),
    enrollmentDate: student.enrollmentDate || '',
    parentName: student.parentName || '',
    phone: student.parentPhone || '',
    relationship: student.relationship || 'mother',
    address: student.address || '',
    notes: student.notes || '',
    healthStatus: student.healthStatus || ['healthy']
  }
  editStudentVisible.value = true
}

const handleEditFromDetail = (student: any) => {
  // 从详情页打开编辑弹窗
  studentDetailVisible.value = false
  editingStudentData.value = { ...student }
  editStudentVisible.value = true
}

const refreshData = () => {
  loadTeachingStats()
  loadTabData(activeTab.value)
}

const onClassSelect = (value: string, index: number) => {
  if (classList.value[index]) {
    recordForm.classId = classList.value[index].id
  }
}

const getRecordThumb = (record: TeachingRecord) => {
  // 返回记录的缩略图，如果没有媒体文件则返回默认图标
  return record.mediaFiles && record.mediaFiles.length > 0
    ? record.mediaFiles[0]
    : 'https://fastly.jsdelivr.net/npm/@vant/assets/icon-demo.png'
}

const calendarFormatter = (day: any) => {
  // 可以在这里标记有课程的日期
  return day
}

const onCalendarSelect = (date: Date) => {
  showToast(`选择了 ${date.toLocaleDateString()}`)
}

// 搜索相关方法
const onRecordSearch = () => {
  recordsPage.value = 1
  recordsList.value = []
  recordsFinished.value = false
  loadRecordsData()
}

const searchRecords = onRecordSearch

const onStudentSearch = () => {
  studentsPage.value = 1
  studentsList.value = []
  studentsFinished.value = false
  loadStudentsData()
}

const searchStudents = onStudentSearch

// 数据加载方法
const loadTeachingStats = async () => {
  try {
    const stats = await teacherTeachingApi.getTeachingStats()
    Object.assign(teachingStats, stats)
  } catch (error) {
    console.error('加载教学统计失败:', error)
    // 设置默认值
    Object.assign(teachingStats, {
      classes: 0,
      students: 0,
      weekCourses: 0,
      completionRate: 0
    })
  }
}

const loadTabData = async (tabName: string) => {
  try {
    switch (tabName) {
      case 'classes':
        await loadClassesList()
        break
      case 'progress':
        progressPage.value = 1
        progressData.value = []
        progressFinished.value = false
        await loadProgressData()
        break
      case 'records':
        recordsPage.value = 1
        recordsList.value = []
        recordsFinished.value = false
        await loadRecordsData()
        break
      case 'students':
        studentsPage.value = 1
        studentsList.value = []
        studentsFinished.value = false
        await loadStudentsData()
        break
    }
  } catch (error) {
    showToast('加载数据失败')
  }
}

const loadClassesList = async () => {
  try {
    classList.value = await teacherTeachingApi.getClassList()
  } catch (error) {
    console.error('加载班级数据失败:', error)
    classList.value = []
    showToast('加载班级数据失败')
  }
}

const loadProgressData = async () => {
  if (progressLoading.value || progressFinished.value) return

  progressLoading.value = true
  try {
    const data = await teacherTeachingApi.getProgressData()
    if (data.length === 0) {
      progressFinished.value = true
    } else {
      progressData.value.push(...data)
    }
  } catch (error) {
    console.error('加载进度数据失败:', error)
    showToast('加载进度数据失败')
  } finally {
    progressLoading.value = false
  }
}

const loadRecordsList = async () => {
  try {
    const result = await teacherTeachingApi.getTeachingRecords({
      page: recordsPage.value,
      limit: 10
    })
    recordsList.value = result.records
  } catch (error) {
    console.error('加载记录数据失败:', error)
    recordsList.value = []
    showToast('加载记录数据失败')
  }
}

const loadRecordsData = async () => {
  if (recordsLoading.value || recordsFinished.value) return

  recordsLoading.value = true
  try {
    const result = await teacherTeachingApi.getTeachingRecords({
      page: recordsPage.value,
      limit: 10,
      ...(recordSearchText.value && { keyword: recordSearchText.value })
    })

    if (result.records.length === 0) {
      recordsFinished.value = true
    } else {
      recordsList.value.push(...result.records)
      recordsPage.value++
    }
  } catch (error) {
    console.error('加载记录数据失败:', error)
    showToast('加载记录数据失败')
  } finally {
    recordsLoading.value = false
  }
}

const loadStudentsList = async () => {
  try {
    const result = await teacherTeachingApi.getStudentsList({
      page: studentsPage.value,
      limit: 10
    })
    studentsList.value = result.students
  } catch (error) {
    console.error('加载学生数据失败:', error)
    studentsList.value = []
    showToast('加载学生数据失败')
  }
}

const loadStudentsData = async () => {
  if (studentsLoading.value || studentsFinished.value) return

  studentsLoading.value = true
  try {
    const result = await teacherTeachingApi.getStudentsList({
      page: studentsPage.value,
      limit: 10,
      ...(studentSearchText.value && { keyword: studentSearchText.value })
    })

    if (result.students.length === 0) {
      studentsFinished.value = true
    } else {
      studentsList.value.push(...result.students)
      studentsPage.value++
    }
  } catch (error) {
    console.error('加载学生数据失败:', error)
    showToast('加载学生数据失败')
  } finally {
    studentsLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTeachingStats()
  loadTabData('classes')
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.mobile-teaching-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 0;
}

.page-header {
  background: var(--primary-gradient);
  color: white;
  padding: var(--spacing-lg) 16px;
  margin-bottom: 16px;

  .header-info {
    margin-bottom: 16px;

    .page-title {
      font-size: var(--text-2xl);
      font-weight: bold;
      margin: 0 0 8px 0;
    }

    .page-desc {
      font-size: var(--text-sm);
      opacity: 0.9;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }
}

.stats-section {
  margin-bottom: 16px;
  padding: 0 16px;

  .stat-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: var(--spacing-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: transform 0.2s;

    &:active {
      transform: scale(0.98);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--text-lg);
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--text-xl);
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: #666;
      }
    }

    &.primary .stat-icon {
      background: #1989fa;
    }

    &.success .stat-icon {
      background: #07c160;
    }

    &.warning .stat-icon {
      background: #ff976a;
    }

    &.danger .stat-icon {
      background: #ee0a24;
    }
  }
}

.quick-actions {
  margin-bottom: 16px;
  padding: 0 16px;

  .van-grid-item {
    &.active {
      :deep(.van-grid-item__content) {
        background: #e6f7ff;
        color: #1989fa;
      }
    }
  }
}

.main-content {
  padding: 0 16px 20px;

  .tab-content {
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.class-detail {
  padding: var(--spacing-md) 0;

  .class-info {
    margin-bottom: 16px;
  }

  .class-actions {
    display: flex;
    gap: var(--spacing-md);
    padding: 0 16px;
  }
}

.progress-card {
  background: var(--card-bg);
  margin: var(--spacing-sm) 16px;
  padding: var(--spacing-md);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: var(--text-base);
      color: #333;
    }

    .progress-rate {
      font-size: var(--text-lg);
      font-weight: bold;
      color: #1989fa;
    }
  }

  .progress-info {
    margin-bottom: 12px;

    p {
      margin: var(--spacing-xs) 0;
      font-size: var(--text-sm);
      color: #666;
    }
  }

  .progress-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: 12px;
  }
}

.records-header {
  padding: var(--spacing-md);
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: var(--spacing-md);
  align-items: center;

  .van-field {
    flex: 1;
  }
}

.record-card {
  margin: var(--spacing-sm) 16px;
  border-radius: 8px;
  overflow: hidden;

  .record-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

.students-header {
  padding: var(--spacing-md);
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.student-card {
  margin: var(--spacing-sm) 16px;
  border-radius: 8px;
  overflow: hidden;

  .student-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
}

.media-upload {
  padding: var(--spacing-lg);
  height: 100%;
  box-sizing: border-box;

  .upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
    }
  }
}

.record-form {
  padding: var(--spacing-lg);
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
    }
  }

  .form-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}

.calendar-view {
  padding: var(--spacing-lg);
  height: 100%;
  box-sizing: border-box;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
    }
  }
}

// 响应式优化
@media (max-width: 375px) {
  .page-header {
    padding: var(--spacing-md) 12px;

    .header-actions {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;

      .van-button {
        width: 100%;
      }
    }
  }

  .stats-section,
  .quick-actions {
    padding: 0 12px;
  }

  .main-content {
    padding: 0 12px 20px;
  }
}
</style>

