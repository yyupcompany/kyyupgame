/**
 * AI提示词服务 - 管理不同类型文档的专业提示词
 */

interface PromptTemplate {
  templateType: string;
  category: string;
  roleDescription: string;
  systemPrompt: string;
  evaluationCriteria: {
    [key: string]: {
      weight: number;
      description: string;
      scoreRange: [number, number];
    };
  };
  version: string;
}

// 预定义的提示词模板
const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // 消防安全检查
  fire_safety: {
    templateType: 'fire_safety',
    category: '安全管理',
    roleDescription: '资深消防检查员',
    systemPrompt: `你是一位拥有15年经验的幼儿园消防安全检查专家。

你的职责是：
1. 严格按照《幼儿园消防安全管理规定》进行评估
2. 关注儿童安全特殊要求
3. 识别潜在消防隐患
4. 提供专业整改建议

评估重点：
- 消防设施完好率
- 疏散通道畅通性
- 应急预案完整性
- 员工消防培训
- 消防器材配置
- 电气线路安全

评分标准：
90-100分：优秀，符合所有标准
80-89分：良好，有小问题
70-79分：合格，需改进
60-69分：基本合格，有隐患
<60分：不合格，存在重大隐患`,
    evaluationCriteria: {
      '消防设施': { weight: 0.25, description: '灭火器、消防栓、烟感等', scoreRange: [0, 100] },
      '疏散通道': { weight: 0.20, description: '安全出口、疏散指示', scoreRange: [0, 100] },
      '应急管理': { weight: 0.20, description: '预案、演练、培训', scoreRange: [0, 100] },
      '用电安全': { weight: 0.15, description: '线路、插座、设备', scoreRange: [0, 100] },
      '材料存放': { weight: 0.10, description: '易燃物品管理', scoreRange: [0, 100] },
      '记录档案': { weight: 0.10, description: '检查记录、整改记录', scoreRange: [0, 100] }
    },
    version: 'v1.0'
  },

  // 课程质量评估
  curriculum_quality: {
    templateType: 'curriculum_quality',
    category: '教学质量',
    roleDescription: '学前教育专家',
    systemPrompt: `你是一位精通《3-6岁儿童学习与发展指南》的学前教育专家。
你深刻理解新课改精神，坚决反对"幼小衔接"小学化倾向。

评估原则：
1. 以游戏为基本活动
2. 尊重儿童发展规律
3. 关注五大领域平衡发展
4. 严禁提前教授小学内容
5. 重视实践和体验

重点关注：
✅ 游戏化教学比例
✅ 生活化、情境化学习
✅ 户外活动时间
✅ 自主探索机会
❌ 识字、拼音、算术等小学化内容
❌ 机械背诵和训练
❌ 书面作业

评分依据《幼儿园保育教育质量评估指南》(2022)`,
    evaluationCriteria: {
      '游戏化程度': { weight: 0.30, description: '游戏为主要活动形式', scoreRange: [0, 100] },
      '去小学化': { weight: 0.25, description: '无小学化倾向', scoreRange: [0, 100] },
      '领域均衡': { weight: 0.20, description: '五大领域平衡', scoreRange: [0, 100] },
      '自主性': { weight: 0.15, description: '儿童自主探索', scoreRange: [0, 100] },
      '环境创设': { weight: 0.10, description: '支持性环境', scoreRange: [0, 100] }
    },
    version: 'v1.0'
  },

  // 保健工作评估
  health_care: {
    templateType: 'health_care',
    category: '卫生保健',
    roleDescription: '儿童保健医师',
    systemPrompt: `你是一位持有儿童保健医师资格证的专业评估员。
熟悉《托儿所幼儿园卫生保健工作规范》。

评估重点：
1. 晨检午检制度执行
2. 传染病预防控制
3. 营养膳食管理
4. 健康检查档案
5. 卫生消毒制度
6. 意外伤害预防

特别关注：
- 食品安全管理
- 传染病应急处置
- 儿童健康档案完整性
- 保健室设施配置
- 保健人员资质`,
    evaluationCriteria: {
      '晨检制度': { weight: 0.20, description: '晨检午检规范性', scoreRange: [0, 100] },
      '疾病防控': { weight: 0.20, description: '传染病管理', scoreRange: [0, 100] },
      '膳食营养': { weight: 0.20, description: '营养配餐', scoreRange: [0, 100] },
      '卫生消毒': { weight: 0.15, description: '环境卫生', scoreRange: [0, 100] },
      '健康档案': { weight: 0.15, description: '档案管理', scoreRange: [0, 100] },
      '应急处置': { weight: 0.10, description: '应急能力', scoreRange: [0, 100] }
    },
    version: 'v1.0'
  },

  // 默认通用模板
  default: {
    templateType: 'default',
    category: '通用检查',
    roleDescription: '幼儿园管理专家',
    systemPrompt: `你是一位经验丰富的幼儿园管理专家，负责对幼儿园各类文档进行专业评估。

评估原则：
1. 客观公正，实事求是
2. 关注儿童安全和发展
3. 符合国家规范和标准
4. 提供可操作的改进建议

评分标准：
90-100分：优秀
80-89分：良好
70-79分：合格
60-69分：基本合格
<60分：不合格`,
    evaluationCriteria: {
      '规范性': { weight: 0.25, description: '符合规范要求', scoreRange: [0, 100] },
      '完整性': { weight: 0.25, description: '内容完整全面', scoreRange: [0, 100] },
      '有效性': { weight: 0.25, description: '措施切实有效', scoreRange: [0, 100] },
      '记录性': { weight: 0.25, description: '记录详实准确', scoreRange: [0, 100] }
    },
    version: 'v1.0'
  }
};

export class AIPromptService {
  /**
   * 根据模板类型获取提示词模板
   */
  getTemplate(templateType: string): PromptTemplate {
    // 尝试精确匹配
    if (PROMPT_TEMPLATES[templateType]) {
      return PROMPT_TEMPLATES[templateType];
    }

    // 模糊匹配
    const lowerType = templateType.toLowerCase();
    
    if (lowerType.includes('fire') || lowerType.includes('消防') || lowerType.includes('安全')) {
      return PROMPT_TEMPLATES.fire_safety;
    }
    
    if (lowerType.includes('curriculum') || lowerType.includes('课程') || lowerType.includes('教学')) {
      return PROMPT_TEMPLATES.curriculum_quality;
    }
    
    if (lowerType.includes('health') || lowerType.includes('保健') || lowerType.includes('卫生')) {
      return PROMPT_TEMPLATES.health_care;
    }

    // 返回默认模板
    return PROMPT_TEMPLATES.default;
  }

  /**
   * 构建完整的AI提示词
   */
  buildPrompt(template: PromptTemplate, documentContent: any): string {
    const criteriaText = Object.entries(template.evaluationCriteria)
      .map(([key, criteria]) => `
### ${key} (权重: ${criteria.weight * 100}%)
${criteria.description}
评分范围: ${criteria.scoreRange[0]}-${criteria.scoreRange[1]}分
`).join('\n');

    return `
${template.systemPrompt}

## 待评估文档内容
${JSON.stringify(documentContent, null, 2)}

## 评估任务
请按照以下标准对文档进行评估：

${criteriaText}

## 输出要求
请严格按照以下JSON格式输出评估结果：

{
  "score": 总分(0-100),
  "grade": "评级(excellent/good/average/poor/unqualified)",
  "categoryScores": {
    "类别1": 分数,
    "类别2": 分数
  },
  "risks": [
    {
      "level": "high/medium/low",
      "description": "风险描述",
      "suggestion": "整改建议"
    }
  ],
  "suggestions": [
    "改进建议1",
    "改进建议2"
  ],
  "highlights": [
    "亮点1",
    "亮点2"
  ],
  "summary": "总体评价(100字以内)"
}

请开始评估。
`.trim();
  }
}

export const aiPromptService = new AIPromptService();

