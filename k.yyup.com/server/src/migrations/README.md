# 数据库迁移与种子数据

本目录包含数据库迁移脚本和种子数据，用于创建和初始化AI系统所需的数据库表和初始数据。

## 迁移脚本

迁移脚本按照时间顺序执行，主要包含以下内容：

1. `20230701000000-create-ai-tables.js`: 创建AI系统的核心表结构
   - ai_user_relations: AI用户关系表
   - ai_user_permissions: AI用户权限表
   - ai_memories: AI记忆表
   - ai_conversations: AI会话表
   - ai_model_config: AI模型配置表
   - ai_model_usage: AI模型使用记录表
   - ai_model_billing: AI模型计费表

2. `20230701030000-add-triggers-for-user-sync.js`: 添加用户同步触发器
   - 创建change_log表记录变更
   - 添加用户相关表的触发器
   - 创建自动同步存储过程和定时任务

## 种子数据

种子数据用于初始化系统必要的基础数据：

1. `20230701010000-ai-model-config.js`: AI模型配置及计费数据
   - 预配置常用的OpenAI模型
   - 设置模型的计费规则

2. `20230701020000-ai-user-relations.js`: AI用户关系数据
   - 为管理员用户创建AI系统映射
   - 设置默认的AI权限
   - 创建示例会话和记忆数据

## 执行方法

### 开发环境

在开发环境中执行迁移和种子：

```bash
# 执行所有迁移
npx sequelize-cli db:migrate

# 执行所有种子
npx sequelize-cli db:seed:all
```

### 回滚操作

需要回滚时，可以使用以下命令：

```bash
# 回滚最近一次迁移
npx sequelize-cli db:migrate:undo

# 回滚所有迁移
npx sequelize-cli db:migrate:undo:all

# 回滚所有种子
npx sequelize-cli db:seed:undo:all
```

### 生产环境

在生产环境部署前，需要执行以下步骤：

1. 备份现有数据库
2. 验证迁移脚本在测试环境中的执行情况
3. 执行迁移，但种子数据可选执行

```bash
# 生产环境执行迁移
NODE_ENV=production npx sequelize-cli db:migrate

# 仅执行特定种子（可选）
NODE_ENV=production npx sequelize-cli db:seed --seed 20230701010000-ai-model-config.js
```

## 注意事项

1. 迁移脚本会创建外键关联，确保被引用的表已存在
2. 触发器和存储过程需要MySQL 5.7以上版本
3. 种子数据中的API密钥为占位符，实际部署时需替换为真实密钥
4. 执行迁移前应备份现有数据库 