<template>
  <div class="a2ui-rich-text" :style="wrapperStyle">
    <div
      class="rich-content"
      :class="{ 'expanded': isExpanded }"
      :style="contentStyle"
      v-html="sanitizedHtml"
    />
    <div v-if="showExpand && isOverflow" class="expand-button">
      <el-button type="primary" text @click="toggleExpand">
        {{ isExpanded ? '收起' : '展开更多' }}
        <el-icon>
          <component :is="isExpanded ? ArrowUp : ArrowDown" />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
  maxHeight?: string | number;
  showExpand?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showExpand: true
});

const isExpanded = ref(false);
const isOverflow = ref(false);

const sanitizedHtml = computed(() => {
  return DOMPurify.sanitize(props.html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style']
  });
});

const wrapperStyle = computed(() => ({
  width: '100%'
}));

const contentStyle = computed(() => {
  const style: Record<string, any> = {};
  if (props.maxHeight && !isExpanded.value) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    style.overflow = 'hidden';
  }
  return style;
});

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function checkOverflow() {
  nextTick(() => {
    const element = document.querySelector('.rich-content');
    if (element) {
      isOverflow.value = element.scrollHeight > element.clientHeight;
    }
  });
}

onMounted(() => {
  checkOverflow();
});
</script>

<style scoped lang="scss">
.a2ui-rich-text {
  width: 100%;
}

.rich-content {
  line-height: 1.8;
  font-size: 16px;
  color: var(--el-text-color-primary);

  :deep(p) {
    margin: 8px 0;
  }

  :deep(ul), :deep(ol) {
    padding-left: 24px;
    margin: 8px 0;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(h1) { font-size: 24px; }
  :deep(h2) { font-size: 20px; }
  :deep(h3) { font-size: 18px; }
}

.expand-button {
  margin-top: 8px;
  text-align: center;
}
</style>
