/**
 * 侧边栏修复进度跟踪器
 * 提供详细的进度跟踪、状态管理和实时报告功能
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class SidebarFixProgressTracker extends EventEmitter {
    constructor() {
        super();
        this.projectRoot = __dirname;
        this.reportsDir = path.join(this.projectRoot, 'sidebar-fix-reports');
        this.progressFile = path.join(this.reportsDir, 'detailed-progress.json');
        this.historyFile = path.join(this.reportsDir, 'progress-history.json');

        // 进度数据结构
        this.progressData = {
            taskId: 'sidebar-fix-' + Date.now(),
            startTime: null,
            endTime: null,
            currentPhase: 'idle',
            overallProgress: 0,
            phases: {
                detection: {
                    name: '问题检测',
                    status: 'pending',
                    progress: 0,
                    startTime: null,
                    endTime: null,
                    details: {}
                },
                analysis: {
                    name: '错误分析',
                    status: 'pending',
                    progress: 0,
                    startTime: null,
                    endTime: null,
                    details: {}
                },
                fixing: {
                    name: '执行修复',
                    status: 'pending',
                    progress: 0,
                    startTime: null,
                    endTime: null,
                    details: {}
                },
                verification: {
                    name: '验证结果',
                    status: 'pending',
                    progress: 0,
                    startTime: null,
                    endTime: null,
                    details: {}
                },
                commit: {
                    name: '提交更改',
                    status: 'pending',
                    progress: 0,
                    startTime: null,
                    endTime: null,
                    details: {}
                }
            },
            statistics: {
                totalErrors: 0,
                errorsFixed: 0,
                errorsRemaining: 0,
                errorsByType: {
                    '404': 0,
                    '500': 0,
                    'other': 0
                },
                errorsByCategory: {
                    centers: 0,
                    'teacher-center': 0,
                    'parent-center': 0
                }
            },
            timeline: []
        };

        this.initializeDirectories();
        this.loadProgress();

        // 开始定期保存
        this.startAutoSave();
    }

    /**
     * 初始化目录
     */
    initializeDirectories() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    /**
     * 加载进度数据
     */
    loadProgress() {
        try {
            if (fs.existsSync(this.progressFile)) {
                const savedData = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
                this.progressData = { ...this.progressData, ...savedData };
                console.log('✅ 进度跟踪器已加载保存的进度');
            }
        } catch (error) {
            console.log('⚠️ 无法加载进度数据，使用初始配置');
        }
    }

    /**
     * 保存进度数据
     */
    saveProgress() {
        try {
            fs.writeFileSync(this.progressFile, JSON.stringify(this.progressData, null, 2));
            this.emit('progress-saved', this.progressData);
        } catch (error) {
            console.error('❌ 保存进度失败:', error.message);
        }
    }

    /**
     * 开始自动保存
     */
    startAutoSave() {
        setInterval(() => {
            this.saveProgress();
        }, 30000); // 每30秒自动保存一次
    }

    /**
     * 添加时间线事件
     */
    addTimelineEvent(phase, event, details = {}) {
        const timelineEvent = {
            timestamp: new Date().toISOString(),
            phase,
            event,
            details
        };

        this.progressData.timeline.push(timelineEvent);
        this.emit('timeline-update', timelineEvent);
    }

    /**
     * 开始任务
     */
    startTask() {
        this.progressData.startTime = new Date().toISOString();
        this.progressData.currentPhase = 'detection';
        this.progressData.phases.detection.status = 'running';
        this.progressData.phases.detection.startTime = new Date().toISOString();

        this.addTimelineEvent('detection', 'task-started', {
            taskId: this.progressData.taskId
        });

        this.saveProgress();
        this.emit('task-started', this.progressData);

        console.log('🚀 侧边栏修复任务已开始');
    }

    /**
     * 更新阶段进度
     */
    updatePhaseProgress(phase, progress, details = {}) {
        if (!this.progressData.phases[phase]) {
            console.error(`❌ 未知阶段: ${phase}`);
            return;
        }

        const phaseData = this.progressData.phases[phase];
        phaseData.progress = Math.min(100, Math.max(0, progress));

        // 更新阶段详情
        if (details) {
            phaseData.details = { ...phaseData.details, ...details };
        }

        // 更新总体进度
        this.calculateOverallProgress();

        // 添加时间线事件
        this.addTimelineEvent(phase, 'progress-update', {
            progress: phaseData.progress,
            details
        });

        this.saveProgress();
        this.emit('phase-progress-updated', {
            phase,
            progress: phaseData.progress,
            overall: this.progressData.overallProgress
        });

        // 如果阶段完成，自动进入下一阶段
        if (phaseData.progress >= 100) {
            this.completePhase(phase);
        }
    }

    /**
     * 完成阶段
     */
    completePhase(phase) {
        if (!this.progressData.phases[phase]) {
            console.error(`❌ 未知阶段: ${phase}`);
            return;
        }

        const phaseData = this.progressData.phases[phase];
        phaseData.status = 'completed';
        phaseData.progress = 100;
        phaseData.endTime = new Date().toISOString();

        this.addTimelineEvent(phase, 'phase-completed', {
            duration: this.calculatePhaseDuration(phase)
        });

        // 自动进入下一阶段
        const phases = Object.keys(this.progressData.phases);
        const currentIndex = phases.indexOf(phase);
        if (currentIndex < phases.length - 1) {
            const nextPhase = phases[currentIndex + 1];
            this.startPhase(nextPhase);
        } else {
            // 最后一个阶段完成，任务完成
            this.completeTask();
        }

        this.saveProgress();
        this.emit('phase-completed', { phase, phaseData });
    }

    /**
     * 开始阶段
     */
    startPhase(phase) {
        if (!this.progressData.phases[phase]) {
            console.error(`❌ 未知阶段: ${phase}`);
            return;
        }

        const phaseData = this.progressData.phases[phase];
        phaseData.status = 'running';
        phaseData.startTime = new Date().toISOString();
        this.progressData.currentPhase = phase;

        this.addTimelineEvent(phase, 'phase-started', {
            phaseName: phaseData.name
        });

        this.saveProgress();
        this.emit('phase-started', { phase, phaseData });

        console.log(`🔄 开始阶段: ${phaseData.name}`);
    }

    /**
     * 计算总体进度
     */
    calculateOverallProgress() {
        const phases = Object.values(this.progressData.phases);
        const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
        this.progressData.overallProgress = Math.round(totalProgress / phases.length);
    }

    /**
     * 计算阶段持续时间
     */
    calculatePhaseDuration(phase) {
        const phaseData = this.progressData.phases[phase];
        if (!phaseData.startTime) return 0;

        const start = new Date(phaseData.startTime);
        const end = phaseData.endTime ? new Date(phaseData.endTime) : new Date();
        return Math.round((end - start) / 1000); // 返回秒数
    }

    /**
     * 更新错误统计
     */
    updateErrorStatistics(errorAnalysis) {
        if (!errorAnalysis || !errorAnalysis.summary) return;

        const summary = errorAnalysis.summary;
        this.progressData.statistics.totalErrors = summary.totalErrors;
        this.progressData.statistics.errorsByType = {
            '404': summary.errors404,
            '500': summary.errors500,
            'other': summary.otherErrors
        };

        // 按类别统计错误
        if (errorAnalysis.details) {
            Object.entries(errorAnalysis.details).forEach(([category, details]) => {
                this.progressData.statistics.errorsByCategory[category] = details.errors.length;
            });
        }

        this.addTimelineEvent('analysis', 'error-statistics-updated', {
            totalErrors: this.progressData.statistics.totalErrors,
            errorsByType: this.progressData.statistics.errorsByType,
            errorsByCategory: this.progressData.statistics.errorsByCategory
        });

        this.saveProgress();
        this.emit('error-statistics-updated', this.progressData.statistics);
    }

    /**
     * 更新修复统计
     */
    updateFixStatistics(fixResults) {
        if (!fixResults) return;

        this.progressData.statistics.errorsFixed = fixResults.fixesApplied.length;
        this.progressData.statistics.errorsRemaining = fixResults.failures.length;

        this.addTimelineEvent('fixing', 'fix-statistics-updated', {
            fixesApplied: fixResults.fixesApplied.length,
            failures: fixResults.failures.length
        });

        this.saveProgress();
        this.emit('fix-statistics-updated', this.progressData.statistics);
    }

    /**
     * 完成任务
     */
    completeTask() {
        this.progressData.endTime = new Date().toISOString();
        this.progressData.currentPhase = 'completed';

        // 标记所有未完成的阶段为完成
        Object.values(this.progressData.phases).forEach(phase => {
            if (phase.status === 'running') {
                phase.status = 'completed';
                phase.endTime = this.progressData.endTime;
                phase.progress = 100;
            }
        });

        this.progressData.overallProgress = 100;

        this.addTimelineEvent('task', 'task-completed', {
            duration: this.calculateTaskDuration(),
            finalStatistics: this.progressData.statistics
        });

        this.saveProgress();
        this.emit('task-completed', this.progressData);

        // 保存到历史记录
        this.saveToHistory();

        console.log('🎉 侧边栏修复任务已完成！');
        console.log(`⏱️ 总耗时: ${this.calculateTaskDuration()} 秒`);
    }

    /**
     * 计算任务总耗时
     */
    calculateTaskDuration() {
        if (!this.progressData.startTime) return 0;

        const start = new Date(this.progressData.startTime);
        const end = this.progressData.endTime ? new Date(this.progressData.endTime) : new Date();
        return Math.round((end - start) / 1000);
    }

    /**
     * 保存到历史记录
     */
    saveToHistory() {
        try {
            let history = [];

            if (fs.existsSync(this.historyFile)) {
                history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            }

            // 添加历史记录（保留最近10条）
            const historyRecord = {
                taskId: this.progressData.taskId,
                startTime: this.progressData.startTime,
                endTime: this.progressData.endTime,
                duration: this.calculateTaskDuration(),
                finalProgress: this.progressData.overallProgress,
                finalStatistics: this.progressData.statistics,
                success: this.progressData.statistics.errorsRemaining === 0
            };

            history.unshift(historyRecord);
            history = history.slice(0, 10); // 只保留最近10条

            fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error('❌ 保存历史记录失败:', error.message);
        }
    }

    /**
     * 获取当前状态摘要
     */
    getStatusSummary() {
        const currentPhase = this.progressData.phases[this.progressData.currentPhase];

        return {
            taskId: this.progressData.taskId,
            currentPhase: this.progressData.currentPhase,
            phaseName: currentPhase ? currentPhase.name : '未知',
            overallProgress: this.progressData.overallProgress,
            phaseProgress: currentPhase ? currentPhase.progress : 0,
            status: this.progressData.endTime ? 'completed' : 'running',
            statistics: this.progressData.statistics,
            duration: this.calculateTaskDuration()
        };
    }

    /**
     * 生成进度报告
     */
    generateProgressReport() {
        const summary = this.getStatusSummary();
        const phases = Object.entries(this.progressData.phases).map(([key, phase]) => ({
            key,
            name: phase.name,
            status: phase.status,
            progress: phase.progress,
            duration: this.calculatePhaseDuration(key)
        }));

        return {
            summary,
            phases,
            timeline: this.progressData.timeline.slice(-10), // 最近10条事件
            statistics: this.progressData.statistics
        };
    }

    /**
     * 显示实时进度
     */
    displayProgress() {
        console.clear();
        console.log('🔧 侧边栏修复进度跟踪器');
        console.log('═'.repeat(60));

        const summary = this.getStatusSummary();

        console.log(`📊 总体进度: ${summary.overallProgress}%`);
        console.log(`🔄 当前阶段: ${summary.phaseName} (${summary.phaseProgress}%)`);
        console.log(`⏱️ 运行时间: ${summary.duration} 秒`);
        console.log(`📝 状态: ${summary.status}`);

        console.log('\n📈 阶段详情:');
        Object.entries(this.progressData.phases).forEach(([key, phase]) => {
            const statusIcon = this.getStatusIcon(phase.status);
            const progressBar = this.getProgressBar(phase.progress);
            console.log(`  ${statusIcon} ${phase.name}: ${progressBar} ${phase.progress}%`);
        });

        console.log('\n📊 错误统计:');
        console.log(`  总错误: ${summary.statistics.totalErrors}`);
        console.log(`  已修复: ${summary.statistics.errorsFixed}`);
        console.log(`  剩余: ${summary.statistics.errorsRemaining}`);

        console.log('\n⏰ 最近事件:');
        const recentEvents = this.progressData.timeline.slice(-3);
        recentEvents.forEach(event => {
            const time = new Date(event.timestamp).toLocaleTimeString();
            console.log(`  ${time} - ${event.event} (${event.phase})`);
        });

        console.log('═'.repeat(60));
    }

    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
        const icons = {
            'pending': '⏸️',
            'running': '🔄',
            'completed': '✅',
            'failed': '❌'
        };
        return icons[status] || '❓';
    }

    /**
     * 获取进度条
     */
    getProgressBar(progress, width = 20) {
        const filled = Math.round((progress / 100) * width);
        const empty = width - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    /**
     * 开始实时监控
     */
    startLiveMonitoring(intervalMs = 2000) {
        console.log('📺 开始实时进度监控...');

        const monitor = setInterval(() => {
            this.displayProgress();

            // 如果任务完成，停止监控
            if (this.progressData.endTime) {
                clearInterval(monitor);
                console.log('\n🎉 监控完成，任务已结束');
            }
        }, intervalMs);

        // 监听进度更新事件
        this.on('phase-progress-updated', () => {
            this.displayProgress();
        });

        this.on('phase-completed', ({ phase }) => {
            console.log(`\n✅ 阶段完成: ${this.progressData.phases[phase].name}`);
        });

        this.on('task-completed', () => {
            clearInterval(monitor);
            this.displayProgress();
        });

        return monitor;
    }
}

// 如果直接运行此文件，启动监控
if (require.main === module) {
    const tracker = new SidebarFixProgressTracker();

    const command = process.argv[2];

    switch (command) {
        case 'monitor':
            tracker.startLiveMonitoring();
            break;
        case 'status':
            console.log('当前状态:', JSON.stringify(tracker.getStatusSummary(), null, 2));
            break;
        case 'report':
            console.log('进度报告:', JSON.stringify(tracker.generateProgressReport(), null, 2));
            break;
        default:
            console.log('侧边栏修复进度跟踪器');
            console.log('');
            console.log('用法:');
            console.log('  node sidebar-fix-progress-tracker.cjs monitor - 开始实时监控');
            console.log('  node sidebar-fix-progress-tracker.cjs status  - 显示当前状态');
            console.log('  node sidebar-fix-progress-tracker.cjs report  - 生成进度报告');
    }
}

module.exports = SidebarFixProgressTracker;