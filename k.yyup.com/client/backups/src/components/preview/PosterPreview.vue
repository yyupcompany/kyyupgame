<template>
  <div class="poster-preview">
    <div class="poster-container" :class="`theme-${theme}`">
      <div class="poster-background">
        <div class="bg-pattern"></div>
        <div class="bg-overlay"></div>
      </div>
      
      <div class="poster-content">
        <!-- 头部logo区域 -->
        <div class="poster-header">
          <div class="logo-section">
            <div class="logo">
              <img :src="logoUrl" alt="幼儿园logo" />
            </div>
            <div class="school-name">{{ schoolName }}</div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
          <div class="content-text">
            {{ formatContent(content) }}
          </div>
          
          <!-- 装饰元素 -->
          <div class="decorations">
            <div class="decoration-item star">⭐</div>
            <div class="decoration-item heart">💖</div>
            <div class="decoration-item flower">🌸</div>
          </div>
        </div>

        <!-- 营销配置区域 -->
        <div class="marketing-section" v-if="hasMarketingConfig">
          <div class="marketing-tags">
            <div v-if="marketingConfig?.groupBuy?.enabled" class="marketing-tag group-buy">
              <span class="tag-icon">👥</span>
              <span class="tag-text">{{ marketingConfig.groupBuy.minPeople }}人团购</span>
            </div>
            <div v-if="marketingConfig?.collect?.enabled" class="marketing-tag collect">
              <span class="tag-icon">⭐</span>
              <span class="tag-text">集赞{{ marketingConfig.collect.target }}个</span>
            </div>
            <div v-if="marketingConfig?.coupon?.enabled" class="marketing-tag coupon">
              <span class="tag-icon">🎫</span>
              <span class="tag-text">优惠券</span>
            </div>
            <div v-if="marketingConfig?.referral?.enabled" class="marketing-tag referral">
              <span class="tag-icon">🎁</span>
              <span class="tag-text">推荐有礼</span>
            </div>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="poster-footer">
          <div class="contact-info">
            <div class="contact-item" v-if="phone">
              <span class="icon">📞</span>
              <span class="text">{{ phone }}</span>
            </div>
            <div class="contact-item" v-if="address">
              <span class="icon">📍</span>
              <span class="text">{{ address }}</span>
            </div>
          </div>
          
          <div class="qr-section" v-if="showQR">
            <div class="qr-code">
              <img v-if="qrcodeUrl" :src="qrcodeUrl" alt="二维码" class="qr-image" />
              <div v-else class="qr-placeholder">
                <span>二维码</span>
              </div>
            </div>
            <div class="qr-text">扫码了解更多</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主题切换 -->
    <div class="theme-selector">
      <div class="theme-title">选择海报主题：</div>
      <div class="theme-options">
        <div 
          v-for="themeOption in themes" 
          :key="themeOption.value"
          class="theme-option"
          :class="{ active: theme === themeOption.value }"
          @click="$emit('theme-change', themeOption.value)"
        >
          <div class="theme-preview" :class="`preview-${themeOption.value}`"></div>
          <span class="theme-name">{{ themeOption.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MarketingConfig {
  groupBuy?: {
    enabled: boolean
    minPeople: number
    price: number
    deadline: string
  }
  collect?: {
    enabled: boolean
    target: number
    rewardType: string
    discountPercent: number
  }
  coupon?: {
    enabled: boolean
    type: string
    quantity: number
    condition: string
  }
  referral?: {
    enabled: boolean
    reward: number
    maxRewards: number
  }
}

interface Props {
  content: string
  theme?: string
  schoolName?: string
  logoUrl?: string
  phone?: string
  address?: string
  showQR?: boolean
  qrcodeUrl?: string
  marketingConfig?: MarketingConfig
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'warm',
  schoolName: '阳光幼儿园',
  logoUrl: '/api/placeholder/60/60',
  phone: '400-123-4567',
  address: '北京市朝阳区xxx街道xxx号',
  showQR: true,
  qrcodeUrl: '',
  marketingConfig: () => ({})
})

const emit = defineEmits<{
  'theme-change': [theme: string]
}>()

const themes = [
  { value: 'warm', label: '温馨' },
  { value: 'fresh', label: '清新' },
  { value: 'elegant', label: '优雅' },
  { value: 'playful', label: '活泼' }
]

const formatContent = (content: string) => {
  // 移除标签和过长的内容，适合海报显示
  return content
    .replace(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g, '')
    .replace(/\n\n/g, '\n')
    .trim()
    .substring(0, 120) + (content.length > 120 ? '...' : '')
}

// 检查是否有启用的营销配置
const hasMarketingConfig = computed(() => {
  if (!props.marketingConfig) return false

  return (
    props.marketingConfig.groupBuy?.enabled ||
    props.marketingConfig.collect?.enabled ||
    props.marketingConfig.coupon?.enabled ||
    props.marketingConfig.referral?.enabled
  )
})
</script>

<style lang="scss" scoped>
.poster-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--text-2xl);

  .poster-container {
    width: 300px;
    height: 400px;
    position: relative;
    border-radius: var(--text-sm);
    overflow: hidden;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-heavy);

    .poster-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      .bg-pattern {
        width: 100%;
        height: 100%;
        opacity: 0.1;
      }

      .bg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }

    .poster-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--text-2xl);

      .poster-header {
        text-align: center;
        margin-bottom: var(--text-2xl);

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);

          .logo {
            width: 50px;
            height: 50px;
            border-radius: var(--radius-full);
            overflow: hidden;
            border: 2px solid var(--white-alpha-80);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .school-name {
            font-size: var(--text-xl);
            font-weight: 700;
            color: white;
            text-shadow: 0 2px var(--spacing-xs) var(--black-alpha-30);
          }
        }
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;

        .content-text {
          background: var(--white-alpha-95);
          border-radius: var(--text-sm);
          padding: var(--text-lg);
          font-size: var(--text-base);
          line-height: 1.6;
          color: var(--text-primary);
          text-align: center;
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
          backdrop-filter: blur(10px);
        }

        .decorations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;

          .decoration-item {
            position: absolute;
            font-size: var(--text-2xl);
            animation: float 3s ease-in-out infinite;

            &.star {
              top: 10%;
              right: 10%;
              animation-delay: 0s;
            }

            &.heart {
              top: 60%;
              left: 5%;
              animation-delay: 1s;
            }

            &.flower {
              bottom: 20%;
              right: 15%;
              animation-delay: 2s;
            }
          }
        }
      }

      .marketing-section {
        margin: var(--text-sm) 0;

        .marketing-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
          justify-content: center;

          .marketing-tag {
            display: flex;
            align-items: center;
            gap: var(--spacing-2xs);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--text-sm);
            font-size: var(--text-2xs);
            font-weight: 600;
            color: white;
            text-shadow: 0 var(--border-width-base) 2px var(--black-alpha-30);
            backdrop-filter: blur(5px);

            .tag-icon {
              font-size: var(--text-xs);
            }

            &.group-buy {
              background: linear-gradient(135deg, #ff6b6b, #ee5a52);
              box-shadow: 0 2px var(--spacing-sm) rgba(255, 107, 107, 0.3);
            }

            &.collect {
              background: linear-gradient(135deg, #feca57, #ff9ff3);
              box-shadow: 0 2px var(--spacing-sm) rgba(254, 202, 87, 0.3);
            }

            &.coupon {
              background: linear-gradient(135deg, #48dbfb, #0abde3);
              box-shadow: 0 2px var(--spacing-sm) rgba(72, 219, 251, 0.3);
            }

            &.referral {
              background: linear-gradient(135deg, #1dd1a1, #10ac84);
              box-shadow: 0 2px var(--spacing-sm) rgba(29, 209, 161, 0.3);
            }
          }
        }
      }

      .poster-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: var(--text-sm);

        .contact-info {
          flex: 1;

          .contact-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            margin-bottom: var(--spacing-xs);
            font-size: var(--text-xs);
            color: white;
            text-shadow: 0 var(--border-width-base) 2px var(--black-alpha-50);

            .icon {
              font-size: var(--text-sm);
            }
          }
        }

        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);

          .qr-code {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;

            .qr-image {
              width: 100%;
              height: 100%;
              border-radius: var(--spacing-xs);
              object-fit: cover;
            }

            .qr-placeholder {
              font-size: var(--text-2xs);
              color: var(--text-secondary);
              text-align: center;
            }
          }

          .qr-text {
            font-size: var(--text-2xs);
            color: white;
            text-shadow: 0 var(--border-width-base) 2px var(--black-alpha-50);
          }
        }
      }
    }

    // 主题样式
    &.theme-warm {
      .poster-background {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
      }
    }

    &.theme-fresh {
      .poster-background {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }
    }

    &.theme-elegant {
      .poster-background {
        background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
      }
    }

    &.theme-playful {
      .poster-background {
        background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
      }
    }
  }

  .theme-selector {
    .theme-title {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
      text-align: center;
    }

    .theme-options {
      display: flex;
      gap: var(--text-sm);

      .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-xs);
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--spacing-sm);
        transition: all 0.3s ease;

        &:hover, &.active {
          background: #f0f7ff;
        }

        .theme-preview {
          width: 30px;
          height: var(--button-height-lg);
          border-radius: var(--spacing-xs);
          border: 2px solid #ddd;

          &.preview-warm {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          }

          &.preview-fresh {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          }

          &.preview-elegant {
            background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
          }

          &.preview-playful {
            background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
          }
        }

        .theme-name {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        &.active .theme-preview {
          border-color: var(--primary-color);
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
