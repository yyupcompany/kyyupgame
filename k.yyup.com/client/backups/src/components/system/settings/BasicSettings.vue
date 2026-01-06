<template>
  <div class="basic-settings">
    <el-form :model="formData" label-width="120px">
      <el-form-item 
        v-for="item in settings" 
        :key="item.id" 
        :label="item.description"
      >
        <el-input 
          v-if="item.key !== 'system_logo'" 
          v-model="formData[item.key]" 
          :placeholder="`请输入${item.description}`"
        />
        <div v-else class="logo-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
            :http-request="uploadLogo"
          >
            <img v-if="formData[item.key]" :src="formData[item.key]" class="logo-image" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="logo-tip">点击上传系统Logo，建议尺寸：200x50px，格式：PNG</div>
        </div>
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
import { Plus } from '@element-plus/icons-vue';
import type { SystemSetting } from '@/types/system';

export default defineComponent({
  name: 'BasicSettings',
  
  components: {
    Plus
  },
  
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
    
    // 监听settings变化，更新formData
    watch(() => props.settings, (val) => {
      val.forEach(setting => {
        formData[setting.key] = setting.value;
      });
    }, { immediate: true });
    
    // 上传Logo前的校验
    const beforeLogoUpload = (file: File): boolean => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isImage) {
        ElMessage.error('Logo只能是JPG/PNG/GIF格式!');
        return false;
      }
      
      if (!isLt2M) {
        ElMessage.error('Logo大小不能超过2MB!');
        return false;
      }
      
      return true;
    };
    
    // 处理Logo上传成功
    const handleLogoSuccess = (res: any, file: any): void => {
      // 在实际环境中，这里会获取到上传后的URL
      // formData['system_logo'] = res.url;
      
      // 模拟上传成功后的URL
      if (file.raw) {
        formData['system_logo'] = URL.createObjectURL(file.raw);
      }
    };
    
    // 自定义上传方法
    const uploadLogo = (options: any): void => {
      const { file, onSuccess } = options;
      
      // 在实际环境中，这里会调用上传API
      // 这里模拟上传成功
      setTimeout(() => {
        onSuccess('上传成功');
        ElMessage.success('Logo上传成功');
      }, 500);
    };
    
    // 提交表单
    const handleSubmit = (): void => {
      // 构建要提交的设置数据
      const updatedSettings = props.settings.map(setting => ({
        ...setting,
        value: formData[setting.key] || ''
      }));
      
      // 触发保存事件
      emit('save', 'basic', updatedSettings);
    };
    
    return {
      formData,
      beforeLogoUpload,
      handleLogoSuccess,
      uploadLogo,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.basic-settings {
  padding: var(--spacing-lg);
  
  .logo-upload {
    .avatar-uploader {
      border: var(--border-width-base) dashed var(--border-color-light);
      border-radius: var(--border-radius-base);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 200px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: var(--color-primary);
      }
    }
    
    .avatar-uploader-icon {
      font-size: var(--text-3xl);
      color: var(--text-color-placeholder);
      width: 200px;
      height: 50px;
      line-height: 50px;
      text-align: center;
    }
    
    .logo-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .logo-tip {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      margin-top: var(--spacing-sm);
    }
  }
}
</style> 