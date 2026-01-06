<template>
  <div class="poster-generator">
    <el-form :model="form" label-width="100px">
      <el-form-item label="选择模板">
        <el-radio-group v-model="form.templateId">
          <el-radio-button
            v-for="template in templates"
            :key="template.id"
            :label="template.id"
          >
            {{ template.name }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="活动选择">
        <el-select
          v-model="form.activityId"
          placeholder="请选择关联活动"
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

      <el-form-item label="海报标题">
        <el-input
          v-model="form.title"
          placeholder="请输入海报标题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="海报副标题">
        <el-input
          v-model="form.subtitle"
          placeholder="请输入海报副标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="推广文案">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入推广文案"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="二维码内容">
        <el-input
          v-model="form.qrcodeContent"
          placeholder="请输入二维码链接或内容"
        />
      </el-form-item>
    </el-form>

    <!-- 海报预览 -->
    <div v-if="previewUrl" class="poster-preview">
      <div class="preview-title">海报预览</div>
      <el-image
        :src="previewUrl"
        fit="contain"
        style="width: 100%; max-height: 500px"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
    </div>

    <!-- 操作按钮 -->
    <div class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handlePreview" :loading="previewing">
        预览海报
      </el-button>
      <el-button type="success" @click="handleGenerate" :loading="generating">
        生成海报
      </el-button>
      <el-button
        v-if="previewUrl"
        type="warning"
        @click="handleDownload"
      >
        下载海报
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';
import { request } from '@/utils/request';

const emit = defineEmits(['success', 'cancel']);

// 响应式数据
const generating = ref(false);
const previewing = ref(false);
const previewUrl = ref('');
const templates = ref<any[]>([]);
const activities = ref<any[]>([]);

// 表单数据
const form = reactive({
  templateId: '',
  activityId: '',
  title: '',
  subtitle: '',
  description: '',
  qrcodeContent: ''
});

// 加载海报模板
const loadTemplates = async () => {
  try {
    const response = await request.get('/marketing/referrals/poster-templates');
    if (response.data) {
      templates.value = response.data;
      if (templates.value.length > 0) {
        form.templateId = templates.value[0].id;
      }
    }
  } catch (error) {
    console.error('加载海报模板失败:', error);
    // 如果没有模板,使用默认模板
    templates.value = [
      { id: 'default', name: '默认模板' },
      { id: 'simple', name: '简约模板' },
      { id: 'colorful', name: '多彩模板' }
    ];
    form.templateId = 'default';
  }
};

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

// 预览海报
const handlePreview = async () => {
  if (!form.title) {
    ElMessage.warning('请输入海报标题');
    return;
  }

  previewing.value = true;
  try {
    const response = await request.post('/marketing/referrals/generate-poster', {
      ...form,
      preview: true
    });
    
    if (response.data && response.data.posterUrl) {
      previewUrl.value = response.data.posterUrl;
      ElMessage.success('预览生成成功');
    }
  } catch (error: any) {
    console.error('预览海报失败:', error);
    ElMessage.error(error.message || '预览海报失败');
  } finally {
    previewing.value = false;
  }
};

// 生成海报
const handleGenerate = async () => {
  if (!form.title) {
    ElMessage.warning('请输入海报标题');
    return;
  }

  generating.value = true;
  try {
    const response = await request.post('/marketing/referrals/generate-poster', {
      ...form,
      preview: false
    });
    
    if (response.data && response.data.posterUrl) {
      previewUrl.value = response.data.posterUrl;
      ElMessage.success('海报生成成功');
      emit('success', response.data.posterUrl);
    }
  } catch (error: any) {
    console.error('生成海报失败:', error);
    ElMessage.error(error.message || '生成海报失败');
  } finally {
    generating.value = false;
  }
};

// 下载海报
const handleDownload = () => {
  if (!previewUrl.value) return;
  
  const link = document.createElement('a');
  link.href = previewUrl.value;
  link.download = `推广海报_${Date.now()}.png`;
  link.click();
  ElMessage.success('开始下载海报');
};

// 取消
const handleCancel = () => {
  emit('cancel');
};

// 初始化
onMounted(() => {
  loadTemplates();
  loadActivities();
});
</script>

<style scoped lang="scss">
.poster-generator {
  .poster-preview {
    margin-top: var(--text-2xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    
    .preview-title {
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--text-lg);
      color: var(--text-primary);
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

