<template>
  <div class="kindergarten-ai-demo">
    <el-card class="header-card">
      <template #header>
        <div class="header-content">
          <h1>🎨 幼儿园AI智能配图演示</h1>
          <p class="subtitle">专为3-6岁幼儿园场景设计的AI图片生成系统</p>
        </div>
      </template>

      <div class="demo-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="🎯 专业场景" :value="6" suffix="种" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="🎨 图片风格" :value="3" suffix="种" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="👶 年龄段" :value="4" suffix="个" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="⚡ 生成速度" :value="5" suffix="秒" />
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧：配图生成器 -->
      <el-col :span="12">
        <el-card class="generator-card">
          <template #header>
            <h3>🚀 AI配图生成器</h3>
          </template>
          
          <div class="generator-content">
            <KindergartenImageGenerator
              :auto-use="false"
              @image-generated="handleImageGenerated"
              @image-used="handleImageUsed"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：生成历史和示例 -->
      <el-col :span="12">
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <h3>📸 生成历史</h3>
              <el-button size="small" @click="clearHistory" type="danger" plain>
                清空历史
              </el-button>
            </div>
          </template>

          <div v-if="generatedImages.length === 0" class="empty-history">
            <el-empty description="还没有生成过图片">
              <el-text type="info">使用左侧的AI配图生成器开始创作吧！</el-text>
            </el-empty>
          </div>

          <div v-else class="history-grid">
            <div
              v-for="(image, index) in generatedImages"
              :key="index"
              class="history-item"
            >
              <el-image
                :src="image.url"
                :preview-src-list="[image.url]"
                fit="cover"
                class="history-image"
              />
              <div class="image-info">
                <p class="image-prompt">{{ image.prompt }}</p>
                <div class="image-meta">
                  <el-tag size="small" type="success">{{ image.style }}</el-tag>
                  <el-tag size="small" type="info">{{ image.size }}</el-tag>
                </div>
                <div class="image-actions">
                  <el-button size="small" @click="downloadImage(image)">
                    📥 下载
                  </el-button>
                  <el-button size="small" @click="copyImageUrl(image)">
                    📋 复制链接
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 示例展示区 -->
    <el-card class="examples-card">
      <template #header>
        <h3>🌟 精选示例</h3>
      </template>

      <div class="examples-grid">
        <div
          v-for="example in examples"
          :key="example.id"
          class="example-item"
        >
          <div class="example-image">
            <img :src="example.image" :alt="example.title" />
            <div class="example-overlay">
              <el-button size="small" type="primary" @click="useExample(example)">
                🎨 生成类似图片
              </el-button>
            </div>
          </div>
          <div class="example-content">
            <h4>{{ example.title }}</h4>
            <p>{{ example.description }}</p>
            <div class="example-tags">
              <el-tag size="small">{{ example.category }}</el-tag>
              <el-tag size="small" type="warning">{{ example.ageGroup }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 功能特色 -->
    <el-card class="features-card">
      <template #header>
        <h3>✨ 功能特色</h3>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">🎯</div>
            <h4>专业幼教场景</h4>
            <p>针对3-6岁幼儿园环境优化，包含教室、操场、餐厅等6种专业场景</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h4>多样化风格</h4>
            <p>提供卡通可爱、自然温馨、真实摄影三种风格，满足不同需求</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h4>快速生成</h4>
            <p>平均5秒生成高质量图片，支持快速模板和自定义生成两种模式</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import KindergartenImageGenerator from '@/components/kindergarten/KindergartenImageGenerator.vue'

// 响应式数据
const generatedImages = ref<Array<{
  url: string
  prompt: string
  style: string
  size: string
  timestamp: number
}>>([])

// 示例数据
const examples = [
  {
    id: 1,
    title: '晨间锻炼',
    description: '小朋友们在操场上做早操，充满活力的一天开始了',
    image: '/demo/morning-exercise.jpg',
    category: '户外活动',
    ageGroup: '3-6岁',
    prompt: '3-6岁的小朋友们在幼儿园操场上做晨间锻炼，大家排成整齐的队伍，跟着老师一起做体操，阳光明媚，充满活力'
  },
  {
    id: 2,
    title: '美术课堂',
    description: '创意美术时间，孩子们发挥想象力创作属于自己的作品',
    image: '/demo/art-class.jpg',
    category: '室内教学',
    ageGroup: '4-6岁',
    prompt: '幼儿园美术教室里，小朋友们正在专心致志地画画，桌上摆满了彩色画笔和颜料，孩子们脸上洋溢着创作的快乐'
  },
  {
    id: 3,
    title: '故事时间',
    description: '温馨的阅读角落，老师为孩子们讲述精彩的故事',
    image: '/demo/story-time.jpg',
    category: '阅读活动',
    ageGroup: '3-5岁',
    prompt: '温馨的图书角，老师正在给围坐成圆圈的小朋友们讲故事，孩子们聚精会神地听着，眼中充满好奇和想象'
  },
  {
    id: 4,
    title: '快乐用餐',
    description: '营养丰富的午餐时间，培养良好的用餐习惯',
    image: '/demo/lunch-time.jpg',
    category: '生活习惯',
    ageGroup: '3-6岁',
    prompt: '幼儿园餐厅里，小朋友们坐在小桌子旁安静地用餐，餐具摆放整齐，营养丰富的饭菜，培养良好的用餐习惯'
  }
]

// 处理图片生成
const handleImageGenerated = (imageUrl: string) => {
  console.log('图片生成成功:', imageUrl)
}

// 处理图片使用
const handleImageUsed = (imageUrl: string) => {
  // 添加到历史记录
  generatedImages.value.unshift({
    url: imageUrl,
    prompt: '用户生成的图片',
    style: 'cartoon',
    size: '1024x768',
    timestamp: Date.now()
  })
  
  ElMessage.success('图片已添加到历史记录')
}

// 清空历史
const clearHistory = () => {
  generatedImages.value = []
  ElMessage.success('历史记录已清空')
}

// 下载图片
const downloadImage = (image: any) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = `kindergarten-ai-${image.timestamp}.jpg`
  link.click()
  ElMessage.success('图片下载开始')
}

// 复制图片链接
const copyImageUrl = async (image: any) => {
  try {
    await navigator.clipboard.writeText(image.url)
    ElMessage.success('图片链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 使用示例
const useExample = (example: any) => {
  ElMessage.info(`正在基于"${example.title}"生成类似图片...`)
  // 这里可以调用配图生成器的方法
}
</script>

<style scoped lang="scss">
.kindergarten-ai-demo {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .header-card {
    margin-bottom: var(--text-2xl);
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    color: white;

    .header-content {
      text-align: center;

      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-3xl);
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: var(--text-lg);
        opacity: 0.9;
      }
    }

    .demo-stats {
      margin-top: var(--text-2xl);
      
      :deep(.el-statistic__content) {
        color: white;
      }
      
      :deep(.el-statistic__head) {
        color: var(--white-alpha-80);
      }
    }
  }

  .generator-card,
  .history-card {
    margin-bottom: var(--text-2xl);
    height: 600px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }
    }

    .generator-content {
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-history {
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .history-grid {
      max-height: 500px;
      overflow-y: auto;

      .history-item {
        display: flex;
        gap: var(--text-sm);
        padding: var(--text-sm);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-sm);
        background: white;

        .history-image {
          width: 80px;
          height: 60px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .image-info {
          flex: 1;

          .image-prompt {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-base);
            color: var(--text-primary);
            line-height: 1.4;
          }

          .image-meta {
            margin-bottom: var(--spacing-sm);
            display: flex;
            gap: var(--spacing-lg);
          }

          .image-actions {
            display: flex;
            gap: var(--spacing-lg);

            .el-button {
              font-size: var(--text-sm);
            }
          }
        }
      }
    }
  }

  .examples-card {
    margin-bottom: var(--text-2xl);

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--text-2xl);

      .example-item {
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--text-sm);
        overflow: hidden;
        background: white;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-var(--spacing-xs));
          box-shadow: 0 var(--spacing-sm) var(--text-3xl) rgba(0, 0, 0, 0.12);

          .example-overlay {
            opacity: 1;
          }
        }

        .example-image {
          height: 180px;
          position: relative;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .example-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--black-alpha-60);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
          }
        }

        .example-content {
          padding: var(--text-lg);

          h4 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--text-primary);
            font-size: var(--text-lg);
          }

          p {
            margin: 0 0 var(--text-sm) 0;
            color: var(--text-regular);
            font-size: var(--text-base);
            line-height: 1.5;
          }

          .example-tags {
            display: flex;
            gap: var(--spacing-lg);
          }
        }
      }
    }
  }

  .features-card {
    .feature-item {
      text-align: center;
      padding: var(--text-2xl);

      .feature-icon {
        font-size: var(--text-5xl);
        margin-bottom: var(--text-lg);
      }

      h4 {
        margin: 0 0 var(--text-sm) 0;
        color: var(--text-primary);
        font-size: var(--text-xl);
      }

      p {
        margin: 0;
        color: var(--text-regular);
        font-size: var(--text-base);
        line-height: 1.6;
      }
    }
  }
}
</style>
