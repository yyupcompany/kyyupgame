<template>
  <div class="base-info-complete">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📝 完善基础信息</h1>
      <p>完善幼儿园基础信息，解锁更多高级功能</p>
    </div>

    <!-- 完整度进度卡片 -->
    <el-card class="progress-card">
      <div class="progress-content">
        <div class="progress-left">
          <div class="progress-circle">
            <el-progress
              type="circle"
              :percentage="completeness.score"
              :width="120"
              :color="getProgressColor(completeness.score)"
            >
              <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <span class="percentage-label">完整度</span>
              </template>
            </el-progress>
          </div>
        </div>
        <div class="progress-right">
          <h3>{{ completeness.message }}</h3>
          <div class="progress-stats">
            <div class="stat-item">
              <span class="stat-label">必填字段：</span>
              <span class="stat-value">
                {{ requiredFields.length - completeness.missingRequired.length }} / {{ requiredFields.length }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">推荐字段：</span>
              <span class="stat-value">
                {{ recommendedFields.length - completeness.missingRecommended.length }} / {{ recommendedFields.length }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">当前等级：</span>
              <el-tag :type="getLevelType(completeness.level)">
                {{ completeness.levelDescription }}
              </el-tag>
            </div>
          </div>
          <div class="unlock-features" v-if="!completeness.canUseAdvancedFeatures">
            <h4>🔒 完善后可解锁：</h4>
            <ul>
              <li>✨ AI智能填充文档</li>
              <li>✨ 一键生成年检报告</li>
              <li>✨ 智能数据分析</li>
              <li>✨ 自动提醒服务</li>
            </ul>
          </div>
          <div class="unlock-success" v-else>
            <el-alert type="success" :closable="false">
              <template #title>
                <div class="success-title">
                  <UnifiedIcon name="Check" />
                  <span>恭喜！您已解锁所有高级功能</span>
                </div>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 分步骤填写向导 -->
    <el-card class="steps-card">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.description"
        />
      </el-steps>
    </el-card>

    <!-- 表单内容 -->
    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="150px"
        label-position="right"
      >
        <!-- 步骤1: 证照信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <h3 class="step-title">📄 证照信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="办学许可证号" prop="licenseNumber" :required="isFieldRequired('licenseNumber')">
                <el-input
                  v-model="formData.licenseNumber"
                  placeholder="请输入办学许可证号"
                  :class="{ 'missing-field': isMissingField('licenseNumber') }"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="许可证发证日期" prop="licenseIssueDate" :required="isFieldRequired('licenseIssueDate')">
                <el-date-picker
                  v-model="formData.licenseIssueDate"
                  type="date"
                  placeholder="请选择发证日期"
                  style="width: 100%"
                  :class="{ 'missing-field': isMissingField('licenseIssueDate') }"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="许可证有效期" prop="licenseExpiryDate" :required="isFieldRequired('licenseExpiryDate')">
                <el-date-picker
                  v-model="formData.licenseExpiryDate"
                  type="date"
                  placeholder="请选择有效期"
                  style="width: 100%"
                  :class="{ 'missing-field': isMissingField('licenseExpiryDate') }"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="营业执照号" prop="businessLicenseNumber">
                <el-input
                  v-model="formData.businessLicenseNumber"
                  placeholder="请输入营业执照号（民办园）"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="组织机构代码" prop="organizationCode">
                <el-input
                  v-model="formData.organizationCode"
                  placeholder="请输入组织机构代码"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="税务登记号" prop="taxNumber">
                <el-input
                  v-model="formData.taxNumber"
                  placeholder="请输入税务登记号"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤2: 办园条件 -->
        <div v-show="currentStep === 1" class="step-content">
          <h3 class="step-title">🏫 办园条件</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="户外活动面积" prop="outdoorArea">
                <el-input-number
                  v-model="formData.outdoorArea"
                  :min="0"
                  placeholder="请输入户外活动面积"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>平方米</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="室内活动面积" prop="indoorArea">
                <el-input-number
                  v-model="formData.indoorArea"
                  :min="0"
                  placeholder="请输入室内活动面积"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>平方米</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="绿化面积" prop="greenArea">
                <el-input-number
                  v-model="formData.greenArea"
                  :min="0"
                  placeholder="请输入绿化面积"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>平方米</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运动场地面积" prop="playgroundArea">
                <el-input-number
                  v-model="formData.playgroundArea"
                  :min="0"
                  placeholder="请输入运动场地面积"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>平方米</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="教室数量" prop="classroomCount">
                <el-input-number
                  v-model="formData.classroomCount"
                  :min="0"
                  placeholder="请输入教室数量"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>间</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="活动室数量" prop="activityRoomCount">
                <el-input-number
                  v-model="formData.activityRoomCount"
                  :min="0"
                  placeholder="请输入活动室数量"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>间</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤3: 人员配置 -->
        <div v-show="currentStep === 2" class="step-content">
          <h3 class="step-title">👥 人员配置</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="园长资格证号" prop="principalQualification" :required="isFieldRequired('principalQualification')">
                <el-input
                  v-model="formData.principalQualification"
                  placeholder="请输入园长资格证号"
                  :class="{ 'missing-field': isMissingField('principalQualification') }"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="园长学历" prop="principalEducation">
                <el-select
                  v-model="formData.principalEducation"
                  placeholder="请选择园长学历"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <el-option label="博士" value="博士" />
                  <el-option label="硕士" value="硕士" />
                  <el-option label="本科" value="本科" />
                  <el-option label="专科" value="专科" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="园长工作年限" prop="principalWorkYears">
                <el-input-number
                  v-model="formData.principalWorkYears"
                  :min="0"
                  placeholder="请输入工作年限"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>年</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="持证教师数" prop="qualifiedTeacherCount" :required="isFieldRequired('qualifiedTeacherCount')">
                <el-input-number
                  v-model="formData.qualifiedTeacherCount"
                  :min="0"
                  placeholder="请输入持证教师数"
                  style="width: 100%"
                  :class="{ 'missing-field': isMissingField('qualifiedTeacherCount') }"
                  @change="handleFieldChange"
                >
                  <template #append>人</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="本科学历教师数" prop="bachelorTeacherCount">
                <el-input-number
                  v-model="formData.bachelorTeacherCount"
                  :min="0"
                  placeholder="请输入本科学历教师数"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>人</template>
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保育员数" prop="nurseCount">
                <el-input-number
                  v-model="formData.nurseCount"
                  :min="0"
                  placeholder="请输入保育员数"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <template #append>人</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤4: 行政信息 -->
        <div v-show="currentStep === 3" class="step-content">
          <h3 class="step-title">🏛️ 行政信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="城市级别" prop="cityLevel" :required="isFieldRequired('cityLevel')">
                <el-select
                  v-model="formData.cityLevel"
                  placeholder="请选择城市级别"
                  style="width: 100%"
                  :class="{ 'missing-field': isMissingField('cityLevel') }"
                  @change="handleFieldChange"
                >
                  <el-option label="一线城市" value="tier1" />
                  <el-option label="二线城市" value="tier2" />
                  <el-option label="三线城市" value="tier3" />
                  <el-option label="县城" value="county" />
                  <el-option label="乡镇" value="township" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主管教育局" prop="educationBureau" :required="isFieldRequired('educationBureau')">
                <el-input
                  v-model="formData.educationBureau"
                  placeholder="请输入主管教育局"
                  :class="{ 'missing-field': isMissingField('educationBureau') }"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="责任督学姓名" prop="supervisorName">
                <el-input
                  v-model="formData.supervisorName"
                  placeholder="请输入责任督学姓名"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任督学电话" prop="supervisorPhone">
                <el-input
                  v-model="formData.supervisorPhone"
                  placeholder="请输入责任督学电话"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤5: 其他信息 -->
        <div v-show="currentStep === 4" class="step-content">
          <h3 class="step-title">📋 其他信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="是否普惠园" prop="isPuhuiKindergarten">
                <el-switch
                  v-model="formData.isPuhuiKindergarten"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.isPuhuiKindergarten">
              <el-form-item label="普惠认定日期" prop="puhuiRecognitionDate">
                <el-date-picker
                  v-model="formData.puhuiRecognitionDate"
                  type="date"
                  placeholder="请选择认定日期"
                  style="width: 100%"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="当前等级" prop="currentGrade">
                <el-select
                  v-model="formData.currentGrade"
                  placeholder="请选择当前等级"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <el-option label="一级园" value="一级" />
                  <el-option label="二级园" value="二级" />
                  <el-option label="三级园" value="三级" />
                  <el-option label="未定级" value="未定级" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.currentGrade && formData.currentGrade !== '未定级'">
              <el-form-item label="等级评定日期" prop="gradeEvaluationDate">
                <el-date-picker
                  v-model="formData.gradeEvaluationDate"
                  type="date"
                  placeholder="请选择评定日期"
                  style="width: 100%"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="消防验收合格" prop="fireControlCertified">
                <el-switch
                  v-model="formData.fireControlCertified"
                  @change="handleFieldChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="食品经营许可证号" prop="foodLicenseNumber">
                <el-input
                  v-model="formData.foodLicenseNumber"
                  placeholder="请输入食品经营许可证号"
                  @input="handleFieldChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button v-if="currentStep > 0" @click="handlePrevStep">
          <UnifiedIcon name="ArrowLeft" />
          上一步
        </el-button>
        <el-button v-if="currentStep < steps.length - 1" type="primary" @click="handleNextStep">
          下一步
          <UnifiedIcon name="ArrowRight" />
        </el-button>
        <el-button type="success" @click="handleSave" :loading="saving">
          <UnifiedIcon name="Check" />
          保存全部
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  CircleCheckFilled, ArrowLeft, ArrowRight, Check
} from '@element-plus/icons-vue';
import { getCompleteness, batchUpdateBaseInfo, getFieldConfig } from '@/api/endpoints/kindergarten';

const router = useRouter();
const route = useRoute();

// 数据
const formRef = ref();
const currentStep = ref(0);
const saving = ref(false);

const steps = [
  { title: '证照信息', description: '办学许可证等证照信息' },
  { title: '办园条件', description: '场地面积、设施设备' },
  { title: '人员配置', description: '园长、教师等人员信息' },
  { title: '行政信息', description: '城市级别、主管部门' },
  { title: '其他信息', description: '普惠认定、等级评定等' }
];

const completeness = ref({
  score: 0,
  level: 'incomplete',
  levelDescription: '信息不完整',
  missingRequired: [],
  missingRecommended: [],
  canUseAdvancedFeatures: false,
  message: ''
});

const requiredFields = ref<any[]>([]);
const recommendedFields = ref<any[]>([]);
const optionalFields = ref<any[]>([]);

const formData = ref<any>({
  // 证照信息
  licenseNumber: '',
  licenseIssueDate: null,
  licenseExpiryDate: null,
  businessLicenseNumber: '',
  organizationCode: '',
  taxNumber: '',
  // 办园条件
  outdoorArea: null,
  indoorArea: null,
  greenArea: null,
  playgroundArea: null,
  classroomCount: null,
  activityRoomCount: null,
  // 人员配置
  principalQualification: '',
  principalEducation: '',
  principalWorkYears: null,
  qualifiedTeacherCount: null,
  bachelorTeacherCount: null,
  nurseCount: null,
  // 行政信息
  cityLevel: '',
  educationBureau: '',
  supervisorName: '',
  supervisorPhone: '',
  // 其他信息
  isPuhuiKindergarten: false,
  puhuiRecognitionDate: null,
  currentGrade: '',
  gradeEvaluationDate: null,
  fireControlCertified: false,
  foodLicenseNumber: ''
});

const formRules = ref({});

// 计算属性
const getProgressColor = (score: number) => {
  if (score >= 90) return 'var(--success-color)';
  if (score >= 70) return 'var(--warning-color)';
  if (score >= 50) return 'var(--danger-color)';
  return 'var(--info-color)';
};

const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    incomplete: 'danger',
    basic: 'warning',
    good: 'primary',
    excellent: 'success'
  };
  return map[level] || 'info';
};

const isFieldRequired = (fieldName: string) => {
  return requiredFields.value.some(f => f.name === fieldName);
};

const isMissingField = (fieldName: string) => {
  return completeness.value.missingRequired.includes(fieldName);
};

// 方法
const handleFieldChange = () => {
  // 实时计算完整度（防抖）
  // TODO: 实现防抖计算
};

const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleNextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const response = await batchUpdateBaseInfo(formData.value);
    if (response.success) {
      ElMessage.success('保存成功');
      // 重新加载完整度
      await loadCompleteness();
      
      // 如果解锁了高级功能，提示用户
      if (response.data.completeness.canUseAdvancedFeatures) {
        ElMessage.success('恭喜！您已解锁所有高级功能');
      }
    }
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

// 加载数据
const loadCompleteness = async () => {
  try {
    const response = await getCompleteness();
    if (response.success) {
      completeness.value = response.data;
    }
  } catch (error) {
    console.error('加载完整度失败:', error);
  }
};

const loadFieldConfig = async () => {
  try {
    const response = await getFieldConfig();
    if (response.success) {
      requiredFields.value = response.data.required;
      recommendedFields.value = response.data.recommended;
      optionalFields.value = response.data.optional;
    }
  } catch (error) {
    console.error('加载字段配置失败:', error);
  }
};

onMounted(() => {
  loadCompleteness();
  loadFieldConfig();
  
  // 如果URL参数中有highlight=missing，高亮显示缺失字段
  if (route.query.highlight === 'missing') {
    // TODO: 滚动到第一个缺失字段
  }
});
</script>

<style scoped lang="scss">
.base-info-complete {
  padding: var(--text-2xl);

  .page-header {
    margin-bottom: var(--text-2xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }

  .progress-card {
    margin-bottom: var(--text-2xl);

    .progress-content {
      display: flex;
      gap: var(--spacing-8xl);

      .progress-left {
        .progress-circle {
          .percentage-value {
            display: block;
            font-size: var(--text-3xl);
            font-weight: bold;
          }

          .percentage-label {
            display: block;
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }

      .progress-right {
        flex: 1;

        h3 {
          margin: 0 0 var(--text-lg) 0;
          font-size: var(--text-xl);
        }

        .progress-stats {
          margin-bottom: var(--text-lg);

          .stat-item {
            margin-bottom: var(--spacing-sm);

            .stat-label {
              color: var(--text-secondary);
            }

            .stat-value {
              font-weight: bold;
              margin-left: var(--spacing-sm);
            }
          }
        }

        .unlock-features {
          h4 {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-base);
          }

          ul {
            margin: 0;
            padding-left: var(--text-2xl);

            li {
              margin-bottom: var(--spacing-xs);
              color: var(--text-secondary);
            }
          }
        }

        .unlock-success {
          .success-title {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }

  .steps-card {
    margin-bottom: var(--text-2xl);
  }

  .form-card {
    .step-content {
      padding: var(--text-2xl) 0;

      .step-title {
        margin: 0 0 var(--text-2xl) 0;
        font-size: var(--text-xl);
        padding-bottom: var(--text-sm);
        border-bottom: var(--transform-drop) solid #eee;
      }
    }

    .form-actions {
      margin-top: var(--spacing-8xl);
      padding-top: var(--text-2xl);
      border-top: var(--z-index-dropdown) solid #eee;
      display: flex;
      justify-content: center;
      gap: var(--text-sm);
    }
  }

  :deep(.missing-field) {
    .el-input__wrapper {
      box-shadow: 0 0 0 var(--border-width-base) var(--danger-color) inset;
    }
  }
}
</style>

