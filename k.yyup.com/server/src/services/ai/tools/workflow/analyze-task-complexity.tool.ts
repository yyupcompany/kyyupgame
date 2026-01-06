/**
 * 任务复杂度分析工具
 * 分析用户输入的任务复杂度，判断是否需要创建TodoList进行任务分解
 */

import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

// 复杂度因素
interface ComplexityFactor {
  name: string;
  weight: number;
  matched: boolean;
  reason?: string;
}

// 复杂度分析结果
interface ComplexityAnalysis {
  score: number;
  level: 'simple' | 'moderate' | 'complex' | 'very_complex';
  factors: ComplexityFactor[];
  estimatedSteps: number;
}

/**
 * 评估任务复杂度
 */
function assessComplexity(userInput: string, context: string = ''): ComplexityAnalysis {
  const factors: ComplexityFactor[] = [];
  const fullText = `${userInput} ${context}`.toLowerCase();
  
  // 1. 多动作检测 (权重: 2.0)
  const actionVerbs = ['创建', '发送', '通知', '安排', '组织', '设计', '审核', '准备', '联系', '确认', '分配', '更新'];
  const matchedActions = actionVerbs.filter(v => fullText.includes(v));
  factors.push({
    name: '多动作任务',
    weight: 2.0,
    matched: matchedActions.length >= 2,
    reason: matchedActions.length >= 2 ? `检测到${matchedActions.length}个操作动词: ${matchedActions.join(', ')}` : undefined
  });
  
  // 2. 时间序列词汇 (权重: 1.5)
  const sequenceWords = ['首先', '然后', '接着', '最后', '之后', '先', '再', '第一步', '第二步'];
  const hasSequence = sequenceWords.some(w => fullText.includes(w));
  factors.push({
    name: '时间序列任务',
    weight: 1.5,
    matched: hasSequence,
    reason: hasSequence ? '检测到时间序列词汇' : undefined
  });
  
  // 3. 复杂任务关键词 (权重: 2.5)
  const complexKeywords = ['策划', '方案', '计划', '流程', '工作流', '完整', '详细', '全面', '系统'];
  const hasComplex = complexKeywords.some(w => fullText.includes(w));
  factors.push({
    name: '复杂任务关键词',
    weight: 2.5,
    matched: hasComplex,
    reason: hasComplex ? '检测到复杂任务关键词' : undefined
  });
  
  // 4. 长句描述 (权重: 1.0)
  const isLong = userInput.length > 50;
  factors.push({
    name: '长句描述',
    weight: 1.0,
    matched: isLong,
    reason: isLong ? `输入长度: ${userInput.length}字符` : undefined
  });
  
  // 5. 涉及多个对象 (权重: 1.5)
  const objectKeywords = ['学生', '老师', '家长', '班级', '活动', '通知', '报名', '课程', '物资', '场地'];
  const matchedObjects = objectKeywords.filter(k => fullText.includes(k));
  factors.push({
    name: '多对象涉及',
    weight: 1.5,
    matched: matchedObjects.length >= 2,
    reason: matchedObjects.length >= 2 ? `涉及${matchedObjects.length}个对象: ${matchedObjects.join(', ')}` : undefined
  });
  
  // 计算总分
  const score = factors.reduce((sum, f) => sum + (f.matched ? f.weight : 0), 0);
  
  // 确定复杂度等级和估计步骤
  let level: ComplexityAnalysis['level'];
  let estimatedSteps: number;
  
  if (score >= 6) {
    level = 'very_complex';
    estimatedSteps = Math.min(10, Math.max(6, matchedActions.length + 3));
  } else if (score >= 4) {
    level = 'complex';
    estimatedSteps = Math.min(8, Math.max(4, matchedActions.length + 2));
  } else if (score >= 2) {
    level = 'moderate';
    estimatedSteps = Math.min(5, Math.max(2, matchedActions.length + 1));
  } else {
    level = 'simple';
    estimatedSteps = 1;
  }
  
  return { score, level, factors, estimatedSteps };
}

/**
 * 生成建议
 */
function generateRecommendations(complexity: ComplexityAnalysis, needsTodoList: boolean): string[] {
  const recommendations: string[] = [];
  
  if (needsTodoList) {
    recommendations.push('建议创建任务清单进行分步执行');
    recommendations.push(`预计需要 ${complexity.estimatedSteps} 个步骤完成`);
    
    const matchedFactors = complexity.factors.filter(f => f.matched);
    if (matchedFactors.length > 0) {
      recommendations.push(`复杂度因素: ${matchedFactors.map(f => f.name).join(', ')}`);
    }
  } else {
    recommendations.push('任务相对简单，可以直接执行');
  }
  
  return recommendations;
}

const analyzeTaskComplexityTool: ToolDefinition = {
  name: 'analyze_task_complexity',
  description: '分析用户任务的复杂度，判断是否需要创建TodoList进行任务分解。适用于复杂任务的预处理。',
  category: TOOL_CATEGORIES.WORKFLOW,
  parameters: {
    type: 'object',
    properties: {
      userInput: {
        type: 'string',
        description: '用户的原始输入或查询'
      },
      context: {
        type: 'string',
        description: '当前上下文信息'
      }
    },
    required: ['userInput']
  },
  handler: async (args: { userInput: string; context?: string }) => {
    console.log('🔍 [任务复杂度分析] 开始分析:', args.userInput);
    
    const { userInput, context = '' } = args;
    const complexity = assessComplexity(userInput, context);
    const needsTodoList = complexity.score >= 3.0;
    const recommendations = generateRecommendations(complexity, needsTodoList);
    
    console.log(`✅ [任务复杂度分析] 完成: ${complexity.level} (${complexity.score}分)`);
    
    return {
      name: 'analyze_task_complexity',
      status: 'success',
      result: {
        needsTodoList,
        complexityLevel: complexity.level,
        complexityScore: complexity.score,
        factors: complexity.factors.filter(f => f.matched),
        recommendations,
        estimatedSteps: complexity.estimatedSteps,
        message: needsTodoList 
          ? `任务较复杂(${complexity.level})，建议创建TodoList分步执行`
          : `任务简单(${complexity.level})，可直接执行`
      }
    };
  }
};

export default analyzeTaskComplexityTool;

