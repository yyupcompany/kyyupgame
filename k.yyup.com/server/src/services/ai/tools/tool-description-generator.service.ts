/**
 * 工具描述生成器服务
 */

import { toolLoaderService } from './core/tool-loader.service';

/**
 * 生成工具描述
 */
export function generateToolDescription(toolName: string): string {
  const tool = toolLoaderService.getTool(toolName);
  if (!tool) {
    return `工具 ${toolName} 不存在`;
  }

  let description = `## ${tool.name}\n\n`;
  description += `**描述**: ${tool.description}\n\n`;
  description += `**类别**: ${tool.category}\n\n`;
  description += `**参数**:\n`;

  for (const [paramName, paramInfo] of Object.entries(tool.parameters)) {
    const info = paramInfo as any;
    description += `- \`${paramName}\` (${info.type}${info.required ? ', 必填' : ', 可选'}): ${info.description || ''}\n`;
  }

  return description;
}

/**
 * 生成工具意图描述
 */
export function generateToolIntent(toolName: string): string {
  const tool = toolLoaderService.getTool(toolName);
  if (!tool) {
    return '';
  }

  // 根据工具类别生成意图描述
  const intentTemplates: Record<string, string> = {
    query: `当用户想要查询${tool.description.replace('查询', '')}时，使用此工具`,
    action: `当用户想要执行${tool.description}操作时，使用此工具`,
    analysis: `当用户需要${tool.description}时，使用此工具`,
    generation: `当用户需要生成${tool.description.replace('生成', '')}时，使用此工具`,
    management: `当用户需要管理${tool.description}时，使用此工具`
  };

  return intentTemplates[tool.category] || `用于${tool.description}`;
}

/**
 * 生成所有工具的描述
 */
export function generateAllToolsDescription(): string {
  const tools = toolLoaderService.getAllTools();
  return tools.map(tool => generateToolDescription(tool.name)).join('\n\n---\n\n');
}

/**
 * 生成工具选择提示
 */
export function generateToolSelectionPrompt(query: string): string {
  const tools = toolLoaderService.getAllTools();
  
  let prompt = `根据用户的问题，选择最合适的工具。\n\n`;
  prompt += `用户问题: ${query}\n\n`;
  prompt += `可用工具:\n`;
  
  for (const tool of tools) {
    prompt += `- ${tool.name}: ${tool.description} (${tool.category})\n`;
  }
  
  prompt += `\n请返回最合适的工具名称。`;
  
  return prompt;
}

