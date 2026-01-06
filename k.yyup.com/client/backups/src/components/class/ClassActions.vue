<template>
  <div class="class-actions">
    <el-button
      v-if="showView"
      type="text"
      size="small"
      @click="handleView"
    >
      查看
    </el-button>
    <el-button
      v-if="showEdit"
      type="text"
      size="small"
      @click="handleEdit"
    >
      编辑
    </el-button>
    <el-button
      v-if="showManageStudents"
      type="text"
      size="small"
      @click="handleManageStudents"
    >
      学生管理
    </el-button>
    <el-button
      v-if="showManageTeachers"
      type="text"
      size="small"
      @click="handleManageTeachers"
    >
      教师管理
    </el-button>
    <el-dropdown v-if="showMore">
      <el-button type="text" size="small">
        更多<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleSetStatus(ClassStatus.ACTIVE)">
            设为在读
          </el-dropdown-item>
          <el-dropdown-item @click="handleSetStatus(ClassStatus.INACTIVE)">
            设为休学
          </el-dropdown-item>
          <el-dropdown-item @click="handleSetStatus(ClassStatus.CLOSED)">
            结业
          </el-dropdown-item>
          <el-dropdown-item @click="handleSetStatus(ClassStatus.PENDING)">
            设为待开班
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleDelete">
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ClassInfo, ClassStatus } from '../../types/class'

export default defineComponent({
  name: 'ClassActions',
  props: {
    classData: {
      type: Object as PropType<ClassInfo>,
      required: true
  },
    showView: {
      type: Boolean,
      default: true
    },
    showEdit: {
      type: Boolean,
      default: true
    },
    showManageStudents: {
      type: Boolean,
      default: true
    },
    showManageTeachers: {
      type: Boolean,
      default: true
    },
    showMore: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    // 查看班级详情
    const handleView = () => {
      emit('view', props.classData)
    }

    // 编辑班级信息
    const handleEdit = () => {
      emit('edit', props.classData)
    }

    // 管理班级学生
    const handleManageStudents = () => {
          emit('manage-students', props.classData)
    }

    // 管理班级教师
    const handleManageTeachers = () => {
          emit('manage-teachers', props.classData)
    }

    // 设置班级状态
    const handleSetStatus = (status: ClassStatus) => {
      emit('set-status', { ...props.classData, status })
    }

    // 删除班级
    const handleDelete = () => {
          emit('delete', props.classData)
    }

    return {
      ClassStatus,
      handleView,
      handleEdit,
      handleManageStudents,
      handleManageTeachers,
      handleSetStatus,
      handleDelete
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.class-actions {
  display: flex;
  align-items: center;
}

.class-actions .el-button {
  margin-left: 0;
  margin-right: var(--spacing-sm);
}
</style> 