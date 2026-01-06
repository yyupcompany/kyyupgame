<template>
  <div class="formula-reference">
    <div class="formula-category" v-for="category in formulaCategories" :key="category.title">
      <h4 @click="toggleCategory(category.title)" class="category-title">
        {{ category.icon }} {{ category.title }}
        <span class="toggle-icon" :class="{ expanded: expandedCategories.includes(category.title) }">
          ▼
        </span>
      </h4>

      <div class="formulas-list" v-show="expandedCategories.includes(category.title)">
        <div
          v-for="formula in category.formulas"
          :key="formula.name"
          class="formula-item"
          @click="selectFormula(formula)"
          :class="{ active: selectedFormula?.name === formula.name }"
        >
          <div class="formula-header">
            <span class="formula-name">{{ formula.name }}</span>
            <span class="formula-symbol">{{ formula.symbol }}</span>
          </div>
          <div class="formula-expression">{{ formula.formula }}</div>
          <div class="formula-description">{{ formula.description }}</div>
        </div>
      </div>
    </div>

    <!-- 公式详情弹窗 -->
    <div v-if="selectedFormula" class="formula-detail">
      <div class="detail-header">
        <h5>{{ selectedFormula.name }}</h5>
        <el-button @click="closeFormulaDetail" size="small" type="text" class="close-btn">
          ✕
        </el-button>
      </div>
      <div class="detail-content">
        <div class="formula-display">
          {{ selectedFormula.formula }}
        </div>
        <div class="formula-variables">
          <h6>变量说明：</h6>
          <div class="variable-list">
            <div
              v-for="variable in selectedFormula.variables"
              :key="variable.symbol"
              class="variable-item"
            >
              <span class="variable-symbol">{{ variable.symbol }}:</span>
              <span class="variable-meaning">{{ variable.meaning }}</span>
              <span class="variable-unit">({{ variable.unit }})</span>
            </div>
          </div>
        </div>
        <div class="formula-example">
          <h6>计算示例：</h6>
          <div class="example-content">{{ selectedFormula.example }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Variable {
  symbol: string
  meaning: string
  unit: string
}

interface Formula {
  name: string
  symbol: string
  formula: string
  description: string
  variables: Variable[]
  example: string
}

interface FormulaCategory {
  title: string
  icon: string
  formulas: Formula[]
}

const expandedCategories = ref<string>(['基础定律'])
const selectedFormula = ref<Formula | null>(null)

const formulaCategories: FormulaCategory[] = [
  {
    title: '基础定律',
    icon: '⚡',
    formulas: [
      {
        name: '欧姆定律',
        symbol: 'V = IR',
        formula: 'V = I × R',
        description: '电压等于电流乘以电阻',
        variables: [
          { symbol: 'V', meaning: '电压', unit: '伏特(V)' },
          { symbol: 'I', meaning: '电流', unit: '安培(A)' },
          { symbol: 'R', meaning: '电阻', unit: '欧姆(Ω)' }
        ],
        example: '如果电阻为10Ω，电流为2A，则电压 = 2A × 10Ω = 20V'
      },
      {
        name: '功率公式',
        symbol: 'P = VI',
        formula: 'P = V × I = I²R = V²/R',
        description: '电功率等于电压乘以电流',
        variables: [
          { symbol: 'P', meaning: '功率', unit: '瓦特(W)' },
          { symbol: 'V', meaning: '电压', unit: '伏特(V)' },
          { symbol: 'I', meaning: '电流', unit: '安培(A)' },
          { symbol: 'R', meaning: '电阻', unit: '欧姆(Ω)' }
        ],
        example: '如果电压为12V，电流为1A，则功率 = 12V × 1A = 12W'
      },
      {
        name: '电能公式',
        symbol: 'E = Pt',
        formula: 'E = P × t = VIt',
        description: '电能等于功率乘以时间',
        variables: [
          { symbol: 'E', meaning: '电能', unit: '焦耳(J)' },
          { symbol: 'P', meaning: '功率', unit: '瓦特(W)' },
          { symbol: 't', meaning: '时间', unit: '秒(s)' }
        ],
        example: '如果功率为60W，使用1小时，则电能 = 60W × 3600s = 216,000J'
      }
    ]
  },
  {
    title: '串联电路',
    icon: '🔗',
    formulas: [
      {
        name: '串联电阻',
        symbol: 'Rₜ = R₁ + R₂ + ...',
        formula: 'Rₜ = R₁ + R₂ + R₃ + ...',
        description: '串联电路总电阻等于各电阻之和',
        variables: [
          { symbol: 'Rₜ', meaning: '总电阻', unit: '欧姆(Ω)' },
          { symbol: 'R₁,R₂,R₃', meaning: '各分电阻', unit: '欧姆(Ω)' }
        ],
        example: '如果串联三个电阻10Ω、20Ω、30Ω，总电阻 = 10 + 20 + 30 = 60Ω'
      },
      {
        name: '串联电流',
        symbol: 'Iₜ = I₁ = I₂ = ...',
        formula: 'Iₜ = I₁ = I₂ = I₃ = ...',
        description: '串联电路电流处处相等',
        variables: [
          { symbol: 'Iₜ', meaning: '总电流', unit: '安培(A)' },
          { symbol: 'I₁,I₂,I₃', meaning: '各支路电流', unit: '安培(A)' }
        ],
        example: '如果电路中电流为2A，则每个元件的电流都是2A'
      },
      {
        name: '串联电压',
        symbol: 'Vₜ = V₁ + V₂ + ...',
        formula: 'Vₜ = V₁ + V₂ + V₃ + ...',
        description: '串联电路总电压等于各电压之和',
        variables: [
          { symbol: 'Vₜ', meaning: '总电压', unit: '伏特(V)' },
          { symbol: 'V₁,V₂,V₃', meaning: '各元件电压', unit: '伏特(V)' }
        ],
        example: '如果各元件电压分别为3V、5V、7V，总电压 = 3 + 5 + 7 = 15V'
      }
    ]
  },
  {
    title: '并联电路',
    icon: '🌐',
    formulas: [
      {
        name: '并联电压',
        symbol: 'Vₜ = V₁ = V₂ = ...',
        formula: 'Vₜ = V₁ = V₂ = V₃ = ...',
        description: '并联电路各支路电压相等',
        variables: [
          { symbol: 'Vₜ', meaning: '总电压', unit: '伏特(V)' },
          { symbol: 'V₁,V₂,V₃', meaning: '各支路电压', unit: '伏特(V)' }
        ],
        example: '如果电源电压为12V，并联各支路电压都是12V'
      },
      {
        name: '并联电流',
        symbol: 'Iₜ = I₁ + I₂ + ...',
        formula: 'Iₜ = I₁ + I₂ + I₃ + ...',
        description: '并联电路总电流等于各支路电流之和',
        variables: [
          { symbol: 'Iₜ', meaning: '总电流', unit: '安培(A)' },
          { symbol: 'I₁,I₂,I₃', meaning: '各支路电流', unit: '安培(A)' }
        ],
        example: '如果各支路电流为1A、2A、3A，总电流 = 1 + 2 + 3 = 6A'
      },
      {
        name: '并联电阻',
        symbol: '1/Rₜ = 1/R₁ + 1/R₂ + ...',
        formula: '1/Rₜ = 1/R₁ + 1/R₂ + 1/R₃ + ...',
        description: '并联电阻的倒数等于各电阻倒数之和',
        variables: [
          { symbol: 'Rₜ', meaning: '总电阻', unit: '欧姆(Ω)' },
          { symbol: 'R₁,R₂,R₃', meaning: '各分电阻', unit: '欧姆(Ω)' }
        ],
        example: '并联10Ω和20Ω电阻：1/Rₜ = 1/10 + 1/20 = 0.15，Rₜ ≈ 6.67Ω'
      }
    ]
  },
  {
    title: '电容电路',
    icon: '🔋',
    formulas: [
      {
        name: '电容定义',
        symbol: 'C = Q/V',
        formula: 'C = Q/V',
        description: '电容等于电荷量除以电压',
        variables: [
          { symbol: 'C', meaning: '电容', unit: '法拉(F)' },
          { symbol: 'Q', meaning: '电荷量', unit: '库仑(C)' },
          { symbol: 'V', meaning: '电压', unit: '伏特(V)' }
        ],
        example: '如果电荷量为2C，电压为10V，则电容 = 2C / 10V = 0.2F'
      },
      {
        name: '电容储能',
        symbol: 'E = ½CV²',
        formula: 'E = ½CV²',
        description: '电容器储存的能量',
        variables: [
          { symbol: 'E', meaning: '能量', unit: '焦耳(J)' },
          { symbol: 'C', meaning: '电容', unit: '法拉(F)' },
          { symbol: 'V', meaning: '电压', unit: '伏特(V)' }
        ],
        example: '如果电容为100μF，电压为50V，E = 0.5 × 0.0001F × 2500V² = 0.125J'
      },
      {
        name: '串联电容',
        symbol: '1/Cₜ = 1/C₁ + 1/C₂ + ...',
        formula: '1/Cₜ = 1/C₁ + 1/C₂ + 1/C₃ + ...',
        description: '串联电容的倒数等于各电容倒数之和',
        variables: [
          { symbol: 'Cₜ', meaning: '总电容', unit: '法拉(F)' },
          { symbol: 'C₁,C₂,C₃', meaning: '各分电容', unit: '法拉(F)' }
        ],
        example: '串联10μF和20μF：1/Cₜ = 1/10 + 1/20 = 0.15，Cₜ ≈ 6.67μF'
      }
    ]
  }
]

const toggleCategory = (title: string) => {
  const index = expandedCategories.value.indexOf(title)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(title)
  }
}

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
}

const closeFormulaDetail = () => {
  selectedFormula.value = null
}
</script>

<style scoped lang="scss">
.formula-reference {
  width: 100%;
  max-height: 600px;
  overflow-y: auto;
}

.formula-category {
  margin-bottom: var(--spacing-md);
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  overflow: hidden;
}

.category-title {
  background: #f8f9fa;
  padding: var(--spacing-md);
  margin: 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 600;
  color: #333;
  transition: background 0.3s ease;

  &:hover {
    background: #e9ecef;
  }

  .toggle-icon {
    transition: transform 0.3s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.formulas-list {
  background: white;
}

.formula-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &.active {
    background: #e3f2fd;
    border-left: 3px solid #2196F3;
  }

  &:last-child {
    border-bottom: none;
  }

  .formula-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);

    .formula-name {
      font-weight: 600;
      color: #333;
      font-size: var(--text-sm);
    }

    .formula-symbol {
      font-family: 'Courier New', monospace;
      color: #666;
      font-size: var(--text-xs);
    }
  }

  .formula-expression {
    font-family: 'Courier New', monospace;
    color: #2196F3;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    font-size: var(--text-sm);
  }

  .formula-description {
    color: #666;
    font-size: var(--text-xs);
    line-height: 1.4;
  }
}

.formula-detail {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid #e0e0e0;

  h5 {
    margin: 0;
    color: #333;
    font-size: var(--text-base);
  }

  .close-btn {
    font-size: var(--text-lg);
    color: #999;

    &:hover {
      color: #333;
    }
  }
}

.detail-content {
  padding: var(--spacing-lg);

  .formula-display {
    background: #f8f9fa;
    padding: var(--spacing-md);
    border-radius: var(--spacing-sm);
    font-family: 'Courier New', monospace;
    font-size: var(--text-base);
    color: #2196F3;
    text-align: center;
    font-weight: bold;
    margin-bottom: var(--spacing-lg);
  }

  .formula-variables {
    margin-bottom: var(--spacing-lg);

    h6 {
      margin: 0 0 var(--spacing-sm) 0;
      color: #333;
      font-size: var(--text-sm);
    }

    .variable-list {
      .variable-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .variable-symbol {
          min-width: 30px;
          font-weight: bold;
          color: #2196F3;
        }

        .variable-meaning {
          flex: 1;
          color: #666;
          font-size: var(--text-sm);
        }

        .variable-unit {
          color: #999;
          font-size: var(--text-xs);
          font-style: italic;
        }
      }
    }
  }

  .formula-example {
    h6 {
      margin: 0 0 var(--spacing-sm) 0;
      color: #333;
      font-size: var(--text-sm);
    }

    .example-content {
      background: #f0f8ff;
      padding: var(--spacing-md);
      border-radius: var(--spacing-sm);
      border-left: 3px solid #2196F3;
      color: #666;
      font-size: var(--text-sm);
      line-height: 1.5;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .formula-detail {
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    transform: none;
    max-width: none;
    max-height: none;
  }

  .formula-item {
    padding: var(--spacing-sm);

    .formula-header {
      .formula-name {
        font-size: var(--text-xs);
      }

      .formula-symbol {
        font-size: 11px;
      }
    }

    .formula-expression {
      font-size: var(--text-sm);
    }

    .formula-description {
      font-size: 11px;
    }
  }
}
</style>