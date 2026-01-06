<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    size="small"
  >
    {{ typeText }}
  </el-tag>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { ClassType } from '@/types/class'

export default defineComponent({
  name: 'ClassTypeTag',
  props: {
    type: {
      type: String as PropType<ClassType>,
      required: true
    },
    effect: {
      type: String as PropType<'light' | 'dark' | 'plain'>,
      default: 'light'
    }
  },
  setup(props) {
    // 根据类型确定标签颜色类型
    const tagType = computed(() => {
      switch (props.type) {
        case ClassType.FULL_TIME:
          return 'success'
        case ClassType.HALF_TIME:
          return 'warning'
        case ClassType.SPECIAL:
          return 'info'
        default:
          return 'info'
      }
    })

    // 根据类型确定显示文本
    const typeText = computed(() => {
      switch (props.type) {
        case ClassType.FULL_TIME:
          return '全日制'
        case ClassType.HALF_TIME:
          return '半日制'
        case ClassType.SPECIAL:
          return '特色班'
        default:
          return '未知类型'
      }
    })

    return {
      tagType,
      typeText
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
</style> 