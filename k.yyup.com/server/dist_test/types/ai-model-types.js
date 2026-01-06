"use strict";
/**
 * AI模型相关类型定义
 * 统一管理AI模型选择相关的类型和枚举
 */
exports.__esModule = true;
exports.MODEL_PERFORMANCE = exports.TOOL_CATEGORIES = exports.QueryType = exports.ExecutionPhase = void 0;
/**
 * AI任务执行阶段枚举
 * 用于区分任务的不同执行阶段，以便选择最优模型
 */
var ExecutionPhase;
(function (ExecutionPhase) {
    ExecutionPhase["PLANNING"] = "planning";
    ExecutionPhase["EXECUTION"] = "execution";
    ExecutionPhase["MIXED"] = "mixed"; // 混合阶段：包含规划和执行的复合任务
})(ExecutionPhase = exports.ExecutionPhase || (exports.ExecutionPhase = {}));
/**
 * 查询类型枚举
 */
var QueryType;
(function (QueryType) {
    QueryType["COUNT"] = "count";
    QueryType["STATUS_CHECK"] = "status_check";
    QueryType["SIMPLE_QUESTION"] = "simple_question";
    QueryType["BASIC_EXPLANATION"] = "basic_explanation";
    QueryType["DATA_QUERY"] = "data_query";
    QueryType["ANALYSIS"] = "analysis";
    QueryType["TOOL_CALLING"] = "tool_calling";
    QueryType["MULTIMODAL"] = "multimodal"; // 多模态：包含图片、文档等
})(QueryType = exports.QueryType || (exports.QueryType = {}));
/**
 * 工具分类定义
 */
exports.TOOL_CATEGORIES = {
    // 规划阶段工具 - 使用Thinking模型
    PLANNING_TOOLS: [
        'analyze_task_complexity',
        'create_todo_list',
        'generate_execution_plan',
        'workflow_analysis',
        'complex_reasoning',
        'strategic_planning',
        'requirement_analysis'
    ],
    // 执行阶段工具 - 使用Flash模型
    EXECUTION_TOOLS: [
        'get_student_list',
        'get_teacher_list',
        'get_class_list',
        'create_data_record',
        'update_data_record',
        'delete_data_record',
        'navigate_to_page',
        'render_component',
        'get_page_structure',
        'simple_query',
        'send_notification',
        'upload_file',
        'download_data'
    ],
    // 混合阶段工具 - 根据复杂度选择
    MIXED_TOOLS: [
        'activity_planning',
        'report_generation',
        'data_analysis',
        'content_creation'
    ]
};
/**
 * 模型性能配置
 */
exports.MODEL_PERFORMANCE = {
    'doubao-seed-1-6-thinking-250615': {
        averageTime: 3000,
        complexity: 'high',
        cost: 'high',
        quality: 'excellent',
        bestFor: ['planning', 'analysis', 'reasoning']
    },
    'doubao-seed-1-6-flash-250715': {
        averageTime: 1500,
        complexity: 'medium',
        cost: 'medium',
        quality: 'good',
        bestFor: ['execution', 'queries', 'operations']
    },
    'doubao-ultra-fast-100': {
        averageTime: 500,
        complexity: 'low',
        cost: 'low',
        quality: 'basic',
        bestFor: ['simple_queries', 'status_checks']
    },
    'doubao-fast-200': {
        averageTime: 1200,
        complexity: 'low-medium',
        cost: 'low-medium',
        quality: 'good',
        bestFor: ['explanations', 'basic_analysis']
    }
};
