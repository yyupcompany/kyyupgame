<template>
  <div class="marketing-main">
    <PageWrapper title="营销管理" :auto-empty-state="false">
      <div class="marketing-dashboard">
        <el-card>
          <h3>营销功能</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-button type="primary" @click="$router.push('/marketing/coupons')">
                优惠券管理
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="$router.push('/marketing/consultations')">
                咨询管理
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="$router.push('/marketing/intelligent-engine/marketing-engine')">
                智能营销引擎
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import PageWrapper from '@/components/common/PageWrapper.vue'
</script>