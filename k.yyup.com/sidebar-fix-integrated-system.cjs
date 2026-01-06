/**
 * 侧边栏修复集成系统
 * 整合所有组件，提供统一的修复入口和协调各个子系统
 */

const SidebarFixTaskManager = require('./sidebar-fix-task-manager.cjs');
const SidebarFixProgressTracker = require('./sidebar-fix-progress-tracker.cjs');
const SidebarFixAutomatedRepair = require('./sidebar-fix-automated-repair.cjs');
const fs = require('fs');
const path = require('path');

class SidebarFixIntegratedSystem {
    constructor() {
        this.projectRoot = __dirname;
        this.reportsDir = path.join(this.projectRoot, 'sidebar-fix-reports');

        // 初始化子系统
        this.taskManager = new SidebarFixTaskManager();
        this.progressTracker = new SidebarFixProgressTracker();
        this.automatedRepair = new SidebarFixAutomatedRepair();

        // 集成状态
        this.systemState = {
            initialized: false,
            currentWorkflow: null,
            subsystems: {
                taskManager: { status: 'ready', lastActivity: null },
                progressTracker: { status: 'ready', lastActivity: null },
                automatedRepair: { status: 'ready', lastActivity: null }
            }
        };

        this.setupEventHandlers();
    }

    /**
     * 设置事件处理器，实现子系统间的通信
     */
    setupEventHandlers() {
        // 进度跟踪器事件监听
        this.progressTracker.on('phase-started', ({ phase }) => {
            this.updateSubsystemStatus('progressTracker', `running_phase_${phase}`);
            console.log(`🔄 阶段开始: ${phase}`);
        });

        this.progressTracker.on('phase-completed', ({ phase }) => {
            this.updateSubsystemStatus('progressTracker', `phase_${phase}_completed`);
            console.log(`✅ 阶段完成: ${phase}`);
        });

        this.progressTracker.on('task-completed', () => {
            this.updateSubsystemStatus('progressTracker', 'completed');
            console.log('🎉 所有阶段完成');
        });

        this.progressTracker.on('timeline-update', (event) => {
            console.log(`📝 事件记录: [${event.phase}] ${event.event}`);
        });

        // 任务管理器事件监听（如果有的话）
        // this.taskManager.on(...)
    }

    /**
     * 更新子系统状态
     */
    updateSubsystemStatus(subsystem, status) {
        if (this.systemState.subsystems[subsystem]) {
            this.systemState.subsystems[subsystem].status = status;
            this.systemState.subsystems[subsystem].lastActivity = new Date().toISOString();
        }
    }

    /**
     * 初始化系统
     */
    async initialize() {
        console.log('🚀 初始化侧边栏修复集成系统...');

        try {
            // 检查环境
            const environmentCheck = await this.checkEnvironment();
            if (!environmentCheck.success) {
                throw new Error(`环境检查失败: ${environmentCheck.issues.join(', ')}`);
            }

            // 初始化目录
            this.ensureDirectories();

            // 检查测试脚本
            const testScriptsCheck = await this.verifyTestScripts();
            if (!testScriptsCheck.success) {
                console.warn('⚠️ 部分测试脚本检查失败:', testScriptsCheck.missing);
            }

            this.systemState.initialized = true;
            console.log('✅ 系统初始化完成');

            return { success: true };
        } catch (error) {
            console.error('❌ 系统初始化失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 检查运行环境
     */
    async checkEnvironment() {
        const issues = [];

        // 检查Node.js版本
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            issues.push(`Node.js版本过低 (${nodeVersion})，需要 >= 18.0.0`);
        }

        // 检查项目结构
        const requiredDirs = ['client', 'server'];
        for (const dir of requiredDirs) {
            if (!fs.existsSync(path.join(this.projectRoot, dir))) {
                issues.push(`缺少必需目录: ${dir}`);
            }
        }

        // 检查package.json
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            issues.push('缺少根目录package.json');
        }

        return {
            success: issues.length === 0,
            issues,
            nodeVersion,
            platform: process.platform
        };
    }

    /**
     * 确保目录存在
     */
    ensureDirectories() {
        const dirs = [
            this.reportsDir,
            path.join(this.reportsDir, 'screenshots'),
            path.join(this.reportsDir, 'logs'),
            path.join(this.reportsDir, 'analysis'),
            path.join(this.reportsDir, 'fixed-files')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 创建目录: ${dir}`);
            }
        });
    }

    /**
     * 验证测试脚本
     */
    async verifyTestScripts() {
        const requiredScripts = [
            'test-centers-comprehensive.cjs',
            'test-teacher-center.cjs',
            'test-parent-center.cjs'
        ];

        const missing = [];
        const existing = [];

        for (const script of requiredScripts) {
            const scriptPath = path.join(this.projectRoot, script);
            if (fs.existsSync(scriptPath)) {
                existing.push(script);
            } else {
                missing.push(script);
            }
        }

        return {
            success: missing.length === 0,
            existing,
            missing
        };
    }

    /**
     * 执行完整的集成修复流程
     */
    async executeIntegratedWorkflow(options = {}) {
        console.log('🔧 开始执行集成修复流程...');
        console.log('=' .repeat(80));

        if (!this.systemState.initialized) {
            const initResult = await this.initialize();
            if (!initResult.success) {
                throw new Error('系统初始化失败，无法执行修复流程');
            }
        }

        this.systemState.currentWorkflow = {
            id: 'workflow-' + Date.now(),
            startTime: new Date().toISOString(),
            status: 'running',
            options
        };

        const workflowResults = {
            workflowId: this.systemState.currentWorkflow.id,
            startTime: this.systemState.currentWorkflow.startTime,
            phases: {},
            summary: {
                totalDuration: 0,
                success: false,
                errorsFixed: 0,
                errorsRemaining: 0
            }
        };

        try {
            // 集成进度跟踪器
            this.progressTracker.startTask();

            // 阶段1: 集成问题检测
            console.log('\n🔍 第一阶段：集成问题检测');
            this.updateSubsystemStatus('taskManager', 'detecting_problems');
            this.progressTracker.updatePhaseProgress('detection', 10);

            const detectionResults = await this.executeIntegratedDetection();
            workflowResults.phases.detection = detectionResults;
            this.progressTracker.updatePhaseProgress('detection', 100);

            // 阶段2: 集成错误分析
            console.log('\n📊 第二阶段：集成错误分析');
            this.updateSubsystemStatus('taskManager', 'analyzing_errors');
            this.progressTracker.updatePhaseProgress('analysis', 10);

            const analysisResults = await this.executeIntegratedAnalysis(detectionResults);
            workflowResults.phases.analysis = analysisResults;
            this.progressTracker.updatePhaseProgress('analysis', 100);

            // 检查是否有错误需要修复
            if (analysisResults.summary.totalErrors === 0) {
                console.log('🎉 未检测到需要修复的错误！');
                workflowResults.summary.success = true;
                this.progressTracker.updatePhaseProgress('fixing', 100);
                this.progressTracker.updatePhaseProgress('verification', 100);
                this.progressTracker.updatePhaseProgress('commit', 100);
            } else {
                // 阶段3: 集成自动修复
                console.log('\n🔧 第三阶段：集成自动修复');
                this.updateSubsystemStatus('automatedRepair', 'executing_repairs');
                this.progressTracker.updatePhaseProgress('fixing', 10);

                const repairResults = await this.executeIntegratedRepair(analysisResults);
                workflowResults.phases.repair = repairResults;
                workflowResults.summary.errorsFixed = repairResults.successful;
                workflowResults.summary.errorsRemaining = repairResults.failed;
                this.progressTracker.updatePhaseProgress('fixing', 100);

                // 阶段4: 集成验证
                console.log('\n✅ 第四阶段：集成验证');
                this.updateSubsystemStatus('taskManager', 'verifying_fixes');
                this.progressTracker.updatePhaseProgress('verification', 10);

                const verificationResults = await this.executeIntegratedVerification();
                workflowResults.phases.verification = verificationResults;
                workflowResults.summary.success = verificationResults.successRate === 100;
                this.progressTracker.updatePhaseProgress('verification', 100);

                // 阶段5: Git提交（如果启用）
                if (options.autoCommit !== false) {
                    console.log('\n📝 第五阶段：Git提交');
                    this.updateSubsystemStatus('taskManager', 'committing_changes');
                    this.progressTracker.updatePhaseProgress('commit', 10);

                    const commitResult = await this.executeIntegratedCommit();
                    workflowResults.phases.commit = commitResult;
                    this.progressTracker.updatePhaseProgress('commit', 100);
                } else {
                    this.progressTracker.updatePhaseProgress('commit', 100);
                }
            }

            // 完成工作流
            this.systemState.currentWorkflow.endTime = new Date().toISOString();
            this.systemState.currentWorkflow.status = 'completed';
            workflowResults.summary.totalDuration = this.calculateWorkflowDuration(workflowResults);

            // 生成集成报告
            await this.generateIntegratedReport(workflowResults);

            console.log('\n' + '=' .repeat(80));
            console.log('🎉 集成修复流程执行完成！');
            console.log(`⏱️ 总耗时: ${workflowResults.summary.totalDuration} 秒`);
            console.log(`✅ 成功状态: ${workflowResults.summary.success ? '成功' : '部分成功'}`);
            console.log(`📊 修复统计: ${workflowResults.summary.errorsFixed}/${workflowResults.summary.errorsFixed + workflowResults.summary.errorsRemaining}`);

            return workflowResults;

        } catch (error) {
            this.systemState.currentWorkflow.status = 'failed';
            this.systemState.currentWorkflow.error = error.message;

            console.error('\n❌ 集成修复流程失败:', error.message);

            // 记录错误
            const errorReport = {
                workflowId: this.systemState.currentWorkflow.id,
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
                phase: this.progressTracker.progressData.currentPhase
            };

            const errorFile = path.join(this.reportsDir, 'integrated-workflow-error.json');
            fs.writeFileSync(errorFile, JSON.stringify(errorReport, null, 2));

            throw error;
        }
    }

    /**
     * 执行集成问题检测
     */
    async executeIntegratedDetection() {
        this.progressTracker.addTimelineEvent('detection', 'integrated-detection-started');

        const detectionResults = await this.taskManager.detectProblems();

        this.progressTracker.addTimelineEvent('detection', 'integrated-detection-completed', {
            centersDetected: detectionResults.centers.success,
            teacherCenterDetected: detectionResults.teacherCenter.success,
            parentCenterDetected: detectionResults.parentCenter.success
        });

        return {
            success: true,
            results: detectionResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 执行集成错误分析
     */
    async executeIntegratedAnalysis(detectionResults) {
        this.progressTracker.addTimelineEvent('analysis', 'integrated-analysis-started');

        const analysisResults = await this.taskManager.analyzeErrors(detectionResults.results);

        // 更新进度跟踪器的错误统计
        this.progressTracker.updateErrorStatistics(analysisResults);

        this.progressTracker.addTimelineEvent('analysis', 'integrated-analysis-completed', {
            totalErrors: analysisResults.summary.totalErrors,
            errors404: analysisResults.summary.errors404,
            errors500: analysisResults.summary.errors500
        });

        return {
            success: true,
            analysis: analysisResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 执行集成自动修复
     */
    async executeIntegratedRepair(analysisResults) {
        this.progressTracker.addTimelineEvent('fixing', 'integrated-repair-started');

        // 使用自动化修复系统
        const repairPlan = this.automatedRepair.analyzeAndPlanRepairs(analysisResults.analysis);
        const repairResults = await this.automatedRepair.executeRepairs(repairPlan);

        // 更新进度跟踪器的修复统计
        this.progressTracker.updateFixStatistics(repairResults);

        this.progressTracker.addTimelineEvent('fixing', 'integrated-repair-completed', {
            totalRepairs: repairResults.total,
            successfulRepairs: repairResults.successful,
            failedRepairs: repairResults.failed
        });

        return {
            success: true,
            plan: repairPlan,
            results: repairResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 执行集成验证
     */
    async executeIntegratedVerification() {
        this.progressTracker.addTimelineEvent('verification', 'integrated-verification-started');

        const verificationResults = await this.taskManager.verifyFixes();

        this.progressTracker.addTimelineEvent('verification', 'integrated-verification-completed', {
            successRate: verificationResults.successRate,
            centersFixed: verificationResults.beforeAfter.centers.fixed,
            teacherCenterFixed: verificationResults.beforeAfter.teacherCenter.fixed,
            parentCenterFixed: verificationResults.beforeAfter.parentCenter.fixed
        });

        return {
            success: true,
            results: verificationResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 执行集成Git提交
     */
    async executeIntegratedCommit() {
        this.progressTracker.addTimelineEvent('commit', 'integrated-commit-started');

        const commitResult = await this.taskManager.commitChanges();

        this.progressTracker.addTimelineEvent('commit', 'integrated-commit-completed', {
            commitSuccessful: commitResult
        });

        return {
            success: true,
            committed: commitResult,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 计算工作流持续时间
     */
    calculateWorkflowDuration(workflowResults) {
        const start = new Date(workflowResults.startTime);
        const end = workflowResults.endTime ? new Date(workflowResults.endTime) : new Date();
        return Math.round((end - start) / 1000);
    }

    /**
     * 生成集成报告
     */
    async generateIntegratedReport(workflowResults) {
        console.log('\n📋 生成集成报告...');

        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                workflowId: workflowResults.workflowId,
                systemVersion: '1.0.0',
                subsystems: this.systemState.subsystems
            },
            workflow: workflowResults,
            systemHealth: this.getSystemHealthReport(),
            recommendations: this.generateIntegratedRecommendations(workflowResults)
        };

        const reportFile = path.join(this.reportsDir, 'integrated-report.json');
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        // 生成Markdown报告
        const markdownReport = this.generateIntegratedMarkdownReport(report);
        const markdownFile = path.join(this.reportsDir, 'integrated-report.md');
        fs.writeFileSync(markdownFile, markdownReport);

        console.log('✅ 集成报告已生成:');
        console.log(`  JSON: ${reportFile}`);
        console.log(`  Markdown: ${markdownFile}`);

        return report;
    }

    /**
     * 获取系统健康报告
     */
    getSystemHealthReport() {
        return {
            initialized: this.systemState.initialized,
            subsystems: Object.entries(this.systemState.subsystems).map(([name, info]) => ({
                name,
                status: info.status,
                lastActivity: info.lastActivity,
                healthy: ['ready', 'completed'].includes(info.status) || info.status.includes('completed')
            })),
            overall: this.systemState.initialized &&
                Object.values(this.systemState.subsystems).every(sub =>
                    ['ready', 'completed'].includes(sub.status) || sub.status.includes('completed')
                )
        };
    }

    /**
     * 生成集成建议
     */
    generateIntegratedRecommendations(workflowResults) {
        const recommendations = [];

        if (workflowResults.summary.success) {
            recommendations.push('🎉 修复流程完全成功，所有页面问题已解决');
        } else {
            recommendations.push('⚠️ 存在部分未解决的问题，建议手动检查');
        }

        if (workflowResults.summary.errorsFixed > 0) {
            recommendations.push('📈 自动修复有效，建议定期运行集成系统');
        }

        // 系统健康建议
        const systemHealth = this.getSystemHealthReport();
        if (!systemHealth.overall) {
            recommendations.push('🔧 部分子系统状态异常，建议检查系统配置');
        }

        recommendations.push('🔄 建议将集成修复系统加入CI/CD流程');
        recommendations.push('📊 定期查看报告以监控系统状态');

        return recommendations;
    }

    /**
     * 生成集成Markdown报告
     */
    generateIntegratedMarkdownReport(report) {
        const { workflow, systemHealth, recommendations } = report;

        return `# 侧边栏修复集成系统报告

## 概要信息

- **工作流ID**: ${workflow.workflowId}
- **生成时间**: ${new Date(report.metadata.generatedAt).toLocaleString()}
- **系统版本**: ${report.metadata.systemVersion}
- **总耗时**: ${workflow.summary.totalDuration} 秒
- **成功状态**: ${workflow.summary.success ? '✅ 成功' : '⚠️ 部分成功'}

## 修复统计

- **检测到的错误**: ${workflow.phases.analysis?.analysis?.summary?.totalErrors || 0}
- **修复成功的错误**: ${workflow.summary.errorsFixed}
- **剩余的错误**: ${workflow.summary.errorsRemaining}

## 系统健康状态

- **整体健康**: ${systemHealth.overall ? '✅ 良好' : '⚠️ 需要关注'}

### 子系统状态

${systemHealth.subsystems.map(sub =>
    `- **${sub.name}**: ${sub.healthy ? '✅' : '⚠️'} ${sub.status} (最后活动: ${sub.lastActivity ? new Date(sub.lastActivity).toLocaleTimeString() : '无'})`
).join('\n')}

## 工作流阶段详情

### 1. 问题检测
${workflow.phases.detection ?
    `- 状态: ✅ 完成` +
    `\n- Centers检测: ${workflow.phases.detection.results.centers.success ? '✅' : '❌'}` +
    `\n- Teacher Center检测: ${workflow.phases.detection.results.teacherCenter.success ? '✅' : '❌'}` +
    `\n- Parent Center检测: ${workflow.phases.detection.results.parentCenter.success ? '✅' : '❌'}`
    : '- 未执行'
}

### 2. 错误分析
${workflow.phases.analysis ?
    `- 状态: ✅ 完成` +
    `\n- 总错误数: ${workflow.phases.analysis.analysis.summary.totalErrors}` +
    `\n- 404错误: ${workflow.phases.analysis.analysis.summary.errors404}` +
    `\n- 500错误: ${workflow.phases.analysis.analysis.summary.errors500}`
    : '- 未执行'
}

### 3. 自动修复
${workflow.phases.repair ?
    `- 状态: ✅ 完成` +
    `\n- 修复任务数: ${workflow.phases.repair.results.total}` +
    `\n- 成功修复: ${workflow.phases.repair.results.successful}` +
    `\n- 修复失败: ${workflow.phases.repair.results.failed}`
    : '- 未执行'
}

### 4. 验证测试
${workflow.phases.verification ?
    `- 状态: ✅ 完成` +
    `\n- 成功率: ${workflow.phases.verification.results.successRate}%` +
    `\n- Centers页面: ${workflow.phases.verification.results.results.beforeAfter.centers.fixed ? '✅' : '❌'}` +
    `\n- Teacher Center页面: ${workflow.phases.verification.results.results.beforeAfter.teacherCenter.fixed ? '✅' : '❌'}` +
    `\n- Parent Center页面: ${workflow.phases.verification.results.results.beforeAfter.parentCenter.fixed ? '✅' : '❌'}`
    : '- 未执行'
}

### 5. Git提交
${workflow.phases.commit ?
    `- 状态: ✅ 完成` +
    `\n- 提交状态: ${workflow.phases.commit.committed ? '✅ 已提交' : '⏭️ 跳过'}`
    : '- 未执行'
}

## 建议

${recommendations.map(rec => `- ${rec}`).join('\n')}

## 文件位置

详细报告文件位于 \`sidebar-fix-reports/\` 目录中：
- \`integrated-report.json\` - 完整集成报告数据
- \`repair-report.json\` - 自动修复详细报告
- \`final-report.json\` - 主任务管理器报告
- \`detailed-progress.json\` - 进度跟踪详细数据
- \`integrated-workflow-error.json\` - 错误记录（如有）

---
*由侧边栏修复集成系统自动生成*
`;
    }

    /**
     * 获取系统状态
     */
    getSystemStatus() {
        return {
            initialized: this.systemState.initialized,
            currentWorkflow: this.systemState.currentWorkflow,
            subsystems: this.systemState.subsystems,
            progress: this.progressTracker.getStatusSummary()
        };
    }

    /**
     * 显示实时系统状态
     */
    displaySystemStatus() {
        console.clear();
        console.log('🔧 侧边栏修复集成系统');
        console.log('═'.repeat(80));

        const status = this.getSystemStatus();

        console.log(`📊 系统状态: ${status.initialized ? '✅ 已初始化' : '❌ 未初始化'}`);
        console.log(`🔄 当前工作流: ${status.currentWorkflow ? status.currentWorkflow.id : '无'}`);
        console.log(`⏱️ 运行时间: ${status.progress.duration} 秒`);

        console.log('\n🔧 子系统状态:');
        Object.entries(status.subsystems).forEach(([name, info]) => {
            const statusIcon = info.status.includes('completed') ? '✅' :
                              info.status.includes('running') ? '🔄' : '⏸️';
            console.log(`  ${statusIcon} ${name}: ${info.status}`);
        });

        if (status.currentWorkflow) {
            console.log('\n📋 工作流详情:');
            console.log(`  ID: ${status.currentWorkflow.id}`);
            console.log(`  开始时间: ${new Date(status.currentWorkflow.startTime).toLocaleString()}`);
            console.log(`  状态: ${status.currentWorkflow.status}`);
        }

        console.log('\n📈 进度信息:');
        console.log(`  总体进度: ${status.progress.overallProgress}%`);
        console.log(`  当前阶段: ${status.progress.phaseName} (${status.progress.phaseProgress}%)`);

        console.log('═'.repeat(80));
    }
}

// 命令行接口
if (require.main === module) {
    const system = new SidebarFixIntegratedSystem();

    const command = process.argv[2];

    switch (command) {
        case 'run':
            system.initialize().then(() => {
                return system.executeIntegratedWorkflow();
            }).then(results => {
                console.log('\n🎉 集成修复流程完成！');
                console.log(`📊 结果: ${results.summary.success ? '成功' : '部分成功'}`);
            }).catch(error => {
                console.error('\n❌ 执行失败:', error.message);
                process.exit(1);
            });
            break;
        case 'status':
            system.displaySystemStatus();
            break;
        case 'monitor':
            const monitor = setInterval(() => {
                system.displaySystemStatus();
            }, 3000);

            console.log('📺 开始实时监控... (按 Ctrl+C 退出)');

            process.on('SIGINT', () => {
                clearInterval(monitor);
                console.log('\n👋 监控已停止');
                process.exit(0);
            });
            break;
        case 'init':
            system.initialize().then(result => {
                if (result.success) {
                    console.log('✅ 系统初始化完成');
                } else {
                    console.error('❌ 系统初始化失败:', result.error);
                    process.exit(1);
                }
            });
            break;
        default:
            console.log('侧边栏修复集成系统');
            console.log('');
            console.log('用法:');
            console.log('  node sidebar-fix-integrated-system.cjs run     - 执行完整集成修复流程');
            console.log('  node sidebar-fix-integrated-system.cjs status  - 显示系统状态');
            console.log('  node sidebar-fix-integrated-system.cjs monitor - 实时监控系统状态');
            console.log('  node sidebar-fix-integrated-system.cjs init    - 初始化系统');
            console.log('');
            console.log('集成系统包含以下子系统:');
            console.log('  🔧 任务管理器 - 协调整个修复流程');
            console.log('  📊 进度跟踪器 - 实时跟踪修复进度');
            console.log('  🤖 自动修复器 - 智能检测和修复错误');
            console.log('');
            console.log('完整修复流程:');
            console.log('  1️⃣ 环境检查和系统初始化');
            console.log('  2️⃣ 集成问题检测');
            console.log('  3️⃣ 集成错误分析');
            console.log('  4️⃣ 集成自动修复');
            console.log('  5️⃣ 集成验证测试');
            console.log('  6️⃣ Git提交更改');
            console.log('  7️⃣ 生成综合报告');
    }
}

module.exports = SidebarFixIntegratedSystem;