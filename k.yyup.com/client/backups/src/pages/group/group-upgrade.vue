<template>
  <div class="group-upgrade-page">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">升级为集团</span>
      </template>
    </el-page-header>

    <div class="upgrade-content">
      <!-- 升级资格检查 -->
      <el-card v-if="!eligibility" v-loading="checking" class="check-card">
        <div class="check-content">
          <el-icon class="check-icon"><Loading /></el-icon>
          <p>正在检测升级资格...</p>
        </div>
      </el-card>

      <!-- 不符合升级条件 -->
      <el-card v-else-if="!eligibility.eligible" class="result-card">
        <el-result icon="warning" title="暂不符合升级条件">
          <template #sub-title>
            <p>{{ eligibility.reason }}</p>
            <p class="tip">您当前有 {{ eligibility.kindergartenCount }} 个园所</p>
            <p class="tip">至少需要 2 个园所才能升级为集团</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="handleBack">返回</el-button>
          </template>
        </el-result>
      </el-card>

      <!-- 升级向导 -->
      <div v-else class="upgrade-wizard">
        <el-steps :active="currentStep" align-center finish-status="success">
          <el-step title="选择园所" />
          <el-step title="填写信息" />
          <el-step title="确认升级" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 选择园所 -->
          <el-card v-show="currentStep === 0" class="step-card">
            <template #header>
              <div class="card-header">
                <span>选择要加入集团的园所</span>
                <span class="tip">已选择 {{ selectedKindergartens.length }} / {{ eligibility.kindergartens.length }}</span>
              </div>
            </template>

            <el-checkbox-group v-model="selectedKindergartens">
              <div v-for="kg in eligibility.kindergartens" :key="kg.id" class="kindergarten-item">
                <el-checkbox :label="kg.id">
                  <div class="kg-info">
                    <div class="kg-name">{{ kg.name }}</div>
                    <div class="kg-stats">
                      <el-tag size="small">编码: {{ kg.code }}</el-tag>
                      <el-tag size="small" type="success">学生: {{ kg.studentCount }}</el-tag>
                      <el-tag size="small" type="warning">教师: {{ kg.teacherCount }}</el-tag>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>

            <div class="step-actions">
              <el-button @click="handleBack">取消</el-button>
              <el-button
                type="primary"
                :disabled="selectedKindergartens.length < 2"
                @click="nextStep"
              >
                下一步
              </el-button>
            </div>
          </el-card>

          <!-- 步骤2: 填写集团信息 -->
          <el-card v-show="currentStep === 1" class="step-card">
            <template #header>
              <span>填写集团基本信息</span>
            </template>

            <el-form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              label-width="120px"
            >
              <el-form-item label="集团名称" prop="groupName">
                <el-input v-model="formData.groupName" placeholder="请输入集团名称" />
              </el-form-item>

              <el-form-item label="集团编码" prop="groupCode">
                <el-input v-model="formData.groupCode" placeholder="留空自动生成" />
              </el-form-item>

              <el-form-item label="品牌名称" prop="brandName">
                <el-input v-model="formData.brandName" placeholder="请输入品牌名称" />
              </el-form-item>

              <el-form-item label="品牌口号" prop="slogan">
                <el-input v-model="formData.slogan" placeholder="请输入品牌口号" />
              </el-form-item>

              <el-form-item label="集团简介" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入集团简介"
                />
              </el-form-item>

              <el-form-item label="集团总部" prop="headquartersId">
                <el-select v-model="formData.headquartersId" placeholder="请选择集团总部" style="width: 100%">
                  <el-option
                    v-for="kg in selectedKindergartenList"
                    :key="kg.id"
                    :label="kg.name"
                    :value="kg.id"
                  />
                </el-select>
              </el-form-item>
            </el-form>

            <div class="step-actions">
              <el-button @click="prevStep">上一步</el-button>
              <el-button type="primary" @click="nextStep">下一步</el-button>
            </div>
          </el-card>

          <!-- 步骤3: 确认升级 -->
          <el-card v-show="currentStep === 2" class="step-card">
            <template #header>
              <span>确认升级信息</span>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item label="集团名称">
                {{ formData.groupName }}
              </el-descriptions-item>
              <el-descriptions-item label="集团编码">
                {{ formData.groupCode || '自动生成' }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌名称">
                {{ formData.brandName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌口号">
                {{ formData.slogan || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="园所数量">
                {{ selectedKindergartens.length }} 个
              </el-descriptions-item>
              <el-descriptions-item label="集团总部">
                {{ getHeadquartersName() }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="kindergarten-list">
              <h4>加入集团的园所：</h4>
              <el-tag
                v-for="kg in selectedKindergartenList"
                :key="kg.id"
                :type="kg.id === formData.headquartersId ? 'danger' : 'primary'"
                class="kg-tag"
              >
                {{ kg.name }}
                <span v-if="kg.id === formData.headquartersId"> (总部)</span>
              </el-tag>
            </div>

            <el-alert
              title="升级说明"
              type="info"
              :closable="false"
              class="upgrade-alert"
            >
              <ul>
                <li>升级为集团后，所有选中的园所将归属于该集团</li>
                <li>您将自动成为集团投资人，拥有所有管理权限</li>
                <li>集团数据将自动汇总所有园所的统计信息</li>
                <li>升级过程使用数据库事务保护，确保数据安全</li>
              </ul>
            </el-alert>

            <div class="step-actions">
              <el-button @click="prevStep">上一步</el-button>
              <el-button type="primary" :loading="upgrading" @click="handleUpgrade">
                确认升级
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import groupApi, { type UpgradeEligibility } from '@/api/modules/group';

const router = useRouter();
const formRef = ref<FormInstance>();

const checking = ref(false);
const upgrading = ref(false);
const currentStep = ref(0);
const eligibility = ref<UpgradeEligibility | null>(null);
const selectedKindergartens = ref<number[]>([]);

const formData = reactive({
  groupName: '',
  groupCode: '',
  brandName: '',
  slogan: '',
  description: '',
  headquartersId: undefined as number | undefined,
});

const formRules: FormRules = {
  groupName: [
    { required: true, message: '请输入集团名称', trigger: 'blur' },
  ],
};

const selectedKindergartenList = computed(() => {
  if (!eligibility.value) return [];
  return eligibility.value.kindergartens.filter(kg =>
    selectedKindergartens.value.includes(kg.id)
  );
});

// 检测升级资格
async function checkEligibility() {
  try {
    checking.value = true;
    const response = await groupApi.checkUpgradeEligibility();
    eligibility.value = response.data;

    // 如果符合条件，默认选中所有园所
    if (eligibility.value.eligible) {
      selectedKindergartens.value = eligibility.value.kindergartens.map(kg => kg.id);
      // 默认第一个为总部
      formData.headquartersId = eligibility.value.kindergartens[0]?.id;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '检测升级资格失败');
  } finally {
    checking.value = false;
  }
}

// 下一步
async function nextStep() {
  if (currentStep.value === 1) {
    if (!formRef.value) return;
    try {
      await formRef.value.validate();
    } catch {
      return;
    }
  }
  currentStep.value++;
}

// 上一步
function prevStep() {
  currentStep.value--;
}

// 执行升级
async function handleUpgrade() {
  try {
    await ElMessageBox.confirm(
      '确定要升级为集团吗？此操作将创建集团并关联所有选中的园所。',
      '升级确认',
      {
        confirmButtonText: '确定升级',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    upgrading.value = true;

    const response = await groupApi.upgradeToGroup({
      groupName: formData.groupName,
      groupCode: formData.groupCode || undefined,
      kindergartenIds: selectedKindergartens.value,
      headquartersId: formData.headquartersId,
      brandName: formData.brandName || undefined,
      slogan: formData.slogan || undefined,
      description: formData.description || undefined,
    });

    ElMessage.success(response.data.message || '升级成功！');
    
    // 跳转到集团详情页
    router.push(`/group/detail/${response.data.group.id}`);
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '升级失败');
    }
  } finally {
    upgrading.value = false;
  }
}

function getHeadquartersName() {
  const hq = selectedKindergartenList.value.find(kg => kg.id === formData.headquartersId);
  return hq?.name || '-';
}

function handleBack() {
  router.back();
}

onMounted(() => {
  checkEligibility();
});
</script>

<style scoped lang="scss">
.group-upgrade-page {
  padding: var(--text-2xl);

  .page-title {
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .upgrade-content {
    margin-top: var(--text-2xl);

    .check-card,
    .result-card {
      .check-content {
        text-align: center;
        padding: var(--spacing-15xl) 0;

        .check-icon {
          font-size: var(--text-5xl);
          color: var(--primary-color);
          margin-bottom: var(--text-2xl);
        }

        p {
          font-size: var(--text-lg);
          color: var(--text-regular);
        }
      }

      .tip {
        color: var(--info-color);
        margin: var(--spacing-2xl) 0;
      }
    }

    .upgrade-wizard {
      .step-content {
        margin-top: var(--spacing-8xl);

        .step-card {
          min-height: 400px;

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .tip {
              font-size: var(--text-base);
              color: var(--info-color);
            }
          }

          .kindergarten-item {
            padding: var(--spacing-4xl);
            border: var(--border-width-base) solid var(--border-color-lighter);
            border-radius: var(--spacing-xs);
            margin-bottom: var(--spacing-2xl);
            transition: all 0.3s;

            &:hover {
              border-color: var(--primary-color);
              background: var(--bg-hover);
            }

            .kg-info {
              margin-left: var(--spacing-2xl);

              .kg-name {
                font-size: var(--text-lg);
                font-weight: 600;
                margin-bottom: var(--spacing-sm);
              }

              .kg-stats {
                display: flex;
                gap: var(--spacing-2xl);
              }
            }
          }

          .kindergarten-list {
            margin: var(--text-2xl) 0;

            h4 {
              margin-bottom: var(--spacing-4xl);
              font-size: var(--text-base);
              color: var(--text-regular);
            }

            .kg-tag {
              margin-right: var(--spacing-2xl);
              margin-bottom: var(--spacing-2xl);
            }
          }

          .upgrade-alert {
            margin-top: var(--text-2xl);

            ul {
              margin: 0;
              padding-left: var(--text-2xl);

              li {
                margin: var(--spacing-base) 0;
                color: var(--text-regular);
              }
            }
          }

          .step-actions {
            display: flex;
            justify-content: center;
            gap: var(--text-2xl);
            margin-top: var(--spacing-8xl);
          }
        }
      }
    }
  }
}
</style>

