import { DataTypes, QueryInterface } from 'sequelize';

/**
 * 创建测评相关表结构
 * 包括：测评配置、题目、记录、答案、报告、成长追踪、体能训练项目、体能测评记录
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. 测评配置表
  await queryInterface.createTable('assessment_configs', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '配置ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '配置名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配置描述'
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最小年龄（月）'
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最大年龄（月）'
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '测评维度配置（JSON数组）'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '创建人ID'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 2. 测评题目表
  await queryInterface.createTable('assessment_questions', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '题目ID'
    },
    configId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_configs',
        key: 'id'
      },
      comment: '配置ID'
    },
    dimension: {
      type: DataTypes.ENUM('attention', 'memory', 'logic', 'language', 'motor', 'social'),
      allowNull: false,
      comment: '测评维度'
    },
    ageGroup: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '年龄段（如：24-36, 36-48等）'
    },
    questionType: {
      type: DataTypes.ENUM('qa', 'game', 'interactive'),
      allowNull: false,
      comment: '题目类型：问答、游戏、互动'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '题目标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '题目内容（JSON格式，包含选项、正确答案等）'
    },
    gameConfig: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '游戏配置（JSON格式，用于互动游戏）'
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '难度等级（1-5）'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: '题目分值'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '创建人ID'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 3. 测评记录表
  await queryInterface.createTable('assessment_records', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '记录ID'
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '测评记录编号'
    },
    configId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_configs',
        key: 'id'
      },
      comment: '配置ID'
    },
    childName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '儿童姓名'
    },
    childAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '儿童年龄（月）'
    },
    childGender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
      comment: '儿童性别'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'parents',
        key: 'id'
      },
      comment: '家长ID（如果已注册）'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      comment: '学生ID（如果已关联）'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '用户ID（如果是注册用户）'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话（用于未注册用户）'
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'in_progress',
      comment: '测评状态'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束时间'
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '总得分'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '满分'
    },
    dimensionScores: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '各维度得分（JSON格式）'
    },
    developmentQuotient: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '发育商（DQ）'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 4. 测评答案表
  await queryInterface.createTable('assessment_answers', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '答案ID'
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      comment: '测评记录ID'
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_questions',
        key: 'id'
      },
      comment: '题目ID'
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '答案内容（JSON格式）'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '得分'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用时（秒）'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 5. 测评报告表
  await queryInterface.createTable('assessment_reports', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '报告ID'
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      comment: '测评记录ID'
    },
    reportNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '报告编号'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '报告内容（JSON格式，包含优势、建议等）'
    },
    aiGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否AI生成'
    },
    screenshotUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '报告截图URL'
    },
    qrCodeUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '分享二维码URL'
    },
    shareUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '分享链接'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '查看次数'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 6. 成长追踪表
  await queryInterface.createTable('assessment_growth_tracking', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '追踪ID'
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      comment: '测评记录ID'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'parents',
        key: 'id'
      },
      comment: '家长ID'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      comment: '学生ID'
    },
    previousRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      comment: '上次测评记录ID'
    },
    growthData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '成长数据（JSON格式，包含各维度变化）'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 7. 体能训练项目表
  await queryInterface.createTable('physical_training_items', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '项目ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '项目名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '项目描述'
    },
    category: {
      type: DataTypes.ENUM('running', 'jumping', 'balancing', 'climbing', 'throwing', 'coordination', 'agility'),
      allowNull: false,
      comment: '项目分类'
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最小年龄（月）'
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最大年龄（月）'
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '操作说明'
    },
    scoringCriteria: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '评分标准（JSON格式）'
    },
    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '示范视频/图片URL'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '创建人ID'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 8. 体能测评记录表
  await queryInterface.createTable('physical_assessment_records', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: '记录ID'
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '测评记录编号'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'physical_training_items',
        key: 'id'
      },
      comment: '训练项目ID'
    },
    assessmentRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'assessment_records',
        key: 'id'
      },
      comment: '关联的发育商测评记录ID'
    },
    childName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '儿童姓名'
    },
    childAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '儿童年龄（月）'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'parents',
        key: 'id'
      },
      comment: '家长ID'
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      comment: '学生ID'
    },
    result: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '测评结果（JSON格式）'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '得分'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '满分'
    },
    evidenceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '证据图片/视频URL'
    },
    assessorNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '评估备注'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // 创建索引
  await queryInterface.addIndex('assessment_questions', ['configId', 'dimension', 'ageGroup'], {
    name: 'idx_assessment_questions_config_dimension_age'
  });
  await queryInterface.addIndex('assessment_records', ['parentId', 'status'], {
    name: 'idx_assessment_records_parent_status'
  });
  await queryInterface.addIndex('assessment_records', ['userId', 'status'], {
    name: 'idx_assessment_records_user_status'
  });
  await queryInterface.addIndex('assessment_records', ['recordNo'], {
    name: 'idx_assessment_records_record_no'
  });
  await queryInterface.addIndex('assessment_answers', ['recordId', 'questionId'], {
    name: 'idx_assessment_answers_record_question'
  });
  await queryInterface.addIndex('assessment_reports', ['recordId'], {
    name: 'idx_assessment_reports_record'
  });
  await queryInterface.addIndex('physical_training_items', ['category', 'minAge', 'maxAge'], {
    name: 'idx_physical_training_items_category_age'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('physical_assessment_records');
  await queryInterface.dropTable('physical_training_items');
  await queryInterface.dropTable('assessment_growth_tracking');
  await queryInterface.dropTable('assessment_reports');
  await queryInterface.dropTable('assessment_answers');
  await queryInterface.dropTable('assessment_records');
  await queryInterface.dropTable('assessment_questions');
  await queryInterface.dropTable('assessment_configs');
}





