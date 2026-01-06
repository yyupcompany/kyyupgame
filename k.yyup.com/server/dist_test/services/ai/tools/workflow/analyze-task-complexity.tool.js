"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/**
 * 任务复杂度分析工具 - 分析任务复杂度，判断是否需要创建TodoList进行任务分解
 */
var analyzeTaskComplexityTool = {
    name: "analyze_task_complexity",
    description: "分析任务复杂度，判断是否需要创建TodoList进行任务分解。评估任务的步骤数量、依赖关系、资源需求等因素。",
    category: "workflow",
    weight: 6,
    parameters: {
        type: "object",
        properties: {
            userInput: {
                type: "string",
                description: "用户的原始输入或查询"
            },
            context: {
                type: "string",
                description: "当前上下文信息",
                "default": ""
            }
        },
        required: ["userInput"]
    },
    /**
     * 工具实现
     */
    implementation: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var userInput, _a, context, complexity, needsTodoList, recommendations, result;
            return __generator(this, function (_b) {
                try {
                    console.log('🔍 [任务复杂度分析] 开始分析:', args.userInput);
                    userInput = args.userInput, _a = args.context, context = _a === void 0 ? '' : _a;
                    complexity = assessComplexity(userInput, context);
                    needsTodoList = complexity.score >= 3.0;
                    recommendations = generateRecommendations(complexity, needsTodoList);
                    result = {
                        needsTodoList: needsTodoList,
                        complexityLevel: complexity.level,
                        complexityScore: complexity.score,
                        factors: complexity.factors,
                        recommendations: recommendations,
                        estimatedSteps: complexity.estimatedSteps,
                        estimatedTime: complexity.estimatedTime,
                        suggestedApproach: complexity.suggestedApproach
                    };
                    console.log('✅ [任务复杂度分析] 分析完成:', result);
                    return [2 /*return*/, {
                            name: 'analyze_task_complexity',
                            status: 'success',
                            result: result,
                            metadata: {
                                analysisTime: new Date().toISOString(),
                                inputLength: userInput.length
                            }
                        }];
                }
                catch (error) {
                    console.error('❌ [任务复杂度分析] 分析失败:', error);
                    return [2 /*return*/, {
                            name: 'analyze_task_complexity',
                            status: 'error',
                            error: error.message || '任务复杂度分析失败',
                            result: {
                                needsTodoList: false,
                                complexityLevel: 'simple',
                                complexityScore: 1.0,
                                factors: {},
                                recommendations: ['使用默认处理方式'],
                                estimatedSteps: 1,
                                estimatedTime: '1-2分钟',
                                suggestedApproach: 'direct'
                            }
                        }];
                }
                return [2 /*return*/];
            });
        });
    }
};
/**
 * 复杂度评估算法
 */
function assessComplexity(userInput, context) {
    var score = 0;
    var factors = {};
    // 1. 文本长度因子（权重：10%）
    var lengthScore = Math.min(userInput.length / 100, 1) * 0.5;
    score += lengthScore;
    factors.length = {
        score: lengthScore,
        description: "\u8F93\u5165\u957F\u5EA6: ".concat(userInput.length, "\u5B57\u7B26")
    };
    // 2. 操作步骤复杂度（权重：40%）
    var stepIndicators = [
        { pattern: /并且|同时|然后|接着|之后|最后/, weight: 1.5, desc: '多步骤操作' },
        { pattern: /首先|第一步|第二步|步骤/, weight: 1.2, desc: '明确步骤' },
        { pattern: /批量|所有|全部/, weight: 1.0, desc: '批量操作' }
    ];
    var stepScore = 0;
    stepIndicators.forEach(function (indicator) {
        if (indicator.pattern.test(userInput)) {
            stepScore += indicator.weight;
            factors[indicator.desc] = true;
        }
    });
    score += stepScore;
    // 3. 语义复杂度（权重：30%）
    var semanticIndicators = [
        // 创建性任务 - 最高权重
        { pattern: /建一个|建立|创建|设计|制作|开发|编写|生成|制定|规划/, weight: 2.5, desc: '创建性任务' },
        { pattern: /创建.*并.*发布|策划.*并.*执行/, weight: 2.0, desc: '复合操作' },
        { pattern: /分析.*生成.*报告/, weight: 1.8, desc: '分析生成' },
        { pattern: /导入.*处理.*保存/, weight: 1.5, desc: '数据处理流程' },
        { pattern: /查询.*统计.*对比/, weight: 1.3, desc: '复杂查询' }
    ];
    var semanticScore = 0;
    semanticIndicators.forEach(function (indicator) {
        if (indicator.pattern.test(userInput)) {
            semanticScore += indicator.weight;
            factors[indicator.desc] = true;
        }
    });
    score += semanticScore;
    // 4. 协作复杂度（权重：20%）
    var collaborationIndicators = [
        { pattern: /通知|发送|推送/, weight: 0.8, desc: '需要通知' },
        { pattern: /审批|审核|确认/, weight: 1.0, desc: '需要审批' },
        { pattern: /分配|指派/, weight: 0.6, desc: '需要分配' }
    ];
    var collaborationScore = 0;
    collaborationIndicators.forEach(function (indicator) {
        if (indicator.pattern.test(userInput)) {
            collaborationScore += indicator.weight;
            factors[indicator.desc] = true;
        }
    });
    score += collaborationScore;
    // 5. 确定复杂度级别
    var level;
    var estimatedSteps;
    var estimatedTime;
    var suggestedApproach;
    if (score >= 5.0) {
        level = 'very_complex';
        estimatedSteps = 8;
        estimatedTime = '30-60分钟';
        suggestedApproach = 'workflow_with_subtasks';
    }
    else if (score >= 3.0) {
        level = 'complex';
        estimatedSteps = 5;
        estimatedTime = '15-30分钟';
        suggestedApproach = 'workflow';
    }
    else if (score >= 1.5) {
        level = 'moderate';
        estimatedSteps = 3;
        estimatedTime = '5-15分钟';
        suggestedApproach = 'guided_steps';
    }
    else {
        level = 'simple';
        estimatedSteps = 1;
        estimatedTime = '1-5分钟';
        suggestedApproach = 'direct';
    }
    return {
        level: level,
        score: score,
        factors: factors,
        estimatedSteps: estimatedSteps,
        estimatedTime: estimatedTime,
        suggestedApproach: suggestedApproach
    };
}
/**
 * 生成建议
 */
function generateRecommendations(complexity, needsTodoList) {
    var recommendations = [];
    if (needsTodoList) {
        recommendations.push('建议创建TodoList进行任务分解');
        recommendations.push("\u9884\u8BA1\u9700\u8981".concat(complexity.estimatedSteps, "\u4E2A\u6B65\u9AA4"));
        recommendations.push("\u9884\u8BA1\u8017\u65F6\uFF1A".concat(complexity.estimatedTime));
        if (complexity.level === 'very_complex') {
            recommendations.push('建议使用工作流引擎自动化执行');
            recommendations.push('建议设置任务检查点和回滚机制');
        }
        else if (complexity.level === 'complex') {
            recommendations.push('建议分步骤引导用户完成');
            recommendations.push('建议提供进度反馈');
        }
    }
    else {
        recommendations.push('任务较简单，可直接执行');
        recommendations.push('无需创建TodoList');
    }
    // 根据因子添加特定建议
    if (complexity.factors['需要审批']) {
        recommendations.push('注意：需要审批流程，请预留审批时间');
    }
    if (complexity.factors['批量操作']) {
        recommendations.push('注意：批量操作可能耗时较长，建议异步处理');
    }
    if (complexity.factors['数据处理流程']) {
        recommendations.push('注意：涉及数据处理，请确保数据格式正确');
    }
    return recommendations;
}
exports["default"] = analyzeTaskComplexityTool;
