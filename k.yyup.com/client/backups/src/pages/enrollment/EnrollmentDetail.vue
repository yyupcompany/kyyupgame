<template>
  <div class="business-process-container enrollment-detail-page">
    <div class="page-header">
      <h2>招生详情</h2>
      <div class="header-actions">
        <el-button class="header-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button class="header-btn" type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
        <el-button class="header-btn" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印详情
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <el-skeleton :rows="10" animated />
      </div>
      <div class="loading-text">正在加载招生详情...</div>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />

    <template v-if="!loading && !error && enrollment">
      <!-- 招生基本信息 -->
      <div class="detail-content enrollment-basic-info">
        <div class="content-header">
          <div class="enrollment-profile">
            <div class="enrollment-avatar">
              {{ enrollment.studentName.charAt(0).toUpperCase() }}
            </div>
            <div class="enrollment-info">
              <h1 class="student-name">{{ enrollment.studentName }}</h1>
              <div class="enrollment-meta">
                <span class="enrollment-id">#{{ enrollment.id }}</span>
                <span class="enrollment-status" :class="getStatusClass(enrollment.status)">
                  {{ getStatusText(enrollment.status) }}
                </span>
              </div>
            </div>
            <div class="profile-actions">
              <span class="enrollment-type-tag">{{ enrollment.enrollmentType }}</span>
            </div>
          </div>
        </div>
        <div class="content-body">
          <div class="info-grid">
            <div class="info-item">
              <label>申请班级</label>
              <span>{{ enrollment.className }}</span>
            </div>
            <div class="info-item">
              <label>入学时间</label>
              <span>{{ formatDate(enrollment.enrollmentDate) }}</span>
            </div>
            <div class="info-item">
              <label>申请时间</label>
              <span>{{ formatDate(enrollment.applicationDate) }}</span>
            </div>
            <div class="info-item">
              <label>招生来源</label>
              <span>{{ enrollment.source }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学生信息 -->
      <div class="detail-content student-info">
        <div class="content-header">
          <h3>学生信息</h3>
        </div>
        <div class="content-body">
          <div class="info-grid">
            <div class="info-item">
              <label>姓名</label>
              <span>{{ enrollment.studentName }}</span>
            </div>
            <div class="info-item">
              <label>性别</label>
              <span>{{ enrollment.studentGender }}</span>
            </div>
            <div class="info-item">
              <label>出生日期</label>
              <span>{{ formatDate(enrollment.studentBirthDate) }}</span>
            </div>
            <div class="info-item">
              <label>年龄</label>
              <span>{{ enrollment.studentAge }}岁</span>
            </div>
            <div class="info-item">
              <label>身份证号</label>
              <span>{{ enrollment.studentIdCard }}</span>
            </div>
            <div class="info-item">
              <label>健康状况</label>
              <span>{{ enrollment.healthStatus || '良好' }}</span>
            </div>
          </div>
          <div class="info-item full-width" v-if="enrollment.specialNeeds">
            <label>特殊需求</label>
            <span>{{ enrollment.specialNeeds }}</span>
          </div>
        </div>
      </div>

      <!-- 家长信息 -->
      <div class="detail-content parent-info">
        <div class="content-header">
          <h3>家长信息</h3>
        </div>
        <div class="content-body">
          <div class="info-grid">
            <div class="info-item">
              <label>家长姓名</label>
              <span>{{ enrollment.parentName }}</span>
            </div>
            <div class="info-item">
              <label>联系电话</label>
              <span>{{ enrollment.parentPhone }}</span>
            </div>
            <div class="info-item">
              <label>与学生关系</label>
              <span>{{ enrollment.parentRelation }}</span>
            </div>
            <div class="info-item">
              <label>邮箱地址</label>
              <span>{{ enrollment.parentEmail || '未填写' }}</span>
            </div>
            <div class="info-item full-width">
              <label>家庭地址</label>
              <span>{{ enrollment.parentAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 招生进度 -->
      <div class="detail-content enrollment-progress">
        <div class="content-header">
          <h3>招生进度</h3>
        </div>
        <div class="content-body">
          <el-steps :active="getProgressStep(enrollment.status)" finish-status="success">
            <el-step title="提交申请" :description="formatDate(enrollment.applicationDate)" />
            <el-step title="资料审核" :description="enrollment.reviewDate ? formatDate(enrollment.reviewDate) : '待审核'" />
            <el-step title="面试安排" :description="enrollment.interviewDate ? formatDate(enrollment.interviewDate) : '待安排'" />
            <el-step title="录取确认" :description="enrollment.confirmDate ? formatDate(enrollment.confirmDate) : '待确认'" />
            <el-step title="入学报到" :description="enrollment.enrollmentDate ? formatDate(enrollment.enrollmentDate) : '待报到'" />
          </el-steps>
        </div>
      </div>

      <!-- 备注信息 -->
      <div class="detail-content remarks-info" v-if="enrollment.remarks">
        <div class="content-header">
          <h3>备注信息</h3>
        </div>
        <div class="content-body">
          <p class="remarks-text">{{ enrollment.remarks }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Printer } from '@element-plus/icons-vue'

// 接口定义
interface EnrollmentDetail {
  id: string
  studentName: string
  studentGender: string
  studentBirthDate: string
  studentAge: number
  studentIdCard: string
  healthStatus?: string
  specialNeeds?: string
  parentName: string
  parentPhone: string
  parentRelation: string
  parentEmail?: string
  parentAddress: string
  className: string
  enrollmentDate: string
  applicationDate: string
  source: string
  status: string
  enrollmentType: string
  reviewDate?: string
  interviewDate?: string
  confirmDate?: string
  remarks?: string
}

// 路由和响应式数据
const route = useRoute()
const router = useRouter()
const enrollmentId = computed(() => route.params.id as string)

const loading = ref(false)
const error = ref<string | null>(null)
const enrollment = ref<EnrollmentDetail | null>(null)

// 获取招生详情
const fetchEnrollmentDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    enrollment.value = {
      id: enrollmentId.value,
      studentName: '张小明',
      studentGender: '男',
      studentBirthDate: '2020-03-15',
      studentAge: 4,
      studentIdCard: '110101202003150001',
      healthStatus: '良好',
      specialNeeds: '无特殊需求',
      parentName: '张大明',
      parentPhone: '13800138000',
      parentRelation: '父亲',
      parentEmail: 'zhangdaming@example.com',
      parentAddress: '北京市朝阳区某某街道某某小区',
      className: '阳光班',
      enrollmentDate: '2024-09-01',
      applicationDate: '2024-06-15',
      source: '线上报名',
      status: 'confirmed',
      enrollmentType: '正常入学',
      reviewDate: '2024-06-20',
      interviewDate: '2024-07-01',
      confirmDate: '2024-07-15',
      remarks: '学生活泼开朗，适应能力强'
    }
  } catch (err) {
    error.value = '获取招生详情失败，请重试'
    console.error('获取招生详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 状态相关方法
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'status-pending',
    'reviewing': 'status-reviewing',
    'interview': 'status-interview',
    'confirmed': 'status-confirmed',
    'enrolled': 'status-enrolled',
    'rejected': 'status-rejected'
  }
  return statusMap[status] || 'status-default'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'reviewing': '审核中',
    'interview': '面试中',
    'confirmed': '已确认',
    'enrolled': '已入学',
    'rejected': '已拒绝'
  }
  return statusMap[status] || '未知状态'
}

const getProgressStep = (status: string) => {
  const stepMap: Record<string, number> = {
    'pending': 0,
    'reviewing': 1,
    'interview': 2,
    'confirmed': 3,
    'enrolled': 4,
    'rejected': 1
  }
  return stepMap[status] || 0
}

// 工具方法
const formatDate = (dateString: string) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 操作方法
const goBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/enrollment/edit/${enrollmentId.value}`)
}

const handlePrint = () => {
  ElMessage.info('打印功能开发中...')
}

// 生命周期
onMounted(() => {
  fetchEnrollmentDetail()
})
</script>

<style scoped>
.enrollment-detail-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--border-color-light);
}

.page-header h2 {
  margin: 0;
  color: var(--text-color-primary);
  font-size: var(--text-3xl);
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.header-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.loading-container {
  text-align: center;
  padding: var(--spacing-xl);
}

.loading-text {
  margin-top: var(--spacing-md);
  color: var(--text-color-secondary);
}

.detail-content {
  background: var(--bg-color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
}

.content-header {
  padding: var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--border-color-light);
  background: var(--bg-color-page);
}

.content-header h3 {
  margin: 0;
  color: var(--text-color-primary);
  font-size: var(--text-xl);
  font-weight: 600;
}

.enrollment-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.enrollment-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  font-weight: bold;
}

.enrollment-info {
  flex: 1;
}

.student-name {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-color-primary);
  font-size: var(--text-2xl);
  font-weight: 600;
}

.enrollment-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.enrollment-id {
  color: var(--text-color-secondary);
  font-size: var(--text-base);
}

.enrollment-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.status-pending { background: #fef0e6; color: #d46b08; }
.status-reviewing { background: #e6f7ff; color: var(--primary-color); }
.status-interview { background: #f6ffed; color: var(--success-color); }
.status-confirmed { background: #f6ffed; color: var(--success-color); }
.status-enrolled { background: #f6ffed; color: var(--success-color); }
.status-rejected { background: var(--bg-white)2f0; color: var(--brand-danger); }

.enrollment-type-tag {
  padding: var(--spacing-lg) var(--text-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.content-body {
  padding: var(--spacing-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  color: var(--text-color-secondary);
  font-size: var(--text-base);
  font-weight: 500;
}

.info-item span {
  color: var(--text-color-primary);
  font-size: var(--text-lg);
}

.remarks-text {
  color: var(--text-color-primary);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: var(--breakpoint-md)) {
  .enrollment-detail-page {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .enrollment-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
