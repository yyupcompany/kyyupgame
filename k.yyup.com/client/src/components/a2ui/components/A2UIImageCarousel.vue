<template>
  <div class="a2ui-carousel" :style="carouselStyle">
    <el-carousel
      :trigger="indicatorTrigger"
      :type="card ? 'card' : ''"
      :autoplay="autoplay"
      :interval="interval"
      :indicator-position="indicatorPosition"
      :arrow="arrowPosition"
      :height="carouselHeight"
    >
      <el-carousel-item v-for="image in images" :key="image.id">
        <div class="carousel-item">
          <el-image
            :src="image.src"
            :alt="image.alt || image.title"
            fit="cover"
            class="carousel-image"
          />
          <div v-if="image.title || image.description" class="carousel-caption">
            <h3 v-if="image.title">{{ image.title }}</h3>
            <p v-if="image.description">{{ image.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface CarouselImage {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface Props {
  images: CarouselImage[];
  autoplay?: boolean;
  interval?: number;
  indicatorPosition?: '' | 'outside' | 'none';
  arrowPosition?: 'always' | 'hover' | 'never';
  height?: string | number;
  card?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  interval: 3000,
  indicatorPosition: '',  // 空字符串表示显示在底部内侧
  arrowPosition: 'hover',
  card: false
});

const carouselStyle = computed(() => ({
  width: '100%'
}));

const carouselHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px`;
  }
  return props.height || '400px';
});

const indicatorTrigger = computed(() => props.indicatorPosition === 'inside' ? 'click' : 'hover');
</script>

<style scoped lang="scss">
.a2ui-carousel {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;

  h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}
</style>
