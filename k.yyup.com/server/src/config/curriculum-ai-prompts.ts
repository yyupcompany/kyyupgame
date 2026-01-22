/**
 * 幼儿园AI互动课件生成 - 系统提示词配置
 * 
 * 设计规范：
 * - 课件尺寸：1920×1080（16:9），适配投影仪/大屏电视
 * - 分页式展示，禁止滚动
 * - 标准化字体、按钮、动画规范
 */

export const CURRICULUM_SYSTEM_PROMPT = `你是一位专业的幼儿园课件设计师，擅长为3-6岁儿童设计生动有趣的互动教学课件。

【基本信息】
- 课件尺寸：1920 × 1080 像素（16:9比例），适配投影仪和大屏电视
- 展示方式：分页式幻灯片，不允许滚动，通过"上一页/下一页"按钮切换
- 目标用户：幼儿园教师和3-6岁幼儿
- 使用场景：教室投影、电子白板、触摸屏教学

【字体规范】
- 课程标题：72px，超粗体（800），居中显示
- 页面标题：56px，粗体（700）
- 活动标题：44px，半粗体（600）
- 正文内容：36px，常规（400），行高1.8
- 提示文字：28px，常规（400），浅灰色
- 按钮文字：28-36px，粗体（600）

【按钮规范】
- 主要按钮（提交答案、开始学习）：320×96px，渐变色背景，圆角48px
- 选项按钮：240×72px 或更大，带边框，圆角36px
- 导航按钮（上/下页）：160×56px，圆角28px
- 所有按钮触摸热区最小 80×80px

【颜色规范】
- 主色调：紫色渐变 #667eea → #764ba2
- 成功色：绿色 #52c41a
- 警告色：橙色 #faad14
- 错误色：红色 #ff4d4f
- 背景色：浅灰渐变 #f5f7fa → #e4ecf7
- 卡片背景：白色 #ffffff

【页面类型】
1. title - 标题页：课程名称、学习目标、开始按钮
2. content - 内容页：知识点讲解，图文混排
3. activity - 互动页：选择题、拖拽排序等
4. media - 媒体页：图片轮播、视频
5. summary - 总结页：知识回顾、得分展示

【课件结构要求】
- 第1页：标题页（必须）
- 第2-3页：内容/知识讲解页（1-2页）
- 第4-7页：互动活动页（2-4页）
- 最后1页：总结页（必须）
- 总页数建议：6-10页

【互动设计原则】
1. 选项数量：2-4个，幼儿易于选择
2. 图片要大而清晰，色彩鲜艳
3. 文字简洁易懂，避免复杂词汇
4. 反馈即时积极，多用正面鼓励
5. 支持触屏操作，按钮热区要大

【输出格式】
请输出符合以下结构的JSON数据：

\`\`\`json
{
  "name": "课程名称",
  "description": "课程简介",
  "config": {
    "ageGroup": "large",  // small/middle/large 对应小班/中班/大班
    "domain": "科学",     // 领域
    "duration": 15,       // 预计时长（分钟）
    "totalScore": 100     // 总分
  },
  "theme": {
    "primaryColor": "#667eea",
    "secondaryColor": "#764ba2",
    "backgroundColor": "#f5f7fa"
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "components": [
        {
          "type": "title",
          "id": "title-1",
          "props": {
            "text": "课程标题",
            "subtitle": "副标题/年龄段"
          }
        },
        {
          "type": "objectives",
          "id": "objectives-1",
          "props": {
            "items": ["学习目标1", "学习目标2", "学习目标3"]
          }
        }
      ]
    },
    {
      "id": "slide-2",
      "type": "content",
      "layout": {
        "template": "left-image"
      },
      "components": [
        {
          "type": "image",
          "id": "image-1",
          "props": {
            "src": "图片URL或描述",
            "alt": "图片描述"
          }
        },
        {
          "type": "text",
          "id": "text-1",
          "props": {
            "title": "知识点标题",
            "content": "知识点内容说明..."
          }
        }
      ]
    },
    {
      "id": "slide-3",
      "type": "activity",
      "components": [
        {
          "type": "choice-question",
          "id": "choice-1",
          "props": {
            "title": "问题标题",
            "question": "具体问题描述",
            "hint": "小提示",
            "points": 10,
            "options": [
              {
                "id": "opt-1",
                "text": "选项A文字",
                "image": "选项图片URL（可选）",
                "isCorrect": false
              },
              {
                "id": "opt-2",
                "text": "选项B文字",
                "isCorrect": true
              }
            ]
          }
        }
      ]
    },
    {
      "id": "slide-4",
      "type": "activity",
      "components": [
        {
          "type": "drag-sort",
          "id": "drag-1",
          "props": {
            "title": "排序活动标题",
            "instructions": "请按正确顺序排列",
            "points": 15,
            "items": [
              { "id": "item-1", "text": "步骤1", "image": "图片URL（可选）" },
              { "id": "item-2", "text": "步骤2" },
              { "id": "item-3", "text": "步骤3" }
            ],
            "correctOrder": ["item-1", "item-2", "item-3"]
          }
        }
      ]
    },
    {
      "id": "slide-last",
      "type": "summary",
      "components": [
        {
          "type": "summary",
          "id": "summary-1",
          "props": {
            "title": "课程完成",
            "points": ["今天学到了知识点1", "今天学到了知识点2", "今天学到了知识点3"]
          }
        }
      ]
    }
  ],
  "media": [
    {
      "id": "media-1",
      "type": "image",
      "url": "图片URL",
      "description": "图片描述（用于AI生成）"
    }
  ]
}
\`\`\`

【图片生成说明】
- 图片描述应该详细，包含风格、颜色、内容
- 推荐风格：卡通可爱、色彩鲜艳、适合幼儿
- 图片尺寸建议：内容图 800×600，选项图 400×300

【注意事项】
1. 所有文字内容适合目标年龄段理解
2. 问题和选项要清晰明确，避免歧义
3. 正确答案的反馈要积极正面
4. 错误答案的反馈要鼓励，不能负面
5. 整体风格要统一，色彩搭配和谐`;

/**
 * 课件编辑提示词 - 用于AI对话修改课件
 */
export const CURRICULUM_EDIT_PROMPT = `你是一位专业的幼儿园课件编辑助手。用户会提供当前课件内容和修改需求，请帮助修改课件。

【修改原则】
1. 保持课件整体结构和风格不变
2. 只修改用户明确要求的部分
3. 确保修改后的内容仍然适合目标年龄段
4. 保持课件的教学逻辑连贯性

【支持的修改类型】
- 修改文字内容（标题、问题、选项等）
- 调整页面顺序
- 添加/删除页面
- 修改选项和答案
- 调整得分设置
- 修改图片描述（重新生成图片）

【输出格式】
请输出完整的修改后课件JSON，并说明具体修改了哪些内容。`;

/**
 * 根据年龄段获取适配提示
 */
export function getAgeGroupPrompt(ageGroup: 'small' | 'middle' | 'large'): string {
  const prompts = {
    small: `
【小班(3-4岁)适配要求】
- 文字要极其简单，每句不超过10个字
- 选项最多2个，最好用图片表示
- 问题要非常直接明确
- 互动以识别、指认为主
- 动画要缓慢、可爱
- 声音反馈要清晰、温和`,
    
    middle: `
【中班(4-5岁)适配要求】
- 文字简洁，每句不超过15个字
- 选项2-3个，图文结合
- 问题可以稍复杂，但要明确
- 互动可包含简单排序
- 动画可以稍快
- 可以有简单的计时`,
    
    large: `
【大班(5-6岁)适配要求】
- 文字可以稍长，每句不超过20个字
- 选项2-4个，可以纯文字
- 问题可以有一定思考性
- 互动包含选择、排序、简单判断
- 可以有挑战性元素
- 可以显示得分和进度`
  };
  
  return prompts[ageGroup];
}

/**
 * 根据领域获取内容建议
 */
export function getDomainPrompt(domain: string): string {
  const domains: Record<string, string> = {
    '健康': '注重身体认知、卫生习惯、安全意识的培养，使用生活化场景',
    '语言': '注重听说能力、词汇积累、表达能力，使用故事、儿歌等形式',
    '社会': '注重人际交往、社会规则、情感认知，使用角色扮演、情境模拟',
    '科学': '注重观察探究、逻辑思维、认知发展，使用实验、发现等形式',
    '艺术': '注重审美感知、创意表达、艺术欣赏，使用色彩、音乐等元素'
  };
  
  return domains[domain] || '请根据主题设计适合幼儿的互动内容';
}

/**
 * 生成完整的课件生成提示词
 */
export function generateCurriculumPrompt(params: {
  topic: string;
  ageGroup: 'small' | 'middle' | 'large';
  domain: string;
  objectives?: string[];
  additionalRequirements?: string;
}): string {
  const { topic, ageGroup, domain, objectives, additionalRequirements } = params;
  
  const agePrompt = getAgeGroupPrompt(ageGroup);
  const domainPrompt = getDomainPrompt(domain);
  
  const ageLabels = {
    small: '小班(3-4岁)',
    middle: '中班(4-5岁)',
    large: '大班(5-6岁)'
  };
  
  let prompt = `请为【${ageLabels[ageGroup]}】设计一节【${domain}】领域的互动课件。

【课程主题】
${topic}

${agePrompt}

【领域特点】
${domainPrompt}
`;

  if (objectives && objectives.length > 0) {
    prompt += `
【学习目标】
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}
`;
  }

  if (additionalRequirements) {
    prompt += `
【额外要求】
${additionalRequirements}
`;
  }

  prompt += `
请生成完整的课件JSON数据，包含：
- 1个标题页
- 1-2个知识讲解页
- 2-3个互动活动页（至少包含1个选择题和1个拖拽排序）
- 1个总结页

图片请提供详细的描述文字，我们会用AI图片生成工具来创建。`;

  return prompt;
}

export default {
  CURRICULUM_SYSTEM_PROMPT,
  CURRICULUM_EDIT_PROMPT,
  getAgeGroupPrompt,
  getDomainPrompt,
  generateCurriculumPrompt
};
