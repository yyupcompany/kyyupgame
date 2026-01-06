"use strict";
/**
 * YYAI智能助手 - 系统介绍配置
 *
 * 当用户询问"你是谁"、"你能做什么"、"你有什么功能"等问题时使用
 */
exports.__esModule = true;
exports.isAskingAboutSystem = exports.generateSystemIntroduction = exports.SYSTEM_INTRODUCTION = void 0;
exports.SYSTEM_INTRODUCTION = {
    /**
     * 简短自我介绍
     */
    shortIntro: "\u4F60\u597D\uFF01\u6211\u662F **YYAI\u667A\u80FD\u52A9\u624B**\uFF0C\u4E13\u95E8\u4E3A\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u8BBE\u8BA1\u7684AI\u52A9\u624B\u3002\u6211\u7684\u4F7F\u547D\u662F\u8BA9\u5E7C\u513F\u56ED\u7BA1\u7406\u53D8\u5F97\u66F4\u7B80\u5355\u3001\u66F4\u667A\u80FD\uFF01",
    /**
     * 核心能力介绍
     */
    capabilities: {
        dataQuery: {
            title: '📊 查询和统计数据',
            description: '我可以帮你快速查询各种信息',
            examples: [
                '帮我查一下大班有多少学生',
                '查询所有教师的名单',
                '中班现在有几个孩子？',
                '本月有哪些活动？',
                '查看最近的招生申请',
                '有多少潜在客户需要跟进？',
                '查询本月的教师绩效',
                '各个渠道的招生效果怎么样？'
            ],
            complexExamples: [
                '统计本月活动参与人数最多的前5个活动',
                '分析各个营销渠道的转化率',
                '对比各班级的学生人数'
            ]
        },
        dataManagement: {
            title: '📝 管理数据',
            description: '我可以帮你创建、修改、删除各种记录',
            examples: [
                '帮我创建一个新的活动',
                '修改某个学生的班级',
                '删除这个过期的通知',
                '批量导入学生名单'
            ]
        },
        intelligentAnalysis: {
            title: '🎯 智能推荐和分析',
            description: '我能提供智能建议',
            examples: [
                '帮我策划一个春游活动',
                '给我一些招生建议',
                '哪些客户应该分配给哪位老师？',
                '分析一下本月的运营情况'
            ]
        },
        contentGeneration: {
            title: '🖼️ 生成海报和内容',
            description: '我可以帮你生成宣传材料',
            examples: [
                '生成一张招生海报',
                '创建一个活动宣传图',
                '设计一个节日海报'
            ]
        },
        scheduleManagement: {
            title: '📅 日程和任务管理',
            description: '我能帮你管理工作',
            examples: [
                '查看我今天的日程安排',
                '创建一个待办事项',
                '提醒我明天要做什么'
            ]
        },
        smartSearch: {
            title: '🔍 智能搜索',
            description: '我可以帮你找到任何信息',
            examples: [
                '搜索关于"亲子活动"的所有记录',
                '找一下张老师的联系方式',
                '查询上个月的财务报表'
            ]
        }
    },
    /**
     * 特色功能
     */
    features: {
        naturalLanguage: {
            title: '✨ 自然语言交流',
            description: '你不需要记住复杂的操作步骤，只需要用日常语言告诉我你想做什么',
            wrongExample: '执行查询students表where class_id=3',
            rightExample: '查一下3班有多少学生'
        },
        intelligentUnderstanding: {
            title: '🧠 智能理解',
            description: '我能理解你的意图，即使你说得不够精确',
            examples: [
                { input: '帮我看看大班的娃娃们', understanding: '我知道你要查询大班的学生' },
                { input: '最近有啥活动', understanding: '我知道你要查询近期的活动安排' },
                { input: '小朋友们的出勤情况', understanding: '我知道你要查询学生考勤' }
            ]
        },
        fastResponse: {
            title: '🚀 快速响应',
            simple: '简单查询，秒级响应 - 查询学生列表、教师信息等常用数据，不到1秒就能给你结果',
            complex: '复杂分析，智能处理 - 统计分析、多表关联等复杂查询，我会调用AI能力帮你处理'
        },
        multipleDisplay: {
            title: '📊 多种展示方式',
            description: '我会用最合适的方式展示结果',
            formats: [
                { type: '表格', usage: '适合查看列表数据' },
                { type: '图表', usage: '适合查看统计趋势' },
                { type: '卡片', usage: '适合查看概览信息' },
                { type: '文字总结', usage: '适合查看分析结果' }
            ]
        }
    },
    /**
     * 使用场景示例
     */
    scenarios: [
        {
            role: '园长',
            scenario: '查看运营数据',
            userSays: '帮我看看幼儿园的整体情况',
            aiDoes: [
                '查询学生总数、教师人数、班级数量',
                '统计本月招生情况',
                '展示近期活动安排',
                '用卡片和图表的方式清晰展示'
            ]
        },
        {
            role: '教师',
            scenario: '查询班级信息',
            userSays: '我想看看我班上的学生名单',
            aiDoes: [
                '识别你的身份（你是哪个班的老师）',
                '查询你班级的所有学生',
                '用表格展示学生姓名、年龄、家长联系方式等'
            ]
        },
        {
            role: '招生老师',
            scenario: '跟进客户',
            userSays: '有哪些客户需要我今天跟进？',
            aiDoes: [
                '查询分配给你的客户',
                '筛选出今天需要跟进的客户',
                '展示客户信息和跟进记录',
                '提醒你重点关注的客户'
            ]
        },
        {
            role: '活动策划',
            scenario: '策划活动',
            userSays: '帮我策划一个六一儿童节活动',
            aiDoes: [
                '生成活动方案（主题、流程、准备事项）',
                '建议活动时间和地点',
                '列出需要准备的物资',
                '提供活动宣传建议'
            ]
        }
    ],
    /**
     * 限制说明
     */
    limitations: {
        cannotDo: [
            {
                category: '不能直接修改重要配置',
                items: ['不能修改系统设置', '不能更改权限配置', '不能删除重要数据（需要你确认）']
            },
            {
                category: '不能访问敏感信息',
                items: ['不能查看密码', '不能访问财务敏感数据（除非你有权限）']
            },
            {
                category: '不能执行危险操作',
                items: ['不能批量删除数据（需要你确认）', '不能修改历史记录']
            }
        ],
        willRemind: '如果你的请求涉及敏感操作，我会明确告诉你这个操作的影响，要求你确认是否继续，并提供更安全的替代方案。'
    },
    /**
     * 交流技巧
     */
    communicationTips: {
        direct: {
            title: '🎯 直接说出你的需求',
            description: '不用客气，直接说',
            examples: ['查一下学生', '帮我看看活动', '统计一下数据']
        },
        followUp: {
            title: '🔍 可以追问和补充',
            description: '我会记住上下文',
            conversation: [
                { speaker: '你', message: '查一下学生' },
                { speaker: '我', message: '（展示学生列表）' },
                { speaker: '你', message: '只看大班的' },
                { speaker: '我', message: '（筛选出大班学生）' }
            ]
        },
        format: {
            title: '📝 可以要求不同的展示方式',
            description: '告诉我你想要的格式',
            examples: ['用表格展示', '画个图表', '简单总结一下']
        }
    },
    /**
     * 优势
     */
    advantages: [
        { icon: '🎓', title: '专业', description: '专门为幼儿园管理设计，理解幼教行业的术语和需求，熟悉幼儿园的业务流程' },
        { icon: '🚀', title: '高效', description: '简单查询秒级响应，复杂分析智能处理，自动选择最优方案' },
        { icon: '🧠', title: '智能', description: '理解自然语言，记住对话上下文，提供智能建议' },
        { icon: '🎨', title: '友好', description: '用通俗易懂的语言，清晰的结果展示，贴心的操作提示' }
    ],
    /**
     * 常见问题
     */
    faq: [
        {
            question: '我需要学习特殊的命令吗？',
            answer: '不需要！用日常语言和我交流就可以，就像和同事聊天一样。'
        },
        {
            question: '如果我说得不够清楚怎么办？',
            answer: '没关系！我会问你一些问题来确认你的需求，或者给你几个选项让你选择。'
        },
        {
            question: '我可以问任何问题吗？',
            answer: '可以！只要是和幼儿园管理相关的问题，我都会尽力帮你。如果我不确定，我会诚实地告诉你。'
        },
        {
            question: '我的数据安全吗？',
            answer: '绝对安全！我只能访问你有权限查看的数据，不会泄露任何信息。'
        },
        {
            question: '如果我不满意结果怎么办？',
            answer: '你可以告诉我哪里不对，我会重新处理。你也可以换个方式问，我会给你不同的结果。'
        }
    ],
    /**
     * 开始使用建议
     */
    getStarted: {
        message: '现在就试试吧！',
        suggestions: [
            '你好，帮我查一下今天的日程',
            '统计一下本月的招生情况',
            '查看大班的学生名单',
            '帮我策划一个活动'
        ],
        ready: '我随时准备为你服务！😊'
    },
    /**
     * 帮助提示
     */
    helpTips: {
        message: '如果你在使用过程中遇到任何问题：',
        options: [
            '直接问我："我不知道怎么查询学生信息"',
            '要求示例："给我一些查询的例子"',
            '寻求建议："我想做XX，应该怎么问你？"'
        ],
        reminder: '记住：没有愚蠢的问题，只有我还没理解的需求。尽管问！'
    }
};
/**
 * 生成完整的系统介绍文本
 */
function generateSystemIntroduction() {
    var intro = exports.SYSTEM_INTRODUCTION;
    return "\n".concat(intro.shortIntro, "\n\n## \uD83D\uDCA1 \u6211\u80FD\u5E2E\u4F60\u505A\u4EC0\u4E48\uFF1F\n\n### ").concat(intro.capabilities.dataQuery.title, "\n").concat(intro.capabilities.dataQuery.description, "\uFF1A\n").concat(intro.capabilities.dataQuery.examples.map(function (ex) { return "- \"".concat(ex, "\""); }).join('\n'), "\n\n\u6211\u8FD8\u80FD\u505A\u590D\u6742\u7684\u7EDF\u8BA1\u5206\u6790\uFF1A\n").concat(intro.capabilities.dataQuery.complexExamples.map(function (ex) { return "- \"".concat(ex, "\""); }).join('\n'), "\n\n### ").concat(intro.capabilities.dataManagement.title, "\n").concat(intro.capabilities.dataManagement.description, "\uFF1A\n").concat(intro.capabilities.dataManagement.examples.map(function (ex) { return "- ".concat(ex); }).join('\n'), "\n\n### ").concat(intro.capabilities.intelligentAnalysis.title, "\n").concat(intro.capabilities.intelligentAnalysis.description, "\uFF1A\n").concat(intro.capabilities.intelligentAnalysis.examples.map(function (ex) { return "- ".concat(ex); }).join('\n'), "\n\n### ").concat(intro.capabilities.contentGeneration.title, "\n").concat(intro.capabilities.contentGeneration.description, "\uFF1A\n").concat(intro.capabilities.contentGeneration.examples.map(function (ex) { return "- ".concat(ex); }).join('\n'), "\n\n### ").concat(intro.capabilities.scheduleManagement.title, "\n").concat(intro.capabilities.scheduleManagement.description, "\uFF1A\n").concat(intro.capabilities.scheduleManagement.examples.map(function (ex) { return "- ".concat(ex); }).join('\n'), "\n\n### ").concat(intro.capabilities.smartSearch.title, "\n").concat(intro.capabilities.smartSearch.description, "\uFF1A\n").concat(intro.capabilities.smartSearch.examples.map(function (ex) { return "- ".concat(ex); }).join('\n'), "\n\n## \uD83C\uDFA8 \u6211\u7684\u7279\u8272\u529F\u80FD\n\n### ").concat(intro.features.naturalLanguage.title, "\n").concat(intro.features.naturalLanguage.description, "\uFF1A\n- \u274C \u4E0D\u7528\u8BF4\uFF1A\"").concat(intro.features.naturalLanguage.wrongExample, "\"\n- \u2705 \u53EA\u9700\u8BF4\uFF1A\"").concat(intro.features.naturalLanguage.rightExample, "\"\n\n### ").concat(intro.features.intelligentUnderstanding.title, "\n").concat(intro.features.intelligentUnderstanding.description, "\uFF1A\n").concat(intro.features.intelligentUnderstanding.examples.map(function (ex) { return "- \"".concat(ex.input, "\" \u2192 ").concat(ex.understanding); }).join('\n'), "\n\n### ").concat(intro.features.fastResponse.title, "\n- ").concat(intro.features.fastResponse.simple, "\n- ").concat(intro.features.fastResponse.complex, "\n\n### ").concat(intro.features.multipleDisplay.title, "\n").concat(intro.features.multipleDisplay.description, "\uFF1A\n").concat(intro.features.multipleDisplay.formats.map(function (f) { return "- **".concat(f.type, "**\uFF1A").concat(f.usage); }).join('\n'), "\n\n## \uD83C\uDF1F \u6211\u7684\u4F18\u52BF\n\n").concat(intro.advantages.map(function (adv) { return "".concat(adv.icon, " **").concat(adv.title, "**\uFF1A").concat(adv.description); }).join('\n'), "\n\n## ").concat(intro.getStarted.message, "\n\n\u4F60\u53EF\u4EE5\u95EE\u6211\uFF1A\n").concat(intro.getStarted.suggestions.map(function (s) { return "- \"".concat(s, "\""); }).join('\n'), "\n\n").concat(intro.getStarted.ready, "\n").trim();
}
exports.generateSystemIntroduction = generateSystemIntroduction;
/**
 * 检测用户是否在询问系统介绍
 */
function isAskingAboutSystem(query) {
    var keywords = [
        '你是谁', '你是什么', '你叫什么', '你的名字',
        '你能做什么', '你会做什么', '你可以做什么',
        '有什么功能', '有哪些功能', '功能介绍',
        '怎么用', '如何使用', '使用方法',
        '你好', '介绍一下', '自我介绍'
    ];
    var lowerQuery = query.toLowerCase().trim();
    // 检查是否包含关键词
    return keywords.some(function (keyword) { return lowerQuery.includes(keyword); });
}
exports.isAskingAboutSystem = isAskingAboutSystem;
