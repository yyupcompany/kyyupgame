<template>
  <el-dialog
    v-model="dialogVisible"
    title="📝 检查记录录入"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="检查日期" prop="checkDate">
            <el-date-picker
              v-model="formData.checkDate"
              type="date"
              placeholder="选择检查日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检查人员" prop="checkerName">
            <el-input
              v-model="formData.checkerName"
              placeholder="请输入检查人员姓名"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="总分" prop="totalScore">
            <el-input-number
              v-model="formData.totalScore"
              :min="0"
              :max="100"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="等级" prop="grade">
            <el-select v-model="formData.grade" placeholder="请选择等级" style="width: 100%">
              <el-option label="优秀" value="优秀" />
              <el-option label="良好" value="良好" />
              <el-option label="合格" value="合格" />
              <el-option label="不合格" value="不合格" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="检查总结" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          :rows="4"
          placeholder="请输入检查总结"
        />
      </el-form-item>

      <el-form-item label="改进建议" prop="suggestions">
        <el-input
          v-model="formData.suggestions"
          type="textarea"
          :rows="4"
          placeholder="请输入改进建议"
        />
      </el-form-item>

      <el-divider content-position="left">
        <span style="font-weight: bold;">检查项目明细</span>
      </el-divider>

      <div class="check-items-section">
        <el-button
          type="primary"
          size="small"
          @click="addCheckItem"
          style="margin-bottom: var(--text-sm)"
        >
          <el-icon><Plus /></el-icon>
          添加检查项
        </el-button>

        <div v-for="(item, index) in formData.items" :key="index" class="check-item-card">
          <el-card shadow="hover">
            <template #header>
              <div class="item-header">
                <span>检查项 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeCheckItem(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="检查项名称" :prop="`items.${index}.itemName`" :rules="{ required: true, message: '请输入检查项名称' }">
                  <el-input v-model="item.itemName" placeholder="例如：环境卫生" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分类" :prop="`items.${index}.itemCategory`">
                  <el-input v-model="item.itemCategory" placeholder="例如：安全管理" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="检查状态" :prop="`items.${index}.status`">
                  <el-select v-model="item.status" style="width: 100%">
                    <el-option label="✅ 通过" value="pass">
                      <span style="color: var(--success-color)">✅ 通过</span>
                    </el-option>
                    <el-option label="⚠️ 警告" value="warning">
                      <span style="color: var(--warning-color)">⚠️ 警告</span>
                    </el-option>
                    <el-option label="❌ 不通过" value="fail">
                      <span style="color: var(--danger-color)">❌ 不通过</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="得分" :prop="`items.${index}.score`">
                  <el-input-number v-model="item.score" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="满分" :prop="`items.${index}.maxScore`">
                  <el-input-number v-model="item.maxScore" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="问题描述" :prop="`items.${index}.problemDescription`">
              <el-input
                v-model="item.problemDescription"
                type="textarea"
                :rows="2"
                placeholder="如有问题，请详细描述"
              />
            </el-form-item>

            <el-form-item label="问题照片" :prop="`items.${index}.photos`">
              <el-upload
                v-model:file-list="item.photoFiles"
                action="/api/upload"
                list-type="picture-card"
                :on-success="(response, file, fileList) => handlePhotoSuccess(response, file, fileList, index)"
                :on-remove="(file, fileList) => handlePhotoRemove(file, fileList, index)"
                accept="image/*"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="备注" :prop="`items.${index}.notes`">
              <el-input
                v-model="item.notes"
                type="textarea"
                :rows="2"
                placeholder="其他说明"
              />
            </el-form-item>
          </el-card>
        </div>
      </div>

      <el-divider />

      <el-form-item label="检查人签名">
        <div class="signature-area">
          <el-button @click="showSignaturePad = true">
            <el-icon><Edit /></el-icon>
            签名
          </el-button>
          <img v-if="formData.checkerSignature" :src="formData.checkerSignature" class="signature-preview" />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        提交检查记录
      </el-button>
    </template>

    <!-- 签名板对话框 -->
    <el-dialog
      v-model="showSignaturePad"
      title="电子签名"
      width="600px"
      append-to-body
    >
      <div class="signature-pad-container">
        <canvas
          ref="signatureCanvas"
          width="540"
          height="300"
          class="signature-canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
        ></canvas>
      </div>
      <template #footer>
        <el-button @click="clearSignature">清除</el-button>
        <el-button type="primary" @click="saveSignature">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete, Edit } from '@element-plus/icons-vue';
import { request } from '@/utils/request';

interface Props {
  visible: boolean;
  planData: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const formRef = ref();
const submitLoading = ref(false);
const showSignaturePad = ref(false);

// 签名相关
const signatureCanvas = ref<HTMLCanvasElement>();
const isDrawing = ref(false);
const signatureContext = ref<CanvasRenderingContext2D | null>(null);

// 表单数据
const formData = reactive({
  checkDate: new Date().toISOString().split('T')[0],
  checkerName: '',
  totalScore: 0,
  grade: '',
  summary: '',
  suggestions: '',
  checkerSignature: '',
  items: [] as Array<{
    itemName: string;
    itemCategory: string;
    status: 'pass' | 'warning' | 'fail';
    score: number;
    maxScore: number;
    problemDescription: string;
    photos: string[];
    photoFiles: any[];
    notes: string;
  }>
});

// 表单验证规则
const formRules = {
  checkDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }],
  checkerName: [{ required: true, message: '请输入检查人员', trigger: 'blur' }],
  totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
  grade: [{ required: true, message: '请选择等级', trigger: 'change' }]
};

// 监听对话框显示
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
  if (val) {
    resetForm();
  }
});

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 添加检查项
const addCheckItem = () => {
  formData.items.push({
    itemName: '',
    itemCategory: '',
    status: 'pass',
    score: 0,
    maxScore: 100,
    problemDescription: '',
    photos: [],
    photoFiles: [],
    notes: ''
  });
};

// 移除检查项
const removeCheckItem = (index: number) => {
  formData.items.splice(index, 1);
};

// 照片上传成功
const handlePhotoSuccess = (response: any, file: any, fileList: any[], index: number) => {
  if (response.success && response.data?.url) {
    formData.items[index].photos.push(response.data.url);
  }
};

// 照片移除
const handlePhotoRemove = (file: any, fileList: any[], index: number) => {
  const url = file.response?.data?.url || file.url;
  const photoIndex = formData.items[index].photos.indexOf(url);
  if (photoIndex > -1) {
    formData.items[index].photos.splice(photoIndex, 1);
  }
};

// 签名板相关方法
const initSignaturePad = () => {
  if (signatureCanvas.value) {
    signatureContext.value = signatureCanvas.value.getContext('2d');
    if (signatureContext.value) {
      signatureContext.value.strokeStyle = '#000';
      signatureContext.value.lineWidth = 2;
      signatureContext.value.lineCap = 'round';
    }
  }
};

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true;
  if (signatureContext.value && signatureCanvas.value) {
    const rect = signatureCanvas.value.getBoundingClientRect();
    signatureContext.value.beginPath();
    signatureContext.value.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
};

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !signatureContext.value || !signatureCanvas.value) return;
  const rect = signatureCanvas.value.getBoundingClientRect();
  signatureContext.value.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  signatureContext.value.stroke();
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const clearSignature = () => {
  if (signatureContext.value && signatureCanvas.value) {
    signatureContext.value.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  }
};

const saveSignature = () => {
  if (signatureCanvas.value) {
    formData.checkerSignature = signatureCanvas.value.toDataURL();
    showSignaturePad.value = false;
  }
};

// 初始化签名板（当对话框打开时）
watch(showSignaturePad, (val) => {
  if (val) {
    setTimeout(() => {
      initSignaturePad();
    }, 100);
  }
});

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    submitLoading.value = true;

    const submitData = {
      inspectionPlanId: props.planData.id,
      checkDate: formData.checkDate,
      checkerName: formData.checkerName,
      totalScore: formData.totalScore,
      grade: formData.grade,
      summary: formData.summary,
      suggestions: formData.suggestions,
      checkerSignature: formData.checkerSignature,
      items: formData.items.map((item, index) => ({
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        status: item.status,
        score: item.score,
        maxScore: item.maxScore,
        problemDescription: item.problemDescription,
        photos: item.photos,
        notes: item.notes,
        sortOrder: index
      }))
    };

    const response = await request.post('/inspection-records', submitData);

    if (response.success) {
      ElMessage.success('提交检查记录成功');
      emit('success');
      handleClose();
    } else {
      ElMessage.error(response.message || '提交失败');
    }
  } catch (error: any) {
    console.error('提交检查记录失败:', error);
    if (error !== false) { // 表单验证失败时error为false
      ElMessage.error('提交失败，请稍后重试');
    }
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.checkDate = new Date().toISOString().split('T')[0];
  formData.checkerName = '';
  formData.totalScore = 0;
  formData.grade = '';
  formData.summary = '';
  formData.suggestions = '';
  formData.checkerSignature = '';
  formData.items = [];
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.check-items-section {
  margin-bottom: var(--text-2xl);

  .check-item-card {
    margin-bottom: var(--text-lg);

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
  }
}

.signature-area {
  display: flex;
  align-items: center;
  gap: var(--text-lg);

  .signature-preview {
    max-width: 300px;
    max-height: 150px;
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--spacing-xs);
  }
}

.signature-pad-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--text-2xl);

  .signature-canvas {
    border: 2px dashed var(--border-color);
    border-radius: var(--spacing-xs);
    cursor: crosshair;
  }
}
</style>

