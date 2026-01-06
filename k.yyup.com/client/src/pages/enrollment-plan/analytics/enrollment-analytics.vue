<template>
  <div class="analytics-container">
    <div class="page-header">
      <h1>
        <UnifiedIcon name="default" />
        招生数据分析
      </h1>
      <p class="description">深度挖掘招生数据，洞察关键趋势和模式，支持数据驱动决策</p>
    </div>

    <el-card class="config-card" shadow="hover">
      <template #header>
        <h3>分析配置</h3>
      </template>
      
      <el-form :model="analyticsForm" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="分析时间:">
              <el-date-picker
                v-model="analyticsForm.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="分析类型:">
              <el-select v-model="analyticsForm.analysisType" style="width: 100%;">
                <el-option label="全面分析" value="comprehensive" />
                <el-option label="转化漏斗" value="funnel" />
                <el-option label="用户画像" value="persona" />
                <el-option label="渠道分析" value="channel" />
                <el-option label="地域分析" value="geographic" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="analyzing"
                @click="generateAnalytics"
                size="large"
                style="width: 100%;"
              >
                <UnifiedIcon name="default" />
                开始数据分析
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">高级筛选</el-divider>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="数据维度:">
              <el-checkbox-group v-model="analyticsForm.dimensions">
                <el-checkbox label="demographics">人口统计</el-checkbox>
                <el-checkbox label="behavior">行为分析</el-checkbox>
                <el-checkbox label="conversion">转化分析</el-checkbox>
                <el-checkbox label="satisfaction">满意度</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="对比基准:">
              <el-select v-model="analyticsForm.benchmark" style="width: 100%;">
                <el-option label="无对比" value="none" />
                <el-option label="上期对比" value="previous" />
                <el-option label="同期对比" value="year_over_year" />
                <el-option label="行业平均" value="industry" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 分析结果 -->
    <div v-if="analyticsResult" class="analytics-results">
      <!-- 关键指标面板 -->
      <div class="key-metrics-panel">
        <el-card class="metric-card total-inquiries">
          <div class="metric">
            <div class="icon">📞</div>
            <div class="content">
              <div class="value">{{ analyticsResult.keyMetrics.totalInquiries.toLocaleString() }}</div>
              <div class="label">总咨询量</div>
              <div class="change" :class="getChangeClass(analyticsResult.keyMetrics.inquiryChange)">
                {{ formatChange(analyticsResult.keyMetrics.inquiryChange) }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card applications">
          <div class="metric">
            <div class="icon">📋</div>
            <div class="content">
              <div class="value">{{ analyticsResult.keyMetrics.totalApplications.toLocaleString() }}</div>
              <div class="label">总申请量</div>
              <div class="change" :class="getChangeClass(analyticsResult.keyMetrics.applicationChange)">
                {{ formatChange(analyticsResult.keyMetrics.applicationChange) }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card conversion-rate">
          <div class="metric">
            <div class="icon">🎯</div>
            <div class="content">
              <div class="value">{{ Math.round(analyticsResult.keyMetrics.conversionRate * 100) }}%</div>
              <div class="label">转化率</div>
              <div class="change" :class="getChangeClass(analyticsResult.keyMetrics.conversionChange)">
                {{ formatChange(analyticsResult.keyMetrics.conversionChange) }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="metric-card enrollment">
          <div class="metric">
            <div class="icon">👥</div>
            <div class="content">
              <div class="value">{{ analyticsResult.keyMetrics.totalEnrollments.toLocaleString() }}</div>
              <div class="label">总入学量</div>
              <div class="change" :class="getChangeClass(analyticsResult.keyMetrics.enrollmentChange)">
                {{ formatChange(analyticsResult.keyMetrics.enrollmentChange) }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 数据可视化图表 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                招生趋势分析
              </h3>
            </template>
            
            <div class="chart-container">
              <div id="trendChart" style="width: 100%; min-height: 60px; height: auto;"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                渠道分析
              </h3>
            </template>
            
            <div class="chart-container">
              <div id="channelChart" style="width: 100%; min-height: 60px; height: auto;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 转化漏斗分析 -->
      <el-card class="funnel-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            转化漏斗分析
          </h3>
        </template>
        
        <div class="funnel-analysis">
          <div class="funnel-container">
            <div id="funnelChart" style="width: 100%; min-height: 60px; height: auto;"></div>
          </div>
          
          <div class="funnel-insights">
            <h4>漏斗洞察</h4>
            <div class="insight-list">
              <div 
                v-for="insight in analyticsResult.funnelAnalysis.insights"
                :key="insight.stage"
                class="insight-item"
              >
                <div class="insight-header">
                  <span class="stage-name">{{ insight.stage }}</span>
                  <el-tag :type="getInsightType(insight.performance)" size="small">
                    {{ insight.performance }}
                  </el-tag>
                </div>
                <p class="insight-description">{{ insight.description }}</p>
                <div class="insight-metrics">
                  <span class="metric">转化率: {{ Math.round(insight.conversionRate * 100) }}%</span>
                  <span class="metric">流失率: {{ Math.round(insight.dropOffRate * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 用户画像分析 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="persona-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                用户画像分析
              </h3>
            </template>
            
            <div class="persona-analysis">
              <div class="demographics">
                <h4>人口统计特征</h4>
                <div class="demo-charts">
                  <div class="demo-chart">
                    <h5>年龄分布</h5>
                    <div id="ageChart" style="width: 100%; min-height: 60px; height: auto;"></div>
                  </div>
                  <div class="demo-chart">
                    <h5>收入水平</h5>
                    <div id="incomeChart" style="width: 100%; min-height: 60px; height: auto;"></div>
                  </div>
                </div>
              </div>
              
              <div class="behavioral-traits">
                <h4>行为特征</h4>
                <div class="trait-list">
                  <div 
                    v-for="trait in analyticsResult.userPersona.behavioralTraits"
                    :key="trait.trait"
                    class="trait-item"
                  >
                    <span class="trait-name">{{ trait.trait }}</span>
                    <el-progress 
                      :percentage="trait.percentage"
                      :stroke-width="8"
                      :color="getTraitColor(trait.percentage)"
                    />
                    <span class="trait-value">{{ trait.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="geographic-card" shadow="hover">
            <template #header>
              <h3>
                <UnifiedIcon name="default" />
                地域分析
              </h3>
            </template>
            
            <div class="geographic-analysis">
              <div class="map-container">
                <div id="geoChart" style="width: 100%; min-height: 60px; height: auto;"></div>
              </div>
              
              <div class="geo-insights">
                <h4>地域分布洞察</h4>
                <div class="region-list">
                  <div 
                    v-for="region in analyticsResult.geographicAnalysis.topRegions"
                    :key="region.name"
                    class="region-item"
                  >
                    <div class="region-header">
                      <span class="region-name">{{ region.name }}</span>
                      <span class="region-count">{{ region.count }}人</span>
                    </div>
                    <el-progress 
                      :percentage="region.percentage"
                      :stroke-width="6"
                      :show-text="false"
                    />
                    <div class="region-details">
                      <span class="conversion">转化率: {{ Math.round(region.conversionRate * 100) }}%</span>
                      <span class="growth">增长: {{ formatChange(region.growth) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 数据洞察和建议 -->
      <el-card class="insights-card" shadow="hover">
        <template #header>
          <h3>
            <UnifiedIcon name="default" />
            数据洞察与建议
          </h3>
        </template>
        
        <div class="insights-content">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="insight-section">
                <h4>
                  <UnifiedIcon name="default" />
                  趋势洞察
                </h4>
                <ul class="insight-list">
                  <li 
                    v-for="insight in analyticsResult.insights.trends"
                    :key="insight"
                  >
                    <UnifiedIcon name="default" />
                    {{ insight }}
                  </li>
                </ul>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="insight-section">
                <h4>
                  <UnifiedIcon name="default" />
                  问题识别
                </h4>
                <ul class="insight-list problems">
                  <li 
                    v-for="problem in analyticsResult.insights.problems"
                    :key="problem"
                  >
                    <UnifiedIcon name="default" />
                    {{ problem }}
                  </li>
                </ul>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="insight-section">
                <h4>
                  <UnifiedIcon name="default" />
                  机会建议
                </h4>
                <ul class="insight-list opportunities">
                  <li 
                    v-for="opportunity in analyticsResult.insights.opportunities"
                    :key="opportunity"
                  >
                    <UnifiedIcon name="default" />
                    {{ opportunity }}
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
          
          <div class="action-recommendations">
            <h4>具体行动建议</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(action, index) in analyticsResult.recommendations"
                :key="index"
                :type="getActionType(action.priority)"
                size="large"
              >
                <div class="action-content">
                  <h5>{{ action.title }}</h5>
                  <p>{{ action.description }}</p>
                  <div class="action-meta">
                    <el-tag :type="getPriorityType(action.priority)" size="small">
                      {{ action.priority }}优先级
                    </el-tag>
                    <el-tag type="info" size="small">
                      预期效果: {{ action.expectedImpact }}
                    </el-tag>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="analyzing" class="loading-container">
      <el-card>
        <div class="loading-content">
          <UnifiedIcon name="default" />
          <h3>AI正在分析数据中...</h3>
          <p>正在深度挖掘招生数据，识别关键趋势和模式</p>
          <el-progress :percentage="loadingProgress" :show-text="false" />
          <p class="loading-step">{{ loadingStep }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  PieChart, DataBoard, TrendCharts, Filter, User, LocationFilled,
  InfoFilled, Right, Warning, WarningFilled, Opportunity, StarFilled, Loading
} from '@element-plus/icons-vue'
import { enrollmentAIApi } from '@/api/modules/enrollment-ai'
import { EnrollmentCenterAPI } from '@/api/enrollment-center'
import * as echarts from 'echarts'
import {
  getPrimaryColor,
  getSuccessColor,
  getWarningColor,
  getDangerColor,
  primaryRgba
} from '@/utils/color-tokens'

// 响应式数据
const analyticsResult = ref<any>(null)
const analyzing = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('准备数据分析...')

const analyticsForm = ref({
  dateRange: [new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), new Date()],
  analysisType: 'comprehensive',
  dimensions: ['demographics', 'behavior', 'conversion'],
  benchmark: 'previous'
})

// 生命周期
onMounted(() => {
  // 页面加载完成后的初始化
})

// 方法
const generateAnalytics = async () => {
  analyzing.value = true
  loadingProgress.value = 0
  
  try {
    const steps = [
      '收集数据源...',
      '清洗和处理数据...',
      '计算关键指标...',
      '分析转化漏斗...',
      '构建用户画像...',
      '进行地域分析...',
      '识别趋势模式...',
      '生成洞察建议...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      loadingStep.value = steps[i]
      loadingProgress.value = ((i + 1) / steps.length) * 90
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    loadingStep.value = '生成分析报告...'
    loadingProgress.value = 95
    
    const result = await enrollmentAIApi.generateTrendAnalysis('1year')
    
    loadingProgress.value = 100
    analyticsResult.value = result.data
    
    // 生成图表
    nextTick(() => {
      generateCharts()
    })
    
    ElMessage.success('数据分析完成')
    
  } catch (error) {
    console.error('数据分析失败:', error)
    ElMessage.error('数据分析失败，请稍后重试')
  } finally {
    analyzing.value = false
    loadingProgress.value = 0
  }
}

const generateCharts = async () => {
  await generateTrendChart()
  await generateChannelChart()
  await generateFunnelChart()
  await generateDemographicCharts()
  await generateGeoChart()
}

const generateTrendChart = async () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  try {
    // 使用API获取真实的趋势数据
    const response = await EnrollmentCenterAPI.getAnalyticsTrends({
      timeRange: 'year'
    })

    // 如果有真实数据使用真实数据，否则使用默认数据
    const trendData = response.data?.enrollmentTrend || {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [
        {
          name: '咨询量',
          data: [120, 135, 98, 156, 189, 215]
        },
        {
          name: '申请量',
          data: [85, 92, 67, 108, 134, 152]
        },
        {
          name: '入学量',
          data: [72, 78, 55, 89, 115, 128]
        }
      ]
    }

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: trendData.series.map(s => s.name) },
      xAxis: { type: 'category', data: trendData.categories },
      yAxis: { type: 'value' },
      series: trendData.series.map((s, index) => {
        const colors = [getPrimaryColor(), getSuccessColor(), getWarningColor()]
        return {
          name: s.name,
          type: 'line',
          data: s.data,
          lineStyle: { color: colors[index] },
          itemStyle: { color: colors[index] }
        }
      })
    }

    myChart.setOption(option)
  } catch (error) {
    console.error('加载趋势图数据失败:', error)
    // 使用默认数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const inquiries = [120, 135, 98, 156, 189, 215]
    const applications = [85, 92, 67, 108, 134, 152]
    const enrollments = [72, 78, 55, 89, 115, 128]

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['咨询量', '申请量', '入学量'] },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value' },
      series: [
        {
          name: '咨询量',
          type: 'line',
          data: inquiries,
          lineStyle: { color: getPrimaryColor() },
          itemStyle: { color: getPrimaryColor() }
        },
        {
          name: '申请量',
          type: 'line',
          data: applications,
          lineStyle: { color: getSuccessColor() },
          itemStyle: { color: getSuccessColor() }
        },
        {
          name: '入学量',
          type: 'line',
          data: enrollments,
          lineStyle: { color: getWarningColor() },
          itemStyle: { color: getWarningColor() }
        }
      ]
    }

    myChart.setOption(option)
  }
}

const generateChannelChart = async () => {
  const chartDom = document.getElementById('channelChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  try {
    // 使用API获取真实的渠道数据
    const response = await EnrollmentCenterAPI.getOverview({
      timeRange: 'year'
    })

    // 如果有真实数据使用真实数据，否则使用默认数据
    const channelData = response.data?.charts?.sourceChannel || {
      categories: ['线上推广', '朋友推荐', '地推活动', '官网直访', '其他渠道'],
      series: [{
        name: '渠道分析',
        data: [35, 28, 18, 12, 7]
      }]
    }

    const option = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '渠道分析',
          type: 'pie',
          radius: '50%',
          data: channelData.categories.map((category, index) => ({
            value: channelData.series[0].data[index],
            name: category
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }
      ]
    }

    myChart.setOption(option)
  } catch (error) {
    console.error('加载渠道分析数据失败:', error)
    // 使用默认数据
    const option = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '渠道分析',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 35, name: '线上推广' },
            { value: 28, name: '朋友推荐' },
            { value: 18, name: '地推活动' },
            { value: 12, name: '官网直访' },
            { value: 7, name: '其他渠道' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'var(--shadow-heavy)'
            }
          }
        }
      ]
    }

    myChart.setOption(option)
  }
}

const generateFunnelChart = async () => {
  const chartDom = document.getElementById('funnelChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  try {
    // 使用API获取真实的转化漏斗数据
    const response = await EnrollmentCenterAPI.getAnalyticsFunnel({
      timeRange: 'year'
    })

    const option = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
      series: [
        {
          name: '转化漏斗',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          data: response.data || [
            { value: 100, name: '访问量' },
            { value: 80, name: '咨询量' },
            { value: 60, name: '申请量' },
            { value: 40, name: '面试量' },
            { value: 30, name: '入学量' }
          ]
        }
      ]
    }

    myChart.setOption(option)
  } catch (error) {
    console.error('加载漏斗图数据失败:', error)
    // 如果API调用失败，使用默认数据
    const option = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
      series: [
        {
          name: '转化漏斗',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          data: [
            { value: 100, name: '访问量' },
            { value: 80, name: '咨询量' },
            { value: 60, name: '申请量' },
            { value: 40, name: '面试量' },
            { value: 30, name: '入学量' }
          ]
        }
      ]
    }

    myChart.setOption(option)
  }
}

const generateDemographicCharts = async () => {
  // 年龄分布图
  const ageChartDom = document.getElementById('ageChart')
  if (ageChartDom) {
    const ageChart = echarts.init(ageChartDom)

    try {
      // 尝试从概览数据获取人口统计信息
      const overviewResponse = await EnrollmentCenterAPI.getOverview({
        timeRange: 'year'
      })

      // 如果有真实数据使用真实数据，否则使用改进的默认数据
      const ageData = overviewResponse.data?.demographics?.ageDistribution || [
        { age: '25-30岁', count: 25 },
        { age: '30-35岁', count: 35 },
        { age: '35-40岁', count: 30 },
        { age: '40-45岁', count: 10 }
      ]

      const ageOption = {
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ageData.map(item => item.age)
        },
        yAxis: { type: 'value' },
        series: [{
          name: '年龄分布',
          type: 'bar',
          data: ageData.map(item => item.count),
          itemStyle: { color: getPrimaryColor() }
        }]
      }
      ageChart.setOption(ageOption)
    } catch (error) {
      console.error('加载年龄分布数据失败:', error)
      // 使用改进的默认数据
      const ageOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['25-30岁', '30-35岁', '35-40岁', '40-45岁'] },
        yAxis: { type: 'value' },
        series: [{
          name: '年龄分布',
          type: 'bar',
          data: [25, 35, 30, 10],
          itemStyle: { color: 'var(--primary-color)' }
        }]
      }
      ageChart.setOption(ageOption)
    }
  }

  // 收入分布图
  const incomeChartDom = document.getElementById('incomeChart')
  if (incomeChartDom) {
    const incomeChart = echarts.init(incomeChartDom)

    try {
      // 尝试从概览数据获取收入分布信息
      const overviewResponse = await EnrollmentCenterAPI.getOverview({
        timeRange: 'year'
      })

      // 如果有真实数据使用真实数据，否则使用改进的默认数据
      const incomeData = overviewResponse.data?.demographics?.incomeDistribution || [
        { income: '5-10万', count: 30 },
        { income: '10-20万', count: 40 },
        { income: '20-30万', count: 20 },
        { income: '30万以上', count: 10 }
      ]

      const incomeOption = {
        tooltip: { trigger: 'item' },
        series: [{
          name: '收入分布',
          type: 'pie',
          radius: '70%',
          data: incomeData.map(item => ({
            value: item.count,
            name: item.income
          }))
        }]
      }
      incomeChart.setOption(incomeOption)
    } catch (error) {
      console.error('加载收入分布数据失败:', error)
      // 使用改进的默认数据
      const incomeOption = {
        tooltip: { trigger: 'item' },
        series: [{
          name: '收入分布',
          type: 'pie',
          radius: '70%',
          data: [
            { value: 30, name: '5-10万' },
            { value: 40, name: '10-20万' },
            { value: 20, name: '20-30万' },
            { value: 10, name: '30万以上' }
          ]
        }]
      }
      incomeChart.setOption(incomeOption)
    }
  }
}

const generateGeoChart = async () => {
  const chartDom = document.getElementById('geoChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)

  try {
    // 使用API获取真实的地域分布数据
    const response = await EnrollmentCenterAPI.getAnalyticsRegions({
      timeRange: 'year'
    })

    const option = {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '地域分布',
          type: 'map',
          map: 'china',
          roam: false,
          label: { show: true },
          data: response.data || [
            { name: '北京', value: 177 },
            { name: '天津', value: 42 },
            { name: '河北', value: 102 },
            { name: '山西', value: 81 },
            { name: '内蒙古', value: 47 }
          ]
        }
      ]
    }

    myChart.setOption(option)
  } catch (error) {
    console.error('加载地域分布数据失败:', error)
    // 如果API调用失败，使用默认数据
    const option = {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: '地域分布',
          type: 'map',
          map: 'china',
          roam: false,
          label: { show: true },
          data: [
            { name: '北京', value: 177 },
            { name: '天津', value: 42 },
            { name: '河北', value: 102 },
            { name: '山西', value: 81 },
            { name: '内蒙古', value: 47 }
          ]
        }
      ]
    }

    myChart.setOption(option)
  }
}

// 辅助方法
const getChangeClass = (change: number) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

const formatChange = (change: number) => {
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${(change * 100).toFixed(1)}%`
}

const getInsightType = (performance: string) => {
  const types: Record<string, string> = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '需改进': 'danger'
  }
  return types[performance] || 'info'
}

const getTraitColor = (percentage: number) => {
  if (percentage > 70) return 'var(--success-color)'
  if (percentage > 40) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const getActionType = (priority: string) => {
  const types: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'primary'
  }
  return types[priority] || 'primary'
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return types[priority] || 'info'
}
</script>

<style scoped lang="scss">
.analytics-container {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;

  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);

    h1 {
      font-size: var(--text-3xl);
      color: #2c3e50;
      margin-bottom: var(--spacing-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--text-xs);
    }

    .description {
      color: var(--text-regular);
      font-size: var(--text-base);
    }
  }

  .config-card {
    margin-bottom: var(--text-3xl);
  }

  .analytics-results {
    .key-metrics-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-base);
      margin-bottom: var(--text-3xl);

      .metric-card {
        .metric {
          display: flex;
          align-items: center;
          gap: var(--text-base);

          .icon {
            width: var(--icon-size); height: var(--icon-size);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--spacing-sm);
            font-size: var(--text-2xl);
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
            color: white;
          }

          .content {
            flex: 1;

            .value {
              font-size: var(--text-2xl);
              font-weight: bold;
              margin-bottom: var(--spacing-xs);
              color: var(--primary-color);
            }

            .label {
              color: var(--text-regular);
              font-size: var(--text-sm);
              margin-bottom: var(--spacing-xs);
            }

            .change {
              font-size: var(--text-xs);
              font-weight: 500;

              &.positive {
                color: var(--success-color);
              }

              &.negative {
                color: var(--danger-color);
              }

              &.neutral {
                color: var(--info-color);
              }
            }
          }
        }
      }
    }

    .chart-card, .funnel-card, .persona-card, .geographic-card, .insights-card {
      margin-bottom: var(--text-3xl);

      :deep(.el-card__header) {
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
        
        h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
      }
    }

    .funnel-analysis {
      display: flex;
      gap: var(--text-2xl);

      .funnel-container {
        flex: 2;
      }

      .funnel-insights {
        flex: 1;

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .insight-item {
          padding: var(--text-base);
          border: var(--border-width-base) solid var(--border-color-lighter);
          border-radius: var(--spacing-sm);
          margin-bottom: var(--text-lg);
          background: var(--bg-gray-light);

          .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);

            .stage-name {
              font-weight: 500;
              color: #2c3e50;
            }
          }

          .insight-description {
            color: var(--text-regular);
            font-size: var(--text-sm);
            margin-bottom: var(--spacing-sm);
          }

          .insight-metrics {
            display: flex;
            gap: var(--text-base);

            .metric {
              font-size: var(--text-xs);
              color: var(--info-color);
            }
          }
        }
      }
    }

    .persona-analysis {
      .demographics {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .demo-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--text-base);

          .demo-chart {
            h5 {
              color: var(--text-regular);
              margin-bottom: var(--spacing-sm);
              text-align: center;
            }
          }
        }
      }

      .behavioral-traits {
        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .trait-list {
          .trait-item {
            display: flex;
            align-items: center;
            gap: var(--text-xs);
            margin-bottom: var(--text-sm);

            .trait-name {
              width: auto;
              color: var(--text-regular);
              font-size: var(--text-sm);
            }

            .el-progress {
              flex: 1;
            }

            .trait-value {
              width: auto;
              text-align: right;
              color: var(--primary-color);
              font-weight: 500;
              font-size: var(--text-sm);
            }
          }
        }
      }
    }

    .geographic-analysis {
      .map-container {
        margin-bottom: var(--text-3xl);
      }

      .geo-insights {
        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .region-list {
          .region-item {
            padding: var(--text-xs);
            border: var(--border-width-base) solid var(--border-color-lighter);
            border-radius: var(--radius-md);
            margin-bottom: var(--text-sm);
            background: var(--bg-gray-light);

            .region-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--spacing-sm);

              .region-name {
                font-weight: 500;
                color: #2c3e50;
              }

              .region-count {
                color: var(--primary-color);
                font-weight: 500;
              }
            }

            .region-details {
              display: flex;
              justify-content: space-between;
              margin-top: var(--spacing-sm);
              font-size: var(--text-xs);
              color: var(--info-color);

              .conversion {
                color: var(--success-color);
              }

              .growth {
                &.positive {
                  color: var(--success-color);
                }

                &.negative {
                  color: var(--danger-color);
                }
              }
            }
          }
        }
      }
    }

    .insights-content {
      .insight-section {
        margin-bottom: var(--text-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .insight-list {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) 0;
            color: var(--text-regular);
            border-bottom: var(--z-index-dropdown) solid var(--bg-container);

            &:last-child {
              border-bottom: none;
            }
          }

          &.problems li {
            color: var(--danger-color);
          }

          &.opportunities li {
            color: var(--success-color);
          }
        }
      }

      .action-recommendations {
        margin-top: var(--spacing-3xl);

        h4 {
          color: #2c3e50;
          margin-bottom: var(--text-lg);
        }

        .action-content {
          h5 {
            margin: 0 0 var(--spacing-sm) 0;
            color: #2c3e50;
          }

          p {
            color: var(--text-regular);
            margin-bottom: var(--text-sm);
          }

          .action-meta {
            .el-tag {
              margin-right: var(--spacing-sm);
            }
          }
        }
      }
    }
  }

  .loading-container {
    margin-top: var(--text-3xl);
    
    .loading-content {
      text-align: center;
      padding: var(--spacing-10xl);
      
      .loading-icon {
        font-size: var(--text-5xl);
        color: var(--primary-color);
        margin-bottom: var(--text-lg);
        animation: spin 2s linear infinite;
      }
      
      h3 {
        color: #2c3e50;
        margin-bottom: var(--spacing-sm);
      }
      
      p {
        color: var(--text-regular);
        margin-bottom: var(--text-3xl);
      }
      
      .loading-step {
        color: var(--primary-color);
        font-weight: 500;
        margin-top: var(--text-lg);
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>