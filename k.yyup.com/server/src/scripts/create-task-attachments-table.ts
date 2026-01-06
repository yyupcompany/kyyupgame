import { initDatabase } from '../config/database';
import { TaskAttachment } from '../models/task-attachment.model';

async function createTaskAttachmentsTable() {
  try {
    console.log('📎 开始创建任务附件表...');

    // 初始化数据库连接
    const sequelize = await initDatabase();

    // 初始化模型
    TaskAttachment.initModel(sequelize);

    // 同步表结构（force: false 表示不删除已存在的表）
    await TaskAttachment.sync({ force: false });

    console.log('✅ 任务附件表创建成功！');

    // 检查表是否存在
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 数据库中的表:', tableExists.filter((t: string) => t.includes('task')));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建任务附件表失败:', error);
    process.exit(1);
  }
}

createTaskAttachmentsTable();

