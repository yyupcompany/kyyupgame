<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formData.id ? '编辑用户' : '新增用户'"
    :width="isDesktop ? '650px' : '95%'"
    @close="handleClose"
    class="user-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="formData.id === '1' || !!formData.id" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!formData.id">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword" v-if="!formData.id">
        <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" show-password />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select 
          v-model="formData.roleIds" 
          multiple 
          placeholder="请选择角色" 
          :disabled="formData.id === '1'"
          style="width: 100%;"
        >
          <el-option 
            v-for="role in roleOptions" 
            :key="role.id" 
            :label="role.name" 
            :value="role.id" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" v-if="formData.id">
        <el-radio-group v-model="formData.status" :disabled="formData.id === '1'">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input 
          v-model="formData.remark" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入备注信息"
        />
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

<script lang="ts">
import { defineComponent, ref, reactive, watch, nextTick, computed } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import type { User, Role } from '@/types/system';

// 表单数据接口
interface UserFormData {
  id?: string;
  username: string;
  realName: string;
  password?: string;
  confirmPassword?: string;
  email: string;
  mobile: string;
  roleIds: string[];
  status: 'active' | 'inactive';
  remark?: string;
}

// 默认表单数据
const defaultFormData: UserFormData = {
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  mobile: '',
  roleIds: [],
  status: 'active',
  remark: ''
};

export default defineComponent({
  name: 'UserForm',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object as () => User | null,
      default: null
    }
  },
  
  emits: ['update:visible', 'success'],
  
  setup(props, { emit }) {
    // 对话框可见性
    const dialogVisible = ref(props.visible);
    
    // 表单引用
    const formRef = ref<FormInstance>();
    
    // 加载状态
    const loading = ref(false);
    
    // 角色选项
    const roleOptions = ref<Role[]>([]);
    
    // 响应式计算属性
    const isDesktop = computed(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 768
      }
      return true
    });
    
    // 表单数据
    const formData = reactive<UserFormData>({...defaultFormData});
    
    // 自定义校验规则 - 确认密码
    const validateConfirmPassword = (rule: any, value: string, callback: any) => {
      if (value !== formData.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    // 自定义校验规则 - 手机号
    const validateMobile = (rule: any, value: string, callback: any) => {
      if (!value) {
        callback();
        return;
      }
      
      const mobileRegex = /^1[3-9]\d{9}$/;
      if (!mobileRegex.test(value)) {
        callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    };
    
    // 自定义校验规则 - 邮箱
    const validateEmail = (rule: any, value: string, callback: any) => {
      if (!value) {
        callback();
        return;
      }
      
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱地址'));
      } else {
        callback();
      }
    };
    
    // 表单验证规则
    const formRules = reactive<FormRules>({
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
      ],
      realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { validator: validateEmail, trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { validator: validateMobile, trigger: 'blur' }
      ],
      roleIds: [
        { required: true, message: '请选择角色', trigger: 'change' },
        { type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }
      ]
    });
    
    // 初始化加载角色选项
    const loadRoleOptions = async (): Promise<void> => {
      try {
        // 这里应该调用实际的API
        // const { data } = await getRoles();
        // roleOptions.value = data;
        
        // 模拟数据
        roleOptions.value = [
          {
            id: '1',
            name: '超级管理员'
          },
          {
            id: '2',
            name: '普通管理员'
          },
          {
            id: '3',
            name: '教师'
          },
          {
            id: '4',
            name: '家长'
          }
        ];
      } catch (error) {
        console.error('加载角色选项失败:', error);
        ElMessage.error('加载角色选项失败');
      }
    };
    
    // 加载角色选项
    loadRoleOptions();
    
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
    
    // 监听userData变化
    watch(() => props.userData, (val) => {
      if (val) {
        nextTick(() => {
          // 设置表单数据
          Object.assign(formData, {
            id: val.id,
            username: val.username,
            realName: val.realName,
            email: val.email,
            mobile: val.mobile,
            roleIds: val.roles?.map(role => role.id) || [],
            status: val.status || 'active',
            remark: val.remark || ''
          });
          
          // 编辑模式下删除密码相关字段的验证规则
          if (formRef.value) {
            formRef.value.clearValidate(['password', 'confirmPassword']);
          }
        });
      } else {
        resetForm();
      }
    }, { immediate: true });
    
    // 重置表单
    const resetForm = (): void => {
      if (formRef.value && typeof formRef.value.resetFields === 'function') {
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
      
      await formRef.value.validate(async (valid, fields) => {
        if (valid) {
          loading.value = true;
          try {
            // 准备提交的数据
            const submitData = { ...formData };
            if (formData.id) {
              // 编辑模式，移除不需要的字段
              delete submitData.password;
              delete submitData.confirmPassword;
            } else {
              // 新增模式，移除确认密码字段
              delete submitData.confirmPassword;
            }
            
            // 这里应该调用实际的API
            // const result = formData.id 
            //   ? await updateUser(formData.id, submitData)
            //   : await createUser(submitData);
            
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 构造返回的用户对象
            const roles = roleOptions.value.filter(role => 
              formData.roleIds.includes(role.id)
            );
            
            const result: User = {
              ...submitData,
              id: formData.id || Date.now().toString(),
              roles,
              lastLoginTime: formData.id ? (props.userData?.lastLoginTime || '') : new Date().toISOString()
            };
            
            // 触发成功事件
            emit('success', result);
            
            // 显示成功消息
            ElMessage.success(formData.id ? '编辑用户成功' : '创建用户成功');
            
            // 关闭对话框
            dialogVisible.value = false;
          } catch (error) {
            console.error(formData.id ? '编辑用户失败:' : '创建用户失败:', error);
            ElMessage.error(formData.id ? '编辑用户失败' : '创建用户失败');
          } finally {
            loading.value = false;
          }
        } else {
          console.error('表单验证失败:', fields);
        }
      });
    };
    
    return {
      dialogVisible,
      formRef,
      formData,
      formRules,
      roleOptions,
      loading,
      isDesktop,
      handleClose,
      handleSubmit,
      resetForm
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';
@import '../../pages/system/user-management-ux-styles.scss';

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 