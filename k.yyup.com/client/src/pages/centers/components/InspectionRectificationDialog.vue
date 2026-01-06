<template>
  <el-dialog
    v-model="dialogVisible"
    :title="mode === 'create' ? '🔧 创建整改任务' : '🔧 整改任务详情'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="问题描述" prop="problemDescription">
        <el-input
          v-model="formData.problemDescription"
          type="textarea"
          :rows="4"
          placeholder="请详细描述发现的问题"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="问题严重程度" prop="problemSeverity">
            <el-select v-model="formData.problemSeverity" style="width: 100%">
              <el-option label="低" value="low">
                <el-tag type="info">低</el-tag>
              </el-option>
              <el-option label="中" value="medium">
                <el-tag type="warning">中</el-tag>
              </el-option>
              <el-option label="高" value="high">
                <el-tag type="danger">高</el-tag>
              </el-option>
              <el-option label="紧急" value="urgent">
                <el-tag type="danger" effect="dark">紧急</el-tag>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="整改截止日期" prop="deadline">
            <el-date-picker
              v-model="formData.deadline"
              type="date"
              placeholder="选择截止日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="整改措施" prop="rectificationMeasures">
        <el-input
          v-model="formData.rectificationMeasures"
          type="textarea"
          :rows="4"
          placeholder="请详细描述整改措施"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="责任人" prop="responsiblePersonName">
            <el-input
              v-model="formData.responsiblePersonName"
              placeholder="请输入责任人姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="整改进度" prop="progress">
            <el-slider
              v-model="formData.progress"
              :show-tooltip="true"
              :format-tooltip="(val: number) => `${val}%`"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          placeholder="其他说明"
        />
      </el-form-item>

      <!-- 进度日志（仅查看模式） -->
      <div v-if="mode === 'view' && progressLogs.length > 0">
        <el-divider content-position="left">
          <span style="font-weight: bold;">📊 进度记录</span>
        </el-divider>

        <el-timeline>
          <el-timeline-item
            v-for="log in progressLogs"
            :key="log.id"
            :timestamp="log.logDate"
            placement="top"
          >
            <el-card>
              <div class="progress-log-content">
                <div class="log-header">
                  <el-tag>进度: {{ log.progress }}%</el-tag>
                  <span class="log-operator">操作人: {{ log.operatorName }}</span>
                </div>
                <div class="log-description">{{ log.description }}</div>
                <div v-if="log.photos && log.photos.length > 0" class="log-photos">
                  <el-image
                    v-for="(photo, index) in log.photos"
                    :key="index"
                    :src="photo"
                    :preview-src-list="log.photos"
                    class="log-photo"
                  />
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 整改完成信息（仅查看模式且状态为已完成） -->
      <div v-if="mode === 'view' && formData.status === 'completed'">
        <el-divider content-position="left">
          <span style="font-weight: bold;">✅ 整改完成情况</span>
        </el-divider>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="完成日期">
            {{ formData.completionDate }}
          </el-descriptions-item>
          <el-descriptions-item label="完成进度">
            <el-progress :percentage="100" :stroke-width="20" status="success" />
          </el-descriptions-item>
          <el-descriptions-item label="完成说明" :span="2">
            {{ formData.completionDescription }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="formData.completionPhotos && formData.completionPhotos.length > 0" style="margin-top: var(--text-lg);">
          <div style="margin-bottom: var(--spacing-sm); font-weight: bold;">完成照片:</div>
          <el-image
            v-for="(photo, index) in formData.completionPhotos"
            :key="index"
            :src="photo"
            :preview-src-list="formData.completionPhotos"
            style="max-width: 100px; width: 100%; min-height: 60px; height: auto; margin-right: var(--spacing-sm);"
          />
        </div>
      </div>

      <!-- 验收信息（仅查看模式且已验收） -->
      <div v-if="mode === 'view' && formData.status === 'verified'">
        <el-divider content-position="left">
          <span style="font-weight: bold;">🔍 验收情况</span>
        </el-divider>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="验收人">
            {{ formData.verifierName }}
          </el-descriptions-item>
          <el-descriptions-item label="验收日期">
            {{ formData.verificationDate }}
          </el-descriptions-item>
          <el-descriptions-item label="验收状态" :span="2">
            <el-tag :type="formData.verificationStatus === 'pass' ? 'success' : 'danger'">
              {{ formData.verificationStatus === 'pass' ? '✅ 通过' : '❌ 不通过' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="验收结果" :span="2">
            {{ formData.verificationResult }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-form>

    <template #footer>
      <div v-if="mode === 'create'">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          创建整改任务
        </el-button>
      </div>
      <div v-else-if="mode === 'view'">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="formData.status === 'pending' || formData.status === 'in_progress'" type="primary" @click="showProgressDialog = true">
          更新进度
        </el-button>
        <el-button v-if="formData.status === 'in_progress' && formData.progress === 100" type="success" @click="showCompleteDialog = true">
          标记完成
        </el-button>
        <el-button v-if="formData.status === 'completed'" type="warning" @click="showVerifyDialog = true">
          验收
        </el-button>
      </div>
    </template>

    <!-- 进度更新对话框 -->
    <el-dialog
      v-model="showProgressDialog"
      title="更新整改进度"
      width="500px"
      append-to-body
    >
      <el-form ref="progressFormRef" :model="progressForm" label-width="100px">
        <el-form-item label="进度" prop="progress">
          <el-slider v-model="progressForm.progress" :show-tooltip="true" :format-tooltip="(val: number) => `${val}%`" />
        </el-form-item>
        <el-form-item label="进度说明" prop="description">
          <el-input v-model="progressForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="进度照片">
          <el-upload
            v-model:file-list="progressForm.photoFiles"
            action="/api/upload"
            list-type="picture-card"
            :on-success="handleProgressPhotoSuccess"
            accept="image/*"
          >
            <UnifiedIcon name="Plus" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProgressDialog = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 完成对话框 -->
    <el-dialog
      v-model="showCompleteDialog"
      title="标记整改完成"
      width="500px"
      append-to-body
    >
      <el-form ref="completeFormRef" :model="completeForm" label-width="100px">
        <el-form-item label="完成说明" prop="completionDescription">
          <el-input v-model="completeForm.completionDescription" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="完成照片">
          <el-upload
            v-model:file-list="completeForm.photoFiles"
            action="/api/upload"
            list-type="picture-card"
            :on-success="handleCompletePhotoSuccess"
            accept="image/*"
          >
            <UnifiedIcon name="Plus" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCompleteDialog = false">取消</el-button>
        <el-button type="success" @click="submitComplete">确认完成</el-button>
      </template>
    </el-dialog>

    <!-- 验收对话框 -->
    <el-dialog
      v-model="showVerifyDialog"
      title="验收整改任务"
      width="500px"
      append-to-body
    >
      <el-form ref="verifyFormRef" :model="verifyForm" label-width="100px">
        <el-form-item label="验收状态" prop="verificationStatus">
          <el-radio-group v-model="verifyForm.verificationStatus">
            <el-radio label="pass">✅ 通过</el-radio>
            <el-radio label="fail">❌ 不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收结果" prop="verificationResult">
          <el-input v-model="verifyForm.verificationResult" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showVerifyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">提交验收</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { request } from '@/utils/request';

interface Props {
  visible: boolean;
  mode?: 'create' | 'view';
  planData?: any;
  recordData?: any;
  rectificationData?: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
});

const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const formRef = ref();
const submitLoading = ref(false);
const progressLogs = ref<any[]>([]);

const showProgressDialog = ref(false);
const showCompleteDialog = ref(false);
const showVerifyDialog = ref(false);

// 表单数据
const formData = reactive({
  problemDescription: '',
  problemSeverity: 'medium',
  rectificationMeasures: '',
  responsiblePersonName: '',
  deadline: '',
  progress: 0,
  notes: '',
  status: 'pending',
  completionDate: '',
  completionDescription: '',
  completionPhotos: [],
  verifierName: '',
  verificationDate: '',
  verificationStatus: '',
  verificationResult: ''
});

// 进度表单
const progressForm = reactive({
  progress: 0,
  description: '',
  photos: [],
  photoFiles: []
});

// 完成表单
const completeForm = reactive({
  completionDescription: '',
  completionPhotos: [],
  photoFiles: []
});

// 验收表单
const verifyForm = reactive({
  verificationStatus: 'pass',
  verificationResult: ''
});

// 表单验证规则
const formRules = {
  problemDescription: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
  problemSeverity: [{ required: true, message: '请选择问题严重程度', trigger: 'change' }],
  responsiblePersonName: [{ required: true, message: '请输入责任人', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }]
};

// 监听对话框显示
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
  if (val) {
    if (props.mode === 'view' && props.rectificationData) {
      loadRectificationData();
    } else {
      resetForm();
    }
  }
});

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 加载整改数据
const loadRectificationData = async () => {
  if (!props.rectificationData) return;

  Object.assign(formData, props.rectificationData);

  // 加载进度日志
  try {
    const response = await request.get(`/inspection-rectifications/${props.rectificationData.id}/progress`);
    if (response.success) {
      progressLogs.value = response.data;
    }
  } catch (error) {
    console.error('加载进度日志失败:', error);
  }
};

// 照片上传成功
const handleProgressPhotoSuccess = (response: any) => {
  if (response.success && response.data?.url) {
    progressForm.photos.push(response.data.url);
  }
};

const handleCompletePhotoSuccess = (response: any) => {
  if (response.success && response.data?.url) {
    completeForm.completionPhotos.push(response.data.url);
  }
};

// 提交创建
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    submitLoading.value = true;

    const submitData = {
      inspectionPlanId: props.planData.id,
      recordId: props.recordData?.id,
      problemDescription: formData.problemDescription,
      problemSeverity: formData.problemSeverity,
      rectificationMeasures: formData.rectificationMeasures,
      responsiblePersonName: formData.responsiblePersonName,
      deadline: formData.deadline,
      notes: formData.notes
    };

    const response = await request.post('/inspection-rectifications', submitData);

    if (response.success) {
      ElMessage.success('创建整改任务成功');
      emit('success');
      handleClose();
    } else {
      ElMessage.error(response.message || '创建失败');
    }
  } catch (error: any) {
    console.error('创建整改任务失败:', error);
    if (error !== false) {
      ElMessage.error('创建失败，请稍后重试');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 提交进度
const submitProgress = async () => {
  try {
    const response = await request.post(`/inspection-rectifications/${props.rectificationData.id}/progress`, {
      progress: progressForm.progress,
      description: progressForm.description,
      photos: progressForm.photos
    });

    if (response.success) {
      ElMessage.success('更新进度成功');
      showProgressDialog.value = false;
      emit('success');
      loadRectificationData();
    }
  } catch (error) {
    ElMessage.error('更新进度失败');
  }
};

// 提交完成
const submitComplete = async () => {
  try {
    const response = await request.post(`/inspection-rectifications/${props.rectificationData.id}/complete`, {
      completionDescription: completeForm.completionDescription,
      completionPhotos: completeForm.completionPhotos
    });

    if (response.success) {
      ElMessage.success('标记完成成功');
      showCompleteDialog.value = false;
      emit('success');
      loadRectificationData();
    }
  } catch (error) {
    ElMessage.error('标记完成失败');
  }
};

// 提交验收
const submitVerify = async () => {
  try {
    const response = await request.post(`/inspection-rectifications/${props.rectificationData.id}/verify`, {
      verificationStatus: verifyForm.verificationStatus,
      verificationResult: verifyForm.verificationResult
    });

    if (response.success) {
      ElMessage.success('验收完成');
      showVerifyDialog.value = false;
      emit('success');
      loadRectificationData();
    }
  } catch (error) {
    ElMessage.error('验收失败');
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    problemDescription: '',
    problemSeverity: 'medium',
    rectificationMeasures: '',
    responsiblePersonName: '',
    deadline: '',
    progress: 0,
    notes: '',
    status: 'pending'
  });
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.progress-log-content {
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-sm);

    .log-operator {
      color: var(--info-color);
      font-size: var(--text-base);
    }
  }

  .log-description {
    margin-bottom: var(--text-sm);
    line-height: 1.6;
  }

  .log-photos {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;

    .log-photo {
      width: var(--avatar-size); height: var(--avatar-size);
      border-radius: var(--spacing-xs);
    }
  }
}
</style>

