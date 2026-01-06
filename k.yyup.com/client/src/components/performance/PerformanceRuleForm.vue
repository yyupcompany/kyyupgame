<template>
  <div class="performance-rule-form">
    <el-form 
      ref="formRef"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      :disabled="loading"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
      </el-form-item>
      
      <el-form-item label="规则类型" prop="type">
        <el-select v-model="ruleForm.type" placeholder="请选择规则类型">
          <el-option
            v-for="item in ruleTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="规则描述" prop="description">
        <el-input 
          v-model="ruleForm.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入规则描述"
        />
      </el-form-item>
      
      <el-form-item label="基础提成比例" prop="baseRate">
        <el-input-number 
          v-model="ruleForm.baseRate" 
          :min="0" 
          :max="100" 
          :step="0.5" 
          :precision="1"
          :controls="true"
        />
        <span class="unit">%</span>
      </el-form-item>
      
      <el-divider content-position="left">梯度提成配置</el-divider>
      
      <div class="tier-rules">
        <div v-for="(tier, index) in ruleForm.tiers" :key="index" class="tier-item">
          <div class="tier-header">
            <span class="tier-title">梯度 {{ index + 1 }}</span>
            <el-button 
              v-if="index > 0" 
              type="danger" 
              size="small" 
              circle 
              @click="removeTier(index)"
              :icon="Delete"
            />
          </div>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item :label="index === 0 ? '招生人数 ≥' : '招生人数 ≥'" :prop="`tiers.${index}.minCount`">
                <el-input-number 
                  v-model="tier.minCount" 
                  :min="index === 0 ? 1 : ruleForm.tiers[index-1].minCount + 1" 
                  :step="1" 
                  :controls="true"
                />
                <span class="unit">人</span>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="提成比例" :prop="`tiers.${index}.rate`">
                <el-input-number 
                  v-model="tier.rate" 
                  :min="0" 
                  :max="100" 
                  :step="0.5" 
                  :precision="1"
                  :controls="true"
                />
                <span class="unit">%</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <div class="add-tier">
          <el-button type="primary" @click="addTier" :icon="Plus">添加梯度</el-button>
        </div>
      </div>
      
      <template v-if="ruleForm.type === 'ENROLLMENT'">
        <el-divider content-position="left">班级提成配置</el-divider>
        
        <div class="class-rules">
          <div v-for="(classRule, index) in ruleForm.classRules" :key="index" class="class-item">
            <div class="class-header">
              <span class="class-title">班级规则 {{ index + 1 }}</span>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click="removeClass(index)"
                :icon="Delete"
              />
            </div>
            
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item label="班级类型" :prop="`classRules.${index}.classType`">
                  <el-select v-model="classRule.classType" placeholder="选择班级类型">
                    <el-option
                      v-for="item in classOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="提成比例" :prop="`classRules.${index}.rate`">
                  <el-input-number 
                    v-model="classRule.rate" 
                    :min="0" 
                    :max="100" 
                    :step="0.5" 
                    :precision="1"
                    :controls="true"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <div class="add-class">
            <el-button type="primary" @click="addClass" :icon="Plus">添加班级规则</el-button>
          </div>
        </div>
      </template>
      
      <template v-if="ruleForm.type === 'TRIAL_CLASS'">
        <el-divider content-position="left">体验课特殊规则</el-divider>
        
        <el-form-item label="转化奖励金额">
          <el-input-number 
            v-model="ruleForm.extraRules.conversionBonus" 
            :min="0" 
            :step="10" 
            :controls="true"
          />
          <span class="unit">元</span>
        </el-form-item>
      </template>
      
      <template v-if="ruleForm.type === 'ORDER'">
        <el-divider content-position="left">采单特殊规则</el-divider>
        
        <el-form-item label="最低订单金额">
          <el-input-number 
            v-model="ruleForm.extraRules.minOrderAmount" 
            :min="0" 
            :step="100" 
            :controls="true"
          />
          <span class="unit">元</span>
        </el-form-item>
      </template>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed, PropType } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { PRINCIPAL_ENDPOINTS } from '@/api/endpoints'
import { useOptionsData } from '@/composables/useRealApiData'
import { PERFORMANCE_ENDPOINTS, CLASS_ENDPOINTS } from '@/api/endpoints/hardcoded-data-replacements'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import type { PerformanceRule, PerformanceRuleType } from '../../api/modules/principal'

export default defineComponent({
  name: 'PerformanceRuleForm',
  components: {
    Plus,
    Delete
  },
  props: {
    rule: {
      type: Object as PropType<PerformanceRule | undefined>,
      default: undefined
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['success', 'cancel'],
  setup(props, { emit }) {
    const formRef = ref()
    const loading = ref(false)

    // 使用真实API获取规则类型选项
    const { options: ruleTypeOptions, loading: ruleTypeLoading } = useOptionsData(
      PERFORMANCE_ENDPOINTS.RULE_TYPES,
      {
        immediate: true,
        retryCount: 2,
        onError: (error) => {
          console.error('加载规则类型失败:', error);
          ElMessage.error('加载规则类型失败');
        }
      }
    )

    // 使用真实API获取班级类型选项
    const { options: classOptions, loading: classOptionsLoading } = useOptionsData(
      CLASS_ENDPOINTS.CLASS_TYPES,
      {
        immediate: true,
        retryCount: 2,
        onError: (error) => {
          console.error('加载班级类型失败:', error);
          ElMessage.error('加载班级类型失败');
        }
      }
    )
    
    // 表单数据
    const ruleForm = reactive({
      name: '',
      type: 'ENROLLMENT' as PerformanceRuleType,
      description: '',
      baseRate: 5.0,
      tiers: [
        { minCount: 1, rate: 5.0 }
      ],
      classRules: [] as Array<{ classType: string; rate: number }>,
      extraRules: {
        conversionBonus: 100,
        minOrderAmount: 500
      },
      isActive: true
    })
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入规则名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择规则类型', trigger: 'change' }
      ],
      baseRate: [
        { required: true, message: '请输入基础提成比例', trigger: 'blur' }
      ]
    }
    
    // 如果是编辑模式，加载规则数据
    if (props.isEdit && props.rule) {
      Object.assign(ruleForm, props.rule)
      
      // 确保数据结构完整
      if (!ruleForm.tiers || !ruleForm.tiers.length) {
        ruleForm.tiers = [{ minCount: 1, rate: ruleForm.baseRate }]
      }
      
      if (!ruleForm.classRules) {
        ruleForm.classRules = []
      }
      
      if (!ruleForm.extraRules) {
        ruleForm.extraRules = {
          conversionBonus: 100,
          minOrderAmount: 500
        }
      }
    }
    
    // 监听规则类型变化
    watch(() => ruleForm.type, (newType) => {
      // 根据规则类型初始化特定字段
      if (newType === 'ENROLLMENT' && ruleForm.classRules.length === 0) {
        ruleForm.classRules = [
          { classType: 'PREMIUM', rate: ruleForm.baseRate + 2.0 }
        ]
      }
      
      if (newType === 'TRIAL_CLASS' && !ruleForm.extraRules.conversionBonus) {
        ruleForm.extraRules.conversionBonus = 100
      }
      
      if (newType === 'ORDER' && !ruleForm.extraRules.minOrderAmount) {
        ruleForm.extraRules.minOrderAmount = 500
      }
    })
    
    // 添加梯度
    const addTier = () => {
      const lastTier = ruleForm.tiers[ruleForm.tiers.length - 1]
      ruleForm.tiers.push({
        minCount: lastTier.minCount + 10,
        rate: lastTier.rate + 2.0
      })
    }
    
    // 移除梯度
    const removeTier = (index: number) => {
      ruleForm.tiers.splice(index, 1)
    }
    
    // 添加班级规则
    const addClass = () => {
      // 查找未添加的班级类型
      const existingTypes = ruleForm.classRules.map(rule => rule.classType)
      const availableTypes = classOptions.filter(option => !existingTypes.includes(option.value))
      
      if (availableTypes.length > 0) {
        ruleForm.classRules.push({
          classType: availableTypes[0].value,
          rate: ruleForm.baseRate
        })
      } else {
        ElMessage.warning('所有班级类型已添加')
      }
    }
    
    // 移除班级规则
    const removeClass = (index: number) => {
      ruleForm.classRules.splice(index, 1)
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
          try {
            loading.value = true
            
            let res
            if (props.isEdit && props.rule) {
              res = await request.put(PRINCIPAL_ENDPOINTS.PERFORMANCE_RULE_UPDATE(props.rule.id), ruleForm)
            } else {
              res = await request.post(PRINCIPAL_ENDPOINTS.PERFORMANCE_RULES, ruleForm)
            }
            
            if (res.success) {
              ElMessage.success(res.message || (props.isEdit ? '更新成功' : '创建成功'))
              emit('success', res.data)
            } else {
              ElMessage.error(res.message || '操作失败')
            }
          } catch (error) {
            console.error('保存绩效规则失败:', error)
            ElMessage.error('保存绩效规则失败')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    // 取消
    const cancel = () => {
      emit('cancel')
    }
    
    return {
      formRef,
      loading,
      ruleForm,
      rules,
      ruleTypeOptions,
      classOptions,
      addTier,
      removeTier,
      addClass,
      removeClass,
      submitForm,
      cancel,
      Plus,
      Delete
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.performance-rule-form {
  .unit {
    margin-left: var(--spacing-sm);
    color: var(--text-regular);
  }
  
  .tier-rules, .class-rules {
    margin-bottom: var(--spacing-xl);
    
    .tier-item, .class-item {
      margin-bottom: var(--text-lg);
      padding: var(--text-base);
      border: var(--border-width) solid var(--border-color-lighter);
      border-radius: var(--spacing-xs);
      
      .tier-header, .class-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-lg);
        
        .tier-title, .class-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
    
    .add-tier, .add-class {
      display: flex;
      justify-content: center;
      margin-top: var(--text-lg);
    }
  }
}
</style> 