<template>
  <div class="activity-actions">
    <el-button type="primary" size="small" @click="handleView">查看详情</el-button>
    <el-button type="success" size="small" @click="handleEdit">编辑</el-button>
    <el-dropdown>
      <el-button size="small">
        更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleChangeStatus">
            {{ getStatusActionText() }}
          </el-dropdown-item>
          <el-dropdown-item @click="handleParticipants">
            管理参与者
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleDelete" class="text-danger">
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ActivityActions',
  components: {
    ArrowDown
  },
  props: {
    activity: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'edit', 'delete', 'change-status', 'manage-participants'],
  setup(props, { emit }) {
    // 获取状态操作文本
    const getStatusActionText = () => {
      const status = props.activity.status
      
      switch (status) {
        case 'ONGOING':
          return '设为已结束'
        case 'UPCOMING':
          return '设为进行中'
        case 'ENDED':
          return '重新激活'
        case 'CANCELLED':
          return '重新激活'
        default:
          return '更改状态'
      }
    }
    
    // 查看详情
    const handleView = () => {
      emit('view', props.activity)
    }
    
    // 编辑活动
    const handleEdit = () => {
      emit('edit', props.activity)
    }
    
    // 删除活动
    const handleDelete = () => {
      emit('delete', props.activity)
    }
    
    // 更改状态
    const handleChangeStatus = () => {
      emit('change-status', props.activity)
    }
    
    // 管理参与者
    const handleParticipants = () => {
      emit('manage-participants', props.activity)
    }
    
    return {
      getStatusActionText,
      handleView,
      handleEdit,
      handleDelete,
      handleChangeStatus,
      handleParticipants
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.activity-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.text-danger {
  color: var(--el-color-danger);
}
</style> 