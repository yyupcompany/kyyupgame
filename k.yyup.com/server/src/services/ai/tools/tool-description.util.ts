/**
 * 工具描述工具函数
 */

import { toolLoaderService } from './core/tool-loader.service';

export type ToolDescMode = 'brief' | 'detailed' | 'full';

/**
 * 构建工具预描述
 */
export function buildToolPreDescription(toolName: string, mode: ToolDescMode = 'brief'): string {
  const tool = toolLoaderService.getTool(toolName);
  if (!tool) {
    return `工具 ${toolName} 不存在`;
  }

  switch (mode) {
    case 'brief':
      return `${tool.name}: ${tool.description}`;
    case 'detailed':
      return `${tool.name}: ${tool.description}\n参数: ${JSON.stringify(tool.parameters)}`;
    case 'full':
      return `工具: ${tool.name}\n描述: ${tool.description}\n类别: ${tool.category}\n参数: ${JSON.stringify(tool.parameters, null, 2)}`;
    default:
      return `${tool.name}: ${tool.description}`;
  }
}

/**
 * 获取工具描述模式
 */
export function getToolDescMode(complexity: string): ToolDescMode {
  switch (complexity) {
    case 'simple':
      return 'brief';
    case 'medium':
      return 'detailed';
    case 'complex':
      return 'full';
    default:
      return 'brief';
  }
}

/**
 * 构建所有工具描述
 */
export function buildAllToolsDescription(mode: ToolDescMode = 'brief'): string {
  const tools = toolLoaderService.getAllTools();
  return tools.map(tool => buildToolPreDescription(tool.name, mode)).join('\n');
}

