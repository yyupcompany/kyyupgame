<template>
  <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

// 本地定义枚举，避免导入错误
enum EnrollmentPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Element Plus 标签类型 - 移除空字符串，使用'primary'作为默认值
type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

export default defineComponent({
  name: 'EnrollmentPlanStatusTag',
  props: {
    status: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // 计算标签类型
    const statusType = computed((): TagType => {
      const typeMap: Record<string, TagType> = {
        [EnrollmentPlanStatus.DRAFT]: 'info',
        [EnrollmentPlanStatus.ACTIVE]: 'success',
        [EnrollmentPlanStatus.PAUSED]: 'warning',
        [EnrollmentPlanStatus.COMPLETED]: 'info',
        [EnrollmentPlanStatus.CANCELLED]: 'danger'
      }
      
      return typeMap[props.status] || 'primary'
    })
    
    // 计算状态显示文本
    const statusText = computed(() => {
      const textMap: Record<string, string> = {
        [EnrollmentPlanStatus.DRAFT]: '草稿',
        [EnrollmentPlanStatus.ACTIVE]: '招生中',
        [EnrollmentPlanStatus.PAUSED]: '已暂停',
        [EnrollmentPlanStatus.COMPLETED]: '已完成',
        [EnrollmentPlanStatus.CANCELLED]: '已取消'
      }
      
      return textMap[props.status] || props.status
    })
    
    return {
      statusType,
      statusText
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
</style> 