<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`分配角色 - ${userData?.realName || ''}`"
    :width="isDesktop ? '650px' : '95%'"
    @close="handleClose"
    class="user-roles-dialog"
  >
    <div class="roles-container">
      <el-transfer
        v-model="selectedRoleIds"
        :data="roleList"
        :props="{
          key: 'id',
          label: 'name'
        }"
        :titles="['可选角色', '已选角色']"
        :button-texts="['移除', '添加']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
      >
        <template #left-footer>
          <div class="transfer-footer">
            <p>左侧为可选角色</p>
          </div>
        </template>
        <template #right-footer>
          <div class="transfer-footer">
            <p>右侧为已分配角色</p>
          </div>
        </template>
      </el-transfer>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import type { User, Role } from '../../types/system';

export interface TransferRole extends Role {
  disabled?: boolean;
}

export default defineComponent({
  name: 'UserRoles',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object as () => User | null,
      default: null
    }
  },
  
  emits: ['update:visible', 'success'],
  
  setup(props, { emit }) {
    // 对话框可见性
    const dialogVisible = ref(props.visible);
    
    // 加载状态
    const loading = ref(false);
    
    // 角色列表
    const roleList = ref<TransferRole[]>([]);
    
    // 已选择的角色ID
    const selectedRoleIds = ref<string[]>([]);
    
    // 响应式计算属性
    const isDesktop = computed(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 768
      }
      return true
    });
    
    // 监听visible属性变化
    watch(() => props.visible, (val) => {
      dialogVisible.value = val;
      if (val && props.userData) {
        loadRoleList();
      }
    });
    
    // 监听dialogVisible变化
    watch(dialogVisible, (val) => {
      emit('update:visible', val);
    });
    
    // 监听userData变化
    watch(() => props.userData, (val) => {
      if (val && dialogVisible.value) {
        loadRoleList();
      }
    });
    
    // 加载角色列表
    const loadRoleList = async (): Promise<void> => {
      try {
        // 这里应该调用实际的API
        // const { data } = await getRoles();
        // roleList.value = data;
        
        // 模拟数据
        roleList.value = [
          {
            id: '1',
            name: '超级管理员',
            description: '系统最高权限',
            disabled: true // 超级管理员角色不可分配
          },
          {
            id: '2',
            name: '普通管理员',
            description: '系统管理权限'
          },
          {
            id: '3',
            name: '教师',
            description: '教师角色'
          },
          {
            id: '4',
            name: '家长',
            description: '家长角色'
          }
        ];
        
        // 设置已选择的角色
        if (props.userData?.roles) {
          selectedRoleIds.value = props.userData.roles.map(role => role.id);
        } else {
          selectedRoleIds.value = [];
        }
      } catch (error) {
        console.error('加载角色列表失败:', error);
        ElMessage.error('加载角色列表失败');
      }
    };
    
    // 关闭对话框
    const handleClose = (): void => {
      dialogVisible.value = false;
    };
    
    // 提交表单
    const handleSubmit = async (): Promise<void> => {
      if (!props.userData) return;
      
      loading.value = true;
      try {
        // 这里应该调用实际的API
        // await updateUserRoles(props.userData.id, selectedRoleIds.value);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 获取完整的角色对象
        const roles = roleList.value.filter(role => 
          selectedRoleIds.value.includes(role.id)
        );
        
        // 触发成功事件
        emit('success', {
          ...props.userData,
          roles
        });
        
        // 显示成功消息
        ElMessage.success('更新用户角色成功');
        
        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error('更新用户角色失败:', error);
        ElMessage.error('更新用户角色失败');
      } finally {
        loading.value = false;
      }
    };
    
    return {
      dialogVisible,
      roleList,
      selectedRoleIds,
      loading,
      isDesktop,
      handleClose,
      handleSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;
@use '../../pages/system/user-management-ux-styles.scss' as *;

.user-roles-dialog {
  :deep(.el-dialog) {
    border-radius: var(--border-radius);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    
    @media (max-width: var(--breakpoint-md)) {
      width: 95% !important;
      margin: 5vh auto !important;
    }
  }
}

.roles-container {
  display: flex;
  justify-content: center;
  margin: var(--app-gap-lg) 0;
  
  :deep(.el-transfer) {
    width: 100%;
    
    .el-transfer-panel {
      border-radius: var(--app-gap-xs);
      border: 2px solid var(--border-color);
      transition: all var(--transition-normal) ease;
      
      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.15);
      }
      
      .el-transfer-panel__header {
        background: var(--gradient-light);
        border-bottom: var(--z-index-dropdown) solid var(--border-color);
        border-radius: var(--app-gap-xs) var(--text-sm) 0 0;
        padding: var(--border-radius) var(--spacing-xl);
        
        .el-transfer-panel__title {
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .el-checkbox {
          .el-checkbox__input.is-checked {
            .el-checkbox__inner {
              background: var(--primary-color);
              border-color: var(--primary-color);
            }
          }
        }
      }
      
      .el-transfer-panel__body {
        padding: var(--border-radius);
        
        .el-transfer-panel__list {
          .el-transfer-panel__item {
            padding: var(--app-gap-xs) var(--text-lg);
            border-radius: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            border: var(--border-width) solid var(--border-color-light);
            transition: all var(--transition-normal) ease;
            
            &:hover {
              background: var(--bg-secondary);
              border-color: var(--border-color);
              transform: translateY(var(--z-index-below));
            }
            
            .el-checkbox {
              .el-checkbox__label {
                font-weight: 600;
                color: var(--text-secondary);
              }
              
              .el-checkbox__input.is-checked {
                .el-checkbox__inner {
                  background: var(--primary-color);
                  border-color: var(--primary-color);
                }
              }
            }
          }
        }
      }
      
      .el-transfer-panel__footer {
        border-top: var(--z-index-dropdown) solid var(--border-color);
        padding: var(--app-gap-xs) var(--text-lg);
        background: var(--bg-secondary);
        border-radius: 0 0 var(--text-sm) var(--text-sm);
      }
    }
    
    .el-transfer__buttons {
      margin: 0 var(--text-3xl);
      display: flex;
      flex-direction: column;
      gap: var(--app-gap-xs);
      
      .el-button {
        border-radius: var(--spacing-sm);
        padding: var(--app-gap-xs) var(--text-lg);
        font-weight: 600;
        transition: all var(--transition-normal) ease;
        
        &:hover {
          transform: translateY(var(--transform-hover-lift));
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
        }
        
        &.el-button--primary {
          background: var(--gradient-primary);
          border: none;
          
          &:hover {
            box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }
  
  .transfer-footer {
    margin-top: var(--text-lg);
    text-align: center;
    
    p {
      color: var(--text-placeholder);
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
    }
  }
  
  @media (max-width: var(--breakpoint-md)) {
    margin: var(--border-radius) 0;
    
    :deep(.el-transfer) {
      .el-transfer__buttons {
        margin: var(--border-radius) 0;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-xs);
  padding-top: var(--text-lg);
  border-top: var(--z-index-dropdown) solid var(--border-color-light);
  
  .el-button {
    min-height: var(--button-height-lg);
    padding: var(--app-gap-xs) var(--text-3xl);
    border-radius: var(--spacing-sm);
    font-weight: 600;
    transition: all var(--transition-normal) ease;
    
    &:hover {
      transform: translateY(var(--transform-hover-lift));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
    }
    
    &.el-button--primary {
      background: var(--gradient-primary);
      border: none;
      
      &:hover {
        box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(102, 126, 234, 0.3);
      }
    }
  }
  
  @media (max-width: var(--breakpoint-sm)) {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style> 