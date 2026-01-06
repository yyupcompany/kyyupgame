"use strict";
/**
 * 工具描述工具函数
 * 用于构建工具的预描述和获取描述模式
 */
exports.__esModule = true;
exports.filterTools = exports.validateToolDefinition = exports.buildCategorizedToolDescription = exports.groupToolsByCategory = exports.getToolSummary = exports.formatToolParameters = exports.getToolDescMode = exports.buildToolPreDescription = void 0;
/**
 * 构建工具预描述
 * @param tools 工具定义列表
 * @param mode 描述模式
 * @returns 工具预描述文本
 */
function buildToolPreDescription(tools, mode) {
    if (mode === void 0) { mode = 'full'; }
    if (!tools || tools.length === 0) {
        return '当前没有可用的工具。';
    }
    var descriptions = [];
    switch (mode) {
        case 'minimal':
            // 最小模式：只列出工具名称
            descriptions.push('可用工具：');
            descriptions.push(tools.map(function (t) { return "- ".concat(t.name); }).join('\n'));
            break;
        case 'brief':
            // 简要模式：工具名称 + 简短描述
            descriptions.push('可用工具：');
            tools.forEach(function (tool) {
                descriptions.push("- ".concat(tool.name, ": ").concat(tool.description));
            });
            break;
        case 'full':
        default:
            // 完整模式：工具名称 + 描述 + 参数
            descriptions.push('可用工具及其参数：');
            tools.forEach(function (tool) {
                descriptions.push("\n### ".concat(tool.name));
                descriptions.push("\u63CF\u8FF0\uFF1A".concat(tool.description));
                if (tool.parameters) {
                    descriptions.push('参数：');
                    var params = tool.parameters.properties || {};
                    Object.entries(params).forEach(function (_a) {
                        var _b, _c;
                        var paramName = _a[0], paramDef = _a[1];
                        var required = ((_c = (_b = tool.parameters) === null || _b === void 0 ? void 0 : _b.required) === null || _c === void 0 ? void 0 : _c.includes(paramName)) ? '(必需)' : '(可选)';
                        var type = paramDef.type || 'any';
                        var desc = paramDef.description || '';
                        descriptions.push("  - ".concat(paramName, " ").concat(required, ": ").concat(type, " - ").concat(desc));
                    });
                }
            });
            break;
    }
    return descriptions.join('\n');
}
exports.buildToolPreDescription = buildToolPreDescription;
/**
 * 获取工具描述模式
 * 根据工具数量和复杂度自动选择合适的描述模式
 * @param tools 工具定义列表
 * @returns 推荐的描述模式
 */
function getToolDescMode(tools) {
    if (!tools || tools.length === 0) {
        return 'minimal';
    }
    var toolCount = tools.length;
    var avgParamCount = tools.reduce(function (sum, tool) {
        var _a;
        var paramCount = ((_a = tool.parameters) === null || _a === void 0 ? void 0 : _a.properties)
            ? Object.keys(tool.parameters.properties).length
            : 0;
        return sum + paramCount;
    }, 0) / toolCount;
    // 根据工具数量和平均参数数量决定模式
    if (toolCount > 20 || avgParamCount > 10) {
        return 'minimal';
    }
    else if (toolCount > 10 || avgParamCount > 5) {
        return 'brief';
    }
    else {
        return 'full';
    }
}
exports.getToolDescMode = getToolDescMode;
/**
 * 格式化工具参数为字符串
 * @param parameters 工具参数定义
 * @returns 格式化的参数字符串
 */
function formatToolParameters(parameters) {
    if (!parameters || !parameters.properties) {
        return '无参数';
    }
    var params = parameters.properties;
    var required = parameters.required || [];
    var lines = [];
    Object.entries(params).forEach(function (_a) {
        var name = _a[0], def = _a[1];
        var isRequired = required.includes(name);
        var type = def.type || 'any';
        var desc = def.description || '';
        var requiredTag = isRequired ? '[必需]' : '[可选]';
        lines.push("".concat(name, " ").concat(requiredTag, " (").concat(type, "): ").concat(desc));
    });
    return lines.join('\n');
}
exports.formatToolParameters = formatToolParameters;
/**
 * 获取工具的简短摘要
 * @param tool 工具定义
 * @returns 工具摘要
 */
function getToolSummary(tool) {
    var _a;
    var paramCount = ((_a = tool.parameters) === null || _a === void 0 ? void 0 : _a.properties)
        ? Object.keys(tool.parameters.properties).length
        : 0;
    return "".concat(tool.name, " - ").concat(tool.description, " (").concat(paramCount, "\u4E2A\u53C2\u6570)");
}
exports.getToolSummary = getToolSummary;
/**
 * 按分类分组工具
 * @param tools 工具定义列表
 * @returns 按分类分组的工具
 */
function groupToolsByCategory(tools) {
    var groups = {};
    tools.forEach(function (tool) {
        var category = tool.category || '其他';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(tool);
    });
    return groups;
}
exports.groupToolsByCategory = groupToolsByCategory;
/**
 * 构建分类工具描述
 * @param tools 工具定义列表
 * @param mode 描述模式
 * @returns 按分类组织的工具描述
 */
function buildCategorizedToolDescription(tools, mode) {
    if (mode === void 0) { mode = 'brief'; }
    var groups = groupToolsByCategory(tools);
    var descriptions = [];
    descriptions.push('可用工具（按分类）：\n');
    Object.entries(groups).forEach(function (_a) {
        var category = _a[0], categoryTools = _a[1];
        descriptions.push("## ".concat(category));
        categoryTools.forEach(function (tool) {
            switch (mode) {
                case 'minimal':
                    descriptions.push("- ".concat(tool.name));
                    break;
                case 'brief':
                    descriptions.push("- ".concat(tool.name, ": ").concat(tool.description));
                    break;
                case 'full':
                    descriptions.push("\n### ".concat(tool.name));
                    descriptions.push("".concat(tool.description));
                    descriptions.push(formatToolParameters(tool.parameters));
                    break;
            }
        });
        descriptions.push('');
    });
    return descriptions.join('\n');
}
exports.buildCategorizedToolDescription = buildCategorizedToolDescription;
/**
 * 验证工具定义的完整性
 * @param tool 工具定义
 * @returns 验证结果
 */
function validateToolDefinition(tool) {
    var errors = [];
    if (!tool.name) {
        errors.push('工具名称不能为空');
    }
    if (!tool.description) {
        errors.push('工具描述不能为空');
    }
    if (tool.parameters) {
        if (!tool.parameters.type || tool.parameters.type !== 'object') {
            errors.push('参数类型必须是 object');
        }
        if (tool.parameters.required && !Array.isArray(tool.parameters.required)) {
            errors.push('required 字段必须是数组');
        }
    }
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
exports.validateToolDefinition = validateToolDefinition;
/**
 * 过滤工具列表
 * @param tools 工具定义列表
 * @param filter 过滤条件
 * @returns 过滤后的工具列表
 */
function filterTools(tools, filter) {
    return tools.filter(function (tool) {
        if (filter.category && tool.category !== filter.category) {
            return false;
        }
        if (filter.namePattern && !filter.namePattern.test(tool.name)) {
            return false;
        }
        if (filter.hasParameters !== undefined) {
            var hasParams = tool.parameters &&
                tool.parameters.properties &&
                Object.keys(tool.parameters.properties).length > 0;
            if (filter.hasParameters !== hasParams) {
                return false;
            }
        }
        return true;
    });
}
exports.filterTools = filterTools;
