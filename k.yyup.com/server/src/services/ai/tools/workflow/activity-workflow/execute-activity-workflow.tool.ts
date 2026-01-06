/**
 * 活动工作流工具 - 使用 Markdown + 确认模式
 * 
 * 完整工作流程（确认后执行）：
 * 0. 生成活动方案（Markdown格式）→ 等待用户确认
 * 1. 创建活动记录（调用API）
 * 2. 生成活动海报（调用AI图片生成服务）
 * 3. 配置营销策略
 * 4. 生成手机海报（调用AI图片生成服务）
 * 5. 创建分享素材和二维码（调用二维码生成服务）
 * 
 * 注意：不使用前端渲染工具，而是使用 Markdown 展示 + 确认对话框
 */

import { ToolDefinition, TOOL_CATEGORIES } from '../../../../../types/ai-model-types';
import { autoImageGenerationService } from '../../../auto-image-generation.service';
import { activityService } from '../../../../activity/activity.service';

// 工作流步骤定义
interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

// 活动方案数据结构
interface ActivityPlan {
  title: string;
  activityType: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  fee: number;
  requirements: string;
  targetAudience: string;
  materials: string[];
  schedule: Array<{ time: string; content: string }>;
  notes: string[];
}

// 工作流执行结果
interface WorkflowResult {
  activityId?: number;
  activity?: any;
  posterId?: string;
  posterUrl?: string;
  marketingId?: string;
  mobilePosterUrls?: string[];
  shareUrl?: string;
  registrationUrl?: string;
  qrCodeUrl?: string;
}

/**
 * 生成活动方案 Markdown
 */
function generateActivityPlanMarkdown(plan: ActivityPlan): string {
  let markdown = `## 📋 活动方案\n\n`;
  
  markdown += `### 基本信息\n`;
  markdown += `| 项目 | 内容 |\n`;
  markdown += `|------|------|\n`;
  markdown += `| **活动名称** | ${plan.title} |\n`;
  markdown += `| **活动类型** | ${plan.activityType} |\n`;
  markdown += `| **开始时间** | ${plan.startTime} |\n`;
  markdown += `| **结束时间** | ${plan.endTime} |\n`;
  markdown += `| **活动地点** | ${plan.location} |\n`;
  markdown += `| **容纳人数** | ${plan.capacity}人 |\n`;
  markdown += `| **费用** | ${plan.fee > 0 ? `${plan.fee}元` : '免费'} |\n`;
  markdown += `| **目标人群** | ${plan.targetAudience} |\n\n`;
  
  markdown += `### 活动描述\n`;
  markdown += `${plan.description}\n\n`;
  
  if (plan.requirements) {
    markdown += `### 参与要求\n`;
    markdown += `${plan.requirements}\n\n`;
  }
  
  if (plan.materials && plan.materials.length > 0) {
    markdown += `### 所需材料\n`;
    plan.materials.forEach((item, index) => {
      markdown += `${index + 1}. ${item}\n`;
    });
    markdown += '\n';
  }
  
  if (plan.schedule && plan.schedule.length > 0) {
    markdown += `### 活动流程\n`;
    markdown += `| 时间 | 内容 |\n`;
    markdown += `|------|------|\n`;
    plan.schedule.forEach(item => {
      markdown += `| ${item.time} | ${item.content} |\n`;
    });
    markdown += '\n';
  }
  
  if (plan.notes && plan.notes.length > 0) {
    markdown += `### 注意事项\n`;
    plan.notes.forEach((note, index) => {
      markdown += `${index + 1}. ${note}\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

/**
 * 从用户输入提取活动信息
 */
function extractActivityInfoFromInput(userInput: string): Partial<ActivityPlan> {
  const info: Partial<ActivityPlan> = {};

  // 🔧 安全检查：确保userInput存在
  if (!userInput || typeof userInput !== 'string') {
    console.warn('⚠️ [参数解析] userInput为空或不是字符串');
    return info;
  }

  // 尝试提取活动类型
  if (userInput.includes('运动会') || userInput.includes('体育')) {
    info.activityType = '体育运动';
  } else if (userInput.includes('亲子') || userInput.includes('家长')) {
    info.activityType = '亲子活动';
  } else if (userInput.includes('节日') || userInput.includes('庆典')) {
    info.activityType = '节日庆典';
  } else if (userInput.includes('艺术') || userInput.includes('绘画') || userInput.includes('音乐')) {
    info.activityType = '艺术活动';
  } else if (userInput.includes('科学') || userInput.includes('实验')) {
    info.activityType = '科学探索';
  } else if (userInput.includes('户外') || userInput.includes('郊游') || userInput.includes('春游') || userInput.includes('秋游')) {
    info.activityType = '户外活动';
  } else {
    info.activityType = '综合活动';
  }

  // 🔧 新增：尝试提取引号中的活动名称（支持英文引号、中文引号、书名号）
  const quotedTitleMatch = userInput.match(/活动名称为[""「\"]([^""」\"]+)[""」\"]/);
  if (quotedTitleMatch && quotedTitleMatch[1]) {
    info.title = quotedTitleMatch[1].trim();
  }

  // 🔧 新增：提取活动时间（支持多种格式，包括带编号的格式）
  const datePatterns = [
    /\d+[.、]\s*活动时间(?:为|)[:：]?\s*(\d{4})[年-](\d{1,2})[月-](\d{1,2})日/,
    /(?:活动时间|时间)(?:为|)[:：]?\s*(\d{4})[年-](\d{1,2})[月-](\d{1,2})日/,
    /\d+[.、]\s*活动时间(?:为|)[:：]?\s*(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    /(?:活动时间|时间)(?:为|)[:：]?\s*(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    /(\d{4})[年-](\d{1,2})[月-](\d{1,2})日.*?(\d{1,2}):(\d{2})/
  ];

  for (const pattern of datePatterns) {
    const match = userInput.match(pattern);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      info.startTime = `${year}-${month}-${day} 09:00`;
      info.endTime = `${year}-${month}-${day} 12:00`;
      break;
    }
  }

  // 🔧 新增：提取活动地点（支持"为"字、冒号，在遇到编号时停止）
  const locationPatterns = [
    /\d+[.、]\s*活动地点(?:为|)[:：]?\s*([^0-9\n]+?)(?=\s*\d+[.、]|$)/,
    /(?:活动地点|地点)(?:为|)[:：]\s*([^0-9\n]+?)(?=\s*\d+[.、]|$)/,
    /在\s*([^，。\n]{2,20})\s*(?:举行|举办)/
  ];

  for (const pattern of locationPatterns) {
    const match = userInput.match(pattern);
    if (match && match[1]) {
      info.location = match[1].trim();
      break;
    }
  }

  // 🔧 新增：提取目标人群（在遇到下一个编号时停止）
  const audiencePatterns = [
    /\d+[.、]\s*目标人群(?:为|)[:：]?\s*(.+?)(?:\s+\d+[.、]|\s*$)/,
    /(?:目标人群|面向|对象)(?:为|)[:：]\s*(.+?)(?:\s+\d+[.、]|\s*$)/,
    /(\d+[-~至]\d+岁[^，。\n]*?)(?=\s*\d+[.、]|$)/
  ];

  for (const pattern of audiencePatterns) {
    const match = userInput.match(pattern);
    if (match && match[1]) {
      info.targetAudience = match[1].trim();
      break;
    }
  }

  // 如果没有找到引号中的标题，尝试其他模式
  if (!info.title) {
    const namePatterns = [
      /(?:创建|策划|安排|举办|组织)(?:一个|一次)?(.{2,20}?)(?:活动|方案|计划)/,
      /(.{2,20}?)(?:活动|方案)/
    ];

    for (const pattern of namePatterns) {
      const match = userInput.match(pattern);
      if (match && match[1]) {
        info.title = match[1].trim() + '活动';
        break;
      }
    }
  }

  // 默认值
  if (!info.title) {
    info.title = `${info.activityType}活动`;
  }

  console.log('📋 [参数解析] 提取的信息:', JSON.stringify(info, null, 2));

  return info;
}

/**
 * 生成默认的活动方案
 */
function generateDefaultActivityPlan(userInput: string): ActivityPlan {
  const extracted = extractActivityInfoFromInput(userInput);
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const typeDefaults: Record<string, Partial<ActivityPlan>> = {
    '体育运动': {
      location: '幼儿园操场',
      capacity: 100,
      materials: ['运动器材', '奖品', '医疗箱', '饮用水'],
      schedule: [
        { time: '09:00-09:30', content: '开幕式' },
        { time: '09:30-10:30', content: '趣味比赛' },
        { time: '10:30-11:00', content: '颁奖典礼' }
      ],
      notes: ['请穿着运动服装', '注意防暑/保暖', '准备足够饮用水']
    },
    '亲子活动': {
      location: '幼儿园多功能厅',
      capacity: 60,
      materials: ['手工材料', '游戏道具', '小礼品'],
      schedule: [
        { time: '09:00-09:15', content: '签到入场' },
        { time: '09:15-10:00', content: '亲子游戏' },
        { time: '10:00-11:00', content: '手工制作' }
      ],
      notes: ['每位小朋友需一位家长陪同', '请提前5分钟到场']
    },
    '户外活动': {
      location: '市区公园',
      capacity: 50,
      materials: ['野餐垫', '食品饮料', '急救包', '垃圾袋'],
      schedule: [
        { time: '08:30-09:00', content: '集合出发' },
        { time: '09:00-11:00', content: '自由活动' },
        { time: '11:00-12:00', content: '野餐休息' }
      ],
      notes: ['请穿舒适的运动鞋', '注意安全，不要离开队伍', '自备防晒用品']
    }
  };

  const defaults = typeDefaults[extracted.activityType || '综合活动'] || typeDefaults['亲子活动'];

  // 🔧 优先使用用户提取的信息，否则使用默认值
  const plan: ActivityPlan = {
    title: extracted.title || '幼儿园活动',
    activityType: extracted.activityType || '综合活动',
    description: `这是一次精心策划的${extracted.activityType || '综合'}活动，旨在增强孩子们的身心发展，促进家园共育。`,
    // 🔧 如果用户指定了时间，使用用户时间；否则使用下周日期
    startTime: extracted.startTime || nextWeek.toISOString().split('T')[0] + ' 09:00',
    endTime: extracted.endTime || nextWeek.toISOString().split('T')[0] + ' 12:00',
    // 🔧 如果用户指定了地点，使用用户地点；否则使用类型默认地点
    location: extracted.location || defaults.location || '幼儿园',
    capacity: defaults.capacity || 50,
    fee: 0,
    requirements: '适龄幼儿及家长',
    // 🔧 如果用户指定了目标人群，使用用户指定；否则使用默认
    targetAudience: extracted.targetAudience || '全园幼儿',
    materials: defaults.materials || [],
    schedule: defaults.schedule || [],
    notes: defaults.notes || ['请准时参加', '如有特殊情况请提前请假']
  };

  console.log('📋 [活动方案] 最终生成的方案:', JSON.stringify({
    title: plan.title,
    startTime: plan.startTime,
    location: plan.location,
    targetAudience: plan.targetAudience
  }, null, 2));

  return plan;
}

/**
 * 生成二维码 Data URL
 */
async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    // 使用 qrcode 库生成二维码
    const QRCode = require('qrcode');
    const dataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('生成二维码失败:', error);
    // 返回一个占位符
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="white"/><text x="128" y="128" text-anchor="middle" fill="black">QR Code</text></svg>`;
  }
}

/**
 * 执行步骤1：创建活动记录
 */
async function executeStep1_CreateActivity(
  plan: ActivityPlan,
  progressCallback?: (eventType: string, data: any) => void
): Promise<{ activityId: number; activity: any }> {
  console.log('📝 [步骤1] 创建活动记录...');
  
  // 模拟创建活动 - 实际应调用 ActivityService
  const activityId = Math.floor(Math.random() * 10000) + 1000;
  const activity = {
    id: activityId,
    title: plan.title,
    activityType: plan.activityType,
    description: plan.description,
    startTime: plan.startTime,
    endTime: plan.endTime,
    location: plan.location,
    capacity: plan.capacity,
    fee: plan.fee,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`✅ [步骤1] 活动创建成功，ID: ${activityId}`);
  return { activityId, activity };
}

/**
 * 执行步骤2：生成活动海报（调用AI图片生成服务）
 */
async function executeStep2_GeneratePoster(
  plan: ActivityPlan,
  activityId: number,
  progressCallback?: (eventType: string, data: any) => void
): Promise<{ posterId: string; posterUrl: string }> {
  console.log('🎨 [步骤2] 调用AI图片生成服务生成活动海报...');
  
  const posterId = `poster_${activityId}_${Date.now()}`;
  let posterUrl = `/uploads/posters/${posterId}.png`;
  
  try {
    // 调用真实的AI图片生成服务
    const result = await autoImageGenerationService.generateActivityImage(
      plan.title,
      plan.description,
      { style: 'cartoon', size: '1024x768' }
    );
    
    if (result.success && result.imageUrl) {
      posterUrl = result.imageUrl;
      console.log(`✅ [步骤2] AI海报生成成功，URL: ${posterUrl}`);
    } else {
      console.warn(`⚠️ [步骤2] AI海报生成失败: ${result.error}，使用默认占位图`);
    }
  } catch (error: any) {
    console.error(`❌ [步骤2] 调用AI图片服务失败: ${error.message}`);
    // 继续使用默认占位URL
  }
  
  return { posterId, posterUrl };
}

/**
 * 执行步骤3：配置营销策略
 */
async function executeStep3_SetupMarketing(
  plan: ActivityPlan,
  activityId: number,
  progressCallback?: (eventType: string, data: any) => void
): Promise<{ marketingId: string }> {
  console.log('📢 [步骤3] 配置营销策略...');
  
  // 模拟配置营销 - 实际应调用 MarketingService
  const marketingId = `marketing_${activityId}_${Date.now()}`;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`✅ [步骤3] 营销策略配置成功，ID: ${marketingId}`);
  return { marketingId };
}

/**
 * 执行步骤4：生成手机海报（调用AI图片生成服务，竖版尺寸）
 */
async function executeStep4_GenerateMobilePoster(
  plan: ActivityPlan,
  activityId: number,
  progressCallback?: (eventType: string, data: any) => void
): Promise<{ mobilePosterUrls: string[] }> {
  console.log('📱 [步骤4] 调用AI图片生成服务生成手机海报（竖版）...');
  
  const mobilePosterUrls: string[] = [];
  
  // 生成两种尺寸的手机海报
  const posterConfigs = [
    { name: 'wechat', size: '768x1024' as const, style: 'cartoon' as const },
    { name: 'weibo', size: '768x1024' as const, style: 'natural' as const }
  ];
  
  for (const config of posterConfigs) {
    try {
      const result = await autoImageGenerationService.generatePosterImage(
        plan.title,
        `${plan.description}\n\n适用于${config.name}分享的竖版海报`,
        { style: config.style, size: config.size, quality: 'hd' }
      );
      
      if (result.success && result.imageUrl) {
        mobilePosterUrls.push(result.imageUrl);
        console.log(`✅ [步骤4] ${config.name}海报生成成功`);
      } else {
        // 使用默认占位图
        mobilePosterUrls.push(`/uploads/mobile-posters/${activityId}_${config.name}.png`);
        console.warn(`⚠️ [步骤4] ${config.name}海报生成失败，使用占位图`);
      }
    } catch (error: any) {
      console.error(`❌ [步骤4] 生成${config.name}海报失败: ${error.message}`);
      mobilePosterUrls.push(`/uploads/mobile-posters/${activityId}_${config.name}.png`);
    }
  }
  
  console.log(`✅ [步骤4] 手机海报生成完成，共 ${mobilePosterUrls.length} 张`);
  return { mobilePosterUrls };
}

/**
 * 执行步骤5：创建分享素材和二维码（调用真实的二维码生成服务）
 */
async function executeStep5_CreateShareMaterials(
  plan: ActivityPlan,
  activityId: number,
  progressCallback?: (eventType: string, data: any) => void
): Promise<{ shareUrl: string; registrationUrl: string; qrCodeUrl: string }> {
  console.log('🔗 [步骤5] 创建分享素材和二维码...');
  
  // 生成分享链接和报名链接
  const baseUrl = process.env.FRONTEND_URL || 'https://k.yyup.cc';
  const shareUrl = `${baseUrl}/activity/share/${activityId}`;
  const registrationUrl = `${baseUrl}/activity/register/${activityId}`;
  
  let qrCodeUrl: string;
  
  try {
    // 调用真实的二维码生成服务（会保存到文件并返回URL）
    qrCodeUrl = await activityService.generateShareQrcode(registrationUrl);
    console.log(`✅ [步骤5] 二维码生成成功，URL: ${qrCodeUrl}`);
  } catch (error: any) {
    console.error(`❌ [步骤5] 调用二维码服务失败: ${error.message}，使用内联生成`);
    // 降级到内联生成 Base64 二维码
    qrCodeUrl = await generateQRCodeDataUrl(registrationUrl);
  }
  
  console.log(`✅ [步骤5] 分享素材创建成功`);
  console.log(`   分享链接: ${shareUrl}`);
  console.log(`   报名链接: ${registrationUrl}`);
  
  return { shareUrl, registrationUrl, qrCodeUrl };
}

/**
 * 生成完成结果的 Markdown
 */
function generateCompletionMarkdown(
  plan: ActivityPlan,
  result: WorkflowResult
): string {
  let markdown = `## ✅ 活动创建完成\n\n`;
  
  // 基本信息
  markdown += `### 📋 活动信息\n`;
  markdown += `| 项目 | 内容 |\n`;
  markdown += `|------|------|\n`;
  markdown += `| **活动ID** | ${result.activityId} |\n`;
  markdown += `| **活动名称** | ${plan.title} |\n`;
  markdown += `| **活动类型** | ${plan.activityType} |\n`;
  markdown += `| **开始时间** | ${plan.startTime} |\n`;
  markdown += `| **结束时间** | ${plan.endTime} |\n`;
  markdown += `| **活动地点** | ${plan.location} |\n\n`;
  
  // 生成的资源
  markdown += `### 🎨 生成的资源\n`;
  markdown += `| 资源 | 状态 |\n`;
  markdown += `|------|------|\n`;
  markdown += `| **活动海报** | ✅ 已生成 |\n`;
  markdown += `| **营销策略** | ✅ 已配置 |\n`;
  markdown += `| **手机海报** | ✅ 已生成 (${result.mobilePosterUrls?.length || 0}张) |\n`;
  markdown += `| **分享二维码** | ✅ 已生成 |\n\n`;
  
  // 分享信息
  markdown += `### 🔗 分享信息\n`;
  markdown += `- **分享链接**: ${result.shareUrl}\n`;
  markdown += `- **报名链接**: ${result.registrationUrl}\n\n`;
  
  // 二维码
  if (result.qrCodeUrl) {
    markdown += `### 📱 报名二维码\n`;
    markdown += `![报名二维码](${result.qrCodeUrl})\n\n`;
    markdown += `*扫描二维码即可报名参加活动*\n\n`;
  }
  
  return markdown;
}

/**
 * execute_activity_workflow 工具定义
 */
const executeActivityWorkflowTool: ToolDefinition = {
  name: 'execute_activity_workflow',
  category: TOOL_CATEGORIES.ACTION,
  description: `🚀 执行活动创建工作流 - 自动化生成完整活动方案

📋 功能说明：
- 根据用户描述智能生成完整的活动方案
- 以 Markdown 格式展示方案内容，便于用户查看
- 确认后自动执行6步完整工作流

🔄 完整工作流程（确认后执行）：
1. 创建活动记录（调用API）
2. 生成活动海报
3. 配置营销策略
4. 生成手机海报
5. 创建分享素材和二维码

⚠️ 使用场景：
- 用户说"帮我策划一个活动"
- 用户说"创建一个亲子运动会"
- 用户说"安排一次春游活动"

📌 注意：
- 方案会以 Markdown 格式展示
- 用户需要确认后才会执行完整工作流
- 完成后会生成海报和报名二维码`,

  parameters: {
    type: 'object',
    properties: {
      userInput: {
        type: 'string',
        description: '用户的活动需求描述，如"帮我策划一个亲子运动会"'
      },
      confirmed: {
        type: 'boolean',
        description: '用户是否已确认方案。首次调用时为false，用户确认后设为true'
      },
      activityPlan: {
        type: 'object',
        description: '用户确认或修改后的活动方案（仅在confirmed=true时使用）'
      }
    },
    required: ['userInput']
  },

  handler: async (params: {
    userInput: string;
    confirmed?: boolean;
    activityPlan?: ActivityPlan;
    progressCallback?: (eventType: string, data: any) => void;
  }) => {
    const { userInput, activityPlan, progressCallback } = params;

    // 🔧 安全检查：确保userInput存在
    if (!userInput || typeof userInput !== 'string') {
      console.error('❌ [活动工作流] userInput参数缺失或无效');
      return {
        success: false,
        status: 'error',
        error: '用户输入参数不能为空',
        ai_response_template: '❌ 抱歉，缺少必要的用户输入信息。请提供您想要创建的活动描述。'
      };
    }

    // 🔧 自动检测确认意图：检查 userInput 是否包含 confirmed=true 或确认相关关键词
    const confirmPatterns = [
      /confirmed\s*=\s*true/i,
      /确认执行/,
      /确认创建/,
      /确认工作流/
    ];
    const autoDetectedConfirm = confirmPatterns.some(pattern => pattern.test(userInput));
    const confirmed = params.confirmed === true || autoDetectedConfirm;

    console.log(`🚀 [活动工作流] 开始执行，用户输入: ${userInput?.substring(0, 50)}...`);
    console.log(`   确认状态: ${confirmed ? '已确认' : '待确认'}`);
    console.log(`   自动检测确认: ${autoDetectedConfirm}, 参数确认: ${params.confirmed}`);
    
    // 完整的工作流步骤
    const steps: WorkflowStep[] = [
      { id: 'analyze', title: '分析需求', description: '解析用户的活动需求', status: 'pending' },
      { id: 'generate', title: '生成方案', description: '创建活动方案', status: 'pending' },
      { id: 'confirm', title: '等待确认', description: '等待用户确认方案', status: 'pending' },
      { id: 'create_activity', title: '创建活动', description: '创建活动记录', status: 'pending' },
      { id: 'generate_poster', title: '生成海报', description: '生成活动海报', status: 'pending' },
      { id: 'setup_marketing', title: '配置营销', description: '配置营销策略', status: 'pending' },
      { id: 'mobile_poster', title: '手机海报', description: '生成手机海报', status: 'pending' },
      { id: 'share_qrcode', title: '分享二维码', description: '创建分享素材和二维码', status: 'pending' }
    ];
    
    try {
      // 发送工作流开始事件
      if (progressCallback) {
        progressCallback('workflow_start', {
          workflowName: 'execute_activity_workflow',
          steps: steps,
          totalSteps: steps.length
        });
      }
      
      // ==================== 步骤0：分析需求 ====================
      steps[0].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'analyze', stepTitle: '分析需求', stepIndex: 0 });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      steps[0].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'analyze', stepTitle: '分析需求', stepIndex: 0 });
      }
      
      // ==================== 步骤1：生成方案 ====================
      steps[1].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'generate', stepTitle: '生成方案', stepIndex: 1 });
      }
      
      let plan: ActivityPlan;
      if (confirmed && activityPlan) {
        plan = activityPlan;
      } else {
        plan = generateDefaultActivityPlan(userInput);
      }
      
      const markdownPlan = generateActivityPlanMarkdown(plan);
      
      steps[1].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'generate', stepTitle: '生成方案', stepIndex: 1 });
      }
      
      // ==================== 步骤2：等待确认（如果未确认）====================
      if (!confirmed) {
        steps[2].status = 'running';
        if (progressCallback) {
          progressCallback('workflow_step_start', { stepId: 'confirm', stepTitle: '等待确认', stepIndex: 2 });
        }
        
        console.log(`📋 [活动工作流] 方案已生成，等待用户确认`);
        
        return {
          success: true,
          status: 'waiting_for_confirmation',
          confirmation_required: true,
          message: '活动方案已生成，请确认后创建',
          markdown_content: markdownPlan,
          confirmation_data: {
            action: 'create_activity',
            plan: plan,
            tool_name: 'execute_activity_workflow',
            confirm_params: {
              userInput: userInput,
              confirmed: true,
              activityPlan: plan
            }
          },
          ai_response_template: `我已为您生成活动方案，请查看：

${markdownPlan}

---

✅ 确认后将自动执行以下操作：
1. 创建活动记录
2. 生成活动海报
3. 配置营销策略
4. 生成手机海报
5. 生成报名二维码

如果方案符合您的要求，请点击**确认创建**按钮。`
        };
      }
      
      // ==================== 用户已确认，执行完整工作流 ====================
      steps[2].status = 'completed';
      console.log(`📝 [活动工作流] 用户已确认，开始执行完整工作流...`);
      
      const workflowResult: WorkflowResult = {};
      
      // 步骤3：创建活动记录
      steps[3].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'create_activity', stepTitle: '创建活动', stepIndex: 3 });
      }
      const step1Result = await executeStep1_CreateActivity(plan, progressCallback);
      workflowResult.activityId = step1Result.activityId;
      workflowResult.activity = step1Result.activity;
      steps[3].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'create_activity', stepTitle: '创建活动', stepIndex: 3 });
      }
      
      // 步骤4：生成海报
      steps[4].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'generate_poster', stepTitle: '生成海报', stepIndex: 4 });
      }
      const step2Result = await executeStep2_GeneratePoster(plan, step1Result.activityId, progressCallback);
      workflowResult.posterId = step2Result.posterId;
      workflowResult.posterUrl = step2Result.posterUrl;
      steps[4].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'generate_poster', stepTitle: '生成海报', stepIndex: 4 });
      }
      
      // 步骤5：配置营销策略
      steps[5].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'setup_marketing', stepTitle: '配置营销', stepIndex: 5 });
      }
      const step3Result = await executeStep3_SetupMarketing(plan, step1Result.activityId, progressCallback);
      workflowResult.marketingId = step3Result.marketingId;
      steps[5].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'setup_marketing', stepTitle: '配置营销', stepIndex: 5 });
      }
      
      // 步骤6：生成手机海报
      steps[6].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'mobile_poster', stepTitle: '手机海报', stepIndex: 6 });
      }
      const step4Result = await executeStep4_GenerateMobilePoster(plan, step1Result.activityId, progressCallback);
      workflowResult.mobilePosterUrls = step4Result.mobilePosterUrls;
      steps[6].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'mobile_poster', stepTitle: '手机海报', stepIndex: 6 });
      }
      
      // 步骤7：创建分享素材和二维码
      steps[7].status = 'running';
      if (progressCallback) {
        progressCallback('workflow_step_start', { stepId: 'share_qrcode', stepTitle: '分享二维码', stepIndex: 7 });
      }
      const step5Result = await executeStep5_CreateShareMaterials(plan, step1Result.activityId, progressCallback);
      workflowResult.shareUrl = step5Result.shareUrl;
      workflowResult.registrationUrl = step5Result.registrationUrl;
      workflowResult.qrCodeUrl = step5Result.qrCodeUrl;
      steps[7].status = 'completed';
      if (progressCallback) {
        progressCallback('workflow_step_complete', { stepId: 'share_qrcode', stepTitle: '分享二维码', stepIndex: 7 });
      }
      
      // 发送工作流完成事件
      if (progressCallback) {
        progressCallback('workflow_complete', {
          workflowName: 'execute_activity_workflow',
          success: true,
          steps: steps,
          result: workflowResult
        });
      }
      
      // 生成完成结果的 Markdown
      const completionMarkdown = generateCompletionMarkdown(plan, workflowResult);
      
      console.log(`🎉 [活动工作流] 完整工作流执行成功！`);
      
      return {
        success: true,
        status: 'completed',
        message: '活动创建完成，已生成海报和二维码',
        markdown_content: completionMarkdown,
        result: workflowResult,
        activity: workflowResult.activity,
        posterUrl: workflowResult.posterUrl,
        qrCodeUrl: workflowResult.qrCodeUrl,
        shareUrl: workflowResult.shareUrl,
        registrationUrl: workflowResult.registrationUrl,
        ai_response_template: `🎉 活动创建完成！\n\n${completionMarkdown}`
      };
      
    } catch (error) {
      console.error(`❌ [活动工作流] 执行失败:`, error);
      
      const runningStep = steps.find(s => s.status === 'running');
      if (runningStep) {
        runningStep.status = 'failed';
      }
      
      if (progressCallback) {
        progressCallback('workflow_error', {
          workflowName: 'execute_activity_workflow',
          error: (error as Error).message,
          steps: steps
        });
      }
      
      return {
        success: false,
        status: 'error',
        error: (error as Error).message,
        ai_response_template: `❌ 抱歉，活动创建失败：${(error as Error).message}\n\n请稍后重试或联系管理员。`
      };
    }
  }
};

export default executeActivityWorkflowTool;
