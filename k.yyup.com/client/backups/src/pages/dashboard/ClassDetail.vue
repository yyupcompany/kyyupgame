<template>
  <div class="page-container cls-critical-fix-2025 cls-performance-fix">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container loading-container--detail">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
      class="mb-20"
    />

    <!-- 班级详情 -->
    <div v-if="!loading && !error && classInfo" class="detail-content">
      <!-- 操作头部 -->
      <div class="detail-header">
        <div class="back-button">
          <el-button @click="goBack" icon="el-icon-arrow-left" plain>返回</el-button>
        </div>
        <h2 class="class-title">{{ classInfo.name }}</h2>
        <div class="actions">
          <el-button type="primary" @click="handleEdit">编辑</el-button>
          <el-button type="success" @click="handleManageStudents">管理学生</el-button>
          <el-button type="info" @click="handleManageTeachers">管理教师</el-button>
          <el-dropdown @command="handleCommand">
            <el-button>
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="'status-active'">设为在读</el-dropdown-item>
                <el-dropdown-item :command="'status-inactive'">设为休学</el-dropdown-item>
                <el-dropdown-item :command="'status-archived'">归档</el-dropdown-item>
                <el-dropdown-item :command="'delete'" divided>删除班级</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 基本信息 -->
      <el-card class="basic-info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">班级ID：</span>
            <span class="value">{{ classInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级名称：</span>
            <span class="value">{{ classInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级类型：</span>
            <span class="value">
              <class-type-tag :type="classInfo.type" />
            </span>
          </div>
          <div class="info-item">
            <span class="label">班级状态：</span>
            <span class="value">
              <class-status-tag :status="classInfo.status" />
            </span>
          </div>
          <div class="info-item">
            <span class="label">开始日期：</span>
            <span class="value">{{ classInfo.startDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">结束日期：</span>
            <span class="value">{{ classInfo.endDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级容量：</span>
            <span class="value">{{ classInfo.capacity }}人</span>
          </div>
          <div class="info-item">
            <span class="label">当前人数：</span>
            <span class="value">{{ classInfo.currentCount }}人</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ classInfo.createdAt }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ classInfo.updatedAt }}</span>
          </div>
          <div class="info-item info-item-full">
            <span class="label">班级描述：</span>
            <span class="value">{{ classInfo.description || '暂无描述' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 教师信息 -->
      <el-card class="teachers-card">
        <template #header>
          <div class="card-header">
            <span>班级教师</span>
            <el-button
              link
              @click="handleManageTeachers"
            >
              管理教师
            </el-button>
          </div>
        </template>
        <div v-if="classInfo.headTeacherId" class="teacher-info">
          <h4>班主任</h4>
          <div class="teacher-item">
            <el-avatar :size="40" icon="el-icon-user-solid"></el-avatar>
            <div class="teacher-details">
              <div class="teacher-name">{{ classInfo.headTeacherName }}</div>
              <div class="teacher-id">ID: {{ classInfo.headTeacherId }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-teacher">
          <el-empty description="未指定班主任" :image-size="60"></el-empty>
        </div>

        <el-divider></el-divider>

        <div v-if="classInfo.assistantTeacherIds && classInfo.assistantTeacherIds.length > 0" class="teacher-info">
          <h4>助理教师</h4>
          <div
            v-for="(teacherName, index) in classInfo.assistantTeacherNames"
            :key="classInfo.assistantTeacherIds[index]"
            class="teacher-item"
          >
            <el-avatar :size="40" icon="el-icon-user-solid"></el-avatar>
            <div class="teacher-details">
              <div class="teacher-name">{{ teacherName }}</div>
              <div class="teacher-id">ID: {{ classInfo.assistantTeacherIds[index] }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-teacher">
          <el-empty description="未指定助理教师" :image-size="60"></el-empty>
        </div>
      </el-card>

      <!-- 学生统计信息 -->
      <el-card class="students-card">
        <template #header>
          <div class="card-header">
            <span>学生信息</span>
            <el-button
              link
              @click="handleManageStudents"
            >
              管理学生
            </el-button>
          </div>
        </template>
        <div class="student-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ classInfo.currentCount }}</div>
                <div class="stat-label">当前学生数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ classInfo.capacity }}</div>
                <div class="stat-label">班级容量</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-value">{{ Math.round((classInfo.currentCount / classInfo.capacity) * 100) }}%</div>
                <div class="stat-label">容量使用率</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 查看学生列表按钮 -->
        <div class="view-students-btn">
          <el-button type="primary" @click="handleManageStudents">查看学生列表</el-button>
        </div>
      </el-card>
    </div>

    <!-- 班级不存在 -->
    <el-empty
      v-if="!loading && !error && !classInfo"
      description="未找到班级信息"
    >
      <el-button @click="goBack">返回</el-button>
    </el-empty>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      :width="'30%'"
    >
      <span>您确定要删除班级 "{{ classInfo?.name }}" 吗？此操作不可逆。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, put, del } from '@/utils/request'
import { CLASS_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 枚举定义
enum ClassType {
  TODDLER = 'TODDLER',
  NURSERY = 'NURSERY',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR'
}

enum ClassStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

// 类型定义
interface ClassInfo {
  id: string;
  name: string;
  type: ClassType;
  status: ClassStatus;
  capacity: number;
  currentCount: number;
  headTeacherId?: string;
  headTeacherName?: string;
  assistantTeacherIds?: string[];
  assistantTeacherNames?: string[];
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟组件
const ClassStatusTag = defineComponent({
  name: 'ClassStatusTag',
  props: {
    status: {
      type: String,
      required: true
    }
  },
  template: '<span>{{ status }}</span>'
})

const ClassTypeTag = defineComponent({
  name: 'ClassTypeTag',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  template: '<span>{{ type }}</span>'
})

// API调用函数
const apiGetClassDetail = async (id: string): Promise<ClassInfo> => {
  const response = await get(CLASS_ENDPOINTS.DETAIL(id))
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.message || '获取班级详情失败')
}

const apiUpdateClassStatus = async (id: string, data: { status: ClassStatus }): Promise<boolean> => {
  const response = await put(CLASS_ENDPOINTS.UPDATE_STATUS(id), data)
  if (response.success) {
    return true
  }
  throw new Error(response.message || '更新班级状态失败')
}

const apiDeleteClass = async (id: string): Promise<boolean> => {
  const response = await del(CLASS_ENDPOINTS.DELETE(id))
  if (response.success) {
    return true
  }
  throw new Error(response.message || '删除班级失败')
}

const route = useRoute()
const router = useRouter()

const classId = ref<string>(route.params.id as string)
const classInfo = ref<ClassInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const deleteDialogVisible = ref(false)

// 获取班级详情
const fetchClassDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await apiGetClassDetail(classId.value)
    classInfo.value = data
  } catch (err) {
    error.value = '获取班级详情失败'
    ErrorHandler.handle(err, true)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理编辑班级
const handleEdit = () => {
  if (classInfo.value) {
    router.push(`/dashboard/class/${classInfo.value.id}/edit`)
  }
}

// 处理管理学生
const handleManageStudents = () => {
  if (classInfo.value) {
    router.push(`/dashboard/class/${classInfo.value.id}/students`)
  }
}

// 处理管理教师
const handleManageTeachers = () => {
  if (classInfo.value) {
    router.push(`/dashboard/class/${classInfo.value.id}/teachers`)
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (!classInfo.value) return
  
  switch (command) {
    case 'status-active':
      updateClassStatus(ClassStatus.ACTIVE)
      break
    case 'status-inactive':
      updateClassStatus(ClassStatus.INACTIVE)
      break
    case 'status-archived':
      updateClassStatus(ClassStatus.ARCHIVED)
      break
    case 'delete':
      deleteDialogVisible.value = true
      break;
  default:
      break
  }
}

// 更新班级状态
const updateClassStatus = (status: ClassStatus) => {
  if (!classInfo.value) return
  
  ElMessageBox.confirm(
    `确定要${status === ClassStatus.ACTIVE ? '启用' : status === ClassStatus.INACTIVE ? '停用' : '归档'}该班级吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      if (!classInfo.value) return
      
      const success = await apiUpdateClassStatus(classInfo.value.id, { status })
      
      if (success) {
        ElMessage.success(`班级${status === ClassStatus.ACTIVE ? '启用' : status === ClassStatus.INACTIVE ? '停用' : '归档'}成功`)
        
        // 更新本地数据
        if (classInfo.value) {
          classInfo.value.status = status
        }
      } else {
        ElMessage.error(`班级${status === ClassStatus.ACTIVE ? '启用' : status === ClassStatus.INACTIVE ? '停用' : '归档'}失败`)
      }
    } catch (error) {
      ElMessage.error(`班级${status === ClassStatus.ACTIVE ? '启用' : status === ClassStatus.INACTIVE ? '停用' : '归档'}失败`)
      ErrorHandler.handle(error, true)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 确认删除班级
const handleConfirmDelete = () => {
  if (!classInfo.value) return
  
  ElMessageBox.confirm(
    '确定要删除该班级吗？删除后将无法恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      if (!classInfo.value) return
      
      const success = await apiDeleteClass(classInfo.value.id)
      
      if (success) {
        ElMessage.success('班级删除成功')
        deleteDialogVisible.value = false
        // 返回列表页面
        router.push('/dashboard/class')
      } else {
        ElMessage.error('班级删除失败')
      }
    } catch (error) {
      ElMessage.error('班级删除失败')
      ErrorHandler.handle(error, true)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 获取班级类型文本
const getClassTypeText = (type: ClassType) => {
  switch (type) {
    case ClassType.TODDLER:
      return '托班'
    case ClassType.NURSERY:
      return '小班'
    case ClassType.JUNIOR:
      return '中班'
    case ClassType.SENIOR:
      return '大班';
  default:
      return '未知'
  }
}

// 获取班级状态文本
const getClassStatusText = (status: ClassStatus) => {
  switch (status) {
    case ClassStatus.ACTIVE:
      return '正常'
    case ClassStatus.INACTIVE:
      return '停用'
    case ClassStatus.ARCHIVED:
      return '已归档';
  default:
      return '未知'
  }
}

// 获取班级状态类型
const getClassStatusType = (status: ClassStatus) => {
  switch (status) {
    case ClassStatus.ACTIVE:
      return 'success'
    case ClassStatus.INACTIVE:
      return 'warning'
    case ClassStatus.ARCHIVED:
      return 'info';
  default:
      return 'info'
  }
}

// 初始化
onMounted(() => {
  fetchClassDetail()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.page-container {
  padding: var(--app-margin);
}

.loading-container {
  padding: var(--app-margin) 0;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--app-margin);
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
}

.class-title {
  margin: 0 auto;
  text-align: center;
  font-size: var(--text-2xl);
  color: var(--text-primary);
}

.actions {
  position: absolute;
  right: 0;
  display: flex;
  gap: var(--app-margin-sm);
}

.basic-info-card,
.teachers-card,
.students-card {
  margin-bottom: var(--app-margin);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--app-padding-lg);
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item-full {
  grid-column: span 2;
}

.label {
  font-weight: bold;
  margin-right: var(--app-margin-sm);
  color: var(--text-secondary);
  min-width: 80px; /* 标签最小宽度 */
}

.teacher-info {
  margin-bottom: var(--app-margin);
}

.teacher-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--app-margin-sm);
  padding: var(--app-margin-sm);
  border-radius: var(--app-radius);
  background-color: var(--bg-tertiary);
}

.teacher-details {
  margin-left: var(--app-padding-lg);
}

.teacher-name {
  font-weight: bold;
  font-size: var(--text-lg);
}

.teacher-id {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.empty-teacher {
  padding: var(--app-margin) 0;
  text-align: center;
}

.stat-card {
  text-align: center;
  padding: var(--app-margin);
  background-color: var(--bg-tertiary);
  border-radius: var(--app-radius);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  margin-top: var(--app-margin-sm);
  color: var(--text-secondary);
}

.view-students-btn {
  text-align: center;
  margin-top: var(--app-margin);
}

/* 工具类 */
.mb-20 {
  margin-bottom: var(--app-margin);
}
</style>

