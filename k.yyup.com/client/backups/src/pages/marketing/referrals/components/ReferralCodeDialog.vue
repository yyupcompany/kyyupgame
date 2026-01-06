<template>
  <el-dialog
    v-model="visible"
    title="我的推广码"
    width="1000px"
    :close-on-click-modal="false"
    class="referral-code-dialog"
  >
    <div class="dialog-content" v-loading="loading">
      <el-row :gutter="24">
        <!-- 左侧：推广码信息 -->
        <el-col :span="10">
          <div class="referral-info-section">
            <h3>我的专属推广码</h3>
            
            <!-- 推广码 -->
            <div class="code-card">
              <div class="code-label">推广码</div>
              <div class="code-value">{{ myReferralCode }}</div>
              <el-button type="primary" @click="copyReferralCode" size="small">
                <el-icon><DocumentCopy /></el-icon>
                复制推广码
              </el-button>
            </div>
            
            <!-- 推广链接 -->
            <div class="link-card">
              <div class="link-label">推广链接</div>
              <div class="link-value">{{ referralLink }}</div>
              <el-button type="success" @click="copyReferralLink" size="small">
                <el-icon><Link /></el-icon>
                复制链接
              </el-button>
            </div>
            
            <!-- 二维码 -->
            <div class="qrcode-card">
              <h4>推广二维码</h4>
              <div class="qrcode-container">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="推广二维码" />
                <div v-else class="qrcode-loading">生成中...</div>
              </div>
              <el-button @click="downloadQRCode" :disabled="!qrCodeUrl">
                <el-icon><Download /></el-icon>
                下载二维码
              </el-button>
            </div>
            
            <!-- 推广统计 -->
            <div class="stats-card">
              <h4>推广统计</h4>
              <div class="stat-item">
                <span class="label">访问次数：</span>
                <span class="value">{{ stats.visitCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">成功转化：</span>
                <span class="value">{{ stats.conversionCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">累计奖励：</span>
                <span class="value reward">¥{{ stats.totalReward || 0 }}</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <!-- 右侧：海报编辑 -->
        <el-col :span="14">
          <div class="poster-editor-section">
            <h3>编辑推广海报</h3>
            
            <el-tabs v-model="posterMode">
              <!-- AI生成海报 -->
              <el-tab-pane label="AI智能生成" name="ai">
                <div class="ai-poster-section">
                  <el-alert
                    title="AI智能海报生成"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <p>通过AI对话，快速生成个性化推广海报，突出您的幼儿园特色！</p>
                  </el-alert>
                  
                  <div class="ai-actions">
                    <el-button
                      type="primary"
                      size="large"
                      @click="openAIPosterGenerator"
                      :loading="generatingAIPoster"
                    >
                      <el-icon><ChatDotRound /></el-icon>
                      开始AI对话生成海报
                    </el-button>
                  </div>
                  
                  <div v-if="aiPosterPreview" class="poster-preview">
                    <h4>AI生成的海报</h4>
                    <img :src="aiPosterPreview" alt="AI生成海报" />
                    <div class="preview-actions">
                      <el-button type="success" @click="downloadPoster(aiPosterPreview)">
                        <el-icon><Download /></el-icon>
                        下载海报
                      </el-button>
                      <el-button @click="regenerateAIPoster">
                        <el-icon><Refresh /></el-icon>
                        重新生成
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <!-- 模板海报 -->
              <el-tab-pane label="模板编辑" name="template">
                <div class="template-poster-section">
                  <!-- 海报内容编辑 -->
                  <el-form :model="posterForm" label-width="100px">
                    <el-form-item label="幼儿园名称">
                      <el-input
                        v-model="posterForm.kindergartenName"
                        placeholder="例如：阳光幼儿园"
                      />
                    </el-form-item>
                    
                    <el-form-item label="推荐人姓名">
                      <el-input
                        v-model="posterForm.referrerName"
                        placeholder="例如：张园长"
                      />
                    </el-form-item>
                    
                    <el-form-item label="主标题">
                      <el-input
                        v-model="posterForm.mainTitle"
                        placeholder="默认：我已经用上了AI智能幼儿园管理系统"
                      />
                    </el-form-item>
                    
                    <el-form-item label="副标题">
                      <el-input
                        v-model="posterForm.subTitle"
                        type="textarea"
                        :rows="2"
                        placeholder="默认：给你也分享一个，你可以测试用用很智能"
                      />
                    </el-form-item>
                    
                    <el-form-item label="联系电话">
                      <el-input
                        v-model="posterForm.contactPhone"
                        placeholder="您的联系电话"
                      />
                    </el-form-item>
                    
                    <el-form-item label="核心功能">
                      <el-checkbox-group v-model="posterForm.features">
                        <el-checkbox label="AI智能招生" />
                        <el-checkbox label="智能排课管理" />
                        <el-checkbox label="家长沟通助手" />
                        <el-checkbox label="数据分析报表" />
                        <el-checkbox label="财务管理系统" />
                        <el-checkbox label="考勤打卡系统" />
                      </el-checkbox-group>
                    </el-form-item>
                    
                    <el-form-item label="海报风格">
                      <el-radio-group v-model="posterForm.style">
                        <el-radio label="professional">专业商务</el-radio>
                        <el-radio label="warm">温馨亲和</el-radio>
                        <el-radio label="modern">现代科技</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-form>
                  
                  <div class="form-actions">
                    <el-button
                      type="primary"
                      @click="generateTemplatePoster"
                      :loading="generatingPoster"
                    >
                      <el-icon><Picture /></el-icon>
                      生成海报
                    </el-button>
                  </div>
                  
                  <!-- 海报预览 -->
                  <div v-if="templatePosterPreview" class="poster-preview">
                    <h4>海报预览</h4>
                    <div class="preview-container">
                      <img :src="templatePosterPreview" alt="海报预览" />
                    </div>
                    <div class="preview-actions">
                      <el-button type="success" @click="downloadPoster(templatePosterPreview)">
                        <el-icon><Download /></el-icon>
                        下载海报
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
  
  <!-- AI海报生成器对话框 -->
  <AIPosterGeneratorDialog
    v-model="aiPosterDialogVisible"
    :referral-code="myReferralCode"
    :qr-code-url="qrCodeUrl"
    @poster-generated="handleAIPosterGenerated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { request } from '@/utils/request'
import QRCode from 'qrcode'
import AIPosterGeneratorDialog from './AIPosterGeneratorDialog.vue'

const visible = defineModel<boolean>()
const loading = ref(false)
const currentUser = ref<any>(null)

// 我的推广码（基于用户ID）
const myReferralCode = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.referral_code || `USER${currentUser.value.id}`
})

// 推广链接
const referralLink = computed(() => {
  return `${window.location.origin}/register?ref=${myReferralCode.value}`
})

// 二维码
const qrCodeUrl = ref('')

// 推广统计
const stats = reactive({
  visitCount: 0,
  conversionCount: 0,
  totalReward: 0
})

// 海报模式
const posterMode = ref('ai')

// AI海报
const aiPosterDialogVisible = ref(false)
const generatingAIPoster = ref(false)
const aiPosterPreview = ref('')

// 模板海报
const generatingPoster = ref(false)
const templatePosterPreview = ref('')
const posterForm = reactive({
  kindergartenName: '',
  referrerName: '',
  mainTitle: '我已经用上了AI智能幼儿园管理系统',
  subTitle: '给你也分享一个，你可以测试用用很智能',
  contactPhone: '',
  features: ['AI智能招生', '智能排课管理', '家长沟通助手', '数据分析报表'],
  style: 'professional'
})

// 生成二维码
const generateQRCode = async () => {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(referralLink.value, {
      width: 400,
      margin: 2,
      color: {
        dark: 'var(--text-primary)',
        light: 'var(--color-white)'
      }
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败')
  }
}

// 复制推广码
const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(myReferralCode.value)
    ElMessage.success('推广码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 复制推广链接
const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    ElMessage.success('推广链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeUrl.value) return
  
  const link = document.createElement('a')
  link.download = `推广二维码_${myReferralCode.value}.png`
  link.href = qrCodeUrl.value
  link.click()
  ElMessage.success('二维码下载成功')
}

// 打开AI海报生成器
const openAIPosterGenerator = () => {
  aiPosterDialogVisible.value = true
}

// AI海报生成完成
const handleAIPosterGenerated = (posterUrl: string) => {
  aiPosterPreview.value = posterUrl
  ElMessage.success('AI海报生成成功！')
}

// 重新生成AI海报
const regenerateAIPoster = () => {
  aiPosterPreview.value = ''
  openAIPosterGenerator()
}

// 生成模板海报
const generateTemplatePoster = async () => {
  try {
    generatingPoster.value = true
    
    const res = await request.post('/marketing/referrals/generate-poster', {
      referral_code: myReferralCode.value,
      qr_code_url: qrCodeUrl.value,
      ...posterForm
    })
    
    if (res.success) {
      templatePosterPreview.value = res.data.poster_url
      ElMessage.success('海报生成成功！')
    }
  } catch (error) {
    console.error('生成海报失败:', error)
    ElMessage.error('生成海报失败')
  } finally {
    generatingPoster.value = false
  }
}

// 下载海报
const downloadPoster = (posterUrl: string) => {
  const link = document.createElement('a')
  link.download = `推广海报_${myReferralCode.value}.jpg`
  link.href = posterUrl
  link.click()
  ElMessage.success('海报下载成功')
}

// 加载当前用户信息
const loadCurrentUser = async () => {
  try {
    loading.value = true
    const res = await request.get('/auth/me')
    currentUser.value = res.data
    
    // 填充表单默认值
    posterForm.kindergartenName = res.data.kindergarten_name || ''
    posterForm.referrerName = res.data.name || ''
    posterForm.contactPhone = res.data.phone || ''
    
    await generateQRCode()
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 加载推广统计
const loadStats = async () => {
  try {
    const res = await request.get('/marketing/referrals/my-stats')
    Object.assign(stats, res.data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    loadCurrentUser()
    loadStats()
  }
})

onMounted(() => {
  if (visible.value) {
    loadCurrentUser()
    loadStats()
  }
})
</script>

<style scoped lang="scss">
.referral-code-dialog {
  .dialog-content {
    min-height: 600px;
  }
  
  .referral-info-section {
    h3 {
      margin-bottom: var(--text-2xl);
      color: var(--el-text-color-primary);
      font-size: var(--text-xl);
    }
    
    .code-card,
    .link-card {
      background: var(--el-fill-color-light);
      border-radius: var(--spacing-sm);
      padding: var(--text-lg);
      margin-bottom: var(--text-lg);
      
      .code-label,
      .link-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
        margin-bottom: var(--spacing-sm);
      }
      
      .code-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--el-color-primary);
        margin-bottom: var(--text-sm);
        font-family: 'Courier New', monospace;
      }
      
      .link-value {
        font-size: var(--text-sm);
        color: var(--el-text-color-regular);
        margin-bottom: var(--text-sm);
        word-break: break-all;
        line-height: 1.6;
      }
    }
    
    .qrcode-card {
      background: var(--el-fill-color-light);
      border-radius: var(--spacing-sm);
      padding: var(--text-lg);
      margin-bottom: var(--text-lg);
      text-align: center;
      
      h4 {
        margin-bottom: var(--text-lg);
        font-size: var(--text-base);
      }
      
      .qrcode-container {
        width: 200px;
        height: 200px;
        margin: 0 auto var(--text-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: var(--spacing-sm);
        
        img {
          width: 100%;
          height: 100%;
        }
        
        .qrcode-loading {
          color: var(--el-text-color-secondary);
        }
      }
    }
    
    .stats-card {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      border-radius: var(--spacing-sm);
      padding: var(--text-lg);
      color: white;
      
      h4 {
        margin-bottom: var(--text-sm);
        font-size: var(--text-base);
      }
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        
        .label {
          font-size: var(--text-sm);
          opacity: 0.9;
        }
        
        .value {
          font-size: var(--text-lg);
          font-weight: bold;
          
          &.reward {
            color: #ffd700;
          }
        }
      }
    }
  }
  
  .poster-editor-section {
    h3 {
      margin-bottom: var(--text-2xl);
      color: var(--el-text-color-primary);
      font-size: var(--text-xl);
    }
    
    .ai-poster-section {
      .ai-actions {
        margin: var(--text-3xl) 0;
        text-align: center;
      }
    }
    
    .template-poster-section {
      .form-actions {
        margin: var(--text-2xl) 0;
        text-align: center;
      }
    }
    
    .poster-preview {
      margin-top: var(--text-3xl);
      
      h4 {
        margin-bottom: var(--text-lg);
        font-size: var(--text-base);
      }
      
      .preview-container {
        border: var(--border-width-base) solid var(--el-border-color);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        background: var(--el-fill-color-lighter);
        text-align: center;
        
        img {
          max-width: 100%;
          border-radius: var(--spacing-xs);
        }
      }
      
      .preview-actions {
        margin-top: var(--text-lg);
        text-align: center;
      }
    }
  }
}
</style>

