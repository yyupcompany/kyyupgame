<template>
  <div class="storage-settings">
    <el-form :model="formData" label-width="140px">
      <!-- 存储驱动 -->
      <el-form-item 
        v-for="item in settings" 
        :key="item.id" 
        :label="item.description"
      >
        <!-- 存储驱动选择 -->
        <template v-if="item.key === 'storage_driver'">
          <el-select v-model="formData[item.key]" style="width: 100%;">
            <el-option label="本地存储" value="local" />
            <el-option label="阿里云OSS" value="aliyun" />
            <el-option label="腾讯云COS" value="tencent" />
            <el-option label="七牛云存储" value="qiniu" />
          </el-select>
        </template>
        
        <!-- 最大上传大小 -->
        <template v-else-if="item.key === 'max_upload_size'">
          <el-input-number 
            v-model="formData[item.key]" 
            :min="1"
            :max="100"
            :step="1"
            style="max-width: 180px; width: 100%;"
          />
          <span class="setting-tip">MB</span>
        </template>
        
        <!-- 允许的文件类型 -->
        <template v-else-if="item.key === 'allowed_file_types'">
          <el-select 
            v-model="selectedFileTypes" 
            multiple 
            collapse-tags 
            style="width: 100%;"
            @change="handleFileTypesChange"
          >
            <el-option-group label="图片">
              <el-option label="JPG" value="jpg" />
              <el-option label="JPEG" value="jpeg" />
              <el-option label="PNG" value="png" />
              <el-option label="GIF" value="gif" />
              <el-option label="SVG" value="svg" />
            </el-option-group>
            <el-option-group label="文档">
              <el-option label="PDF" value="pdf" />
              <el-option label="DOC" value="doc" />
              <el-option label="DOCX" value="docx" />
              <el-option label="XLS" value="xls" />
              <el-option label="XLSX" value="xlsx" />
              <el-option label="PPT" value="ppt" />
              <el-option label="PPTX" value="pptx" />
              <el-option label="TXT" value="txt" />
            </el-option-group>
            <el-option-group label="其他">
              <el-option label="ZIP" value="zip" />
              <el-option label="RAR" value="rar" />
              <el-option label="MP4" value="mp4" />
              <el-option label="MP3" value="mp3" />
            </el-option-group>
          </el-select>
        </template>
        
        <!-- 其他设置项 -->
        <template v-else>
          <el-input v-model="formData[item.key]" :placeholder="`请输入${item.description}`" />
        </template>
      </el-form-item>
      
      <!-- 云存储配置 -->
      <div v-if="formData.storage_driver !== 'local'" class="cloud-storage-config">
        <el-divider content-position="left">{{ getCloudStorageTitle() }}</el-divider>
        
        <el-form-item v-if="formData.storage_driver === 'aliyun'" label="Endpoint">
          <el-input v-model="cloudConfig.endpoint" placeholder="请输入OSS Endpoint" />
        </el-form-item>
        
        <el-form-item v-if="formData.storage_driver === 'tencent'" label="Region">
          <el-input v-model="cloudConfig.region" placeholder="请输入COS Region" />
        </el-form-item>
        
        <el-form-item label="AccessKey">
          <el-input v-model="cloudConfig.accessKey" placeholder="请输入AccessKey" />
        </el-form-item>
        
        <el-form-item label="SecretKey">
          <el-input v-model="cloudConfig.secretKey" type="password" show-password placeholder="请输入SecretKey" />
        </el-form-item>
        
        <el-form-item label="Bucket">
          <el-input v-model="cloudConfig.bucket" placeholder="请输入Bucket名称" />
        </el-form-item>
        
        <el-form-item label="域名">
          <el-input v-model="cloudConfig.domain" placeholder="请输入自定义域名（可选）" />
        </el-form-item>
        
        <el-form-item v-if="formData.storage_driver === 'aliyun' || formData.storage_driver === 'qiniu'" label="私有空间">
          <el-switch v-model="cloudConfig.private" />
          <span class="setting-tip">开启后，访问文件需要授权</span>
        </el-form-item>
      </div>
      
      <!-- 测试区域 -->
      <el-divider content-position="left">测试</el-divider>
      
      <div class="test-upload">
        <el-upload
          action="#"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          class="test-uploader"
          @change="handleFileChange"
        >
          <el-button type="primary">
            <UnifiedIcon name="Upload" />
            选择文件
          </el-button>
          <div class="el-upload__tip">用于测试上传配置，请选择文件后点击上传按钮</div>
        </el-upload>

        <el-button type="success" :disabled="!hasSelectedFile" @click="handleTestUpload">
          <UnifiedIcon name="Check" />
          测试上传
        </el-button>
      </div>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          <UnifiedIcon name="Check" />
          保存设置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { SystemSetting } from '@/types/system';
import { SYSTEM_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

interface CloudStorageConfig {
  endpoint?: string;
  region?: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  domain: string;
  private: boolean;
}

export default defineComponent({
  name: 'StorageSettings',
  
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
    const formData = reactive<Record<string, string | number>>({});
    
    // 选择的文件类型
    const selectedFileTypes = ref<string[]>([]);
    
    // 是否已选择测试文件
    const hasSelectedFile = ref(false);
    
    // 云存储配置
    const cloudConfig = reactive<CloudStorageConfig>({
      endpoint: '',
      region: '',
      accessKey: '',
      secretKey: '',
      bucket: '',
      domain: '',
      private: false
    });
    
    // 选择的测试文件
    const testFile = ref<File | null>(null);
    
    // 监听settings变化，更新formData
    watch(() => props.settings, (val) => {
      val.forEach(setting => {
        if (setting.key === 'max_upload_size') {
          formData[setting.key] = parseInt(setting.value) || 10;
        } else if (setting.key === 'allowed_file_types') {
          formData[setting.key] = setting.value;
          selectedFileTypes.value = setting.value.split(',');
        } else {
          formData[setting.key] = setting.value;
        }
      });
      
      // 从设置中加载云存储配置
      const cloudConfigItem = val.find(item => item.key === 'cloud_storage_config');
      if (cloudConfigItem && formData.storage_driver !== 'local') {
        try {
          const config = JSON.parse(cloudConfigItem.value);
          Object.assign(cloudConfig, config);
        } catch (e) {
          console.error('解析云存储配置失败:', e);
        }
      }
    }, { immediate: true });
    
    // 处理文件类型变化
    const handleFileTypesChange = (types: string[]): void => {
      formData.allowed_file_types = types.join(',');
    };
    
    // 获取云存储标题
    const getCloudStorageTitle = (): string => {
      const titles: Record<string, string> = {
        aliyun: '阿里云OSS配置',
        tencent: '腾讯云COS配置',
        qiniu: '七牛云存储配置'
      };
      return titles[formData.storage_driver as string] || '云存储配置';
    };
    
    // 处理文件选择
    const handleFileChange = (file: File): void => {
      testFile.value = file;
      hasSelectedFile.value = true;
    };
    
    // 测试上传
    const handleTestUpload = async (): Promise<void> => {
      if (!testFile.value) {
        ElMessage.warning('请先选择文件');
        return;
      }
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', testFile.value);
      
      // 添加存储配置信息
      uploadFormData.append('driver', String(formData.storage_driver));
      
      if (formData.storage_driver !== 'local') {
        uploadFormData.append('config', JSON.stringify(cloudConfig));
      }
      
      try {
        const res: ApiResponse = await request.post(SYSTEM_ENDPOINTS.STORAGE_TEST, uploadFormData);
        ElMessage.success('文件上传成功，访问地址：' + res.data.url);
      } catch (error) {
        console.error('测试上传失败:', error);
        ElMessage.error('测试上传失败');
      }
    };
    
    // 提交表单
    const handleSubmit = (): void => {
      // 构建要提交的设置数据
      const updatedSettings = props.settings.map(setting => {
        if (setting.key === 'cloud_storage_config' && formData.storage_driver !== 'local') {
          // 特殊处理云存储配置
          return {
            ...setting,
            value: JSON.stringify(cloudConfig)
          };
        }
        
        return {
          ...setting,
          value: formData[setting.key]?.toString() || ''
        };
      });
      
      // 触发保存事件
      emit('save', 'storage', updatedSettings);
    };
    
    return {
      formData,
      selectedFileTypes,
      cloudConfig,
      hasSelectedFile,
      testFile,
      handleFileTypesChange,
      getCloudStorageTitle,
      handleFileChange,
      handleTestUpload,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;
@use "@/styles/design-tokens.scss" as *;
@use "@/styles/list-components-optimization.scss" as *;

.storage-settings {
  padding: var(--spacing-lg);
  
  .setting-tip {
    margin-left: var(--spacing-sm);
    color: var(--text-color-secondary);
    font-size: var(--font-size-sm);
  }
  
  .cloud-storage-config {
    margin-top: var(--spacing-lg);
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
  
  .test-upload {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    
    .test-uploader {
      flex: 1;
      margin-right: var(--spacing-lg);
    }
  }
}
</style> 