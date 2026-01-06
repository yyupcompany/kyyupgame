<template>
  <van-card
    :class="['mobile-card', { 'is-clickable': clickable }]"
    :thumb="thumb"
    :thumb-mode="thumbMode"
    @click="handleClick"
  >
    <template #title>
      <slot name="title">{{ title }}</slot>
    </template>

    <template #desc>
      <slot name="desc">{{ desc }}</slot>
    </template>

    <template #tags>
      <slot name="tags"></slot>
    </template>

    <template #footer>
      <div class="card-footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </van-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  desc?: string
  thumb?: string
  thumbMode?: string
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  thumbMode: 'aspectFit',
  clickable: false
})

const emit = defineEmits<{
  click: [event: Event]
}>()

const handleClick = (event: Event) => {
  emit('click', event)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &.is-clickable {
    cursor: pointer;
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
      opacity: 0.8;
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

:deep(.van-card__thumb) {
  width: 80px;
  height: 80px;
}

:deep(.van-card__content) {
  min-height: 80px;
}
</style>
