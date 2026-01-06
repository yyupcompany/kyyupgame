<template>
  <el-dialog
    v-model="visible"
    title="新建客户"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="客户姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入客户姓名" />
      </el-form-item>
      
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      
      <el-form-item label="孩子姓名" prop="childName">
        <el-input v-model="form.childName" placeholder="请输入孩子姓名" />
      </el-form-item>
      
      <el-form-item label="孩子年龄" prop="childAge">
        <el-input-number v-model="form.childAge" :min="1" :max="10" />
      </el-form-item>
      
      <el-form-item label="孩子性别" prop="childGender">
        <el-radio-group v-model="form.childGender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="来源渠道" prop="source">
        <el-select v-model="form.source" placeholder="请选择来源渠道">
          <el-option label="官网咨询" value="官网咨询" />
          <el-option label="电话咨询" value="电话咨询" />
          <el-option label="朋友推荐" value="朋友推荐" />
          <el-option label="线下活动" value="线下活动" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const visible = ref(false);
const loading = ref(false);
const formRef = ref();

const form = ref({
  name: '',
  phone: '',
  childName: '',
  childAge: 3,
  childGender: '男',
  source: '',
  notes: ''
});

const rules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  childName: [{ required: true, message: '请输入孩子姓名', trigger: 'blur' }],
  childAge: [{ required: true, message: '请输入孩子年龄', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源渠道', trigger: 'change' }]
};

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

function handleClose() {
  formRef.value?.resetFields();
  visible.value = false;
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    
    loading.value = true;
    // TODO: 调用API创建客户
    // await createCustomer(form.value);
    
    ElMessage.success('客户创建成功');
    emit('success');
    handleClose();
  } catch (error) {
    console.error('创建客户失败:', error);
  } finally {
    loading.value = false;
  }
}
</script>
