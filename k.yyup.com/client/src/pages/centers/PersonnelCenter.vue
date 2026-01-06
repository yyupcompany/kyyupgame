<template>
  <UnifiedCenterLayout
    title="人员中心"
    description="清晰展示人员管理的完整流程，方便园长一目了然地掌握人员状况"
  >
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreate">
        <UnifiedIcon name="Plus" />
        新建
      </el-button>
    </template>

    <div class="center-container personnel-center-timeline">

    <!-- 标签页内容 -->
    <el-tabs v-model="activeTab" class="main-content" @tab-change="handleTabChange">
    <!-- 概览标签页 -->
    <el-tab-pane label="概览" name="overview">
      <div class="overview-content">

        <!-- 统计卡片区域 - 使用统一网格系统 -->
        <div class="stats-section">
          <div class="stats-grid-unified">
            <CentersStatCard
              v-for="stat in overviewStats"
              :key="stat.key"
              :title="stat.title"
              :value="stat.value"
              :unit="stat.unit"
              :trend="stat.trend"
              :trend-text="stat.trendText"
              :type="stat.type as 'primary' | 'success' | 'warning' | 'info'"
              :icon-name="stat.iconName"
              clickable
              @click="handleStatClick(stat.key)"
            />
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-grid-unified">
          <ChartContainer
            title="人员分布统计"
            subtitle="各类人员数量分布"
            :options="personnelDistributionChart"
            :loading="chartsLoading"
            height="var(--chart-height-xl)"
          />
          <ChartContainer
            title="人员增长趋势"
            subtitle="最近6个月人员变化"
            :options="personnelTrendChart"
            :loading="chartsLoading"
            height="var(--chart-height-xl)"
          />
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <div class="actions-header">
            <h3>快速操作</h3>
          </div>
          <div class="actions-grid-unified">
            <ActionCard
              v-for="action in quickActions"
              :key="action.key"
              :title="action.title"
              :description="action.description"
              :icon="action.icon"
                                :color="action.color as 'primary' | 'success' | 'warning' | 'info'"
              @click="handleQuickAction(action.key)"
            />
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 学生管理标签页 -->
    <el-tab-pane label="学生管理" name="students">
      <div class="students-content">
        <div class="students-layout">
          <!-- 左侧：学生列表 -->
          <div class="students-list">
            <DataTable
              :data="studentsData"
              :columns="studentsColumns"
              :loading="studentsLoading"
              :total="studentsTotal"
              :current-page="studentsPage"
              :page-size="studentsPageSize"
              :filters="studentsFilters"
              @create="handleCreateStudent"
              @edit="handleEditStudent"
              @delete="handleDeleteStudent"
              @current-change="handleStudentsPageChange"
              @size-change="handleStudentsPageSizeChange"
              @search="handleStudentsSearch"
              @filter="handleStudentsFilter"
            >
              <template #toolbar-right>
                <!-- 年龄快捷选择 -->
                <el-button-group>
                  <el-button
                    v-for="filter in studentsFilters"
                    :key="filter.key"
                    :type="studentsFilterAge === filter.key ? 'primary' : ''"
                    size="default"
                    @click="handleStudentsFilter(filter.key)"
                  >
                    {{ filter.label }}
                  </el-button>
                </el-button-group>
              </template>
              <template #column-status="{ value }">
                <el-tag :type="getStudentStatusType(value)">
                  {{ getStudentStatusText(value) }}
                </el-tag>
              </template>
              <template #column-avatar="{ row }">
                <el-avatar :size="48" :src="row.avatar">
                  {{ row.name?.charAt(0) }}
                </el-avatar>
              </template>
            </DataTable>
          </div>

        </div>
      </div>
    </el-tab-pane>

    <!-- 家长管理标签页 -->
    <el-tab-pane label="家长管理" name="parents">
      <div class="parents-content">
        <div class="parents-layout">
          <!-- 左侧：家长列表 -->
          <div class="parents-list">
            <DataTable
              :data="parentsData"
              :columns="parentsColumns"
              :loading="parentsLoading"
              :total="parentsTotal"
              :current-page="parentsPage"
              :page-size="parentsPageSize"
              @create="handleCreateParent"
              @edit="handleEditParent"
              @delete="handleDeleteParent"
              @row-click="handleParentRowClick"
              @current-change="handleParentsPageChange"
              @size-change="handleParentsPageSizeChange"
              @search="handleParentsSearch"
            >
              <template #column-status="{ value }">
                <el-tag :type="getParentStatusType(value)">
                  {{ getParentStatusText(value) }}
                </el-tag>
              </template>
              <template #column-children="{ row }">
                <el-tag v-for="child in row.children" :key="child.id" size="small" class="child-tag">
                  {{ child.name }}
                </el-tag>
              </template>
              <template #actions="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" @click="handleParentRowClick(row)">
                    <UnifiedIcon name="document" />
                    查看
                  </el-button>
                  <el-button type="success" size="small" @click="handleEditParent(row)">
                    <UnifiedIcon name="Edit" />
                    编辑
                  </el-button>
                  <el-dropdown trigger="click" size="small">
                    <el-button type="info" size="small">
                      更多<UnifiedIcon name="menu" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleManageChildren(row)">
                          <UnifiedIcon name="default" />
                          孩子管理
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleContactRecord(row)">
                          <UnifiedIcon name="default" />
                          沟通记录
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="handleDeleteParent(row)">
                          <UnifiedIcon name="Delete" />
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </DataTable>
          </div>

        </div>
      </div>
    </el-tab-pane>

    <!-- 教师管理标签页 -->
    <el-tab-pane label="教师管理" name="teachers">
      <div class="teachers-content">
        <div class="teachers-layout">
          <!-- 左侧：教师列表 -->
          <div class="teachers-list">
            <DataTable
              :data="teachersData"
              :columns="teachersColumns"
              :loading="teachersLoading"
              :total="teachersTotal"
              :current-page="teachersPage"
              :page-size="teachersPageSize"
              @create="handleCreateTeacher"
              @edit="handleEditTeacher"
              @delete="handleDeleteTeacher"
              @row-click="handleTeacherRowClick"
              @current-change="handleTeachersPageChange"
              @size-change="handleTeachersPageSizeChange"
              @search="handleTeachersSearch"
            >
              <template #column-status="{ value }">
                <el-tag :type="getTeacherStatusType(value)">
                  {{ getTeacherStatusText(value) }}
                </el-tag>
              </template>
              <template #column-classes="{ row }">
                <el-tag v-for="cls in row.classes" :key="cls.id" size="small" class="class-tag">
                  {{ cls.name }}
                </el-tag>
              </template>

              <template #column-actions="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleEditTeacher(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleDeleteTeacher(row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </DataTable>
          </div>


        </div>
      </div>
    </el-tab-pane>

    <!-- 班级管理标签页 -->
    <el-tab-pane label="班级管理" name="classes">
      <div class="classes-content">
        <div class="classes-layout">
          <!-- 左侧：班级列表 -->
          <div class="classes-list">
            <DataTable
              :data="classesData"
              :columns="classesColumns"
              :loading="classesLoading"
              :total="classesTotal"
              :current-page="classesPage"
              :page-size="classesPageSize"
              @create="handleCreateClass"
              @edit="handleEditClass"
              @delete="handleDeleteClass"
              @row-click="handleClassRowClick"
              @current-change="handleClassesPageChange"
              @size-change="handleClassesPageSizeChange"
              @search="handleClassesSearch"
            >
              <template #column-capacity="{ row }">
                <div class="capacity-info">
                  <span>{{ row.currentStudents }}/{{ row.maxCapacity }}</span>
                  <el-progress
                    :percentage="getCapacityPercentage(row)"
                    :stroke-width="6"
                    :show-text="false"
                  />
                </div>
              </template>
            </DataTable>
          </div>

          <!-- 右侧班级详情已取消，改为通过编辑按钮/点击行弹出编辑对话框 -->
        </div>
      </div>
    </el-tab-pane>
    </el-tabs>

    <!-- 表单弹窗 -->
  <FormModal
    v-model="formModalVisible"
    :title="formModalTitle"
    :fields="formFields"
    :data="formData"
    :loading="formLoading"
    @confirm="handleFormSave"
  />

  <!-- 教师编辑弹窗 -->
  <TeacherEditDialog
    v-model="teacherEditDialogVisible"
    :teacher="currentEditTeacher"
    @save="handleTeacherSave"
  />

  <!-- 家长编辑弹窗 -->
  <ParentEditDialog
    v-model="parentEditDialogVisible"
    :parent-data="currentEditParent"
    @save="handleParentSave"
  />

  <!-- 学生编辑弹窗 -->
  <StudentEditDialog
    v-model="studentEditDialogVisible"
    :student-data="currentEditingStudent"
    @submit="handleStudentEditSave"
  />
  </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete, User, ChatDotRound } from '@element-plus/icons-vue'

// 组件导入
import CentersStatCard from '@/components/centers/StatCard.vue'
import ChartContainer from '@/components/centers/ChartContainer.vue'
import ActionCard from '@/components/centers/ActionCard.vue'
import DataTable from '@/components/centers/DataTable.vue'
import DetailPanel from '@/components/centers/DetailPanel.vue'
import FormModal from '@/components/centers/SimpleFormModal.vue'
import TeacherEditDialog from '@/components/TeacherEditDialog.vue'
import ParentEditDialog from '@/components/ParentEditDialog.vue'
import StudentEditDialog from '@/components/dialogs/StudentEditDialog.vue'

// API导入
import { personnelCenterApi } from '@/api/personnel-center'
import {
  createNameColumn,
  createTextColumn,
  createNumberColumn,
  createStatusColumn,
  createDateColumn,
  createPhoneColumn,
  createEmailColumn,
  createActionsColumn
} from '@/utils/table-config'

// 路由
const router = useRouter()

// 标签页配置
const tabs = [
  { key: 'overview', label: '概览', icon: 'grid' },
  { key: 'students', label: '学生管理', icon: 'user' },
  { key: 'parents', label: '家长管理', icon: 'user-group' },
  { key: 'teachers', label: '教师管理', icon: 'user-check' },
  { key: 'classes', label: '班级管理', icon: 'School' }
]

// 当前活跃标签页
const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'overview')

// 表单弹窗状态
const formModalVisible = ref(false)
const formModalTitle = ref('')
const formLoading = ref(false)
const formData = ref({})
const formFields = ref([])

// 教师编辑弹窗状态
const teacherEditDialogVisible = ref(false)
const currentEditTeacher = ref(null)

// 家长编辑弹窗状态
const parentEditDialogVisible = ref(false)
const currentEditParent = ref(null)

// 概览数据
const overviewStats = ref([
  { key: 'students', title: '在校学生', value: 456, unit: '人', trend: 12, trendText: '较上月', type: 'primary', iconName: 'students' },
  { key: 'parents', title: '注册家长', value: 328, unit: '人', trend: 8, trendText: '较上月', type: 'success', iconName: 'customers' },
  { key: 'teachers', title: '在职教师', value: 45, unit: '人', trend: 2, trendText: '较上月', type: 'warning', iconName: 'teachers' },
  { key: 'classes', title: '开设班级', value: 18, unit: '个', trend: 1, trendText: '较上月', type: 'info', iconName: 'classes' }
])

const chartsLoading = ref(false)
const personnelDistributionChart = ref({
  // 注意：ChartContainer 已有标题，这里隐藏 ECharts 内置标题，避免重叠
  title: { show: false },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c}人 ({d}%)'
  },
  // 明亮配色（深色背景下更清晰）
  color: ['#4C7EFF', '#6EE7B7', '#FFA500', '#FF6B6B'],
  legend: {
    orient: 'horizontal',
    left: 'center',
    bottom: '20px',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
    textStyle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#333'
    },
    padding: [8, 0]
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '60px',
    bottom: '80px',
    containLabel: true
  },
  series: [{
    name: '人员分布统计',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '45%'],
    avoidLabelOverlap: true,
    data: [
      { value: 280, name: '学生', itemStyle: { color: '#4C7EFF' } },
      { value: 45, name: '家长', itemStyle: { color: '#10B981' } },
      { value: 35, name: '教师', itemStyle: { color: '#F59E0B' } },
      { value: 8, name: '班级', itemStyle: { color: '#6366F1' } }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    },
    label: {
      show: true,
      position: 'outside',
      formatter: function(params) {
        return params.name + '\n' + params.value + '人\n' + params.percent + '%';
      },
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 20,
      color: '#333',
      distanceToLabelLine: 8,
      // 防止标签过长
      overflow: 'truncate'
    },
    // 开启标签布局以避免重叠
    labelLayout: {
      hideOverlap: true,
      moveOverlap: 'shiftY',
      draggable: true
    },
    // 小扇区不显示外部标签，避免堆叠
    minShowLabelAngle: 10,
    labelLine: {
      show: true,
      length: 20,
      length2: 16,
      smooth: true
    }
  }]
})
const personnelTrendChart = ref({
  title: {
    text: '人员变化趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 700
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['教师', '学生', '家长'],
    top: '20px'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
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
})

const quickActions = ref([
  { key: 'add-student', title: '新增学生', description: '添加新的学生信息', icon: 'UserPlus', color: 'primary' },
  { key: 'add-parent', title: '新增家长', description: '添加新的家长信息', icon: 'UserGroup', color: 'success' },
  { key: 'add-teacher', title: '新增教师', description: '添加新的教师信息', icon: 'user-check', color: 'warning' },
  { key: 'add-class', title: '新增班级', description: '创建新的班级', icon: 'School', color: 'info' }
])

// 学生管理数据
const studentsData = ref([])
const studentsColumns = [
  createNameColumn('姓名', 'name', 'medium', { fixed: 'left' }),
  createTextColumn('学号', 'studentId', 'long'),
  createTextColumn('班级', 'className', 'medium'),
  createTextColumn('性别', 'gender', 'short', { align: 'center' }),
  createNumberColumn('年龄', 'age', 'short'),
  createStatusColumn('状态'),
  createDateColumn('入学时间', 'enrollDate'),
  createActionsColumn('操作', 'large', { fixed: 'right' })
]

// 学生年龄筛选选项
const studentsFilters = [
  { key: 'age_3', label: '3岁' },
  { key: 'age_4', label: '4岁' },
  { key: 'age_5', label: '5岁' },
  { key: 'age_6', label: '6岁' },
  { key: 'age_all', label: '全部' }
]

const studentsLoading = ref(false)
const studentsTotal = ref(0)
const studentsPage = ref(1)
const studentsPageSize = ref(10)
const selectedStudent = ref(null)
const studentDetailLoading = ref(false)
const studentsFilterAge = ref('age_all') // 当前选中的年龄筛选，默认为全部
const studentsSearchKeyword = ref('') // 搜索关键词

// 学生编辑弹窗状态
const studentEditDialogVisible = ref(false)
const currentEditingStudent = ref(null)

const studentDetailSections = [
  { title: '基本信息', fields: [{ key: 'name', label: '姓名', prop: 'name' }, { key: 'studentId', label: '学号', prop: 'studentId' }, { key: 'gender', label: '性别', prop: 'gender' }, { key: 'age', label: '年龄', prop: 'age' }, { key: 'birthday', label: '生日', prop: 'birthday' }] },
  { title: '班级信息', fields: [{ key: 'className', label: '班级', prop: 'className' }, { key: 'enrollDate', label: '入学时间', prop: 'enrollDate' }, { key: 'status', label: '状态', prop: 'status' }] },
  { title: '家长信息', fields: [{ key: 'parentName', label: '家长姓名', prop: 'parentName' }, { key: 'parentPhone', label: '家长电话', prop: 'parentPhone' }, { key: 'parentEmail', label: '家长邮箱', prop: 'parentEmail' }] },
  { title: '成绩记录', fields: [{ key: 'grades', label: '成绩', prop: 'grades' }] }
]

// 家长管理数据
const parentsData = ref([])
const parentsColumns = [
  createNameColumn('姓名', 'name', 'medium', { fixed: 'left' }),
  createPhoneColumn('手机号', 'phone'),
  createEmailColumn('邮箱', 'email'),
  createTextColumn('孩子', 'children', 'medium'),
  createStatusColumn('状态'),
  createDateColumn('注册时间', 'registerDate'),
  createActionsColumn('操作', 'large', { fixed: 'right' })
]
const parentsLoading = ref(false)
const parentsTotal = ref(0)
const parentsPage = ref(1)
const parentsPageSize = ref(10)
const selectedParent = ref(null)
const parentDetailLoading = ref(false)

const parentDetailSections = [
  { title: '基本信息', fields: [{ key: 'name', label: '姓名', prop: 'name' }, { key: 'phone', label: '电话', prop: 'phone' }, { key: 'email', label: '邮箱', prop: 'email' }, { key: 'address', label: '地址', prop: 'address' }] },
  { title: '孩子信息', fields: [{ key: 'children', label: '孩子', prop: 'children' }] },
  { title: '沟通记录', fields: [{ key: 'communication', label: '沟通记录', prop: 'communication' }] },
  { title: '其他信息', fields: [{ key: 'status', label: '状态', prop: 'status' }, { key: 'registerDate', label: '注册时间', prop: 'registerDate' }, { key: 'source', label: '来源', prop: 'source' }] }
]

// 教师管理数据
const teachersData = ref([])
const teachersColumns = [
  createNameColumn('姓名', 'name', 'medium', { fixed: 'left' }),
  createTextColumn('工号', 'employeeId', 'medium'),
  createTextColumn('部门', 'department', 'medium'),
  createTextColumn('职位', 'position', 'medium'),
  createTextColumn('任教班级', 'classes', 'medium'),
  createStatusColumn('状态'),
  createDateColumn('入职时间', 'hireDate'),
  createActionsColumn('操作', 'large', { fixed: 'right' })
]
const teachersLoading = ref(false)
const teachersTotal = ref(0)
const teachersPage = ref(1)
const teachersPageSize = ref(10)
const selectedTeacher = ref(null)
const teacherDetailLoading = ref(false)
const teacherPerformanceChart = ref({})

const teacherDetailSections = [
  { title: '基本信息', fields: ['name', 'employeeId', 'gender', 'age', 'phone'] },
  { title: '职位信息', fields: ['department', 'position', 'hireDate', 'status'] },
  { title: '任教信息', fields: ['classes', 'subjects'] },
  { title: '绩效评估', fields: ['performance'] }
]

// 班级管理数据
const classesData = ref([])
const classesColumns = [
  createTextColumn('班级名称', 'name', 'medium', { fixed: 'left' }),
  createTextColumn('年级', 'grade', 'short', { align: 'center' }),
  createNumberColumn('容量', 'capacity', 'short'),
  createNameColumn('班主任', 'teacherName', 'medium'),
  createTextColumn('教室', 'room', 'short', { align: 'center' }),
  createStatusColumn('状态'),
  createDateColumn('创建时间', 'createDate'),
  createActionsColumn('操作', 'large', { fixed: 'right' })
]
const classesLoading = ref(false)
const classesTotal = ref(0)
const classesPage = ref(1)
const classesPageSize = ref(10)
const selectedClass = ref(null)
const classDetailLoading = ref(false)

const classDetailSections = [
  { title: '基本信息', fields: [{ key: 'name', label: '名称', prop: 'name' }, { key: 'grade', label: '年级', prop: 'grade' }, { key: 'room', label: '教室', prop: 'room' }, { key: 'maxCapacity', label: '最大容量', prop: 'maxCapacity' }] },
  { title: '教师信息', fields: [{ key: 'teacherName', label: '班主任', prop: 'teacherName' }, { key: 'assistantTeacher', label: '副班主任', prop: 'assistantTeacher' }] },
  { title: '学生信息', fields: [{ key: 'students', label: '学生', prop: 'students' }] },
  { title: '其他信息', fields: [{ key: 'status', label: '状态', prop: 'status' }, { key: 'createDate', label: '创建时间', prop: 'createDate' }, { key: 'description', label: '描述', prop: 'description' }] }
]

// 生命周期
onMounted(() => {
  loadOverviewData()
  loadChartsData()

  // 根据当前标签页加载对应数据
  switch (activeTab.value) {
    case 'students':
      loadStudentsData()
      break
    case 'parents':
      loadParentsData()
      break
    case 'teachers':
      loadTeachersData()
      break
    case 'classes':
      loadClassesData()
      break
  }
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'students':
      loadStudentsData()
      break
    case 'parents':
      loadParentsData()
      break
    case 'teachers':
      loadTeachersData()
      break
    case 'classes':
      loadClassesData()
      break
    case 'overview':
      loadOverviewData()
      loadChartsData()
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


// 规范化后端返回的饼图配置，避免与容器标题/布局重叠
const normalizeDistributionOption = (serverOption: any) => {
  const option = serverOption ? JSON.parse(JSON.stringify(serverOption)) : {}

  // 1) 隐藏ECharts标题（外层ChartContainer已有标题）
  option.title = { ...(option.title || {}), show: false }

  // 2) 图例统一放到底部水平居中，避免与图形/标签重叠
  option.legend = {
    ...(option.legend || {}),
    orient: 'horizontal',
    left: 'center',
    bottom: 30,
    itemWidth: 16,
    itemHeight: 16,
    itemGap: 20,
    textStyle: { fontSize: 14, color: '#666', ...(option.legend?.textStyle || {}) },
    padding: [10, 0]
  }

  // 3) grid为底部图例预留空间
  option.grid = { left: 20, right: 20, top: 40, bottom: 80, containLabel: true, ...(option.grid || {}) }

  // 4) 调整饼图半径和中心，统一文本样式，避免遮挡
  if (Array.isArray(option.series)) {
    option.series = option.series.map((s: any) => {
      if (s && (s.type === 'pie' || !s.type)) {
        const base = {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            fontSize: 12,
            color: '#333',
            distanceToLabelLine: 8,
            ...(s.label || {})
          },
          labelLine: { show: true, length: 25, length2: 20, smooth: true, ...(s.labelLine || {}) }
        }
        return { ...base, ...s }
      }
      return s
    })
  }

  return option
}

const loadChartsData = async () => {
  chartsLoading.value = true
  try {
    const [distributionRes, trendRes] = await Promise.all([
      personnelCenterApi.getPersonnelDistribution(),
      personnelCenterApi.getPersonnelTrend()
    ])

    if (distributionRes.success && distributionRes.data) {
      // 规范化服务端配置，统一布局，避免与标题/图例重叠
      personnelDistributionChart.value = normalizeDistributionOption(distributionRes.data)
    }
    // 如果API失败，保留默认的图表数据

    if (trendRes.success && trendRes.data) {
      personnelTrendChart.value = trendRes.data
    }
    // 如果API失败，保留默认的图表数据
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartsLoading.value = false
  }
}

// 概览相关方法
const handleStatClick = (key: string) => {
  activeTab.value = key === 'students' ? 'students' :
                   key === 'parents' ? 'parents' :
                   key === 'teachers' ? 'teachers' :
                   key === 'classes' ? 'classes' : 'overview'
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

// 处理标签页切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  // 直接调用数据加载函数，确保切换时加载数据
  switch (tab) {
    case 'students':
      loadStudentsData()
      break
    case 'parents':
      loadParentsData()
      break
    case 'teachers':
      loadTeachersData()
      break
    case 'classes':
      loadClassesData()
      break
    case 'overview':
      loadOverviewData()
      loadChartsData()
      break
  }
}

// 学生管理相关方法
const loadStudentsData = async () => {
  studentsLoading.value = true
  try {
    console.log('开始加载学生数据，页码:', studentsPage.value, '每页:', studentsPageSize.value)

    // 构建查询参数
    const queryParams: Record<string, any> = {
      page: studentsPage.value,
      pageSize: studentsPageSize.value
    }

    // 添加年龄筛选参数
    if (studentsFilterAge.value && studentsFilterAge.value !== 'age_all') {
      const age = parseInt(studentsFilterAge.value.replace('age_', ''))
      queryParams.age = age
    }

    // 添加搜索关键词参数
    if (studentsSearchKeyword.value) {
      queryParams.keyword = studentsSearchKeyword.value
    }

    // 使用对象解构传递参数，避免params嵌套问题
    const response = await personnelCenterApi.getStudents(queryParams)
    console.log('学生数据API响应:', response)
    if (response.success) {
      // 格式化学生数据
      studentsData.value = response.data.items.map((student: any) => ({
        ...student,
        // 格式化性别显示
        gender: student.gender === 'male' || student.gender === 'MALE' ? '男' :
                student.gender === 'female' || student.gender === 'FEMALE' ? '女' : student.gender,
        // 格式化状态显示 - 确保转换为中文
        status: getStudentStatusText(student.status || ''),
        // 格式化日期显示
        enrollDate: student.enrollDate ? new Date(student.enrollDate).toLocaleDateString('zh-CN') : '-',
        birthday: student.birthday ? new Date(student.birthday).toLocaleDateString('zh-CN') : '-'
      }))
      studentsTotal.value = response.data.total
      console.log('学生数据加载成功，共', studentsTotal.value, '条')
    } else {
      console.error('学生数据API返回失败:', response)
      ElMessage.error(response.message || '加载学生数据失败')
    }
  } catch (error: any) {
    console.error('加载学生数据失败:', error)
    ElMessage.error(error?.response?.data?.message || error?.message || '加载学生数据失败，请检查网络连接')
  } finally {
    studentsLoading.value = false
  }
}

const handleCreateStudent = () => {
  formModalTitle.value = '新增学生'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true, span: 12 },
    { prop: 'studentId', label: '学号', type: 'input', required: true, span: 12 },
    { prop: 'gender', label: '性别', type: 'select', options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ], required: true, span: 12 },
    { prop: 'age', label: '年龄', type: 'number', required: true, span: 12 },
    { prop: 'className', label: '班级', type: 'select', options: [], required: true, span: 12 },
    { prop: 'parentName', label: '家长姓名', type: 'input', required: true, span: 12 },
    { prop: 'parentPhone', label: '家长电话', type: 'input', required: true, span: 12 },
    { prop: 'enrollDate', label: '入学时间', type: 'date', required: true, span: 12 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditStudent = (student: any) => {
  // 改为使用学生编辑弹窗
  currentEditingStudent.value = { ...student }
  studentEditDialogVisible.value = true
}

const handleDeleteStudent = async (student: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个学生吗？', '确认删除', {
      type: 'warning'
    })

    const response = await personnelCenterApi.deleteStudent(student.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadStudentsData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleStudentRowClick = (student: any) => {
  selectedStudent.value = student
  studentDetailLoading.value = true
  setTimeout(() => {
    studentDetailLoading.value = false
  }, 500)
}

const handleStudentsPageChange = (page: number) => {
  studentsPage.value = page
  loadStudentsData()
}

const handleStudentsPageSizeChange = (size: number) => {
  studentsPageSize.value = size
  studentsPage.value = 1 // 重置到第一页
  loadStudentsData()
}

const handleStudentsSearch = (keyword: string) => {
  // 保存搜索关键词
  studentsSearchKeyword.value = keyword
  studentsPage.value = 1
  loadStudentsData()
}

// 处理年龄筛选
const handleStudentsFilter = (filterKey: string) => {
  studentsFilterAge.value = filterKey
  studentsPage.value = 1
  loadStudentsData()
}

const handleStudentDetailSave = (data: any) => {
  console.log('保存学生详情:', data)
  ElMessage.success('学生详情已保存')
}

// 打开学生编辑弹窗
const handleEditStudentDialog = () => {
  if (selectedStudent.value) {
    currentEditingStudent.value = { ...selectedStudent.value }
    studentEditDialogVisible.value = true
  }
}

// 处理学生编辑保存
const handleStudentEditSave = async (data: any) => {
  try {
    console.log('保存学生信息:', data)
    // 这里应该调用API保存学生信息
    // const response = await personnelCenterApi.updateStudent(data.id, data)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('学生信息保存成功')
    studentEditDialogVisible.value = false

    // 刷新学生列表和详情
    loadStudentsData()
    if (selectedStudent.value && selectedStudent.value.id === data.id) {
      selectedStudent.value = { ...data }
    }
  } catch (error) {
    console.error('保存学生信息失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 家长管理相关方法
const loadParentsData = async () => {
  parentsLoading.value = true
  try {
    console.log('开始加载家长数据，页码:', parentsPage.value, '每页:', parentsPageSize.value)
    const response = await personnelCenterApi.getParents({
      page: parentsPage.value,
      pageSize: parentsPageSize.value
    })
    console.log('家长数据API响应:', response)
    if (response.success) {
      // 格式化家长数据
      parentsData.value = response.data.items.map((parent: any) => ({
        ...parent,
        // 格式化状态显示 - 确保转换为中文
        status: getParentStatusText(parent.status || ''),
        // 格式化日期显示
        registerDate: parent.registerDate ? new Date(parent.registerDate).toLocaleDateString('zh-CN') : '-',
        createdAt: parent.createdAt ? new Date(parent.createdAt).toLocaleDateString('zh-CN') : '-'
      }))
      parentsTotal.value = response.data.total
      console.log('家长数据加载成功，共', parentsTotal.value, '条')
    } else {
      console.error('家长数据API返回失败:', response)
      ElMessage.error(response.message || '加载家长数据失败')
    }
  } catch (error: any) {
    console.error('加载家长数据失败:', error)
    ElMessage.error(error?.response?.data?.message || error?.message || '加载家长数据失败，请检查网络连接')
  } finally {
    parentsLoading.value = false
  }
}

const handleCreateParent = () => {
  formModalTitle.value = '新增家长'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true, span: 12 },
    { prop: 'phone', label: '手机号', type: 'input', required: true, span: 12 },
    { prop: 'email', label: '邮箱', type: 'input', span: 12 },
    { prop: 'address', label: '地址', type: 'input', span: 12 },
    { prop: 'relationship', label: '与孩子关系', type: 'select', options: [
      { label: '父亲', value: 'father' },
      { label: '母亲', value: 'mother' },
      { label: '爷爷', value: 'grandfather' },
      { label: '奶奶', value: 'grandmother' },
      { label: '其他', value: 'other' }
    ], required: true, span: 12 },
    { prop: 'occupation', label: '职业', type: 'input', span: 12 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditParent = (parent: any) => {
  console.log('编辑家长被调用:', parent)
  currentEditParent.value = parent
  parentEditDialogVisible.value = true
  console.log('弹窗状态设置为:', parentEditDialogVisible.value)
}

const handleDeleteParent = async (parent: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个家长吗？', '确认删除', {
      type: 'warning'
    })

    const response = await personnelCenterApi.deleteParent(parent.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadParentsData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除家长失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleParentRowClick = (parent: any) => {
  // 取消右侧详情行为，仅保留选中状态（供其他操作使用）
  selectedParent.value = parent
}

const handleParentsPageChange = (page: number) => {
  parentsPage.value = page
  loadParentsData()
}

const handleParentsPageSizeChange = (size: number) => {
  parentsPageSize.value = size
  parentsPage.value = 1 // 重置到第一页
  loadParentsData()
}

const handleParentsSearch = (params: any) => {
  parentsPage.value = 1
  loadParentsData()
}

const handleParentDetailSave = (data: any) => {
  console.log('保存家长详情:', data)
  ElMessage.success('家长详情已保存')
}

// 孩子管理
const handleManageChildren = (parent: any) => {
  console.log('管理孩子:', parent)
  ElMessage.info('孩子管理功能开发中')
}

// 沟通记录
const handleContactRecord = (parent: any) => {
  console.log('查看沟通记录:', parent)
  ElMessage.info('沟通记录功能开发中')
}

// 保存家长信息
const handleParentSave = async (parentData: any) => {
  try {
    // 这里应该调用API保存家长数据
    console.log('保存家长信息:', parentData)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('家长信息保存成功')
    parentEditDialogVisible.value = false
    currentEditParent.value = null

    // 重新加载家长列表
    loadParentsData()
  } catch (error) {
    console.error('保存家长信息失败:', error)
    ElMessage.error('保存家长信息失败')
  }
}

// 教师管理相关方法
const loadTeachersData = async () => {
  teachersLoading.value = true
  try {
    const response = await personnelCenterApi.getTeachers({
      page: teachersPage.value,
      pageSize: teachersPageSize.value
    })
    if (response.success) {
      // 格式化教师数据
      teachersData.value = response.data.items.map((teacher: any) => ({
        ...teacher,
        // ✅ 后端已返回中文状态，不需要再次转换
        // status: getTeacherStatusText(teacher.status || ''),
        // ✅ 后端已返回中文部门，不需要转换
        // department: teacher.department (已经是中文)
        // ✅ 后端已返回中文职位，不需要转换
        // position: teacher.position (已经是中文)
        // 格式化日期显示
        hireDate: teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString('zh-CN') : '-',
        createdAt: teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('zh-CN') : '-'
      }))
      teachersTotal.value = response.data.total
    }
  } catch (error) {
    console.error('加载教师数据失败:', error)
  } finally {
    teachersLoading.value = false
  }
}

const handleCreateTeacher = () => {
  formModalTitle.value = '新增教师'
  formFields.value = [
    { prop: 'name', label: '姓名', type: 'input', required: true, span: 12 },
    { prop: 'employeeId', label: '工号', type: 'input', required: true, span: 12 },
    { prop: 'phone', label: '手机号', type: 'input', required: true, span: 12 },
    { prop: 'email', label: '邮箱', type: 'input', span: 12 },
    { prop: 'department', label: '部门', type: 'select', options: [
      { label: '教学部', value: 'teaching' },
      { label: '行政部', value: 'admin' },
      { label: '后勤部', value: 'logistics' }
    ], required: true, span: 12 },
    { prop: 'position', label: '职位', type: 'input', required: true, span: 12 },
    { prop: 'hireDate', label: '入职时间', type: 'date', required: true, span: 12 },
    { prop: 'salary', label: '薪资', type: 'number', span: 12 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditTeacher = (teacher: any) => {
  currentEditTeacher.value = teacher
  teacherEditDialogVisible.value = true
}

const handleTeacherSave = async (teacherData: any) => {
  try {
    // 这里应该调用API保存教师数据
    console.log('保存教师数据:', teacherData)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('教师信息保存成功')
    teacherEditDialogVisible.value = false
    currentEditTeacher.value = null

    // 重新加载教师列表
    loadTeachersData()
  } catch (error) {
    console.error('保存教师信息失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleDeleteTeacher = async (teacher: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个教师吗？', '确认删除', {
      type: 'warning'
    })

    const response = await personnelCenterApi.deleteTeacher(teacher.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadTeachersData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除教师失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleTeacherRowClick = (teacher: any) => {
  selectedTeacher.value = teacher
  teacherDetailLoading.value = true
  setTimeout(() => {
    teacherDetailLoading.value = false
  }, 500)
}

const handleTeachersPageChange = (page: number) => {
  teachersPage.value = page
  loadTeachersData()
}

const handleTeachersPageSizeChange = (size: number) => {
  teachersPageSize.value = size
  teachersPage.value = 1 // 重置到第一页
  loadTeachersData()
}

const handleTeachersSearch = (params: any) => {
  teachersPage.value = 1
  loadTeachersData()
}

const handleTeacherDetailSave = (data: any) => {
  console.log('保存教师详情:', data)
  ElMessage.success('教师详情已保存')
}

// 班级管理相关方法
const loadClassesData = async () => {
  classesLoading.value = true
  try {
    const response = await personnelCenterApi.getClasses({
      page: classesPage.value,
      pageSize: classesPageSize.value
    })
    if (response.success) {
      // 格式化班级数据，确保状态转换为中文
      classesData.value = response.data.items.map((cls: any) => ({
        ...cls,
        status: cls.status ? (cls.status === 'active' ? '正常' : cls.status === 'inactive' ? '停用' : cls.status) : '未知'
      }))
      classesTotal.value = response.data.total
    }
  } catch (error) {
    console.error('加载班级数据失败:', error)
  } finally {
    classesLoading.value = false
  }
}

const handleCreateClass = () => {
  formModalTitle.value = '新增班级'
  formFields.value = [
    { prop: 'name', label: '班级名称', type: 'input', required: true, span: 12 },
    { prop: 'grade', label: '年级', type: 'select', options: [
      { label: '小班', value: 'small' },
      { label: '中班', value: 'medium' },
      { label: '大班', value: 'large' }
    ], required: true, span: 12 },
    { prop: 'maxCapacity', label: '最大容量', type: 'number', required: true, span: 12 },
    { prop: 'room', label: '教室', type: 'input', required: true, span: 12 },
    { prop: 'teacherId', label: '班主任', type: 'select', options: [], required: true, span: 12 },
    { prop: 'assistantTeacherId', label: '副班主任', type: 'select', options: [], span: 12 },
    { prop: 'description', label: '班级描述', type: 'textarea', span: 24 }
  ]
  formData.value = {}
  formModalVisible.value = true
}

const handleEditClass = (cls: any) => {
  formModalTitle.value = '编辑班级'
  formFields.value = [
    { prop: 'name', label: '班级名称', type: 'input', required: true, span: 12 },
    { prop: 'grade', label: '年级', type: 'select', options: [
      { label: '小班', value: 'small' },
      { label: '中班', value: 'medium' },
      { label: '大班', value: 'large' }
    ], required: true, span: 12 },
    { prop: 'maxCapacity', label: '最大容量', type: 'number', required: true, span: 12 },
    { prop: 'room', label: '教室', type: 'input', required: true, span: 12 },
    { prop: 'status', label: '状态', type: 'select', options: [
      { label: '正常', value: 'active' },
      { label: '暂停', value: 'inactive' }
    ], required: true, span: 12 }
  ]
  formData.value = { ...cls }
  formModalVisible.value = true
}

const handleDeleteClass = async (cls: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个班级吗？', '确认删除', {
      type: 'warning'
    })

    const response = await personnelCenterApi.deleteClass(cls.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadClassesData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除班级失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleClassRowClick = (cls: any) => {
  // 点击行直接打开编辑弹窗
  handleEditClass(cls)
}

const handleClassesPageChange = (page: number) => {
  classesPage.value = page
  loadClassesData()
}

const handleClassesPageSizeChange = (size: number) => {
  classesPageSize.value = size
  classesPage.value = 1 // 重置到第一页
  loadClassesData()
}

const handleClassesSearch = (params: any) => {
  classesPage.value = 1
  loadClassesData()
}

const handleClassDetailSave = (data: any) => {
  console.log('保存班级详情:', data)
  ElMessage.success('班级详情已保存')
}

// 表单保存
const handleFormSave = async (data: any) => {
  formLoading.value = true
  try {
    let response
    const isEdit = !!data.id

    if (formModalTitle.value.includes('学生')) {
      response = isEdit
        ? await personnelCenterApi.updateStudent(data.id, data)
        : await personnelCenterApi.createStudent(data)
      if (response.success) {
        ElMessage.success(isEdit ? '学生信息更新成功' : '学生创建成功')
        loadStudentsData()
      }
    } else if (formModalTitle.value.includes('家长')) {
      response = isEdit
        ? await personnelCenterApi.updateParent(data.id, data)
        : await personnelCenterApi.createParent(data)
      if (response.success) {
        ElMessage.success(isEdit ? '家长信息更新成功' : '家长创建成功')
        loadParentsData()
      }
    } else if (formModalTitle.value.includes('教师')) {
      response = isEdit
        ? await personnelCenterApi.updateTeacher(data.id, data)
        : await personnelCenterApi.createTeacher(data)
      if (response.success) {
        ElMessage.success(isEdit ? '教师信息更新成功' : '教师创建成功')
        loadTeachersData()
      }
    } else if (formModalTitle.value.includes('班级')) {
      response = isEdit
        ? await personnelCenterApi.updateClass(data.id, data)
        : await personnelCenterApi.createClass(data)
      if (response.success) {
        ElMessage.success(isEdit ? '班级信息更新成功' : '班级创建成功')
        loadClassesData()
      }
    }

    formModalVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    formLoading.value = false
  }
}

// 工具函数
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const getCapacityPercentage = (row: any) => {
  if (!row || !row.maxCapacity || row.maxCapacity === 0) return 0
  const currentStudents = row.currentStudents || 0
  const percentage = (currentStudents / row.maxCapacity) * 100
  const validPercentage = Math.min(Math.max(percentage, 0), 100)
  // 确保返回的是有限数字
  return isNaN(validPercentage) || !isFinite(validPercentage) ? 0 : validPercentage
}

const getStudentStatusType = (status: string) => {
  const types = {
    active: 'success',
    suspended: 'warning',
    graduated: 'info'
  }
  return types[status] || 'info'
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
  const types = {
    active: 'success',
    inactive: 'danger'
  }
  return types[status] || 'info'
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
  const types = {
    active: 'success',
    inactive: 'danger',
    leave: 'warning'
  }
  return types[status] || 'info'
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

const getGradeType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

const getGradeLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  return '待提高'
}

const getCommunicationTypeColor = (type: string) => {
  const colors = {
    phone: 'primary',
    visit: 'success',
    message: 'info',
    email: 'warning'
  }
  return colors[type] || 'info'
}
</script>

<style scoped lang="scss">
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";
.personnel-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3xl);
  background: var(--bg-secondary, var(--bg-container));
}

/* .page-header 样式已移至全局 center-common.scss 中统一管理 */

.main-content {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  transition: all var(--transition-normal);

  // 标签页美化
  :deep(.el-tabs) {
    .el-tabs__header {
      margin-bottom: var(--spacing-xl);
      border-bottom: var(--transform-drop) solid var(--border-color);
      transition: all var(--transition-normal);
    }

    .el-tabs__nav {
      display: flex;
      gap: var(--spacing-lg);
    }

    .el-tabs__item {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--text-base);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
      border: none;
      border-bottom: 3px solid transparent;
      transition: all var(--transition-fast);
      position: relative;

      &:hover {
        color: var(--text-primary);
        border-bottom-color: var(--primary-light);
      }

      &.is-active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        font-weight: var(--font-semibold);

        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          min-height: 32px; height: auto;
          background: linear-gradient(90deg, var(--primary-color), transparent);
          opacity: 0.5;
        }
      }
    }
  }
}

// 统计区域样式 - 重新设计
.stats-section {
  margin-bottom: var(--spacing-2xl);
  background: transparent;

  .cds-grid, .cds-row {
    background: transparent;
  }

  // 统计卡片使用统一样式系统
  :deep(.stat-card) {
    min-height: var(--card-height-lg);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;

    // 卡片背景装饰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: var(--decoration-size-lg);
      height: var(--decoration-size-lg);
      background: radial-gradient(circle, var(--primary-light-bg) 0%, transparent 70%);
      opacity: 0.5;
      pointer-events: none;
    }

    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-var(--spacing-xs));
      border-color: var(--primary-color);
    }

    // 卡片内容
    .stat-content {
      position: relative;
      z-index: var(--z-index-dropdown);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-trend {
        font-size: var(--text-xs);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        &.trend-up {
          color: var(--success-color);
        }

        &.trend-down {
          color: var(--danger-color);
        }
      }
    }
  }
}

// 概览内容样式 - 优化后
.overview-content {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: transparent;

  .charts-grid {
    --chart-height: var(--chart-height-lg);
    --chart-min-height: var(--chart-height-md);

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
    }

    // 图表容器样式优化
    :deep(.chart-container) {
      padding: var(--spacing-xl);
      border-radius: var(--radius-lg);
      border: var(--border-width-base) solid var(--border-color);
      box-shadow: var(--shadow-sm);
      background: var(--bg-card);
      min-height: var(--chart-height-md);
      height: var(--chart-height, var(--chart-height-lg));
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;

      // 图表背景装饰
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -10%;
        width: var(--decoration-size-xl);
        height: var(--decoration-size-xl);
        background: radial-gradient(circle, var(--primary-light-bg) 0%, transparent 70%);
        opacity: 0.3;
        pointer-events: none;
      }

      &:hover {
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-color);
      }

      .chart-header {
        margin-bottom: var(--spacing-lg);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        z-index: var(--z-index-dropdown);

        .chart-info {
          flex: 1;

          .chart-title {
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-2xs);
            line-height: 1.4;
          }

          .chart-subtitle {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            line-height: 1.4;
          }
        }

        .chart-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .chart-content {
        // ECharts 文字样式优化
        .echarts {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      }
    }
  }

  .quick-actions {
    margin-top: var(--spacing-xl);

    .actions-header {
      margin-bottom: var(--spacing-md);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        line-height: 1.4;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(var(--action-grid-columns), 1fr);
      gap: var(--spacing-lg);

      @media (max-width: var(--breakpoint-2xl)) {
        grid-template-columns: repeat(var(--action-grid-columns-tablet), 1fr);
      }

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }

      // 操作卡片样式优化
      :deep(.action-card) {
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        box-shadow: var(--shadow-sm);
        transition: var(--transition-base);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        &:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(var(--transform-hover-lift));
          border-color: var(--primary-color);
          background: linear-gradient(135deg, var(--primary-light-bg) 0%, rgba(99, 102, 241, 0.1) 100%);
        }

        .action-icon {
          width: var(--size-icon-lg);
          height: var(--size-icon-lg);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;

          .action-title {
            font-size: var(--text-base);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-2xs);
            line-height: 1.4;
          }

          .action-description {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            line-height: 1.4;
          }
        }

        .action-arrow {
          width: var(--text-2xl);
          height: var(--text-2xl);
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        &:hover .action-arrow {
          transform: translateX(var(--spacing-xs));
          color: var(--primary-color);
        }
      }
    }
  }
}

// 管理模块通用样式
.students-content,
.parents-content,
.teachers-content,
.classes-content {
  height: 100%;
  background: transparent;

  .students-layout,
  .parents-layout,
  .classes-layout {
    display: flex;
    height: 100%;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);

    .students-list,
    .parents-list,
    .classes-list {
      flex: 1;
      background: transparent; /* 去掉白色卡片背景 */
      border-radius: 0;
      box-shadow: none;
      padding: 0; /* 留给 DataTable 自己处理 */

      // 列表头部样式
      .list-header {
        margin-bottom: var(--spacing-xl);
        padding-bottom: var(--spacing-lg);
        border-bottom: var(--z-index-dropdown) solid var(--border-light);

        .list-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          line-height: 1.4;
        }

        .list-actions {
          display: flex;
          gap: var(--spacing-md);

          .el-button {
            padding: var(--spacing-md) var(--spacing-lg);
            font-size: var(--text-sm);
            border-radius: var(--radius-md);
          }
        }
      }

      // 搜索区域样式
      .search-section {
        margin-bottom: var(--spacing-xl);

        .el-input {
          .el-input__wrapper {
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
          }
        }
      }

      // 表格样式优化
      :deep(.el-table) {
        background: transparent;
        border: none;

        .el-table__header {
          background: transparent;

          th {
            background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
            color: var(--text-primary);
            font-weight: var(--font-semibold);
            padding: var(--spacing-lg) var(--spacing-md);
            border-bottom: var(--transform-drop) solid var(--border-light);
            transition: all var(--transition-fast);

            &:hover {
              background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
            }
          }
        }

        .el-table__body {
          tr {
            transition: all var(--transition-fast);

            &:hover {
              background: var(--bg-hover);

              td {
                background: var(--bg-hover);
              }
            }
          }

          td {
            padding: var(--spacing-lg) var(--spacing-md);
            border-bottom: var(--z-index-dropdown) solid var(--border-color);
            background: transparent;
            transition: all var(--transition-fast);

            .cell {
              line-height: var(--line-height-normal);
              color: var(--text-primary);
            }
          }
        }
      }
    }
  }

  .teachers-layout {
    display: flex;
    height: 100%;

    .teachers-list {
      flex: 1;
      width: 100%;
      // 移除右边框，因为没有右侧详情面板
    }

    /* 隐藏班级详情面板 */
    .class-detail { display: none; }
    /* 其他详情面板样式保持 */
    .student-detail,
    .parent-detail,
    .teacher-detail {
      width: var(--detail-panel-width);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--spacing-2xl);
      border: var(--border-width-base) solid var(--border-color);
      transition: all var(--transition-normal);

      @media (max-width: var(--breakpoint-xl)) {
        width: var(--detail-panel-width-tablet);
      }

      @media (max-width: var(--breakpoint-md)) {
        display: none;
      }

      // 详情面板内容样式
      .detail-header {
        margin-bottom: var(--spacing-3xl);
        padding-bottom: var(--spacing-lg);
        border-bottom: var(--border-width) solid var(--border-light);

        .detail-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          line-height: 1.4;
        }

        .detail-subtitle {
          font-size: var(--text-base);
          color: var(--info-color);
          line-height: 1.5;
        }
      }

      .detail-content {
        .detail-section {
          margin-bottom: var(--spacing-xl);

          .section-title {
            font-size: var(--text-lg);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            margin-bottom: var(--spacing-md);
            line-height: 1.4;
          }

          .section-content {
            .detail-item {
              display: flex;
              margin-bottom: var(--spacing-md);
              line-height: 1.5;

              .item-label {
                width: var(--detail-label-width);
                color: var(--text-secondary);
                font-size: var(--text-sm);
                flex-shrink: 0;
              }

              .item-value {
                flex: 1;
                color: var(--text-primary);
                font-size: var(--text-sm);
              }
            }
          }
        }
      }
    }
  }
}

/* 班级管理采用与教师管理一致的无卡片布局（去灰色留白） */
.classes-content {
  background: transparent;
  .classes-layout {
    padding: 0; /* 去掉外围留白 */
    gap: 0;     /* 不需要网格间距 */
  }
  .classes-list {
    flex: 1;
    width: 100%;
    background: transparent; /* 不使用白色卡片容器 */
    border-radius: 0;
    box-shadow: none;
    padding: 0; /* 内边距交给表格组件自身处理 */
  }
}


// 详情面板特殊字段样式
.grades-section {
  .grade-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) 0;
    border-bottom: var(--z-index-dropdown) solid var(--border-light);
    line-height: 1.5;

    &:last-child {
      border-bottom: none;
    }

    .subject {
      font-weight: var(--font-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .score {
      font-weight: var(--font-semibold);
      color: var(--primary-color);
    }
  }
}

.communication-section {
  .communication-item {
    padding: var(--spacing-md) 0;
    border-bottom: var(--z-index-dropdown) solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .communication-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xs);

      .date {
        font-size: var(--text-xs);
        color: var(--text-secondary);
      }
    }

    .communication-content {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.5;
      color: var(--text-primary);
    }
  }
}

.performance-section {
  .performance-chart {
    margin-top: var(--text-lg);
  }
}

.students-section {
  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--student-card-min-width), 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);

    .student-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);

      .student-name {
        margin-top: var(--spacing-xs);
        font-size: var(--text-xs);
        text-align: center;
        color: var(--text-primary);
      }
    }
  }
}

.capacity-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);

  span {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

.child-tag,
.class-tag {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-2xs) var(--spacing-xs);
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
  line-height: 1.4;
}

// 操作按钮样式
.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;

  .el-button {
    padding: var(--spacing-2xs) var(--spacing-md);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
    line-height: 1.4;

    &.el-button--small {
      padding: var(--spacing-2xs) var(--spacing-xs);
      font-size: var(--text-xs);
    }

    &.el-button--mini {
      padding: var(--spacing-2xs) var(--spacing-2xs);
      font-size: var(--text-xs);
    }
  }
}

// 响应式设计 - 完整的断点系统
@media (max-width: var(--breakpoint-xl)) {
  .stats-grid-unified {
    grid-template-columns: repeat(var(--stats-grid-columns-tablet), 1fr);
    gap: var(--spacing-xl);
  }

  .charts-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .actions-grid-unified {
    grid-template-columns: repeat(var(--action-grid-columns-tablet), 1fr);
    gap: var(--spacing-xl);
  }
}

@media (max-width: 992px) {
  .personnel-center-timeline {
    padding: var(--spacing-xl);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .welcome-section {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
    text-align: left;
  }

  .stats-grid-unified {
    grid-template-columns: repeat(var(--stats-grid-columns-mobile), 1fr);
    gap: var(--spacing-lg);
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  // 管理模块平板端优化
  .students-content,
  .parents-content,
  .teachers-content,
  .classes-content {
    .students-layout,
    .parents-layout,
    .classes-layout {
      flex-direction: column;
      gap: var(--spacing-lg);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .personnel-center-timeline {
    padding: var(--spacing-lg);
  }

  .page-header {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-lg);

    .header-content {
      .page-title {
        font-size: var(--text-2xl);
      }

      .page-description {
        font-size: var(--text-xs);
      }
    }

    .header-actions {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .main-content {
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);

    .welcome-content {
      text-align: center;
      margin-bottom: var(--spacing-lg);

      h2 {
        font-size: var(--text-xl);
      }

      p {
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      margin-left: 0;
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .stats-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .charts-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);

    :deep(.chart-container) {
      padding: var(--spacing-lg);
      height: var(--chart-height-mobile);
    }
  }

  .actions-grid-unified {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);

    :deep(.action-card) {
      padding: var(--spacing-lg);
    }
  }

  // 管理模块移动端优化
  .students-content,
  .parents-content,
  .teachers-content,
  .classes-content {
    .students-layout,
    .parents-layout,
    .classes-layout {
      flex-direction: column;
      padding: 0;
      gap: 0;

      .students-list,
      .parents-list,
      .classes-list {
        padding: 0;
      }
    }
  }

  // 统计卡片移动端优化
  .stats-section {
    margin-bottom: var(--spacing-2xl);

    :deep(.stat-card) {
      padding: var(--spacing-xl);

      .stat-content {
        .stat-value {
          font-size: var(--text-2xl);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .welcome-section {
    padding: var(--spacing-lg);

    .welcome-content {
      h2 {
        font-size: var(--text-xl);
      }

      p {
        font-size: var(--text-sm);
      }
    }
  }

  .stats-grid-unified {
    gap: var(--spacing-md);
  }

  .charts-grid-unified {
    gap: var(--spacing-lg);

    :deep(.chart-container) {
      padding: var(--spacing-lg);
    }
  }

  .actions-grid-unified {
    gap: var(--spacing-md);

    :deep(.action-card) {
      padding: var(--spacing-lg);
    }
  }
}
</style>
