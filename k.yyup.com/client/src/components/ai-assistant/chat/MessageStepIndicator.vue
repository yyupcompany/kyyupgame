<template>
  <!-- Content removed to disable the component -->
</template>

<script setup lang="ts">
// Script remains to prevent breaking imports, but does nothing.
interface Props {
  status?: 'completed' | 'active' | 'pending' | 'failed'
  isFirst?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending',
  isFirst: false,
  isLast: false
})
</script>

<style scoped lang="scss">
/* All styles removed to disable the component */
</style>


