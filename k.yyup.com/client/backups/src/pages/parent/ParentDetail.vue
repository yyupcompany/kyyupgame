<template>
  <div class="user-management-container parent-detail-page">
    <div class="detail-header">
      <div class="user-profile">
        <div class="user-avatar parent-avatar">
          <span class="avatar-text">{{ parent?.name ? parent.name.charAt(0).toUpperCase() : '家' }}</span>
        </div>
        <div class="user-info">
          <h1 class="user-name">{{ parent?.name || '未知家长' }}</h1>
          <div class="user-meta">
            <span class="user-phone">{{ parent?.phone || '未留手机号' }}</span>
            <span v-if="parent?.status" class="user-status" :class="getParentStatusClass(parent.status)">{{ parent.status }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <el-button class="action-btn" @click="goBack">返回</el-button>
          <el-button type="primary" class="action-btn" @click="handleEdit">编辑</el-button>
        </div>
      </div>
    </div>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else-if="parent" class="detail-content">
        <div class="content-header">
          <h3 class="content-title">基本信息</h3>
        </div>
        <div class="content-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">姓名</div>
              <div class="info-value">{{ parent.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">手机号</div>
              <div class="info-value">{{ parent.phone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">状态</div>
              <div class="info-value">
                <span class="status-tag" :class="getParentStatusClass(parent.status)">{{ parent.status }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间</div>
              <div class="info-value">{{ parent.registerDate }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">来源渠道</div>
              <div class="info-value">{{ parent.source }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">居住地址</div>
              <div class="info-value">{{ parent.address }}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">备注</div>
              <div class="info-value">{{ parent.remark || '无' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 子女信息区域 -->
      <div v-if="parent" class="detail-content children-section">
        <div class="content-header">
          <h3 class="content-title">子女信息</h3>
          <el-button type="primary" size="small" class="action-btn" @click="handleAddChild">添加孩子</el-button>
        </div>
        <div class="content-body">
          <div class="children-table-container">
            <el-table
              v-if="parent.children && parent.children.length > 0"
              :data="parent.children"
              class="children-table"
              stripe
            >
              <el-table-column prop="name" label="姓名" min-width="100">
                <template #default="scope">
                  <div class="child-name-cell">
                    <div class="child-avatar">
                      {{ scope.row.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="child-name">{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gender" label="性别" width="80" />
              <el-table-column prop="age" label="年龄" width="80" />
              <el-table-column prop="birthday" label="出生日期" width="120" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <span class="child-status-tag" :class="getChildStatusClass(scope.row.status)">
                    {{ scope.row.status }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <div class="table-actions">
                    <button class="table-action-btn edit-btn" @click="handleEditChild(scope.row)">
                      <i class="edit-icon">✏️</i>
                      编辑
                    </button>
                    <button class="table-action-btn delete-btn" @click="handleDeleteChild(scope.row)">
                      <i class="delete-icon">🗑️</i>
                      删除
                    </button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="children-empty-state">
              <div class="empty-icon">👶</div>
              <div class="empty-title">暂无孩子信息</div>
              <div class="empty-description">还没有添加孩子信息，点击上方按钮添加第一个孩子吧！</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 跟进记录区域 -->
      <div v-if="parent" class="detail-content follow-up-section">
        <div class="content-header">
          <h3 class="content-title">跟进记录</h3>
          <el-button type="primary" size="small" class="action-btn" @click="handleAddFollowUp">添加跟进</el-button>
        </div>
        <div class="content-body">
          <div class="follow-up-table-container">
            <el-table
              v-if="parent.followUpRecords && parent.followUpRecords.length > 0"
              :data="parent.followUpRecords"
              class="follow-up-table"
              stripe
            >
              <el-table-column prop="title" label="标题" min-width="150">
                <template #default="scope">
                  <div class="follow-up-title">
                    <i class="follow-up-icon">📝</i>
                    {{ scope.row.title }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="150" />
              <el-table-column prop="creator" label="创建人" width="100" />
              <el-table-column label="类型" width="100">
                <template #default="scope">
                  <span class="follow-up-type-tag" :class="getFollowUpTypeClass(scope.row.type)">
                    {{ scope.row.type }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <div class="table-actions">
                    <button class="table-action-btn view-btn" @click="handleViewFollowUp(scope.row)">
                      <i class="view-icon">👁️</i>
                      查看
                    </button>
                    <button class="table-action-btn delete-btn" @click="handleDeleteFollowUp(scope.row)">
                      <i class="delete-icon">🗑️</i>
                      删除
                    </button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="follow-up-empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-title">暂无跟进记录</div>
              <div class="empty-description">还没有创建跟进记录，点击上方按钮创建第一条跟进记录吧！</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 活动参与区域 -->
      <div v-if="parent" class="detail-content activities-section">
        <div class="content-header">
          <h3 class="content-title">活动参与</h3>
          <el-button type="primary" size="small" class="action-btn" @click="handleAssignActivity">分配活动</el-button>
        </div>
        <div class="content-body">
          <div class="activities-table-container">
            <el-table
              v-if="parent.activities && parent.activities.length > 0"
              :data="parent.activities"
              class="activities-table"
              stripe
            >
              <el-table-column prop="title" label="活动名称" min-width="200">
                <template #default="scope">
                  <div class="activity-title">
                    <i class="activity-icon">🎉</i>
                    {{ scope.row.title }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="活动时间" width="150" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <span class="activity-status-tag" :class="getActivityStatusClass(scope.row.status)">
                    {{ scope.row.status }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <div class="table-actions">
                    <button class="table-action-btn view-btn" @click="handleViewActivity(scope.row)">
                      <i class="view-icon">👁️</i>
                      查看
                    </button>
                    <button class="table-action-btn cancel-btn" @click="handleCancelActivity(scope.row)">
                      <i class="cancel-icon">❌</i>
                      取消
                    </button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="activities-empty-state">
              <div class="empty-icon">🎪</div>
              <div class="empty-title">暂无活动参与记录</div>
              <div class="empty-description">还没有参与任何活动，点击上方按钮分配活动吧！</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-container">
        <el-empty description="未找到家长信息" />
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </div>
    
    <!-- 跟进记录详情对话框 -->
    <el-dialog
      v-model="showFollowUpDetail"
      title="跟进记录详情"
      :width="isDesktop ? '600px' : '95%'"
      class="follow-up-detail-dialog"
    >
      <div v-if="currentFollowUp" class="follow-up-detail">
        <div class="detail-info-grid">
          <div class="detail-info-item">
            <div class="detail-label">标题</div>
            <div class="detail-value">{{ currentFollowUp.title }}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-label">时间</div>
            <div class="detail-value">{{ currentFollowUp.time }}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-label">创建人</div>
            <div class="detail-value">{{ currentFollowUp.creator }}</div>
          </div>
          <div class="detail-info-item">
            <div class="detail-label">类型</div>
            <div class="detail-value">
              <span class="follow-up-type-tag" :class="getFollowUpTypeClass(currentFollowUp.type)">
                {{ currentFollowUp.type }}
              </span>
            </div>
          </div>
          <div class="detail-info-item full-width">
            <div class="detail-label">内容</div>
            <div class="detail-value detail-content-text">{{ currentFollowUp.content || '无详细内容' }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { PARENT_ENDPOINTS } from '@/api/endpoints';
import { request } from '@/utils/request';
import type { ApiResponse } from '@/api/endpoints';

interface Child {
  id: number;
  name: string;
  gender: string;
  age: number;
  birthday: string;
  status: string;
}

interface FollowUpRecord {
  id: number;
  title: string;
  time: string;
  creator: string;
  type: string;
  content?: string;
}

interface Activity {
  id: number;
  title: string;
  time: string;
  status: string;
}

interface Parent {
  id: number;
  name: string;
  phone: string;
  status: string;
  registerDate: string;
  source: string;
  address: string;
  avatar?: string;
  remark?: string;
  children: Child[];
  followUpRecords: FollowUpRecord[];
  activities: Activity[];
}

export default defineComponent({
  name: 'ParentDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const parent = ref<Parent | null>(null);
    const showFollowUpDetail = ref(false);
    const currentFollowUp = ref<FollowUpRecord | null>(null);
    
    // 响应式计算属性
    const isDesktop = computed(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 768
      }
      return true
    });
    
    const parentId = Number(route.params.id);
    
    // 获取家长详情
    const fetchParentDetail = async () => {
      loading.value = true;
      
      try {
        const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parentId));
        
        if (response.success && response.data) {
          parent.value = response.data;
          
          // 获取孩子信息
          try {
            const childrenResponse: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_CHILDREN(parentId));
            if (childrenResponse.success && childrenResponse.data) {
              parent.value.children = childrenResponse.data;
            }
          } catch (error) {
            console.warn('获取孩子信息失败:', error);
          }
          
          // 获取沟通记录
          try {
            const commResponse: ApiResponse = await request.get(PARENT_ENDPOINTS.COMMUNICATION_HISTORY(parentId));
            if (commResponse.success && commResponse.data) {
              parent.value.followUpRecords = commResponse.data;
            }
          } catch (error) {
            console.warn('获取沟通记录失败:', error);
          }
        } else {
          ElMessage.error(response.message || '获取家长详情失败');
        }
      } catch (error) {
        console.error('获取家长详情失败:', error);
        ElMessage.error('获取家长详情失败');
      } finally {
        loading.value = false;
      }
    };
    
    // 获取家长状态类型
    const getParentStatusClass = (status: string): string => {
      switch (status) {
        case '正式家长':
        case 'ACTIVE':
          return 'status-active'
        case '潜在家长':
        case 'PENDING':
          return 'status-pending'
        case '已退学':
        case 'INACTIVE':
          return 'status-inactive'
        case '已拒绝':
        case 'REJECTED':
          return 'status-rejected'
        default:
          return 'status-pending'
      }
    }
    
    // 获取孩子状态类型
    const getChildStatusClass = (status: string): string => {
      switch (status) {
        case '已入学':
        case 'ENROLLED':
          return 'child-status-enrolled'
        case '未入学':
        case 'PENDING':
          return 'child-status-pending'
        case '已毕业':
        case 'GRADUATED':
          return 'child-status-graduated'
        case '已退学':
        case 'WITHDRAWN':
          return 'child-status-withdrawn'
        default:
          return 'child-status-pending'
      }
    }
    
    // 获取跟进类型类名
    const getFollowUpTypeClass = (type: string): string => {
      switch (type) {
        case '电话咨询':
        case 'PHONE_CALL':
          return 'follow-up-phone'
        case '实地参观':
        case 'VISIT':
          return 'follow-up-visit'
        case '邮件联系':
        case 'EMAIL':
          return 'follow-up-email'
        case '会议沟通':
        case 'MEETING':
          return 'follow-up-meeting'
        default:
          return 'follow-up-other'
      }
    }
    
    // 获取活动状态类型
    const getActivityStatusClass = (status: string): string => {
      switch (status) {
        case '已报名':
        case 'ACTIVE':
          return 'activity-status-active'
        case '待确认':
        case 'PENDING':
          return 'activity-status-pending'
        case '已完成':
        case 'COMPLETED':
          return 'activity-status-completed'
        case '已取消':
        case 'CANCELED':
          return 'activity-status-canceled'
        default:
          return 'activity-status-pending'
      }
    }
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    // 编辑家长信息
    const handleEdit = () => {
      router.push(`/parent/edit/${parentId}`);
    };
    
    // 添加孩子
    const handleAddChild = () => {
      ElMessage.info('添加孩子功能待实现');
      // 实际项目中可以跳转到添加孩子页面或打开对话框
    };
    
    // 编辑孩子信息
    const handleEditChild = (child: Child) => {
      ElMessage.info(`编辑孩子 ${child.name} 信息功能待实现`);
    };
    
    // 删除孩子
    const handleDeleteChild = (child: Child) => {
      ElMessageBox.confirm(`确定要删除孩子 ${child.name} 的信息吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }).then(() => {
        // 模拟删除操作
        if (parent.value) {
          parent.value.children = parent.value.children.filter(item => item.id !== child.id);
          ElMessage.success('删除成功');
        }
      }).catch(() => {
        // 取消删除
      });
    };
    
    // 添加跟进记录
    const handleAddFollowUp = () => {
      router.push(`/parent/follow-up/create?parentId=${parentId}`);
    };
    
    // 查看跟进详情
    const handleViewFollowUp = (record: FollowUpRecord) => {
      currentFollowUp.value = record;
      showFollowUpDetail.value = true;
    };
    
    // 删除跟进记录
    const handleDeleteFollowUp = (record: FollowUpRecord) => {
      ElMessageBox.confirm(`确定要删除标题为"${record.title}"的跟进记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }).then(() => {
        // 模拟删除操作
        if (parent.value) {
          parent.value.followUpRecords = parent.value.followUpRecords.filter(item => item.id !== record.id);
          ElMessage.success('删除成功');
        }
      }).catch(() => {
        // 取消删除
      });
    };
    
    // 分配活动
    const handleAssignActivity = () => {
      router.push(`/parent/assign-activity/${parentId}`);
    };
    
    // 查看活动详情
    const handleViewActivity = (activity: Activity) => {
      router.push(`/activity/detail/${activity.id}`);
    };
    
    // 取消活动
    const handleCancelActivity = (activity: Activity) => {
      ElMessageBox.confirm(`确定要取消"${activity.title}"活动的参与吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
  type: 'warning'
      }).then(() => {
        // 模拟取消操作
        if (parent.value) {
          parent.value.activities = parent.value.activities.filter(item => item.id !== activity.id);
          ElMessage.success('取消成功');
        }
      }).catch(() => {
        // 取消操作
      });
    };
    
    onMounted(() => {
      fetchParentDetail();
    });
    
    // 定义默认头像路径
    const defaultAvatar = '/default-avatar.png';
    
    return {
      loading,
      parent,
      parentId,
      showFollowUpDetail,
      currentFollowUp,
      defaultAvatar,
      isDesktop,
      
      getParentStatusClass,
      getChildStatusClass,
      getFollowUpTypeClass,
      getActivityStatusClass,
      goBack,
      handleEdit,
      handleAddChild,
      handleEditChild,
      handleDeleteChild,
      handleAddFollowUp,
      handleViewFollowUp,
      handleDeleteFollowUp,
      handleAssignActivity,
      handleViewActivity,
      handleCancelActivity
    };
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
@import '../system/user-management-ux-styles.scss';

.loading-container {
  padding: var(--text-4xl);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15xl) var(--text-2xl);
  text-align: center;
  
  .el-empty {
    margin-bottom: var(--text-3xl);
  }
}

/* 家长详情页面专用样式增强 */
.parent-detail-page {
  .status-tag {
    padding: var(--spacing-lg) var(--text-sm);
    border-radius: var(--spacing-sm);
    font-size: 0.875rem;
    font-weight: 600;
    
    &.status-active {
      background: var(--gradient-success);
      color: white;
    }
    
    &.status-pending {
      background: var(--gradient-warning);
      color: white;
    }
    
    &.status-inactive {
      background: var(--el-fill-color);
      color: white;
    }
    
    &.status-rejected {
      background: var(--gradient-danger);
      color: white;
    }
  }
  
  /* 子女信息表格样式 */
  .children-table-container {
    margin-top: var(--text-lg);
    
    .children-table {
      border-radius: var(--text-xs);
      overflow: hidden;
      
      .child-name-cell {
        display: flex;
        align-items: center;
        gap: var(--text-xs);
        
        .child-avatar {
          width: var(--spacing-3xl);
          height: var(--spacing-3xl);
          border-radius: var(--radius-full);
          background: var(--gradient-purple);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .child-name {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .child-status-tag {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
        
        &.child-status-enrolled {
          background: var(--gradient-success);
          color: white;
        }
        
        &.child-status-pending {
          background: var(--gradient-warning);
          color: white;
        }
        
        &.child-status-graduated {
          background: var(--gradient-info);
          color: white;
        }
        
        &.child-status-withdrawn {
          background: var(--gradient-danger);
          color: white;
        }
      }
    }
    
    .children-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-10xl) var(--text-2xl);
      text-align: center;
      
      .empty-icon {
        font-size: 3rem;
        margin-bottom: var(--text-lg);
        opacity: 0.6;
      }
      
      .empty-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .empty-description {
        font-size: 0.875rem;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        max-width: 300px;
      }
    }
  }
  
  /* 跟进记录表格样式 */
  .follow-up-table-container {
    margin-top: var(--text-lg);
    
    .follow-up-table {
      border-radius: var(--text-xs);
      overflow: hidden;
      
      .follow-up-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        color: var(--el-text-color-primary);
        
        .follow-up-icon {
          font-size: 1rem;
        }
      }
      
      .follow-up-type-tag {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
        
        &.follow-up-phone {
          background: var(--gradient-info);
          color: white;
        }
        
        &.follow-up-visit {
          background: var(--gradient-success);
          color: white;
        }
        
        &.follow-up-email {
          background: var(--gradient-purple);
          color: white;
        }
        
        &.follow-up-meeting {
          background: var(--gradient-warning);
          color: white;
        }
        
        &.follow-up-other {
          background: var(--el-fill-color);
          color: white;
        }
      }
    }
    
    .follow-up-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-10xl) var(--text-2xl);
      text-align: center;
      
      .empty-icon {
        font-size: 3rem;
        margin-bottom: var(--text-lg);
        opacity: 0.6;
      }
      
      .empty-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .empty-description {
        font-size: 0.875rem;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        max-width: 300px;
      }
    }
  }
  
  /* 活动参与表格样式 */
  .activities-table-container {
    margin-top: var(--text-lg);
    
    .activities-table {
      border-radius: var(--text-xs);
      overflow: hidden;
      
      .activity-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        color: var(--el-text-color-primary);
        
        .activity-icon {
          font-size: 1rem;
        }
      }
      
      .activity-status-tag {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
        
        &.activity-status-active {
          background: var(--gradient-success);
          color: white;
        }
        
        &.activity-status-pending {
          background: var(--gradient-warning);
          color: white;
        }
        
        &.activity-status-completed {
          background: var(--gradient-info);
          color: white;
        }
        
        &.activity-status-canceled {
          background: var(--gradient-danger);
          color: white;
        }
      }
    }
    
    .activities-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-10xl) var(--text-2xl);
      text-align: center;
      
      .empty-icon {
        font-size: 3rem;
        margin-bottom: var(--text-lg);
        opacity: 0.6;
      }
      
      .empty-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: var(--spacing-sm);
      }
      
      .empty-description {
        font-size: 0.875rem;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        max-width: 300px;
      }
    }
  }
  
  /* 通用表格操作按钮样式 */
  .table-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    flex-wrap: wrap;
    
    .table-action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-lg) var(--text-sm);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 60px;
      justify-content: center;
      
      &:hover {
        transform: translateY(-var(--border-width-base));
        box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-medium);
      }
      
      &.edit-btn {
        background: var(--gradient-info);
        color: white;
        
        &:hover {
          box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--accent-enrollment-heavy);
        }
      }
      
      &.delete-btn {
        background: var(--gradient-danger);
        color: white;
        
        &:hover {
          box-shadow: 0 var(--spacing-xs) var(--spacing-sm) rgba(239, 68, 68, 0.3);
        }
      }
      
      &.view-btn {
        background: var(--gradient-success);
        color: white;
        
        &:hover {
          box-shadow: 0 var(--spacing-xs) var(--spacing-sm) rgba(16, 185, 129, 0.3);
        }
      }
      
      &.cancel-btn {
        background: var(--gradient-warning);
        color: white;
        
        &:hover {
          box-shadow: 0 var(--spacing-xs) var(--spacing-sm) rgba(245, 158, 11, 0.3);
        }
      }
      
      i {
        font-style: normal;
        font-size: 0.875rem;
      }
    }
    
    @media (max-width: var(--breakpoint-md)) {
      flex-direction: column;
      gap: var(--spacing-xs);
      
      .table-action-btn {
        width: 100%;
        min-width: auto;
      }
    }
  }
}

/* 跟进记录详情对话框样式 */
.follow-up-detail-dialog {
  :deep(.el-dialog) {
    border-radius: var(--text-base);
    overflow: hidden;
    
    @media (max-width: var(--breakpoint-md)) {
      width: 95% !important;
      margin: 5vh auto !important;
    }
  }
  
  .follow-up-detail {
    .detail-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
      
      .detail-info-item {
        background: var(--el-fill-color-light);
        padding: var(--text-base);
        border-radius: var(--spacing-sm);
        border: var(--border-width-base) solid var(--el-border-color);
        
        &.full-width {
          grid-column: 1 / -1;
        }
        
        .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--el-text-color-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .detail-value {
          font-size: 1rem;
          font-weight: 500;
          color: var(--el-text-color-primary);
          
          &.detail-content-text {
            line-height: 1.6;
            white-space: pre-wrap;
          }
        }
      }
      
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
        gap: var(--text-base);
      }
    }
  }
}
</style> 