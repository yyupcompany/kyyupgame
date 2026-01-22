/**
 * 创建TodoList工具
 * 创建任务清单，用于复杂任务的分步管理
 */

import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';
import todoService from '../../../system/todo.service';
import { TodoPriority, TodoStatus } from '../../../../models/todo.model';

// 任务项定义
interface TaskItem {
  title: string;
  description?: string;
  priority?: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  estimatedTime?: string;
  dependencies?: string[];
}

// 优先级映射
const priorityMap: Record<string, TodoPriority> = {
  highest: TodoPriority.HIGHEST,
  high: TodoPriority.HIGH,
  medium: TodoPriority.MEDIUM,
  low: TodoPriority.LOW,
  lowest: TodoPriority.LOWEST
};

const createTodoListTool: ToolDefinition = {
  name: 'create_todo_list',
  description: '创建TodoList任务清单。用于复杂任务的分步管理，AI会自动分解任务并创建可执行的待办列表。',
  category: TOOL_CATEGORIES.MANAGEMENT,
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: '任务清单标题'
      },
      description: {
        type: 'string',
        description: '任务清单描述'
      },
      tasks: {
        type: 'array',
        description: '任务列表',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '任务标题' },
            description: { type: 'string', description: '任务描述' },
            priority: { type: 'string', enum: ['highest', 'high', 'medium', 'low', 'lowest'] },
            estimatedTime: { type: 'string', description: '预计耗时' }
          },
          required: ['title']
        }
      },
      category: {
        type: 'string',
        description: '任务类别，如: 活动策划、招生管理、日常工作'
      },
      userId: {
        type: 'number',
        description: '创建用户ID'
      }
    },
    required: ['title', 'tasks']
  },
  handler: async (args: {
    title: string;
    description?: string;
    tasks: TaskItem[];
    category?: string;
    userId?: number;
  }) => {
    console.log('📋 [创建TodoList] 开始创建:', args.title);
    
    const { title, description, tasks, category = '任务管理', userId = 1 } = args;
    
    try {
      // 创建主任务
      const mainTodo = await todoService.createTodo({
        title,
        description: description || `任务清单: ${title}`,
        priority: TodoPriority.HIGH,
        status: TodoStatus.PENDING,
        userId,
        tags: [category, 'AI生成']
      });
      
      // 创建子任务
      const createdTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const subTodo = await todoService.createTodo({
          title: `${i + 1}. ${task.title}`,
          description: task.description || '',
          priority: priorityMap[task.priority || 'medium'],
          status: TodoStatus.PENDING,
          userId,
          tags: [category],
          relatedId: mainTodo.id,
          relatedType: 'todo_list'
        });
        
        createdTasks.push({
          id: subTodo.id,
          order: i + 1,
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          estimatedTime: task.estimatedTime,
          status: 'pending'
        });
      }
      
      console.log(`✅ [创建TodoList] 完成: 创建了 ${createdTasks.length} 个任务`);
      
      return {
        name: 'create_todo_list',
        status: 'success',
        result: {
          todoListId: mainTodo.id,
          title,
          description,
          category,
          taskCount: createdTasks.length,
          tasks: createdTasks,
          message: `✅ 已创建任务清单「${title}」，包含 ${createdTasks.length} 个任务`,
          // 用于前端渲染
          ui_component: 'todo-list',
          ui_data: {
            id: mainTodo.id,
            title,
            description,
            category,
            status: 'active',
            progress: 0,
            tasks: createdTasks
          }
        }
      };
    } catch (error: any) {
      console.error('❌ [创建TodoList] 失败:', error);
      return {
        name: 'create_todo_list',
        status: 'error',
        error: error.message || '创建任务清单失败'
      };
    }
  }
};

export default createTodoListTool;

