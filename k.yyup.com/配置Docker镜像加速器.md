# Docker 镜像加速器配置指南

## Windows Docker Desktop 配置

1. **打开 Docker Desktop**
2. **点击右上角设置图标（齿轮）**
3. **选择 "Docker Engine"**
4. **在配置文件中添加以下内容**：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com", 
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ],
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

5. **点击 "Apply & Restart"**
6. **等待Docker重启完成**

## 验证配置

```bash
# 查看Docker信息
docker info

# 查看镜像加速器配置
docker system info | grep -i mirror
```

## 手动下载镜像

如果自动下载失败，可以手动下载：

```bash
# 下载Node镜像
docker pull node:18-alpine

# 查看下载的镜像
docker images
```

## 其他镜像源

如果上述镜像源都不可用，可以尝试：

- 阿里云: `https://registry.cn-hangzhou.aliyuncs.com`
- 腾讯云: `https://mirror.ccs.tencentyun.com`
- 网易: `https://hub-mirror.c.163.com`
- 中科大: `https://docker.mirrors.ustc.edu.cn`