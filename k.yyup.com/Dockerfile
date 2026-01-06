# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装nginx、supervisor和必要工具（Alpine Linux包名）
RUN apk add --no-cache nginx python3 py3-pip \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        python3-dev \
        make \
        g++ \
    && pip3 install supervisor

# 首先复制package.json文件以利用Docker缓存
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# 设置npm国内镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装前端依赖（需要devDependencies用于vite构建）
WORKDIR /app/client
RUN npm ci --ignore-scripts

# 安装后端依赖，需要ts-node运行TypeScript
WORKDIR /app/server
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# 复制源代码
WORKDIR /app
COPY client/ ./client/
COPY server/ ./server/
COPY docker/ ./docker/

# 构建前端
WORKDIR /app/client
RUN npm run build

# 构建后端 - 只需要复制TypeScript文件，无需复杂编译
WORKDIR /app/server
# 后端运行时使用ts-node，不需要预编译

# 配置nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf

# 配置supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 创建运行目录
RUN mkdir -p /run/nginx /var/log/supervisor /var/log/nginx

# 复制健康检查脚本
COPY docker/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 创建非root用户（可选，增强安全性）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# 设置文件权限
RUN chown -R app:nodejs /app /var/log/supervisor /var/log/nginx /run/nginx

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/health-check.sh

# 设置工作目录为项目根目录
WORKDIR /app

# 切换到非root用户（如果不需要可以注释掉）
# USER app

# 启动supervisor管理所有服务
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]