<template>
  <div class="page-container settings-page-container">
    <h1 class="page-title">系统设置</h1>
    
    <!-- 权限提示 -->
    <el-alert
      v-if="!hasManagePermission"
      title="权限提示"
      type="warning"
      description="您当前只有查看权限，无法修改系统设置"
      show-icon
      :closable="true"
      class="permission-alert"
    />
    
    <!-- 加载错误提示 -->
    <el-alert
      v-if="loadError"
      title="加载系统设置失败"
      type="error"
      description="无法加载系统设置数据，请检查网络连接或稍后重试。"
      show-icon
      :closable="false"
      class="error-alert"
    >
      <template #default>
        <div class="error-actions">
          <el-button type="primary" size="small" @click="loadSettings">
            <UnifiedIcon name="Refresh" />
            重新加载
          </el-button>
        </div>
      </template>
    </el-alert>
    
    <!-- 设置分类切换 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="基本设置" name="basic">
          <!-- 骨架屏加载效果 -->
          <el-skeleton :loading="loading" animated :count="4" :throttle="500">
            <template #template>
              <div class="form-skeleton">
                <div class="skeleton-section">
                  <el-skeleton-item variant="text" class="skeleton-title" />
                  <div class="skeleton-field">
                    <el-skeleton-item variant="text" class="skeleton-label" />
                    <el-skeleton-item variant="input" class="skeleton-input" />
                  </div>
                  <div class="skeleton-field">
                    <el-skeleton-item variant="text" class="skeleton-label" />
                    <el-skeleton-item variant="input" class="skeleton-input" />
                  </div>
                  <div class="skeleton-actions">
                    <el-skeleton-item variant="button" class="skeleton-button" />
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <basic-settings 
                :settings="basicSettings" 
                :loading="loading"
                @save="handleSaveSettings"
              />
            </template>
          </el-skeleton>
        </el-tab-pane>
        
        <el-tab-pane label="邮件设置" name="email">
          <el-skeleton :loading="loading" animated :count="5" :throttle="500">
            <template #template>
              <div class="skeleton-container">
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="button" class="skeleton-button" />
              </div>
            </template>
            <template #default>
              <email-settings 
                :settings="emailSettings" 
                :loading="loading"
                @save="handleSaveSettings"
              />
            </template>
          </el-skeleton>
        </el-tab-pane>
        
        <el-tab-pane label="安全设置" name="security">
          <el-skeleton :loading="loading" animated :count="4" :throttle="500">
            <template #template>
              <div class="form-skeleton">
                <div class="skeleton-section">
                  <el-skeleton-item variant="text" class="skeleton-title" />
                  <div class="skeleton-field">
                    <el-skeleton-item variant="text" class="skeleton-label" />
                    <el-skeleton-item variant="input" class="skeleton-input" />
                  </div>
                  <div class="skeleton-field">
                    <el-skeleton-item variant="text" class="skeleton-label" />
                    <el-skeleton-item variant="input" class="skeleton-input" />
                  </div>
                  <div class="skeleton-actions">
                    <el-skeleton-item variant="button" class="skeleton-button" />
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <security-settings 
                :settings="securitySettings" 
                :loading="loading"
                @save="handleSaveSettings"
              />
            </template>
          </el-skeleton>
        </el-tab-pane>
        
        <el-tab-pane label="AI助手配置" name="ai-shortcuts">
          <AIShortcutsConfig />
        </el-tab-pane>

        <el-tab-pane label="存储设置" name="storage">
          <el-skeleton :loading="loading" animated :count="6" :throttle="500">
            <template #template>
              <div class="skeleton-container">
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="text" class="skeleton-text" />
                <el-skeleton-item variant="input" class="skeleton-input" />
                <el-skeleton-item variant="button" class="skeleton-button" />
              </div>
            </template>
            <template #default>
              <storage-settings 
                :settings="storageSettings" 
                :loading="loading"
                @save="handleSaveSettings"
              />
            </template>
          </el-skeleton>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 全局加载遮罩 -->
    <el-loading
      v-model:full-screen="fullscreenLoading"
      text="保存设置中..."
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BasicSettings from '../../../components/system/settings/BasicSettings.vue';
import EmailSettings from '../../../components/system/settings/EmailSettings.vue';
import SecuritySettings from '../../../components/system/settings/SecuritySettings.vue';
import StorageSettings from '../../../components/system/settings/StorageSettings.vue';
import AIShortcutsConfig from '../ai-shortcuts/index.vue';
import { useRouter } from 'vue-router';
import { getSettings, updateSettings } from '@/api/modules/system';
import { ErrorHandler } from '@/utils/errorHandler';

// 本地定义类型，避免导入错误
interface SystemSetting {
  id: string;
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export default defineComponent({
  name: 'SystemSettings',
  components: {
    BasicSettings,
    EmailSettings,
    SecuritySettings,
    StorageSettings,
    AIShortcutsConfig
  },
  
  setup() {
    const router = useRouter();
    
    // 检查权限
    const hasReadPermission = true; // 默认有读取权限
    const hasManagePermission = true; // 默认有管理权限
    
    // 如果没有读取权限，重定向到首页
    if (!hasReadPermission) {
      ElMessage.error('您没有权限访问系统设置');
      router.push('/');
      return {};
    }
    
    // 当前激活的标签页
    const activeTab = ref('basic');
    
    // 全屏加载状态（保存时使用）
    const fullscreenLoading = ref(false);
    
    // 加载状态
    const loading = ref(false);
    
    // 加载错误状态
    const loadError = ref(false);
    
    // 重试次数
    const retryCount = ref(0);
    const maxRetries = 3;
    
    // 各类设置
    const basicSettings = ref<SystemSetting[]>([]);
    const emailSettings = ref<SystemSetting[]>([]);
    const securitySettings = ref<SystemSetting[]>([]);
    const storageSettings = ref<SystemSetting[]>([]);
    
    // 加载设置数据
    const loadSettings = async (): Promise<void> => {
      try {
        loading.value = true;
        loadError.value = false;

        // 调用真实系统设置API
        const response = await getSettings();
        if (response.success && response.data) {
          // 将对象数据转换为设置数组格式
          const settingsData = response.data;
          const allSettings: SystemSetting[] = [];

          // 基本设置
          if (settingsData.siteName !== undefined) {
            allSettings.push({
              id: 'site_name',
              key: 'site_name',
              value: settingsData.siteName,
              type: 'string',
              category: 'basic',
              description: '站点名称'
            });
          }

          if (settingsData.version !== undefined) {
            allSettings.push({
              id: 'version',
              key: 'version',
              value: settingsData.version,
              type: 'string',
              category: 'basic',
              description: '系统版本'
            });
          }

          if (settingsData.timezone !== undefined) {
            allSettings.push({
              id: 'timezone',
              key: 'timezone',
              value: settingsData.timezone,
              type: 'string',
              category: 'basic',
              description: '时区设置'
            });
          }

          if (settingsData.language !== undefined) {
            allSettings.push({
              id: 'language',
              key: 'language',
              value: settingsData.language,
              type: 'string',
              category: 'basic',
              description: '系统语言'
            });
          }

          if (settingsData.maintenanceMode !== undefined) {
            allSettings.push({
              id: 'maintenance_mode',
              key: 'maintenance_mode',
              value: settingsData.maintenanceMode,
              type: 'boolean',
              category: 'basic',
              description: '维护模式'
            });
          }

          // 存储设置
          if (settingsData.maxFileSize !== undefined) {
            allSettings.push({
              id: 'max_file_size',
              key: 'max_file_size',
              value: settingsData.maxFileSize,
              type: 'string',
              category: 'storage',
              description: '最大文件大小'
            });
          }

          // 安全设置
          if (settingsData.sessionTimeout !== undefined) {
            allSettings.push({
              id: 'session_timeout',
              key: 'session_timeout',
              value: settingsData.sessionTimeout,
              type: 'number',
              category: 'security',
              description: '会话超时时间'
            });
          }

          // 邮件设置
          if (settingsData.emailNotifications !== undefined) {
            allSettings.push({
              id: 'email_notifications',
              key: 'email_notifications',
              value: settingsData.emailNotifications,
              type: 'boolean',
              category: 'email',
              description: '邮件通知'
            });
          }

          if (settingsData.smsNotifications !== undefined) {
            allSettings.push({
              id: 'sms_notifications',
              key: 'sms_notifications',
              value: settingsData.smsNotifications,
              type: 'boolean',
              category: 'email',
              description: '短信通知'
            });
          }

          // 按类别分组设置
          basicSettings.value = allSettings.filter((item: SystemSetting) => item.category === 'basic');
          emailSettings.value = allSettings.filter((item: SystemSetting) => item.category === 'email');
          securitySettings.value = allSettings.filter((item: SystemSetting) => item.category === 'security');
          storageSettings.value = allSettings.filter((item: SystemSetting) => item.category === 'storage');
        } else {
          throw new Error(response.message || '获取设置失败');
        }
        
        retryCount.value = 0;
      } catch (error) {
        ErrorHandler.handle(error, '加载设置失败');
        loadError.value = true;
        
        if (retryCount.value < maxRetries) {
          retryCount.value++;
          ElMessage.warning(`加载失败，正在重试 (${retryCount.value}/${maxRetries})`);
          setTimeout(() => loadSettings(), 2000);
        } else {
          ElMessage.error('加载设置失败，请检查网络连接');
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 保存设置
    const handleSaveSettings = async (settings: SystemSetting[]): Promise<void> => {
      if (!hasManagePermission) {
        ElMessage.error('您没有权限修改系统设置');
        return;
      }
      
      try {
        fullscreenLoading.value = true;
        
        // 调用真实的更新设置API
        const response = await updateSettings(activeTab.value, settings);
        if (response.success) {
          ElMessage.success('设置保存成功');
          // 重新加载设置
          await loadSettings();
        } else {
          ElMessage.error(response.message || '保存设置失败');
        }
      } catch (error) {
        ErrorHandler.handle(error, '保存设置失败');
      } finally {
        fullscreenLoading.value = false;
      }
    };
    
    // 初始化加载设置
    onMounted(() => {
      loadSettings();
    });
    
    return {
      activeTab,
      loading,
      fullscreenLoading,
      loadError,
      basicSettings,
      emailSettings,
      securitySettings,
      storageSettings,
      loadSettings,
      handleSaveSettings,
      hasManagePermission
    };
  }
});
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

/* 页面特定样式 - 大部分样式现在使用全局组件样式 */
.error-actions {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: flex-end;
}

.error-actions .el-button {
  min-max-width: 100px; width: 100%;
  height: var(--spacing-3xl);
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: var(--breakpoint-md)) {
  .error-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .error-actions .el-button {
    min-width: auto;
    height: var(--button-height-sm);
    font-size: var(--text-xs);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .error-actions .el-button {
    min-width: auto;
    height: var(--text-3xl);
    font-size: var(--text-xs);
  }
}
</style>