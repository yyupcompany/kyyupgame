<template>
  <div class="page-container cls-optimized">
    <!-- 页面头部 -->
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">学生详情</div>
        <div class="card-actions">
          <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
          <el-button type="primary" @click="handleEdit" :icon="Edit">编辑</el-button>
        </div>
      </div>

      <!-- 学生基本信息 -->
      <div class="student-info">
        <div class="avatar-section">
          <div class="student-avatar-wrapper">
            <el-avatar v-if="studentData" :size="80" :icon="User" class="student-avatar" />
            <el-skeleton v-else animated>
              <template #template>
                <el-skeleton-item variant="circle" style="width: 80px; height: 80px;" />
              </template>
            </el-skeleton>
          </div>
          <div class="basic-info">
            <template v-if="studentData">
              <h2 class="student-name">{{ studentData.name }}</h2>
              <p class="student-class">{{ studentData.className }}</p>
              <el-tag :type="getStatusTagType(studentData.status)" size="small">
                {{ studentData.status }}
              </el-tag>
            </template>
            <template v-else>
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="h1" style="max-width: 120px; height: 24px; margin-bottom: 8px;" />
                  <el-skeleton-item variant="text" style="max-width: 100px; height: 16px; margin-bottom: 8px;" />
                  <el-skeleton-item variant="button" style="width: 60px; height: 20px;" />
                </template>
              </el-skeleton>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Edit, User } from '@element-plus/icons-vue';

const router = useRouter();

// 数据
const studentData = ref(null);

// 方法
const goBack = () => {
  router.back();
};

const handleEdit = () => {
  // TODO: 编辑逻辑
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    'active': 'success',
    'inactive': 'info',
    'graduated': 'warning',
    'transferred': 'danger'
  };
  return map[status] || 'info';
};
</script>

<style scoped lang="scss">
.page-container {
  padding: var(--spacing-lg);
}

.app-card {
  margin-bottom: 20px;
}

.student-info {
  padding: var(--spacing-lg);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.student-avatar {
  width: 80px;
  height: 80px;
}

.basic-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  margin: 0 0 8px 0;
}

.student-class {
  margin: 0 0 8px 0;
  color: #606266;
}
</style>
