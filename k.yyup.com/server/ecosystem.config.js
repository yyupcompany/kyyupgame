module.exports = {
  apps: [{
    name: 'k-yyup-backend',
    script: './node_modules/.bin/ts-node',
    args: '--transpile-only src/app.ts',
    cwd: '/persistent/home/zhgue/kyyupgame/k.yyup.com/server',
    watch: false,
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: '/tmp/pm2-error.log',
    out_file: '/tmp/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
