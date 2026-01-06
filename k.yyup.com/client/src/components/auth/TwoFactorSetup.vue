<template>
  <div class="two-factor-setup">
    <el-card class="setup-card">
      <template #header>
        <div class="card-header">
          <span class="title">设置双因素认证</span>
          <el-tag :type="isEnabled ? 'success' : 'info'" size="large">
            {{ isEnabled ? '已启用' : '未启用' }}
          </el-tag>
        </div>
      </template>

      <!-- 状态提示 -->
      <el-alert
        v-if="isEnabled"
        title="您的账户已启用双因素认证"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>启用时间: {{ formatDate(enabledAt) }}</p>
          <p>剩余备用码: {{ remainingBackupCodes }} 个</p>
        </template>
      </el-alert>

      <el-alert
        v-else
        title="双因素认证可以保护您的账户安全"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>启用后，登录时需要输入验证器APP生成的6位数字验证码</p>
        </template>
      </el-alert>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button
          v-if="!isEnabled && !setupInProgress"
          type="primary"
          size="large"
          @click="startSetup"
          :loading="loading"
        >
          启用双因素认证
        </el-button>

        <el-button
          v-if="isEnabled"
          type="danger"
          size="large"
          @click="confirmDisable"
          :loading="loading"
        >
          禁用双因素认证
        </el-button>
      </div>

      <!-- 设置流程 -->
      <div v-if="setupInProgress" class="setup-process">
        <!-- 步骤指示器 -->
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="下载验证器" />
          <el-step title="扫描二维码" />
          <el-step title="输入验证码" />
          <el-step title="保存备用码" />
        </el-steps>

        <!-- 步骤1: 下载验证器 -->
        <div v-if="currentStep === 0" class="step-content">
          <h3>步骤1: 下载验证器APP</h3>
          <p>请从以下应用商店下载验证器APP：</p>

          <el-table :data="authenticators" style="width: 100%; margin-top: 20px">
            <el-table-column prop="name" label="应用名称" width="200" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="openLink(row.url)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 30px; text-align: right">
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </div>
        </div>

        <!-- 步骤2: 扫描二维码 -->
        <div v-if="currentStep === 1" class="step-content">
          <h3>步骤2: 扫描二维码</h3>
          <p>在验证器APP中扫描下方二维码：</p>

          <div v-loading="generating" class="qr-container">
            <img v-if="qrCode" :src="qrCode" alt="QR Code" class="qr-code" />
          </div>

          <el-alert type="info" :closable="false" style="margin-top: 20px">
            <template #default>
              <p>提示：无法扫描？请点击下方手动输入密钥</p>
              <el-button
                type="text"
                @click="showManualEntry = true"
              >
                显示密钥
              </el-button>
            </template>
          </el-alert>

          <div v-if="showManualEntry" class="manual-entry">
            <el-input
              v-model="secretKey"
              type="textarea"
              :rows="3"
              readonly
              placeholder="密钥将在此显示"
            />
          </div>

          <div style="margin-top: 30px; text-align: right">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </div>
        </div>

        <!-- 步骤3: 输入验证码 -->
        <div v-if="currentStep === 2" class="step-content">
          <h3>步骤3: 输入验证码</h3>
          <p>请输入验证器APP显示的6位数字验证码：</p>

          <el-form :model="verifyForm" :rules="verifyRules" ref="verifyFormRef">
            <el-form-item prop="token">
              <el-input
                v-model="verifyForm.token"
                placeholder="输入6位验证码"
                maxlength="6"
                size="large"
                style="width: 200px; text-align: center; letter-spacing: 5px"
              />
            </el-form-item>

            <div style="margin-top: 20px; text-align: right">
              <el-button @click="prevStep">上一步</el-button>
              <el-button type="primary" @click="verifyAndEnable" :loading="verifying">
                验证并启用
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 步骤4: 保存备用码 -->
        <div v-if="currentStep === 3" class="step-content">
          <h3>步骤4: 保存备用恢复码</h3>
          <el-alert
            title="重要提示"
            type="error"
            :closable="false"
            show-icon
            style="margin-bottom: 20px"
          >
            <template #default>
              <p>这些备用码用于手机丢失或无法使用验证器时登录</p>
              <p><strong>请务必妥善保存，每个备用码只能使用一次！</strong></p>
            </template>
          </el-alert>

          <div class="backup-codes">
            <div v-for="(code, index) in backupCodes" :key="index" class="code-item">
              {{ code }}
            </div>
          </div>

          <el-button type="primary" @click="downloadBackupCodes" style="margin-top: 20px">
            下载备用码
          </el-button>

          <div style="margin-top: 30px; text-align: right">
            <el-checkbox v-model="backupCodesSaved">
              我已保存备用码，并了解其重要性
            </el-checkbox>
            <div style="margin-top: 20px">
              <el-button @click="prevStep">上一步</el-button>
              <el-button
                type="primary"
                @click="completeSetup"
                :disabled="!backupCodesSaved"
              >
                完成
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成功提示 -->
      <el-dialog v-model="showSuccess" title="设置成功" width="400px" center>
        <div style="text-align: center">
          <el-icon :size="80" color="#67C23A"><SuccessFilled /></el-icon>
          <p style="margin-top: 20px; font-size: var(--text-base)">
            双因素认证已成功启用！
          </p>
          <p style="color: #909399">
            下次登录时需要输入验证码
          </p>
        </div>
        <template #footer>
          <el-button type="primary" @click="showSuccess = false">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { SuccessFilled } from '@element-plus/icons-vue';
import axios from 'axios';

// 状态
const loading = ref(false);
const isEnabled = ref(false);
const enabledAt = ref<Date | null>(null);
const remainingBackupCodes = ref(0);
const setupInProgress = ref(false);
const currentStep = ref(0);
const generating = ref(false);
const verifying = ref(false);
const showManualEntry = ref(false);
const backupCodesSaved = ref(false);
const showSuccess = ref(false);

// 数据
const qrCode = ref('');
const secretKey = ref('');
const backupCodes = ref<string[]>([]);
const authenticators = ref([
  { name: 'Google Authenticator', url: 'https://apps.apple.com/app/google-authenticator/id388497605' },
  { name: 'Microsoft Authenticator', url: 'https://apps.apple.com/app/microsoft-authenticator/id983156458' },
  { name: 'Authy', url: 'https://apps.apple.com/app/authy/id494652078' }
]);

// 验证表单
const verifyForm = reactive({
  token: ''
});

const verifyRules = {
  token: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
  ]
};

const verifyFormRef = ref();

// 获取状态
onMounted(async () => {
  await fetchStatus();
});

// 获取2FA状态
async function fetchStatus() {
  try {
    loading.value = true;
    const { data } = await axios.get('/api/auth/2fa/status');

    if (data.success) {
      isEnabled.value = data.data.enabled;
      enabledAt.value = data.data.enabledAt ? new Date(data.data.enabledAt) : null;
      remainingBackupCodes.value = data.data.remainingBackupCodes || 0;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error?.message || '获取状态失败');
  } finally {
    loading.value = false;
  }
}

// 开始设置
async function startSetup() {
  try {
    loading.value = true;
    currentStep.value = 0;
    setupInProgress.value = true;

    const { data } = await axios.post('/api/auth/2fa/setup');

    if (data.success) {
      qrCode.value = data.data.qrCode;
      backupCodes.value = data.data.backupCodes;
      // 从QR Code URL中提取密钥
      const match = data.data.qrCode.match(/secret=([A-Z2-7]+)/);
      if (match) {
        secretKey.value = match[1];
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error?.message || '初始化失败');
    setupInProgress.value = false;
  } finally {
    loading.value = false;
  }
}

// 下一步
function nextStep() {
  currentStep.value++;
}

// 上一步
function prevStep() {
  currentStep.value--;
}

// 验证并启用
async function verifyAndEnable() {
  const valid = await verifyFormRef.value?.validate();
  if (!valid) return;

  try {
    verifying.value = true;
    const { data } = await axios.post('/api/auth/2fa/verify', {
      token: verifyForm.token,
      secret: secretKey.value,
      backupCodes: backupCodes.value.map(code => code.replace(/-/g, '')),
      verificationToken: Date.now().toString()
    });

    if (data.success) {
      currentStep.value = 3; // 进入备用码保存步骤
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error?.message || '验证失败');
  } finally {
    verifying.value = false;
  }
}

// 完成设置
async function completeSetup() {
  try {
    loading.value = true;
    await fetchStatus();
    setupInProgress.value = false;
    showSuccess.value = true;
  } catch (error: any) {
    ElMessage.error('获取状态失败');
  } finally {
    loading.value = false;
  }
}

// 确认禁用
async function confirmDisable() {
  try {
    await ElMessageBox.confirm(
      '禁用双因素认证会降低账户安全性，是否继续？',
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    loading.value = true;
    const { data } = await axios.post('/api/auth/2fa/disable', {
      password: 'TODO'  // 需要添加密码输入
    });

    if (data.success) {
      ElMessage.success('双因素认证已禁用');
      await fetchStatus();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error?.message || '禁用失败');
    }
  } finally {
    loading.value = false;
  }
}

// 下载备用码
function downloadBackupCodes() {
  const content = `双因素认证备用恢复码\n生成时间: ${new Date().toLocaleString()}\n\n${backupCodes.value.join('\n')}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `2fa-backup-codes-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// 打开链接
function openLink(url: string) {
  window.open(url, '_blank');
}

// 格式化日期
function formatDate(date: Date | null) {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
}
</script>

<style scoped>
.two-factor-setup {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: var(--text-lg);
  font-weight: bold;
}

.actions {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.setup-process {
  margin-top: 30px;
}

.step-content {
  margin-top: 40px;
  padding: var(--spacing-lg);
}

.step-content h3 {
  margin-bottom: 15px;
  color: #303133;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: var(--spacing-lg);
  background: #f5f7fa;
  border-radius: 8px;
}

.qr-code {
  width: 256px;
  height: 256px;
  border: 10px solid white;
  border-radius: 8px;
}

.manual-entry {
  margin-top: 20px;
}

.backup-codes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: var(--spacing-lg);
  background: #f5f7fa;
  border-radius: 8px;
}

.code-item {
  padding: 10px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
  font-family: monospace;
  font-size: var(--text-base);
  letter-spacing: 2px;
}
</style>
