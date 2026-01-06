<template>
  <div class="permissions-management">
    <PageWrapper title="权限管理">
      <el-card>
        <h3>权限管理功能</h3>
        <p>权限管理功能正在开发中，请使用现有的角色管理和用户管理功能。</p>
        
        <el-row :gutter="20" style="margin-top: var(--text-2xl);">
          <el-col :span="12">
            <el-button type="primary" @click="$router.push('/system/roles')">
              角色管理
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="primary" @click="$router.push('/system/users')">
              用户管理
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import PageWrapper from '@/components/common/PageWrapper.vue'
</script>