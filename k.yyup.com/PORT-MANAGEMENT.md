# 端口管理和自动清理说明

## 概述

为了解决外网域名绑定端口的问题，我们已经在前后端的 `npm run dev` 脚本中添加了自动端口检测和清理功能。

## 端口配置

### 前端端口
- **主要端口**: 5173 (用于 localhost:5173 绑定)
- **清理端口**: 5173, 6000 (清理历史端口冲突)

### 后端端口
- **主要端口**: 3000 (用于 ezavkrybovpo.sealoshzh.site 绑定)
- **清理端口**: 3000, 3001, 3003 (清理端口冲突)

## 自动清理机制

### 前端清理 (`client/scripts/kill-ports.sh`)
- 检测并杀死占用端口 5173 和 6000 的进程
- 在每次运行 `npm run dev` 前自动执行

### 后端清理 (`server/scripts/kill-ports.sh`)
- 检测并杀死占用端口 3000, 3001, 3003 的进程
- 在每次运行 `npm run dev` 前自动执行

## 使用方法

### 单独启动

```bash
# 启动前端 (自动清理端口后启动在5173端口)
cd client && npm run dev

# 启动后端 (自动清理端口后启动在3000端口)
cd server && npm run dev
```

### 一键启动

```bash
# 在项目根目录运行
bash quick-start.sh
```

### 停止服务

```bash
# 在项目根目录运行
bash stop-services.sh
```

## 脚本说明

### `quick-start.sh`
- 自动清理所有端口
- 后台启动前端和后端
- 显示访问地址和进程信息
- 记录PID便于后续管理

### `stop-services.sh`
- 停止所有相关服务
- 清理PID文件
- 强制清理端口

## 外网访问地址

- **前端**: https://localhost:5173 (绑定到本地5173端口)
- **后端**: https://ezavkrybovpo.sealoshzh.site:3000 (绑定到本地3000端口)

## 日志查看

```bash
# 实时查看前端日志
tail -f logs/frontend.log

# 实时查看后端日志
tail -f logs/backend.log
```

## 手动端口清理

如果自动清理失败，可以手动运行：

```bash
# 前端端口清理
bash client/scripts/kill-ports.sh

# 后端端口清理
bash server/scripts/kill-ports.sh
```

## 注意事项

1. 所有端口清理脚本使用 `kill -9` 强制杀死进程
2. 脚本会等待1秒确保进程完全停止
3. 如果端口仍被占用，会显示警告信息
4. 建议在启动前检查是否有重要进程正在使用这些端口