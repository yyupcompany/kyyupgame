<template>
  <el-dialog
    v-model="visible"
    title="示例查询"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="examples-dialog">
      <!-- 搜索和分类 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索示例查询..."
              clearable
              @input="filterExamples"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              clearable
              @change="filterExamples"
            >
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 示例查询列表 -->
      <div class="examples-section">
        <div v-if="filteredExamples.length === 0 && !loading" class="empty-state">
          <el-empty description="没有找到匹配的示例查询">
            <el-button @click="resetFilters">清除筛选条件</el-button>
          </el-empty>
        </div>

        <div v-else class="examples-grid">
          <div
            v-for="(example, index) in paginatedExamples"
            :key="index"
            class="example-card"
            @click="selectExample(example)"
          >
            <div class="example-header">
              <div class="example-title">
                <h4>{{ example.title }}</h4>
                <el-tag 
                  size="small" 
                  :type="getCategoryTagType(example.category)"
                >
                  {{ example.category }}
                </el-tag>
              </div>
              <div class="example-difficulty">
                <el-tag 
                  size="small" 
                  :type="getDifficultyType(example.difficulty)"
                >
                  {{ getDifficultyText(example.difficulty) }}
                </el-tag>
              </div>
            </div>

            <div class="example-query">
              <p>{{ example.query }}</p>
            </div>

            <div class="example-description" v-if="example.description">
              <p>{{ example.description }}</p>
            </div>

            <div class="example-footer">
              <div class="expected-result" v-if="example.expectedResult">
                <span class="result-label">预期结果:</span>
                <span class="result-text">{{ example.expectedResult }}</span>
              </div>
              <div class="example-actions">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click.stop="useExample(example)"
                >
                  使用
                </el-button>
                <el-button 
                  size="small" 
                  @click.stop="previewExample(example)"
                >
                  预览
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section" v-if="totalCount > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[6, 12, 18]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 定义Props
interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// 定义Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [query: string]
}>()

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)

// 示例查询数据
const examples = ref([
  // 学生管理相关
  {
    title: '查询所有在读学生',
    category: '学生管理',
    difficulty: 'easy',
    query: '查询所有在读的学生信息',
    description: '获取当前所有状态为在读的学生基本信息',
    expectedResult: '学生姓名、班级、入学时间等信息'
  },
  {
    title: '按年龄查询学生',
    category: '学生管理',
    difficulty: 'easy',
    query: '查询年龄在3到5岁之间的学生',
    description: '根据年龄范围筛选学生',
    expectedResult: '符合年龄条件的学生列表'
  },
  {
    title: '查询特定班级学生',
    category: '学生管理',
    difficulty: 'easy',
    query: '查询小班的所有学生',
    description: '获取指定班级的学生信息',
    expectedResult: '小班所有学生的详细信息'
  },
  {
    title: '学生缴费情况统计',
    category: '学生管理',
    difficulty: 'medium',
    query: '统计每个班级的学生缴费情况',
    description: '按班级统计学生的缴费完成情况',
    expectedResult: '各班级缴费统计数据'
  },

  // 教师管理相关
  {
    title: '查询所有在职教师',
    category: '教师管理',
    difficulty: 'easy',
    query: '查询所有在职的教师信息',
    description: '获取当前在职教师的基本信息',
    expectedResult: '教师姓名、职位、入职时间等'
  },
  {
    title: '按学历查询教师',
    category: '教师管理',
    difficulty: 'easy',
    query: '查询学历为本科以上的教师',
    description: '根据学历条件筛选教师',
    expectedResult: '符合学历要求的教师列表'
  },
  {
    title: '教师工作量统计',
    category: '教师管理',
    difficulty: 'medium',
    query: '统计每位教师本月的工作量',
    description: '计算教师的课时、活动参与等工作量',
    expectedResult: '教师工作量统计表'
  },

  // 班级管理相关
  {
    title: '查询所有班级信息',
    category: '班级管理',
    difficulty: 'easy',
    query: '查询所有班级的基本信息',
    description: '获取幼儿园所有班级的详细信息',
    expectedResult: '班级名称、人数、负责教师等'
  },
  {
    title: '班级人数统计',
    category: '班级管理',
    difficulty: 'medium',
    query: '统计各个班级的学生人数',
    description: '计算每个班级当前的学生数量',
    expectedResult: '班级人数统计报表'
  },
  {
    title: '班级师生比分析',
    category: '班级管理',
    difficulty: 'medium',
    query: '分析各班级的师生比例',
    description: '计算并分析每个班级的师生配比情况',
    expectedResult: '师生比例分析报告'
  },

  // 招生管理相关
  {
    title: '查询招生计划',
    category: '招生管理',
    difficulty: 'easy',
    query: '查询今年的招生计划',
    description: '获取当前年度的招生计划详情',
    expectedResult: '招生计划表，包含各班级招生名额'
  },
  {
    title: '招生申请统计',
    category: '招生管理',
    difficulty: 'medium',
    query: '统计各个招生计划的申请情况',
    description: '分析招生申请的数量和状态分布',
    expectedResult: '招生申请统计报表'
  },
  {
    title: '招生转化率分析',
    category: '招生管理',
    difficulty: 'hard',
    query: '分析招生咨询到最终入学的转化率',
    description: '计算从咨询、申请到最终入学的各阶段转化率',
    expectedResult: '招生转化漏斗分析图'
  },

  // 活动管理相关
  {
    title: '查询近期活动',
    category: '活动管理',
    difficulty: 'easy',
    query: '查询本月的所有活动',
    description: '获取当月安排的所有活动信息',
    expectedResult: '活动列表，包含时间、地点、参与人数'
  },
  {
    title: '活动参与率统计',
    category: '活动管理',
    difficulty: 'medium',
    query: '统计各个活动的参与率',
    description: '计算活动的报名人数与实际参与人数比例',
    expectedResult: '活动参与率统计表'
  },
  {
    title: '热门活动分析',
    category: '活动管理',
    difficulty: 'medium',
    query: '分析最受欢迎的活动类型',
    description: '根据参与度分析哪些活动最受学生和家长欢迎',
    expectedResult: '活动受欢迎程度排行榜'
  },

  // 家长管理相关
  {
    title: '查询家长信息',
    category: '家长管理',
    difficulty: 'easy',
    query: '查询所有家长的联系方式',
    description: '获取家长的基本信息和联系方式',
    expectedResult: '家长通讯录'
  },
  {
    title: '家长满意度调查',
    category: '家长管理',
    difficulty: 'medium',
    query: '统计家长满意度调查结果',
    description: '分析家长对幼儿园各方面的满意度评分',
    expectedResult: '满意度调查统计报告'
  },

  // 数据分析相关
  {
    title: '学生年龄分布',
    category: '数据分析',
    difficulty: 'medium',
    query: '分析在读学生的年龄分布情况',
    description: '统计不同年龄段学生的数量分布',
    expectedResult: '年龄分布图表'
  },
  {
    title: '月度收入统计',
    category: '数据分析',
    difficulty: 'medium',
    query: '统计本年度每月的收入情况',
    description: '计算各月份的学费、活动费等收入',
    expectedResult: '月度收入趋势图'
  },
  {
    title: '教学质量分析',
    category: '数据分析',
    difficulty: 'hard',
    query: '分析各班级的教学质量指标',
    description: '综合评估各班级的教学效果和质量',
    expectedResult: '教学质量评估报告'
  },

  // 系统管理相关
  {
    title: '用户登录统计',
    category: '系统管理',
    difficulty: 'medium',
    query: '统计各用户角色的系统使用情况',
    description: '分析不同角色用户的系统访问频率',
    expectedResult: '用户活跃度统计表'
  },
  {
    title: '系统操作日志',
    category: '系统管理',
    difficulty: 'medium',
    query: '查询近一周的系统操作日志',
    description: '获取系统的重要操作记录',
    expectedResult: '操作日志详情列表'
  }
])

// 分类选项
const categories = [
  { label: '学生管理', value: '学生管理' },
  { label: '教师管理', value: '教师管理' },
  { label: '班级管理', value: '班级管理' },
  { label: '招生管理', value: '招生管理' },
  { label: '活动管理', value: '活动管理' },
  { label: '家长管理', value: '家长管理' },
  { label: '数据分析', value: '数据分析' },
  { label: '系统管理', value: '系统管理' }
]

// 计算属性
const filteredExamples = computed(() => {
  let filtered = [...examples.value]

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(example =>
      example.title.toLowerCase().includes(keyword) ||
      example.query.toLowerCase().includes(keyword) ||
      example.description?.toLowerCase().includes(keyword)
    )
  }

  // 按分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(example =>
      example.category === selectedCategory.value
    )
  }

  return filtered
})

const totalCount = computed(() => filteredExamples.value.length)

const paginatedExamples = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredExamples.value.slice(start, end)
})

// 方法
const filterExamples = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

const selectExample = (example: any) => {
  // 可以在这里添加选中效果
}

const useExample = (example: any) => {
  emit('select', example.query)
  handleClose()
}

const previewExample = (example: any) => {
  // 可以在这里添加预览功能
  console.log('预览示例:', example)
}

const getCategoryTagType = (category: string) => {
  const typeMap: { [key: string]: string } = {
    '学生管理': 'primary',
    '教师管理': 'success',
    '班级管理': 'warning',
    '招生管理': 'danger',
    '活动管理': 'info',
    '家长管理': 'primary',
    '数据分析': 'success',
    '系统管理': 'warning'
  }
  return typeMap[category] || 'default'
}

const getDifficultyType = (difficulty: string) => {
  const typeMap: { [key: string]: string } = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'default'
}

const getDifficultyText = (difficulty: string) => {
  const textMap: { [key: string]: string } = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return textMap[difficulty] || difficulty
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetFilters()
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  if (!newValue) {
    emit('update:modelValue', false)
  }
})

// 生命周期
onMounted(() => {
  visible.value = props.modelValue
})
</script>

<style scoped lang="scss">
.examples-dialog {
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding-bottom: var(--spacing-4xl);
    border-bottom: var(--z-index-dropdown) solid #ebeef5;
  }

  .examples-section {
    .empty-state {
      text-align: center;
      padding: var(--spacing-10xl) 0;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--text-2xl);
      min-min-height: 60px; height: auto;
      max-min-height: 60px; height: auto;
      overflow-y: auto;
      padding-right: var(--spacing-2xl);

      .example-card {
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        cursor: pointer;
        transition: all 0.3s;
        background: var(--bg-white);

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px var(--text-sm) var(--shadow-light);
          transform: translateY(var(--transform-hover-lift));
        }

        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--text-sm);

          .example-title {
            flex: 1;

            h4 {
              margin: 0 0 5px 0;
              font-size: var(--text-lg);
              color: var(--text-primary);
              line-height: 1.3;
            }
          }

          .example-difficulty {
            margin-left: var(--spacing-2xl);
          }
        }

        .example-query {
          margin-bottom: var(--text-sm);
          padding: var(--spacing-2xl);
          background: var(--bg-gray-light);
          border-radius: var(--spacing-xs);
          border-left: 3px solid var(--primary-color);

          p {
            margin: 0;
            font-size: var(--text-base);
            color: var(--text-primary);
            line-height: 1.4;
            font-weight: 500;
          }
        }

        .example-description {
          margin-bottom: var(--spacing-4xl);

          p {
            margin: 0;
            font-size: var(--text-sm);
            color: var(--text-regular);
            line-height: 1.4;
          }
        }

        .example-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;

          .expected-result {
            flex: 1;
            font-size: var(--text-sm);
            color: var(--info-color);

            .result-label {
              font-weight: 500;
            }

            .result-text {
              margin-left: var(--spacing-xs);
            }
          }

          .example-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-left: var(--spacing-2xl);
          }
        }
      }
    }

    .pagination-section {
      margin-top: var(--text-2xl);
      text-align: center;
      padding-top: var(--spacing-4xl);
      border-top: var(--z-index-dropdown) solid #ebeef5;
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .examples-dialog {
    .filter-section {
      .el-row {
        .el-col {
          margin-bottom: var(--spacing-2xl);
        }
      }
    }

    .examples-section {
      .examples-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-4xl);

        .example-card {
          .example-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-2xl);

            .example-actions {
              margin-left: 0;
              align-self: flex-end;
            }
          }
        }
      }
    }
  }
}

// 滚动条样式
.examples-grid::-webkit-scrollbar {
  width: auto;
}

.examples-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: var(--radius-xs);
}

.examples-grid::-webkit-scrollbar-thumb {
  background: var(--text-placeholder);
  border-radius: var(--radius-xs);

  &:hover {
    background: var(--text-tertiary);
  }
}
</style>