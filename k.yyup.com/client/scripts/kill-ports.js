#!/usr/bin/env node

import { exec } from 'child_process';
import os from 'os';

// 前端端口清理脚本 (跨平台版本)
// 清理可能占用的前端端口：5173 和 6000

console.log('🔍 检查前端端口占用情况...');

const FRONTEND_PORTS = [5173, 6000];
const isWindows = os.platform() === 'win32';

function killPortProcess(port) {
    return new Promise((resolve) => {
        let command;
        
        if (isWindows) {
            // Windows 命令
            command = `netstat -ano | findstr ":${port} "`;
        } else {
            // Linux/Mac 命令 - 🔧 使用lsof更可靠
            command = `lsof -ti:${port}`;
        }
        
        exec(command, (error, stdout) => {
            if (error || !stdout.trim()) {
                console.log(`✅ 端口 ${port} 未被占用`);
                resolve();
                return;
            }
            
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            
            if (isWindows) {
                lines.forEach(line => {
                    // Windows: 最后一列是PID
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0') {
                        pids.add(pid);
                    }
                });
            } else {
                // Linux/Mac: lsof -ti 直接返回PID列表
                lines.forEach(line => {
                    const pid = line.trim();
                    if (pid && /^\d+$/.test(pid)) {
                        pids.add(pid);
                    }
                });
            }
            
            if (pids.size === 0) {
                console.log(`✅ 端口 ${port} 未被占用`);
                resolve();
                return;
            }
            
            console.log(`⚠️  端口 ${port} 被进程占用: ${Array.from(pids).join(', ')}`);
            
            // 杀死所有相关进程
            const killPromises = Array.from(pids).map(pid => {
                return new Promise((killResolve) => {
                    const killCommand = isWindows 
                        ? `taskkill /f /pid ${pid}`
                        : `kill -9 ${pid}`;
                    
                    console.log(`🔥 正在杀死进程 ${pid}...`);
                    
                    exec(killCommand, (killError) => {
                        if (killError) {
                            console.log(`❌ 无法杀死进程 ${pid}: ${killError.message}`);
                        } else {
                            console.log(`✅ 进程 ${pid} 已被杀死`);
                        }
                        killResolve();
                    });
                });
            });
            
            Promise.all(killPromises).then(() => {
                // 🔧 增加等待时间，确保端口完全释放
                setTimeout(() => {
                    exec(command, (recheckError, recheckStdout) => {
                        if (recheckError || !recheckStdout.trim()) {
                            console.log(`✅ 端口 ${port} 已释放`);
                        } else {
                            console.log(`❌ 端口 ${port} 仍被占用，可能需要手动处理`);
                        }
                        resolve();
                    });
                }, 2000);  // 🔧 从1秒增加到2秒
            });
        });
    });
}

async function main() {
    for (const port of FRONTEND_PORTS) {
        console.log(`\n检查端口 ${port}...`);
        await killPortProcess(port);
    }
    
    console.log('\n🎯 前端端口清理完成！');
}

main().catch(console.error);
