<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    size="small"
  >
    {{ statusText }}
  </el-tag>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { ClassStatus } from '@/types/class'

export default defineComponent({
  name: 'ClassStatusTag',
  props: {
    status: {
      type: String as PropType<ClassStatus>,
      required: true
    },
    effect: {
      type: String as PropType<'light' | 'dark' | 'plain'>,
      default: 'light'
    }
  },
  setup(props) {
    // 根据状态确定标签类型
    const tagType = computed(() => {
      switch (props.status) {
        case ClassStatus.ACTIVE:
          return 'success'
        case ClassStatus.INACTIVE:
          return 'warning'
        case ClassStatus.PENDING:
          return 'info'
        case ClassStatus.CLOSED:
          return 'danger'
        default:
          return 'info'
      }
    })

    // 根据状态确定显示文本
    const statusText = computed(() => {
      switch (props.status) {
        case ClassStatus.ACTIVE:
          return '在读'
        case ClassStatus.INACTIVE:
          return '休学'
        case ClassStatus.PENDING:
          return '待开班'
        case ClassStatus.CLOSED:
          return '已结业'
        default:
          return '未知状态'
      }
    })

    return {
      tagType,
      statusText
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
</style> 