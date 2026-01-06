
  find . -type f -name "*.js" -o -name "*.ts" | xargs grep -l "sequelize.sync" > sync_usage.txt
  find . -type f -name "*.js" -o -name "*.ts" | xargs grep -l "\.sync(" >> sync_usage.txt
  