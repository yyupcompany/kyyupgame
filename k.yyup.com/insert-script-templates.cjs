const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

// 定义模型
const ScriptTemplate = sequelize.define('ScriptTemplate', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('greeting', 'introduction', 'qa', 'invitation', 'closing', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  successRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'script_templates',
  timestamps: true,
});

async function insertTemplates() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const templates = [
      // 问候类话术
      {
        title: '初次问候',
        category: 'greeting',
        keywords: '你好,您好,喂,在吗',
        content: '您好！我是XX幼儿园的招生顾问，很高兴为您服务。请问您的孩子多大了？',
        priority: 10,
        status: 'active',
      },
      {
        title: '回访问候',
        category: 'greeting',
        keywords: '回访,再次,又来了',
        content: '您好！感谢您再次咨询我们幼儿园。上次我们聊到您的孩子，不知道您现在方便继续了解吗？',
        priority: 9,
        status: 'active',
      },

      // 介绍类话术
      {
        title: '幼儿园简介',
        category: 'introduction',
        keywords: '介绍,了解,什么样,怎么样',
        content: '我们是一所专注于3到6岁儿童教育的优质幼儿园，拥有先进的教学设施和经验丰富的师资团队。我们注重孩子的个性发展和综合能力培养。',
        priority: 10,
        status: 'active',
      },
      {
        title: '师资介绍',
        category: 'introduction',
        keywords: '老师,师资,教师,教学',
        content: '我们的老师都是学前教育专业毕业，平均教龄五年以上，每年都会参加专业培训。每个班级配备两名主教老师和一名保育老师，确保孩子得到充分关注。',
        priority: 9,
        status: 'active',
      },
      {
        title: '课程介绍',
        category: 'introduction',
        keywords: '课程,教什么,学什么,内容',
        content: '我们采用多元化课程体系，包括语言、数学、艺术、体育、科学探索等领域。注重培养孩子的创造力、社交能力和独立性。',
        priority: 9,
        status: 'active',
      },

      // 答疑类话术
      {
        title: '学费咨询',
        category: 'qa',
        keywords: '多少钱,学费,费用,价格,收费',
        content: '我们的学费根据班级类型有所不同，小班每月三千五，中班和大班每月三千。包含教材费、餐费和活动费。具体优惠政策我可以详细为您介绍。',
        priority: 10,
        status: 'active',
      },
      {
        title: '地址咨询',
        category: 'qa',
        keywords: '在哪,地址,位置,怎么去',
        content: '我们位于市中心XX路XX号，交通便利，附近有地铁站和公交站。您方便的话，我可以发送详细地址和导航给您。',
        priority: 10,
        status: 'active',
      },
      {
        title: '班级人数',
        category: 'qa',
        keywords: '多少人,人数,班级,几个孩子',
        content: '我们严格控制班级人数，小班不超过二十人，中班和大班不超过二十五人。这样可以确保每个孩子都能得到老师的充分关注。',
        priority: 8,
        status: 'active',
      },
      {
        title: '入园年龄',
        category: 'qa',
        keywords: '几岁,年龄,多大,可以上',
        content: '我们招收三到六岁的孩子。如果您的孩子快满三岁了，也可以提前预约参观，我们会根据孩子的实际情况安排合适的班级。',
        priority: 9,
        status: 'active',
      },
      {
        title: '餐食安排',
        category: 'qa',
        keywords: '吃什么,餐食,伙食,饭菜',
        content: '我们有专业的营养师配餐，每天提供两餐两点，食材新鲜安全，营养均衡。每周菜单会提前公布，家长可以随时了解孩子的饮食情况。',
        priority: 8,
        status: 'active',
      },

      // 邀约类话术
      {
        title: '邀约参观',
        category: 'invitation',
        keywords: '参观,看看,去看,实地',
        content: '非常欢迎您来参观！我们每周二和周四下午两点有开放日活动，您可以实地了解我们的教学环境和设施。您看这周哪天方便？',
        priority: 10,
        status: 'active',
      },
      {
        title: '邀约试听',
        category: 'invitation',
        keywords: '试听,体验,试试,感受',
        content: '我们提供免费试听课程，您可以带孩子来体验一下我们的教学方式。这样您和孩子都能更直观地感受我们的教学环境。您看什么时候方便？',
        priority: 9,
        status: 'active',
      },

      // 结束类话术
      {
        title: '礼貌结束',
        category: 'closing',
        keywords: '再见,拜拜,挂了,不聊了',
        content: '好的，感谢您的咨询！如果您还有任何问题，随时可以联系我。祝您和孩子生活愉快！',
        priority: 10,
        status: 'active',
      },
      {
        title: '后续跟进',
        category: 'closing',
        keywords: '考虑,想想,再说,回头',
        content: '好的，您可以慢慢考虑。我会把我们的详细资料发给您，您有任何问题随时联系我。我过两天再给您打个电话，看看您有什么疑问。',
        priority: 9,
        status: 'active',
      },

      // 默认话术
      {
        title: '默认回复',
        category: 'other',
        keywords: '默认,兜底',
        content: '抱歉，我没听清楚，您能再说一遍吗？或者您可以换个方式问我。',
        priority: 1,
        status: 'active',
      },
      {
        title: '未理解',
        category: 'other',
        keywords: '不明白,没懂,什么意思',
        content: '不好意思，我可能没有完全理解您的问题。您是想了解我们幼儿园的哪方面信息呢？比如学费、师资、课程或者参观安排？',
        priority: 5,
        status: 'active',
      },
    ];

    await ScriptTemplate.bulkCreate(templates);
    console.log(`✅ 成功插入 ${templates.length} 条话术模板`);

    // 查询验证
    const count = await ScriptTemplate.count();
    console.log(`📊 当前话术模板总数: ${count}`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ 插入失败:', error);
    process.exit(1);
  }
}

insertTemplates();

