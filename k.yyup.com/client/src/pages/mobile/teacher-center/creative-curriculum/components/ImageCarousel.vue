<template>
  <div class="mobile-image-carousel">
    <!-- 主轮播区域 -->
    <van-swipe
      :autoplay="autoplay"
      :duration="300"
      :show-indicators="showIndicators"
      :initial-swipe="currentIndex"
      @change="handleSwipeChange"
      class="carousel-swipe"
      :style="{ height: carouselHeight }"
    >
      <van-swipe-item
        v-for="(image, index) in images"
        :key="image.id"
        class="swipe-item"
        @click="handleImageClick(image, index)"
      >
        <div class="image-container">
          <van-image
            :src="image.url"
            :alt="image.description"
            fit="contain"
            class="carousel-image"
            :lazy-load="true"
            @load="handleImageLoad"
            @error="handleImageError"
          >
            <template #loading>
              <van-loading type="spinner" color="#1989fa" vertical>
                加载中...
              </van-loading>
            </template>
            <template #error>
              <div class="image-error">
                <van-icon name="warning-o" size="40" />
                <p>图片加载失败</p>
              </div>
            </template>
          </van-image>

          <!-- 图片描述覆盖层 -->
          <div v-if="image.description" class="image-overlay">
            <div class="image-description">
              <van-tag type="primary" size="small">{{ image.description }}</van-tag>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="image-actions">
            <van-button
              size="small"
              type="primary"
              icon="eye-o"
              round
              @click.stop="previewImage(image, index)"
            >
              预览
            </van-button>
            <van-button
              size="small"
              type="success"
              icon="download"
              round
              @click.stop="downloadImage(image)"
            >
              下载
            </van-button>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 自定义指示器 -->
    <div v-if="customIndicators" class="custom-indicators">
      <div class="indicator-info">
        <span class="current-index">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total-count">{{ images.length }}</span>
      </div>
      <div class="indicator-dots">
        <span
          v-for="(_, index) in images"
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <!-- 缩略图列表 -->
    <div v-if="showThumbnails && images.length > 1" class="thumbnail-container">
      <van-scroll-view
        scroll-x
        class="thumbnail-scroll"
        :show-scrollbar="false"
      >
        <div class="thumbnail-list">
          <div
            v-for="(image, index) in images"
            :key="image.id"
            class="thumbnail-item"
            :class="{ active: index === currentIndex }"
            @click="goToSlide(index)"
          >
            <van-image
              :src="image.url"
              :alt="image.description"
              fit="cover"
              class="thumbnail-image"
              :lazy-load="true"
            />
            <div v-if="index === currentIndex" class="thumbnail-active">
              <van-icon name="play" size="12" />
            </div>
          </div>
        </div>
      </van-scroll-view>
    </div>

    <!-- 控制按钮 -->
    <div v-if="showControls" class="carousel-controls">
      <van-button-group>
        <van-button
          size="small"
          icon="replay"
          @click="previousImage"
          :disabled="currentIndex === 0"
        >
          上一张
        </van-button>
        <van-button
          size="small"
          :icon="autoplay ? 'pause' : 'play'"
          @click="toggleAutoplay"
        >
          {{ autoplay ? '暂停' : '播放' }}
        </van-button>
        <van-button
          size="small"
          @click="nextImage"
          :disabled="currentIndex === images.length - 1"
        >
          下一张
          <van-icon name="arrow" />
        </van-button>
      </van-button-group>
    </div>

    <!-- 图片预览弹窗 -->
    <van-image-preview
      v-model:show="showPreview"
      :images="previewImages"
      :start-position="previewIndex"
      :closeable="true"
      :show-index="true"
      @change="handlePreviewChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface Image {
  id: string
  description: string
  url: string
  order: number
  thumbnail?: string // 缩略图URL
}

interface Props {
  images: Image[]
  autoplay?: number
  showIndicators?: boolean
  customIndicators?: boolean
  showThumbnails?: boolean
  showControls?: boolean
  height?: string
  loop?: boolean
  allowPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: 0,
  showIndicators: true,
  customIndicators: false,
  showThumbnails: true,
  showControls: true,
  height: '300px',
  loop: true,
  allowPreview: true
})

const emit = defineEmits<{
  'change': [index: number, image: Image]
  'image-click': [image: Image, index: number]
  'load': [image: Image, index: number]
  'error': [image: Image, error: Event]
}>()

// 响应式数据
const currentIndex = ref(0)
const autoplay = ref(props.autoplay)
const showPreview = ref(false)
const previewIndex = ref(0)

// 计算属性
const carouselHeight = computed(() => props.height)

const previewImages = computed(() => {
  return props.images.map(img => img.thumbnail || img.url)
})

const currentImage = computed(() => {
  return props.images[currentIndex.value] || null
})

// 处理轮播切换
function handleSwipeChange(index: number) {
  currentIndex.value = index
  const image = props.images[index]
  if (image) {
    emit('change', index, image)
  }
}

// 切换到指定幻灯片
function goToSlide(index: number) {
  currentIndex.value = index
  emit('change', index, props.images[index])
}

// 上一张图片
function previousImage() {
  if (currentIndex.value > 0) {
    goToSlide(currentIndex.value - 1)
  } else if (props.loop) {
    goToSlide(props.images.length - 1)
  }
}

// 下一张图片
function nextImage() {
  if (currentIndex.value < props.images.length - 1) {
    goToSlide(currentIndex.value + 1)
  } else if (props.loop) {
    goToSlide(0)
  }
}

// 切换自动播放
function toggleAutoplay() {
  if (autoplay.value > 0) {
    autoplay.value = 0
    showToast('已暂停自动播放')
  } else {
    autoplay.value = props.autoplay || 3000
    showToast('已开始自动播放')
  }
}

// 处理图片点击
function handleImageClick(image: Image, index: number) {
  emit('image-click', image, index)

  if (props.allowPreview) {
    previewImage(image, index)
  }
}

// 预览图片
function previewImage(image: Image, index: number) {
  previewIndex.value = index
  showPreview.value = true
}

// 处理预览切换
function handlePreviewChange(index: number) {
  goToSlide(index)
}

// 下载图片
async function downloadImage(image: Image) {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = image.url
    link.download = `image_${image.id}.jpg`
    link.target = '_blank'

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showSuccessToast('图片下载已开始')
  } catch (error) {
    showFailToast('下载失败')
    console.error('Download error:', error)
  }
}

// 处理图片加载完成
function handleImageLoad(event: Event) {
  const image = currentImage.value
  if (image) {
    emit('load', image, currentIndex.value)
  }
}

// 处理图片加载错误
function handleImageError(event: Event) {
  const image = currentImage.value
  if (image) {
    emit('error', image, event)
    showToast('图片加载失败')
  }
}

// 监听图片变化
watch(
  () => props.images,
  (newImages) => {
    if (newImages.length === 0) {
      currentIndex.value = 0
    } else if (currentIndex.value >= newImages.length) {
      currentIndex.value = newImages.length - 1
    }
  }
)

// 暴露方法给父组件
defineExpose({
  previousImage,
  nextImage,
  goToSlide,
  toggleAutoplay,
  previewImage,
  currentIndex: computed(() => currentIndex.value),
  currentImage
})
</script>

<style scoped lang="scss">
.mobile-image-carousel {
  position: relative;
  width: 100%;
  background: var(--van-background-2);
  border-radius: var(--van-radius-lg);
  overflow: hidden;

  .carousel-swipe {
    :deep(.van-swipe-item) {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }

    .swipe-item {
      position: relative;
      cursor: pointer;

      .image-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .carousel-image {
          width: 100%;
          height: 100%;
          :deep(.van-image__img) {
            object-fit: contain;
            border-radius: var(--van-radius-md);
          }
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--van-padding-sm);
          color: var(--van-text-color-3);
          padding: var(--van-padding-xl);

          .van-icon {
            color: var(--van-warning-color);
          }
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          padding: var(--van-padding-md);

          .image-description {
            text-align: center;
          }
        }

        .image-actions {
          position: absolute;
          top: 50%;
          right: var(--van-padding-md);
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: var(--van-padding-sm);
          opacity: 0;
          transition: opacity 0.3s ease;

          .van-button {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        }

        &:hover .image-actions {
          opacity: 1;
        }
      }
    }

    :deep(.van-swipe__indicators) {
      bottom: var(--van-padding-sm);

      .van-swipe__indicator {
        background-color: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(0, 0, 0, 0.2);

        &--active {
          background-color: var(--van-primary-color);
        }
      }
    }
  }

  .custom-indicators {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-sm) var(--van-padding-md);
    background: rgba(0, 0, 0, 0.1);

    .indicator-info {
      font-size: var(--van-font-size-sm);
      color: var(--van-text-color-2);
      font-weight: 500;

      .current-index {
        color: var(--van-primary-color);
        font-weight: 700;
      }

      .separator {
        margin: 0 2px;
      }
    }

    .indicator-dots {
      display: flex;
      gap: 6px;

      .indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          width: 16px;
          border-radius: 3px;
          background-color: var(--van-primary-color);
        }
      }
    }
  }

  .thumbnail-container {
    background: var(--van-background-2);
    border-top: 1px solid var(--van-border-color);

    .thumbnail-scroll {
      :deep(.van-scroll-view__content) {
        display: flex;
        padding: var(--van-padding-sm);
      }
    }

    .thumbnail-list {
      display: flex;
      gap: var(--van-padding-xs);

      .thumbnail-item {
        position: relative;
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        border-radius: var(--van-radius-md);
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;

        .thumbnail-image {
          width: 100%;
          height: 100%;
          :deep(.van-image__img) {
            object-fit: cover;
          }
        }

        .thumbnail-active {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--van-primary-color);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.active {
          border-color: var(--van-primary-color);
          box-shadow: 0 0 0 2px rgba(25, 137, 255, 0.2);
        }
      }
    }
  }

  .carousel-controls {
    display: flex;
    justify-content: center;
    padding: var(--van-padding-md);
    background: var(--van-background-3);
    border-top: 1px solid var(--van-border-color);

    :deep(.van-button-group) {
      .van-button {
        flex: 1;
        font-size: var(--van-font-size-sm);
      }
    }
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-image-carousel {
    .carousel-swipe {
      .swipe-item {
        .image-container {
          .image-actions {
            opacity: 1; // 移动端始终显示操作按钮
            right: var(--van-padding-sm);

            .van-button {
              transform: scale(0.9);
            }
          }
        }
      }
    }

    .thumbnail-container {
      .thumbnail-list {
        .thumbnail-item {
          width: 50px;
          height: 50px;
        }
      }
    }

    .carousel-controls {
      padding: var(--van-padding-sm);

      :deep(.van-button-group) {
        .van-button {
          font-size: var(--van-font-size-xs);
          padding: var(--van-padding-xs) var(--van-padding-sm);
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-image-carousel {
    :deep(.van-swipe__indicators) {
      .van-swipe__indicator {
        background-color: rgba(0, 0, 0, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.2);

        &--active {
          background-color: var(--van-primary-color);
        }
      }
    }

    .thumbnail-container {
      background: var(--van-background-1);
    }
  }
}
</style>