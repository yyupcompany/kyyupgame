"use strict";
exports.__esModule = true;
exports.TOOL_SELECTION_CONFIG = exports.FUNCTION_TOOL_GROUPS = void 0;
/**
 * 按功能分类的工具组配置
 */
exports.FUNCTION_TOOL_GROUPS = {
    // 🔄 工作流工具组
    workflow: {
        name: 'workflow',
        displayName: '工作流工具',
        priority: 1,
        maxTools: 3,
        keywords: ['工作流', '流程', '任务', '计划', '步骤', 'workflow', 'task', 'plan', '待办', 'todo'],
        tools: [
            'create_workflow',
            'execute_workflow',
            'plan_workflow',
            'task_management',
            'smart_workflow',
            'create_todo_list',
            'update_todo_task'
        ]
    },
    // 🌐 网页操作工具组
    webOperation: {
        name: 'webOperation',
        displayName: '网页操作工具',
        priority: 2,
        maxTools: 5,
        keywords: ['导航', '页面', '截图', '表单', '点击', '填写', '搜索', '查找', 'navigate', 'page', 'form', 'click', '跳转', '打开', 'search'],
        tools: [
            'navigate_to_page',
            'capture_screen',
            'fill_form',
            'submit_form',
            'click_element',
            'get_page_structure',
            'validate_page_state',
            'wait_for_element',
            'web_search'
        ]
    },
    // 🗄️ 数据库查询工具组
    databaseQuery: {
        name: 'databaseQuery',
        displayName: '数据库查询工具',
        priority: 3,
        maxTools: 3,
        keywords: ['查询', '数据', '统计', '分析', '学生', '教师', '活动', '班级', '招生', 'query', 'data', 'statistics', '历史', '趋势'],
        tools: [
            'read_data_record',
            'any_query',
            'query_past_activities',
            'get_activity_statistics',
            'query_enrollment_history',
            'analyze_business_trends',
            'query_data'
        ]
    },
    // 🎨 UI展示工具组
    uiDisplay: {
        name: 'uiDisplay',
        displayName: 'UI展示工具',
        priority: 4,
        maxTools: 2,
        keywords: ['显示', '展示', '图表', '表格', '组件', 'display', 'chart', 'table', 'component', '渲染'],
        tools: [
            'render_component',
            'create_task_list',
            'display_data'
        ]
    },
    // 💼 业务操作工具组
    businessOperation: {
        name: 'businessOperation',
        displayName: '业务操作工具',
        priority: 5,
        maxTools: 3,
        keywords: ['创建', '生成', '活动', '海报', '专家', '咨询', '招生', '策划', 'create', 'generate', 'activity', 'poster', 'expert', 'consultation', 'recruitment'],
        tools: [
            'create_activity',
            'create_activity_complete',
            'generate_poster',
            'expert_consultation',
            'consult_recruitment_planner',
            'call_expert',
            'get_expert_list' // 📋 专家列表
        ]
    }
};
/**
 * 工具选择配置
 */
exports.TOOL_SELECTION_CONFIG = {
    // 最大工具数量限制
    // 🔧 从3个增加到8个，支持更复杂的工具组合
    maxToolsPerRequest: 8,
    // 默认工具（总是包含）
    defaultTools: ['render_component'],
    // 用户角色权限
    rolePermissions: {
        'admin': ['workflow', 'webOperation', 'databaseQuery', 'uiDisplay', 'businessOperation'],
        'manager': ['workflow', 'webOperation', 'databaseQuery', 'uiDisplay'],
        'teacher': ['webOperation', 'databaseQuery', 'uiDisplay'],
        'user': ['uiDisplay', 'databaseQuery']
    },
    // 工具权重配置
    // 🔍 权重说明：数值越高，优先级越高
    toolWeights: {
        'render_component': 10,
        'query_data': 9,
        'read_data_record': 8,
        'web_search': 8,
        'consult_recruitment_planner': 8,
        'call_expert': 7,
        'navigate_to_page': 6,
        'capture_screen': 5,
        'any_query': 5,
        'get_activity_statistics': 4,
        'create_task_list': 3,
        'get_expert_list': 3,
        'fill_form': 2,
        'create_activity': 1,
        'expert_consultation': 1 // 专家咨询
    }
};
