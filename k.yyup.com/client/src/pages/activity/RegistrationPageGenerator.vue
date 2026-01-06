<template>
  <div class="registration-page-generator">
    <div class="page-header">
      <h2>生成活动报名页面</h2>
      <p>一键生成包含海报、基础信息和报名表单的完整页面</p>
    </div>

    <div class="generator-content">
      <!-- 左侧：配置区域 -->
      <div class="config-section">
        <el-form :model="pageConfig" label-width="120px" class="config-form">
          <el-form-item label="活动名称" required>
            <el-input v-model="pageConfig.activityName" placeholder="请输入活动名称" />
          </el-form-item>

          <el-form-item label="活动海报">
            <div class="poster-selector">
              <div v-if="pageConfig.posterUrl" class="poster-preview">
                <img :src="pageConfig.posterUrl" alt="海报" />
                <el-button size="small" @click="removePoster" class="remove-btn">
                  <UnifiedIcon name="Close" />
                </el-button>
              </div>
              <el-button v-else type="primary" @click="selectPoster">
                <UnifiedIcon name="default" />
                选择海报
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="包含基础信息">
            <el-checkbox-group v-model="pageConfig.includeInfo">
              <el-checkbox label="kindergartenName">幼儿园名称</el-checkbox>
              <el-checkbox label="address">园区地址</el-checkbox>
              <el-checkbox label="phone">咨询电话</el-checkbox>
              <el-checkbox label="description">园区简介</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="报名表单字段">
            <el-checkbox-group v-model="pageConfig.formFields">
              <el-checkbox label="studentName">学生姓名</el-checkbox>
              <el-checkbox label="parentName">家长姓名</el-checkbox>
              <el-checkbox label="parentPhone">家长电话</el-checkbox>
              <el-checkbox label="age">学生年龄</el-checkbox>
              <el-checkbox label="gender">性别</el-checkbox>
              <el-checkbox label="remarks">备注</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large"
              @click="generatePage" 
              :loading="generating"
              :disabled="!canGenerate"
            >
              <UnifiedIcon name="default" />
              生成报名页面
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：预览区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>页面预览</h3>
          <div class="preview-actions" v-if="generatedPageUrl">
            <el-button size="small" @click="copyLink">
              <UnifiedIcon name="default" />
              复制链接
            </el-button>
            <el-button size="small" @click="downloadQRCode">
              <UnifiedIcon name="Download" />
              下载二维码
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <div class="mobile-frame">
            <!-- 真实iframe预览 - 加载实际的报名页面 -->
            <div v-if="generatedPageUrl" class="iframe-container">
              <iframe 
                :src="generatedPageUrl" 
                class="page-iframe"
                frameborder="0"
                scrolling="yes"
              ></iframe>
            </div>
            <!-- 默认预览 - 生成前显示 -->
            <div v-else class="page-preview">
              <!-- 海报 -->
              <img 
                v-if="pageConfig.posterUrl" 
                :src="pageConfig.posterUrl" 
                class="preview-poster" 
                alt="活动海报"
              />
              <div v-else class="preview-poster-placeholder">
                <UnifiedIcon name="default" />
                <span>暂无海报</span>
              </div>
              
              <!-- 基础信息 -->
              <div class="preview-info" v-if="pageConfig.includeInfo.length > 0">
                <h3 v-if="pageConfig.includeInfo.includes('kindergartenName')">
                  {{ basicInfo.name || '幼儿园名称' }}
                </h3>
                <p v-if="pageConfig.includeInfo.includes('address')" class="info-item">
                  <UnifiedIcon name="default" />
                  {{ basicInfo.address || '园区地址' }}
                </p>
                <p v-if="pageConfig.includeInfo.includes('phone')" class="info-item">
                  <UnifiedIcon name="default" />
                  {{ basicInfo.phone || '咨询电话' }}
                </p>
                <p v-if="pageConfig.includeInfo.includes('description')" class="info-description">
                  {{ basicInfo.description || '园区简介' }}
                </p>
              </div>

              <!-- 报名表单 -->
              <div class="preview-form">
                <h4>活动报名</h4>
                <div v-for="field in pageConfig.formFields" :key="field" class="form-field">
                  <label>{{ getFieldLabel(field) }}</label>
                  <input type="text" :placeholder="`请输入${getFieldLabel(field)}`" disabled />
                </div>
                <button class="submit-button" disabled>立即报名</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成成功信息 -->
        <div class="generated-info" v-if="generatedPageUrl">
          <el-alert type="success" :closable="false">
            <template #title>
              <div class="success-info">
                <span>页面生成成功！</span>
                <el-button type="primary" size="small" @click="openPage">
                  <UnifiedIcon name="eye" />
                  打开页面
                </el-button>
              </div>
            </template>
          </el-alert>

          <div class="share-info">
            <div class="share-item">
              <label>分享链接：</label>
              <el-input v-model="generatedPageUrl" readonly>
                <template #append>
                  <el-button @click="copyLink">
                    <UnifiedIcon name="default" />
                    复制
                  </el-button>
                </template>
              </el-input>
            </div>

            <div class="share-item qrcode-item">
              <label>二维码：</label>
              <div class="qrcode-container">
                <img v-if="qrcodeUrl" :src="qrcodeUrl" alt="二维码" class="qrcode-image" />
                <div v-else class="qrcode-placeholder">
                  <UnifiedIcon name="default" />
                  <span>生成中...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="registrationPageHelp" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Close,
  MagicStick,
  Link,
  Download,
  Location,
  Phone,
  View,
  CopyDocument,
  Loading
} from '@element-plus/icons-vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { kindergartenInfoService } from '@/services/kindergarten-info.service'
import { generateRegistrationPage } from '@/api/modules/activity-registration-page'

// 页面配置
const pageConfig = ref({
  activityName: '',
  posterUrl: '',
  includeInfo: ['kindergartenName', 'address', 'phone'],
  formFields: ['studentName', 'parentName', 'parentPhone', 'age', 'gender']
})

// 基础信息
const basicInfo = ref({
  name: '',
  address: '',
  phone: '',
  description: ''
})

// 生成状态
const generating = ref(false)
const generatedPageUrl = ref('')
const qrcodeUrl = ref('')

// 是否可以生成
const canGenerate = computed(() => {
  return pageConfig.value.activityName.trim() !== ''
})

// AI帮助内容
const registrationPageHelp = {
  title: '报名页面生成器使用指南',
  description: '一键生成包含活动海报、幼儿园信息和报名表单的完整H5页面。生成的页面可直接分享给家长，支持在线报名。',
  features: [
    '自动包含活动海报',
    '自动包含幼儿园基础信息',
    '可自定义报名表单字段',
    '生成分享链接和二维码',
    '支持多渠道分享'
  ],
  steps: [
    '填写活动名称',
    '选择要使用的活动海报',
    '勾选要显示的幼儿园信息',
    '选择报名表单需要的字段',
    '点击"生成报名页面"',
    '复制链接或下载二维码进行分享'
  ],
  tips: [
    '建议包含幼儿园名称和联系方式，方便家长咨询',
    '报名表单字段不要太多，避免家长填写负担',
    '生成的二维码可以打印到宣传单上',
    '页面链接可以分享到微信群、朋友圈'
  ]
}

// 加载基础信息
const loadBasicInfo = async () => {
  try {
    const info = await kindergartenInfoService.formatForRegistrationPage()
    basicInfo.value = {
      name: info.kindergartenName,
      address: info.address,
      phone: info.phone,
      description: info.description
    }
    console.log('✅ 基础信息加载成功:', basicInfo.value)
  } catch (error) {
    console.error('❌ 加载基础信息失败:', error)
  }
}

// 选择海报
const selectPoster = () => {
  ElMessage.info('海报选择功能开发中，请先手动输入海报URL')
  // TODO: 打开海报选择对话框
}

// 移除海报
const removePoster = () => {
  pageConfig.value.posterUrl = ''
}

// 生成页面
const generatePage = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写活动名称')
    return
  }

  generating.value = true
  try {
    console.log('🚀 开始生成报名页面...')
    console.log('📋 页面配置:', pageConfig.value)
    console.log('🏫 基础信息:', basicInfo.value)

    // 调用后端API生成页面
    const response = await generateRegistrationPage({
      activityName: pageConfig.value.activityName,
      posterUrl: pageConfig.value.posterUrl,
      includeInfo: pageConfig.value.includeInfo,
      formFields: pageConfig.value.formFields
    })

    if (response.success && response.data) {
      generatedPageUrl.value = response.data.pageUrl
      qrcodeUrl.value = response.data.qrcodeDataUrl

      console.log('✅ 报名页面生成成功:', response.data)
      ElMessage.success('报名页面生成成功！')
    } else {
      throw new Error('生成失败')
    }
  } catch (error) {
    console.error('❌ 生成页面失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(generatedPageUrl.value)
  ElMessage.success('链接已复制到剪贴板')
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrcodeUrl.value) return
  
  const link = document.createElement('a')
  link.href = qrcodeUrl.value
  link.download = `报名二维码-${pageConfig.value.activityName}.png`
  link.click()
  ElMessage.success('二维码下载成功')
}

// 打开页面
const openPage = () => {
  window.open(generatedPageUrl.value, '_blank')
}

// 获取字段标签
const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    studentName: '学生姓名',
    parentName: '家长姓名',
    parentPhone: '家长电话',
    age: '学生年龄',
    gender: '性别',
    remarks: '备注'
  }
  return labels[field] || field
}

// 组件挂载时加载基础信息
onMounted(() => {
  loadBasicInfo()
})
</script>

<style scoped lang="scss">
.registration-page-generator {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: var(--text-3xl);

  h2 {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  p {
    font-size: var(--text-base);
    color: var(--info-color);
    margin: 0;
  }
}

.generator-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--text-3xl);
}

.config-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.config-form {
  .poster-selector {
    .poster-preview {
      position: relative;
      max-max-max-width: 200px; width: 100%; width: 100%; width: 100%;
      
      img {
        width: 100%;
        border-radius: var(--spacing-sm);
        display: block;
      }

      .remove-btn {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        background: var(--black-alpha-60);
        color: white;
        border: none;
        padding: var(--spacing-xs);
        min-height: auto;

        &:hover {
          background: var(--black-alpha-80);
        }
      }
    }
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

.preview-section {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-lighter);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding-bottom: var(--text-lg);
  border-bottom: var(--border-width-base) solid #ebeef5;

  h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .preview-actions {
    display: flex;
    gap: var(--text-sm);
  }
}

.preview-content {
  display: flex;
  justify-content: center;
  padding: var(--text-2xl) 0;
}

.mobile-frame {
  width: 100%; max-width: 375px;
  background: var(--bg-secondary);
  border-radius: var(--text-3xl);
  padding: var(--text-sm);
  box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--shadow-medium);
  border: var(--spacing-sm) solid var(--text-primary);
  
  .iframe-container {
    background: white;
    border-radius: var(--text-lg);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
    min-height: 60px; height: auto; // iPhone标准高度
    
    .page-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}

.page-preview {
  background: white;
  border-radius: var(--text-lg);
  overflow: hidden;
  max-min-height: 60px; height: auto;
  overflow-y: auto;

  .preview-poster {
    width: 100%;
    display: block;
  }

  .preview-poster-placeholder {
    width: 100%;
    min-height: 60px; height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-hover);
    color: var(--info-color);
    gap: var(--spacing-sm);

    .el-icon {
      font-size: var(--text-5xl);
    }
  }

  .preview-info {
    padding: var(--text-2xl);
    border-bottom: var(--border-width-base) solid #ebeef5;

    h3 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-sm) 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-base);
      color: var(--text-regular);
      margin: var(--spacing-sm) 0;

      .el-icon {
        color: var(--primary-color);
      }
    }

    .info-description {
      font-size: var(--text-sm);
      color: var(--info-color);
      line-height: 1.6;
      margin-top: var(--text-sm);
    }
  }

  .preview-form {
    padding: var(--text-2xl);

    h4 {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--text-lg) 0;
    }

    .form-field {
      margin-bottom: var(--text-lg);

      label {
        display: block;
        font-size: var(--text-base);
        color: var(--text-regular);
        margin-bottom: var(--spacing-sm);
      }

      input {
        width: 100%;
        padding: var(--spacing-2xl) var(--text-sm);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--spacing-xs);
        font-size: var(--text-base);
        color: var(--text-regular);
        background: var(--bg-hover);

        &::placeholder {
          color: var(--text-placeholder);
        }
      }
    }

    .submit-button {
      width: 100%;
      padding: var(--text-sm);
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: 600;
      cursor: not-allowed;
      opacity: 0.8;
    }
  }
}

.generated-info {
  margin-top: var(--text-3xl);

  .success-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .share-info {
    margin-top: var(--text-lg);
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);

    .share-item {
      label {
        display: block;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
      }
    }

    .qrcode-item {
      .qrcode-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--text-sm);
        padding: var(--text-2xl);
        background: var(--bg-hover);
        border-radius: var(--spacing-sm);

        .qrcode-image {
          width: 200px;
          min-height: 60px; height: auto;
          border: var(--spacing-xs) solid white;
          border-radius: var(--spacing-sm);
          box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
        }

        .qrcode-placeholder {
          width: 200px;
          min-height: 60px; height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: var(--spacing-sm);
          color: var(--info-color);
          gap: var(--spacing-sm);

          .el-icon {
            font-size: var(--spacing-3xl);
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 滚动条样式
.page-preview::-webkit-scrollbar {
  width: auto;
}

.page-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: var(--radius-xs);
}

.page-preview::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: var(--radius-xs);

  &:hover {
    background: #a8a8a8;
  }
}
</style>

