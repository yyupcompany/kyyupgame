"use strict";
/**
 * 功能映射配置 - 基于查询内容智能识别需要的功能
 */
exports.__esModule = true;
exports.FUNCTION_MAPPING = void 0;
exports.FUNCTION_MAPPING = {
    // 基于查询内容的功能识别
    intentMapping: {
        // 工作流相关
        'workflow': {
            patterns: [
                /工作流|流程|任务|计划|步骤|workflow|task|plan/i,
                /待办|todo|清单|checklist/i,
                /规划|安排|组织|organize/i
            ],
            toolGroup: 'workflow',
            defaultTools: ['plan_workflow', 'create_todo_list'],
            weight: 8
        },
        // 网页操作相关
        'web_operation': {
            patterns: [
                /导航|页面|截图|表单|填写|点击|navigate|page|form|click/i,
                /跳转|打开|访问|visit|go/i,
                /截屏|capture|screen|图片/i
            ],
            toolGroup: 'webOperation',
            defaultTools: ['navigate_to_page', 'capture_screen'],
            weight: 7
        },
        // 网络搜索相关
        // 🔍 智能搜索意图识别：
        // 当出现"搜索"、"最新"等关键词时，需要判断用户意图是本地数据库搜索还是网络搜索
        // 判断依据：
        // 1. 明确的网络搜索关键词：网上、互联网、百度、谷歌、在线
        // 2. 时效性关键词：最新、今天、昨天、本周、最近、新闻、政策
        // 3. 知识性关键词：什么是、如何、怎么、为什么、了解
        // 4. 排除本地数据：如果查询涉及本地业务数据（学生、教师、班级、活动等），优先使用数据库查询
        'web_search': {
            patterns: [
                // 明确的网络搜索意图
                /网上|互联网|在线|百度|谷歌|搜索引擎|online|internet|google|baidu/i,
                // 时效性关键词（强烈暗示需要网络搜索）
                /最新.*政策|最新.*新闻|最新.*资讯|最新.*消息|latest.*news|latest.*policy/i,
                /今天.*新闻|昨天.*新闻|本周.*新闻|今年.*政策|recent.*news/i,
                // 知识性查询（可能需要网络搜索）
                /什么是.*(?!学生|教师|班级|活动|家长|幼儿园)|如何.*(?!创建|添加|修改|删除)|怎么.*(?!操作|使用)/i,
                /为什么.*(?!学生|教师|班级|活动)|了解.*(?!学生|教师|班级|活动)/i,
                // 搜索关键词（需要结合上下文判断）
                /搜索.*(?!学生|教师|班级|活动|家长)|查找.*(?!学生|教师|班级|活动|家长)/i,
                /搜一下|找一下|查一查|看看.*(?!学生|教师|班级|活动)/i
            ],
            toolGroup: 'webOperation',
            defaultTools: ['web_search'],
            weight: 8,
            // 🚨 排除模式：如果匹配这些模式，不使用网络搜索
            excludePatterns: [
                /查询.*学生|查询.*教师|查询.*班级|查询.*活动|查询.*家长/i,
                /统计.*学生|统计.*教师|统计.*班级|统计.*活动/i,
                /历史.*记录|过往.*数据|本园.*数据/i,
                /我们.*学生|我们.*教师|我们.*班级|我们.*活动/i
            ]
        },
        // 数据查询相关
        'data_query': {
            patterns: [
                /查询|数据|统计|分析|活动|招生|query|data|statistics/i,
                /历史|过往|记录|history|record/i,
                /趋势|分析|analysis|trend/i
            ],
            toolGroup: 'databaseQuery',
            defaultTools: ['any_query'],
            weight: 10
        },
        // UI展示相关
        'ui_display': {
            patterns: [
                /显示|展示|图表|表格|组件|display|chart|table|component/i,
                /渲染|render|界面|ui/i,
                /柱状图|饼图|折线图|bar|pie|line/i
            ],
            toolGroup: 'uiDisplay',
            defaultTools: ['render_component'],
            weight: 10
        },
        // 业务操作相关
        'business_operation': {
            patterns: [
                /创建|生成|活动|海报|专家|create|generate|activity|poster/i,
                /咨询|consultation|建议|advice/i,
                /新建|添加|add|new/i
            ],
            toolGroup: 'businessOperation',
            defaultTools: ['create_activity'],
            weight: 6
        }
    },
    // 特殊查询模式识别
    specialPatterns: {
        // 紧急模式 - 只使用核心工具
        emergency: {
            patterns: [/紧急|urgent|快速|quick|简单|simple/i],
            maxTools: 3,
            forceTools: ['render_component', 'query_data']
        },
        // 详细模式 - 使用更多工具
        detailed: {
            patterns: [/详细|detailed|完整|complete|全面|comprehensive/i],
            maxTools: 12,
            preferGroups: ['databaseQuery', 'uiDisplay', 'businessOperation']
        },
        // 演示模式 - 重点使用展示工具
        demo: {
            patterns: [/演示|demo|展示|show|presentation/i],
            maxTools: 6,
            preferGroups: ['uiDisplay', 'webOperation']
        }
    },
    // 用户角色权限映射
    rolePermissions: {
        'admin': ['workflow', 'webOperation', 'databaseQuery', 'uiDisplay', 'businessOperation'],
        'manager': ['workflow', 'webOperation', 'databaseQuery', 'uiDisplay'],
        'teacher': ['webOperation', 'databaseQuery', 'uiDisplay'],
        'user': ['uiDisplay', 'databaseQuery']
    },
    // 工具组合规则
    combinationRules: {
        // 如果选择了数据查询，建议添加UI展示
        'databaseQuery': ['uiDisplay'],
        // 如果选择了业务操作，建议添加工作流
        'businessOperation': ['workflow'],
        // 如果选择了网页操作，建议添加截图
        'webOperation': ['uiDisplay']
    }
};
