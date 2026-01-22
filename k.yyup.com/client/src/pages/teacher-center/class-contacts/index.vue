<template>
  <div class="class-contacts-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>班级通讯录</h2>
        <p class="header-subtitle">快速查看班级学生及家长联系方式</p>
      </div>
      <div class="header-stats">
        <el-tag type="primary" size="large">学生总数: {{ students.length }}</el-tag>
        <el-tag type="success" size="large">家长总数: {{ totalParents }}</el-tag>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="搜索">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索学生或家长姓名、电话"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="筛选">
          <el-checkbox v-model="showOnlyPrimary">仅显示主要联系人</el-checkbox>
          <el-checkbox v-model="showOnlyEnrolled">仅显示在读家长</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出通讯录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 通讯录列表 -->
    <div v-else-if="filteredStudents.length > 0" class="contacts-list">
      <el-card 
        v-for="student in filteredStudents" 
        :key="student.studentId" 
        class="student-card"
        shadow="hover"
      >
        <!-- 学生信息区块 -->
        <div class="student-section">
          <div class="student-header">
            <el-avatar :size="60" :src="student.studentAvatar">
              {{ student.studentName.charAt(0) }}
            </el-avatar>
            <div class="student-info">
              <h3>{{ student.studentName }}</h3>
              <div class="student-meta">
                <el-tag size="small">学号: {{ student.studentId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 家长信息区块 -->
        <div class="parents-section">
          <div class="section-title">
            <el-icon><UserFilled /></el-icon>
            家长信息 ({{ student.parents.length }})
          </div>
          
          <div v-if="student.parents.length === 0" class="empty-state">
            <el-empty description="暂无家长信息" :image-size="60" />
          </div>

          <div v-else class="parents-list">
            <div 
              v-for="(parent, index) in student.parents" 
              :key="index" 
              class="parent-item"
              :class="{ 'is-primary': parent.isPrimaryContact }"
            >
              <!-- 左侧：头像和基本信息 -->
              <div class="parent-basic">
                <el-avatar :size="50" :src="parent.profile?.avatar">
                  {{ parent.profile?.realName?.charAt(0) || '家' }}
                </el-avatar>
                <div class="parent-info">
                  <div class="parent-name">
                    {{ parent.profile?.realName || '未填写姓名' }}
                    <el-tag v-if="parent.isPrimaryContact" type="success" size="small">主要联系人</el-tag>
                    <el-tag v-if="parent.profile?.isEnrolled" type="primary" size="small">在读</el-tag>
                    <el-tag v-else type="info" size="small">体验</el-tag>
                  </div>
                  <div class="parent-relation">关系：{{ parent.relationship }}</div>
                </div>
              </div>

              <!-- 右侧：联系方式和操作 -->
              <div class="parent-contact">
                <!-- 主要电话 -->
                <div class="contact-item primary-contact">
                  <el-icon><Phone /></el-icon>
                  <span class="phone-number">{{ parent.profile?.phone || '未填写' }}</span>
                  <el-button 
                    v-if="parent.profile?.phone" 
                    type="primary" 
                    size="small"
                    @click="callPhone(parent.profile.phone)"
                  >
                    <el-icon><Phone /></el-icon>
                    拨打
                  </el-button>
                </div>

                <!-- 紧急联系人 -->
                <div v-if="parent.profile?.emergencyContact" class="contact-item emergency-contact">
                  <el-icon><Warning /></el-icon>
                  <span class="emergency-label">紧急联系人：{{ parent.profile.emergencyContact }}</span>
                  <span class="phone-number">{{ parent.profile.emergencyPhone }}</span>
                  <el-button 
                    v-if="parent.profile?.emergencyPhone"
                    type="warning" 
                    size="small"
                    @click="callPhone(parent.profile.emergencyPhone)"
                  >
                    <el-icon><Phone /></el-icon>
                    紧急拨打
                  </el-button>
                </div>

                <!-- 地址信息 -->
                <div v-if="parent.profile?.address" class="contact-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ parent.profile.address }}</span>
                </div>

                <!-- 接送人按钮 -->
                <div class="action-buttons">
                  <el-button 
                    v-if="parent.profile?.pickupPersons?.length > 0"
                    text 
                    type="primary"
                    @click="showPickupPersons(parent)"
                  >
                    <el-icon><User /></el-icon>
                    接送人 ({{ parent.profile.pickupPersons.length }})
                  </el-button>
                  <el-button text type="info" @click="viewParentProfile(parent)">
                    完整信息
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无班级学生数据" />

    <!-- 接送人详情对话框 -->
    <el-dialog 
      v-model="showPickupDialog" 
      title="接送人信息"
      width="var(--dialog-width-md)"
    >
      <div v-if="currentParent" class="pickup-dialog-content">
        <div class="dialog-header">
          <span>{{ currentParent.profile?.realName }} 的接送人</span>
        </div>
        
        <div class="pickup-list-dialog">
          <div 
            v-for="(person, index) in currentParent.profile?.pickupPersons" 
            :key="index"
            class="pickup-item-dialog"
          >
            <div class="pickup-avatar">
              <img v-if="person.id_photo" :src="person.id_photo" />
              <span v-else>{{ person.name.charAt(0) }}</span>
            </div>
            <div class="pickup-info">
              <div class="pickup-name">
                {{ person.name }}
                <el-tag v-if="person.is_active" type="success" size="small">可接送</el-tag>
                <el-tag v-else type="info" size="small">已停用</el-tag>
              </div>
              <div class="pickup-phone">
                <el-icon><Phone /></el-icon>
                {{ person.phone }}
                <el-button 
                  text 
                  type="primary" 
                  size="small"
                  @click="callPhone(person.phone)"
                >
                  拨打
                </el-button>
              </div>
              <div class="pickup-relation">关系：{{ person.relation }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showPickupDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Search, Download, Phone, Warning, Location,
  User, UserFilled
} from '@element-plus/icons-vue';
import parentApi from '@/api/modules/parent';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 数据
const loading = ref(true);
const students = ref<any[]>([]);
const searchKeyword = ref('');
const showOnlyPrimary = ref(false);
const showOnlyEnrolled = ref(false);
const showPickupDialog = ref(false);
const currentParent = ref<any>(null);

// 教师的班级ID（从用户信息或其他地方获取）
const teacherClassId = ref(3); // 暂时硬编码，实际应从userStore或API获取

// 计算属性
const totalParents = computed(() => {
  return students.value.reduce((sum, student) => sum + student.parents.length, 0);
});

const filteredStudents = computed(() => {
  let result = students.value;

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(student => {
      const studentMatch = student.studentName.toLowerCase().includes(keyword);
      const parentMatch = student.parents.some((parent: any) => {
        const nameMatch = parent.profile?.realName?.toLowerCase().includes(keyword);
        const phoneMatch = parent.profile?.phone?.includes(keyword);
        return nameMatch || phoneMatch;
      });
      return studentMatch || parentMatch;
    });
  }

  // 仅显示主要联系人
  if (showOnlyPrimary.value) {
    result = result.map(student => ({
      ...student,
      parents: student.parents.filter((p: any) => p.isPrimaryContact),
    })).filter(student => student.parents.length > 0);
  }

  // 仅显示在读家长
  if (showOnlyEnrolled.value) {
    result = result.map(student => ({
      ...student,
      parents: student.parents.filter((p: any) => p.profile?.isEnrolled),
    })).filter(student => student.parents.length > 0);
  }

  return result;
});

// 加载班级家长数据
const loadClassParents = async () => {
  loading.value = true;
  try {
    // TODO: parentProfileApi.getClassParents 方法不存在，需要使用正确的API
    // 临时使用空数据
    console.warn('parentProfileApi.getClassParents 方法不存在，使用空数据');
    students.value = [];
    // const res = await parentApi.getClassParents(teacherClassId.value);
    // if (res.data) {
    //   students.value = res.data;
    // }
  } catch (error) {
    console.error('加载班级家长信息失败:', error);
    ElMessage.error('加载班级家长信息失败');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  // 搜索已通过computed实现
};

// 拨打电话
const callPhone = (phone: string) => {
  if (!phone) return;
  window.open(`tel:${phone}`);
  ElMessage.success(`正在拨打 ${phone}`);
};

// 显示接送人
const showPickupPersons = (parent: any) => {
  currentParent.value = parent;
  showPickupDialog.value = true;
};

// 查看家长完整信息
const viewParentProfile = (parent: any) => {
  router.push({
    path: '/centers/parent-profile-detail',
    query: { userId: parent.userId }
  });
};

// 导出通讯录
const handleExport = () => {
  ElMessage.info('导出功能开发中');
  // TODO: 实现导出Excel功能
};

onMounted(() => {
  loadClassParents();
});
</script>

<style scoped lang="scss">
.class-contacts-page {
  // padding由全局layout-unified-fix.scss控制
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl, var(--radius-3xl));

  h2 {
    margin: 0 0 var(--radius-lg) 0;
    font-size: var(--text-base, var(--radius-3xl));
    font-weight: 600;
  }

  .header-subtitle {
    margin: 0;
    color: var(--info-color);
    font-size: var(--text-base, var(--text-sm));
  }

  .header-stats {
    display: flex;
    gap: var(--radius-xl);
  }
}

.filter-card {
  margin-bottom: var(--spacing-xl, var(--spacing-lg));
}

.loading-container {
  padding: var(--spacing-lg, var(--spacing-3xl));
}

.contacts-list {
  display: grid;
  gap: var(--radius-2xl);
}

// 学生卡片
.student-card {
  .student-section {
    margin-bottom: var(--spacing-xl, var(--spacing-lg));
    padding-bottom: var(--spacing-lg);
    border-bottom: var(--radius-xs) solid #f0f0f0;

    .student-header {
      display: flex;
      gap: var(--radius-2xl);
      align-items: center;

      .student-info {
        h3 {
          margin: 0 0 var(--radius-lg) 0;
          font-size: var(--text-base, var(--text-lg));
          font-weight: 600;
        }

        .student-meta {
          display: flex;
          gap: var(--radius-lg);
        }
      }
    }
  }

  .parents-section {
    .section-title {
      display: flex;
      align-items: center;
      gap: var(--radius-lg);
      font-size: var(--text-base, var(--radius-2xl));
      font-weight: 600;
      margin-bottom: var(--spacing-xl, var(--radius-2xl));
      color: var(--text-regular);
    }

    .empty-state {
      padding: var(--spacing-lg, var(--spacing-lg)) 0;
    }

    .parents-list {
      display: grid;
      gap: var(--radius-2xl);
    }
  }
}

// 家长项
.parent-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg, var(--radius-2xl));
  background: var(--bg-tertiary);
  border-radius: var(--radius-md, var(--radius-lg));
  border-left: var(--radius-sm) solid transparent;
  transition: all var(--transition-base);

  &.is-primary {
    border-left-color: var(--success-color);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }

  &:hover {
    background: #ecf5ff;
    transform: translateX(var(--radius-sm));
  }

  .parent-basic {
    display: flex;
    gap: var(--radius-xl);
    align-items: center;
    min-width: var(--component-width-280, 280px);

    .parent-info {
      .parent-name {
        font-size: var(--text-base, var(--radius-2xl));
        font-weight: 600;
        margin-bottom: var(--spacing-xl, var(--radius-md));
        display: flex;
        align-items: center;
        gap: var(--radius-lg);
        flex-wrap: wrap;
      }

      .parent-relation {
        font-size: var(--text-base, var(--text-sm));
        color: var(--info-color);
      }
    }
  }

  .parent-contact {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 10px);

    .contact-item {
      display: flex;
      align-items: center;
      gap: var(--radius-lg);
      font-size: var(--text-base, var(--text-sm));

      &.primary-contact {
        .phone-number {
          font-size: var(--text-base, var(--radius-2xl));
          font-weight: 600;
          color: var(--primary-color);
        }
      }

      &.emergency-contact {
        background: #fef0f0;
        padding: var(--spacing-lg, var(--radius-lg)) var(--radius-xl);
        border-radius: var(--radius-md, var(--radius-md));
        border-left: 3px solid var(--danger-color);

        .emergency-label {
          font-weight: 600;
          color: var(--danger-color);
        }

        .phone-number {
          font-weight: 600;
        }
      }

      .phone-number {
        font-family: 'Courier New', monospace;
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--radius-lg);
      margin-top: var(--spacing-xl, var(--radius-lg));
    }
  }
}

// 接送人对话框
.pickup-dialog-content {
  .dialog-header {
    font-size: var(--text-base, var(--radius-2xl));
    font-weight: 600;
    margin-bottom: var(--spacing-xl, var(--radius-2xl));
    padding-bottom: var(--radius-xl);
    border-bottom: 1px solid #eee;
  }

  .pickup-list-dialog {
    display: grid;
    gap: var(--radius-xl);
  }

  .pickup-item-dialog {
    display: flex;
    gap: var(--radius-2xl);
    padding: var(--spacing-lg, var(--radius-2xl));
    background: var(--bg-tertiary);
    border-radius: var(--radius-md, var(--radius-lg));

    .pickup-avatar {
      width: var(--component-width-60, 60px);
      height: var(--component-height-60, 60px);
      border-radius: 50%;
      background: var(--primary-color);
      color: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-base, var(--radius-3xl));
      font-weight: 600;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .pickup-info {
      flex: 1;

      .pickup-name {
        font-size: var(--text-base, var(--radius-2xl));
        font-weight: 600;
        margin-bottom: var(--spacing-xl, var(--radius-lg));
        display: flex;
        align-items: center;
        gap: var(--radius-lg);
      }

      .pickup-phone {
        color: var(--text-regular);
        margin-bottom: var(--spacing-xl, var(--radius-sm));
        display: flex;
        align-items: center;
        gap: var(--radius-lg);
      }

      .pickup-relation {
        font-size: var(--text-base, var(--text-sm));
        color: var(--info-color);
      }
    }
  }
}

// 响应式
@media (max-width: var(--component-width-768, 768px)) {
  .class-contacts-page {
    padding: var(--spacing-lg, var(--radius-2xl));
  }

  .page-header {
    flex-direction: column;
    gap: var(--radius-2xl);
    align-items: stretch;
  }

  .parent-item {
    flex-direction: column;

    .parent-basic {
      min-width: auto;
    }

    .parent-contact {
      .contact-item {
        flex-wrap: wrap;
      }
    }
  }
}
</style>

