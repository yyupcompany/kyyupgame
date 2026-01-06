/**
 * PM2 生态系统配置文件
 * 用于管理幼儿园管理系统的后端服务
 */
module.exports = {
  apps: [
    // 幼儿园租户系统后端 (k.yyup.cc)
    {
      name: 'k-yyup-backend',
      cwd: '/var/www/kyyup/k.yyup.com/server',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'dbconn.sealoshzh.site',
        DB_PORT: 43906,
        DB_NAME: 'kargerdensales',
        DB_USER: 'root',
        DB_PASSWORD: 'pwk5ls7j',
        USE_REMOTE_DB: 'true',
        DISABLE_SQLITE: 'true',
        JWT_SECRET: 'your-jwt-secret-here',
        UNIFIED_AUTH_URL: 'https://rent.yyup.cc',
        SERVER_URL: 'https://k.yyup.cc',
        FRONTEND_URL: 'https://k.yyup.cc'
      },
      error_file: '/var/www/kyyup/shared/logs/k-yyup-error.log',
      out_file: '/var/www/kyyup/shared/logs/k-yyup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    
    // 统一认证系统后端 (rent.yyup.cc)
    {
      name: 'rent-yyup-backend',
      cwd: '/var/www/kyyup/rent.yyup.com/server',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
        DB_HOST: 'dbconn.sealoshzh.site',
        DB_PORT: 43906,
        DB_NAME: 'admin_tenant_management',
        DB_USER: 'root',
        DB_PASSWORD: 'pwk5ls7j',
        JWT_SECRET: 'your-jwt-secret-here',
        SERVER_URL: 'https://rent.yyup.cc',
        FRONTEND_URL: 'https://rent.yyup.cc',
        TENANT_BUSINESS_URL: 'https://k.yyup.cc',
        TARGET_IP: '47.94.82.59',
        SERVER_IP: '47.94.82.59'
      },
      error_file: '/var/www/kyyup/shared/logs/rent-yyup-error.log',
      out_file: '/var/www/kyyup/shared/logs/rent-yyup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};

