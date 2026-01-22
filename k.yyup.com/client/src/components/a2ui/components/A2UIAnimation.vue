<template>
  <transition
    :name="animationType"
    :duration="duration"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="show"
      class="a2ui-animation"
      :style="animationStyle"
    >
      <slot></slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  show?: boolean;
  type?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate' | 'flip';
  duration?: number;
  delay?: number;
  loop?: boolean;
  autoplay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'fade',
  duration: 300,
  delay: 0,
  loop: false,
  autoplay: false
});

const emit = defineEmits<{
  (e: 'before-enter'): void;
  (e: 'enter'): void;
  (e: 'after-enter'): void;
  (e: 'before-leave'): void;
  (e: 'leave'): void;
  (e: 'after-leave'): void;
}>();

const animationType = computed(() => {
  const typeMap: Record<string, string> = {
    fade: 'fade',
    slide: 'slide',
    zoom: 'zoom',
    bounce: 'bounce',
    rotate: 'rotate',
    flip: 'flip'
  };
  return typeMap[props.type] || 'fade';
});

const animationStyle = computed(() => ({
  transitionDuration: `${props.duration}ms`,
  transitionDelay: `${props.delay}ms`,
  animation: props.loop ? `${animationType.value} ${props.duration}ms infinite` : undefined
}));

const onBeforeEnter = () => emit('before-enter');
const onEnter = () => emit('enter');
const onAfterEnter = () => emit('after-enter');
const onBeforeLeave = () => emit('before-leave');
const onLeave = () => emit('leave');
const onAfterLeave = () => emit('after-leave');
</script>

<style scoped>
.a2ui-animation {
  transition: all 0.3s ease;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind(duration + 'ms');
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform v-bind(duration + 'ms'), opacity v-bind(duration + 'ms');
}

.slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Zoom Animation */
.zoom-enter-active,
.zoom-leave-active {
  transition: transform v-bind(duration + 'ms'), opacity v-bind(duration + 'ms');
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}

/* Bounce Animation */
.bounce-enter-active {
  animation: bounce-in v-bind(duration + 'ms');
}

.bounce-leave-active {
  animation: bounce-out v-bind(duration + 'ms');
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(0);
  }
}

/* Rotate Animation */
.rotate-enter-active,
.rotate-leave-active {
  transition: transform v-bind(duration + 'ms'), opacity v-bind(duration + 'ms');
}

.rotate-enter-from {
  transform: rotate(-180deg);
  opacity: 0;
}

.rotate-leave-to {
  transform: rotate(180deg);
  opacity: 0;
}

/* Flip Animation */
.flip-enter-active,
.flip-leave-active {
  transition: transform v-bind(duration + 'ms'), opacity v-bind(duration + 'ms');
}

.flip-enter-from {
  transform: perspective(400px) rotateX(90deg);
  opacity: 0;
}

.flip-leave-to {
  transform: perspective(400px) rotateX(-90deg);
  opacity: 0;
}
</style>
