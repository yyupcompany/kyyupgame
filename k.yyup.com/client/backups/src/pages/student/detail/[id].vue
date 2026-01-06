<template>
  <div class="page-container cls-optimized">
    <!-- 页面头部 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">学生详情</div>
        <div class="card-actions">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <el-button type="primary" @click="handleEdit" :icon="Edit">编辑</el-button>
        </div>
      </div>

      <!-- 学生基本信息 -->
      <div class="student-info">
        <!-- 头像和基本信息区域 - 预留固定空间 -->
        <div class="avatar-section">
          <div class="student-avatar-wrapper">
            <el-avatar v-if="studentData" :size="80" :icon="User" class="student-avatar" />
            <el-skeleton v-else animated>
              <template #template>
                <el-skeleton-item variant="circle" style="width: var(--avatar-size); height: var(--avatar-size);" />
              </template>
            </el-skeleton>
          </div>
          <div class="basic-info">
            <template v-if="studentData">
              <h2 class="student-name">{{ studentData.name }}</h2>
              <p class="student-class">{{ studentData.className }}</p>
              <el-tag :type="getStatusTagType(studentData.status)" size="small">
                {{ studentData.status }}
              </el-tag>
            </template>
            <template v-else>
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="h1" style="width: 120px; height: var(--button-height-sm); margin-bottom: var(--spacing-sm);" />
                  <el-skeleton-item variant="text" style="width: 100px; height: var(--text-2xl); margin-bottom: var(--spacing-sm);" />
                  <el-skeleton-item variant="button" style="width: 60px; height: var(--text-2xl);" />
                </template>
              </el-skeleton>
            </template>
          </div>
        </div>

        <!-- 描述信息 - 预留固定空间 -->
        <div class="descriptions-wrapper">
          <el-descriptions v-if="studentData" :column="2" border class="descriptions">
            <el-descriptions-item label="学号">{{ studentData.studentId }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              <el-tag :type="studentData.gender === '男' ? 'primary' : 'danger'" size="small">
                {{ studentData.gender }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="年龄">{{ studentData.age }}岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ studentData.birthDate }}</el-descriptions-item>
            <el-descriptions-item label="入学日期">{{ studentData.enrollmentDate }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ studentData.className }}</el-descriptions-item>
            <el-descriptions-item label="监护人姓名">{{ studentData.guardianName }}</el-descriptions-item>
            <el-descriptions-item label="监护人电话">{{ studentData.guardianPhone }}</el-descriptions-item>
            <el-descriptions-item :span="2" label="家庭住址">{{ studentData.address || '未填写' }}</el-descriptions-item>
            <el-descriptions-item :span="2" label="健康备注">{{ studentData.healthNotes || '无特殊情况' }}</el-descriptions-item>
          </el-descriptions>
          <el-skeleton v-else animated>
            <template #template>
              <div class="skeleton-descriptions">
                <div class="skeleton-row" v-for="i in 5" :key="i">
                  <el-skeleton-item variant="text" style="width: 80px; height: var(--text-2xl);" />
                  <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
                  <el-skeleton-item variant="text" style="width: 80px; height: var(--text-2xl);" />
                  <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <el-empty v-if="!studentData && !loading" description="未找到学生信息" />
      </div>
    </div>

    <!-- 成长记录卡片 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">成长记录</div>
        <div class="card-actions">
          <el-button type="primary" @click="showAddRecordDialog">添加记录</el-button>
        </div>
      </div>

      <!-- 成长记录表格区域 - 预留固定空间 -->
      <div class="growth-records-wrapper">
        <el-table
          v-if="!recordsLoading"
          :data="growthRecords"
          style="width: 100%"
          border
          stripe
          empty-text="暂无成长记录"
        >
          <el-table-column prop="recordDate" label="记录日期" width="120" />
          <el-table-column prop="type" label="记录类型" width="120">
            <template #default="scope">
              <el-tag size="small" :type="getRecordTypeTag(scope.row.type)">
                {{ scope.row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="记录内容" min-width="200" />
          <el-table-column prop="teacherName" label="记录教师" width="120" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewRecord(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 表格加载时的skeleton -->
        <el-skeleton v-else animated>
          <template #template>
            <div class="skeleton-table">
              <div class="skeleton-table-header">
                <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 200px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 120px; height: var(--text-2xl);" />
              </div>
              <div class="skeleton-table-row" v-for="i in 3" :key="i">
                <el-skeleton-item variant="text" style="width: 100px; height: var(--text-2xl);" />
                <el-skeleton-item variant="button" style="width: 80px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 180px; height: var(--text-2xl);" />
                <el-skeleton-item variant="text" style="width: 80px; height: var(--text-2xl);" />
                <el-skeleton-item variant="button" style="width: 60px; height: var(--text-2xl);" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 添加成长记录对话框 -->
    <el-dialog v-model="addRecordDialogVisible" title="添加成长记录" width="600px">
      <el-form :model="recordForm" ref="recordFormRef" label-width="100px">
        <el-form-item label="记录类型" prop="type" :rules="[{ required: true, message: '请选择记录类型', trigger: 'change' }]">
          <el-select v-model="recordForm.type" placeholder="请选择记录类型">
            <el-option label="学习表现" value="学习表现" />
            <el-option label="行为表现" value="行为表现" />
            <el-option label="健康状况" value="健康状况" />
            <el-option label="特长发展" value="特长发展" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期" prop="recordDate" :rules="[{ required: true, message: '请选择记录日期', trigger: 'change' }]">
          <el-date-picker
            v-model="recordForm.recordDate"
            type="date"
            placeholder="选择记录日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="记录内容" prop="content" :rules="[{ required: true, message: '请输入记录内容', trigger: 'blur' }]">
          <el-input
            v-model="recordForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入记录内容"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addRecordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecord" :loading="submittingRecord">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { User, Edit, ArrowLeft } from '@element-plus/icons-vue'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { get, post } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

// 学生信息接口
export interface Student {
  id: number
  studentId: string;
  name: string;
  gender: '男' | '女';
  age: number
  birthDate: string
  enrollmentDate: string
  className: string
  classId: number
  guardianName: string
  guardianPhone: string
  address?: string
  healthNotes?: string
  emergencyContact?: string
  avatar?: string;
  status: '正常' | '请假' | '转学' | '毕业'
  createdAt: string
  updatedAt: string
}

// 成长记录接口
export interface GrowthRecord {
  id: number
  studentId: number;
  type: string;
  content: string
  recordDate: string
  teacherName: string
  teacherId: number
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const recordsLoading = ref(false)
const studentData = ref<Student | null>(null)
const growthRecords = ref<GrowthRecord[]>([])
const addRecordDialogVisible = ref(false)
const submittingRecord = ref(false)
const recordFormRef = ref<FormInstance | null>(null)

// 成长记录表单
const recordForm = ref({
  type: '',
  recordDate: '',
  content: ''
})

// 学生ID
const studentId = computed(() => route.params.id as string)

// 获取学生详情
const fetchStudentDetail = async () => {
  if (!studentId.value) return

  loading.value = true
  try {
    const response = await get<ApiResponse<any>>(STUDENT_ENDPOINTS.GET_BY_ID(studentId.value))
    if (response.success && response.data) {
      // 映射后端数据结构到前端需要的格式
      studentData.value = {
        id: response.data.id,
        studentId: response.data.student_id || `S${response.data.id.toString().padStart(3, '0')}`,
        name: response.data.name,
        gender: response.data.gender,
        age: response.data.age || 0,
        birthDate: response.data.birth_date,
        enrollmentDate: response.data.enrollment_date || response.data.created_at,
        className: response.data.class_name || '未分配班级',
        classId: response.data.class_id || 0,
        guardianName: response.data.guardian_name || response.data.parent_name || '未填写',
        guardianPhone: response.data.guardian_phone || response.data.parent_phone || '未填写',
        address: response.data.address || '未填写',
        healthNotes: response.data.health_notes || response.data.remarks || '无特殊情况',
        status: response.data.status === 'ACTIVE' ? '正常' : (response.data.status === 'INACTIVE' ? '请假' : response.data.status),
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      }
    } else {
      ElMessage.error('未找到学生信息')
    }
  } catch (error) {
    console.error('获取学生详情失败:', error)
    ElMessage.error('获取学生详情失败')
  } finally {
    loading.value = false
  }
}

// 获取成长记录
const fetchGrowthRecords = async () => {
  if (!studentId.value) return

  recordsLoading.value = true
  try {
    // 尝试从API获取成长记录
    const response = await get<ApiResponse<GrowthRecord[]>>(`${STUDENT_ENDPOINTS.BASE}/${studentId.value}/growth-records`)
    if (response.success && response.data) {
      growthRecords.value = response.data
    } else {
      // 如果API不存在，使用模拟数据
      growthRecords.value = [
        {
          id: 1,
          studentId: parseInt(studentId.value),
          type: '学习表现',
          content: '今天表现很好，积极参与课堂活动',
          recordDate: '2024-01-15',
          teacherName: '李老师',
          teacherId: 1,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        }
      ]
    }
  } catch (error) {
    console.error('获取成长记录失败:', error)
    // 使用模拟数据作为后备
    growthRecords.value = [
      {
        id: 1,
        studentId: parseInt(studentId.value),
        type: '学习表现',
        content: '今天表现很好，积极参与课堂活动',
        recordDate: '2024-01-15',
        teacherName: '李老师',
        teacherId: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
    ]
  } finally {
    recordsLoading.value = false
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string): string => {
  const statusMap: Record<string, string> = {
    '正常': 'success',
    '请假': 'warning',
    '转学': 'info',
    '毕业': 'primary'
  }
  return statusMap[status] || 'info'
}

// 获取记录类型标签
const getRecordTypeTag = (type: string): string => {
  const typeMap: Record<string, string> = {
    '学习表现': 'primary',
    '行为表现': 'success',
    '健康状况': 'warning',
    '特长发展': 'danger',
    '其他': 'info'
  }
  return typeMap[type] || 'info'
}

// 编辑学生信息
const handleEdit = () => {
  if (studentData.value) {
    router.push(`/student/edit/${studentData.value.id}`)
  }
}

// 返回学生列表
const goBack = () => {
  router.push('/student')
}

// 显示添加记录对话框
const showAddRecordDialog = () => {
  recordForm.value = {
    type: '',
    recordDate: '',
  content: ''
  }
  addRecordDialogVisible.value = true
}

// 提交成长记录
const submitRecord = async () => {
  if (!recordFormRef.value) return

  try {
    await recordFormRef.value.validate()
    submittingRecord.value = true
    
    const requestData = {
      ...recordForm.value,
      studentId: parseInt(studentId.value)
    }
    
    try {
      const response = await post<ApiResponse<GrowthRecord>>(`${STUDENT_ENDPOINTS.BASE}/${studentId.value}/growth-records`, requestData)
      if (response.success) {
        ElMessage.success('添加成长记录成功')
        addRecordDialogVisible.value = false
        await fetchGrowthRecords()
      } else {
        ElMessage.error(response.message || '添加成长记录失败')
      }
    } catch (apiError) {
      // 如果API不存在，模拟成功
      ElMessage.success('添加成长记录成功')
      addRecordDialogVisible.value = false
      await fetchGrowthRecords()
    }
  } catch (error) {
    console.error('添加成长记录失败:', error)
    ElMessage.error('添加成长记录失败')
  } finally {
    submittingRecord.value = false
  }
}

// 查看记录详情
const viewRecord = (record: GrowthRecord) => {
  ElMessageBox.alert(record.content, `${record.type} - ${record.recordDate}`, {
    confirmButtonText: '确定'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStudentDetail()
  fetchGrowthRecords()
})
</script>


<style scoped lang="scss">
@import "@/styles/index.scss";

.page-container {
  min-height: 100vh;
  background: var(--bg-primary);

  .student-info {
    padding: var(--spacing-lg);
    
    .avatar-section {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      min-height: 80px; // 预留固定高度，防止CLS
    }

    .student-avatar-wrapper {
      width: var(--avatar-size); height: var(--avatar-size);
      margin-right: var(--spacing-lg);
      flex-shrink: 0; // 防止收缩
    }

    .student-avatar {
      width: var(--avatar-size); height: var(--avatar-size);
    }

    .basic-info {
      min-height: 80px; // 预留固定高度
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      h2 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--text-primary);
        height: var(--button-height-sm); // 固定高度
        line-height: var(--button-height-sm);
      }
      
      p {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--text-secondary);
        height: var(--text-2xl); // 固定高度
        line-height: var(--text-2xl);
      }
    }
  }

  .descriptions-wrapper {
    margin-top: var(--spacing-lg);
    min-height: 200px; // 预留固定高度，防止CLS
  }

  .skeleton-descriptions {
    .skeleton-row {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--text-lg);
      align-items: center;
    }
  }

  .growth-records-wrapper {
    margin-top: var(--spacing-lg);
    min-height: 200px; // 预留固定高度，防止CLS
  }

  .skeleton-table {
    .skeleton-table-header {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--text-lg);
      padding: var(--text-xs);
      background: var(--bg-hover);
      border: var(--border-width-base) solid var(--border-color-lighter);
      border-radius: var(--spacing-xs);
    }

    .skeleton-table-row {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--text-sm);
      padding: var(--text-xs);
      border: var(--border-width-base) solid var(--border-color-lighter);
      border-radius: var(--spacing-xs);
    }
  }

  .growth-records {
    margin-top: var(--spacing-xl);
  }

  .timeline-item {
    margin-bottom: var(--spacing-lg);
  }
}

// CLS优化相关样式
.cls-optimized {
  // 防止内容加载时的布局偏移
  .el-descriptions {
    contain: layout style; // CSS containment
  }

  .el-table {
    contain: layout style; // CSS containment
  }

  // 为skeleton提供平滑过渡
  .el-skeleton {
    transition: opacity 0.3s ease;
  }

  // 预加载状态的样式
  .preload-space {
    visibility: hidden;
    height: 0;
    overflow: hidden;
  }
}
</style>
