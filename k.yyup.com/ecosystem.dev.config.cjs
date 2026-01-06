/**
 * PM2 开发环境配置文件
 * 用于本地开发环境的 PM2 进程管理
 */

module.exports = {
  apps: [
    // 后端服务 (开发模式)
    {
      name: 'k-backend-dev',
      cwd: './server',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        // 本地数据库配置（如果需要）
        // DB_HOST: 'localhost',
        // DB_PORT: 3306,
        // DB_NAME: 'kindergarten',
        // DB_USER: 'root',
        // DB_PASSWORD: '',
        // 如果使用远程数据库
        USE_REMOTE_DB: 'true',
        DISABLE_SQLITE: 'true',
        JWT_SECRET: 'dev-jwt-secret-key',
        UNIFIED_AUTH_URL: 'http://localhost:4001',
        SERVER_URL: 'http://localhost:3000',
        FRONTEND_URL: 'http://localhost:5173'
      },
      error_file: './logs/pm2/backend-error.log',
      out_file: './logs/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    // 前端服务 (Vite 开发服务器)
    {
      name: 'k-frontend-dev',
      cwd: './client',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        VITE_API_BASE_URL: 'http://localhost:3000'
      },
      error_file: './logs/pm2/frontend-error.log',
      out_file: './logs/pm2/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
