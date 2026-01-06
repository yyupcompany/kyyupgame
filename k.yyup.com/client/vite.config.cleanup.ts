/**
 * Vite 插件 - 生产环境调试代码清理
 * Vite Plugin - Production Debug Code Cleanup
 */

import type { Plugin } from 'vite';

export interface CleanupOptions {
  // 是否启用清理
  enabled?: boolean;
  // 自定义清理规则
  customPatterns?: Array<{
    pattern: RegExp;
    replacement?: string;
    description?: string;
  }>;
  // 保留的调试代码模式
  keepPatterns?: RegExp[];
  // 是否生成清理报告
  generateReport?: boolean;
}

/**
 * 创建调试代码清理插件
 */
export function createDebugCleanupPlugin(options: CleanupOptions = {}): Plugin {
  const {
    enabled = true,
    customPatterns = [],
    keepPatterns = [],
    generateReport = true
  } = options;

  if (!enabled) {
    return {
      name: 'debug-cleanup-disabled'
    };
  }

  const stats = {
    filesProcessed: 0,
    debugLinesRemoved: 0,
    customPatternsApplied: 0,
    errors: 0
  };

  // 默认的调试代码模式
  const defaultPatterns = [
    {
      pattern: /console\.(log|debug|info|warn)\s*\([^)]*\)[;]?[\s]*$/gm,
      replacement: '',
      description: 'Console logging statements'
    },
    {
      pattern: /\bdebugger\b[;]?[\s]*$/gm,
      replacement: '',
      description: 'Debugger statements'
    },
    {
      pattern: /\/\/\s*(TODO|FIXME|HACK|XXX):.*$/gm,
      replacement: '',
      description: 'Development comments'
    },
    {
      pattern: /\/\*[\s\S]*?(TODO|FIXME|HACK|XXX)[\s\S]*?\*\//gm,
      replacement: '',
      description: 'Development comment blocks'
    },
    {
      pattern: /if\s*\(\s*process\.env\.NODE_ENV\s*!==\s*['"]production['"]\s*\)\s*{[\s\S]*?}/gm,
      replacement: '',
      description: 'Development environment checks'
    },
    {
      pattern: /if\s*\(\s*process\.env\.DEV\s*\)\s*{[\s\S]*?}/gm,
      replacement: '',
      description: 'DEV environment checks'
    }
  ];

  // 合并所有模式
  const allPatterns = [...defaultPatterns, ...customPatterns];

  // 保留模式（不清理的内容）
  const keepers = [
    /console\.error\s*\([^)]*\)/, // 保留错误日志
    ...keepPatterns
  ];

  return {
    name: 'vite-plugin-debug-cleanup',
    apply: 'build',

    transform(code: string, id: string) {
      // 只处理 JS/TS/Vue 文件
      if (!/\.(js|ts|jsx|tsx|vue)$/.test(id)) {
        return null;
      }

      try {
        let processedCode = code;
        let fileStats = {
          linesRemoved: 0,
          patternsApplied: 0
        };

        // 对于 Vue 文件，只处理 script 部分
        const isVueFile = /\.vue$/.test(id);
        let scriptContent = processedCode;

        if (isVueFile) {
          const scriptMatch = processedCode.match(/<script[^>]*>([\s\S]*?)<\/script>/);
          if (scriptMatch) {
            scriptContent = scriptMatch[1];
          } else {
            return null; // 没有 script 部分则跳过
          }
        }

        // 应用清理模式
        for (const patternObj of allPatterns) {
          const beforeLength = scriptContent.length;

          // 检查是否有需要保留的内容
          if (keepers.some(keeper => keeper.test(scriptContent))) {
            // 对于包含保留内容的代码，进行更细致的清理
            scriptContent = scriptContent.replace(patternObj.pattern, (match, ...args) => {
              // 检查匹配的内容是否应该保留
              if (keepers.some(keeper => keeper.test(match))) {
                return match; // 保留匹配内容
              }
              return patternObj.replacement || '';
            });
          } else {
            // 没有保留内容，直接替换
            scriptContent = scriptContent.replace(patternObj.pattern, patternObj.replacement || '');
          }

          const afterLength = scriptContent.length;
          if (beforeLength !== afterLength) {
            fileStats.linesRemoved++;
            fileStats.patternsApplied++;
          }
        }

        // 清理多余的空行
        scriptContent = scriptContent.replace(/\n{3,}/g, '\n\n');
        scriptContent = scriptContent.replace(/^\s+|\s+$/g, '');

        // 重新组合 Vue 文件
        if (isVueFile) {
          processedCode = processedCode.replace(
            /<script[^>]*>[\s\S]*?<\/script>/,
            `<script>\n${scriptContent}\n</script>`
          );
        } else {
          processedCode = scriptContent;
        }

        // 更新统计信息
        stats.filesProcessed++;
        stats.debugLinesRemoved += fileStats.linesRemoved;
        stats.customPatternsApplied += fileStats.patternsApplied;

        // 如果有变化，返回处理后的代码
        if (processedCode !== code) {
          if (generateReport) {
            console.log(`[DEBUG-CLEANUP] Processed: ${id}`);
            console.log(`  - Lines removed: ${fileStats.linesRemoved}`);
            console.log(`  - Patterns applied: ${fileStats.patternsApplied}`);
          }

          return {
            code: processedCode,
            map: null // 生成 source map 可能会有问题
          };
        }

        return null;
      } catch (error) {
        console.error(`[DEBUG-CLEANUP] Error processing ${id}:`, error);
        stats.errors++;
        return null;
      }
    },

    buildEnd() {
      if (generateReport && enabled) {
        console.log('\n[DEBUG-CLEANUP] Build Summary:');
        console.log(`  Files processed: ${stats.filesProcessed}`);
        console.log(`  Debug lines removed: ${stats.debugLinesRemoved}`);
        console.log(`  Custom patterns applied: ${stats.customPatternsApplied}`);
        console.log(`  Errors: ${stats.errors}`);

        // 生成详细报告
        const report = {
          timestamp: new Date().toISOString(),
          stats,
          patterns: allPatterns.map(p => ({
            pattern: p.pattern.toString(),
            description: p.description,
            replacement: p.replacement
          })),
          keepers: keepers.map(k => k.toString())
        };

        // 这里可以将报告写入文件
        // fs.writeFileSync('debug-cleanup-report.json', JSON.stringify(report, null, 2));
      }
    }
  };
}

/**
 * 生产环境调试代码清理插件
 */
export const debugCleanupPlugin = createDebugCleanupPlugin({
  enabled: process.env.NODE_ENV === 'production',
  generateReport: process.env.NODE_ENV === 'production',
  customPatterns: [
    // 可以添加项目特定的清理规则
    // {
    //   pattern: /console\.table\s*\([^)]*\)/g,
    //   replacement: '',
    //   description: 'Console table statements'
    // }
  ]
});

export default debugCleanupPlugin;