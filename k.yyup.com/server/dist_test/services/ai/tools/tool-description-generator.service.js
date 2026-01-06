"use strict";
/**
 * 工具描述生成器服务
 *
 * 为每个工具调用生成简短的人类语言描述,说明调用该工具的目的
 * 提升用户体验,让用户实时看到AI的思考和执行过程
 */
exports.__esModule = true;
exports.generateToolIntent = exports.getToolShortName = exports.generateToolDescriptions = exports.generateToolDescription = void 0;
/**
 * 工具意图描述映射表
 *
 * 为每个工具定义"我将要做什么"的意图描述
 * 这些描述会显示在工具调用历史中，让用户清楚地知道AI的意图
 */
var TOOL_INTENTS = {
    // ==================== 任务分析工具 ====================
    'analyze_task_complexity': function (args) {
        return '我将分析任务复杂度，判断是否需要创建待办清单来分解任务';
    },
    // ==================== 数据查询工具 ====================
    'query_past_activities': function (args) {
        if (args.activityType) {
            return "\u6211\u5C06\u67E5\u8BE2".concat(args.activityType, "\u7C7B\u578B\u7684\u5386\u53F2\u6D3B\u52A8\u6570\u636E");
        }
        return '我将查询历史活动数据，分析活动趋势';
    },
    'get_activity_statistics': function (args) {
        return '我将获取活动统计信息，分析活动效果';
    },
    'any_query': function (args) {
        var query = args.query || args.userQuery || '';
        if (query.includes('学生') || query.includes('班级')) {
            return '我将执行智能查询，获取学生和班级相关数据';
        }
        if (query.includes('教师') || query.includes('师资')) {
            return '我将执行智能查询，获取教师和师资相关数据';
        }
        if (query.includes('招生') || query.includes('报名')) {
            return '我将执行智能查询，获取招生和报名相关数据';
        }
        return '我将执行智能查询，获取相关数据';
    },
    'query_enrollment_history': function (args) {
        return '我将查询招生历史数据，分析招生趋势';
    },
    // ==================== 页面操作工具 ====================
    // 注意：navigate_to_page 已移除
    'capture_screen': function (args) {
        if (args.fullPage) {
            return '我将截取完整页面截图，保存当前页面状态';
        }
        return '我将截取当前页面截图';
    },
    'fill_form': function (args) {
        var fieldCount = args.fields ? Object.keys(args.fields).length : 0;
        return "\u6211\u5C06\u586B\u5199\u8868\u5355\uFF0C\u5171".concat(fieldCount, "\u4E2A\u5B57\u6BB5");
    },
    'submit_form': function (args) {
        return '我将提交表单，完成数据保存';
    },
    'click_element': function (args) {
        return '我将点击页面元素，执行相应操作';
    },
    // ==================== TodoList管理工具 ====================
    'create_todo_list': function (args) {
        var title = args.title || '任务清单';
        var taskCount = args.tasks ? args.tasks.length : 0;
        return "\u6211\u5C06\u521B\u5EFA\u5F85\u529E\u6E05\u5355\u3010".concat(title, "\u3011\uFF0C\u5E2E\u52A9\u60A8\u7BA1\u7406").concat(taskCount, "\u4E2A\u4EFB\u52A1");
    },
    'update_todo_task': function (args) {
        var status = args.status || '进行中';
        return "\u6211\u5C06\u66F4\u65B0\u4EFB\u52A1\u72B6\u6001\u4E3A\u3010".concat(status, "\u3011");
    },
    // ==================== 页面状态工具 ====================
    'get_page_structure': function (args) {
        return '我将获取当前页面结构信息，分析页面状态';
    },
    'validate_page_state': function (args) {
        return '我将验证页面状态，确保操作正确';
    },
    'wait_for_element': function (args) {
        return '我将等待页面元素出现，确保页面加载完成';
    },
    // ==================== 活动工作流工具 ====================
    'generate_complete_activity_plan': function (args) {
        var activityName = args.activityName || args.activity_name || '活动';
        return "\u6211\u5C06\u751F\u6210\u5B8C\u6574\u6D3B\u52A8\u65B9\u6848\u3010".concat(activityName, "\u3011\uFF0C\u5305\u62EC\u6D3B\u52A8\u8BA1\u5212\u3001\u7269\u8D44\u6E05\u5355\u7B49");
    },
    'execute_activity_workflow': function (args) {
        if (args.activityName) {
            return "\u6211\u5C06\u6267\u884C\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\uFF0C\u521B\u5EFA\u3010".concat(args.activityName, "\u3011\u6D3B\u52A8");
        }
        return '我将执行活动创建工作流，完成活动创建';
    },
    // ==================== 数据导入工具 ====================
    'import_teacher_data': function (args) {
        return '我将导入教师数据，批量添加教师信息';
    },
    'import_parent_data': function (args) {
        return '我将导入家长数据，批量添加家长信息';
    },
    // ==================== 专家咨询工具 ====================
    'consult_recruitment_planner': function (args) {
        return '我将咨询招生策划专家，获取专业建议';
    },
    'get_expert_list': function (args) {
        if (args.domain) {
            return "\u6211\u5C06\u83B7\u53D6".concat(args.domain, "\u9886\u57DF\u7684\u4E13\u5BB6\u5217\u8868");
        }
        return '我将获取专家列表，为您推荐合适的专家';
    },
    // ==================== 网络搜索工具 ====================
    'web_search': function (args) {
        return '我将搜索网络信息，获取最新资料';
    },
    // ==================== 其他工具 ====================
    'get_current_page_info': function (args) {
        return '我将获取当前页面信息，分析页面状态';
    },
    'scroll_page': function (args) {
        var direction = args.direction || 'down';
        return "\u6211\u5C06\u6EDA\u52A8\u9875\u9762".concat(direction === 'down' ? '向下' : '向上', "\uFF0C\u67E5\u770B\u66F4\u591A\u5185\u5BB9");
    },
    'extract_page_data': function (args) {
        var dataType = args.dataType || '数据';
        return "\u6211\u5C06\u63D0\u53D6\u9875\u9762".concat(dataType, "\uFF0C\u4FDD\u5B58\u5230\u7CFB\u7EDF\u4E2D");
    }
};
/**
 * 工具描述映射表
 *
 * 每个工具都有一个描述生成函数,根据工具参数生成有意义的描述
 */
var TOOL_DESCRIPTIONS = {
    // ==================== 任务分析工具 ====================
    'analyze_task_complexity': function (args) {
        var input = args.userInput || args.user_input || '';
        var inputStr = String(input || '');
        var preview = inputStr.substring(0, 30);
        return "\uD83D\uDD0D \u6B63\u5728\u5206\u6790\u4EFB\u52A1\u590D\u6742\u5EA6: \"".concat(preview).concat(inputStr.length > 30 ? '...' : '', "\"");
    },
    // ==================== 数据查询工具 ====================
    'query_past_activities': function (args) {
        if (args.activityType) {
            return "\uD83D\uDCCA \u6B63\u5728\u67E5\u8BE2".concat(args.activityType, "\u7C7B\u578B\u7684\u5386\u53F2\u6D3B\u52A8\u6570\u636E");
        }
        if (args.timeRange) {
            return "\uD83D\uDCCA \u6B63\u5728\u67E5\u8BE2".concat(args.timeRange, "\u7684\u5386\u53F2\u6D3B\u52A8\u6570\u636E");
        }
        return '📊 正在查询历史活动数据';
    },
    'get_activity_statistics': function (args) {
        if (args.activityId) {
            return "\uD83D\uDCC8 \u6B63\u5728\u83B7\u53D6\u6D3B\u52A8\u7EDF\u8BA1\u4FE1\u606F (ID: ".concat(args.activityId, ")");
        }
        return '📈 正在获取活动统计信息';
    },
    'any_query': function (args) {
        var query = args.query || args.userQuery || args.user_query || '';
        // 确保query是字符串类型
        var queryStr = String(query || '');
        var preview = queryStr.substring(0, 40);
        return "\uD83D\uDD0E \u6B63\u5728\u6267\u884C\u667A\u80FD\u67E5\u8BE2: \"".concat(preview).concat(queryStr.length > 40 ? '...' : '', "\"");
    },
    'query_enrollment_history': function (args) {
        if (args.timeRange) {
            return "\uD83D\uDCCB \u6B63\u5728\u67E5\u8BE2".concat(args.timeRange, "\u7684\u62DB\u751F\u5386\u53F2\u6570\u636E");
        }
        return '📋 正在查询招生历史数据';
    },
    // ==================== 页面操作工具 ====================
    'navigate_to_page': function (args) {
        var pageName = args.pageName || args.page || args.page_path || '目标页面';
        return "\uD83E\uDDED \u6B63\u5728\u5BFC\u822A\u5230\u3010".concat(pageName, "\u3011\u9875\u9762");
    },
    'capture_screen': function (args) {
        if (args.selector) {
            return "\uD83D\uDCF8 \u6B63\u5728\u622A\u53D6\u9875\u9762\u5143\u7D20\u622A\u56FE: ".concat(args.selector);
        }
        if (args.fullPage) {
            return '📸 正在截取完整页面截图';
        }
        return '📸 正在截取当前页面截图';
    },
    'fill_form': function (args) {
        var fieldCount = args.fields ? Object.keys(args.fields).length : 0;
        if (fieldCount > 0) {
            return "\u270D\uFE0F \u6B63\u5728\u586B\u5199\u8868\u5355 (".concat(fieldCount, "\u4E2A\u5B57\u6BB5)");
        }
        return '✍️ 正在填写表单';
    },
    'submit_form': function (args) {
        if (args.formSelector) {
            return "\u2705 \u6B63\u5728\u63D0\u4EA4\u8868\u5355: ".concat(args.formSelector);
        }
        return '✅ 正在提交表单';
    },
    'click_element': function (args) {
        var selector = args.selector || args.element || '按钮';
        return "\uD83D\uDC46 \u6B63\u5728\u70B9\u51FB\u9875\u9762\u5143\u7D20: ".concat(selector);
    },
    // ==================== TodoList管理工具 ====================
    'create_todo_list': function (args) {
        var title = args.title || '任务清单';
        var taskCount = args.tasks ? args.tasks.length : 0;
        return "\uD83D\uDCDD \u6B63\u5728\u521B\u5EFA\u5F85\u529E\u6E05\u5355\u3010".concat(title, "\u3011(").concat(taskCount, "\u4E2A\u4EFB\u52A1)");
    },
    'update_todo_task': function (args) {
        var taskId = args.taskId || args.task_id || '';
        var status = args.status || '进行中';
        return "\u270F\uFE0F \u6B63\u5728\u66F4\u65B0\u4EFB\u52A1\u72B6\u6001: ".concat(taskId, " \u2192 ").concat(status);
    },
    // ==================== 页面状态工具 ====================
    'get_page_structure': function (args) {
        return '🔍 正在获取当前页面结构信息';
    },
    'validate_page_state': function (args) {
        var expectedState = args.expectedState || '目标状态';
        return "\u2714\uFE0F \u6B63\u5728\u9A8C\u8BC1\u9875\u9762\u72B6\u6001: ".concat(expectedState);
    },
    'wait_for_element': function (args) {
        var selector = args.selector || args.element || '元素';
        var timeout = args.timeout || 5000;
        return "\u23F3 \u6B63\u5728\u7B49\u5F85\u9875\u9762\u5143\u7D20\u51FA\u73B0: ".concat(selector, " (\u6700\u591A").concat(timeout, "ms)");
    },
    // ==================== 活动工作流工具 ====================
    'generate_complete_activity_plan': function (args) {
        var activityName = args.activityName || args.activity_name || '活动';
        return "\uD83C\uDFA8 \u6B63\u5728\u751F\u6210\u5B8C\u6574\u6D3B\u52A8\u65B9\u6848: \u3010".concat(activityName, "\u3011");
    },
    'execute_activity_workflow': function (args) {
        if (args.userInput) {
            var inputStr = String(args.userInput || '');
            var preview = inputStr.substring(0, 30);
            return "\uD83D\uDE80 \u6B63\u5728\u6267\u884C\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41: \"".concat(preview).concat(inputStr.length > 30 ? '...' : '', "\"");
        }
        if (args.activityName) {
            return "\uD83D\uDE80 \u6B63\u5728\u6267\u884C\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41: \u3010".concat(args.activityName, "\u3011");
        }
        return '🚀 正在执行活动创建工作流';
    },
    // ==================== 数据导入工具 ====================
    'import_teacher_data': function (args) {
        var fileName = args.fileName || args.file_name || '教师数据文件';
        return "\uD83D\uDCE5 \u6B63\u5728\u5BFC\u5165\u6559\u5E08\u6570\u636E: ".concat(fileName);
    },
    'import_parent_data': function (args) {
        var fileName = args.fileName || args.file_name || '家长数据文件';
        return "\uD83D\uDCE5 \u6B63\u5728\u5BFC\u5165\u5BB6\u957F\u6570\u636E: ".concat(fileName);
    },
    // ==================== 专家咨询工具 ====================
    'consult_recruitment_planner': function (args) {
        var query = args.query || '招生策略';
        var queryStr = String(query || '');
        var preview = queryStr.substring(0, 30);
        return "\uD83D\uDCA1 \u6B63\u5728\u54A8\u8BE2\u62DB\u751F\u7B56\u5212\u4E13\u5BB6: \"".concat(preview).concat(queryStr.length > 30 ? '...' : '', "\"");
    },
    'get_expert_list': function (args) {
        if (args.domain) {
            return "\uD83D\uDC65 \u6B63\u5728\u83B7\u53D6".concat(args.domain, "\u9886\u57DF\u7684\u4E13\u5BB6\u5217\u8868");
        }
        return '👥 正在获取专家列表';
    },
    // ==================== 网络搜索工具 ====================
    'web_search': function (args) {
        var query = args.query || args.searchQuery || '';
        var queryStr = String(query || '');
        var preview = queryStr.substring(0, 30);
        return "\uD83C\uDF10 \u6B63\u5728\u641C\u7D22\u7F51\u7EDC\u4FE1\u606F: \"".concat(preview).concat(queryStr.length > 30 ? '...' : '', "\"");
    },
    // ==================== 其他工具 ====================
    'get_current_page_info': function (args) {
        return '📄 正在获取当前页面信息';
    },
    'scroll_page': function (args) {
        var direction = args.direction || 'down';
        return "\uD83D\uDCDC \u6B63\u5728\u6EDA\u52A8\u9875\u9762: ".concat(direction === 'down' ? '向下' : '向上');
    },
    'extract_page_data': function (args) {
        var dataType = args.dataType || '数据';
        return "\uD83D\uDCE6 \u6B63\u5728\u63D0\u53D6\u9875\u9762\u6570\u636E: ".concat(dataType);
    }
};
/**
 * 生成工具调用描述
 *
 * @param toolName 工具名称
 * @param args 工具参数
 * @returns 人类可读的工具调用描述
 */
function generateToolDescription(toolName, args) {
    console.log('🎯 [工具描述生成器] 开始生成描述:', { toolName: toolName, args: args });
    try {
        // 查找对应的描述生成器
        var generator = TOOL_DESCRIPTIONS[toolName];
        if (generator) {
            // 使用专门的描述生成器
            var description_1 = generator(args);
            console.log('✅ [工具描述生成器] 使用专门生成器:', { toolName: toolName, description: description_1 });
            return description_1;
        }
        // 如果没有专门的描述生成器,生成通用描述
        var description = generateGenericDescription(toolName, args);
        console.log('⚠️ [工具描述生成器] 使用通用生成器:', { toolName: toolName, description: description });
        return description;
    }
    catch (error) {
        console.error("\u274C [\u5DE5\u5177\u63CF\u8FF0\u751F\u6210\u5668] \u751F\u6210\u5931\u8D25: ".concat(toolName), error);
        // 降级到最简单的描述
        return "\uD83D\uDD27 \u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat(toolName);
    }
}
exports.generateToolDescription = generateToolDescription;
/**
 * 生成通用工具描述
 *
 * @param toolName 工具名称
 * @param args 工具参数
 * @returns 通用描述
 */
function generateGenericDescription(toolName, args) {
    // 将工具名称转换为更友好的格式
    var friendlyName = toolName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, function (char) { return char.toUpperCase(); });
    // 尝试从参数中提取有用信息
    var keyParams = extractKeyParameters(args);
    if (keyParams.length > 0) {
        return "\uD83D\uDD27 \u6B63\u5728\u6267\u884C ".concat(friendlyName, ": ").concat(keyParams.join(', '));
    }
    return "\uD83D\uDD27 \u6B63\u5728\u6267\u884C ".concat(friendlyName);
}
/**
 * 从参数中提取关键信息
 *
 * @param args 工具参数
 * @returns 关键参数数组
 */
function extractKeyParameters(args) {
    if (!args || typeof args !== 'object') {
        return [];
    }
    var keyParams = [];
    var importantKeys = ['query', 'name', 'title', 'id', 'type', 'page', 'path'];
    for (var _i = 0, importantKeys_1 = importantKeys; _i < importantKeys_1.length; _i++) {
        var key = importantKeys_1[_i];
        if (args[key]) {
            var value = String(args[key]);
            var preview = value.substring(0, 20);
            keyParams.push("".concat(preview).concat(value.length > 20 ? '...' : ''));
        }
    }
    return keyParams;
}
/**
 * 批量生成工具描述
 *
 * @param toolCalls 工具调用数组
 * @returns 工具描述数组
 */
function generateToolDescriptions(toolCalls) {
    return toolCalls.map(function (toolCall) {
        return generateToolDescription(toolCall.name, toolCall.arguments);
    });
}
exports.generateToolDescriptions = generateToolDescriptions;
/**
 * 获取工具的简短名称(用于UI显示)
 *
 * @param toolName 工具名称
 * @returns 简短名称
 */
function getToolShortName(toolName) {
    var shortNames = {
        'analyze_task_complexity': '任务分析',
        'query_past_activities': '活动查询',
        'get_activity_statistics': '活动统计',
        'any_query': '智能查询',
        'query_enrollment_history': '招生查询',
        'navigate_to_page': '页面导航',
        'capture_screen': '页面截图',
        'fill_form': '表单填写',
        'submit_form': '表单提交',
        'click_element': '元素点击',
        'create_todo_list': '创建清单',
        'update_todo_task': '更新任务',
        'get_page_structure': '页面结构',
        'validate_page_state': '状态验证',
        'wait_for_element': '等待元素',
        'generate_complete_activity_plan': '生成方案',
        'execute_activity_workflow': '执行工作流',
        'import_teacher_data': '导入教师',
        'import_parent_data': '导入家长',
        'consult_recruitment_planner': '专家咨询',
        'get_expert_list': '专家列表',
        'web_search': '网络搜索'
    };
    return shortNames[toolName] || toolName;
}
exports.getToolShortName = getToolShortName;
/**
 * 生成通用工具意图描述
 */
function generateGenericIntent(toolName, args) {
    // 将工具名称转换为人类可读的描述
    var readableName = toolName.replace(/_/g, ' ');
    // 如果有参数，尝试提取关键信息
    if (args && Object.keys(args).length > 0) {
        var keyParams = Object.entries(args)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value !== undefined && value !== null;
        })
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "".concat(key, ": ").concat(value);
        })
            .join(', ');
        if (keyParams) {
            return "\u6267\u884C ".concat(readableName, " (").concat(keyParams, ")");
        }
    }
    return "\u6267\u884C ".concat(readableName);
}
/**
 * 生成工具意图描述
 *
 * @param toolName 工具名称
 * @param args 工具参数
 * @returns 人类可读的工具意图描述（"我将要做什么"）
 */
function generateToolIntent(toolName, args) {
    console.log('💭 [工具意图生成器] 开始生成意图描述:', { toolName: toolName, args: args });
    try {
        // 查找对应的意图生成器
        var generator = TOOL_INTENTS[toolName];
        if (generator) {
            // 使用专门的意图生成器
            var intent_1 = generator(args);
            console.log('✅ [工具意图生成器] 使用专门生成器:', { toolName: toolName, intent: intent_1 });
            return intent_1;
        }
        // 如果没有专门的意图生成器，生成通用意图
        var intent = generateGenericIntent(toolName, args);
        console.log('⚠️ [工具意图生成器] 使用通用生成器:', { toolName: toolName, intent: intent });
        return intent;
    }
    catch (error) {
        console.error("\u274C [\u5DE5\u5177\u610F\u56FE\u751F\u6210\u5668] \u751F\u6210\u5931\u8D25: ".concat(toolName), error);
        return "\u6267\u884C ".concat(toolName);
    }
}
exports.generateToolIntent = generateToolIntent;
