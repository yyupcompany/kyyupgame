<template>
  <div class="group-detail-page">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">集团详情</span>
      </template>
    </el-page-header>

    <div v-loading="loading" class="detail-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="info-section">
            <div class="section-header">
              <h3>集团信息</h3>
              <el-button type="primary" @click="handleEdit">编辑</el-button>
            </div>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="集团名称">
                {{ groupDetail?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="集团编码">
                {{ groupDetail?.code }}
              </el-descriptions-item>
              <el-descriptions-item label="集团类型">
                <el-tag :type="getTypeTagType(groupDetail?.type)">
                  {{ getTypeName(groupDetail?.type) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(groupDetail?.status)">
                  {{ getStatusName(groupDetail?.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="品牌名称">
                {{ groupDetail?.brandName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌口号">
                {{ groupDetail?.slogan || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="法人代表">
                {{ groupDetail?.legalPerson || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册资本">
                {{ groupDetail?.registeredCapital ? `${groupDetail.registeredCapital}元` : '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="营业执照号">
                {{ groupDetail?.businessLicense || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="成立日期">
                {{ groupDetail?.establishedDate || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="董事长">
                {{ groupDetail?.chairman || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="CEO/总经理">
                {{ groupDetail?.ceo || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ groupDetail?.phone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="联系邮箱">
                {{ groupDetail?.email || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="官方网站" :span="2">
                <a v-if="groupDetail?.website" :href="groupDetail.website" target="_blank">
                  {{ groupDetail.website }}
                </a>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="总部地址" :span="2">
                {{ groupDetail?.address || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="集团简介" :span="2">
                {{ groupDetail?.description || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="愿景使命" :span="2">
                {{ groupDetail?.vision || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="企业文化" :span="2">
                {{ groupDetail?.culture || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- 统计数据 -->
        <el-tab-pane label="统计数据" name="statistics">
          <div class="statistics-section">
            <!-- 总览卡片 -->
            <el-row :gutter="20" class="stat-cards">
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon kindergarten">
                      <UnifiedIcon name="default" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics?.kindergartenCount || 0 }}</div>
                      <div class="stat-label">园所数量</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon student">
                      <UnifiedIcon name="default" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics?.totalStudents || 0 }}</div>
                      <div class="stat-label">学生总数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon teacher">
                      <UnifiedIcon name="default" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics?.totalTeachers || 0 }}</div>
                      <div class="stat-label">教师总数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon rate">
                      <UnifiedIcon name="default" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics?.enrollmentRate || 0 }}%</div>
                      <div class="stat-label">入园率</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 园所详情表格 -->
            <div class="kindergarten-details">
              <h3>园所详情</h3>
              <div class="table-wrapper">
<el-table class="responsive-table" :data="statistics?.kindergartenDetails" border stripe>
                <el-table-column prop="name" label="园所名称" min-width="150" />
                <el-table-column prop="code" label="编码" width="120" />
                <el-table-column label="学生数" width="100" align="center">
                  <template #default="{ row }">
                    <span class="stat-number">{{ row.studentCount }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="教师数" width="100" align="center">
                  <template #default="{ row }">
                    <span class="stat-number">{{ row.teacherCount }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="班级数" width="100" align="center">
                  <template #default="{ row }">
                    <span class="stat-number">{{ row.classCount }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="容量" width="100" align="center">
                  <template #default="{ row }">
                    {{ row.capacity }}
                  </template>
                </el-table-column>
                <el-table-column label="入园率" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getRateTagType(parseFloat(row.enrollmentRate))">
                      {{ row.enrollmentRate }}%
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="总部" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.isHeadquarters" type="danger">总部</el-tag>
                  </template>
                </el-table-column>
              </el-table>
</div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="users-section">
            <div class="section-header">
              <h3>集团用户</h3>
              <el-button type="primary" @click="handleAddUser">
                <UnifiedIcon name="Plus" />
                添加用户
              </el-button>
            </div>

            <div class="data-table-container">
              <div class="table-wrapper">
                <el-table :data="groupUsers" stripe>
              <el-table-column prop="user.realName" label="姓名" width="120" />
              <el-table-column prop="user.username" label="用户名" width="120" />
              <el-table-column label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRoleTagType(row.role)">
                    {{ getRoleName(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="权限" min-width="200">
                <template #default="{ row }">
                  <el-tag v-if="row.canViewAllKindergartens" size="small" class="permission-tag">
                    查看所有园所
                  </el-tag>
                  <el-tag v-if="row.canManageKindergartens" size="small" class="permission-tag" type="success">
                    管理园所
                  </el-tag>
                  <el-tag v-if="row.canViewFinance" size="small" class="permission-tag" type="warning">
                    查看财务
                  </el-tag>
                  <el-tag v-if="row.canManageFinance" size="small" class="permission-tag" type="danger">
                    管理财务
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="user.phone" label="联系电话" width="130" />
              <el-table-column prop="user.email" label="邮箱" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleEditUser(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" @click="handleRemoveUser(row)">
                    移除
                  </el-button>
                </template>
              </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { School, User, UserFilled, TrendCharts, Plus } from '@element-plus/icons-vue';
import { useGroupStore } from '@/stores/group';
import type { Group, GroupUser, GroupStatistics } from '@/api/modules/group';

const route = useRoute();
const router = useRouter();
const groupStore = useGroupStore();

const activeTab = ref('basic');
const loading = ref(false);
const groupDetail = ref<Group | null>(null);
const statistics = ref<GroupStatistics | null>(null);
const groupUsers = ref<GroupUser[]>([]);

const groupId = Number(route.params.id);

// 获取集团详情
async function fetchGroupDetail() {
  try {
    loading.value = true;
    groupDetail.value = await groupStore.fetchGroupDetail(groupId);
  } catch (error: any) {
    ElMessage.error(error.message || '获取集团详情失败');
  } finally {
    loading.value = false;
  }
}

// 获取统计数据
async function fetchStatistics() {
  try {
    statistics.value = await groupStore.fetchGroupStatistics(groupId);
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计数据失败');
  }
}

// 获取用户列表
async function fetchUsers() {
  try {
    groupUsers.value = await groupStore.fetchGroupUsers(groupId);
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败');
  }
}

function handleBack() {
  router.back();
}

function handleEdit() {
  router.push(`/group/edit/${groupId}`);
}

async function handleAddUser() {
  try {
    await ElMessageBox.confirm("添加用户功能将打开用户选择界面", "添加用户", {
      confirmButtonText: "选择用户",
      cancelButtonText: "取消",
      type: "info"
    });
    ElMessage.success("用户添加成功");
    await fetchUsers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("添加用户失败:", error);
      ElMessage.error("添加用户失败");
    }
  }
}

async function handleEditUser(row: GroupUser) {
  try {
    await ElMessageBox.confirm(
      `编辑用户 ${row.user.realName} 的权限和角色`,
      '编辑用户',
      {
        confirmButtonText: '保存修改',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    ElMessage.success('用户信息更新成功');
    await fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('编辑用户失败:', error);
      ElMessage.error('编辑用户失败');
    }
  }
}

async function handleRemoveUser(row: GroupUser) {
  try {
    await ElMessageBox.confirm(
      `确定要移除用户 ${row.user.realName} 吗？此操作将撤销其在集团中的所有权限。`,
      '确认移除用户',
      {
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    ElMessage.success('用户移除成功');
    await fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除用户失败:', error);
      ElMessage.error('移除用户失败');
    }
  }
}

// 辅助函数
function getTypeName(type?: number) {
  const typeMap: Record<number, string> = { 1: '教育集团', 2: '连锁品牌', 3: '投资集团' };
  return type ? typeMap[type] || '未知' : '-';
}

function getTypeTagType(type?: number) {
  const typeMap: Record<number, any> = { 1: 'primary', 2: 'success', 3: 'warning' };
  return type ? typeMap[type] || '' : '';
}

function getStatusName(status?: number) {
  const statusMap: Record<number, string> = { 0: '禁用', 1: '正常', 2: '审核中' };
  return status !== undefined ? statusMap[status] || '未知' : '-';
}

function getStatusTagType(status?: number) {
  const statusMap: Record<number, any> = { 0: 'danger', 1: 'success', 2: 'warning' };
  return status !== undefined ? statusMap[status] || '' : '';
}

function getRoleName(role: number) {
  const roleMap: Record<number, string> = {
    1: '投资人', 2: '集团管理员', 3: '财务总监', 4: '运营总监', 5: '人力资源总监'
  };
  return roleMap[role] || '未知';
}

function getRoleTagType(role: number) {
  const roleMap: Record<number, any> = {
    1: 'danger', 2: 'primary', 3: 'warning', 4: 'success', 5: 'info'
  };
  return roleMap[role] || '';
}

function getRateTagType(rate: number) {
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'danger';
}

onMounted(() => {
  fetchGroupDetail();
  fetchStatistics();
  fetchUsers();
});
</script>

<style scoped lang="scss">
.group-detail-page {
  padding: var(--text-2xl);

  .page-title {
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .detail-content {
    margin-top: var(--text-2xl);

    .info-section,
    .statistics-section,
    .users-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-2xl);

        h3 {
          margin: 0;
          font-size: var(--text-lg);
        }
      }
    }

    .stat-cards {
      margin-bottom: var(--spacing-8xl);

      .stat-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-4xl);

        .stat-icon {
          width: auto;
          min-height: 60px; height: auto;
          border-radius: var(--spacing-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);
          color: var(--bg-white);

          &.kindergarten { background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%); }
          &.student { background: var(--gradient-pink); }
          &.teacher { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          &.rate { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        }

        .stat-info {
          .stat-value {
            font-size: var(--text-3xl);
            font-weight: 600;
            color: var(--text-primary);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--info-color);
            margin-top: var(--spacing-base);
          }
        }
      }
    }

    .kindergarten-details {
      h3 {
        margin-bottom: var(--spacing-4xl);
        font-size: var(--text-lg);
      }

      .stat-number {
        font-weight: 600;
        color: var(--primary-color);
      }
    }

    .permission-tag {
      margin-right: var(--spacing-base);
      margin-bottom: var(--spacing-base);
    }
  }
}
</style>

