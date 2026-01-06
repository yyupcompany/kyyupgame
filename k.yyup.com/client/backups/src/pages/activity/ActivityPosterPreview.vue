<template>
  <div class="activity-poster-preview-page">
    <div class="header">
      <div class="header-content">
        <el-button @click="goBack" type="primary" plain>
          ← 返回活动详情
        </el-button>
        <div class="title-section">
          <h2>{{ activityTitle || '活动海报预览' }}</h2>
          <p v-if="activityDescription">{{ activityDescription }}</p>
        </div>
        <div class="actions">
          <el-button @click="downloadPoster" type="success">
            📥 下载海报
          </el-button>
          <el-button @click="sharePoster" type="warning">
            📤 分享海报
          </el-button>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="preview-section">
        <div class="poster-container">
          <DraggableResizableQR
            :posterContent="posterContent"
            :currentTheme="currentTheme"
            :kindergartenInfo="kindergartenInfo"
            :marketingConfig="marketingConfig"
            :qrcodeUrl="qrcodeUrl"
            :showControls="true"
            :showTips="true"
            @qr-position-change="onQRPositionChange"
            @qr-size-change="onQRSizeChange"
            @qr-scale-change="onQRScaleChange"
          />
        </div>

        <div class="theme-selector">
          <h4>选择海报主题</h4>
          <div class="theme-options">
            <div
              v-for="theme in themes"
              :key="theme.value"
              :class="['theme-option', { active: currentTheme === theme.value }]"
              @click="currentTheme = theme.value"
            >
              <div :class="['theme-preview', theme.value]"></div>
              <span>{{ theme.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="config-section">
        <div class="activity-info">
          <h3>活动信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="活动名称">{{ activityTitle }}</el-descriptions-item>
            <el-descriptions-item label="活动时间">{{ formatTime(startTime, endTime) }}</el-descriptions-item>
            <el-descriptions-item label="活动地点">{{ location || '待定' }}</el-descriptions-item>
            <el-descriptions-item label="参与人数">{{ capacity || '不限' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="marketing-config">
          <h3>营销配置</h3>
          <div class="marketing-items">
            <div v-if="marketingConfig.groupBuy?.enabled" class="marketing-item">
              <el-tag type="danger" size="large">
                👥 {{ marketingConfig.groupBuy.minPeople }}人团购
              </el-tag>
              <span class="marketing-desc">满{{ marketingConfig.groupBuy.minPeople }}人享受团购价</span>
            </div>

            <div v-if="marketingConfig.collect?.enabled" class="marketing-item">
              <el-tag type="warning" size="large">
                ⭐ 集赞{{ marketingConfig.collect.target }}个
              </el-tag>
              <span class="marketing-desc">集满{{ marketingConfig.collect.target }}个赞享受{{ marketingConfig.collect.discountPercent }}折优惠</span>
            </div>

            <div v-if="marketingConfig.coupon?.enabled" class="marketing-item">
              <el-tag type="primary" size="large">
                🎫 优惠券
              </el-tag>
              <span class="marketing-desc">限量{{ marketingConfig.coupon.quantity }}张，{{ marketingConfig.coupon.condition }}</span>
            </div>

            <div v-if="marketingConfig.referral?.enabled" class="marketing-item">
              <el-tag type="success" size="large">
                🎁 推荐有礼
              </el-tag>
              <span class="marketing-desc">推荐成功奖励{{ marketingConfig.referral.reward }}元，最多{{ marketingConfig.referral.maxRewards }}次</span>
            </div>
          </div>
          
          <div v-if="!hasMarketingConfig" class="no-marketing">
            <el-empty description="暂无营销配置" :image-size="80" />
          </div>
        </div>

        <div class="kindergarten-info">
          <h3>园所信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="园所名称">{{ kindergartenInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ kindergartenInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="园所地址">{{ kindergartenInfo.address }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ kindergartenInfo.contactPerson || '招生老师' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="share-section">
          <h3>分享海报</h3>
          <div class="share-content">
            <div class="share-link">
              <label>分享链接：</label>
              <el-input v-model="shareUrl" readonly>
                <template #append>
                  <el-button @click="sharePoster">
                    📋 复制
                  </el-button>
                </template>
              </el-input>
            </div>

            <div class="share-qrcode">
              <label>扫码分享：</label>
              <div class="qrcode-container">
                <img v-if="qrcodeUrl && !isGeneratingQR" :src="qrcodeUrl" alt="分享二维码" class="qrcode-image" />
                <div v-else class="qrcode-placeholder">
                  <div class="loading-spinner">⏳</div>
                  <span>生成中...</span>
                </div>
                <div class="qrcode-actions" v-if="qrcodeUrl">
                  <el-button size="small" @click="downloadQRCode">
                    📥 下载二维码
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 暂时移除图标导入以避免依赖问题
// import { ArrowLeft, Download, Share, User, Star, Ticket, Gift } from '@element-plus/icons-vue'
import DraggableResizableQR from '@/components/preview/DraggableResizableQR.vue'
import { getKindergartenBasicInfo } from '@/services/kindergarten-info.service'

const route = useRoute()
const router = useRouter()

// 活动信息
const activityTitle = ref(route.query.activityTitle as string || '')
const activityDescription = ref(route.query.activityDescription as string || '')
const startTime = ref(route.query.startTime as string || '')
const endTime = ref(route.query.endTime as string || '')
const location = ref(route.query.location as string || '')
const capacity = ref(route.query.capacity as string || '')

// 海报配置
const currentTheme = ref('warm')
const themes = [
  { value: 'warm', label: '温馨' },
  { value: 'fresh', label: '清新' },
  { value: 'elegant', label: '优雅' },
  { value: 'playful', label: '活泼' }
]

// 营销配置
const marketingConfig = ref<any>({})

// 园所信息
const kindergartenInfo = ref({
  name: '阳光幼儿园',
  phone: '400-123-4567',
  address: '北京市朝阳区阳光街123号',
  logoUrl: '/api/placeholder/60/60',
  contactPerson: '招生老师'
})

// 分享相关状态
const shareUrl = ref('')
const qrcodeUrl = ref('')
const isGeneratingQR = ref(false)

// 计算属性
const posterContent = computed(() => {
  let content = activityTitle.value
  if (activityDescription.value) {
    content += '\n\n' + activityDescription.value
  }
  return content
})

const hasMarketingConfig = computed(() => {
  return marketingConfig.value.groupBuy?.enabled ||
         marketingConfig.value.collect?.enabled ||
         marketingConfig.value.coupon?.enabled ||
         marketingConfig.value.referral?.enabled
})

// 方法
const goBack = () => {
  router.back()
}

const formatTime = (start: string, end: string) => {
  if (!start) return '时间待定'
  const startDate = new Date(start).toLocaleDateString()
  const endDate = end ? new Date(end).toLocaleDateString() : ''
  return endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate
}

const downloadPoster = () => {
  ElMessage.info('下载功能开发中...')
}

const sharePoster = () => {
  // 生成分享链接
  const currentShareUrl = `${window.location.origin}/activity/poster-preview${window.location.search}`

  // 复制到剪贴板
  navigator.clipboard.writeText(currentShareUrl).then(() => {
    ElMessage.success('分享链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接')
  })
}

// 生成二维码
const generateQRCode = async (url: string) => {
  try {
    isGeneratingQR.value = true

    // 使用简单的二维码生成API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    qrcodeUrl.value = qrApiUrl

    console.log('✅ 二维码生成成功:', qrApiUrl)
  } catch (error) {
    console.error('❌ 二维码生成失败:', error)
    ElMessage.error('二维码生成失败')
  } finally {
    isGeneratingQR.value = false
  }
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrcodeUrl.value) {
    ElMessage.warning('请先生成二维码')
    return
  }

  const link = document.createElement('a')
  link.href = qrcodeUrl.value
  link.download = `活动海报二维码-${activityTitle.value || '未命名'}.png`
  link.click()
  ElMessage.success('二维码下载成功')
}

// 初始化
onMounted(async () => {
  // 解析营销配置
  if (route.query.marketingConfig) {
    try {
      marketingConfig.value = JSON.parse(route.query.marketingConfig as string)
    } catch (error) {
      console.warn('Failed to parse marketing config:', error)
    }
  }

  // 获取园所信息
  try {
    const info = await getKindergartenBasicInfo()
    if (info) {
      kindergartenInfo.value = info
    }
  } catch (error) {
    console.warn('Failed to get kindergarten info:', error)
  }

  // 生成分享链接和二维码
  shareUrl.value = `${window.location.origin}/activity/poster-preview${window.location.search}`
  await generateQRCode(shareUrl.value)
})

// 二维码事件处理
const onQRPositionChange = (position: { x: number, y: number }) => {
  console.log('二维码位置变化:', position)
}

const onQRSizeChange = (size: { width: number, height: number }) => {
  console.log('二维码大小变化:', size)
}

const onQRScaleChange = (scale: number) => {
  console.log('二维码缩放变化:', scale)
}
</script>

<style lang="scss" scoped>
.activity-poster-preview-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);

  .header {
    background: white;
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    padding: var(--text-2xl) 0;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--text-2xl);
      display: flex;
      align-items: center;
      gap: var(--text-2xl);

      .title-section {
        flex: 1;
        
        h2 {
          margin: 0 0 5px 0;
          color: var(--text-primary);
          font-size: var(--text-3xl);
        }
        
        p {
          margin: 0;
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .actions {
        display: flex;
        gap: var(--spacing-2xl);
      }
    }
  }

  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-8xl) var(--text-2xl);
    display: flex;
    gap: var(--spacing-8xl);
    align-items: flex-start;

    .preview-section {
      flex: 0 0 auto;
      
      .poster-container {
        margin-bottom: var(--text-2xl);
      }

      .theme-selector {
        background: white;
        padding: var(--text-2xl);
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

        h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .theme-options {
          display: flex;
          gap: var(--spacing-2xl);

          .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-base);
            padding: var(--spacing-2xl);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: var(--bg-secondary);
            }

            &.active {
              background: #e6f7ff;
              border: 2px solid var(--primary-color);
            }

            .theme-preview {
              width: var(--icon-size); height: var(--icon-size);
              border-radius: var(--spacing-xs);
              
              &.warm { background: linear-gradient(135deg, #ff9a9e, #fecfef); }
              &.fresh { background: linear-gradient(135deg, #a8edea, #fed6e3); }
              &.elegant { background: linear-gradient(135deg, #d299c2, #fef9d7); }
              &.playful { background: linear-gradient(135deg, #89f7fe, #66a6ff); }
            }

            span {
              font-size: var(--text-sm);
              color: var(--text-secondary);
            }
          }
        }
      }
    }

    .config-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--text-2xl);

      .activity-info,
      .marketing-config,
      .kindergarten-info,
      .share-section {
        background: white;
        padding: var(--text-2xl);
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

        h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          font-size: var(--text-lg);
        }
      }

      .marketing-items {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4xl);

        .marketing-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-2xl);

          .marketing-desc {
            color: var(--text-secondary);
            font-size: var(--text-sm);
          }
        }
      }

      .no-marketing {
        text-align: center;
        padding: var(--text-2xl) 0;
      }

      .share-content {
        display: flex;
        flex-direction: column;
        gap: var(--text-2xl);

        .share-link {
          label {
            display: block;
            margin-bottom: var(--spacing-sm);
            color: var(--text-primary);
            font-weight: 500;
          }
        }

        .share-qrcode {
          label {
            display: block;
            margin-bottom: var(--spacing-sm);
            color: var(--text-primary);
            font-weight: 500;
          }

          .qrcode-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--text-sm);
            padding: var(--text-2xl);
            background: var(--bg-hover);
            border-radius: var(--spacing-sm);

            .qrcode-image {
              width: 150px;
              height: 150px;
              border: 3px solid white;
              border-radius: var(--spacing-sm);
              box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
            }

            .qrcode-placeholder {
              width: 150px;
              height: 150px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: var(--spacing-sm);
              background: white;
              border: 2px dashed #ddd;
              border-radius: var(--spacing-sm);
              color: var(--text-secondary);

              .loading-spinner {
                font-size: var(--text-3xl);
                animation: spin 1s linear infinite;
              }

              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            }

            .qrcode-actions {
              display: flex;
              gap: var(--spacing-2xl);
            }
          }
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .activity-poster-preview-page {
    .header .header-content {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-4xl);
    }

    .content {
      flex-direction: column;
      padding: var(--text-2xl) 15px;
    }
  }
}
</style>
