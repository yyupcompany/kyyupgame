#!/usr/bin/env ts-node
/**
 * AI使用合规检查脚本
 * 
 * 功能：
 * 1. 检查所有AI调用是否使用AIBridge服务
 * 2. 检查AIBridge服务是否有完整的用量计算
 * 3. 生成报告：列出所有直接调用AI的代码位置
 * 4. 检查计费表结构是否支持图片、语音和视频三种类型的计费
 * 
 * 使用方法：
 * cd /home/zhgue/kyyupgame/k.yyup.com/server
 * npx ts-node scripts/check-ai-usage-compliance.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ComplianceIssue {
  file: string;
  line: number;
  code: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
}

interface CheckResult {
  totalFiles: number;
  checkedFiles: number;
  issues: ComplianceIssue[];
  summary: {
    high: number;
    medium: number;
    low: number;
  };
}

class AIUsageComplianceChecker {
  private srcDir: string;
  private issues: ComplianceIssue[] = [];
  
  // 需要检查的可疑模式
  private suspiciousPatterns = [
    // 直接使用fetch调用AI API
    { pattern: /fetch\s*\(\s*['"`][^'"`]*(?:openai|anthropic|api\.deepseek|doubao|volcengine).*['"`]/gi, severity: 'high' as const, issue: '直接使用fetch调用AI API，未通过AIBridge' },
    
    // 直接使用axios调用AI API
    { pattern: /axios\s*\.\s*(?:post|get|request)\s*\(\s*['"`][^'"`]*(?:openai|anthropic|api\.deepseek|doubao|volcengine).*['"`]/gi, severity: 'high' as const, issue: '直接使用axios调用AI API，未通过AIBridge' },
    
    // 直接import openai库
    { pattern: /import\s+.*from\s+['"`]openai['"`]/gi, severity: 'high' as const, issue: '直接导入OpenAI库，应使用AIBridge服务' },
    
    // 直接调用OpenAI实例
    { pattern: /new\s+OpenAI\s*\(/gi, severity: 'high' as const, issue: '直接创建OpenAI实例，应使用AIBridge服务' },
    
    // 使用API Key但未通过AIBridge
    { pattern: /['"`]sk-[a-zA-Z0-9]{20,}['"`]/gi, severity: 'medium' as const, issue: '发现API Key，请确认是否通过AIBridge使用' },
    
    // HTTP请求头包含Authorization Bearer
    { pattern: /headers\s*:\s*\{[^}]*['"`]Authorization['"`]\s*:\s*['"`]Bearer\s+/gi, severity: 'medium' as const, issue: '发现Bearer Token认证，请确认是否AI调用' },
  ];

  // 排除的文件和目录
  private excludePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/ai-bridge.service.ts', // AIBridge服务本身不检查
    '**/ai-bridge.types.ts',
    '**/check-ai-usage-compliance.ts', // 本脚本自身
  ];

  // 允许的文件（白名单）
  private whitelistFiles = [
    'server/src/services/ai/bridge/ai-bridge.service.ts',
    'server/src/services/ai/bridge/ai-bridge.types.ts',
    'server/src/services/volcengine/tts-longtex.service.ts', // TTS服务可以直接调用
    'server/src/services/volcengine/tts-longtext.service.ts',
    'server/src/services/volcengine/tts-v3-bidirection.service.ts',
    'server/src/services/volcengine/asr.service.ts',
    'server/src/services/volcengine/vod.service.ts',
  ];

  constructor(srcDir: string) {
    this.srcDir = srcDir;
  }

  /**
   * 执行检查
   */
  async check(): Promise<CheckResult> {
    console.log('🔍 开始检查AI使用合规性...\n');
    
    // 获取所有TypeScript文件
    const files = await glob('**/*.ts', {
      cwd: this.srcDir,
      ignore: this.excludePatterns,
      absolute: true,
    });

    console.log(`📁 共找到 ${files.length} 个文件需要检查\n`);

    let checkedFiles = 0;

    for (const file of files) {
      // 检查白名单
      const relativePath = path.relative(path.resolve(this.srcDir, '../..'), file);
      if (this.isWhitelisted(relativePath)) {
        console.log(`⚪ 跳过白名单文件: ${relativePath}`);
        continue;
      }

      await this.checkFile(file);
      checkedFiles++;
    }

    const summary = {
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
    };

    return {
      totalFiles: files.length,
      checkedFiles,
      issues: this.issues,
      summary,
    };
  }

  /**
   * 检查单个文件
   */
  private async checkFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (const { pattern, severity, issue } of this.suspiciousPatterns) {
        // 重置正则表达式
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(content)) !== null) {
          // 找到匹配的行号
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const lineContent = lines[lineNumber - 1]?.trim() || '';

          // 跳过注释行
          if (lineContent.startsWith('//') || lineContent.startsWith('*') || lineContent.startsWith('/*')) {
            continue;
          }

          this.issues.push({
            file: path.relative(this.srcDir, filePath),
            line: lineNumber,
            code: lineContent,
            issue,
            severity,
          });
        }
      }
    } catch (error) {
      console.error(`❌ 检查文件失败: ${filePath}`, error);
    }
  }

  /**
   * 检查文件是否在白名单中
   */
  private isWhitelisted(filePath: string): boolean {
    return this.whitelistFiles.some(pattern => {
      const normalized = path.normalize(filePath).replace(/\\/g, '/');
      return normalized.includes(pattern) || normalized.endsWith(pattern);
    });
  }

  /**
   * 生成报告
   */
  generateReport(result: CheckResult): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                   AI使用合规检查报告                          ');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`检查时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push(`检查目录: ${this.srcDir}`);
    lines.push(`总文件数: ${result.totalFiles}`);
    lines.push(`已检查文件: ${result.checkedFiles}`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                          问题统计                             ');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`🔴 高危问题: ${result.summary.high}`);
    lines.push(`🟡 中危问题: ${result.summary.medium}`);
    lines.push(`🟢 低危问题: ${result.summary.low}`);
    lines.push(`📊 总计: ${result.issues.length}`);
    lines.push('');

    if (result.issues.length === 0) {
      lines.push('✅ 恭喜！未发现任何合规问题。所有AI调用都正确使用了AIBridge服务。');
    } else {
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                          问题详情                             ');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');

      // 按严重程度分组
      const groupedIssues = {
        high: result.issues.filter(i => i.severity === 'high'),
        medium: result.issues.filter(i => i.severity === 'medium'),
        low: result.issues.filter(i => i.severity === 'low'),
      };

      for (const [severity, issues] of Object.entries(groupedIssues)) {
        if (issues.length === 0) continue;

        const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
        const label = severity === 'high' ? '高危' : severity === 'medium' ? '中危' : '低危';

        lines.push(`${emoji} ${label}问题 (${issues.length}个):`);
        lines.push('');

        issues.forEach((issue, index) => {
          lines.push(`  ${index + 1}. ${issue.file}:${issue.line}`);
          lines.push(`     问题: ${issue.issue}`);
          lines.push(`     代码: ${issue.code}`);
          lines.push('');
        });
      }

      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('                          修复建议                             ');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');
      lines.push('1. 所有AI调用都应该通过AIBridge服务：');
      lines.push('   import { aiBridgeService } from "@/services/ai/bridge/ai-bridge.service"');
      lines.push('');
      lines.push('2. 使用统一的AI调用方法：');
      lines.push('   - 文本生成: aiBridgeService.generateChatCompletion(...)');
      lines.push('   - 图片生成: aiBridgeService.generateImage(...)');
      lines.push('   - TTS语音: aiBridgeService.textToSpeech(...)');
      lines.push('   - 视频生成: aiBridgeService.generateVideo(...)');
      lines.push('');
      lines.push('3. AIBridge会自动处理：');
      lines.push('   ✅ Token计数和成本计算');
      lines.push('   ✅ 用量统计记录到数据库');
      lines.push('   ✅ 错误处理和重试机制');
      lines.push('   ✅ 性能监控和日志记录');
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * 检查AIBridge用量计算功能
   */
  checkAIBridgeUsageTracking(): string[] {
    const lines: string[] = [];
    
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                  AIBridge用量计算功能检查                     ');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');

    const aiBridgePath = path.join(this.srcDir, 'services/ai/bridge/ai-bridge.service.ts');
    
    if (!fs.existsSync(aiBridgePath)) {
      lines.push('❌ 错误: AIBridge服务文件不存在');
      return lines;
    }

    const content = fs.readFileSync(aiBridgePath, 'utf-8');

    // 检查关键功能
    const checks = [
      { name: '记录用量统计 (recordUsage)', pattern: /private\s+async\s+recordUsage/i, required: true },
      { name: '计算成本 (calculateCost)', pattern: /private\s+calculateCost/i, required: true },
      { name: '导入AIModelUsage模型', pattern: /import.*AIModelUsage/i, required: true },
      { name: '创建使用记录', pattern: /AIModelUsage\.create/i, required: true },
      { name: 'Token统计', pattern: /(?:prompt_tokens|completion_tokens|total_tokens)/i, required: true },
      { name: '成本计算', pattern: /cost\s*=.*calculate/i, required: true },
    ];

    let passedChecks = 0;
    lines.push('检查项目:');
    lines.push('');

    for (const check of checks) {
      const passed = check.pattern.test(content);
      const status = passed ? '✅' : '❌';
      const required = check.required ? '(必需)' : '(可选)';
      
      lines.push(`  ${status} ${check.name} ${required}`);
      
      if (passed) {
        passedChecks++;
      } else if (check.required) {
        lines.push(`      ⚠️  缺少此功能，AIBridge用量计算不完整！`);
      }
    }

    lines.push('');
    lines.push(`检查结果: ${passedChecks}/${checks.length} 通过`);
    
    if (passedChecks === checks.length) {
      lines.push('');
      lines.push('✅ AIBridge用量计算功能完整');
    } else {
      lines.push('');
      lines.push('❌ AIBridge用量计算功能不完整，需要补充缺失的功能');
    }

    return lines;
  }

  /**
   * 检查计费表结构
   */
  checkBillingTableStructure(): string[] {
    const lines: string[] = [];
    
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                     计费表结构检查                            ');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');

    // 检查ai-model-usage模型
    const usageModelPath = path.join(this.srcDir, 'models/ai-model-usage.model.ts');
    
    if (!fs.existsSync(usageModelPath)) {
      lines.push('❌ 错误: AIModelUsage模型文件不存在');
      return lines;
    }

    const content = fs.readFileSync(usageModelPath, 'utf-8');

    lines.push('📋 当前计费表 (ai_model_usage) 字段检查:');
    lines.push('');

    const fields = [
      { name: 'usageType (使用类型)', pattern: /usageType.*AIUsageType/i, supports: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO'] },
      { name: 'inputTokens (输入Token)', pattern: /inputTokens.*INTEGER/i },
      { name: 'outputTokens (输出Token)', pattern: /outputTokens.*INTEGER/i },
      { name: 'totalTokens (总Token)', pattern: /totalTokens.*INTEGER/i },
      { name: 'processingTime (处理时间)', pattern: /processingTime.*INTEGER/i },
      { name: 'cost (成本)', pattern: /cost.*DECIMAL/i },
      { name: 'status (状态)', pattern: /status.*AIUsageStatus/i },
    ];

    for (const field of fields) {
      const exists = field.pattern.test(content);
      const status = exists ? '✅' : '❌';
      lines.push(`  ${status} ${field.name}`);
      
      if (field.supports) {
        lines.push(`      支持类型: ${field.supports.join(', ')}`);
      }
    }

    // 检查枚举类型
    lines.push('');
    lines.push('📋 使用类型枚举 (AIUsageType) 检查:');
    lines.push('');

    const usageTypes = [
      { name: 'TEXT (文本/语言模型)', pattern: /TEXT\s*=\s*['"`]text['"`]/i, billingMethod: '按Token计费' },
      { name: 'IMAGE (图片生成)', pattern: /IMAGE\s*=\s*['"`]image['"`]/i, billingMethod: '按Token计费' },
      { name: 'AUDIO (语音/TTS)', pattern: /AUDIO\s*=\s*['"`]audio['"`]/i, billingMethod: '按Token计费' },
      { name: 'VIDEO (视频生成)', pattern: /VIDEO\s*=\s*['"`]video['"`]/i, billingMethod: '按秒计费 ⚠️' },
      { name: 'EMBEDDING (向量化)', pattern: /EMBEDDING\s*=\s*['"`]embedding['"`]/i, billingMethod: '按Token计费' },
    ];

    for (const type of usageTypes) {
      const exists = type.pattern.test(content);
      const status = exists ? '✅' : '❌';
      lines.push(`  ${status} ${type.name}`);
      lines.push(`      计费方式: ${type.billingMethod}`);
    }

    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                          问题分析                             ');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('');
    lines.push('⚠️  发现问题:');
    lines.push('');
    lines.push('1. 当前 ai_model_usage 表使用 Token 字段记录所有类型的用量');
    lines.push('   - 文本模型: inputTokens + outputTokens ✅ 合理');
    lines.push('   - 图片模型: 使用 totalTokens 表示图片数量 ⚠️ 语义不清');
    lines.push('   - 语音模型: 使用 totalTokens 表示字符数 ⚠️ 语义不清');
    lines.push('   - 视频模型: 使用 totalTokens 表示时长(秒) ❌ 不合理');
    lines.push('');
    lines.push('2. 视频计费按秒计算，但存储在Token字段中，容易混淆');
    lines.push('');
    lines.push('3. 缺少专门的计费单位字段来区分不同类型的计量方式');
    lines.push('');

    return lines;
  }

  /**
   * 生成新的计费表建议
   */
  generateBillingTableSuggestion(): string[] {
    const lines: string[] = [];
    
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                   新计费表结构建议                            ');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('建议创建独立的计费表 (ai_billing_records)，字段如下:');
    lines.push('');
    lines.push('```sql');
    lines.push('CREATE TABLE ai_billing_records (');
    lines.push('  id INT PRIMARY KEY AUTO_INCREMENT,');
    lines.push('  user_id INT NOT NULL COMMENT "用户ID",');
    lines.push('  model_id INT NOT NULL COMMENT "模型ID",');
    lines.push('  usage_id INT NOT NULL COMMENT "关联的使用记录ID",');
    lines.push('  billing_type ENUM("token", "second", "count") NOT NULL COMMENT "计费类型: token/秒/次数",');
    lines.push('  ');
    lines.push('  -- 通用计量字段');
    lines.push('  quantity DECIMAL(12, 2) NOT NULL COMMENT "计量数量 (Token数/秒数/次数)",');
    lines.push('  unit VARCHAR(20) NOT NULL COMMENT "计量单位 (token/second/count/image)",');
    lines.push('  ');
    lines.push('  -- 详细计量字段 (根据类型使用不同字段)');
    lines.push('  input_tokens INT DEFAULT 0 COMMENT "输入Token数 (仅文本类型)",');
    lines.push('  output_tokens INT DEFAULT 0 COMMENT "输出Token数 (仅文本类型)",');
    lines.push('  duration_seconds DECIMAL(10, 2) DEFAULT 0 COMMENT "时长(秒) (视频/音频类型)",');
    lines.push('  image_count INT DEFAULT 0 COMMENT "图片数量 (图片类型)",');
    lines.push('  ');
    lines.push('  -- 计费金额');
    lines.push('  unit_price DECIMAL(12, 8) NOT NULL COMMENT "单价",');
    lines.push('  total_cost DECIMAL(10, 6) NOT NULL COMMENT "总费用",');
    lines.push('  currency VARCHAR(10) DEFAULT "USD" COMMENT "货币单位",');
    lines.push('  ');
    lines.push('  -- 计费状态');
    lines.push('  billing_status ENUM("pending", "calculated", "paid", "failed") DEFAULT "pending",');
    lines.push('  billing_time DATETIME COMMENT "计费时间",');
    lines.push('  payment_time DATETIME COMMENT "支付时间",');
    lines.push('  ');
    lines.push('  -- 其他信息');
    lines.push('  remark TEXT COMMENT "备注",');
    lines.push('  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,');
    lines.push('  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,');
    lines.push('  ');
    lines.push('  INDEX idx_user_id (user_id),');
    lines.push('  INDEX idx_model_id (model_id),');
    lines.push('  INDEX idx_usage_id (usage_id),');
    lines.push('  INDEX idx_billing_time (billing_time),');
    lines.push('  INDEX idx_billing_status (billing_status)');
    lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT="AI计费记录表";');
    lines.push('```');
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                      计费规则说明                             ');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('');
    lines.push('1. 文本/语言模型 (billing_type = "token"):');
    lines.push('   - 使用字段: input_tokens, output_tokens');
    lines.push('   - 计量单位: token');
    lines.push('   - 计算公式: cost = input_tokens * input_price + output_tokens * output_price');
    lines.push('');
    lines.push('2. 图片生成模型 (billing_type = "count"):');
    lines.push('   - 使用字段: image_count');
    lines.push('   - 计量单位: image');
    lines.push('   - 计算公式: cost = image_count * unit_price');
    lines.push('');
    lines.push('3. 语音/TTS模型 (billing_type = "token"):');
    lines.push('   - 使用字段: input_tokens (字符数)');
    lines.push('   - 计量单位: token (或 character)');
    lines.push('   - 计算公式: cost = input_tokens * unit_price');
    lines.push('');
    lines.push('4. 视频生成模型 (billing_type = "second"):');
    lines.push('   - 使用字段: duration_seconds');
    lines.push('   - 计量单位: second');
    lines.push('   - 计算公式: cost = duration_seconds * unit_price');
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                      实施步骤                                 ');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('');
    lines.push('1. 创建数据库迁移文件:');
    lines.push('   - 文件: server/src/migrations/YYYYMMDD-create-ai-billing-records.ts');
    lines.push('   - 执行: npm run migrate');
    lines.push('');
    lines.push('2. 创建Sequelize模型:');
    lines.push('   - 文件: server/src/models/ai-billing-record.model.ts');
    lines.push('   - 定义枚举: BillingType, BillingStatus');
    lines.push('');
    lines.push('3. 更新AIBridge服务:');
    lines.push('   - 在 recordUsage 方法中同时创建 billing_record');
    lines.push('   - 根据 usageType 选择正确的 billing_type');
    lines.push('   - 填充对应的计量字段');
    lines.push('');
    lines.push('4. 创建计费服务:');
    lines.push('   - 文件: server/src/services/ai/ai-billing-record.service.ts');
    lines.push('   - 提供查询、统计、导出功能');
    lines.push('');

    return lines;
  }
}

// 主函数
async function main() {
  const srcDir = path.resolve(__dirname, '../src');
  const checker = new AIUsageComplianceChecker(srcDir);

  console.log('🚀 AI使用合规检查工具 v1.0\n');
  console.log(`检查目录: ${srcDir}\n`);

  // 1. 检查代码合规性
  const result = await checker.check();
  
  // 2. 检查AIBridge用量计算功能
  const aiBridgeCheckLines = checker.checkAIBridgeUsageTracking();
  
  // 3. 检查计费表结构
  const billingTableCheckLines = checker.checkBillingTableStructure();
  
  // 4. 生成新计费表建议
  const billingTableSuggestionLines = checker.generateBillingTableSuggestion();

  // 生成完整报告
  const report = [
    checker.generateReport(result),
    ...aiBridgeCheckLines,
    ...billingTableCheckLines,
    ...billingTableSuggestionLines,
  ].join('\n');

  // 输出到控制台
  console.log(report);

  // 保存到文件
  const reportPath = path.join(__dirname, '../reports/ai-compliance-report.txt');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log('');
  console.log(`📄 报告已保存到: ${reportPath}`);
  console.log('');

  // 返回退出码
  if (result.summary.high > 0) {
    console.log('❌ 发现高危问题，请立即修复！');
    process.exit(1);
  } else if (result.summary.medium > 0) {
    console.log('⚠️  发现中危问题，建议尽快修复。');
    process.exit(0);
  } else {
    console.log('✅ 所有检查通过！');
    process.exit(0);
  }
}

// 执行检查
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 检查过程中发生错误:', error);
    process.exit(1);
  });
}

export { AIUsageComplianceChecker, ComplianceIssue, CheckResult };

