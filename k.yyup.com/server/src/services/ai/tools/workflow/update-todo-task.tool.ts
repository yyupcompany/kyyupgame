/**
 * 更新TodoList任务状态工具
 * 用于更新任务状态、标记完成等操作
 */

import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';
import todoService from '../../../system/todo.service';
import { TodoStatus } from '../../../../models/todo.model';

// 状态映射
const statusMap: Record<string, TodoStatus> = {
  pending: TodoStatus.PENDING,
  in_progress: TodoStatus.IN_PROGRESS,
  completed: TodoStatus.COMPLETED,
  cancelled: TodoStatus.CANCELLED
};

const updateTodoTaskTool: ToolDefinition = {
  name: 'update_todo_task',
  description: '更新TodoList中的任务状态。可以标记任务为进行中、已完成或取消。',
  category: TOOL_CATEGORIES.WORKFLOW,
  parameters: {
    type: 'object',
    properties: {
      taskId: {
        type: 'number',
        description: '任务ID'
      },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        description: '新的任务状态'
      },
      notes: {
        type: 'string',
        description: '状态更新备注'
      }
    },
    required: ['taskId', 'status']
  },
  handler: async (args: {
    taskId: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
  }) => {
    console.log('📝 [更新任务状态] 任务ID:', args.taskId, '-> 状态:', args.status);
    
    const { taskId, status, notes } = args;
    
    try {
      // 获取当前任务
      const currentTodo = await todoService.getTodoById(taskId);
      
      // 更新任务状态
      const updatedTodo = await todoService.updateTodo(taskId, {
        status: statusMap[status],
        description: notes ? `${currentTodo.description || ''}\n\n📝 ${notes}` : currentTodo.description || undefined
      });
      
      // 如果是子任务，检查父任务进度
      let parentProgress = null;
      if (currentTodo.relatedType === 'todo_list' && currentTodo.relatedId) {
        const siblings = await todoService.getTodos({
          relatedType: 'todo_list',
          page: 1,
          pageSize: 100
        });
        
        // 筛选同一父任务的子任务
        const relatedTasks = siblings.rows.filter(t => t.relatedId === currentTodo.relatedId);
        const completedCount = relatedTasks.filter(t => t.status === TodoStatus.COMPLETED).length;
        parentProgress = Math.round((completedCount / relatedTasks.length) * 100);
      }
      
      const statusText = {
        pending: '待处理',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }[status];
      
      console.log(`✅ [更新任务状态] 完成: ${currentTodo.title} -> ${statusText}`);
      
      return {
        name: 'update_todo_task',
        status: 'success',
        result: {
          taskId,
          previousStatus: currentTodo.status,
          newStatus: status,
          title: currentTodo.title,
          parentProgress,
          message: `✅ 任务「${currentTodo.title}」已更新为${statusText}`,
          // 触发前端更新
          ui_event: 'todo_task_updated',
          ui_data: {
            taskId,
            status,
            progress: parentProgress
          }
        }
      };
    } catch (error: any) {
      console.error('❌ [更新任务状态] 失败:', error);
      return {
        name: 'update_todo_task',
        status: 'error',
        error: error.message || '更新任务状态失败'
      };
    }
  }
};

export default updateTodoTaskTool;

