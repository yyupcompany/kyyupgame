<template>
  <div class="application-review-form">
    <el-form
      ref="formRef"
      :model="reviewForm"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="审核结果" prop="status">
        <el-radio-group v-model="reviewForm.status">
          <el-radio value="approved">通过</el-radio>
          <el-radio value="rejected">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <template v-if="reviewForm.status === ApplicationStatus.APPROVED">
        <el-form-item label="入园时间" prop="enrollmentDate">
          <el-date-picker 
            v-model="reviewForm.enrollmentDate" 
            type="date" 
            placeholder="选择入园时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </template>
      
      <template v-if="reviewForm.status === ApplicationStatus.REJECTED">
        <el-form-item label="拒绝原因" prop="rejectReason">
          <el-select v-model="reviewForm.rejectReason" placeholder="选择拒绝原因">
            <el-option :value="RejectReason.QUOTA_FULL" label="名额已满" />
            <el-option :value="RejectReason.AGE_NOT_MATCH" label="年龄不符" />
            <el-option :value="RejectReason.INCOMPLETE_INFO" label="信息不完整" />
            <el-option :value="RejectReason.OTHER" label="其他原因" />
          </el-select>
        </el-form-item>
      </template>
      
      <el-form-item label="备注" prop="remark">
        <el-input 
          v-model="reviewForm.remark" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入审核备注"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item>
        <el-button :type="'primary'" @click="submitForm" :loading="submitting">提交审核</el-button>
        <el-button @click="resetForm">重置</el-button>
        <slot name="actions"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FormInstance, FormRules } from 'element-plus';
import { ApplicationStatus, RejectReason, ApplicationReviewParams } from '@/types/application';

interface Props {
  applicationId: number;
  initialStatus?: ApplicationStatus;
}

const props = withDefaults(defineProps<Props>(), {
  initialStatus: ApplicationStatus.APPROVED
});

const emit = defineEmits<{
  (e: 'submit', data: ApplicationReviewParams): void;
  (e: 'reset'): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);

// 审核表单数据
const reviewForm = reactive<ApplicationReviewParams>({
  id: props.applicationId,
  status: props.initialStatus,
  rejectReason: undefined,
  remark: '',
  enrollmentDate: undefined
});

// 表单验证规则
const formRules = reactive<FormRules>({
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  rejectReason: [
    { 
      required: true, 
      message: '请选择拒绝原因', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (reviewForm.status === ApplicationStatus.REJECTED && !value) {
          callback(new Error('请选择拒绝原因'));
        } else {
          callback();
        }
      }
    }
  ],
  enrollmentDate: [
    {
      required: true,
      message: '请选择入园时间',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (reviewForm.status === ApplicationStatus.APPROVED && !value) {
          callback(new Error('请选择入园时间'));
        } else {
          callback();
        }
      }
    }
  ],
  remark: [
    { max: 200, message: '备注不能超过200个字符', trigger: 'blur' }
  ]
});

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      submitting.value = true;
      try {
        // 清理不需要的字段
        const formData = { ...reviewForm };
        if (formData.status === ApplicationStatus.APPROVED) {
          formData.rejectReason = undefined;
        } else if (formData.status === ApplicationStatus.REJECTED) {
          formData.enrollmentDate = undefined;
        }
        
        // 向父组件提交
        emit('submit', formData);
      } catch (error) {
        console.error('表单提交失败', error);
      } finally {
        submitting.value = false;
      }
    } else {
      console.log('表单验证失败', fields);
    }
  });
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  emit('reset');
};
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.application-review-form {
  max-width: 600px;
  margin: 0 auto;
}
</style> 