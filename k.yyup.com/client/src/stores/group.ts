import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import groupApi, { Group, GroupUser, GroupStatistics } from '@/api/modules/group';

/**
 * 集团管理Store
 */
export const useGroupStore = defineStore('group', () => {
  // 状态
  const currentGroup = ref<Group | null>(null);
  const myGroups = ref<Group[]>([]);
  const groupList = ref<Group[]>([]);
  const groupUsers = ref<GroupUser[]>([]);
  const groupStatistics = ref<GroupStatistics | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const hasGroup = computed(() => myGroups.value.length > 0);
  const isGroupAdmin = computed(() => {
    if (!currentGroup.value) return false;
    // 检查当前用户是否是集团管理员
    return groupUsers.value.some(gu => gu.role === 1 || gu.role === 2);
  });

  /**
   * 获取当前用户的集团列表
   */
  async function fetchMyGroups() {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.getMyGroups();
      myGroups.value = response.data;
      
      // 如果有集团，默认选中第一个
      if (myGroups.value.length > 0 && !currentGroup.value) {
        currentGroup.value = myGroups.value[0];
      }
      
      return myGroups.value;
    } catch (err: any) {
      error.value = err.message || '获取集团列表失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取集团列表（分页）
   */
  async function fetchGroupList(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: number;
    type?: number;
  }) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.getGroupList(params);
      groupList.value = response.data.items;
      return response.data;
    } catch (err: any) {
      error.value = err.message || '获取集团列表失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取集团详情
   */
  async function fetchGroupDetail(id: number) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.getGroupDetail(id);
      currentGroup.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.message || '获取集团详情失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建集团
   */
  async function createGroup(data: any) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.createGroup(data);
      
      // 刷新我的集团列表
      await fetchMyGroups();
      
      return response.data;
    } catch (err: any) {
      error.value = err.message || '创建集团失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新集团信息
   */
  async function updateGroup(id: number, data: any) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.updateGroup(id, data);
      
      // 更新当前集团
      if (currentGroup.value?.id === id) {
        currentGroup.value = response.data;
      }
      
      // 更新列表中的集团
      const index = myGroups.value.findIndex(g => g.id === id);
      if (index !== -1) {
        myGroups.value[index] = response.data;
      }
      
      return response.data;
    } catch (err: any) {
      error.value = err.message || '更新集团失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 删除集团
   */
  async function deleteGroup(id: number) {
    try {
      loading.value = true;
      error.value = null;
      await groupApi.deleteGroup(id);
      
      // 从列表中移除
      myGroups.value = myGroups.value.filter(g => g.id !== id);
      
      // 如果删除的是当前集团，清空当前集团
      if (currentGroup.value?.id === id) {
        currentGroup.value = myGroups.value.length > 0 ? myGroups.value[0] : null;
      }
    } catch (err: any) {
      error.value = err.message || '删除集团失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取集团用户列表
   */
  async function fetchGroupUsers(groupId: number) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.getGroupUsers(groupId);
      groupUsers.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.message || '获取集团用户失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 添加集团用户
   */
  async function addGroupUser(groupId: number, data: any) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.addGroupUser(groupId, data);
      
      // 刷新用户列表
      await fetchGroupUsers(groupId);
      
      return response.data;
    } catch (err: any) {
      error.value = err.message || '添加用户失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新集团用户权限
   */
  async function updateGroupUser(groupId: number, userId: number, data: any) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.updateGroupUser(groupId, userId, data);
      
      // 更新列表中的用户
      const index = groupUsers.value.findIndex(gu => gu.userId === userId);
      if (index !== -1) {
        groupUsers.value[index] = response.data;
      }
      
      return response.data;
    } catch (err: any) {
      error.value = err.message || '更新用户权限失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 移除集团用户
   */
  async function removeGroupUser(groupId: number, userId: number) {
    try {
      loading.value = true;
      error.value = null;
      await groupApi.removeGroupUser(groupId, userId);
      
      // 从列表中移除
      groupUsers.value = groupUsers.value.filter(gu => gu.userId !== userId);
    } catch (err: any) {
      error.value = err.message || '移除用户失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取集团统计数据
   */
  async function fetchGroupStatistics(groupId: number) {
    try {
      loading.value = true;
      error.value = null;
      const response = await groupApi.getGroupStatistics(groupId);
      groupStatistics.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.message || '获取统计数据失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 切换当前集团
   */
  function switchGroup(group: Group) {
    currentGroup.value = group;
  }

  /**
   * 清空状态
   */
  function clearState() {
    currentGroup.value = null;
    myGroups.value = [];
    groupList.value = [];
    groupUsers.value = [];
    groupStatistics.value = null;
    error.value = null;
  }

  return {
    // 状态
    currentGroup,
    myGroups,
    groupList,
    groupUsers,
    groupStatistics,
    loading,
    error,
    
    // 计算属性
    hasGroup,
    isGroupAdmin,
    
    // 方法
    fetchMyGroups,
    fetchGroupList,
    fetchGroupDetail,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroupUsers,
    addGroupUser,
    updateGroupUser,
    removeGroupUser,
    fetchGroupStatistics,
    switchGroup,
    clearState,
  };
});

