<template>
  <div class="a2ui-image" :style="wrapperStyle">
    <el-image
      :src="src"
      :alt="alt"
      :fit="fit"
      :style="imageStyle"
      :preview-src-list="preview ? [src] : []"
      :hide-on-click-modal="true"
    >
      <template #error>
        <div class="image-placeholder">
          <el-icon :size="48"><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';

interface Props {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  rounded?: boolean;
  shadow?: boolean;
  preview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  fit: 'cover',
  rounded: true,
  shadow: false,
  preview: true
});

const wrapperStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: props.rounded ? '8px' : '0',
  boxShadow: props.shadow ? '0 2px 12px rgba(0, 0, 0, 0.1)' : 'none',
  overflow: 'hidden'
}));

const imageStyle = computed(() => ({
  width: '100%',
  height: '100%'
}));
</script>

<style scoped lang="scss">
.a2ui-image {
  display: inline-block;
  max-width: 100%;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 120px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);

  span {
    margin-top: 8px;
    font-size: 12px;
  }
}
</style>
