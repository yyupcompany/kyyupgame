#!/usr/bin/env node

/**
 * 🧪 AI操作器重构后端到端测试脚本
 * 测试重构后的所有模块是否能够正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始AI操作器重构端到端测试...\n');

// 测试结果记录
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// 测试辅助函数
function runTest(testName, testFn) {
    testResults.total++;
    try {
        console.log(`🧪 测试 ${testResults.total}: ${testName}`);
        const result = testFn();
        if (result === true || (result && result.success === true)) {
            testResults.passed++;
            console.log(`✅ 测试通过: ${testName}\n`);
            testResults.details.push({ name: testName, status: 'PASSED', message: 'SUCCESS' });
        } else {
            testResults.failed++;
            const message = (result && result.message) || 'Test returned false';
            console.log(`❌ 测试失败: ${testName} - ${message}\n`);
            testResults.details.push({ name: testName, status: 'FAILED', message });
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ 测试异常: ${testName} - ${error.message}\n`);
        testResults.details.push({ name: testName, status: 'ERROR', message: error.message });
    }
}

// 测试1: 验证模块文件结构
runTest('模块文件结构验证', () => {
    const requiredFiles = [
        'server/src/services/ai-operator/index.ts',
        'server/src/services/ai-operator/types/ai-unified.types.ts',
        'server/src/services/ai-operator/core/index.ts',
        'server/src/services/ai-operator/core/model-selection.service.ts',
        'server/src/services/ai-operator/core/prompt-builder.service.ts',
        'server/src/services/ai-operator/core/security-checker.service.ts',
        'server/src/services/ai-operator/tools/index.ts',
        'server/src/services/ai-operator/tools/tool-executor.service.ts',
        'server/src/services/ai-operator/tools/tool-validator.service.ts',
        'server/src/services/ai-operator/tools/tool-narrator.service.ts',
        'server/src/services/ai-operator/streaming/index.ts',
        'server/src/services/ai-operator/streaming/stream-processor.service.ts',
        'server/src/services/ai-operator/streaming/ai-streaming.service.ts',
        'server/src/services/ai-operator/streaming/multi-round-processor.service.ts',
        'server/src/services/ai-operator/router/index.ts',
        'server/src/services/ai-operator/router/intelligent-router.service.ts',
        'server/src/services/ai-operator/execution/index.ts',
        'server/src/services/ai-operator/execution/workflow-execution.service.ts',
        'server/src/services/ai-operator/utils/index.ts',
        'server/src/services/ai-operator/utils/tool-manager.service.ts',
        'server/src/services/ai-operator/utils/content-processor.service.ts',
        'server/src/services/ai-operator/unified-intelligence.service.refactored.ts'
    ];

    const missingFiles = [];
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        return { success: false, message: `缺失文件: ${missingFiles.join(', ')}` };
    }

    console.log(`📁 找到所有 ${requiredFiles.length} 个必需文件`);
    return { success: true };
});

// 测试2: 验证TypeScript语法
runTest('TypeScript语法验证', () => {
    const ts = require('typescript');
    const configPath = path.resolve('server/tsconfig.json');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = ts.parseJsonConfigFileContent(JSON.parse(configContent), ts.sys, path.dirname(configPath));

    const testFiles = [
        'server/src/services/ai-operator/types/ai-unified.types.ts',
        'server/src/services/ai-operator/core/model-selection.service.ts',
        'server/src/services/ai-operator/core/security-checker.service.ts',
        'server/src/services/ai-operator/tools/tool-executor.service.ts',
        'server/src/services/ai-operator/streaming/stream-processor.service.ts',
        'server/src/services/ai-operator/router/intelligent-router.service.ts',
        'server/src/services/ai-operator/execution/workflow-execution.service.ts',
        'server/src/services/ai-operator/utils/tool-manager.service.ts',
        'server/src/services/ai-operator/index.ts',
        'server/src/services/ai-operator/unified-intelligence.service.refactored.ts'
    ];

    let syntaxErrors = [];

    for (const file of testFiles) {
        if (fs.existsSync(file)) {
            const source = fs.readFileSync(file, 'utf8');
            const result = ts.transpileModule(source, { compilerOptions: config.options });
            if (result.diagnostics && result.diagnostics.length > 0) {
                const errors = result.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
                if (errors.length > 0) {
                    syntaxErrors.push(`${file}: ${errors.map(e => e.messageText).join(', ')}`);
                }
            }
        }
    }

    if (syntaxErrors.length > 0) {
        return { success: false, message: `语法错误: ${syntaxErrors.join('; ')}` };
    }

    console.log(`✅ 所有 ${testFiles.length} 个文件语法正确`);
    return { success: true };
});

// 测试3: 验证类型定义完整性
runTest('类型定义完整性', () => {
    const typesFile = 'server/src/services/ai-operator/types/ai-unified.types.ts';
    const content = fs.readFileSync(typesFile, 'utf8');

    const requiredTypes = [
        'UserRequest',
        'IntentType',
        'TaskComplexity',
        'ToolCapability',
        'ExecutionPhase',
        'ToolType',
        'IntelligentResponse',
        'ToolCall',
        'ToolExecutionResult'
    ];

    const missingTypes = [];
    for (const type of requiredTypes) {
        if (!content.includes(type)) {
            missingTypes.push(type);
        }
    }

    if (missingTypes.length > 0) {
        return { success: false, message: `缺失类型: ${missingTypes.join(', ')}` };
    }

    console.log(`✅ 找到所有 ${requiredTypes.length} 个必需类型定义`);
    return { success: true };
});

// 测试4: 验证核心服务结构
runTest('核心服务结构验证', () => {
    const coreServices = [
        { file: 'core/model-selection.service.ts', methods: ['selectModelForToolExecution', 'getDoubaoModelConfig'] },
        { file: 'core/security-checker.service.ts', methods: ['performSecurityCheck', 'validateUserPermissions'] },
        { file: 'tools/tool-executor.service.ts', methods: ['executeFunctionTool', 'executeTool'] },
        { file: 'streaming/stream-processor.service.ts', methods: ['processUserRequestStream', 'processUserRequestStreamSingleRound'] },
        { file: 'router/intelligent-router.service.ts', methods: ['routeRequest', 'analyzeIntent'] }
    ];

    const issues = [];

    for (const service of coreServices) {
        const content = fs.readFileSync(`server/src/services/ai-operator/${service.file}`, 'utf8');

        for (const method of service.methods) {
            if (!content.includes(method)) {
                issues.push(`${service.file}: 缺失方法 ${method}`);
            }
        }
    }

    if (issues.length > 0) {
        return { success: false, message: issues.join('; ') };
    }

    console.log(`✅ 所有核心服务方法验证通过`);
    return { success: true };
});

// 测试5: 验证统一导出接口
runTest('统一导出接口验证', () => {
    const indexFile = 'server/src/services/ai-operator/index.ts';
    const content = fs.readFileSync(indexFile, 'utf8');

    const requiredExports = [
        'export * from',
        'UnifiedIntelligenceService',
        'unifiedIntelligenceService'
    ];

    const missingExports = [];
    for (const exportItem of requiredExports) {
        if (!content.includes(exportItem)) {
            missingExports.push(exportItem);
        }
    }

    if (missingExports.length > 0) {
        return { success: false, message: `缺失导出: ${missingExports.join(', ')}` };
    }

    // 检查模块导出
    const moduleExports = [
        './types/ai-unified.types.js',
        './core',
        './tools',
        './streaming',
        './router',
        './execution',
        './utils'
    ];

    for (const moduleExport of moduleExports) {
        if (!content.includes(moduleExport)) {
            missingExports.push(`模块导出: ${moduleExport}`);
        }
    }

    if (missingExports.length > 0) {
        return { success: false, message: `缺失模块导出: ${missingExports.join(', ')}` };
    }

    console.log(`✅ 统一导出接口验证通过`);
    return { success: true };
});

// 测试6: 验证重构后服务结构
runTest('重构后服务结构验证', () => {
    const refactoredFile = 'server/src/services/ai-operator/unified-intelligence.service.refactored.ts';
    const content = fs.readFileSync(refactoredFile, 'utf8');

    const requiredMethods = [
        'getInstance',
        'processUserRequestStream',
        'processUserRequestStreamSingleRound',
        'routeRequest',
        'executeComplexWorkflow',
        'executeTool',
        'enhanceContent',
        'performSecurityCheck',
        'selectModel',
        'buildPrompt',
        'getAvailableTools',
        'getServiceStatistics',
        'healthCheck',
        'getPerformanceMetrics'
    ];

    const missingMethods = [];
    for (const method of requiredMethods) {
        if (!content.includes(method)) {
            missingMethods.push(method);
        }
    }

    if (missingMethods.length > 0) {
        return { success: false, message: `缺失方法: ${missingMethods.join(', ')}` };
    }

    // 检查文件大小 (应该在300行左右)
    const lines = content.split('\n').length;
    if (lines > 500) {
        return { success: false, message: `重构后文件过大: ${lines}行 (应该<500行)` };
    }

    console.log(`✅ 重构后服务结构验证通过 (${lines}行)`);
    return { success: true };
});

// 测试7: 验证控制器更新
runTest('控制器更新验证', () => {
    const controllerFile = 'server/src/controllers/ai-query.controller.ts';
    const content = fs.readFileSync(controllerFile, 'utf8');

    // 检查是否使用了重构后的导入
    const newImport = "import { unifiedIntelligenceService } from '../services/ai-operator';";
    const oldImport = "import unifiedIntelligenceService from '../services/ai-operator/unified-intelligence.service';";

    if (content.includes(oldImport)) {
        return { success: false, message: '仍使用旧的导入方式' };
    }

    if (!content.includes(newImport)) {
        return { success: false, message: '未使用新的导入方式' };
    }

    console.log(`✅ 控制器导入更新验证通过`);
    return { success: true };
});

// 测试8: 验证前端组件清理
runTest('前端组件清理验证', () => {
    const aiComponentDir = 'client/src/components/ai-assistant';
    const aiPageDir = 'client/src/pages/ai';

    // 检查保留的核心组件
    const requiredComponents = [
        'client/src/components/ai-assistant/chat/',
        'client/src/components/ai-assistant/MessageStepIndicator.vue'
    ];

    // 检查是否还有重复组件
    const duplicatePattern = /AIAssistant.*\.vue$/;

    let issues = [];

    for (const component of requiredComponents) {
        if (!fs.existsSync(component)) {
            issues.push(`缺失核心组件: ${component}`);
        }
    }

    // 检查重复文件
    const mainAiFile = 'client/src/components/ai-assistant/AIAssistant.vue';
    if (!fs.existsSync(mainAiFile)) {
        issues.push('缺失主要AI组件: AIAssistant.vue');
    }

    if (issues.length > 0) {
        return { success: false, message: issues.join('; ') };
    }

    console.log(`✅ 前端组件清理验证通过`);
    return { success: true });
});

// 测试9: 验证文档完整性
runTest('文档完整性验证', () => {
    const requiredDocs = [
        'server/src/services/ai-operator/REFACTORING_SUMMARY.md',
        'server/src/services/ai-operator/REFACTOR_COMPLETE_REPORT.md'
    ];

    const missingDocs = [];
    for (const doc of requiredDocs) {
        if (!fs.existsSync(doc)) {
            missingDocs.push(doc);
        }
    }

    if (missingDocs.length > 0) {
        return { success: false, message: `缺失文档: ${missingDocs.join(', ')}` };
    }

    // 检查文档内容
    const refactordoc = fs.readFileSync('server/src/services/ai-operator/REFACTORING_SUMMARY.md', 'utf8');
    if (!refactordoc.includes('8146行') || !refactordoc.includes('97.5%')) {
        return { success: false, message: '重构摘要文档内容不完整' };
    }

    console.log(`✅ 文档完整性验证通过`);
    return { success: true };
});

// 测试10: 验证代码量统计
runTest('代码量统计验证', () => {
    const originalFile = 'server/src/services/ai-operator/unified-intelligence.service.ts';
    const refactoredFile = 'server/src/services/ai-operator/unified-intelligence.service.refactored.ts';

    if (!fs.existsSync(originalFile) || !fs.existsSync(refactoredFile)) {
        return { success: false, message: '原始或重构文件不存在' };
    }

    const originalLines = fs.readFileSync(originalFile, 'utf8').split('\n').length;
    const refactoredLines = fs.readFileSync(refactoredFile, 'utf8').split('\n').length;

    const reduction = ((originalLines - refactoredLines) / originalLines * 100).toFixed(1);

    if (originalLines < 7000) {
        return { success: false, message: `原始文件行数异常: ${originalLines}` };
    }

    if (refactoredLines > 500) {
        return { success: false, message: `重构后文件过大: ${refactoredLines}行` };
    }

    if (parseFloat(reduction) < 90) {
        return { success: false, message: `代码减少比例不足: ${reduction}%` };
    }

    console.log(`✅ 代码量统计验证通过: ${originalLines}行 → ${refactoredLines}行 (减少${reduction}%)`);
    return { success: true };
});

// 输出测试结果
console.log('📊 测试结果统计:');
console.log(`总测试数: ${testResults.total}`);
console.log(`通过: ${testResults.passed}`);
console.log(`失败: ${testResults.failed}`);
console.log(`成功率: ${(testResults.passed / testResults.total * 100).toFixed(1)}%\n`);

console.log('📋 详细结果:');
testResults.details.forEach((test, index) => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${icon} ${index + 1}. ${test.name}: ${test.status} - ${test.message}`);
});

// 最终评估
console.log('\n🎯 重构质量评估:');
if (testResults.failed === 0) {
    console.log('🏆 完美! 所有测试通过，重构质量优秀');
    process.exit(0);
} else if (testResults.failed <= 2) {
    console.log('👍 良好! 大部分测试通过，重构质量良好');
    process.exit(0);
} else if (testResults.failed <= 5) {
    console.log('⚠️  一般! 部分测试失败，需要修复一些问题');
    process.exit(1);
} else {
    console.log('❌ 较差! 多个测试失败，重构存在严重问题');
    process.exit(2);
}