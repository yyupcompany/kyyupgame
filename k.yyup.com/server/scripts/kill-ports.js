#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

// 后端端口清理脚本 (跨平台版本)
// 清理可能占用的后端端口：3000, 3001, 3003

console.log('🔍 检查后端端口占用情况...');

const BACKEND_PORTS = [3000, 3001, 3003];
const isWindows = os.platform() === 'win32';

function killPortProcess(port) {
    return new Promise((resolve) => {
        let command;
        
        if (isWindows) {
            // Windows 命令
            command = `netstat -ano | findstr ":${port} "`;
        } else {
            // Linux/Mac 命令 - 使用 lsof
            command = `lsof -t -i:${port}`;
        }
        
        exec(command, (error, stdout) => {
            if (error || !stdout.trim()) {
                console.log(`✅ 端口 ${port} 未被占用`);
                resolve();
                return;
            }
            
            const pids = new Set();
            
            if (isWindows) {
                // Windows: 从 netstat 输出解析 PID
                const lines = stdout.trim().split('\n');
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0') {
                        pids.add(pid);
                    }
                });
            } else {
                // Linux/Mac: lsof 直接返回 PID
                const lines = stdout.trim().split('\n');
                lines.forEach(line => {
                    const pid = line.trim();
                    if (pid && pid !== '0') {
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
            
            // 获取进程详细信息
            Array.from(pids).forEach(pid => {
                const infoCommand = isWindows 
                    ? `tasklist /fi "pid eq ${pid}" /fo table /nh`
                    : `ps -p ${pid} -o pid,ppid,cmd --no-headers`;
                
                exec(infoCommand, (infoError, infoStdout) => {
                    if (!infoError && infoStdout.trim()) {
                        console.log(`进程信息 ${pid}: ${infoStdout.trim()}`);
                    }
                });
            });
            
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
                // 等待一下再检查
                setTimeout(() => {
                    exec(command, (recheckError, recheckStdout) => {
                        if (recheckError || !recheckStdout.trim()) {
                            console.log(`✅ 端口 ${port} 已释放`);
                        } else {
                            console.log(`❌ 端口 ${port} 仍被占用，可能需要手动处理`);
                        }
                        resolve();
                    });
                }, 1000);
            });
        });
    });
}

async function main() {
    for (const port of BACKEND_PORTS) {
        console.log(`\n检查端口 ${port}...`);
        await killPortProcess(port);
    }
    
    console.log('\n🎯 后端端口清理完成！');
}

main().catch(console.error);
