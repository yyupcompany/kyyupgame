import { checkDirectAxiosUsage, checkHardcodedPorts, checkHardcodedUrls } from './api-rules';

/**
 * API验证工具
 * 用于在开发环境自动检查代码中的API调用是否符合规范
 */

// 验证结果类型
export interface ValidationResult {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  rule: string;
}

/**
 * 检查文件内容是否符合API规范
 * @param content 文件内容
 * @param fileName 文件名
 * @returns 验证结果列表
 */
export function validateFileContent(content: string, fileName: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const lines = content.split('\n');
  
  // 跳过特定文件
  if (fileName.includes('request.ts') || fileName.includes('api-rules.ts')) {
    return results;
  }
  
  // 检查每一行
  lines.forEach((line, index) => {
    // 检查直接使用axios
    if (checkDirectAxiosUsage(line)) {
      results.push({
        file: fileName,
        line: index + 1,
        column: line.indexOf('axios'),
        message: '直接使用了axios，应使用request工具',
        severity: 'error',
        rule: 'no-direct-axios'
      });
    }
    
    // 检查硬编码端口
    const hardcodedPorts = checkHardcodedPorts(line);
    if (hardcodedPorts.length > 0) {
      results.push({
        file: fileName,
        line: index + 1,
        column: line.indexOf(`:${hardcodedPorts[0]}`),
        message: `硬编码端口 ${hardcodedPorts.join(', ')}，应使用配置常量`,
        severity: 'error',
        rule: 'no-hardcoded-ports'
      });
    }
    
    // 检查硬编码URL
    const hardcodedUrls = checkHardcodedUrls(line);
    if (hardcodedUrls.length > 0) {
      results.push({
        file: fileName,
        line: index + 1,
        column: line.indexOf(hardcodedUrls[0]),
        message: '硬编码URL，应使用buildApiUrl或配置常量',
        severity: 'error',
        rule: 'no-hardcoded-urls'
      });
    }
    
    // 检查token直接处理
    if (line.includes('token') && 
        (line.includes('headers[') || line.includes('headers.Authorization'))) {
      results.push({
        file: fileName,
        line: index + 1,
        column: line.indexOf('token'),
        message: '直接设置token头，应使用request拦截器统一处理',
        severity: 'warning',
        rule: 'no-direct-token-handling'
      });
    }
  });
  
  return results;
}

/**
 * 格式化验证结果，生成控制台输出
 * @param results 验证结果列表
 * @returns 格式化后的字符串
 */
export function formatValidationResults(results: ValidationResult[]): string {
  if (results.length === 0) {
    return '✓ 没有发现API规则违反';
  }
  
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  
  let output = `发现 ${errorCount} 个错误，${warningCount} 个警告\n\n`;
  
  results.forEach(result => {
    const icon = result.severity === 'error' ? '✗' : '⚠';
    const color = result.severity === 'error' ? '\x1b[31m' : '\x1b[33m';
    
    output += `${color}${icon} ${result.file}:${result.line}:${result.column}\x1b[0m - ${result.message} [${result.rule}]\n`;
  });
  
  return output;
}

// 开发环境中自动验证
if (process.env.NODE_ENV === 'development' && import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload: any) => {
    const { file, content } = payload;
    if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.vue')) {
      const results = validateFileContent(content, file);
      if (results.length > 0) {
        console.warn(formatValidationResults(results));
      }
    }
  });
} 