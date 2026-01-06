<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <div v-if="application" class="application-detail">
      <!-- 客户信息 -->
      <div class="detail-section">
        <h4>客户信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">
            {{ application.customer?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ application.customer?.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="客户来源">
            {{ application.customer?.source || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="跟进状态">
            <el-tag :type="getFollowStatusType(application.customer?.follow_status)">
              {{ application.customer?.follow_status || '未跟进' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 申请信息 -->
      <div class="detail-section">
        <h4>申请信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请教师">
            {{ application.teacher?.real_name || application.teacher?.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDateTime(application.appliedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="申请状态" :span="2">
            <el-tag :type="getStatusType(application.status)">
              {{ getStatusText(application.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="application.applyReason" label="申请理由" :span="2">
            {{ application.applyReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 审批信息（如果已审批） -->
      <div v-if="application.status !== 'pending'" class="detail-section">
        <h4>审批信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审批人">
            {{ application.principal?.real_name || application.principal?.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间">
            {{ formatDateTime(application.reviewedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="application.rejectReason" label="拒绝理由" :span="2">
            {{ application.rejectReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 审批操作（只在待审批状态显示） -->
      <div v-if="application.status === 'pending' && canReview" class="review-section">
        <el-divider />
        <h4>审批操作</h4>
        <el-form :model="reviewForm" label-width="80px">
          <el-form-item label="审批结果">
            <el-radio-group v-model="reviewForm.action">
              <el-radio label="approve">同意</el-radio>
              <el-radio label="reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="reviewForm.action === 'reject'" label="拒绝理由">
            <el-input
              v-model="reviewForm.rejectReason"
              type="textarea"
              :rows="3"
              placeholder="请输入拒绝理由"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="application?.status === 'pending' && canReview"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交审批
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { customerApplicationApi, type CustomerApplication } from '@/api/endpoints/customer-application';
import { formatDateTime } from '@/utils/date';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  modelValue: boolean;
  application: CustomerApplication | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

const userStore = useUserStore();
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const submitting = ref(false);
const reviewForm = reactive({
  action: 'approve' as 'approve' | 'reject',
  rejectReason: '',
});

// 是否可以审批
const canReview = computed(() => {
  const role = userStore.role;
  return role === 'principal' || role === 'admin';
});

// 对话框标题
const dialogTitle = computed(() => {
  if (!props.application) return '申请详情';
  if (props.application.status === 'pending') {
    return canReview.value ? '审批客户申请' : '申请详情';
  }
  return '申请详情';
});

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已同意',
    rejected: '已拒绝',
  };
  return statusMap[status] || status;
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  return typeMap[status] || 'info';
};

// 获取跟进状态标签类型
const getFollowStatusType = (status?: string) => {
  if (!status) return 'info';
  const typeMap: Record<string, any> = {
    '未跟进': 'info',
    '跟进中': 'warning',
    '已成交': 'success',
    '已放弃': 'danger',
  };
  return typeMap[status] || 'info';
};

// 重置表单
const resetForm = () => {
  reviewForm.action = 'approve';
  reviewForm.rejectReason = '';
};

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

// 提交审批
const handleSubmit = async () => {
  if (!props.application) return;

  // 验证拒绝理由
  if (reviewForm.action === 'reject' && !reviewForm.rejectReason.trim()) {
    ElMessage.warning('请输入拒绝理由');
    return;
  }

  submitting.value = true;
  try {
    await customerApplicationApi.reviewApplication(props.application.id, {
      action: reviewForm.action,
      rejectReason: reviewForm.rejectReason || undefined,
    });

    ElMessage.success(reviewForm.action === 'approve' ? '已同意申请' : '已拒绝申请');
    emit('success');
    handleClose();
  } catch (error: any) {
    console.error('审批失败:', error);
    ElMessage.error(error.message || '审批失败');
  } finally {
    submitting.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
.application-detail {
  .detail-section {
    margin-bottom: var(--text-3xl);

    h4 {
      margin: 0 0 var(--text-sm) 0;
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .review-section {
    margin-top: var(--text-3xl);

    h4 {
      margin: var(--text-lg) 0 var(--text-sm) 0;
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
</style>

