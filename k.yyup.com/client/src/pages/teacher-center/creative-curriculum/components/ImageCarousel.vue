<template>
  <div class="image-carousel">
    <!-- 主图显示 -->
    <div class="carousel-main">
      <img
        v-if="currentImage"
        :src="currentImage.url"
        :alt="currentImage.description"
        class="main-image"
      />
      <div v-else class="image-placeholder">
        <UnifiedIcon name="default" />
        <p>图片加载中...</p>
      </div>

      <!-- 图片描述 -->
      <div v-if="currentImage" class="image-description">
        <p>{{ currentImage.description }}</p>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="carousel-controls">
      <el-button
        :disabled="currentIndex === 0"
        @click="previousImage"
        circle
      >
        <UnifiedIcon name="ArrowLeft" />
      </el-button>

      <div class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>

      <el-button
        :disabled="currentIndex === images.length - 1"
        @click="nextImage"
        circle
      >
        <UnifiedIcon name="ArrowRight" />
      </el-button>
    </div>

    <!-- 缩略图列表 -->
    <div class="carousel-thumbnails">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      >
        <img :src="image.url" :alt="image.description" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Picture, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

interface Image {
  id: string;
  description: string;
  url: string;
  order: number;
}

interface Props {
  images: Image[];
}

const props = defineProps<Props>();

const currentIndex = ref(0);

const currentImage = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images[currentIndex.value];
  }
  return null;
});

function previousImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function nextImage() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
}
</script>

<style scoped lang="scss">
.image-carousel {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);

  .carousel-main {
    position: relative;
    background: var(--bg-page);
    border-radius: var(--spacing-sm);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2xl);
      color: var(--text-secondary);

      .el-icon {
        font-size: var(--text-5xl);
      }
    }

    .image-description {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--black-alpha-60);
      color: white;
      padding: var(--text-sm);
      font-size: var(--text-base);
      max-min-height: 60px; height: auto;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--text-2xl);

    .image-counter {
      font-size: var(--text-base);
      color: var(--text-secondary);
      min-width: auto;
      text-align: center;
    }
  }

  .carousel-thumbnails {
    display: flex;
    gap: var(--spacing-2xl);
    overflow-x: auto;
    padding: var(--spacing-2xl) 0;

    .thumbnail {
      flex-shrink: 0;
      width: var(--avatar-size); height: var(--avatar-size);
      border-radius: var(--spacing-xs);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:hover {
        border-color: var(--primary-color);
      }

      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 var(--spacing-sm) rgba(64, 158, 255, 0.3);
      }
    }
  }
}
</style>

