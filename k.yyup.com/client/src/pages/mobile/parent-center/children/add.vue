<template>
  <MobileMainLayout
    title="添加孩子"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <ChildEditForm />
  </MobileMainLayout>
</template>

<script setup lang="ts">
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import ChildEditForm from './edit.vue'
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
</style>