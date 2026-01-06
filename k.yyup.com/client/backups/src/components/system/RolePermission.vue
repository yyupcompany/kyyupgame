<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`分配权限 - ${roleName}`"
    width="60%"
    @close="handleClose"
  >
    <div class="permission-container">
      <!-- 权限树形控件 -->
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedKeys"
        :check-strictly="false"
        :highlight-current="true"
        :expand-on-click-node="false"
        @check="handleCheckChange"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span class="permission-type">
              <el-tag size="small" :type="getPermissionTypeTag(data.type)" v-if="data.type !== 'menu'">
                {{ getPermissionTypeLabel(data.type) }}
              </el-tag>
              <el-tag size="small" type="primary" v-else>
                {{ getPermissionTypeLabel(data.type) }}
              </el-tag>
            </span>
          </div>
        </template>
      </el-tree>
      
      <div class="bottom-tip">
        <p>提示：勾选父节点将自动选中所有子节点，取消父节点将自动取消所有子节点</p>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { ElMessage, ElTree } from 'element-plus';
import type { Role, Permission } from '../../types/system';
import { usePermissions } from '../../composables/usePermissions';
import { SYSTEM_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

// 定义el-tag支持的类型
type TagType = 'success' | 'warning' | 'info' | 'danger';

export default defineComponent({
  name: 'RolePermission',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    role: {
      type: Object as PropType<Role | null>,
      default: null
    }
  },
  
  emits: ['update:visible', 'success'],
  
  setup(props, { emit }) {
    // 对话框可见性
    const dialogVisible = ref(props.visible);
    
    // 树形控件引用
    const permissionTreeRef = ref<InstanceType<typeof ElTree>>();
    
    // 加载状态
    const loading = ref(false);
    
    // 权限树形数据
    const permissionTree = ref<Permission[]>([]);
    
    // 已选中的权限ID
    const checkedKeys = ref<string[]>([]);
    
    // 角色名称
    const roleName = computed(() => props.role?.name || '');
    
    // 树形控件属性
    const defaultProps = {
      children: 'children',
      label: 'name'
    };
    
    // 监听visible属性变化
    watch(() => props.visible, (val) => {
      dialogVisible.value = val;
      if (val && props.role) {
        loadPermissionTree();
        loadRolePermissions();
      }
    });
    
    // 监听dialogVisible变化
    watch(dialogVisible, (val) => {
      emit('update:visible', val);
    });
    
    // 监听role变化
    watch(() => props.role, (val) => {
      if (val && dialogVisible.value) {
        loadPermissionTree();
        loadRolePermissions();
      }
    });
    
    // 加载权限树
    const loadPermissionTree = async (): Promise<void> => {
      try {
        // 这里应该调用实际的API
        // const response: ApiResponse = await request.get(SYSTEM_ENDPOINTS.PERMISSION_TREE);
        // permissionTree.value = data;
        
        // 模拟数据
        permissionTree.value = [
          {
            id: '1',
            name: '系统管理',
            code: 'system',
            type: 'menu',
            children: [
              {
                id: '1-1',
                name: '用户管理',
                code: 'system:user',
                type: 'menu',
                children: [
                  {
                    id: '1-1-1',
                    name: '查看用户',
                    code: 'system:user:view',
                    type: 'button'
                  },
                  {
                    id: '1-1-2',
                    name: '新增用户',
                    code: 'system:user:add',
                    type: 'button'
                  },
                  {
                    id: '1-1-3',
                    name: '编辑用户',
                    code: 'system:user:edit',
                    type: 'button'
                  },
                  {
                    id: '1-1-4',
                    name: '删除用户',
                    code: 'system:user:delete',
                    type: 'button'
                  }
                ]
              },
              {
                id: '1-2',
                name: '角色管理',
                code: 'system:role',
                type: 'menu',
                children: [
                  {
                    id: '1-2-1',
                    name: '查看角色',
                    code: 'system:role:view',
                    type: 'button'
                  },
                  {
                    id: '1-2-2',
                    name: '新增角色',
                    code: 'system:role:add',
                    type: 'button'
                  },
                  {
                    id: '1-2-3',
                    name: '编辑角色',
                    code: 'system:role:edit',
                    type: 'button'
                  },
                  {
                    id: '1-2-4',
                    name: '删除角色',
                    code: 'system:role:delete',
                    type: 'button'
                  }
                ]
              }
            ]
          },
          {
            id: '2',
            name: '内容管理',
            code: 'content',
            type: 'menu',
            children: [
              {
                id: '2-1',
                name: '文章管理',
                code: 'content:article',
                type: 'menu',
                children: [
                  {
                    id: '2-1-1',
                    name: '查看文章',
                    code: 'content:article:view',
                    type: 'button'
                  },
                  {
                    id: '2-1-2',
                    name: '新增文章',
                    code: 'content:article:add',
                    type: 'button'
                  },
                  {
                    id: '2-1-3',
                    name: '编辑文章',
                    code: 'content:article:edit',
                    type: 'button'
                  },
                  {
                    id: '2-1-4',
                    name: '删除文章',
                    code: 'content:article:delete',
                    type: 'button'
                  }
                ]
              }
            ]
          }
        ];
      } catch (error) {
        console.error('加载权限树失败:', error);
        ElMessage.error('加载权限树失败');
      }
    };
    
    // 加载角色权限
    const loadRolePermissions = async (): Promise<void> => {
      if (!props.role) return;
      
      try {
        // 这里应该调用实际的API
        // const { data } = await getRolePermissions(props.role.id);
        // checkedKeys.value = data.map(permission => permission.id);
        
        // 模拟数据
        if (props.role.id === '1') {  // 超级管理员拥有所有权限
          checkedKeys.value = ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-2', '1-2-1', '1-2-2', '1-2-3', '1-2-4', '2', '2-1', '2-1-1', '2-1-2', '2-1-3', '2-1-4'];
        } else if (props.role.id === '2') {  // 普通管理员拥有部分权限
          checkedKeys.value = ['1', '1-1', '1-1-1', '1-1-2', '1-1-3', '1-2', '1-2-1', '2', '2-1', '2-1-1', '2-1-2', '2-1-3'];
        } else if (props.role.id === '3') {  // 教师
          checkedKeys.value = ['2', '2-1', '2-1-1', '2-1-2'];
        } else {  // 其他角色
          checkedKeys.value = ['2', '2-1', '2-1-1'];
        }
      } catch (error) {
        console.error('加载角色权限失败:', error);
        ElMessage.error('加载角色权限失败');
      }
    };
    
    // 权限类型标签样式
    const getPermissionTypeTag = (type: string): TagType => {
      const typeMap: Record<string, TagType> = {
        button: 'success',
        api: 'info'
      };
      return typeMap[type] || 'info';
    };
    
    // 权限类型标签文本
    const getPermissionTypeLabel = (type: string): string => {
      const labelMap: Record<string, string> = {
        menu: '菜单',
        button: '按钮',
        api: '接口'
      };
      return labelMap[type] || type;
    };
    
    // 处理权限选中变化
    const handleCheckChange = (): void => {
      if (!permissionTreeRef.value) return;
      
      // 获取当前选中的节点ID
      const selectedKeys = permissionTreeRef.value.getCheckedKeys(false) as string[];
      console.log('当前选中的权限:', selectedKeys);
    };
    
    // 关闭对话框
    const handleClose = (): void => {
      dialogVisible.value = false;
    };
    
    // 提交表单
    const handleSubmit = async (): Promise<void> => {
      if (!permissionTreeRef.value || !props.role) return;
      
      const selectedKeys = permissionTreeRef.value.getCheckedKeys(false) as string[];
      const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys() as string[];
      const allCheckedKeys = [...selectedKeys, ...halfCheckedKeys];
      
      loading.value = true;
      try {
        // 这里应该调用实际的API
        // await updateRolePermissions(props.role.id, allCheckedKeys);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 触发成功事件
        emit('success', {
          ...props.role,
          permissionIds: allCheckedKeys
        });
        
        // 显示成功消息
        ElMessage.success('更新角色权限成功');
        
        // 关闭对话框
        dialogVisible.value = false;
      } catch (error) {
        console.error('更新角色权限失败:', error);
        ElMessage.error('更新角色权限失败');
      } finally {
        loading.value = false;
      }
    };
    
    return {
      dialogVisible,
      permissionTreeRef,
      permissionTree,
      checkedKeys,
      roleName,
      defaultProps,
      loading,
      handleCheckChange,
      handleClose,
      handleSubmit,
      getPermissionTypeTag,
      getPermissionTypeLabel
    };
  }
});
</script>

<style lang="scss" scoped>
.permission-container {
  height: 400px;
  overflow-y: auto;
  
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--text-sm);
    padding-right: var(--spacing-sm);
  
  .bottom-tip {
    margin-top: var(--text-2xl);
    padding: var(--spacing-sm);
    background-color: #f8f8f8;
    border-radius: var(--spacing-xs);
    
    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-xs);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 