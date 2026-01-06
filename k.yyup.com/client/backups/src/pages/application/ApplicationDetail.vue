<template>
  <div class="business-process-container application-detail-page">
    <div class="page-header">
      <h2>申请详情</h2>
      <div class="header-actions">
        <el-button class="header-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button class="header-btn" type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印申请
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <el-skeleton :rows="10" animated />
      </div>
      <div class="loading-text">正在加载申请详情...</div>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
      show-icon
    />

    <template v-if="!loading && !error && application">
      <!-- 申请基本信息 -->
      <div class="detail-content application-basic-info">
        <div class="content-header">
          <div class="application-profile">
            <div class="application-avatar">
              {{ application.studentName.charAt(0).toUpperCase() }}
            </div>
            <div class="application-info">
              <h1 class="student-name">{{ application.studentName }}</h1>
              <div class="application-meta">
                <span class="application-id">#{{ application.id }}</span>
                <span class="application-status" :class="getStatusClass(application.status)">
                  {{ getStatusText(application.status) }}
                </span>
              </div>
            </div>
            <div class="profile-actions">
              <span class="application-type-tag">{{ application.applicationType }}</span>
            </div>
          </div>
        </div>
        <div class="content-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">申请时间</div>
              <div class="info-value">{{ formatDate(application.applyTime) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">学生年龄</div>
              <div class="info-value">{{ application.studentAge }}岁</div>
            </div>
            <div class="info-item">
              <div class="info-label">家长姓名</div>
              <div class="info-value">{{ application.parentName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">联系电话</div>
              <div class="info-value">{{ application.contactPhone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">申请班级</div>
              <div class="info-value">{{ application.className }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 附加信息 -->
      <div v-if="application.additionalInfo" class="detail-content additional-info-section">
        <div class="content-header">
          <h3 class="content-title">
            <el-icon><Document /></el-icon>
            附加信息
          </h3>
        </div>
        <div class="content-body">
          <div class="additional-info-content">
            <div class="info-text">{{ application.additionalInfo }}</div>
          </div>
        </div>
      </div>

      <!-- 审核结果 -->
      <div v-if="application.status === ApplicationStatus.APPROVED || application.status === ApplicationStatus.REJECTED" class="detail-content review-result-section">
        <div class="content-header">
          <h3 class="content-title">
            <el-icon><Checked /></el-icon>
            审核结果
          </h3>
          <div class="review-status">
            <span class="application-status" :class="getStatusClass(application.status)">
              {{ getStatusText(application.status) }}
            </span>
          </div>
        </div>
        <div class="content-body">
          <div class="review-result-grid">
            <div class="review-item">
              <div class="review-label">审核时间</div>
              <div class="review-value">{{ formatDate(application.reviewTime) }}</div>
            </div>
            <div v-if="application.status === ApplicationStatus.APPROVED" class="review-item">
              <div class="review-label">入园时间</div>
              <div class="review-value">{{ formatDate(application.enrollmentDate) }}</div>
            </div>
            <div v-if="application.status === ApplicationStatus.REJECTED" class="review-item">
              <div class="review-label">拒绝原因</div>
              <div class="review-value">
                <span class="reject-reason-tag">{{ getRejectReasonText(application.rejectReason) }}</span>
              </div>
            </div>
            <div v-if="application.remark" class="review-item full-width">
              <div class="review-label">审核备注</div>
              <div class="review-value review-remark">{{ application.remark }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 申请审核 -->
      <div v-if="application.status === ApplicationStatus.PENDING" class="detail-content review-section">
        <div class="content-header">
          <h3 class="content-title">
            <el-icon><EditPen /></el-icon>
            申请审核
          </h3>
        </div>
        <div class="content-body">
          <div class="review-form-container">
            <el-form :model="reviewForm" label-width="120px">
              <el-form-item label="审核结果" required>
                <el-radio-group v-model="reviewForm.status" class="review-status-group">
                  <el-radio :value="ApplicationStatus.APPROVED" class="approve-radio">
                    <el-icon><Check /></el-icon>
                    通过申请
                  </el-radio>
                  <el-radio :value="ApplicationStatus.REJECTED" class="reject-radio">
                    <el-icon><Close /></el-icon>
                    拒绝申请
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item v-if="reviewForm.status === ApplicationStatus.APPROVED" label="入园时间" required>
                <el-date-picker
                  v-model="reviewForm.enrollmentDate"
                  type="date"
                  placeholder="选择入园日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item v-if="reviewForm.status === ApplicationStatus.REJECTED" label="拒绝原因" required>
                <el-select v-model="reviewForm.rejectReason" placeholder="请选择拒绝原因" style="width: 100%">
                  <el-option :value="RejectReason.QUOTA_FULL" label="名额已满" />
                  <el-option :value="RejectReason.AGE_NOT_MATCH" label="年龄不符" />
                  <el-option :value="RejectReason.INCOMPLETE_INFO" label="信息不完整" />
                  <el-option :value="RejectReason.OTHER" label="其他原因" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="审核备注">
                <el-input
                  v-model="reviewForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入审核备注信息"
                />
              </el-form-item>
            </el-form>
            
            <div class="review-actions">
              <el-button class="action-btn secondary" @click="goBack">
                <el-icon><ArrowLeft /></el-icon>
                取消
              </el-button>
              <el-button 
                v-if="reviewForm.status === ApplicationStatus.APPROVED"
                class="action-btn approve"
                :loading="reviewing"
                @click="submitReview"
              >
                <el-icon><Check /></el-icon>
                确认通过
              </el-button>
              <el-button 
                v-if="reviewForm.status === ApplicationStatus.REJECTED"
                class="action-btn reject"
                :loading="reviewing"
                @click="submitReview"
              >
                <el-icon><Close /></el-icon>
                确认拒绝
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted, computed, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Printer, Document, Checked, EditPen, Check, Close 
} from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import { APPLICATION_ENDPOINTS } from '@/api/endpoints'
import { get, post, put } from '@/utils/request'
import { ErrorHandler } from '@/utils/errorHandler'
import type { ApiResponse } from '@/api/endpoints'

// 4. 页面内部类型定义
// 本地定义枚举和接口
enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

enum RejectReason {
  QUOTA_FULL = 'QUOTA_FULL',
  AGE_NOT_MATCH = 'AGE_NOT_MATCH',
  INCOMPLETE_INFO = 'INCOMPLETE_INFO',
  OTHER = 'OTHER'
}

interface ApplicationInfo {
  id: number;
  studentName: string;
  studentAge: number;
  parentName: string;
  contactPhone: string;
  className: string;
  applicationType: string;
  status: ApplicationStatus;
  applyTime: string;
  additionalInfo?: string;
  reviewTime: string | null;
  enrollmentDate: string | null;
  rejectReason: RejectReason | null;
  remark: string | null;
  reviewedBy?: string;
  reviewRemark?: RejectReason | null;
}

// 本地定义格式化日期函数
const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 本地定义ApplicationStatusTag组件
const ApplicationStatusTag = defineComponent({
  name: 'ApplicationStatusTag',
  props: {
    status: {
      type: String,
  required: true
    }
  },
  setup(props: { status: string }) {
    const getStatusType = () => {
      switch (props.status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        default: return 'info';
      }
    };

    const getStatusText = () => {
      switch (props.status) {
        case 'PENDING': return '待审核';
        case 'APPROVED': return '已通过';
        case 'REJECTED': return '已拒绝';
        default: return '未知';
      }
    };

    return {
      getStatusType,
      getStatusText
    };
  },
  template: '<el-tag :type="getStatusType()">{{ getStatusText() }}</el-tag>'
});

// 本地定义ApplicationReviewForm组件
const ApplicationReviewForm = defineComponent({
  name: 'ApplicationReviewForm',
  props: {
    applicationId: {
      type: Number,
  required: true
    }
  },
  emits: ['submit', 'reset'],
  template: '<div>审核表单</div>'
});

const route = useRoute();
const router = useRouter();
const applicationId = computed(() => Number(route.params.id));

const loading = ref(true);
const error = ref<string | null>(null);
const application = ref<ApplicationInfo | null>(null);
const reviewing = ref(false);

// 审核表单
const reviewForm = ref({
  status: ApplicationStatus.PENDING,
  enrollmentDate: '',
  rejectReason: null as RejectReason | null,
  remark: ''
});

// 获取申请详情
const fetchApplicationDetail = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 使用统一的API请求方式
    const response: ApiResponse = await request.get(ENROLLMENT_APPLICATION_ENDPOINTS.GET_BY_ID(applicationId.value));

    if (response && response.data && response.data.success) {
      application.value = response.data.data;
      return;
    }

    // 如果第一个API调用失败，尝试备用API
    const fallbackResponse = await get(APPLICATION_ENDPOINTS.DETAIL(applicationId.value));

    if (fallbackResponse.success && fallbackResponse.data) {
      application.value = fallbackResponse.data;
    } else {
      const errorInfo = ErrorHandler.handle(new Error(fallbackResponse.message || '获取申请详情失败'), true);
    }
  } catch (err) {
    const errorInfo = ErrorHandler.handle(err, true);
    error.value = '获取申请详情失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 获取拒绝原因文本
const getRejectReasonText = (reason: RejectReason | null | undefined): string => {
  if (!reason) return '未指定';
  
  const reasonMap: Record<RejectReason, string> = {
    [RejectReason.QUOTA_FULL]: '名额已满',
    [RejectReason.AGE_NOT_MATCH]: '年龄不符',
    [RejectReason.INCOMPLETE_INFO]: '信息不完整',
    [RejectReason.OTHER]: '其他原因'
  };
  
  return reasonMap[reason] || '未知原因';
};

// 获取状态样式类名
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'status-pending'
    case 'APPROVED':
      return 'status-approved'
    case 'REJECTED':
      return 'status-rejected'
    case 'CANCELLED':
      return 'status-cancelled'
    default:
      return 'status-pending'
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '待审核'
    case 'APPROVED':
      return '已通过'
    case 'REJECTED':
      return '已拒绝'
    case 'CANCELLED':
      return '已取消'
    default:
      return '未知'
  }
}

// 提交审核
const submitReview = async () => {
  if (!reviewForm.value.status) {
    ElMessage.warning('请选择审核结果')
    return
  }
  
  if (reviewForm.value.status === ApplicationStatus.APPROVED && !reviewForm.value.enrollmentDate) {
    ElMessage.warning('请选择入园时间')
    return
  }
  
  if (reviewForm.value.status === ApplicationStatus.REJECTED && !reviewForm.value.rejectReason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }
  
  reviewing.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (application.value) {
      application.value.status = reviewForm.value.status
      application.value.reviewTime = new Date().toISOString()
      application.value.remark = reviewForm.value.remark
      
      if (reviewForm.value.status === ApplicationStatus.APPROVED) {
        application.value.enrollmentDate = reviewForm.value.enrollmentDate
        ElMessage.success('申请已批准！')
      } else {
        application.value.rejectReason = reviewForm.value.rejectReason
        ElMessage.success('申请已拒绝！')
      }
    }
  } catch (error) {
    console.error('审核失败', error)
    ElMessage.error('审核失败，请重试')
  } finally {
    reviewing.value = false
  }
}

// 打印申请
const handlePrint = () => {
  ElMessage.info('打印功能待实现')
}

// 返回列表页
const goBack = () => {
  router.push('/application/list');
};

// 页面加载时获取申请详情
onMounted(() => {
  fetchApplicationDetail();
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import './business-process-ux-styles.scss';
/* 申请详情页面专用样式 */
.application-detail-page {
  /* 申请信息头部 */
  .application-basic-info {
    .application-profile {
      display: flex;
      align-items: center;
      gap: var(--app-gap);
      
      .application-avatar {
        width: var(--avatar-size); height: var(--avatar-size);
        border-radius: var(--radius-full);
        background: var(--gradient-blue);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        font-weight: 700;
        box-shadow: var(--shadow-md);
      }
      
      .application-info {
        flex: 1;
        
        .student-name {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
          background: var(--gradient-blue);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .application-meta {
          display: flex;
          align-items: center;
          gap: var(--app-gap);
          flex-wrap: wrap;
          
          .application-id {
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 0.875rem;
          }
          
          .application-status {
            padding: var(--spacing-lg) var(--text-sm);
            border-radius: var(--spacing-sm);
            font-size: 0.875rem;
            font-weight: 600;
            
            &.status-pending {
              background: var(--gradient-orange);
              color: white;
            }
            
            &.status-approved {
              background: var(--gradient-green);
              color: white;
            }
            
            &.status-rejected {
              background: var(--gradient-red);
              color: white;
            }
          }
        }
      }
      
      .profile-actions {
        .application-type-tag {
          padding: var(--spacing-sm) var(--text-lg);
          background: var(--gradient-purple);
          color: white;
          border-radius: var(--spacing-sm);
          font-weight: 600;
          font-size: 0.875rem;
        }
      }
      
      @media (max-width: var(--breakpoint-md)) {
        flex-direction: column;
        text-align: center;
        gap: var(--app-gap);
        
        .application-avatar {
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        }
        
        .student-name {
          font-size: 1.5rem;
        }
      }
    }
  }
  
  /* 附加信息区域 */
  .additional-info-section {
    .additional-info-content {
      .info-text {
        background: var(--bg-tertiary);
        padding: var(--app-gap);
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color);
        font-size: 1rem;
        line-height: 1.6;
        color: var(--text-primary);
        
        &::before {
          content: '📝';
          margin-right: var(--spacing-sm);
        }
      }
    }
  }
  
  /* 审核结果区域 */
  .review-result-section {
    .review-status {
      .application-status {
        padding: var(--spacing-sm) var(--text-lg);
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 1rem;
      }
    }
    
    .review-result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--app-gap);
      
      .review-item {
        background: var(--bg-tertiary);
        padding: var(--app-gap);
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color);
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-light);
        }
        
        &.full-width {
          grid-column: 1 / -1;
        }
        
        .review-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .review-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          
          &.review-remark {
            font-weight: 500;
            line-height: 1.6;
          }
        }
        
        .reject-reason-tag {
          padding: var(--spacing-lg) var(--text-sm);
          background: var(--gradient-red);
          color: white;
          border-radius: var(--spacing-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }
      }
      
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
        gap: var(--app-gap);
      }
    }
  }
  
  /* 审核表单区域 */
  .review-section {
    .review-form-container {
      .review-status-group {
        display: flex;
        gap: var(--app-gap);
        flex-wrap: wrap;
        
        .el-radio {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--app-gap-sm) var(--text-2xl);
          transition: all 0.3s ease;
          margin-right: 0;
          
          &:hover {
            border-color: var(--border-light);
          }
          
          &.is-checked {
            &.approve-radio {
              border-color: var(--success-color);
              background: var(--success-light-bg);
              
              .el-radio__label {
                color: var(--success-color);
              }
            }
            
            &.reject-radio {
              border-color: var(--danger-color);
              background: var(--danger-light-bg);
              
              .el-radio__label {
                color: var(--danger-color);
              }
            }
          }
          
          .el-radio__label {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-weight: 600;
            padding-left: 0;
          }
        }
        
        @media (max-width: var(--breakpoint-md)) {
          flex-direction: column;
          gap: var(--app-gap);
          
          .el-radio {
            width: 100%;
          }
        }
      }
      
      .review-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--app-gap);
        margin-top: var(--app-gap-xl);
        padding-top: var(--app-gap);
        border-top: var(--border-width-base) solid var(--border-color);
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--app-gap-sm) var(--text-3xl);
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 120px;
          justify-content: center;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 var(--spacing-sm) var(--text-2xl) var(--shadow-medium);
          }
          
          &.secondary {
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            color: var(--text-primary);
            
            &:hover {
              background: var(--bg-hover);
              border-color: var(--border-light);
            }
          }
          
          &.approve {
            background: var(--gradient-green);
            border: none;
            color: white;
            
            &:hover {
              box-shadow: var(--shadow-success);
            }
          }
          
          &.reject {
            background: var(--gradient-red);
            border: none;
            color: white;
            
            &:hover {
              box-shadow: var(--shadow-danger);
            }
          }
        }
        
        @media (max-width: var(--breakpoint-md)) {
          flex-direction: column;
          
          .action-btn {
            width: 100%;
            min-width: auto;
          }
        }
      }
    }
  }
}

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.application-detail-container {
  padding: var(--app-gap);
  background: var(--bg-secondary);
  min-height: calc(100vh - var(--header-height));
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-gap);
  
  h2 {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    background: var(--gradient-purple);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.header-actions {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
}

.detail-card {
  margin-bottom: var(--app-gap);
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal, 0.3s) ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.loading-container {
  padding: var(--app-gap);
  text-align: center;
  color: var(--text-secondary);
}

.additional-info {
  padding: var(--app-gap);
  background: var(--bg-tertiary) !important;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  
  p {
    margin: 0;
    color: var(--text-primary);
    line-height: 1.6;
  }
}

.actions-container {
  margin-top: var(--app-gap);
}

.review-actions {
  display: flex;
  gap: var(--app-gap-sm);
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--app-gap);
}

/* 白色区域修复：Descriptions组件主题化 */
:deep(.el-descriptions) {
  .el-descriptions__header {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
  }
  
  .el-descriptions__body {
    background: var(--bg-card) !important;
  }
  
  .el-descriptions__table {
    border-color: var(--border-color) !important;
    
    .el-descriptions__cell {
      border-color: var(--border-color) !important;
      
      &.is-bordered-label {
        background: var(--bg-tertiary) !important;
        color: var(--text-primary) !important;
        font-weight: 500;
      }
      
      &.is-bordered-content {
        background: var(--bg-card) !important;
        color: var(--text-primary) !important;
      }
    }
  }
}

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
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

/* 白色区域修复：Alert组件主题化 */
:deep(.el-alert) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-alert__title {
    color: var(--text-primary) !important;
  }
  
  .el-alert__content {
    color: var(--text-secondary) !important;
  }
  
  &.el-alert--error {
    background: var(--danger-light-bg) !important;
    border-color: var(--danger-color) !important;
    
    .el-alert__title {
      color: var(--danger-color) !important;
    }
  }
}

/* 白色区域修复：Skeleton组件主题化 */
:deep(.el-skeleton) {
  .el-skeleton__item {
    background: var(--bg-tertiary) !important;
  }
}

/* 白色区域修复：Tag组件主题化 */
:deep(.el-tag) {
  &.el-tag--success {
    background: var(--success-light-bg) !important;
    border-color: var(--success-color) !important;
    color: var(--success-color) !important;
  }
  
  &.el-tag--warning {
    background: var(--warning-light-bg) !important;
    border-color: var(--warning-color) !important;
    color: var(--warning-color) !important;
  }
  
  &.el-tag--danger {
    background: var(--danger-light-bg) !important;
    border-color: var(--danger-color) !important;
    color: var(--danger-color) !important;
  }
  
  &.el-tag--info {
    background: var(--info-light-bg) !important;
    border-color: var(--info-color) !important;
    color: var(--info-color) !important;
  }
}

/* 响应式设计优化 */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--app-gap-sm);
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  :deep(.el-descriptions) {
    .el-descriptions__table {
      .el-descriptions__row {
        display: block;
        
        .el-descriptions__cell {
          display: block;
          width: 100% !important;
          
          &.is-bordered-label {
            border-bottom: none !important;
          }
          
          &.is-bordered-content {
            border-top: none !important;
            margin-bottom: var(--app-gap-sm);
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .application-detail-container {
    padding: var(--app-gap-sm);
  }
  
  .detail-card {
    margin-bottom: var(--app-gap-sm);
  }
  
  .additional-info {
    padding: var(--app-gap-sm);
  }
  
  .review-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style> 