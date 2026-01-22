<template>
  <MobileSubPageLayout title="添加孩子" back-path="/mobile/parent-center">
    <ChildEditForm />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import ChildEditForm from './edit.vue'
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';
</style>