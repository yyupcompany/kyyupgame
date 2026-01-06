<template>
  <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { TagType } from '../../types/activity'

export default defineComponent({
  name: 'ActivityStatusTag',
  props: {
    status: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    // 将数字状态转换为字符串状态
    const normalizedStatus = computed(() => {
      if (typeof props.status === 'number') {
        const numStatusMap: Record<number, string> = {
          0: 'PLANNED',      // 计划中
          1: 'ONGOING',      // 进行中
          2: 'FULL',         // 已满员
          3: 'IN_PROGRESS',  // 进行中
          4: 'ENDED',        // 已结束
          5: 'CANCELLED'     // 已取消
        }
        return numStatusMap[props.status] || 'UNKNOWN'
      }
      return String(props.status).toUpperCase()
    })

    // 根据状态返回对应的Tag类型
    const statusType = computed<TagType>(() => {
      const typeMap: Record<string, TagType> = {
        'PLANNED': 'info',
        'ONGOING': 'success',
        'FULL': 'warning',
        'IN_PROGRESS': 'success',
        'ENDED': 'info',
        'CANCELLED': 'danger',
        'UPCOMING': 'warning'
      }

      return typeMap[normalizedStatus.value] || 'info'
    })

    // 状态文本显示
    const statusText = computed(() => {
      const textMap: Record<string, string> = {
        'PLANNED': '计划中',
        'ONGOING': '进行中',
        'FULL': '已满员',
        'IN_PROGRESS': '进行中',
        'ENDED': '已结束',
        'CANCELLED': '已取消',
        'UPCOMING': '即将开始'
      }

      return textMap[normalizedStatus.value] || '未知状态'
    })

    return {
      statusType,
      statusText
    }
  }
})
</script>

<style scoped lang="scss">
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";
</style> 