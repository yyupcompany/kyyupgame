<template>
  <div class="qrcode-generator">
    <el-form :model="form" label-width="100px">
      <el-form-item label="推广类型">
        <el-radio-group v-model="form.type">
          <el-radio-button label="activity">活动推广</el-radio-button>
          <el-radio-button label="referral">推荐码</el-radio-button>
          <el-radio-button label="custom">自定义链接</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.type === 'activity'" label="选择活动">
        <el-select
          v-model="form.activityId"
          placeholder="请选择活动"
          style="width: 100%"
        >
          <el-option
            v-for="activity in activities"
            :key="activity.id"
            :label="activity.title"
            :value="activity.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.type === 'custom'" label="自定义链接">
        <el-input
          v-model="form.customUrl"
          placeholder="请输入推广链接"
        />
      </el-form-item>

      <el-form-item label="二维码尺寸">
        <el-radio-group v-model="form.size">
          <el-radio-button :label="200">小 (200x200)</el-radio-button>
          <el-radio-button :label="400">中 (400x400)</el-radio-button>
          <el-radio-button :label="600">大 (600x600)</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="二维码颜色">
        <el-color-picker v-model="form.color" />
      </el-form-item>

      <el-form-item label="背景颜色">
        <el-color-picker v-model="form.backgroundColor" />
      </el-form-item>

      <el-form-item label="添加Logo">
        <el-switch v-model="form.withLogo" />
      </el-form-item>

      <el-form-item v-if="form.withLogo" label="Logo图片">
        <el-upload
          class="logo-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleLogoSuccess"
          :before-upload="beforeLogoUpload"
        >
          <img v-if="form.logoUrl" :src="form.logoUrl" class="logo-preview" />
          <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <!-- 二维码预览 -->
    <div v-if="qrcodeUrl" class="qrcode-preview">
      <div class="preview-title">二维码预览</div>
      <div class="qrcode-container">
        <el-image
          :src="qrcodeUrl"
          fit="contain"
          style="width: 300px; height: 300px"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      <div class="qrcode-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="推广链接">
            {{ generatedUrl }}
          </el-descriptions-item>
          <el-descriptions-item label="生成时间">
            {{ generatedTime }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleGenerate" :loading="generating">
        生成二维码
      </el-button>
      <el-button
        v-if="qrcodeUrl"
        type="success"
        @click="handleDownload"
      >
        下载二维码
      </el-button>
      <el-button
        v-if="qrcodeUrl"
        type="warning"
        @click="handleCopyLink"
      >
        复制链接
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Picture } from '@element-plus/icons-vue';
import { request } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs';

const emit = defineEmits(['success', 'cancel']);
const userStore = useUserStore();

// 响应式数据
const generating = ref(false);
const qrcodeUrl = ref('');
const generatedUrl = ref('');
const generatedTime = ref('');
const activities = ref<any[]>([]);

// 表单数据
const form = reactive({
  type: 'activity',
  activityId: '',
  customUrl: '',
  size: 400,
  color: 'var(--text-primary)',
  backgroundColor: 'var(--color-white)',
  withLogo: false,
  logoUrl: ''
});

// 上传配置
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/files/upload`);
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}));

// 加载活动列表
const loadActivities = async () => {
  try {
    const response = await request.get('/activities', {
      params: { page: 1, pageSize: 100, status: 'published' }
    });
    if (response.data && response.data.items) {
      activities.value = response.data.items;
    }
  } catch (error) {
    console.error('加载活动列表失败:', error);
  }
};

// Logo上传成功
const handleLogoSuccess = (response: any) => {
  if (response.data && response.data.url) {
    form.logoUrl = response.data.url;
    ElMessage.success('Logo上传成功');
  }
};

// Logo上传前验证
const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 生成二维码
const handleGenerate = async () => {
  // 验证
  if (form.type === 'activity' && !form.activityId) {
    ElMessage.warning('请选择活动');
    return;
  }
  if (form.type === 'custom' && !form.customUrl) {
    ElMessage.warning('请输入自定义链接');
    return;
  }

  generating.value = true;
  try {
    const response = await request.post('/marketing/referrals/generate', {
      type: form.type,
      activityId: form.activityId,
      customUrl: form.customUrl,
      qrcodeConfig: {
        size: form.size,
        color: form.color,
        backgroundColor: form.backgroundColor,
        withLogo: form.withLogo,
        logoUrl: form.logoUrl
      }
    });
    
    if (response.data) {
      qrcodeUrl.value = response.data.qrcodeUrl || '';
      generatedUrl.value = response.data.url || '';
      generatedTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
      ElMessage.success('二维码生成成功');
      emit('success', qrcodeUrl.value);
    }
  } catch (error: any) {
    console.error('生成二维码失败:', error);
    ElMessage.error(error.message || '生成二维码失败');
  } finally {
    generating.value = false;
  }
};

// 下载二维码
const handleDownload = () => {
  if (!qrcodeUrl.value) return;
  
  const link = document.createElement('a');
  link.href = qrcodeUrl.value;
  link.download = `推广二维码_${Date.now()}.png`;
  link.click();
  ElMessage.success('开始下载二维码');
};

// 复制链接
const handleCopyLink = async () => {
  if (!generatedUrl.value) return;
  
  try {
    await navigator.clipboard.writeText(generatedUrl.value);
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败,请手动复制');
  }
};

// 取消
const handleCancel = () => {
  emit('cancel');
};

// 初始化
onMounted(() => {
  loadActivities();
});
</script>

<style scoped lang="scss">
.qrcode-generator {
  .logo-uploader {
    :deep(.el-upload) {
      border: var(--border-width-base) dashed var(--border-base);
      border-radius: var(--radius-md);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: var(--primary-color);
      }
    }

    .logo-uploader-icon {
      font-size: var(--text-3xl);
      color: #8c939d;
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
    }

    .logo-preview {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: contain;
    }
  }

  .qrcode-preview {
    margin-top: var(--text-2xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    
    .preview-title {
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--text-lg);
      color: var(--text-primary);
      text-align: center;
    }
    
    .qrcode-container {
      display: flex;
      justify-content: center;
      margin-bottom: var(--text-lg);
      padding: var(--text-2xl);
      background: white;
      border-radius: var(--spacing-sm);
    }
    
    .qrcode-info {
      margin-top: var(--text-lg);
    }
    
    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--info-color);
      
      .el-icon {
        font-size: var(--text-5xl);
        margin-bottom: var(--spacing-sm);
      }
    }
  }
  
  .dialog-footer {
    margin-top: var(--text-3xl);
    display: flex;
    justify-content: flex-end;
    gap: var(--text-sm);
  }
}
</style>

