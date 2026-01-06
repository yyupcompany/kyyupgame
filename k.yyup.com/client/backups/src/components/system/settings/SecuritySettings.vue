<template>
  <div class="security-settings">
    <el-form :model="formData" label-width="180px">
      <el-form-item 
        v-for="item in settings" 
        :key="item.id" 
        :label="item.description"
      >
        <el-input-number 
          v-model="formData[item.key]" 
          :min="getMinValue(item.key)"
          :max="getMaxValue(item.key)"
          :step="1"
          :controls-position="'right'"
          style="width: 180px;"
        />
        <span class="setting-tip">{{ getSettingTip(item.key) }}</span>
      </el-form-item>
      
      <el-divider content-position="left">密码策略</el-divider>
      
      <el-form-item label="密码复杂度要求">
        <el-checkbox-group v-model="passwordPolicy">
          <el-checkbox value="uppercase">必须包含大写字母</el-checkbox>
          <el-checkbox value="lowercase">必须包含小写字母</el-checkbox>
          <el-checkbox value="numbers">必须包含数字</el-checkbox>
          <el-checkbox value="special">必须包含特殊字符</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="最短密码长度">
        <el-input-number 
          v-model="minPasswordLength" 
          :min="6"
          :max="16"
          :step="1"
          style="width: 180px;"
        />
        <span class="setting-tip">密码最短长度，建议8位以上</span>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { SystemSetting } from '@/types/system';

export default defineComponent({
  name: 'SecuritySettings',
  
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
    const formData = reactive<Record<string, number>>({});
    
    // 密码策略
    const passwordPolicy = ref<string[]>(['uppercase', 'lowercase', 'numbers']);
    
    // 最短密码长度
    const minPasswordLength = ref<number>(8);
    
    // 监听settings变化，更新formData
    watch(() => props.settings, (val) => {
      val.forEach(setting => {
        formData[setting.key] = parseInt(setting.value) || 0;
      });
      
      // 从设置中加载密码策略
      const policyItem = val.find(item => item.key === 'password_policy');
      if (policyItem) {
        try {
          const policy = JSON.parse(policyItem.value);
          passwordPolicy.value = policy.rules || ['uppercase', 'lowercase', 'numbers'];
          minPasswordLength.value = policy.minLength || 8;
        } catch (e) {
          console.error('解析密码策略失败:', e);
        }
      }
    }, { immediate: true });
    
    // 获取设置项的最小值
    const getMinValue = (key: string): number => {
      const minValues: Record<string, number> = {
        login_attempts: 1,
        password_expiry_days: 0,
        session_timeout: 1
      };
      return minValues[key] || 0;
    };
    
    // 获取设置项的最大值
    const getMaxValue = (key: string): number => {
      const maxValues: Record<string, number> = {
        login_attempts: 10,
        password_expiry_days: 365,
        session_timeout: 1440 // 24小时
      };
      return maxValues[key] || 100;
    };
    
    // 获取设置项的提示文本
    const getSettingTip = (key: string): string => {
      const tips: Record<string, string> = {
        login_attempts: '允许的最大连续登录失败次数，超过将锁定账户',
        password_expiry_days: '密码过期天数，0表示永不过期',
        session_timeout: '会话超时时间，单位：分钟'
      };
      return tips[key] || '';
    };
    
    // 提交表单
    const handleSubmit = (): void => {
      // 构建要提交的设置数据
      const updatedSettings = props.settings.map(setting => {
        if (setting.key === 'password_policy') {
          // 特殊处理密码策略设置
          const policyValue = JSON.stringify({
            rules: passwordPolicy.value,
            minLength: minPasswordLength.value
          });
          return {
            ...setting,
            value: policyValue
          };
        }
        
        return {
          ...setting,
          value: formData[setting.key]?.toString() || '0'
        };
      });
      
      // 触发保存事件
      emit('save', 'security', updatedSettings);
    };
    
    return {
      formData,
      passwordPolicy,
      minPasswordLength,
      getMinValue,
      getMaxValue,
      getSettingTip,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.security-settings {
  padding: var(--spacing-lg);
  
  .setting-tip {
    margin-left: var(--spacing-sm);
    color: var(--text-color-secondary);
    font-size: var(--font-size-sm);
  }
  
  .el-divider {
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    
    :deep(.el-divider__text) {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: var(--text-color-primary);
    }
  }
}
</style> 