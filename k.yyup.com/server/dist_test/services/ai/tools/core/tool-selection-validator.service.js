"use strict";
/**
 * 工具选择验证器服务
 * 负责分析用户查询，判断应该使用的工具，并验证AI的工具选择是否合适
 */
exports.__esModule = true;
exports.ToolSelectionValidatorService = void 0;
/**
 * 工具选择验证器类
 */
var ToolSelectionValidatorService = /** @class */ (function () {
    function ToolSelectionValidatorService() {
        console.log('✅ [工具选择验证器] 初始化完成');
    }
    /**
     * 获取单例实例
     */
    ToolSelectionValidatorService.getInstance = function () {
        if (!ToolSelectionValidatorService.instance) {
            ToolSelectionValidatorService.instance = new ToolSelectionValidatorService();
        }
        return ToolSelectionValidatorService.instance;
    };
    /**
     * 分析查询，判断应该使用的工具
     */
    ToolSelectionValidatorService.prototype.analyzeQuery = function (query) {
        console.log("\uD83D\uDD0D [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5F00\u59CB\u5206\u6790\u67E5\u8BE2: \"".concat(query, "\""));
        // 检测过滤条件
        var filterPatterns = [
            /过滤|筛选|条件/,
            /性别.*[男女]/,
            /年龄.*\d+/,
            /班级.*[大中小]/,
            /状态.*[在职|请假|离职]/,
            /[男女]生/,
            /大班|中班|小班/,
            /在职|请假|离职/
        ];
        var hasFilters = filterPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测排序要求
        var sortingPatterns = [
            /排序|从高到低|从低到高|升序|降序/,
            /按.*排序/,
            /按.*从/,
            /最新|最旧|最多|最少/
        ];
        var hasSorting = sortingPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测统计计算
        var statsPatterns = [
            /统计|求和|平均|最大|最小|总数|数量/,
            /有多少|多少个|共.*个/,
            /占比|百分比|比例/
        ];
        var hasStatistics = statsPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测多表关联
        var joinPatterns = [
            /及其|和|关联|对应|对应的/,
            /学生.*班级|班级.*学生/,
            /教师.*课程|课程.*教师/
        ];
        var hasJoin = joinPatterns.some(function (pattern) { return pattern.test(query); });
        // 检测复杂条件
        var complexPatterns = [
            /且|和|或|非|不是/,
            /既.*又|既.*也/
        ];
        var hasComplexConditions = complexPatterns.some(function (pattern) { return pattern.test(query); });
        // 判断应该使用的工具
        var appropriateTools = [];
        var reason = '';
        if (hasFilters || hasSorting || hasStatistics || hasJoin || hasComplexConditions) {
            appropriateTools = ['any_query'];
            reason = '查询包含过滤、排序、统计或复杂条件，必须使用any_query';
        }
        else {
            appropriateTools = ['read_data_record', 'any_query'];
            reason = '简单全量查询，可以使用read_data_record或any_query';
        }
        var result = {
            hasFilters: hasFilters,
            hasSorting: hasSorting,
            hasStatistics: hasStatistics,
            hasJoin: hasJoin,
            hasComplexConditions: hasComplexConditions,
            appropriateTools: appropriateTools,
            reason: reason
        };
        console.log("\u2705 [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5206\u6790\u7ED3\u679C:", {
            hasFilters: hasFilters,
            hasSorting: hasSorting,
            hasStatistics: hasStatistics,
            hasJoin: hasJoin,
            hasComplexConditions: hasComplexConditions,
            appropriateTools: appropriateTools,
            reason: reason
        });
        return result;
    };
    /**
     * 验证AI选择的工具是否合适
     */
    ToolSelectionValidatorService.prototype.validateToolChoice = function (query, selectedTool) {
        console.log("\uD83D\uDD0D [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u9A8C\u8BC1\u5DE5\u5177\u9009\u62E9: \u67E5\u8BE2=\"".concat(query, "\", \u9009\u62E9\u5DE5\u5177=\"").concat(selectedTool, "\""));
        var analysis = this.analyzeQuery(query);
        var isValid = analysis.appropriateTools.includes(selectedTool);
        var confidence = isValid ? 0.95 : 0.1;
        var result = {
            valid: isValid,
            selectedTool: selectedTool,
            appropriateTools: analysis.appropriateTools,
            reason: isValid
                ? "\u2705 \u5DE5\u5177\u9009\u62E9\u6B63\u786E: ".concat(selectedTool, " \u9002\u5408\u6B64\u67E5\u8BE2")
                : "\u274C \u5DE5\u5177\u9009\u62E9\u4E0D\u5F53: ".concat(selectedTool, " \u4E0D\u9002\u5408\u6B64\u67E5\u8BE2"),
            suggestedTool: isValid ? undefined : analysis.appropriateTools[0],
            confidence: confidence
        };
        if (!isValid) {
            console.warn("\u26A0\uFE0F [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5DE5\u5177\u9009\u62E9\u4E0D\u5F53:", {
                selectedTool: selectedTool,
                suggestedTool: analysis.appropriateTools[0],
                reason: analysis.reason
            });
        }
        else {
            console.log("\u2705 [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5DE5\u5177\u9009\u62E9\u6B63\u786E");
        }
        return result;
    };
    /**
     * 获取工具选择决策树（用于系统提示词）
     */
    ToolSelectionValidatorService.prototype.getToolSelectionDecisionTree = function () {
        return "## \uD83C\uDFAF \u5DE5\u5177\u9009\u62E9\u51B3\u7B56\u6811\uFF08\u5FC5\u987B\u4E25\u683C\u9075\u5B88 - \u8FD9\u662F\u5F3A\u5236\u89C4\u5219\uFF09\n\n\u26A0\uFE0F **\u91CD\u8981\u63D0\u793A**\uFF1A\u4EE5\u4E0B\u89C4\u5219\u662F\u5F3A\u5236\u6027\u7684\uFF0C\u4E0D\u80FD\u8FDD\u53CD\u3002\u5982\u679C\u4F60\u8FDD\u53CD\u8FD9\u4E9B\u89C4\u5219\uFF0C\u7528\u6237\u4F1A\u9047\u5230\u95EE\u9898\u3002\n\n### \u7B2C\u4E00\u6B65\uFF1A\u5206\u6790\u7528\u6237\u67E5\u8BE2\uFF08\u5FC5\u987B\u6267\u884C\uFF09\n\u5728\u8C03\u7528\u4EFB\u4F55\u6570\u636E\u67E5\u8BE2\u5DE5\u5177\u4E4B\u524D\uFF0C**\u5FC5\u987B**\u68C0\u67E5\u4EE5\u4E0B5\u4E2A\u6761\u4EF6\uFF1A\n\n1. **\u662F\u5426\u5305\u542B\u8FC7\u6EE4\u6761\u4EF6\uFF1F**\n   - \u5173\u952E\u8BCD\uFF1A\u8FC7\u6EE4\u3001\u7B5B\u9009\u3001\u6761\u4EF6\u3001\u7537\u3001\u5973\u3001\u5927\u73ED\u3001\u4E2D\u73ED\u3001\u5C0F\u73ED\u3001\u5728\u804C\u3001\u8BF7\u5047\u3001\u79BB\u804C\n   - \u793A\u4F8B\uFF1A\u67E5\u8BE2\u6240\u6709\u7537\u751F\u3001\u67E5\u8BE2\u5728\u804C\u6559\u5E08\u3001\u67E5\u8BE2\u5927\u73ED\u5B66\u751F\n\n2. **\u662F\u5426\u5305\u542B\u6392\u5E8F\u8981\u6C42\uFF1F**\n   - \u5173\u952E\u8BCD\uFF1A\u6392\u5E8F\u3001\u6309...\u6392\u5E8F\u3001\u4ECE\u9AD8\u5230\u4F4E\u3001\u4ECE\u4F4E\u5230\u9AD8\u3001\u5347\u5E8F\u3001\u964D\u5E8F\u3001\u6700\u65B0\u3001\u6700\u65E7\u3001\u6700\u591A\u3001\u6700\u5C11\n   - \u793A\u4F8B\uFF1A\u6309\u5E74\u9F84\u6392\u5E8F\u3001\u6309\u5DE5\u4F5C\u5E74\u9650\u4ECE\u9AD8\u5230\u4F4E\u3001\u6700\u65B0\u7684\u6D3B\u52A8\n\n3. **\u662F\u5426\u5305\u542B\u7EDF\u8BA1\u8BA1\u7B97\uFF1F**\n   - \u5173\u952E\u8BCD\uFF1A\u7EDF\u8BA1\u3001\u6C42\u548C\u3001\u5E73\u5747\u3001\u6700\u5927\u3001\u6700\u5C0F\u3001\u603B\u6570\u3001\u6570\u91CF\u3001\u6709\u591A\u5C11\u3001\u5360\u6BD4\u3001\u767E\u5206\u6BD4\u3001\u6BD4\u4F8B\n   - \u793A\u4F8B\uFF1A\u7EDF\u8BA1\u5B66\u751F\u6570\u91CF\u3001\u7EDF\u8BA1\u7537\u5973\u751F\u6BD4\u4F8B\u3001\u5E73\u5747\u5E74\u9F84\n\n4. **\u662F\u5426\u5305\u542B\u591A\u8868\u5173\u8054\uFF1F**\n   - \u5173\u952E\u8BCD\uFF1A\u53CA\u5176\u3001\u548C\u3001\u5173\u8054\u3001\u5BF9\u5E94\u3001\u5B66\u751F\u53CA\u5176\u73ED\u7EA7\u3001\u6559\u5E08\u548C\u8BFE\u7A0B\n   - \u793A\u4F8B\uFF1A\u67E5\u8BE2\u5B66\u751F\u53CA\u5176\u73ED\u7EA7\u4FE1\u606F\u3001\u67E5\u8BE2\u6559\u5E08\u548C\u8BFE\u7A0B\u5BF9\u5E94\u5173\u7CFB\n\n5. **\u662F\u5426\u5305\u542B\u590D\u6742\u6761\u4EF6\uFF1F**\n   - \u5173\u952E\u8BCD\uFF1A\u4E14\u3001\u6216\u3001\u975E\u3001\u65E2...\u53C8\u3001\u65E2...\u4E5F\n   - \u793A\u4F8B\uFF1A\u67E5\u8BE2\u5927\u73ED\u4E14\u5728\u804C\u7684\u5973\u6027\u6559\u5E08\n\n### \u7B2C\u4E8C\u6B65\uFF1A\u5DE5\u5177\u9009\u62E9\u89C4\u5219\uFF08\u5F3A\u5236\u6267\u884C\uFF09\n**\u5982\u679C\u4E0A\u97625\u4E2A\u6761\u4EF6\u4E2D\u7684\u4EFB\u4F55\u4E00\u4E2A\u4E3A\"\u662F\"\uFF0C\u4F60\u5FC5\u987B\u4F7F\u7528 any_query\uFF0C\u4E0D\u80FD\u4F7F\u7528 read_data_record**\n\n- \u2705 **\u4EFB\u4F55\u4E00\u9879\u4E3A\"\u662F\"** \u2192 **\u5FC5\u987B\u4F7F\u7528 any_query**\uFF08\u65E0\u4F8B\u5916\uFF09\n- \u2705 **\u5168\u90E8\u4E3A\"\u5426\"** \u2192 \u53EF\u4EE5\u4F7F\u7528 read_data_record\n- \u2705 **\u4E0D\u786E\u5B9A** \u2192 \u4F18\u5148\u4F7F\u7528 any_query\uFF08\u66F4\u5B89\u5168\uFF09\n\n### \u7B2C\u4E09\u6B65\uFF1A\u7981\u6B62\u89C4\u5219\uFF08\u4E25\u683C\u7981\u6B62\uFF09\n\u4EE5\u4E0B\u60C5\u51B5**\u7EDD\u5BF9\u7981\u6B62**\u4F7F\u7528 read_data_record\uFF1A\n\n- \u274C **\u7981\u6B62**\u7528read_data_record\u5904\u7406\u6709\u8FC7\u6EE4\u7684\u67E5\u8BE2\uFF08\u5982\uFF1A\u67E5\u8BE2\u7537\u751F\u3001\u67E5\u8BE2\u5728\u804C\u6559\u5E08\uFF09\n- \u274C **\u7981\u6B62**\u7528read_data_record\u5904\u7406\u6709\u6392\u5E8F\u7684\u67E5\u8BE2\uFF08\u5982\uFF1A\u6309\u5E74\u9F84\u6392\u5E8F\u3001\u6700\u65B0\u7684\u6D3B\u52A8\uFF09\n- \u274C **\u7981\u6B62**\u7528read_data_record\u5904\u7406\u7EDF\u8BA1\u67E5\u8BE2\uFF08\u5982\uFF1A\u7EDF\u8BA1\u5B66\u751F\u6570\u91CF\u3001\u7537\u5973\u751F\u6BD4\u4F8B\uFF09\n- \u274C **\u7981\u6B62**\u7528read_data_record\u5904\u7406\u591A\u8868\u5173\u8054\u67E5\u8BE2\uFF08\u5982\uFF1A\u5B66\u751F\u53CA\u5176\u73ED\u7EA7\uFF09\n- \u2705 **\u53EA\u7528**read_data_record\u67E5\u8BE2\u5168\u90E8\u6570\u636E\uFF08\u5982\uFF1A\u67E5\u8BE2\u6240\u6709\u5B66\u751F\u3001\u67E5\u8BE2\u6240\u6709\u6559\u5E08\uFF09\n\n### \u5DE5\u5177\u5BF9\u6BD4\u8868\n| \u529F\u80FD | read_data_record | any_query |\n|------|-----------------|-----------|\n| \u5168\u91CF\u67E5\u8BE2 | \u2705 | \u2705 |\n| \u8FC7\u6EE4\u6761\u4EF6 | \u274C \u7981\u6B62 | \u2705 \u652F\u6301 |\n| \u6392\u5E8F | \u274C \u7981\u6B62 | \u2705 \u652F\u6301 |\n| \u7EDF\u8BA1 | \u274C \u7981\u6B62 | \u2705 \u652F\u6301 |\n| \u591A\u8868JOIN | \u274C \u7981\u6B62 | \u2705 \u652F\u6301 |\n| \u6027\u80FD | \u5FEB(<1s) | \u6162(~18s) |\n\n### \u5E38\u89C1\u9519\u8BEF\u793A\u4F8B\uFF08\u5FC5\u987B\u907F\u514D\uFF09\n\u274C **\u9519\u8BEF1**\uFF1A\u7528\u6237\u95EE\"\u6309\u5E74\u9F84\u6392\u5E8F\u67E5\u8BE2\u5B66\u751F\"\uFF0C\u4F60\u9009\u62E9\u4E86read_data_record\n   - \u539F\u56E0\uFF1A\u5305\u542B\u6392\u5E8F\u8981\u6C42\n   - \u6B63\u786E\u505A\u6CD5\uFF1A\u4F7F\u7528any_query\n\n\u274C **\u9519\u8BEF2**\uFF1A\u7528\u6237\u95EE\"\u7EDF\u8BA1\u73ED\u7EA7\u5B66\u751F\u6570\u91CF\"\uFF0C\u4F60\u9009\u62E9\u4E86read_data_record\n   - \u539F\u56E0\uFF1A\u5305\u542B\u7EDF\u8BA1\u8BA1\u7B97\n   - \u6B63\u786E\u505A\u6CD5\uFF1A\u4F7F\u7528any_query\n\n\u274C **\u9519\u8BEF3**\uFF1A\u7528\u6237\u95EE\"\u67E5\u8BE2\u6240\u6709\u7537\u751F\"\uFF0C\u4F60\u9009\u62E9\u4E86read_data_record\n   - \u539F\u56E0\uFF1A\u5305\u542B\u8FC7\u6EE4\u6761\u4EF6\uFF08\u6027\u522B\uFF09\n   - \u6B63\u786E\u505A\u6CD5\uFF1A\u4F7F\u7528any_query\n\n### \u6B63\u786E\u793A\u4F8B\uFF08\u5FC5\u987B\u9075\u5FAA\uFF09\n\u2705 **\u6B63\u786E1**\uFF1A\u7528\u6237\u95EE\"\u67E5\u8BE2\u6240\u6709\u5B66\u751F\"\n   - \u5206\u6790\uFF1A\u65E0\u8FC7\u6EE4\u3001\u65E0\u6392\u5E8F\u3001\u65E0\u7EDF\u8BA1\u3001\u65E0\u5173\u8054\u3001\u65E0\u590D\u6742\u6761\u4EF6\n   - \u51B3\u5B9A\uFF1A\u4F7F\u7528read_data_record\n\n\u2705 **\u6B63\u786E2**\uFF1A\u7528\u6237\u95EE\"\u6309\u5E74\u9F84\u6392\u5E8F\u67E5\u8BE2\u5B66\u751F\"\n   - \u5206\u6790\uFF1A\u5305\u542B\u6392\u5E8F\u8981\u6C42\n   - \u51B3\u5B9A\uFF1A\u4F7F\u7528any_query\n\n\u2705 **\u6B63\u786E3**\uFF1A\u7528\u6237\u95EE\"\u7EDF\u8BA1\u7537\u5973\u751F\u6BD4\u4F8B\"\n   - \u5206\u6790\uFF1A\u5305\u542B\u7EDF\u8BA1\u8BA1\u7B97\u548C\u8FC7\u6EE4\u6761\u4EF6\n   - \u51B3\u5B9A\uFF1A\u4F7F\u7528any_query\n\n### \u793A\u4F8B\n- \"\u67E5\u8BE2\u6240\u6709\u5B66\u751F\" \u2192 read_data_record \u2705\n- \"\u67E5\u8BE2\u6240\u6709\u7537\u751F\" \u2192 any_query \u2705 (\u6709\u8FC7\u6EE4)\n- \"\u67E5\u8BE2\u6240\u6709\u7537\u751F\uFF0C\u6309\u5E74\u9F84\u6392\u5E8F\" \u2192 any_query \u2705 (\u6709\u8FC7\u6EE4+\u6392\u5E8F)\n- \"\u7EDF\u8BA1\u5B66\u751F\u603B\u6570\" \u2192 any_query \u2705 (\u6709\u7EDF\u8BA1)\n- \"\u67E5\u8BE2\u5B66\u751F\u53CA\u5176\u73ED\u7EA7\" \u2192 any_query \u2705 (\u6709\u5173\u8054)";
    };
    return ToolSelectionValidatorService;
}());
exports.ToolSelectionValidatorService = ToolSelectionValidatorService;
exports["default"] = ToolSelectionValidatorService.getInstance();
