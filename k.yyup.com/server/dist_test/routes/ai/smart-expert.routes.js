"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var axios_1 = __importDefault(require("axios"));
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var ai_model_cache_service_1 = require("../../services/ai-model-cache.service");
var intelligent_expert_consultation_service_1 = require("../../services/ai/intelligent-expert-consultation.service");
var router = (0, express_1.Router)();
// 应用认证中间件到需要认证的路由
router.use(auth_middleware_1.verifyToken);
// 专家定义
var EXPERTS = {
    'activity_planner': {
        id: 'activity_planner',
        name: '活动策划专家',
        description: '专业的幼儿园活动策划专家，擅长设计教育性、趣味性和安全性并重的活动方案',
        capabilities: ['活动方案设计', '教育价值评估', '安全风险控制', '资源配置优化'],
        prompt: '你是资深的幼儿园活动策划专家，拥有10年以上的活动组织经验。请根据需求制定详细的活动方案，重点考虑教育价值、趣味性、安全性和可执行性。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'marketing_expert': {
        id: 'marketing_expert',
        name: '招生营销专家',
        description: '专业的教育行业营销专家，擅长招生策略制定和品牌推广',
        capabilities: ['招生策略', '品牌推广', '市场分析', '转化优化'],
        prompt: '你是专业的教育行业营销专家，精通幼儿园招生策略和品牌建设。请根据需求制定有效的营销方案，重点关注目标客户分析、渠道选择和转化优化。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'education_expert': {
        id: 'education_expert',
        name: '教育评估专家',
        description: '专业的幼儿教育专家，擅长教育方案评估和课程设计',
        capabilities: ['教育方案评估', '课程设计', '发展评估', '教学质量'],
        prompt: '你是资深的幼儿教育专家，具有丰富的教育理论知识和实践经验。请从教育专业角度分析方案的教育价值和发展适宜性。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'cost_analyst': {
        id: 'cost_analyst',
        name: '成本分析专家',
        description: '专业的成本控制和预算管理专家',
        capabilities: ['成本核算', '预算制定', '资源优化', '投入产出分析'],
        prompt: '你是专业的成本分析专家，擅长教育行业的成本控制和预算管理。请从成本效益角度分析方案的可行性和优化建议。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'risk_assessor': {
        id: 'risk_assessor',
        name: '风险评估专家',
        description: '专业的风险管理和安全评估专家',
        capabilities: ['风险识别', '安全评估', '应急预案', '合规检查'],
        prompt: '你是专业的风险评估专家，专注于教育活动的安全管理和风险控制。请识别潜在风险并提供防控措施。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'creative_designer': {
        id: 'creative_designer',
        name: '创意设计专家',
        description: '专业的创意设计和视觉传达专家',
        capabilities: ['创意设计', '视觉传达', '用户体验', '品牌形象'],
        prompt: '你是专业的创意设计专家，擅长教育行业的视觉设计和创意策划。请从设计和用户体验角度提供创意建议。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    },
    'curriculum_expert': {
        id: 'curriculum_expert',
        name: '课程教学专家',
        description: '专业的幼儿园课程教学专家，为新老师提供各类课程的专业教学指导',
        capabilities: ['课程设计', '教学方法', '教学技巧', '课堂管理', '教学评估', '新教师指导'],
        prompt: '你是资深的幼儿园课程教学专家，拥有15年以上的一线教学和教师培训经验。你专门为新老师提供专业的教学指导，擅长各年龄段的课程教学方法。请根据教学需求提供具体可操作的教学建议，重点关注教学方法、课堂管理、教学技巧和教学效果评估。请使用Markdown格式回复，包括标题、列表、加粗等格式来组织内容。'
    }
};
// 专家工具函数定义
var EXPERT_TOOLS = [
    {
        type: 'function',
        "function": {
            name: 'get_expert_list',
            description: '获取可用的专家列表及其能力描述，用于了解有哪些专家可以协助解决问题',
            parameters: {
                type: 'object',
                properties: {
                    domain: {
                        type: 'string',
                        description: '专家领域筛选（可选）：activity（活动策划）, marketing（营销推广）, education（教育评估）, analysis（分析评估）',
                        "enum": ['activity', 'marketing', 'education', 'analysis', 'all']
                    }
                }
            }
        }
    },
    {
        type: 'function',
        "function": {
            name: 'call_expert',
            description: '调用特定专家进行专业分析和建议，当需要专业意见时使用',
            parameters: {
                type: 'object',
                properties: {
                    expert_id: {
                        type: 'string',
                        description: '专家ID',
                        "enum": ['activity_planner', 'marketing_expert', 'education_expert', 'cost_analyst', 'risk_assessor', 'creative_designer', 'curriculum_expert']
                    },
                    task: {
                        type: 'string',
                        description: '具体任务描述，详细说明需要专家分析的问题'
                    },
                    context: {
                        type: 'string',
                        description: '相关上下文信息，包括用户需求、已有信息等'
                    }
                },
                required: ['expert_id', 'task']
            }
        }
    },
    {
        type: 'function',
        "function": {
            name: 'generate_todo_list',
            description: '生成任务清单或待办事项列表，用于项目管理、活动执行、工作分配等场景',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: '任务清单的标题'
                    },
                    description: {
                        type: 'string',
                        description: '任务清单的描述'
                    },
                    categories: {
                        type: 'array',
                        description: '分类的任务列表',
                        items: {
                            type: 'object',
                            properties: {
                                title: { type: 'string', description: '类别标题' },
                                icon: { type: 'string', description: '类别图标emoji' },
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            text: { type: 'string', description: '任务内容' },
                                            assignee: { type: 'string', description: '负责人' },
                                            deadline: { type: 'string', description: '截止日期' },
                                            priority: { type: 'string', "enum": ['high', 'medium', 'low'], description: '优先级' },
                                            completed: { type: 'boolean', description: '是否已完成' }
                                        },
                                        required: ['text']
                                    }
                                }
                            },
                            required: ['title', 'items']
                        }
                    }
                },
                required: ['title', 'categories']
            }
        }
    },
    {
        type: 'function',
        "function": {
            name: 'create_activity_entry',
            description: '智能创建活动条目，AI会根据用户描述自动填充活动必填字段并请求用户确认后入库，支持图片生成选择',
            parameters: {
                type: 'object',
                properties: {
                    user_input: {
                        type: 'string',
                        description: '用户的原始输入描述，包含活动相关信息'
                    },
                    extracted_data: {
                        type: 'object',
                        description: 'AI从用户输入中提取和补充的活动数据',
                        properties: {
                            title: { type: 'string', description: '活动标题' },
                            description: { type: 'string', description: '活动描述' },
                            activityType: {
                                type: 'integer',
                                "enum": [1, 2, 3, 4, 5, 6],
                                description: '活动类型：1-开放日 2-家长会 3-亲子活动 4-招生宣讲 5-园区参观 6-其他'
                            },
                            startTime: { type: 'string', format: 'date-time', description: '活动开始时间' },
                            endTime: { type: 'string', format: 'date-time', description: '活动结束时间' },
                            location: { type: 'string', description: '活动地点' },
                            capacity: { type: 'integer', minimum: 1, description: '活动容量/名额' },
                            fee: { type: 'number', minimum: 0, description: '活动费用，默认0' },
                            registrationStartTime: { type: 'string', format: 'date-time', description: '报名开始时间' },
                            registrationEndTime: { type: 'string', format: 'date-time', description: '报名结束时间' },
                            kindergartenId: { type: 'integer', description: '幼儿园ID，默认1' },
                            needsApproval: { type: 'boolean', description: '是否需要审核，默认false' }
                        },
                        required: ['title', 'activityType', 'startTime', 'endTime', 'location', 'capacity']
                    },
                    image_handling: {
                        type: 'object',
                        description: 'AI建议的图片处理配置',
                        properties: {
                            suggest_generation: {
                                type: 'boolean',
                                description: '是否建议生成活动海报图片'
                            },
                            suggested_prompt: {
                                type: 'string',
                                description: 'AI建议的图片生成提示词，基于活动内容自动生成'
                            },
                            image_style: {
                                type: 'string',
                                "enum": ['cartoon', 'natural', 'artistic'],
                                description: '建议的图片风格：cartoon-卡通风格, natural-自然风格, artistic-艺术风格'
                            },
                            image_category: {
                                type: 'string',
                                "enum": ['outdoor', 'indoor', 'sports', 'arts', 'science', 'social'],
                                description: '活动场景分类，用于优化图片生成'
                            }
                        }
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'AI对数据提取准确性的置信度(0-1)'
                    }
                },
                required: ['user_input', 'extracted_data']
            }
        }
    },
    {
        type: 'function',
        "function": {
            name: 'create_todo_entry',
            description: '智能创建任务条目，AI会根据用户描述自动填充任务必填字段并请求用户确认后入库',
            parameters: {
                type: 'object',
                properties: {
                    user_input: {
                        type: 'string',
                        description: '用户的原始输入描述，包含任务相关信息'
                    },
                    extracted_data: {
                        type: 'object',
                        description: 'AI从用户输入中提取和补充的任务数据',
                        properties: {
                            title: { type: 'string', description: '任务标题' },
                            description: { type: 'string', description: '任务描述' },
                            priority: {
                                type: 'integer',
                                "enum": [1, 2, 3, 4, 5],
                                description: '优先级：1-最高 2-高 3-中 4-低 5-最低，默认3'
                            },
                            status: {
                                type: 'string',
                                "enum": ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
                                description: '任务状态，默认pending'
                            },
                            dueDate: { type: 'string', format: 'date-time', description: '截止日期' },
                            assignedTo: { type: 'integer', description: '分配给用户ID' },
                            tags: {
                                type: 'array',
                                items: { type: 'string' },
                                description: '标签列表'
                            },
                            relatedId: { type: 'integer', description: '关联ID（可关联活动等）' },
                            relatedType: { type: 'string', description: '关联类型（如activity、enrollment等）' },
                            notify: { type: 'boolean', description: '是否通知，默认false' },
                            userId: { type: 'integer', description: '创建用户ID，默认1' }
                        },
                        required: ['title']
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'AI对数据提取准确性的置信度(0-1)'
                    }
                },
                required: ['user_input', 'extracted_data']
            }
        }
    }
];
// 专家工具执行函数
function executeExpertTool(toolName, args) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, expertListResult, expertResult, todoResult, activityResult, taskResult;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\uD83D\uDD27 \u5F00\u59CB\u6267\u884C\u5DE5\u5177: ".concat(toolName, "\uFF0C\u53C2\u6570:"), args);
                    _a = toolName;
                    switch (_a) {
                        case 'get_expert_list': return [3 /*break*/, 1];
                        case 'call_expert': return [3 /*break*/, 2];
                        case 'generate_todo_list': return [3 /*break*/, 4];
                        case 'create_activity_entry': return [3 /*break*/, 5];
                        case 'create_todo_entry': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1:
                    expertListResult = getExpertList(args.domain);
                    console.log("\u2705 get_expert_list \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:", expertListResult);
                    return [2 /*return*/, expertListResult];
                case 2:
                    console.log("\uD83D\uDD04 \u5F00\u59CB\u8C03\u7528\u4E13\u5BB6: ".concat(args.expert_id));
                    return [4 /*yield*/, callExpert(args.expert_id, args.task, args.context)];
                case 3:
                    expertResult = _b.sent();
                    console.log("\u2705 call_expert \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:", expertResult);
                    return [2 /*return*/, expertResult];
                case 4:
                    console.log("\uD83D\uDCCB \u751F\u6210TodoList:", args);
                    todoResult = generateTodoList(args);
                    console.log("\u2705 generate_todo_list \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:", todoResult);
                    return [2 /*return*/, todoResult];
                case 5:
                    console.log("\uD83C\uDFAF \u667A\u80FD\u521B\u5EFA\u6D3B\u52A8\u6761\u76EE:", args);
                    return [4 /*yield*/, createActivityEntry(args)];
                case 6:
                    activityResult = _b.sent();
                    console.log("\u2705 create_activity_entry \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:", activityResult);
                    return [2 /*return*/, activityResult];
                case 7:
                    console.log("\uD83D\uDCDD \u667A\u80FD\u521B\u5EFA\u4EFB\u52A1\u6761\u76EE:", args);
                    return [4 /*yield*/, createTodoEntry(args)];
                case 8:
                    taskResult = _b.sent();
                    console.log("\u2705 create_todo_entry \u6267\u884C\u5B8C\u6210\uFF0C\u7ED3\u679C:", taskResult);
                    return [2 /*return*/, taskResult];
                case 9:
                    console.error("\u274C \u672A\u77E5\u7684\u5DE5\u5177: ".concat(toolName));
                    throw new Error("\u672A\u77E5\u7684\u5DE5\u5177: ".concat(toolName));
            }
        });
    });
}
// 获取专家列表
function getExpertList(domain) {
    var allExperts = Object.values(EXPERTS);
    if (!domain || domain === 'all') {
        return {
            experts: allExperts.map(function (expert) { return ({
                id: expert.id,
                name: expert.name,
                description: expert.description,
                capabilities: expert.capabilities
            }); }),
            total: allExperts.length
        };
    }
    // 根据领域筛选专家
    var domainMapping = {
        'activity': ['activity_planner', 'education_expert', 'risk_assessor'],
        'marketing': ['marketing_expert', 'creative_designer'],
        'education': ['education_expert', 'curriculum_expert', 'activity_planner'],
        'analysis': ['cost_analyst', 'risk_assessor', 'education_expert']
    };
    var expertIds = domainMapping[domain] || [];
    var filteredExperts = allExperts.filter(function (expert) { return expertIds.includes(expert.id); });
    return {
        experts: filteredExperts.map(function (expert) { return ({
            id: expert.id,
            name: expert.name,
            description: expert.description,
            capabilities: expert.capabilities
        }); }),
        total: filteredExperts.length,
        domain: domain
    };
}
// 生成TodoList
function generateTodoList(args) {
    console.log('📋 生成TodoList，参数:', args);
    // 返回结构化的TodoList数据
    var todoListData = {
        title: args.title || '任务清单',
        description: args.description || '为您生成的任务执行清单',
        categories: args.categories || [
            {
                title: '即时任务',
                icon: '🔥',
                items: [
                    {
                        text: '任务数据生成中...',
                        assignee: '系统',
                        priority: 'medium',
                        completed: false
                    }
                ]
            }
        ],
        timestamp: new Date().toISOString()
    };
    return {
        type: 'todo-list',
        data: todoListData,
        success: true
    };
}
// 智能创建活动条目
function createActivityEntry(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user_input, extracted_data_1, confidence, image_handling, requiredFields, missingFields, completedData, imageConfig;
        return __generator(this, function (_a) {
            console.log('🎯 开始智能创建活动条目，参数:', args);
            try {
                user_input = args.user_input, extracted_data_1 = args.extracted_data, confidence = args.confidence, image_handling = args.image_handling;
                requiredFields = ['title', 'activityType', 'startTime', 'endTime', 'location', 'capacity'];
                missingFields = requiredFields.filter(function (field) { return !extracted_data_1[field]; });
                if (missingFields.length > 0) {
                    console.warn("\u26A0\uFE0F \u6D3B\u52A8\u6570\u636E\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5:", missingFields);
                    return [2 /*return*/, {
                            type: 'activity-entry',
                            status: 'incomplete',
                            message: "\u6D3B\u52A8\u4FE1\u606F\u4E0D\u5B8C\u6574\uFF0C\u7F3A\u5C11\u4EE5\u4E0B\u5FC5\u586B\u5B57\u6BB5: ".concat(missingFields.join(', ')),
                            data: {
                                user_input: user_input,
                                extracted_data: extracted_data_1,
                                missing_fields: missingFields,
                                confidence: confidence || 0.5
                            },
                            requires_user_input: true
                        }];
                }
                completedData = __assign(__assign({}, extracted_data_1), { kindergartenId: extracted_data_1.kindergartenId || 1, fee: extracted_data_1.fee || 0, needsApproval: extracted_data_1.needsApproval !== undefined ? extracted_data_1.needsApproval : false, registrationStartTime: extracted_data_1.registrationStartTime || extracted_data_1.startTime, registrationEndTime: extracted_data_1.registrationEndTime || extracted_data_1.startTime, status: 0, registeredCount: 0, checkedInCount: 0, publishStatus: 0 // 草稿
                 });
                imageConfig = processImageHandling(image_handling, completedData);
                console.log('✨ 活动数据补全完成:', completedData);
                console.log('🎨 图片处理配置:', imageConfig);
                return [2 /*return*/, {
                        type: 'activity-entry',
                        status: 'ready_for_confirmation',
                        message: "AI\u5DF2\u4E3A\u60A8\u667A\u80FD\u586B\u5145\u6D3B\u52A8\u4FE1\u606F\uFF0C\u8BF7\u786E\u8BA4\u540E\u6DFB\u52A0\u5230\u6570\u636E\u5E93",
                        data: {
                            user_input: user_input,
                            extracted_data: completedData,
                            confidence: confidence || 0.8,
                            activity_type_name: getActivityTypeName(completedData.activityType),
                            image_config: imageConfig // 添加图片配置
                        },
                        requires_user_confirmation: true
                    }];
            }
            catch (error) {
                console.error('❌ 创建活动条目失败:', error);
                return [2 /*return*/, {
                        type: 'activity-entry',
                        status: 'error',
                        message: 'AI处理活动信息时出现错误，请重新尝试',
                        error: error instanceof Error ? error.message : '未知错误'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
// 智能创建任务条目
function createTodoEntry(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user_input, extracted_data, confidence, completedData;
        return __generator(this, function (_a) {
            console.log('📝 开始智能创建任务条目，参数:', args);
            try {
                user_input = args.user_input, extracted_data = args.extracted_data, confidence = args.confidence;
                // 验证必填字段（只有title是必填的）
                if (!extracted_data.title) {
                    console.warn("\u26A0\uFE0F \u4EFB\u52A1\u6570\u636E\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5: title");
                    return [2 /*return*/, {
                            type: 'todo-entry',
                            status: 'incomplete',
                            message: '任务信息不完整，缺少任务标题',
                            data: {
                                user_input: user_input,
                                extracted_data: extracted_data,
                                missing_fields: ['title'],
                                confidence: confidence || 0.5
                            },
                            requires_user_input: true
                        }];
                }
                completedData = __assign(__assign({}, extracted_data), { priority: extracted_data.priority || 3, status: extracted_data.status || 'pending', notify: extracted_data.notify !== undefined ? extracted_data.notify : false, userId: extracted_data.userId || 1, tags: extracted_data.tags || [] });
                console.log('✨ 任务数据补全完成:', completedData);
                return [2 /*return*/, {
                        type: 'todo-entry',
                        status: 'ready_for_confirmation',
                        message: "AI\u5DF2\u4E3A\u60A8\u667A\u80FD\u586B\u5145\u4EFB\u52A1\u4FE1\u606F\uFF0C\u8BF7\u786E\u8BA4\u540E\u6DFB\u52A0\u5230\u6570\u636E\u5E93",
                        data: {
                            user_input: user_input,
                            extracted_data: completedData,
                            confidence: confidence || 0.8,
                            priority_name: getTodoPriorityName(completedData.priority),
                            status_name: getTodoStatusName(completedData.status)
                        },
                        requires_user_confirmation: true
                    }];
            }
            catch (error) {
                console.error('❌ 创建任务条目失败:', error);
                return [2 /*return*/, {
                        type: 'todo-entry',
                        status: 'error',
                        message: 'AI处理任务信息时出现错误，请重新尝试',
                        error: error instanceof Error ? error.message : '未知错误'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
// 处理图片生成配置
function processImageHandling(imageHandling, activityData) {
    // 如果没有提供图片处理配置，生成默认配置（取消智能提示词与预设，交给前端/用户输入）
    if (!imageHandling) {
        return {
            suggest_generation: false,
            suggested_prompt: '',
            image_style: '',
            image_category: '',
            image_size: '1024x768',
            show_image_options: true
        };
    }
    // 处理AI建议的图片配置（不再生成或填充默认提示词）
    var config = {
        suggest_generation: imageHandling.suggest_generation === true,
        suggested_prompt: imageHandling.suggested_prompt || '',
        image_style: imageHandling.image_style || '',
        image_category: imageHandling.image_category || '',
        image_size: '1024x768',
        show_image_options: true // 显示图片选择选项
    };
    console.log('🎨 处理图片配置完成:', config);
    return config;
}
// 生成默认图片配置
function generateDefaultImageConfig(activityData) {
    return {
        suggest_generation: false,
        suggested_prompt: '',
        image_style: '',
        image_category: '',
        image_size: '1024x768',
        show_image_options: true
    };
}
// 生成智能提示词
function generateSmartPrompt(activityData) {
    var title = activityData.title || '幼儿园活动';
    var description = activityData.description || '';
    var location = activityData.location || '幼儿园';
    var activityTypeName = getActivityTypeName(activityData.activityType);
    // 基础提示词模板
    var prompt = "3-6\u5C81\u5E7C\u513F\u56ED".concat(title, "\u6D3B\u52A8\u573A\u666F");
    // 根据描述添加细节
    if (description) {
        prompt += "\uFF0C".concat(description);
    }
    // 添加地点信息
    if (location && location !== '幼儿园') {
        prompt += "\uFF0C\u5730\u70B9\u5728".concat(location);
    }
    // 根据活动类型添加场景描述
    var sceneDescriptions = {
        1: '家长和孩子们在温馨明亮的教室里参观，展示幼儿园的教学环境和设施',
        2: '家长们围坐在舒适的会议室里，老师们分享孩子们的成长情况',
        3: '家长和孩子们一起参与有趣的互动游戏，充满欢声笑语',
        4: '专业的老师向家长们介绍幼儿园的教育理念和课程特色',
        5: '家长们带着孩子参观美丽的校园环境，了解各种教学设施',
        6: '孩子们在专业老师的指导下参与各种教育活动' // 其他
    };
    var sceneDesc = sceneDescriptions[activityData.activityType] || sceneDescriptions[6];
    prompt += "\uFF0C".concat(sceneDesc);
    // 添加氛围和风格描述
    prompt += '，孩子们天真可爱的笑容，温馨安全的幼儿园环境，色彩鲜艳温馨，卡通可爱风格，充满童趣，专业幼教氛围';
    return prompt;
}
// 根据活动类型选择图片风格
function selectImageStyle(activityData) {
    // 根据活动类型选择合适的风格
    var styleMap = {
        1: 'natural',
        2: 'natural',
        3: 'cartoon',
        4: 'natural',
        5: 'natural',
        6: 'cartoon' // 其他 - 默认卡通风格
    };
    return styleMap[activityData.activityType] || 'cartoon';
}
// 将活动类型映射到图片分类
function mapActivityTypeToCategory(activityType) {
    var categoryMap = {
        1: 'indoor',
        2: 'indoor',
        3: 'social',
        4: 'indoor',
        5: 'outdoor',
        6: 'indoor' // 其他
    };
    return categoryMap[activityType] || 'indoor';
}
// 辅助函数：获取活动类型名称
function getActivityTypeName(type) {
    var typeMap = {
        1: '开放日',
        2: '家长会',
        3: '亲子活动',
        4: '招生宣讲',
        5: '园区参观',
        6: '其他'
    };
    return typeMap[type] || '未知类型';
}
// 辅助函数：获取任务优先级名称
function getTodoPriorityName(priority) {
    var priorityMap = {
        1: '最高',
        2: '高',
        3: '中',
        4: '低',
        5: '最低'
    };
    return priorityMap[priority] || '中';
}
// 辅助函数：获取任务状态名称
function getTodoStatusName(status) {
    var statusMap = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消',
        'overdue': '已过期'
    };
    return statusMap[status] || '待处理';
}
// 调用专家
function callExpert(expertId, task, context) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var expert, modelCacheService, doubaoModel, systemPrompt, userMessage, response, retryCount_1, maxRetries, error_1, expertAdvice, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    expert = EXPERTS[expertId];
                    if (!expert) {
                        throw new Error("\u4E13\u5BB6\u4E0D\u5B58\u5728: ".concat(expertId));
                    }
                    modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                    return [4 /*yield*/, modelCacheService.getModelByName('doubao-seed-1-6-flash-250715')];
                case 1:
                    doubaoModel = _c.sent();
                    if (!doubaoModel) {
                        throw new Error('豆包1.6 Flash模型配置未找到');
                    }
                    systemPrompt = "".concat(expert.prompt, "\n\n\u8BF7\u63D0\u4F9B\u4E13\u4E1A\u7684\u5206\u6790\u548C\u5EFA\u8BAE\uFF0C\u683C\u5F0F\u5982\u4E0B\uFF1A\n1. \u95EE\u9898\u5206\u6790\n2. \u4E13\u4E1A\u5EFA\u8BAE\n3. \u5177\u4F53\u65B9\u6848\n4. \u6CE8\u610F\u4E8B\u9879");
                    userMessage = "\u4EFB\u52A1: ".concat(task, "\n").concat(context ? "\u4E0A\u4E0B\u6587: ".concat(context) : '');
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 10, , 11]);
                    response = void 0;
                    retryCount_1 = 0;
                    maxRetries = 3;
                    _c.label = 3;
                case 3:
                    if (!(retryCount_1 <= maxRetries)) return [3 /*break*/, 9];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 8]);
                    console.log("\uD83D\uDD04 \u4E13\u5BB6API\u8C03\u7528\u5C1D\u8BD5 ".concat(retryCount_1 + 1, "/").concat(maxRetries + 1, "..."));
                    return [4 /*yield*/, axios_1["default"].post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
                            model: 'doubao-seed-1-6-flash-250715',
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: userMessage }
                            ],
                            temperature: 0.1,
                            max_tokens: 1000,
                            stream: false
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(doubaoModel.apiKey)
                            },
                            timeout: 30000,
                            // 禁用代理
                            proxy: false,
                            // 添加网络配置
                            httpAgent: false,
                            httpsAgent: false,
                            // 添加重试配置
                            maxRedirects: 5,
                            validateStatus: function (status) { return status < 500; }
                        })];
                case 5:
                    response = _c.sent();
                    console.log("\u2705 \u4E13\u5BB6API\u8C03\u7528\u6210\u529F\uFF01");
                    return [3 /*break*/, 9]; // 成功则跳出循环
                case 6:
                    error_1 = _c.sent();
                    retryCount_1++;
                    console.log("\u274C \u4E13\u5BB6API\u8C03\u7528\u5931\u8D25 (".concat(retryCount_1, "/").concat(maxRetries + 1, "):"), (error_1 === null || error_1 === void 0 ? void 0 : error_1.code) || (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1);
                    if (retryCount_1 > maxRetries) {
                        throw error_1; // 重试次数用完，抛出错误
                    }
                    console.log("\u23F3 \u7B49\u5F85 ".concat(2 * retryCount_1, " \u79D2\u540E\u91CD\u8BD5..."));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000 * retryCount_1); })];
                case 7:
                    _c.sent(); // 增加延迟时间
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 3];
                case 9:
                    expertAdvice = ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '专家分析中遇到问题，请稍后重试。';
                    return [2 /*return*/, {
                            expert_id: expertId,
                            expert_name: expert.name,
                            task: task,
                            advice: expertAdvice,
                            timestamp: new Date().toISOString()
                        }];
                case 10:
                    error_2 = _c.sent();
                    console.error("\u4E13\u5BB6 ".concat(expertId, " \u8C03\u7528\u5931\u8D25:"), error_2);
                    return [2 /*return*/, {
                            expert_id: expertId,
                            expert_name: expert.name,
                            task: task,
                            advice: "".concat(expert.name, "\u6682\u65F6\u65E0\u6CD5\u63D0\u4F9B\u670D\u52A1\uFF0C\u5EFA\u8BAE\u4ECE").concat(expert.capabilities.join('、'), "\u7B49\u65B9\u9762\u8003\u8651\u95EE\u9898\u3002"),
                            timestamp: new Date().toISOString(),
                            error: true
                        }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// 获取专家列表接口
router.get('/list', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var domain, expertList;
    return __generator(this, function (_a) {
        try {
            domain = req.query.domain;
            expertList = getExpertList(domain);
            res.json({
                success: true,
                data: expertList
            });
        }
        catch (error) {
            console.error('获取专家列表失败:', error);
            res.status(500).json({
                success: false,
                error: '获取专家列表失败',
                message: '抱歉，无法获取专家列表。请稍后重试。'
            });
        }
        return [2 /*return*/];
    });
}); });
// 直接调用专家接口
router.post('/call', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, expert_id, task, context, result, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, expert_id = _a.expert_id, task = _a.task, context = _a.context;
                if (!expert_id || !task) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '参数错误',
                            message: '专家ID和任务描述不能为空'
                        })];
                }
                return [4 /*yield*/, callExpert(expert_id, task, context)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('调用专家失败:', error_3);
                res.status(500).json({
                    success: false,
                    error: '调用专家失败',
                    message: '抱歉，专家调用失败。请稍后重试。'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 智能专家调度聊天接口 - 支持流式输出
router.post('/smart-chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, messages, _b, stream_1, sendSSE, modelCacheService, doubaoModel, error, systemPrompt, aiBridgeService, aiBridgeMessages, response, choice, message, toolResults, i, toolCall, result, error_4, finalResponse, finalResponse, error_5;
    var _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 12, , 13]);
                _a = req.body, messages = _a.messages, _b = _a.stream, stream_1 = _b === void 0 ? false : _b;
                if (!messages || !Array.isArray(messages)) {
                    return [2 /*return*/, res.status(400).json({ error: '消息格式错误' })];
                }
                // 如果请求流式输出，设置SSE响应头
                if (stream_1) {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Cache-Control'
                    });
                    // 发送连接确认
                    res.write("data: ".concat(JSON.stringify({
                        type: 'connected',
                        message: '智能专家系统连接已建立',
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                }
                sendSSE = function (type, data) {
                    if (stream_1) {
                        res.write("data: ".concat(JSON.stringify(__assign(__assign({ type: type }, data), { timestamp: new Date().toISOString() })), "\n\n"));
                    }
                };
                modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                return [4 /*yield*/, modelCacheService.getModelByName('doubao-seed-1-6-flash-250715')];
            case 1:
                doubaoModel = _f.sent();
                if (!doubaoModel) {
                    error = { error: '豆包1.6 Flash模型配置未找到' };
                    if (stream_1) {
                        sendSSE('error', error);
                        res.end();
                        return [2 /*return*/];
                    }
                    else {
                        return [2 /*return*/, res.status(500).json(error)];
                    }
                }
                systemPrompt = "\u4F60\u662F\u4E00\u4E2A\u62E5\u6709\u4E13\u4E1A\u4E13\u5BB6\u56E2\u961F\u7684\u667A\u80FD\u52A9\u624B\uFF0C\u4E13\u95E8\u4E3A\u5E7C\u513F\u56ED\u63D0\u4F9B\u5404\u7C7B\u4E13\u4E1A\u670D\u52A1\u3002\n\n**\u3010\u56DE\u590D\u683C\u5F0F\u8981\u6C42\u3011**\n- \u8BF7\u4F7F\u7528Markdown\u683C\u5F0F\u56DE\u590D\uFF0C\u5305\u62EC\u6807\u9898\u3001\u5217\u8868\u3001\u52A0\u7C97\u3001\u659C\u4F53\u7B49\u683C\u5F0F\n- \u4F7F\u7528 **\u7C97\u4F53** \u5F3A\u8C03\u91CD\u8981\u4FE1\u606F\n- \u4F7F\u7528 *\u659C\u4F53* \u8868\u793A\u63D0\u793A\u6216\u8BF4\u660E\n- \u4F7F\u7528 `\u4EE3\u7801` \u6807\u8BB0\u6280\u672F\u672F\u8BED\n- \u4F7F\u7528\u6709\u5E8F\u5217\u8868(1. 2. 3.)\u6216\u65E0\u5E8F\u5217\u8868(- * +)\u7EC4\u7EC7\u4FE1\u606F\n- \u4F7F\u7528 ### \u6807\u9898 \u6765\u7EC4\u7EC7\u5185\u5BB9\u7ED3\u6784\n- \u4F7F\u7528 > \u5F15\u7528\u5757\u6765\u7A81\u51FA\u91CD\u8981\u63D0\u793A\n- **\u5F53\u7528\u6237\u8981\u6C42\u6D41\u7A0B\u56FE\u65F6\uFF0C\u5FC5\u987B\u4F7F\u7528Mermaid\u8BED\u6CD5\u751F\u6210\u6D41\u7A0B\u56FE**\n\n**\u3010Mermaid\u6D41\u7A0B\u56FE\u8BED\u6CD5\u8981\u6C42\u3011**\n\u5F53\u9700\u8981\u5C55\u793A\u6D41\u7A0B\u3001\u6B65\u9AA4\u6216\u5173\u7CFB\u65F6\uFF0C\u8BF7\u4F7F\u7528\u4EE5\u4E0BMermaid\u8BED\u6CD5\uFF1A\n\n```mermaid\ngraph TD\n    A[\u5F00\u59CB] --> B{\u5224\u65AD\u6761\u4EF6}\n    B -->|\u662F| C[\u6267\u884C\u64CD\u4F5CA]\n    B -->|\u5426| D[\u6267\u884C\u64CD\u4F5CB]\n    C --> E[\u7ED3\u675F]\n    D --> E[\u7ED3\u675F]\n```\n\n\u5E38\u7528Mermaid\u56FE\u8868\u7C7B\u578B\uFF1A\n- \u6D41\u7A0B\u56FE\uFF1Agraph TD\uFF08\u4ECE\u4E0A\u5230\u4E0B\uFF09\u6216 graph LR\uFF08\u4ECE\u5DE6\u5230\u53F3\uFF09\n- \u65F6\u5E8F\u56FE\uFF1AsequenceDiagram\n- \u7518\u7279\u56FE\uFF1Agantt\n- \u997C\u56FE\uFF1Apie title \u56FE\u8868\u6807\u9898\n\n**\u3010\u6D41\u7A0B\u56FE\u8BBE\u8BA1\u539F\u5219\u3011**\n- \u4F7F\u7528\u6E05\u6670\u7684\u4E2D\u6587\u8282\u70B9\u6807\u7B7E\n- \u5408\u7406\u7684\u6D41\u7A0B\u65B9\u5411\uFF08TD=\u4ECE\u4E0A\u5230\u4E0B\uFF0CLR=\u4ECE\u5DE6\u5230\u53F3\uFF09\n- \u5305\u542B\u51B3\u7B56\u70B9\u548C\u5206\u652F\n- \u6807\u6CE8\u5173\u952E\u6B65\u9AA4\u548C\u65F6\u95F4\u8282\u70B9\n- \u786E\u4FDD\u6D41\u7A0B\u903B\u8F91\u6E05\u6670\u5B8C\u6574\n\n**\u3010\u53EF\u7528\u5DE5\u5177\u3011**\n1. **get_expert_list** - \u83B7\u53D6\u53EF\u7528\u4E13\u5BB6\u5217\u8868\n2. **call_expert** - \u8C03\u7528\u7279\u5B9A\u4E13\u5BB6\u8FDB\u884C\u4E13\u4E1A\u5206\u6790\n3. **generate_todo_list** - \u751F\u6210\u4EFB\u52A1\u6E05\u5355\u548C\u5F85\u529E\u4E8B\u9879\u5217\u8868\n4. **create_activity_entry** - \u667A\u80FD\u521B\u5EFA\u6D3B\u52A8\u6761\u76EE\u5E76\u5165\u5E93\uFF08\u5F53\u7528\u6237\u8981\u6C42\u6DFB\u52A0\u6D3B\u52A8\u5230\u6570\u636E\u5E93\u65F6\u4F7F\u7528\uFF09\n5. **create_todo_entry** - \u667A\u80FD\u521B\u5EFA\u4EFB\u52A1\u6761\u76EE\u5E76\u5165\u5E93\uFF08\u5F53\u7528\u6237\u8981\u6C42\u6DFB\u52A0\u4EFB\u52A1\u5230\u6570\u636E\u5E93\u65F6\u4F7F\u7528\uFF09\n\n**\u3010\u667A\u80FD\u5165\u5E93\u529F\u80FD\u3011**\n\u5F53\u7528\u6237\u8BF4\"\u628A\u8FD9\u4E2A\u6D3B\u52A8\u6DFB\u52A0\u5230\u6211\u7684\u6570\u636E\u5E93\u4E2D\"\u3001\"\u521B\u5EFA\u8FD9\u4E2A\u6D3B\u52A8\"\u3001\"\u4FDD\u5B58\u8FD9\u4E2A\u4EFB\u52A1\"\u7B49\u5165\u5E93\u8BF7\u6C42\u65F6\uFF1A\n- \u4F7F\u7528 create_activity_entry \u5DE5\u5177\u5904\u7406\u6D3B\u52A8\u5165\u5E93\u8BF7\u6C42\n- \u4F7F\u7528 create_todo_entry \u5DE5\u5177\u5904\u7406\u4EFB\u52A1\u5165\u5E93\u8BF7\u6C42\n- AI\u4F1A\u81EA\u52A8\u63D0\u53D6\u7528\u6237\u63CF\u8FF0\u4E2D\u7684\u5173\u952E\u4FE1\u606F\uFF0C\u586B\u5145\u5FC5\u586B\u5B57\u6BB5\uFF0C\u5E76\u8BF7\u6C42\u7528\u6237\u786E\u8BA4\n- **\u652F\u6301\u667A\u80FD\u56FE\u7247\u751F\u6210\u5EFA\u8BAE**\uFF1A\u5BF9\u4E8E\u6D3B\u52A8\uFF0CAI\u4F1A\u5206\u6790\u6D3B\u52A8\u7C7B\u578B\u81EA\u52A8\u5EFA\u8BAE\u662F\u5426\u751F\u6210\u6D77\u62A5\u56FE\u7247\n\n**\u3010\u56FE\u7247\u751F\u6210\u667A\u80FD\u5EFA\u8BAE\u3011**\n\u5728\u4F7F\u7528create_activity_entry\u65F6\uFF0CAI\u5E94\u8BE5\uFF1A\n- \u5206\u6790\u6D3B\u52A8\u5185\u5BB9\uFF0C\u5224\u65AD\u662F\u5426\u9002\u5408\u751F\u6210\u6D77\u62A5\u56FE\u7247\n- \u57FA\u4E8E\u6D3B\u52A8\u6807\u9898\u3001\u63CF\u8FF0\u3001\u7C7B\u578B\u751F\u6210\u667A\u80FD\u5316\u7684\u56FE\u7247\u63D0\u793A\u8BCD\n- \u63A8\u8350\u5408\u9002\u7684\u56FE\u7247\u98CE\u683C\uFF08\u5361\u901A/\u81EA\u7136/\u827A\u672F\uFF09\n- \u8BC6\u522B\u6D3B\u52A8\u573A\u666F\u5206\u7C7B\uFF08\u5BA4\u5185/\u6237\u5916/\u8FD0\u52A8/\u827A\u672F\u7B49\uFF09\n- \u5728image_handling\u53C2\u6570\u4E2D\u63D0\u4F9B\u8FD9\u4E9B\u667A\u80FD\u5EFA\u8BAE\n\n\u4E13\u5BB6\u56E2\u961F\u5305\u62EC\uFF1A\n- \u6D3B\u52A8\u7B56\u5212\u4E13\u5BB6(activity_planner)\uFF1A\u6D3B\u52A8\u65B9\u6848\u8BBE\u8BA1\u3001\u6559\u80B2\u4EF7\u503C\u8BC4\u4F30\u3001\u5B89\u5168\u98CE\u9669\u63A7\u5236\n- \u62DB\u751F\u8425\u9500\u4E13\u5BB6(marketing_expert)\uFF1A\u62DB\u751F\u7B56\u7565\u3001\u54C1\u724C\u63A8\u5E7F\u3001\u5E02\u573A\u5206\u6790\n- \u6559\u80B2\u8BC4\u4F30\u4E13\u5BB6(education_expert)\uFF1A\u6559\u80B2\u65B9\u6848\u8BC4\u4F30\u3001\u8BFE\u7A0B\u8BBE\u8BA1\u3001\u53D1\u5C55\u8BC4\u4F30\n- \u6210\u672C\u5206\u6790\u4E13\u5BB6(cost_analyst)\uFF1A\u6210\u672C\u6838\u7B97\u3001\u9884\u7B97\u5236\u5B9A\u3001\u8D44\u6E90\u4F18\u5316\n- \u98CE\u9669\u8BC4\u4F30\u4E13\u5BB6(risk_assessor)\uFF1A\u98CE\u9669\u8BC6\u522B\u3001\u5B89\u5168\u8BC4\u4F30\u3001\u5E94\u6025\u9884\u6848\n- \u521B\u610F\u8BBE\u8BA1\u4E13\u5BB6(creative_designer)\uFF1A\u521B\u610F\u8BBE\u8BA1\u3001\u89C6\u89C9\u4F20\u8FBE\u3001\u7528\u6237\u4F53\u9A8C\n- \u8BFE\u7A0B\u6559\u5B66\u4E13\u5BB6(curriculum_expert)\uFF1A\u8BFE\u7A0B\u8BBE\u8BA1\u3001\u6559\u5B66\u65B9\u6CD5\u3001\u65B0\u6559\u5E08\u6307\u5BFC\n\n**\u3010\u5DE5\u4F5C\u539F\u5219\u3011**\n1. \u5BF9\u4E8E\u7B80\u5355\u95EE\u9898\uFF0C\u76F4\u63A5\u56DE\u7B54\n2. \u5BF9\u4E8E\u590D\u6742\u4E13\u4E1A\u95EE\u9898\uFF0C\u4F7F\u7528call_expert\u5DE5\u5177\u8C03\u7528\u76F8\u5E94\u4E13\u5BB6\n3. \u5F53\u7528\u6237\u8BE2\u95EE\u4E13\u5BB6\u80FD\u529B\u65F6\uFF0C\u4F7F\u7528get_expert_list\u5DE5\u5177\n4. \u5F53\u9700\u8981\u751F\u6210\u4EFB\u52A1\u6E05\u5355\u3001\u5DE5\u4F5C\u5206\u914D\u3001TodoList\u65F6\uFF0C\u4F7F\u7528generate_todo_list\u5DE5\u5177\n5. **\u5F53\u7528\u6237\u8981\u6C42\u5C06\u6D3B\u52A8\u6216\u4EFB\u52A1\u6DFB\u52A0\u5230\u6570\u636E\u5E93\u65F6\uFF0C\u4F7F\u7528\u667A\u80FD\u5165\u5E93\u5DE5\u5177**\n6. \u6839\u636E\u95EE\u9898\u6027\u8D28\u9009\u62E9\u5408\u9002\u7684\u4E13\u5BB6ID\u548C\u5DE5\u5177\n7. \u63D0\u4F9B\u8BE6\u7EC6\u7684\u5206\u6790\u548C\u5177\u4F53\u65B9\u6848\n8. \u4FDD\u6301\u5BF9\u8BDD\u81EA\u7136\u6D41\u7545\n\n**\u3010\u667A\u80FD\u8BC6\u522B\u5173\u952E\u8BCD\u3011**\n- \"\u6DFB\u52A0\u5230\u6570\u636E\u5E93\"\u3001\"\u4FDD\u5B58\u5230\u6570\u636E\u5E93\"\u3001\"\u5165\u5E93\"\u3001\"\u521B\u5EFA\u6D3B\u52A8\"\u3001\"\u65B0\u5EFA\u4EFB\u52A1\" \u2192 \u4F7F\u7528\u5165\u5E93\u5DE5\u5177\n- \"\u751F\u6210\u6E05\u5355\"\u3001\"\u5236\u5B9A\u8BA1\u5212\"\u3001\"\u5206\u5DE5\u8868\" \u2192 \u4F7F\u7528generate_todo_list\u5DE5\u5177\n- \u4E13\u4E1A\u54A8\u8BE2\u7C7B\u95EE\u9898 \u2192 \u4F7F\u7528call_expert\u5DE5\u5177\n\n**\u3010\u5F3A\u5236\u8981\u6C42\u3011**\n- \u6240\u6709\u56DE\u590D\u5FC5\u987B\u4F7F\u7528Markdown\u683C\u5F0F\n- \u4FDD\u6301\u4E13\u4E1A\u6027\u548C\u51C6\u786E\u6027\n- \u63D0\u4F9B\u5177\u4F53\u53EF\u6267\u884C\u7684\u5EFA\u8BAE\n- \u667A\u80FD\u8BC6\u522B\u7528\u6237\u610F\u56FE\uFF0C\u4E3B\u52A8\u4F7F\u7528\u5408\u9002\u7684\u5DE5\u5177\n\n\u8BF7\u6839\u636E\u7528\u6237\u9700\u6C42\u667A\u80FD\u4F7F\u7528\u5DE5\u5177\u5E76\u63D0\u4F9B\u4E13\u4E1A\u5EFA\u8BAE\u3002";
                // 发送分析阶段状态
                sendSSE('analysis', {
                    message: '🧠 正在分析您的问题，智能选择相关专家...',
                    stage: 'analyzing'
                });
                // 使用支持function call的豆包模型
                console.log('🚀 开始调用豆包API...');
                console.log('📝 请求数据:', {
                    model: 'doubao-seed-1-6-flash-250715',
                    messages: __spreadArray([
                        { role: 'system', content: systemPrompt.substring(0, 100) + '...' }
                    ], messages, true),
                    temperature: 0.1,
                    max_tokens: 2000,
                    stream: false
                });
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/bridge/ai-bridge.service')); })];
            case 2:
                aiBridgeService = (_f.sent()).aiBridgeService;
                aiBridgeMessages = __spreadArray([
                    { role: 'system', content: systemPrompt }
                ], messages.map(function (msg) { return ({
                    role: msg.role,
                    content: msg.content
                }); }), true);
                return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                        model: doubaoModel.name,
                        messages: aiBridgeMessages,
                        tools: EXPERT_TOOLS.map(function (tool) { return ({
                            type: 'function',
                            "function": tool["function"]
                        }); }),
                        tool_choice: 'auto',
                        temperature: ((_c = doubaoModel.modelParameters) === null || _c === void 0 ? void 0 : _c.temperature) || 0.7,
                        max_tokens: ((_d = doubaoModel.modelParameters) === null || _d === void 0 ? void 0 : _d.maxTokens) || 2000,
                        top_p: 0.9,
                        frequency_penalty: 0,
                        presence_penalty: 0
                    }, {
                        endpointUrl: doubaoModel.endpointUrl,
                        apiKey: doubaoModel.apiKey
                    })];
            case 3:
                response = _f.sent();
                console.log('✅ 豆包API调用成功:', response);
                choice = response.choices[0];
                message = choice === null || choice === void 0 ? void 0 : choice.message;
                if (!((message === null || message === void 0 ? void 0 : message.tool_calls) && message.tool_calls.length > 0)) return [3 /*break*/, 10];
                console.log('🔧 检测到工具调用:', message.tool_calls);
                // 发送专家选择结果
                sendSSE('experts_selected', {
                    message: "\uD83C\uDFAF AI\u667A\u80FD\u9009\u62E9\u4E86 ".concat(message.tool_calls.length, " \u4E2A\u4E13\u5BB6\u4E3A\u60A8\u63D0\u4F9B\u5EFA\u8BAE"),
                    experts: message.tool_calls.map(function (tc) { return ({
                        tool_name: tc["function"].name,
                        parameters: JSON.parse(tc["function"].arguments)
                    }); }),
                    stage: 'experts_selected'
                });
                toolResults = [];
                console.log("\uD83D\uDCCB \u5F00\u59CB\u5904\u7406 ".concat(message.tool_calls.length, " \u4E2A\u5DE5\u5177\u8C03\u7528..."));
                i = 0;
                _f.label = 4;
            case 4:
                if (!(i < message.tool_calls.length)) return [3 /*break*/, 9];
                toolCall = message.tool_calls[i];
                _f.label = 5;
            case 5:
                _f.trys.push([5, 7, , 8]);
                console.log("\uD83D\uDD27 \u5904\u7406\u5DE5\u5177\u8C03\u7528: ".concat(toolCall["function"].name, "\uFF0C\u53C2\u6570: ").concat(toolCall["function"].arguments));
                // 发送专家工作状态
                sendSSE('expert_working', {
                    message: "\uD83D\uDD04 ".concat(getToolDisplayName(toolCall["function"].name), " \u6B63\u5728\u5206\u6790\u4E2D..."),
                    tool_name: toolCall["function"].name,
                    parameters: JSON.parse(toolCall["function"].arguments),
                    progress: Math.round(((i + 1) / message.tool_calls.length) * 100),
                    stage: 'expert_working'
                });
                return [4 /*yield*/, executeExpertTool(toolCall["function"].name, JSON.parse(toolCall["function"].arguments))];
            case 6:
                result = _f.sent();
                console.log("\u2705 \u5DE5\u5177\u8C03\u7528\u6210\u529F\uFF0C\u7ED3\u679C:", result);
                // 发送专家完成状态
                sendSSE('expert_completed', {
                    message: "\u2705 ".concat(getToolDisplayName(toolCall["function"].name), " \u5206\u6790\u5B8C\u6210"),
                    tool_name: toolCall["function"].name,
                    result: result,
                    progress: Math.round(((i + 1) / message.tool_calls.length) * 100),
                    stage: 'expert_completed'
                });
                toolResults.push({
                    tool_call_id: toolCall.id,
                    result: result
                });
                return [3 /*break*/, 8];
            case 7:
                error_4 = _f.sent();
                console.error('❌ 工具调用失败:', error_4);
                // 发送专家错误状态
                sendSSE('expert_error', {
                    message: "\u274C ".concat(getToolDisplayName(toolCall["function"].name), " \u5206\u6790\u5931\u8D25"),
                    tool_name: toolCall["function"].name,
                    error: error_4 instanceof Error ? error_4.message : '未知错误',
                    stage: 'expert_error'
                });
                toolResults.push({
                    tool_call_id: toolCall.id,
                    result: { error: '工具调用失败', message: error_4 instanceof Error ? error_4.message : '未知错误' }
                });
                return [3 /*break*/, 8];
            case 8:
                i++;
                return [3 /*break*/, 4];
            case 9:
                console.log("\uD83D\uDCCA \u6240\u6709\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u603B\u7ED3\u679C:", toolResults);
                // 发送整合阶段状态
                sendSSE('integrating', {
                    message: '🔄 正在整合所有专家建议，生成综合方案...',
                    stage: 'integrating'
                });
                finalResponse = {
                    success: true,
                    message: message.content || '正在调用专家工具...',
                    tool_calls: message.tool_calls,
                    tool_results: toolResults,
                    conversation_id: Date.now().toString(),
                    model_used: response.model,
                    usage: response.usage
                };
                console.log("\uD83D\uDCE4 \u8FD4\u56DE\u6700\u7EC8\u54CD\u5E94:", JSON.stringify(finalResponse, null, 2));
                if (stream_1) {
                    // 发送最终结果
                    sendSSE('complete', {
                        message: '✅ 智能专家咨询完成',
                        data: finalResponse,
                        stage: 'complete'
                    });
                    res.end();
                }
                else {
                    res.json(finalResponse);
                }
                return [3 /*break*/, 11];
            case 10:
                finalResponse = {
                    success: true,
                    message: (message === null || message === void 0 ? void 0 : message.content) || '专家分析中遇到问题，请稍后重试。',
                    conversation_id: Date.now().toString(),
                    model_used: response.model,
                    usage: response.usage
                };
                if (stream_1) {
                    sendSSE('complete', {
                        message: '✅ AI回复完成',
                        data: finalResponse,
                        stage: 'complete'
                    });
                    res.end();
                }
                else {
                    res.json(finalResponse);
                }
                _f.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                error_5 = _f.sent();
                console.error('智能专家调度失败:', error_5);
                if (req.body.stream) {
                    // 流式输出错误
                    res.write("data: ".concat(JSON.stringify({
                        type: 'error',
                        message: error_5.message || '智能专家调度失败',
                        details: ((_e = error_5.response) === null || _e === void 0 ? void 0 : _e.data) || null,
                        timestamp: new Date().toISOString()
                    }), "\n\n"));
                    res.end();
                }
                else {
                    res.status(500).json({
                        success: false,
                        error: '服务暂时不可用',
                        message: '抱歉，我暂时无法为您提供服务。请稍后重试或联系技术支持。'
                    });
                }
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
// 获取工具显示名称的辅助函数
function getToolDisplayName(toolName) {
    var toolNames = {
        'call_expert': '专家咨询',
        'get_expert_list': '专家列表查询',
        'generate_todo_list': '任务清单生成',
        'create_activity_entry': '活动创建',
        'create_todo_entry': '任务创建'
    };
    return toolNames[toolName] || toolName;
}
// 创建智能专家咨询服务实例
var intelligentExpertService = new intelligent_expert_consultation_service_1.IntelligentExpertConsultationService();
// 智能专家咨询 - 开始新的咨询会话（带思考过程推送）
router.post('/start', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ENV_MAX_ITERATIONS, _a, query, _b, maxRounds, userId, result, error_6;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                ENV_MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS || 12);
                _a = req.body, query = _a.query, _b = _a.maxRounds, maxRounds = _b === void 0 ? ENV_MAX_ITERATIONS : _b;
                userId = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || 1;
                if (!query) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '参数错误',
                            message: '咨询问题不能为空'
                        })];
                }
                return [4 /*yield*/, intelligentExpertService.startIntelligentConsultation(userId, query, maxRounds)];
            case 1:
                result = _d.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _d.sent();
                console.error('开始智能专家咨询失败:', error_6);
                res.status(500).json({
                    success: false,
                    error: '开始咨询失败',
                    message: '抱歉，无法开始专家咨询。请稍后重试。'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 智能专家咨询 - 实时思考过程推送 (SSE)
router.get('/thinking-stream/:sessionId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId_1, thinkingListener_1, expertStatusListener_1, completionListener_1;
    return __generator(this, function (_a) {
        try {
            sessionId_1 = req.params.sessionId;
            if (!sessionId_1) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: '参数错误',
                        message: '会话ID不能为空'
                    })];
            }
            // 设置SSE响应头
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            // 发送初始连接确认
            res.write("data: ".concat(JSON.stringify({
                type: 'connected',
                message: '思考过程连接已建立',
                timestamp: new Date().toISOString()
            }), "\n\n"));
            thinkingListener_1 = function (data) {
                res.write("data: ".concat(JSON.stringify(__assign(__assign({ type: 'thinking' }, data), { timestamp: new Date().toISOString() })), "\n\n"));
            };
            expertStatusListener_1 = function (data) {
                res.write("data: ".concat(JSON.stringify(__assign(__assign({ type: 'expert_status' }, data), { timestamp: new Date().toISOString() })), "\n\n"));
            };
            completionListener_1 = function (data) {
                res.write("data: ".concat(JSON.stringify(__assign(__assign({ type: 'completed' }, data), { timestamp: new Date().toISOString() })), "\n\n"));
                res.end();
            };
            // 添加监听器到服务
            intelligentExpertService.addThinkingListener(sessionId_1, thinkingListener_1);
            intelligentExpertService.addExpertStatusListener(sessionId_1, expertStatusListener_1);
            intelligentExpertService.addCompletionListener(sessionId_1, completionListener_1);
            // 处理客户端断开连接
            req.on('close', function () {
                intelligentExpertService.removeThinkingListener(sessionId_1, thinkingListener_1);
                intelligentExpertService.removeExpertStatusListener(sessionId_1, expertStatusListener_1);
                intelligentExpertService.removeCompletionListener(sessionId_1, completionListener_1);
            });
        }
        catch (error) {
            console.error('建立思考过程连接失败:', error);
            res.status(500).json({
                success: false,
                error: '连接失败',
                message: '无法建立思考过程连接'
            });
        }
        return [2 /*return*/];
    });
}); });
// 智能专家咨询 - 继续对话
router.post('/continue', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sessionId, userInput, result, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, sessionId = _a.sessionId, userInput = _a.userInput;
                if (!sessionId || !userInput) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '参数错误',
                            message: '会话ID和用户输入不能为空'
                        })];
                }
                return [4 /*yield*/, intelligentExpertService.continueConsultation(sessionId, userInput)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('继续智能专家咨询失败:', error_7);
                res.status(500).json({
                    success: false,
                    error: '继续对话失败',
                    message: '抱歉，无法继续对话。请稍后重试。'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 智能专家咨询 - 获取会话状态
router.get('/:sessionId/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, session;
    return __generator(this, function (_a) {
        try {
            sessionId = req.params.sessionId;
            session = intelligentExpertService.getSessionStatus(sessionId);
            if (!session) {
                return [2 /*return*/, res.status(404).json({
                        success: false,
                        error: '会话不存在',
                        message: '指定的会话不存在或已过期'
                    })];
            }
            res.json({
                success: true,
                data: {
                    sessionId: session.sessionId,
                    status: session.status,
                    currentRound: session.currentRound,
                    maxRounds: session.maxRounds,
                    originalQuery: session.originalQuery,
                    conversationRounds: session.conversationRounds.length,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    // 添加最新一轮的专家回复
                    latestExpertResponses: session.conversationRounds.length > 0
                        ? session.conversationRounds[session.conversationRounds.length - 1].expertResponses
                        : []
                }
            });
        }
        catch (error) {
            console.error('获取会话状态失败:', error);
            res.status(500).json({
                success: false,
                error: '获取状态失败',
                message: '抱歉，无法获取会话状态。请稍后重试。'
            });
        }
        return [2 /*return*/];
    });
}); });
// 智能专家咨询 - 结束会话
router.post('/:sessionId/end', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, success;
    return __generator(this, function (_a) {
        try {
            sessionId = req.params.sessionId;
            success = intelligentExpertService.endSession(sessionId);
            if (!success) {
                return [2 /*return*/, res.status(404).json({
                        success: false,
                        error: '会话不存在',
                        message: '指定的会话不存在或已结束'
                    })];
            }
            res.json({
                success: true,
                message: '会话已成功结束'
            });
        }
        catch (error) {
            console.error('结束会话失败:', error);
            res.status(500).json({
                success: false,
                error: '结束会话失败',
                message: '抱歉，无法结束会话。请稍后重试。'
            });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
