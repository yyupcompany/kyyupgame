/**
 * 获取TodoList工具
 * 查询用户的待办任务列表
 */

import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';
import todoService from '../../../system/todo.service';
import { TodoStatus } from '../../../../models/todo.model';

const getTodoListTool: ToolDefinition = {
  name: 'get_todo_list',
  description: '获取用户的待办任务列表。可以按状态、优先级过滤。',
  category: TOOL_CATEGORIES.WORKFLOW,
  parameters: {
    type: 'object',
    properties: {
      userId: {
        type: 'number',
        description: '用户ID'
      },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'all'],
        description: '任务状态过滤'
      },
      limit: {
        type: 'number',
        description: '返回数量限制，默认10'
      },
      todoListId: {
        type: 'number',
        description: '指定TodoList ID，获取该清单下的所有子任务'
      }
    },
    required: []
  },
  handler: async (args: {
    userId?: number;
    status?: string;
    limit?: number;
    todoListId?: number;
  }) => {
    console.log('📋 [获取TodoList] 参数:', args);
    
    const { userId = 1, status = 'all', limit = 10, todoListId } = args;
    
    try {
      // 构建查询参数
      const queryParams: any = {
        userId,
        pageSize: limit,
        page: 1,
        sortBy: 'priority',
        sortOrder: 'ASC' as const
      };
      
      // 状态过滤
      if (status !== 'all') {
        const statusMap: Record<string, TodoStatus> = {
          pending: TodoStatus.PENDING,
          in_progress: TodoStatus.IN_PROGRESS,
          completed: TodoStatus.COMPLETED,
          cancelled: TodoStatus.CANCELLED
        };
        queryParams.status = statusMap[status];
      }
      
      // 如果指定了todoListId，查询其子任务
      if (todoListId) {
        queryParams.relatedType = 'todo_list';
      }
      
      const result = await todoService.getTodos(queryParams);
      
      // 如果指定了todoListId，筛选该清单的子任务
      let tasks = result.rows;
      if (todoListId) {
        tasks = tasks.filter(t => t.relatedId === todoListId);
      }
      
      // 格式化输出
      const formattedTasks = tasks.map((todo, index) => ({
        id: todo.id,
        order: index + 1,
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        status: todo.status,
        dueDate: todo.dueDate,
        completed: todo.status === TodoStatus.COMPLETED,
        completedDate: todo.completedDate
      }));
      
      // 统计
      const stats = {
        total: formattedTasks.length,
        pending: formattedTasks.filter(t => t.status === 'pending').length,
        inProgress: formattedTasks.filter(t => t.status === 'in_progress').length,
        completed: formattedTasks.filter(t => t.completed).length
      };
      
      const progress = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
      
      console.log(`✅ [获取TodoList] 完成: 找到 ${formattedTasks.length} 个任务`);
      
      return {
        name: 'get_todo_list',
        status: 'success',
        result: {
          tasks: formattedTasks,
          stats,
          progress,
          message: formattedTasks.length > 0
            ? `📋 共 ${stats.total} 个任务: ${stats.completed} 已完成, ${stats.pending} 待处理`
            : '暂无待办任务',
          // 用于前端渲染
          ui_component: 'todo-list',
          ui_data: {
            tasks: formattedTasks,
            stats,
            progress
          }
        }
      };
    } catch (error: any) {
      console.error('❌ [获取TodoList] 失败:', error);
      return {
        name: 'get_todo_list',
        status: 'error',
        error: error.message || '获取待办列表失败'
      };
    }
  }
};

export default getTodoListTool;

