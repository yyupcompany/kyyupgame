<template>
  <div class="text-analysis-container">
    <!-- 页面头部 -->
    <div class="analysis-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <UnifiedIcon name="default" />
            AI文本分析
          </h1>
          <p>智能文本分析与自然语言处理工具</p>
        </div>
        <div class="header-actions">
          <el-button @click="handleClearAll">
            <UnifiedIcon name="Delete" />
            清空
          </el-button>
          <el-button @click="handleExportResults">
            <UnifiedIcon name="Download" />
            导出结果
          </el-button>
          <el-button type="primary" @click="handleAnalyze" :loading="analyzing">
            <UnifiedIcon name="default" />
            {{ analyzing ? '分析中...' : '开始分析' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 文本输入区域 -->
    <div class="input-section">
      <el-card shadow="hover">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="Edit" />
            <h3>文本输入</h3>
          </div>
        </template>
        
        <div class="input-controls">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-select v-model="analysisConfig.language" placeholder="选择语言">
                <el-option label="中文" value="zh" />
                <el-option label="英文" value="en" />
                <el-option label="自动检测" value="auto" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-select v-model="analysisConfig.analysisType" placeholder="分析类型">
                <el-option label="综合分析" value="comprehensive" />
                <el-option label="情感分析" value="sentiment" />
                <el-option label="关键词提取" value="keywords" />
                <el-option label="文本摘要" value="summary" />
              </el-select>
            </el-col>
          </el-row>
        </div>
        
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="8"
          placeholder="请输入要分析的文本内容..."
          show-word-limit
          maxlength="5000"
          class="text-input"
        />
        
        <div class="input-actions">
          <el-upload
            :show-file-list="false"
            :before-upload="handleFileUpload"
            accept=".txt,.doc,.docx"
          >
            <el-button>
              <UnifiedIcon name="Upload" />
              上传文件
            </el-button>
          </el-upload>
          
          <el-button @click="handleSampleText">
            <UnifiedIcon name="default" />
            使用示例文本
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 分析结果区域 -->
    <div v-if="analysisResults" class="results-section">
      <!-- 基础信息 -->
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon text">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analysisResults.basicInfo.wordCount }}</div>
                <div class="stat-label">字符数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon sentence">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analysisResults.basicInfo.sentenceCount }}</div>
                <div class="stat-label">句子数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon language">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analysisResults.basicInfo.language }}</div>
                <div class="stat-label">检测语言</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon sentiment" :class="getSentimentClass()">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ analysisResults.sentiment.score.toFixed(1) }}</div>
                <div class="stat-label">情感评分</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细分析结果 -->
      <el-row :gutter="24" class="analysis-details">
        <!-- 情感分析 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="section-header">
                <UnifiedIcon name="default" />
                <h3>情感分析</h3>
              </div>
            </template>
            
            <div class="sentiment-analysis">
              <div class="sentiment-overview">
                <div class="sentiment-score" :class="getSentimentClass()">
                  {{ analysisResults.sentiment.label }}
                </div>
                <div class="sentiment-confidence">
                  置信度: {{ (analysisResults.sentiment.confidence * 100).toFixed(1) }}%
                </div>
              </div>
              
              <div class="sentiment-breakdown">
                <div class="sentiment-item" v-for="item in analysisResults.sentiment.breakdown" :key="item.type">
                  <div class="sentiment-type">{{ item.type }}</div>
                  <el-progress
                    :percentage="item.percentage"
                    :color="getSentimentColor(item.type)"
                    :show-text="false"
                  />
                  <div class="sentiment-value">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 关键词提取 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="section-header">
                <UnifiedIcon name="default" />
                <h3>关键词提取</h3>
              </div>
            </template>
            
            <div class="keywords-analysis">
              <div class="keywords-cloud">
                <el-tag
                  v-for="keyword in analysisResults.keywords"
                  :key="keyword.word"
                  :size="getKeywordSize(keyword.weight)"
                  :type="getKeywordType(keyword.weight)"
                  class="keyword-tag"
                >
                  {{ keyword.word }}
                  <span class="keyword-weight">({{ keyword.weight.toFixed(2) }})</span>
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 文本摘要 -->
      <el-card shadow="hover" class="summary-card">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h3>文本摘要</h3>
          </div>
        </template>
        
        <div class="text-summary">
          <p class="summary-text">{{ analysisResults.summary }}</p>
          <div class="summary-stats">
            <span>原文长度: {{ inputText.length }} 字符</span>
            <span>摘要长度: {{ analysisResults.summary.length }} 字符</span>
            <span>压缩比: {{ ((1 - analysisResults.summary.length / inputText.length) * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </el-card>

      <!-- 语言特征分析 -->
      <el-card shadow="hover" class="features-card">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <h3>语言特征分析</h3>
          </div>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="feature-item">
              <h4>词性分布</h4>
              <div class="pos-tags">
                <div v-for="pos in analysisResults.features.posDistribution" :key="pos.tag" class="pos-item">
                  <span class="pos-tag">{{ pos.tag }}</span>
                  <el-progress :percentage="pos.percentage" :show-text="false" />
                  <span class="pos-count">{{ pos.count }}</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-item">
              <h4>句子复杂度</h4>
              <div class="complexity-metrics">
                <div class="metric-item">
                  <span class="metric-label">平均句长:</span>
                  <span class="metric-value">{{ analysisResults.features.avgSentenceLength }} 字</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">复杂度评分:</span>
                  <span class="metric-value">{{ analysisResults.features.complexityScore }}/10</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">可读性:</span>
                  <span class="metric-value">{{ analysisResults.features.readabilityLevel }}</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="feature-item">
              <h4>文本类型</h4>
              <div class="text-classification">
                <div v-for="category in analysisResults.features.textCategories" :key="category.name" class="category-item">
                  <span class="category-name">{{ category.name }}</span>
                  <el-progress :percentage="category.confidence * 100" :show-text="false" />
                  <span class="category-confidence">{{ (category.confidence * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound, Delete, Download, MagicStick, Edit, Upload, Document,
  List, Star, Key, Reading, DataAnalysis, Happy, Sad, Warning
} from '@element-plus/icons-vue'

// 响应式数据
const analyzing = ref(false)
const inputText = ref('')
const analysisResults = ref(null)

// 分析配置
const analysisConfig = reactive({
  language: 'auto',
  analysisType: 'comprehensive'
})

// 方法
const handleAnalyze = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入要分析的文本内容')
    return
  }
  
  analyzing.value = true
  
  try {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟分析结果
    analysisResults.value = {
      basicInfo: {
        wordCount: inputText.value.length,
        sentenceCount: inputText.value.split(/[。！？.!?]/).filter(s => s.trim()).length,
        language: analysisConfig.language === 'auto' ? '中文' : (analysisConfig.language === 'zh' ? '中文' : '英文')
      },
      sentiment: {
        score: 7.5,
        label: '积极',
        confidence: 0.85,
        breakdown: [
          { type: '积极', percentage: 65 },
          { type: '中性', percentage: 25 },
          { type: '消极', percentage: 10 }
        ]
      },
      keywords: [
        { word: '教育', weight: 0.95 },
        { word: '幼儿园', weight: 0.88 },
        { word: '学习', weight: 0.76 },
        { word: '发展', weight: 0.65 },
        { word: '孩子', weight: 0.58 },
        { word: '成长', weight: 0.45 },
        { word: '培养', weight: 0.38 },
        { word: '环境', weight: 0.32 }
      ],
      summary: '这是一段关于幼儿园教育的文本，主要讨论了儿童的学习和发展，强调了良好教育环境对孩子成长的重要性。',
      features: {
        posDistribution: [
          { tag: '名词', count: 45, percentage: 35 },
          { tag: '动词', count: 32, percentage: 25 },
          { tag: '形容词', count: 25, percentage: 20 },
          { tag: '副词', count: 15, percentage: 12 },
          { tag: '其他', count: 10, percentage: 8 }
        ],
        avgSentenceLength: 18,
        complexityScore: 6.5,
        readabilityLevel: '中等',
        textCategories: [
          { name: '教育类', confidence: 0.92 },
          { name: '说明文', confidence: 0.78 },
          { name: '正式文本', confidence: 0.65 }
        ]
      }
    }
    
    ElMessage.success('文本分析完成')
  } catch (error) {
    ElMessage.error('分析失败，请稍后重试')
  } finally {
    analyzing.value = false
  }
}

const handleClearAll = () => {
  inputText.value = ''
  analysisResults.value = null
  ElMessage.info('已清空所有内容')
}

const handleExportResults = () => {
  if (!analysisResults.value) {
    ElMessage.warning('暂无分析结果可导出')
    return
  }
  ElMessage.success('分析结果导出中...')
}

const handleFileUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target?.result as string
    ElMessage.success('文件上传成功')
  }
  reader.readAsText(file)
  return false
}

const handleSampleText = () => {
  inputText.value = `我们的幼儿园致力于为每一个孩子提供最优质的教育环境。通过科学的教学方法和丰富的活动安排，我们帮助孩子们在快乐中学习，在游戏中成长。我们相信，每个孩子都是独特的个体，都有自己的天赋和潜能。我们的使命就是发现并培养这些潜能，让每个孩子都能在这里找到属于自己的成长道路。`
  ElMessage.success('已加载示例文本')
}

// 工具方法
const getSentimentClass = () => {
  if (!analysisResults.value) return ''
  const score = analysisResults.value.sentiment.score
  if (score >= 7) return 'positive'
  if (score >= 4) return 'neutral'
  return 'negative'
}

const getSentimentIcon = () => {
  if (!analysisResults.value) return 'Warning'
  const score = analysisResults.value.sentiment.score
  if (score >= 7) return 'Happy'
  if (score >= 4) return 'Warning'
  return 'Sad'
}

const getSentimentColor = (type: string) => {
  const colorMap = {
    '积极': 'var(--success-color)',
    '中性': 'var(--warning-color)',
    '消极': 'var(--danger-color)'
  }
  return colorMap[type] || 'var(--info-color)'
}

const getKeywordSize = (weight: number) => {
  if (weight >= 0.8) return 'large'
  if (weight >= 0.5) return 'default'
  return 'small'
}

const getKeywordType = (weight: number) => {
  if (weight >= 0.8) return 'danger'
  if (weight >= 0.6) return 'warning'
  if (weight >= 0.4) return 'success'
  return 'info'
}
</script>

<style lang="scss">
.text-analysis-container {
  padding: var(--text-2xl);
  max-width: 100%; max-width: 1400px;
  margin: 0 auto;
}

.analysis-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-3xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: var(--text-sm);
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--text-sm);
      }
      
      p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.input-section {
  margin-bottom: var(--text-3xl);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    
    h3 {
      font-size: var(--text-xl);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  .input-controls {
    margin-bottom: var(--text-lg);
  }
  
  .text-input {
    margin-bottom: var(--text-lg);
  }
  
  .input-actions {
    display: flex;
    gap: var(--text-sm);
  }
}

.results-section {
  .stat-card {
    height: 100%;
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .stat-icon {
        width: auto;
        min-height: 60px; height: auto;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-3xl);
        
        &.text {
          background: #f0f9ff;
          color: var(--primary-color);
        }
        
        &.sentence {
          background: #f0fdf4;
          color: var(--success-color);
        }
        
        &.language {
          background: var(--bg-white)7ed;
          color: #f97316;
        }
        
        &.sentiment {
          &.positive {
            background: #f0fdf4;
            color: var(--success-color);
          }
          
          &.neutral {
            background: var(--bg-white)7ed;
            color: #f97316;
          }
          
          &.negative {
            background: #fef2f2;
            color: var(--danger-color);
          }
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-label {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }
  }
}

.analysis-details {
  margin-top: var(--text-3xl);
  
  .sentiment-analysis {
    .sentiment-overview {
      text-align: center;
      margin-bottom: var(--text-3xl);
      
      .sentiment-score {
        font-size: var(--text-3xl);
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
        
        &.positive {
          color: var(--success-color);
        }
        
        &.neutral {
          color: #f97316;
        }
        
        &.negative {
          color: var(--danger-color);
        }
      }
      
      .sentiment-confidence {
        color: var(--text-secondary);
        font-size: var(--text-base);
      }
    }
    
    .sentiment-breakdown {
      .sentiment-item {
        display: flex;
        align-items: center;
        gap: var(--text-sm);
        margin-bottom: var(--text-sm);
        
        .sentiment-type {
          width: auto;
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
        
        .el-progress {
          flex: 1;
        }
        
        .sentiment-value {
          width: auto;
          text-align: right;
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .keywords-analysis {
    .keywords-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      
      .keyword-tag {
        margin: 0;
        
        .keyword-weight {
          font-size: var(--text-sm);
          opacity: 0.7;
        }
      }
    }
  }
}

.summary-card, .features-card {
  margin-top: var(--text-3xl);
  
  .text-summary {
    .summary-text {
      font-size: var(--text-lg);
      line-height: 1.6;
      color: var(--color-gray-700);
      margin-bottom: var(--text-lg);
      padding: var(--text-lg);
      background: #f9fafb;
      border-radius: var(--spacing-sm);
      border-left: var(--spacing-xs) solid var(--primary-color);
    }
    
    .summary-stats {
      display: flex;
      gap: var(--text-3xl);
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }
  
  .feature-item {
    h4 {
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--text-lg);
    }
    
    .pos-tags {
      .pos-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        
        .pos-tag {
          width: auto;
          font-size: var(--text-sm);
          color: var(--color-gray-700);
        }
        
        .el-progress {
          flex: 1;
        }
        
        .pos-count {
          width: auto;
          text-align: right;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
    
    .complexity-metrics, .text-classification {
      .metric-item, .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-base);
        
        .metric-label, .category-name {
          color: var(--color-gray-700);
        }
        
        .metric-value, .category-confidence {
          color: var(--text-secondary);
          font-weight: 500;
        }
      }
      
      .category-item {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-xs);
        
        .el-progress {
          margin: var(--spacing-xs) 0;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .text-analysis-container {
    padding: var(--text-lg);
  }
  
  .analysis-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    text-align: center;
  }
  
  .analysis-details {
    .el-col {
      margin-bottom: var(--text-lg);
    }
  }
}
</style>
