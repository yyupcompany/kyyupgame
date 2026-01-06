<template>
  <div class="class-course-container class-management-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">班级管理</h1>
      <p class="page-description">管理幼儿园班级信息，包括班级设置、学生分配、教师安排等</p>
    
      <div class="header-actions">
        <el-button class="header-btn primary" @click="handleAddClass">
          <UnifiedIcon name="Plus" />
          新增班级
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalClasses }}</div>
                <div class="stat-label">总班级数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon students">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalStudents }}</div>
                <div class="stat-label">总学生数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon teachers">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalTeachers }}</div>
                <div class="stat-label">总教师数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon capacity">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageCapacity }}%</div>
                <div class="stat-label">平均满员率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索班级名称、编号"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.ageGroup" placeholder="年龄段" clearable>
              <el-option label="全部年龄段" value="" />
              <el-option label="小班" value="small" />
              <el-option label="中班" value="medium" />
              <el-option label="大班" value="large" />
              <el-option label="学前班" value="preschool" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="正常" value="active" />
              <el-option label="暂停" value="suspended" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-select v-model="searchForm.teacher" placeholder="主班教师" clearable>
              <el-option label="全部教师" value="" />
              <el-option 
                v-for="teacher in teacherList" 
                :key="teacher.id" 
                :label="teacher.name" 
                :value="teacher.id"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="search-actions">
              <el-button class="search-btn" @click="handleSearch">
                <UnifiedIcon name="Search" />
                搜索
              </el-button>
              <el-button class="reset-btn" @click="handleReset">
                <UnifiedIcon name="Refresh" />
                重置
              </el-button>
            </div>
          </el-col>
        </el-row>
        
        <!-- 按钮排版修复：独立的操作按钮区域 -->
        <el-row class="action-row">
          <el-col :span="24">
            <div class="action-buttons">
              <el-button type="success" @click="handleCreate">
                <UnifiedIcon name="Plus" />
                新建班级
              </el-button>
              <el-button type="warning" @click="handleBatchAssign" :disabled="selectedClasses.length === 0">
                <UnifiedIcon name="default" />
                批量分配教师
                <span v-if="selectedClasses.length > 0" class="selected-count">({{ selectedClasses.length }})</span>
              </el-button>
              <el-button type="danger" @click="handleBatchDelete" :disabled="selectedClasses.length === 0">
                <UnifiedIcon name="Delete" />
                批量删除
                <span v-if="selectedClasses.length > 0" class="selected-count">({{ selectedClasses.length }})</span>
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">班级列表</div>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="班级名称" min-width="150" />
        <el-table-column prop="code" label="班级编号" width="120" />
        <el-table-column prop="ageGroup" label="年龄段" width="100">
          <template #default="{ row }">
            <el-tag :type="getAgeGroupTagType(row.ageGroup)">
              {{ getAgeGroupLabel(row.ageGroup) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" width="80">
          <template #default="{ row }">
            {{ row.currentStudents }}/{{ row.maxCapacity }}
          </template>
        </el-table-column>
        <el-table-column prop="occupancyRate" label="满员率" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.currentStudents / row.maxCapacity) * 100)"
              :color="getOccupancyColor(row.currentStudents / row.maxCapacity)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column prop="mainTeacher" label="主班教师" width="120">
          <template #default="{ row }">
            {{ getTeacherName(row.mainTeacher) }}
          </template>
        </el-table-column>
        <el-table-column prop="assistantTeacher" label="副班教师" width="120">
          <template #default="{ row }">
            {{ getTeacherName(row.assistantTeacher) }}
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开班时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-actions-buttons">
              <el-button type="primary" size="small" @click="handleView(row)">
                <UnifiedIcon name="eye" />
                查看
              </el-button>
              <el-button type="success" size="small" @click="handleManageStudents(row)">
                <UnifiedIcon name="default" />
                学生
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">
                <UnifiedIcon name="Edit" />
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                <UnifiedIcon name="Delete" />
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑班级对话框 -->
    <el-dialog
      v-model="classDialogVisible"
      :title="isEdit ? '编辑班级' : '新建班级'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="classForm" 
        :rules="classRules" 
        ref="classFormRef" 
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级名称" prop="name">
              <el-input v-model="classForm.name" placeholder="请输入班级名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级编号" prop="code">
              <el-input v-model="classForm.code" placeholder="请输入班级编号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄段" prop="ageGroup">
              <el-select v-model="classForm.ageGroup" placeholder="选择年龄段" style="width: 100%">
                <el-option label="小班" value="small" />
                <el-option label="中班" value="medium" />
                <el-option label="大班" value="large" />
                <el-option label="学前班" value="preschool" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大容量" prop="maxCapacity">
              <el-input-number
                v-model="classForm.maxCapacity"
                :min="1"
                :max="50"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主班教师" prop="mainTeacher">
              <el-select v-model="classForm.mainTeacher" placeholder="选择主班教师" style="width: 100%">
                <el-option 
                  v-for="teacher in teacherList" 
                  :key="teacher.id" 
                  :label="teacher.name" 
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副班教师">
              <el-select v-model="classForm.assistantTeacher" placeholder="选择副班教师" style="width: 100%">
                <el-option label="暂无" value="" />
                <el-option 
                  v-for="teacher in teacherList" 
                  :key="teacher.id" 
                  :label="teacher.name" 
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教室" prop="classroom">
              <el-input v-model="classForm.classroom" placeholder="请输入教室号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开班时间" prop="startDate">
              <el-date-picker
                v-model="classForm.startDate"
                type="date"
                placeholder="选择开班时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="班级描述">
          <el-input
            v-model="classForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入班级描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="classForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="suspended">暂停</el-radio>
            <el-radio label="ended">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="classDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 学生管理对话框 -->
    <el-dialog
      v-model="studentDialogVisible"
      title="学生管理"
      width="800px"
    >
      <div v-if="currentClass" class="student-management">
        <div class="class-info">
          <h3>{{ currentClass.name }} - 学生管理</h3>
          <p>当前学生：{{ currentClass.currentStudents }}人 / 最大容量：{{ currentClass.maxCapacity }}人</p>
        </div>

        <div class="student-actions">
          <el-button type="primary" @click="handleAddStudent">
            <UnifiedIcon name="Plus" />
            添加学生
          </el-button>
          <el-button type="warning" @click="handleTransferStudents" :disabled="selectedStudents.length === 0">
            转班
            <span v-if="selectedStudents.length > 0" class="selected-count">({{ selectedStudents.length }})</span>
          </el-button>
          <el-button type="danger" @click="handleRemoveStudents" :disabled="selectedStudents.length === 0">
            移除
            <span v-if="selectedStudents.length > 0" class="selected-count">({{ selectedStudents.length }})</span>
          </el-button>
        </div>

        <el-table
          :data="studentList"
          @selection-change="handleStudentSelectionChange"
          style="width: 100%; margin-top: 16px"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="{ row }">
              {{ row.gender === 'male' ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="parentName" label="家长姓名" width="120" />
          <el-table-column prop="parentPhone" label="联系电话" width="150" />
          <el-table-column prop="enrollDate" label="入学时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.enrollDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
                {{ row.status === 'active' ? '在读' : '请假' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleViewStudent(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="studentDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
// 图标已全部替换为UnifiedIcon组件
import { getClassList, deleteClass, createClass, updateClass, getClassStatistics } from '@/api/modules/class'
import { getTeacherList } from '@/api/modules/teacher'
import { formatDate, formatDateTime } from '@/utils/dateFormat'

// 班级接口
interface ClassInfo {
  id?: string;
  name: string;
  code: string
  ageGroup: string
  maxCapacity: number
  currentStudents: number
  mainTeacher: string
  assistantTeacher?: string;
  classroom: string;
  status: string
  startDate: string
  description?: string
}

// 教师接口
interface Teacher {
  id: string;
  name: string
}

// 学生接口
interface Student {
  id: string;
  name: string;
  gender: string;
  age: number
  parentName: string
  parentPhone: string
  enrollDate: string;
  status: string
}

// 统计信息接口
interface ClassStats {
  totalClasses: number
  totalStudents: number
  totalTeachers: number
  averageCapacity: number
}

// 搜索表单接口
interface SearchForm {
  keyword: string
  ageGroup: string;
  status: string;
  teacher: string
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)

// 统计数据
const stats = ref<ClassStats>({
  totalClasses: 0,
  totalStudents: 0,
  totalTeachers: 0,
  averageCapacity: 0
})

// 表格数据
const tableData = ref<ClassInfo[]>([])
const selectedClasses = ref<ClassInfo[]>([])

// 教师列表
const teacherList = ref<Teacher[]>([])

// 搜索表单
const searchForm = ref<SearchForm>({
  keyword: '',
  ageGroup: '',
  status: '',
  teacher: ''
})

// 分页
const pagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框状态
const classDialogVisible = ref(false)
const studentDialogVisible = ref(false)
const isEdit = ref(false)

// 表单数据
const classFormRef = ref<FormInstance>()
const classForm = ref<ClassInfo>({
  name: '',
  code: '',
  ageGroup: '',
  maxCapacity: 25,
  currentStudents: 0,
  mainTeacher: '',
  assistantTeacher: '',
  classroom: '',
  status: 'active',
  startDate: '',
  description: ''
})

const classRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入班级编号', trigger: 'blur' }
  ],
  ageGroup: [
    { required: true, message: '请选择年龄段', trigger: 'change' }
  ],
  maxCapacity: [
    { required: true, message: '请输入最大容量', trigger: 'blur' }
  ],
  mainTeacher: [
    { required: true, message: '请选择主班教师', trigger: 'change' }
  ],
  classroom: [
    { required: true, message: '请输入教室号', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开班时间', trigger: 'change' }
  ]
}

// 学生管理相关
const currentClass = ref<ClassInfo | null>(null)
const studentList = ref<Student[]>([])
const selectedStudents = ref<Student[]>([])

// 获取统计数据
const loadStats = async () => {
  try {
    const response = await getClassStatistics()
    if (response.success && response.data) {
      const data = response.data[0] || response.data
      stats.value = {
        totalClasses: data.totalClasses || 0,
        totalStudents: data.totalStudents || 0,
        totalTeachers: data.totalTeachers || 0,
        averageCapacity: data.averageCapacityRate || 0
      }
    } else {
      // 如果API返回失败，使用默认值
      stats.value = {
        totalClasses: tableData.value.length,
        totalStudents: tableData.value.reduce((sum, cls) => sum + cls.currentStudents, 0),
        totalTeachers: teacherList.value.length,
        averageCapacity: tableData.value.length > 0 
          ? Math.round((tableData.value.reduce((sum, cls) => sum + (cls.currentStudents / cls.maxCapacity), 0) / tableData.value.length) * 100)
          : 0
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 在错误情况下使用本地计算的统计数据
    stats.value = {
      totalClasses: tableData.value.length,
      totalStudents: tableData.value.reduce((sum, cls) => sum + cls.currentStudents, 0),
      totalTeachers: teacherList.value.length,
      averageCapacity: tableData.value.length > 0 
        ? Math.round((tableData.value.reduce((sum, cls) => sum + (cls.currentStudents / cls.maxCapacity), 0) / tableData.value.length) * 100)
        : 0
    }
  }
}

// 获取教师列表
const loadTeacherList = async () => {
  try {
    const response = await getTeacherList()
    if (response.success || response.items) {
      // 使用转换后的数据
      teacherList.value = (response.items || []).map(item => ({
        id: String(item.id),
        name: item.name
      }))
    } else {
      teacherList.value = []
      console.error('获取教师列表失败:', response.message)
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    teacherList.value = []
  }
}

// 获取班级列表
const loadClassList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    
    const response = await getClassList(params)
    
    if (response.success || response.items) {
      // 使用转换后的数据 (数据转换层已经处理了字段映射)
      tableData.value = (response.items || []).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code || '',
        ageGroup: item.type === 1 ? 'small' : 
                  item.type === 2 ? 'medium' : 
                  item.type === 3 ? 'large' : 'small',
        maxCapacity: item.capacity || 25,
        currentStudents: item.currentStudentCount || 0,
        mainTeacher: item.headTeacherName || '未分配',
        assistantTeacher: item.assistantTeacherNames?.join(', ') || '',
        classroom: item.classroom || '',
        status: item.status === 1 ? 'active' : 'suspended',
        startDate: item.startDate ? formatDate(new Date(item.startDate)) : '',
        description: item.description || ''
      }))
      pagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.message || '获取班级列表失败')
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取班级学生列表
const loadStudentList = async (classId: string) => {
  try {
    // 使用getClassStudents API
    const { getClassStudents } = await import('@/api/modules/class')
    const response = await getClassStudents(classId)
    
    if (response.success || response.items) {
      // 处理不同的响应格式
      studentList.value = (response.items || []).map(item => ({
        id: String(item.id),
        name: item.name,
        gender: item.gender === 'MALE' ? 'male' : 'female',
        age: item.age,
        parentName: item.parentName || item.guardianName || '',
        parentPhone: item.parentContact || item.guardianPhone || '',
        enrollDate: item.joinDate || item.enrollmentDate || '',
        status: item.status === 'ACTIVE' ? 'active' : 'inactive'
      }))
    } else {
      studentList.value = []
      ElMessage.error(response.message || '获取学生列表失败')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
    studentList.value = []
  }
}

// 获取班级详情
const loadClassDetail = async (classId: string) => {
  try {
    const { getClassDetail } = await import('@/api/modules/class')
    const response = await getClassDetail(classId)
    
    if (response.success && response.data) {
      const detail = response.data
      // 映射转换后的数据到表单
      classForm.value = {
        id: detail.id,
        name: detail.name,
        code: detail.code || '',
        ageGroup: detail.type === 'SMALL' ? 'small' : 
                   detail.type === 'MEDIUM' ? 'medium' : 
                   detail.type === 'LARGE' ? 'large' : 'small',
        maxCapacity: detail.capacity || 25,
        currentStudents: detail.currentCount || 0,
        mainTeacher: detail.headTeacherId || '',
        assistantTeacher: detail.assistantTeacherIds?.[0] || '',
        classroom: detail.classroom || '',
        status: detail.status === 'ACTIVE' ? 'active' : 'suspended',
        startDate: detail.startDate || '',
        description: detail.description || ''
      }
      classDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取班级详情失败:', error)
    ElMessage.error('获取班级详情失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadClassList()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    ageGroup: '',
  status: '',
  teacher: ''
  }
  pagination.value.currentPage = 1
  loadClassList()
}

// 新建班级
const handleCreate = () => {
  isEdit.value = false
  classForm.value = {
    name: '',
  code: '',
    ageGroup: '',
    maxCapacity: 25,
    currentStudents: 0,
    mainTeacher: '',
    assistantTeacher: '',
  classroom: '',
  status: 'active',
    startDate: '',
  description: ''
  }
  classDialogVisible.value = true
}

// 编辑班级
const handleEdit = (row: ClassInfo) => {
  isEdit.value = true
  // 需要从后端获取详细信息，因为列表可能没有完整数据
  loadClassDetail(row.id!)
}

// 查看班级
const handleView = (row: ClassInfo) => {
  router.push(`/class/detail/${row.id}`)
}

// 管理学生
const handleManageStudents = (row: ClassInfo) => {
  currentClass.value = row
  loadStudentList(row.id!)
  studentDialogVisible.value = true
}

// 删除班级
const handleDelete = async (row: ClassInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班级"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    const response = await deleteClass(row.id!)
    
    if (response.success) {
      ElMessage.success('删除成功')
      loadClassList()
      loadStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: ClassInfo[]) => {
  selectedClasses.value = selection
}

// 学生选择变化
const handleStudentSelectionChange = (selection: Student[]) => {
  selectedStudents.value = selection
}

// 批量分配教师
const handleBatchAssign = () => {
  ElMessage.info('批量分配教师功能开发中')
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedClasses.value.length === 0) {
    ElMessage.warning('请选择要删除的班级')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedClasses.value.length} 个班级吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }
    )
    
    // 批量删除班级 - 逐个删除（因为API模块没有批量删除方法）
    const deletePromises = selectedClasses.value.map(item => deleteClass(item.id!))
    const results = await Promise.allSettled(deletePromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (successful > 0) {
      ElMessage.success(`成功删除 ${successful} 个班级${failed > 0 ? `，失败 ${failed} 个` : ''}`)
      loadClassList()
      loadStats()
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 添加学生
const handleAddStudent = async () => {
  if (!currentClass.value) return
  
  try {
    // 这里应该打开学生选择对话框
    // 临时实现：模拟添加一个学生
    const { addStudentsToClass } = await import('@/api/modules/class')
    const response = await addStudentsToClass(currentClass.value.id!, {
      studentIds: ['student_id_placeholder'], // 实际应该从对话框获取
      joinDate: new Date().toISOString().split('T')[0]
    })
    
    if (response.success) {
      ElMessage.success('学生添加成功')
      await loadStudentList(currentClass.value.id!)
      await loadClassList() // 刷新班级列表以更新人数
    } else {
      ElMessage.error(response.message || '添加学生失败')
    }
  } catch (error) {
    console.error('添加学生失败:', error)
    ElMessage.error('添加学生失败')
  }
}

// 转班
const handleTransferStudents = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请选择要转班的学生')
    return
  }
  
  try {
    // 这里应该打开班级选择对话框
    // 临时实现：模拟转班操作
    const { transferStudents } = await import('@/api/modules/class')
    const studentIds = selectedStudents.value.map(s => s.id)
    const response = await transferStudents(currentClass.value!.id!, {
      studentIds,
      targetClassId: 'target_class_id_placeholder', // 实际应该从对话框获取
      transferDate: new Date().toISOString().split('T')[0],
      reason: '转班'
    })
    
    if (response.success) {
      ElMessage.success('学生转班成功')
      await loadStudentList(currentClass.value!.id!)
      await loadClassList()
    } else {
      ElMessage.error(response.message || '转班失败')
    }
  } catch (error) {
    console.error('转班失败:', error)
    ElMessage.error('转班失败')
  }
}

// 移除学生
const handleRemoveStudents = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请选择要移除的学生')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要从班级中移除选中的 ${selectedStudents.value.length} 名学生吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量移除学生
    const { removeStudentFromClass } = await import('@/api/modules/class')
    for (const student of selectedStudents.value) {
      const response = await removeStudentFromClass(currentClass.value!.id!, student.id)
      if (!response.success) {
        console.error(`移除学生 ${student.name} 失败:`, response.message)
      }
    }
    
    ElMessage.success('学生移除成功')
    await loadStudentList(currentClass.value!.id!)
    await loadClassList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除学生失败:', error)
      ElMessage.error('移除学生失败')
    }
  }
}

// 查看学生详情
const handleViewStudent = (student: Student) => {
  router.push(`/students/${student.id}`)
}

// 提交表单
const handleSubmit = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    submitting.value = true
    
    // 映射前端字段到后端字段
    const submitData = {
      name: classForm.value.name,
  code: classForm.value.code,
  type: classForm.value.ageGroup === 'small' ? 1 : 
            classForm.value.ageGroup === 'middle' ? 2 : 
            classForm.value.ageGroup === 'large' ? 3 : 1,
  capacity: classForm.value.maxCapacity,
      headTeacherId: classForm.value.mainTeacher || null,
      assistantTeacherId: classForm.value.assistantTeacher || null,
  classroom: classForm.value.classroom,
  status: classForm.value.status === 'active' ? 1 : 0,
  description: classForm.value.description,
      kindergartenId: 1 // 暂时硬编码，实际应该从用户信息中获取
    }
    
    let response
    if (isEdit.value) {
      response = await updateClass(classForm.value.id!, submitData)
    } else {
      response = await createClass(submitData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      classDialogVisible.value = false
      loadClassList()
      loadStats()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadClassList()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadClassList()
}

// 工具函数
const getAgeGroupTagType = (ageGroup: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    small: 'primary',
  medium: 'success',
  large: 'warning',
  preschool: 'danger'
  }
  return typeMap[ageGroup] || 'info'
}

const getAgeGroupLabel = (ageGroup: string) => {
  const labelMap: Record<string, string> = {
    small: '小班',
  medium: '中班',
  large: '大班',
  preschool: '学前班'
  }
  return labelMap[ageGroup] || ageGroup
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
  suspended: 'warning',
  ended: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '正常',
  suspended: '暂停',
  ended: '已结束'
  }
  return labelMap[status] || status
}

const getOccupancyColor = (rate: number) => {
  if (rate >= 0.9) return 'var(--danger-color)'
  if (rate >= 0.7) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getTeacherName = (teacherId: string) => {
  if (!teacherId) return '未分配'
  const teacher = teacherList.value.find(t => t.id === teacherId)
  return teacher ? teacher.name : '未知'
}

// 页面初始化
onMounted(() => {
  loadStats()
  loadTeacherList()
  loadClassList()
})


// 新增班级处理
const handleAddClass = () => {
  handleCreate()
}

</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
@use './class-course-ux-styles.scss' as *;
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";
/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
/* .class-management-page 替换为全局 .page-container */

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--app-gap-sm) 0;
}

.page-description {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
}

.stats-cards {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.stat-card {
  border: none;
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(var(--transform-hover-lift));
  }
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--app-gap);
  font-size: var(--text-2xl);
  color: var(--text-light);
}

.stat-icon.total {
  background: var(--gradient-purple);
}

.stat-icon.students {
  background: var(--gradient-blue);
}

.stat-icon.teachers {
  background: var(--gradient-green);
}

.stat-icon.capacity {
  background: var(--gradient-orange);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-top: var(--spacing-xs);
}

.search-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
}

.search-form {
  padding: var(--app-gap-sm) 0;
}

/* 按钮排版修复：搜索操作按钮 */
.search-actions {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
}

/* 按钮排版修复：操作按钮区域 */
.action-row {
  margin-top: var(--app-gap);
  padding-top: var(--app-gap);
  border-top: var(--z-index-dropdown) solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
  flex-wrap: wrap;
  
  .selected-count {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-left: var(--spacing-xs);
  }
}

.table-card {
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap);
}

.table-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

/* 按钮排版修复：表格操作按钮 */
.table-actions-buttons {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  align-items: center;
  
  .el-button {
    margin: 0;
    min-width: 4var(--spacing-sm);
    
    &.el-button--small {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--text-xs);
    }
  }
}

.pagination-wrapper {
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  display: flex;
  justify-content: center;
}

.student-management {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.class-info {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding-bottom: var(--app-gap);
  border-bottom: var(--z-index-dropdown) solid var(--border-color);
}

.class-info h3 {
  margin: 0 0 var(--app-gap-sm) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.class-info p {
  margin: 0;
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
}

.student-actions {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
  flex-wrap: wrap;
  
  .selected-count {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-left: var(--spacing-xs);
  }
}

/* 白色区域修复：对话框主题化 */
:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-dialog__header {
    background: var(--bg-tertiary) !important;
    border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
    
    .el-dialog__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-dialog__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
  
  .el-dialog__footer {
    background: var(--bg-tertiary) !important;
    border-top: var(--z-index-dropdown) solid var(--border-color) !important;
  }
}

/* 白色区域修复：表格主题化 */
:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  
  .el-table__header {
    background: var(--bg-tertiary) !important;
    
    th {
      background: var(--bg-tertiary) !important;
      color: var(--text-primary) !important;
      border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
    }
  }
  
  .el-table__body {
    tr {
      background: var(--bg-card) !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
      
      &.el-table__row--striped {
        background: var(--bg-tertiary) !important;
        
        &:hover {
          background: var(--bg-hover) !important;
        }
      }
      
      td {
        border-bottom: var(--z-index-dropdown) solid var(--border-color) !important;
        color: var(--text-primary) !important;
      }
    }
  }
}

/* 白色区域修复：分页组件主题化 */
:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: var(--text-primary) !important;
  }
  
  .el-pager li {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-active {
      background: var(--primary-color) !important;
      color: var(--text-light) !important;
    }
  }
  
  .btn-prev,
  .btn-next {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
  }
  
  .el-select .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：表单控件主题化 */
:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-select-dropdown) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-select-dropdown__item {
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-selected {
      background: var(--primary-color) !important;
      color: var(--text-light) !important;
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-radio-group) {
  .el-radio {
    color: var(--text-primary) !important;
    
    .el-radio__label {
      color: var(--text-primary) !important;
    }
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--warning {
    background: var(--warning-color) !important;
    border-color: var(--warning-color) !important;
    
    &:hover {
      background: var(--warning-light) !important;
      border-color: var(--warning-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 按钮排版修复：对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm);
}

/* 响应式设计优化 */
@media (max-width: var(--breakpoint-lg)) {
  .search-form {
    .el-row {
      flex-direction: column;
      gap: var(--app-gap-sm);
    }
    
    .el-col {
      width: 100% !important;
      flex: none !important;
    }
    
    .search-actions {
      justify-content: flex-start;
    }
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .table-actions-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
    
    .el-button {
      width: 100%;
      min-width: auto;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .class-management-page {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端使用更小间距 */
  }
  
  .stats-cards {
    .el-row {
      flex-direction: column;
      gap: var(--app-gap-sm);
    }
    
    .el-col {
      width: 100% !important;
    }
  }
  
  .student-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style> 