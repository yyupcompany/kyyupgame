/**
 * 意图关键词配置
 * 用于快速识别用户消息意图的关键词映射
 */

export interface IntentKeywords {
  keywords: string[];
  confidence: number;
  patterns?: string[];
}

export interface IntentKeywordsConfig {
  [intent: string]: IntentKeywords;
}

const INTENT_KEYWORDS_CONFIG: IntentKeywordsConfig = {
  query: {
    keywords: ['查询', '搜索', '找', '获取', '看', '显示', '列表', '数据', '信息'],
    confidence: 0.8,
    patterns: ['查看.*', '搜索.*', '获取.*', '显示.*']
  },
  create: {
    keywords: ['创建', '新建', '添加', '增加', '增加', '录入', '注册'],
    confidence: 0.9,
    patterns: ['创建.*', '新建.*', '添加.*', '录入.*']
  },
  update: {
    keywords: ['更新', '修改', '编辑', '更改', '调整', '变更'],
    confidence: 0.9,
    patterns: ['更新.*', '修改.*', '编辑.*', '更改.*']
  },
  delete: {
    keywords: ['删除', '移除', '清除', '删除', '销毁'],
    confidence: 0.95,
    patterns: ['删除.*', '移除.*', '清除.*']
  },
  analyze: {
    keywords: ['分析', '统计', '报告', '汇总', '总结', '计算'],
    confidence: 0.85,
    patterns: ['分析.*', '统计.*', '报告.*', '汇总.*']
  },
  conversation: {
    keywords: ['聊天', '对话', '交流', '沟通', '询问', '咨询'],
    confidence: 0.7,
    patterns: ['.*吗', '.*呢', '.*吗？', '.*呢？']
  }
};

export default INTENT_KEYWORDS_CONFIG;