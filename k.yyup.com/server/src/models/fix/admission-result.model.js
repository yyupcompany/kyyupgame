'use strict';

const { Model, DataTypes } = require('sequelize');

// 录取状态枚举
const AdmissionStatus = {
  PENDING: 'pending', // 待录取
  ADMITTED: 'admitted', // 已录取
  REJECTED: 'rejected', // 已拒绝
  WAITLISTED: 'waitlisted', // 候补
  CONFIRMED: 'confirmed', // 已确认入学
  CANCELED: 'canceled', // 已取消
};

// 录取类型枚举
const AdmissionType = {
  REGULAR: 'regular', // 常规录取
  SPECIAL: 'special', // 特殊录取
  PRIORITY: 'priority', // 优先录取
  TRANSFER: 'transfer', // 转学录取
};

module.exports = (sequelize) => {
  class AdmissionResult extends Model {
    static associate(models) {
      // 定义关联
      AdmissionResult.belongsTo(models.EnrollmentApplication, {
        foreignKey: 'application_id',
        as: 'application'
      });

      AdmissionResult.belongsTo(models.Parent, {
        foreignKey: 'parent_id',
        as: 'parent'
      });

      AdmissionResult.belongsTo(models.EnrollmentPlan, {
        foreignKey: 'plan_id',
        as: 'plan'
      });

      AdmissionResult.belongsTo(models.Class, {
        foreignKey: 'class_id',
        as: 'class'
      });

      AdmissionResult.belongsTo(models.User, {
        foreignKey: 'interviewer_id',
        as: 'interviewer'
      });

      AdmissionResult.belongsTo(models.User, {
        foreignKey: 'decision_maker_id',
        as: 'decisionMaker'
      });

      AdmissionResult.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      AdmissionResult.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }

  AdmissionResult.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '报名申请ID',
      },
      student_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '学生姓名',
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '家长ID',
      },
      plan_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '招生计划ID',
      },
      class_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: '分配班级ID',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(AdmissionStatus)),
        allowNull: false,
        defaultValue: AdmissionStatus.PENDING,
        comment: '录取状态',
      },
      type: {
        type: DataTypes.ENUM(...Object.values(AdmissionType)),
        allowNull: false,
        defaultValue: AdmissionType.REGULAR,
        comment: '录取类型',
      },
      admission_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '录取日期',
      },
      notification_date: {
        type: DataTypes.DATE,
        comment: '通知日期',
      },
      notification_method: {
        type: DataTypes.STRING(50),
        comment: '通知方式',
      },
      confirmation_date: {
        type: DataTypes.DATE,
        comment: '确认日期',
      },
      enrollment_date: {
        type: DataTypes.DATE,
        comment: '入学日期',
      },
      tuition_status: {
        type: DataTypes.STRING(20),
        comment: '学费状态',
      },
      comments: {
        type: DataTypes.TEXT,
        comment: '备注',
      },
      score: {
        type: DataTypes.FLOAT,
        comment: '评分',
      },
      rank: {
        type: DataTypes.INTEGER,
        comment: '排名',
      },
      interview_result: {
        type: DataTypes.TEXT,
        comment: '面试结果',
      },
      interview_date: {
        type: DataTypes.DATE,
        comment: '面试日期',
      },
      interviewer_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: '面试官ID',
      },
      decision_maker_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '决策者ID',
      },
      decision_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '决策日期',
      },
      decision_reason: {
        type: DataTypes.TEXT,
        comment: '决策原因',
      },
      special_requirements: {
        type: DataTypes.TEXT,
        comment: '特殊要求',
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '创建人',
      },
      updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        comment: '更新人',
      },
      is_system: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: '是否系统数据 - 0:否 1:是',
      },
    },
    {
      sequelize,
      modelName: 'AdmissionResult',
      tableName: 'admission_results',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return AdmissionResult;
}; 