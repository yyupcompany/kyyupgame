<template>
  <div class="email-settings">
    <el-form :model="formData" label-width="120px">
      <el-form-item 
        v-for="item in settings" 
        :key="item.id" 
        :label="item.description"
      >
        <el-input 
          v-if="item.key !== 'mail_password'" 
          v-model="formData[item.key]" 
          :placeholder="`请输入${item.description}`"
        />
        <el-input 
          v-else
          v-model="formData[item.key]" 
          type="password"
          show-password
          :placeholder="`请输入${item.description}`"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          <UnifiedIcon name="Check" />
          保存设置
        </el-button>
        <el-button @click="handleTestEmail">
          <UnifiedIcon name="Message" />
          测试邮件发送
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 测试邮件对话框 -->
    <el-dialog
      v-model="testEmailDialogVisible"
      title="发送测试邮件"
      width="30%"
      append-to-body
    >
      <el-form :model="testEmailForm" label-width="80px">
        <el-form-item label="收件人" prop="recipient">
          <el-input v-model="testEmailForm.recipient" placeholder="请输入收件人邮箱" />
        </el-form-item>
        <el-form-item label="主题" prop="subject">
          <el-input v-model="testEmailForm.subject" placeholder="请输入邮件主题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="testEmailForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入邮件内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="testEmailDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="sendingTestEmail" @click="sendTestEmail">
            <UnifiedIcon name="Send" />
            发送
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { SystemSetting } from '@/types/system';
import { SYSTEM_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

interface TestEmailForm {
  recipient: string;
  subject: string;
  content: string;
}

export default defineComponent({
  name: 'EmailSettings',
  
  props: {
    settings: {
      type: Array as () => SystemSetting[],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['save'],
  
  setup(props, { emit }) {
    // 表单数据对象
    const formData = reactive<Record<string, string>>({});
    
    // 测试邮件对话框可见性
    const testEmailDialogVisible = ref(false);
    
    // 是否正在发送测试邮件
    const sendingTestEmail = ref(false);
    
    // 测试邮件表单
    const testEmailForm = reactive<TestEmailForm>({
      recipient: '',
      subject: '测试邮件',
      content: '这是一封测试邮件，用于验证邮件服务器配置是否正确。'
    });
    
    // 监听settings变化，更新formData
    watch(() => props.settings, (val) => {
      val.forEach(setting => {
        formData[setting.key] = setting.value;
      });
    }, { immediate: true });
    
    // 提交表单
    const handleSubmit = (): void => {
      // 构建要提交的设置数据
      const updatedSettings = props.settings.map(setting => ({
        ...setting,
        value: formData[setting.key] || ''
      }));
      
      // 触发保存事件
      emit('save', 'email', updatedSettings);
    };
    
    // 显示测试邮件对话框
    const handleTestEmail = (): void => {
      // 设置默认收件人为管理员邮箱
      const adminEmail = props.settings.find(item => item.key === 'admin_email')?.value || '';
      testEmailForm.recipient = adminEmail;
      
      testEmailDialogVisible.value = true;
    };
    
    // 发送测试邮件
    const sendTestEmail = async (): Promise<void> => {
      // 简单验证
      if (!testEmailForm.recipient) {
        ElMessage.warning('请输入收件人邮箱');
        return;
      }
      
      sendingTestEmail.value = true;
      try {
        const response: ApiResponse = await request.post(SYSTEM_ENDPOINTS.EMAIL_TEST, {
          ...testEmailForm,
          mailConfig: {
            driver: formData.mail_driver,
            host: formData.mail_host,
            port: formData.mail_port,
            username: formData.mail_username,
            password: formData.mail_password
          }
        });
        
        // 显示成功消息
        ElMessage.success('测试邮件发送成功');
        
        // 关闭对话框
        testEmailDialogVisible.value = false;
      } catch (error) {
        console.error('发送测试邮件失败:', error);
        ElMessage.error('发送测试邮件失败');
      } finally {
        sendingTestEmail.value = false;
      }
    };
    
    return {
      formData,
      testEmailDialogVisible,
      testEmailForm,
      sendingTestEmail,
      handleSubmit,
      handleTestEmail,
      sendTestEmail
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;
@use "@/styles/design-tokens.scss" as *;
@use "@/styles/list-components-optimization.scss" as *;

.email-settings {
  padding: var(--spacing-lg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style> 