<template>
  <div class="a2ui-star-rating">
    <div class="star-container">
      <span
        v-for="star in maxStars"
        :key="star"
        class="star"
        :class="{ active: star <= currentRating, clickable: !readonly }"
        @click="handleClick(star)"
        @mouseenter="handleHover(star)"
        @mouseleave="handleLeave"
      >
        <svg
          viewBox="0 0 24 24"
          :fill="star <= (hoverRating || currentRating) ? '#FFD700' : 'none'"
          stroke="#FFD700"
          stroke-width="2"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </span>
    </div>
    <span v-if="showValue" class="rating-value">{{ currentRating }}/{{ maxStars }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue?: number;
  maxStars?: number;
  readonly?: boolean;
  showValue?: boolean;
  size?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  maxStars: 5,
  readonly: false,
  showValue: false,
  size: '24px'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

const currentRating = computed(() => props.modelValue);
const hoverRating = ref(0);

const handleClick = (star: number) => {
  if (props.readonly) return;
  
  emit('update:modelValue', star);
  emit('change', star);
};

const handleHover = (star: number) => {
  if (props.readonly) return;
  hoverRating.value = star;
};

const handleLeave = () => {
  hoverRating.value = 0;
};
</script>

<style scoped>
.a2ui-star-rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.star-container {
  display: inline-flex;
  gap: 4px;
}

.star {
  display: inline-flex;
  align-items: center;
  width: v-bind(size);
  height: v-bind(size);
  cursor: default;
  transition: transform 0.2s ease;
}

.star.clickable {
  cursor: pointer;
}

.star.clickable:hover {
  transform: scale(1.2);
}

.star svg {
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
}

.rating-value {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}
</style>
