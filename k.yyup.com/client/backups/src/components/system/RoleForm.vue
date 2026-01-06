<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formData.id ? '编辑角色' : '新增角色'"
    width="40%"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" :disabled="formData.id === '1'" />
      </el-form-item>
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="formData.status" :disabled="formData.id === '1'">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 导入类型
interface Role {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// 表单数据接口
interface RoleFormData {
  id?: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

// 组件属性定义
interface Props {
  visible: boolean;
  roleData: Role | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [role: Role];
}>();

// 默认表单数据
const defaultFormData: RoleFormData = {
  name: '',
  description: '',
  status: 'active'
};

// 对话框可见性
const dialogVisible = ref(props.visible);

// 表单引用
const formRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 表单数据
const formData = reactive<RoleFormData>({...defaultFormData});

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
});

// 监听visible属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
});

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  emit('update:visible', val);
  if (!val) {
    resetForm();
  }
});

// 监听roleData变化
watch(() => props.roleData, (val) => {
  if (val) {
    nextTick(() => {
      // 设置表单数据
      Object.assign(formData, {
        id: val.id,
        name: val.name,
        description: val.description || '',
        status: val.status || 'active'
      });
    });
  } else {
    resetForm();
  }
}, { immediate: true });

// 重置表单
const resetForm = (): void => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {...defaultFormData});
};

// 关闭对话框
const handleClose = (): void => {
  dialogVisible.value = false;
};

// 提交表单
const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      try {
        // 这里应该调用实际的API
        // const result = formData.id 
        //   ? await updateRole(formData.id, formData)
        //   : await createRole(formData);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 触发成功事件
        const result: Role = {
          ...formData,
          id: formData.id || Date.now().toString(),
          createdAt: formData.id ? undefined : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        emit('success', result);
        
        // 显示成功消息
        ElMessage.success(formData.id ? '编辑角色成功' : '创建角色成功');
        
        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error(formData.id ? '编辑角色失败:' : '创建角色失败:', error);
        ElMessage.error(formData.id ? '编辑角色失败' : '创建角色失败');
      } finally {
        loading.value = false;
      }
    } else {
      console.error('表单验证失败:', fields);
    }
  });
};
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 