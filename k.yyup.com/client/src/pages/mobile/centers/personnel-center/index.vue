<template>
  <MobileMainLayout
    title="人员中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 新建按钮 -->
    <template #header-extra>
      <van-icon
        name="plus"
        size="18"
        @click="handleCreate"
        style="color: white; cursor: pointer;"
      />
    </template>

    <div class="personnel-center-mobile">
      <!-- 标签页 -->
      <van-tabs
        v-model:active="activeTab"
        @change="handleTabChange"
        sticky
        offset-top="46"
        swipeable
      >
        <!-- 概览标签页 -->
        <van-tab title="概览" name="overview">
          <div class="overview-content">
            <!-- 统计卡片 -->
            <div class="stats-grid">
              <div
                v-for="stat in overviewStats"
                :key="stat.key"
                class="stat-card"
                @click="handleStatClick(stat.key)"
              >
                <div class="stat-icon" :class="`stat-${stat.type}`">
                  <van-icon :name="getIconName(stat.iconName)" size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                  <div class="stat-trend" v-if="stat.trend">
                    <van-icon name="trending-up" size="12" />
                    <span>{{ stat.trend }}{{ stat.trendText }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 图表区域 -->
            <div class="charts-section">
              <div class="chart-card">
                <div class="chart-title">人员分布统计</div>
                <div class="chart-subtitle">各类人员数量分布</div>
                <div ref="distributionChart" class="chart-container"></div>
              </div>
              <div class="chart-card">
                <div class="chart-title">人员增长趋势</div>
                <div class="chart-subtitle">最近6个月人员变化</div>
                <div ref="trendChart" class="chart-container"></div>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="quick-actions">
              <div class="section-title">快速操作</div>
              <div class="actions-grid">
                <div
                  v-for="action in quickActions"
                  :key="action.key"
                  class="action-card"
                  @click="handleQuickAction(action.key)"
                >
                  <div class="action-icon" :class="`action-${action.color}`">
                    <van-icon :name="getIconName(action.icon)" size="20" />
                  </div>
                  <div class="action-content">
                    <div class="action-title">{{ action.title }}</div>
                    <div class="action-desc">{{ action.description }}</div>
                  </div>
                  <van-icon name="arrow" size="16" color="#969799" />
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 学生管理标签页 -->
        <van-tab title="学生管理" name="students">
          <div class="tab-content">
            <!-- 搜索和筛选 -->
            <div class="search-filter-section">
              <van-search
                v-model="studentsSearchKeyword"
                placeholder="搜索学生姓名"
                @search="handleStudentsSearch"
                @clear="handleStudentsSearch"
              />
              <!-- 年龄快捷筛选 -->
              <div class="filter-chips">
                <van-button
                  v-for="filter in studentsFilters"
                  :key="filter.key"
                  :type="studentsFilterAge === filter.key ? 'primary' : 'default'"
                  size="small"
                  round
                  @click="handleStudentsFilter(filter.key)"
                >
                  {{ filter.label }}
                </van-button>
              </div>
            </div>

            <!-- 学生列表 -->
            <van-list
              v-model:loading="studentsLoading"
              :finished="studentsFinished"
              finished-text="没有更多了"
              @load="loadMoreStudents"
            >
              <div
                v-for="student in studentsData"
                :key="student.id"
                class="list-item"
                @click="handleEditStudent(student)"
              >
                <div class="item-header">
                  <div class="item-avatar">
                    <van-image
                      :src="student.avatar"
                      width="48"
                      height="48"
                      round
                      fit="cover"
                    >
                      <template #error>
                        <div class="avatar-placeholder">
                          {{ student.name?.charAt(0) }}
                        </div>
                      </template>
                    </van-image>
                  </div>
                  <div class="item-info">
                    <div class="item-name">{{ student.name }}</div>
                    <div class="item-details">
                      {{ student.gender }} | {{ student.age }}岁 | {{ student.className }}
                    </div>
                  </div>
                  <div class="item-status">
                    <van-tag :type="getStudentStatusType(student.status)">
                      {{ getStudentStatusText(student.status) }}
                    </van-tag>
                  </div>
                </div>
                <div class="item-meta">
                  <div class="meta-item">
                    <span class="meta-label">学号:</span>
                    <span class="meta-value">{{ student.studentId }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">入学时间:</span>
                    <span class="meta-value">{{ student.enrollDate }}</span>
                  </div>
                </div>
              </div>
            </van-list>
          </div>
        </van-tab>

        <!-- 家长管理标签页 -->
        <van-tab title="家长管理" name="parents">
          <div class="tab-content">
            <!-- 搜索 -->
            <van-search
              v-model="parentsSearchKeyword"
              placeholder="搜索家长姓名"
              @search="handleParentsSearch"
              @clear="handleParentsSearch"
            />

            <!-- 家长列表 -->
            <van-list
              v-model:loading="parentsLoading"
              :finished="parentsFinished"
              finished-text="没有更多了"
              @load="loadMoreParents"
            >
              <div
                v-for="parent in parentsData"
                :key="parent.id"
                class="list-item"
              >
                <div class="item-header">
                  <div class="item-info">
                    <div class="item-name">{{ parent.name }}</div>
                    <div class="item-details">
                      {{ parent.phone }}
                    </div>
                  </div>
                  <div class="item-status">
                    <van-tag :type="getParentStatusType(parent.status)">
                      {{ getParentStatusText(parent.status) }}
                    </van-tag>
                  </div>
                </div>

                <!-- 孩子信息 -->
                <div class="children-section" v-if="parent.children && parent.children.length">
                  <div class="children-label">孩子:</div>
                  <div class="children-list">
                    <van-tag
                      v-for="child in parent.children"
                      :key="child.id"
                      size="small"
                      class="child-tag"
                    >
                      {{ child.name }}
                    </van-tag>
                  </div>
                </div>

                <div class="item-meta">
                  <div class="meta-item" v-if="parent.email">
                    <span class="meta-label">邮箱:</span>
                    <span class="meta-value">{{ parent.email }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">注册时间:</span>
                    <span class="meta-value">{{ parent.registerDate }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="item-actions">
                  <van-button
                    size="small"
                    type="primary"
                    @click="handleEditParent(parent)"
                  >
                    编辑
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click="handleDeleteParent(parent)"
                  >
                    删除
                  </van-button>
                </div>
              </div>
            </van-list>
          </div>
        </van-tab>

        <!-- 教师管理标签页 -->
        <van-tab title="教师管理" name="teachers">
          <div class="tab-content">
            <!-- 搜索 -->
            <van-search
              v-model="teachersSearchKeyword"
              placeholder="搜索教师姓名"
              @search="handleTeachersSearch"
              @clear="handleTeachersSearch"
            />

            <!-- 教师列表 -->
            <van-list
              v-model:loading="teachersLoading"
              :finished="teachersFinished"
              finished-text="没有更多了"
              @load="loadMoreTeachers"
            >
              <div
                v-for="teacher in teachersData"
                :key="teacher.id"
                class="list-item"
              >
                <div class="item-header">
                  <div class="item-info">
                    <div class="item-name">{{ teacher.name }}</div>
                    <div class="item-details">
                      {{ teacher.employeeId }} | {{ teacher.department }}
                    </div>
                  </div>
                  <div class="item-status">
                    <van-tag :type="getTeacherStatusType(teacher.status)">
                      {{ getTeacherStatusText(teacher.status) }}
                    </van-tag>
                  </div>
                </div>

                <!-- 任教班级 -->
                <div class="classes-section" v-if="teacher.classes && teacher.classes.length">
                  <div class="classes-label">任教班级:</div>
                  <div class="classes-list">
                    <van-tag
                      v-for="cls in teacher.classes"
                      :key="cls.id"
                      size="small"
                      class="class-tag"
                    >
                      {{ cls.name }}
                    </van-tag>
                  </div>
                </div>

                <div class="item-meta">
                  <div class="meta-item">
                    <span class="meta-label">职位:</span>
                    <span class="meta-value">{{ teacher.position }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">入职时间:</span>
                    <span class="meta-value">{{ teacher.hireDate }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="item-actions">
                  <van-button
                    size="small"
                    type="primary"
                    @click="handleEditTeacher(teacher)"
                  >
                    编辑
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click="handleDeleteTeacher(teacher)"
                  >
                    删除
                  </van-button>
                </div>
              </div>
            </van-list>
          </div>
        </van-tab>

        <!-- 班级管理标签页 -->
        <van-tab title="班级管理" name="classes">
          <div class="tab-content">
            <!-- 搜索 -->
            <van-search
              v-model="classesSearchKeyword"
              placeholder="搜索班级名称"
              @search="handleClassesSearch"
              @clear="handleClassesSearch"
            />

            <!-- 班级列表 -->
            <van-list
              v-model:loading="classesLoading"
              :finished="classesFinished"
              finished-text="没有更多了"
              @load="loadMoreClasses"
            >
              <div
                v-for="cls in classesData"
                :key="cls.id"
                class="list-item"
                @click="handleEditClass(cls)"
              >
                <div class="item-header">
                  <div class="item-info">
                    <div class="item-name">{{ cls.name }}</div>
                    <div class="item-details">
                      {{ cls.grade }} | {{ cls.room }} | {{ cls.teacherName }}
                    </div>
                  </div>
                  <div class="item-status">
                    <van-tag :type="cls.status === '正常' ? 'success' : 'warning'">
                      {{ cls.status }}
                    </van-tag>
                  </div>
                </div>

                <!-- 容量信息 -->
                <div class="capacity-section">
                  <div class="capacity-info">
                    <span class="capacity-text">{{ cls.currentStudents }}/{{ cls.maxCapacity }}</span>
                    <van-progress
                      :percentage="getCapacityPercentage(cls)"
                      :show-pivot="false"
                      stroke-width="6"
                    />
                  </div>
                </div>

                <div class="item-meta">
                  <div class="meta-item">
                    <span class="meta-label">创建时间:</span>
                    <span class="meta-value">{{ cls.createDate }}</span>
                  </div>
                </div>
              </div>
            </van-list>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 表单弹窗 -->
    <van-popup
      v-model:show="formModalVisible"
      position="bottom"
      :style="{ height: '80%' }"
      round
      closeable
      @close="handleFormClose"
    >
      <div class="form-modal">
        <div class="form-header">
          <h3>{{ formModalTitle }}</h3>
        </div>
        <van-form @submit="handleFormSave">
          <van-cell-group inset>
            <van-field
              v-for="field in formFields"
              :key="field.prop"
              v-model="formData[field.prop]"
              :name="field.prop"
              :label="field.label"
              :type="field.type === 'input' ? 'text' : field.type"
              :placeholder="`请输入${field.label}`"
              :required="field.required"
              :rules="[{ required: field.required, message: `请输入${field.label}` }]"
            />
          </van-cell-group>
          <div class="form-actions">
            <van-button round block type="primary" native-type="submit" :loading="formLoading">
              保存
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import * as echarts from 'echarts'
import { personnelCenterApi } from '@/api/personnel-center'

// 路由
const router = useRouter()
const route = useRoute()

// 当前活跃标签页
const activeTab = ref((route.query.tab as string) || 'overview')

// 表单弹窗状态
const formModalVisible = ref(false)
const formModalTitle = ref('')
const formLoading = ref(false)
const formData = reactive({})
const formFields = ref([])

// 图表实例
const distributionChart = ref()
const trendChart = ref()
let distributionChartInstance: any = null
let trendChartInstance: any = null

// 概览数据
const overviewStats = ref([
  { key: 'students', title: '在校学生', value: 456, unit: '人', trend: 12, trendText: '较上月', type: 'primary', iconName: 'students' },
  { key: 'parents', title: '注册家长', value: 328, unit: '人', trend: 8, trendText: '较上月', type: 'success', iconName: 'customers' },
  { key: 'teachers', title: '在职教师', value: 45, unit: '人', trend: 2, trendText: '较上月', type: 'warning', iconName: 'teachers' },
  { key: 'classes', title: '开设班级', value: 18, unit: '个', trend: 1, trendText: '较上月', type: 'info', iconName: 'classes' }
])

const quickActions = ref([
  { key: 'add-student', title: '新增学生', description: '添加新的学生信息', icon: 'user-plus-o', color: 'primary' },
  { key: 'add-parent', title: '新增家长', description: '添加新的家长信息', icon: 'friends-o', color: 'success' },
  { key: 'add-teacher', title: '新增教师', description: '添加新的教师信息', icon: 'manager-o', color: 'warning' },
  { key: 'add-class', title: '新增班级', description: '创建新的班级', icon: 'home-o', color: 'info' }
])

// 学生管理数据
const studentsData = ref([])
const studentsLoading = ref(false)
const studentsFinished = ref(false)
const studentsPage = ref(1)
const studentsPageSize = ref(10)
const studentsTotal = ref(0)
const studentsFilterAge = ref('age_all')
const studentsSearchKeyword = ref('')

const studentsFilters = [
  { key: 'age_3', label: '3岁' },
  { key: 'age_4', label: '4岁' },
  { key: 'age_5', label: '5岁' },
  { key: 'age_6', label: '6岁' },
  { key: 'age_all', label: '全部' }
]

// 家长管理数据
const parentsData = ref([])
const parentsLoading = ref(false)
const parentsFinished = ref(false)
const parentsPage = ref(1)
const parentsPageSize = ref(10)
const parentsTotal = ref(0)
const parentsSearchKeyword = ref('')

// 教师管理数据
const teachersData = ref([])
const teachersLoading = ref(false)
const teachersFinished = ref(false)
const teachersPage = ref(1)
const teachersPageSize = ref(10)
const teachersTotal = ref(0)
const teachersSearchKeyword = ref('')

// 班级管理数据
const classesData = ref([])
const classesLoading = ref(false)
const classesFinished = ref(false)
const classesPage = ref(1)
const classesPageSize = ref(10)
const classesTotal = ref(0)
const classesSearchKeyword = ref('')

// 生命周期
onMounted(() => {
  loadOverviewData()
  initCharts()
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'students':
      loadStudentsData(true)
      break
    case 'parents':
      loadParentsData(true)
      break
    case 'teachers':
      loadTeachersData(true)
      break
    case 'classes':
      loadClassesData(true)
      break
    case 'overview':
      loadOverviewData()
      nextTick(() => {
        initCharts()
      })
      break
  }
}, { immediate: false })

// 方法
const loadOverviewData = async () => {
  try {
    const response = await personnelCenterApi.getOverview()
    if (response.success) {
      overviewStats.value = response.data.stats
    }
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

const initCharts = () => {
  nextTick(() => {
    initDistributionChart()
    initTrendChart()
  })
}

const initDistributionChart = () => {
  if (!distributionChart.value) return

  distributionChartInstance = echarts.init(distributionChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}人 ({d}%)'
    },
    color: ['#4C7EFF', '#6EE7B7', '#FFA500', '#FF6B6B'],
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '10px',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    series: [{
      name: '人员分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '40%'],
      data: [
        { value: 280, name: '学生' },
        { value: 45, name: '家长' },
        { value: 35, name: '教师' },
        { value: 8, name: '班级' }
      ],
      label: {
        show: true,
        position: 'outside',
        fontSize: 12,
        color: '#333',
        formatter: '{b}: {c}人'
      }
    }]
  }
  distributionChartInstance.setOption(option)
}

const initTrendChart = () => {
  if (!trendChart.value) return

  trendChartInstance = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['教师', '学生', '家长'],
      top: '10px'
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '25%'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '教师',
        type: 'line',
        data: [30, 32, 33, 35, 36, 35]
      },
      {
        name: '学生',
        type: 'line',
        data: [250, 260, 270, 275, 280, 280]
      },
      {
        name: '家长',
        type: 'line',
        data: [40, 42, 43, 44, 45, 45]
      }
    ]
  }
  trendChartInstance.setOption(option)
}

// 概览相关方法
const handleStatClick = (key: string) => {
  const tabMap = {
    'students': 'students',
    'parents': 'parents',
    'teachers': 'teachers',
    'classes': 'classes'
  }
  activeTab.value = tabMap[key] || 'overview'
}

const handleQuickAction = (key: string) => {
  switch (key) {
    case 'add-student':
      handleCreateStudent()
      break
    case 'add-parent':
      handleCreateParent()
      break
    case 'add-teacher':
      handleCreateTeacher()
      break
    case 'add-class':
      handleCreateClass()
      break
  }
}

const handleCreate = () => {
  const currentTabActions = {
    overview: 'add-student',
    students: 'add-student',
    parents: 'add-parent',
    teachers: 'add-teacher',
    classes: 'add-class'
  }
  handleQuickAction(currentTabActions[activeTab.value] || 'add-student')
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 学生管理相关方法
const loadStudentsData = async (reset = false) => {
  if (reset) {
    studentsPage.value = 1
    studentsFinished.value = false
    studentsData.value = []
  }

  if (studentsLoading.value || studentsFinished.value) return

  studentsLoading.value = true
  try {
    const params: any = {
      page: studentsPage.value,
      pageSize: studentsPageSize.value
    }

    if (studentsFilterAge.value && studentsFilterAge.value !== 'age_all') {
      const age = parseInt(studentsFilterAge.value.replace('age_', ''))
      params.age = age
    }

    if (studentsSearchKeyword.value) {
      params.keyword = studentsSearchKeyword.value
    }

    const response = await personnelCenterApi.getStudents(params)
    if (response.success) {
      const newStudents = response.data.items.map((student: any) => ({
        ...student,
        gender: student.gender === 'male' || student.gender === 'MALE' ? '男' :
                student.gender === 'female' || student.gender === 'FEMALE' ? '女' : student.gender,
        status: getStudentStatusText(student.status || ''),
        enrollDate: student.enrollDate ? new Date(student.enrollDate).toLocaleDateString('zh-CN') : '-',
        birthday: student.birthday ? new Date(student.birthday).toLocaleDateString('zh-CN') : '-'
      }))

      if (reset) {
        studentsData.value = newStudents
      } else {
        studentsData.value.push(...newStudents)
      }

      studentsTotal.value = response.data.total
      studentsFinished.value = studentsData.value.length >= studentsTotal.value
      studentsPage.value++
    }
  } catch (error) {
    console.error('加载学生数据失败:', error)
    showToast('加载学生数据失败')
  } finally {
    studentsLoading.value = false
  }
}

const loadMoreStudents = () => {
  loadStudentsData(false)
}

const handleStudentsSearch = (keyword: string) => {
  studentsSearchKeyword.value = keyword
  loadStudentsData(true)
}

const handleStudentsFilter = (filterKey: string) => {
  studentsFilterAge.value = filterKey
  loadStudentsData(true)
}

const handleCreateStudent = () => {
  formModalTitle.value = '新增学生'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'studentId', label: '学号', type: 'input', required: true },
    { prop: 'gender', label: '性别', type: 'select', options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ], required: true },
    { prop: 'age', label: '年龄', type: 'number', required: true },
    { prop: 'className', label: '班级', type: 'input', required: true },
    { prop: 'parentName', label: '家长姓名', type: 'input', required: true },
    { prop: 'parentPhone', label: '家长电话', type: 'input', required: true },
    { prop: 'enrollDate', label: '入学时间', type: 'date', required: true }
  ]
  Object.assign(formData, {})
  formModalVisible.value = true
}

const handleEditStudent = (student: any) => {
  formModalTitle.value = '编辑学生'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'studentId', label: '学号', type: 'input', required: true },
    { prop: 'gender', label: '性别', type: 'select', options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ], required: true },
    { prop: 'age', label: '年龄', type: 'number', required: true },
    { prop: 'className', label: '班级', type: 'input', required: true },
    { prop: 'parentName', label: '家长姓名', type: 'input', required: true },
    { prop: 'parentPhone', label: '家长电话', type: 'input', required: true },
    { prop: 'enrollDate', label: '入学时间', type: 'date', required: true }
  ]
  Object.assign(formData, student)
  formModalVisible.value = true
}

// 家长管理相关方法
const loadParentsData = async (reset = false) => {
  if (reset) {
    parentsPage.value = 1
    parentsFinished.value = false
    parentsData.value = []
  }

  if (parentsLoading.value || parentsFinished.value) return

  parentsLoading.value = true
  try {
    const params: any = {
      page: parentsPage.value,
      pageSize: parentsPageSize.value
    }

    if (parentsSearchKeyword.value) {
      params.keyword = parentsSearchKeyword.value
    }

    const response = await personnelCenterApi.getParents(params)
    if (response.success) {
      const newParents = response.data.items.map((parent: any) => ({
        ...parent,
        status: getParentStatusText(parent.status || ''),
        registerDate: parent.registerDate ? new Date(parent.registerDate).toLocaleDateString('zh-CN') : '-',
        createdAt: parent.createdAt ? new Date(parent.createdAt).toLocaleDateString('zh-CN') : '-'
      }))

      if (reset) {
        parentsData.value = newParents
      } else {
        parentsData.value.push(...newParents)
      }

      parentsTotal.value = response.data.total
      parentsFinished.value = parentsData.value.length >= parentsTotal.value
      parentsPage.value++
    }
  } catch (error) {
    console.error('加载家长数据失败:', error)
    showToast('加载家长数据失败')
  } finally {
    parentsLoading.value = false
  }
}

const loadMoreParents = () => {
  loadParentsData(false)
}

const handleParentsSearch = (keyword: string) => {
  parentsSearchKeyword.value = keyword
  loadParentsData(true)
}

const handleCreateParent = () => {
  formModalTitle.value = '新增家长'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'phone', label: '手机号', type: 'input', required: true },
    { prop: 'email', label: '邮箱', type: 'input' },
    { prop: 'address', label: '地址', type: 'input' }
  ]
  Object.assign(formData, {})
  formModalVisible.value = true
}

const handleEditParent = (parent: any) => {
  formModalTitle.value = '编辑家长'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'phone', label: '手机号', type: 'input', required: true },
    { prop: 'email', label: '邮箱', type: 'input' },
    { prop: 'address', label: '地址', type: 'input' }
  ]
  Object.assign(formData, parent)
  formModalVisible.value = true
}

const handleDeleteParent = async (parent: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个家长吗？'
    })

    const response = await personnelCenterApi.deleteParent(parent.id)
    if (response.success) {
      showToast('删除成功')
      loadParentsData(true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除家长失败:', error)
      showToast('删除失败')
    }
  }
}

// 教师管理相关方法
const loadTeachersData = async (reset = false) => {
  if (reset) {
    teachersPage.value = 1
    teachersFinished.value = false
    teachersData.value = []
  }

  if (teachersLoading.value || teachersFinished.value) return

  teachersLoading.value = true
  try {
    const params: any = {
      page: teachersPage.value,
      pageSize: teachersPageSize.value
    }

    if (teachersSearchKeyword.value) {
      params.keyword = teachersSearchKeyword.value
    }

    const response = await personnelCenterApi.getTeachers(params)
    if (response.success) {
      const newTeachers = response.data.items.map((teacher: any) => ({
        ...teacher,
        hireDate: teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString('zh-CN') : '-',
        createdAt: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('zh-CN') : '-'
      }))

      if (reset) {
        teachersData.value = newTeachers
      } else {
        teachersData.value.push(...newTeachers)
      }

      teachersTotal.value = response.data.total
      teachersFinished.value = teachersData.value.length >= teachersTotal.value
      teachersPage.value++
    }
  } catch (error) {
    console.error('加载教师数据失败:', error)
    showToast('加载教师数据失败')
  } finally {
    teachersLoading.value = false
  }
}

const loadMoreTeachers = () => {
  loadTeachersData(false)
}

const handleTeachersSearch = (keyword: string) => {
  teachersSearchKeyword.value = keyword
  loadTeachersData(true)
}

const handleCreateTeacher = () => {
  formModalTitle.value = '新增教师'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'employeeId', label: '工号', type: 'input', required: true },
    { prop: 'phone', label: '手机号', type: 'input', required: true },
    { prop: 'email', label: '邮箱', type: 'input' },
    { prop: 'department', label: '部门', type: 'input', required: true },
    { prop: 'position', label: '职位', type: 'input', required: true },
    { prop: 'hireDate', label: '入职时间', type: 'date', required: true }
  ]
  Object.assign(formData, {})
  formModalVisible.value = true
}

const handleEditTeacher = (teacher: any) => {
  formModalTitle.value = '编辑教师'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true },
    { prop: 'employeeId', label: '工号', type: 'input', required: true },
    { prop: 'phone', label: '手机号', type: 'input', required: true },
    { prop: 'email', label: '邮箱', type: 'input' },
    { prop: 'department', label: '部门', type: 'input', required: true },
    { prop: 'position', label: '职位', type: 'input', required: true },
    { prop: 'hireDate', label: '入职时间', type: 'date', required: true }
  ]
  Object.assign(formData, teacher)
  formModalVisible.value = true
}

const handleDeleteTeacher = async (teacher: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个教师吗？'
    })

    const response = await personnelCenterApi.deleteTeacher(teacher.id)
    if (response.success) {
      showToast('删除成功')
      loadTeachersData(true)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除教师失败:', error)
      showToast('删除失败')
    }
  }
}

// 班级管理相关方法
const loadClassesData = async (reset = false) => {
  if (reset) {
    classesPage.value = 1
    classesFinished.value = false
    classesData.value = []
  }

  if (classesLoading.value || classesFinished.value) return

  classesLoading.value = true
  try {
    const params: any = {
      page: classesPage.value,
      pageSize: classesPageSize.value
    }

    if (classesSearchKeyword.value) {
      params.keyword = classesSearchKeyword.value
    }

    const response = await personnelCenterApi.getClasses(params)
    if (response.success) {
      const newClasses = response.data.items.map((cls: any) => ({
        ...cls,
        status: cls.status ? (cls.status === 'active' ? '正常' : cls.status === 'inactive' ? '停用' : cls.status) : '未知'
      }))

      if (reset) {
        classesData.value = newClasses
      } else {
        classesData.value.push(...newClasses)
      }

      classesTotal.value = response.data.total
      classesFinished.value = classesData.value.length >= classesTotal.value
      classesPage.value++
    }
  } catch (error) {
    console.error('加载班级数据失败:', error)
    showToast('加载班级数据失败')
  } finally {
    classesLoading.value = false
  }
}

const loadMoreClasses = () => {
  loadClassesData(false)
}

const handleClassesSearch = (keyword: string) => {
  classesSearchKeyword.value = keyword
  loadClassesData(true)
}

const handleCreateClass = () => {
  formModalTitle.value = '新增班级'
  formFields.value = [
    { prop: 'name', label: '班级名称', type: 'input', required: true },
    { prop: 'grade', label: '年级', type: 'select', options: [
      { label: '小班', value: 'small' },
      { label: '中班', value: 'medium' },
      { label: '大班', value: 'large' }
    ], required: true },
    { prop: 'maxCapacity', label: '最大容量', type: 'number', required: true },
    { prop: 'room', label: '教室', type: 'input', required: true },
    { prop: 'teacherName', label: '班主任', type: 'input', required: true }
  ]
  Object.assign(formData, {})
  formModalVisible.value = true
}

const handleEditClass = (cls: any) => {
  formModalTitle.value = '编辑班级'
  formFields.value = [
    { prop: 'name', label: '班级名称', type: 'input', required: true },
    { prop: 'grade', label: '年级', type: 'select', options: [
      { label: '小班', value: 'small' },
      { label: '中班', value: 'medium' },
      { label: '大班', value: 'large' }
    ], required: true },
    { prop: 'maxCapacity', label: '最大容量', type: 'number', required: true },
    { prop: 'room', label: '教室', type: 'input', required: true },
    { prop: 'teacherName', label: '班主任', type: 'input', required: true },
    { prop: 'status', label: '状态', type: 'select', options: [
      { label: '正常', value: 'active' },
      { label: '暂停', value: 'inactive' }
    ], required: true }
  ]
  Object.assign(formData, cls)
  formModalVisible.value = true
}

// 表单保存
const handleFormSave = async () => {
  formLoading.value = true
  try {
    let response
    const isEdit = !!formData.id

    if (formModalTitle.value.includes('学生')) {
      response = isEdit
        ? await personnelCenterApi.updateStudent(formData.id, formData)
        : await personnelCenterApi.createStudent(formData)
      if (response.success) {
        showToast(isEdit ? '学生信息更新成功' : '学生创建成功')
        loadStudentsData(true)
      }
    } else if (formModalTitle.value.includes('家长')) {
      response = isEdit
        ? await personnelCenterApi.updateParent(formData.id, formData)
        : await personnelCenterApi.createParent(formData)
      if (response.success) {
        showToast(isEdit ? '家长信息更新成功' : '家长创建成功')
        loadParentsData(true)
      }
    } else if (formModalTitle.value.includes('教师')) {
      response = isEdit
        ? await personnelCenterApi.updateTeacher(formData.id, formData)
        : await personnelCenterApi.createTeacher(formData)
      if (response.success) {
        showToast(isEdit ? '教师信息更新成功' : '教师创建成功')
        loadTeachersData(true)
      }
    } else if (formModalTitle.value.includes('班级')) {
      response = isEdit
        ? await personnelCenterApi.updateClass(formData.id, formData)
        : await personnelCenterApi.createClass(formData)
      if (response.success) {
        showToast(isEdit ? '班级信息更新成功' : '班级创建成功')
        loadClassesData(true)
      }
    }

    formModalVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    formLoading.value = false
  }
}

const handleFormClose = () => {
  formModalVisible.value = false
}

// 工具函数
const getIconName = (iconName: string) => {
  const iconMap: Record<string, string> = {
    'students': 'friends-o',
    'customers': 'friends-o',
    'teachers': 'manager-o',
    'classes': 'home-o',
    'user-plus-o': 'user-plus-o',
    'friends-o': 'friends-o',
    'manager-o': 'manager-o',
    'home-o': 'home-o'
  }
  return iconMap[iconName] || 'star-o'
}

const getCapacityPercentage = (row: any) => {
  if (!row || !row.maxCapacity || row.maxCapacity === 0) return 0
  const currentStudents = row.currentStudents || 0
  const percentage = (currentStudents / row.maxCapacity) * 100
  return Math.min(Math.max(percentage, 0), 100)
}

const getStudentStatusType = (status: string) => {
  const types: Record<string, string> = {
    '在读': 'success',
    '休学': 'warning',
    '毕业': 'info'
  }
  return types[status] || 'default'
}

const getStudentStatusText = (status: string) => {
  if (!status) return '未知'
  const statusLower = status.toLowerCase()
  const texts: Record<string, string> = {
    active: '在读',
    suspended: '休学',
    graduated: '毕业',
    inactive: '停用'
  }
  return texts[statusLower] || status
}

const getParentStatusType = (status: string) => {
  const types: Record<string, string> = {
    '正常': 'success',
    '暂停': 'danger'
  }
  return types[status] || 'default'
}

const getParentStatusText = (status: string) => {
  if (!status) return '未知'
  const statusLower = status.toLowerCase()
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '暂停',
    suspended: '暂停'
  }
  return texts[statusLower] || status
}

const getTeacherStatusType = (status: string) => {
  const types: Record<string, string> = {
    '在职': 'success',
    '离职': 'danger',
    '休假': 'warning'
  }
  return types[status] || 'default'
}

const getTeacherStatusText = (status: string) => {
  if (!status) return '未知'
  const statusLower = status.toLowerCase()
  const texts: Record<string, string> = {
    active: '在职',
    inactive: '离职',
    leave: '休假',
    on_leave: '休假'
  }
  return texts[statusLower] || status
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.personnel-center-mobile {
  background: var(--van-background-color-light);
  min-height: calc(100vh - 46px);
}

.overview-content {
  padding: var(--spacing-md);
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: 24px;

  .stat-card {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      &.stat-primary {
        background: rgba(64, 158, 255, 0.1);
        color: var(--primary-color);
      }

      &.stat-success {
        background: rgba(103, 194, 58, 0.1);
        color: var(--success-color);
      }

      &.stat-warning {
        background: rgba(230, 162, 60, 0.1);
        color: var(--warning-color);
      }

      &.stat-info {
        background: rgba(144, 147, 153, 0.1);
        color: var(--info-color);
      }
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #323233;
        line-height: 1.2;
      }

      .stat-title {
        font-size: var(--text-sm);
        color: #969799;
        margin-bottom: 4px;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: var(--text-xs);
        color: var(--success-color);

        span {
          margin-left: 4px;
        }
      }
    }
  }
}

// 图表区域
.charts-section {
  margin-bottom: 24px;

  .chart-card {
    background: var(--card-bg);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .chart-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
      margin-bottom: 4px;
    }

    .chart-subtitle {
      font-size: var(--text-xs);
      color: #969799;
      margin-bottom: 16px;
    }

    .chart-container {
      height: 200px;
      width: 100%;
    }
  }
}

// 快速操作
.quick-actions {
  .section-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
    margin-bottom: 16px;
  }

  .actions-grid {
    .action-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: var(--spacing-md);
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }

      .action-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        &.action-primary {
          background: rgba(64, 158, 255, 0.1);
          color: var(--primary-color);
        }

        &.action-success {
          background: rgba(103, 194, 58, 0.1);
          color: var(--success-color);
        }

        &.action-warning {
          background: rgba(230, 162, 60, 0.1);
          color: var(--warning-color);
        }

        &.action-info {
          background: rgba(144, 147, 153, 0.1);
          color: var(--info-color);
        }
      }

      .action-content {
        flex: 1;

        .action-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: #323233;
          margin-bottom: 4px;
        }

        .action-desc {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }
}

// 标签页内容
.tab-content {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
}

// 搜索和筛选
.search-filter-section {
  margin-bottom: 16px;

  .filter-chips {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) 16px;
    overflow-x: auto;
    background: var(--card-bg);
    border-radius: 8px;
    margin-top: 12px;
  }
}

// 列表项
.list-item {
  background: var(--card-bg);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .item-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);

    .item-avatar {
      margin-right: 12px;

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-base);
        font-weight: 600;
      }
    }

    .item-info {
      flex: 1;

      .item-name {
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .item-details {
        font-size: var(--text-sm);
        color: #969799;
      }
    }

    .item-status {
      margin-left: 12px;
    }
  }

  .item-meta {
    padding: 0 16px 16px;

    .meta-item {
      display: flex;
      margin-bottom: 8px;

      .meta-label {
        font-size: var(--text-sm);
        color: #969799;
        min-width: 80px;
      }

      .meta-value {
        font-size: var(--text-sm);
        color: #323233;
        flex: 1;
      }
    }
  }

  .children-section,
  .classes-section {
    padding: 0 16px 16px;

    .children-label,
    .classes-label {
      font-size: var(--text-sm);
      color: #323233;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .children-list,
    .classes-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      .child-tag,
      .class-tag {
        margin-right: 0;
      }
    }
  }

  .capacity-section {
    padding: 0 16px 16px;

    .capacity-info {
      .capacity-text {
        font-size: var(--text-sm);
        color: #323233;
        margin-bottom: 8px;
        display: block;
      }
    }
  }

  .item-actions {
    padding: var(--spacing-md) 16px;
    background: var(--van-background-color-light);
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }
}

// 表单弹窗
.form-modal {
  height: 100%;
  display: flex;
  flex-direction: column;

  .form-header {
    padding: var(--spacing-md) 0;
    text-align: center;
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: #323233;
    }
  }

  .form-actions {
    padding: var(--spacing-md);
    margin-top: auto;
  }
}

// 响应式设计
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>