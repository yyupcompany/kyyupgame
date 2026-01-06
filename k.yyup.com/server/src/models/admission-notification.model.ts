import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { ParentStudentRelation } from './parent-student-relation.model';
import { MessageTemplate } from './message-template.model';
import { AdmissionResult } from './admission-result.model';
import { User } from './user.model';

export enum NotificationMethod {
  SMS = 'sms',
  EMAIL = 'email',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  DRAFT = 0,
  PENDING = 1,
  SENT = 2,
  DELIVERED = 3,
  READ = 4,
  FAILED = 5,
  CANCELLED = 6,
}

export class AdmissionNotification extends Model<
  InferAttributes<AdmissionNotification>,
  InferCreationAttributes<AdmissionNotification>
> {
  declare id: CreationOptional<number>;
  declare method: NotificationMethod;
  declare parentId: ForeignKey<number>;
  declare templateId: ForeignKey<number> | null;
  declare admissionId: ForeignKey<number>;
  declare title: string;
  declare content: string;
  declare status: CreationOptional<NotificationStatus>;
  declare responseRequired: CreationOptional<boolean>;
  declare scheduledTime: Date | null;
  declare sentTime: Date | null;
  declare deliveredTime: Date | null;
  declare readTime: Date | null;
  declare response: string | null;
  declare errorMessage: string | null;
  declare retryCount: CreationOptional<number>;
  declare createdBy: ForeignKey<number>;
  declare updatedBy: ForeignKey<number>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

export const initAdmissionNotification = (sequelize: Sequelize) => {
  AdmissionNotification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      method: {
        type: DataTypes.ENUM(...Object.values(NotificationMethod)),
        allowNull: false,
        comment: '通知方式',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '家长关系ID',
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '消息模板ID',
      },
      admissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '录取结果ID',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '通知标题',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '通知内容',
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: NotificationStatus.DRAFT,
        comment: '通知状态 (0:草稿, 1:待发送, 2:已发送, 3:已送达, 4:已读, 5:发送失败, 6:已取消)',
      },
      responseRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否需要回复',
      },
      scheduledTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '预定发送时间',
      },
      sentTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '实际发送时间',
      },
      deliveredTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '送达时间',
      },
      readTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '阅读时间',
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '回复内容',
      },
      errorMessage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '发送失败信息',
      },
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '重试次数',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建人ID',
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '更新人ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'admission_notifications',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return AdmissionNotification;
};

export const initAdmissionNotificationAssociations = () => {
  AdmissionNotification.belongsTo(AdmissionResult, {
    foreignKey: 'admissionId',
    as: 'admissionResult',
  });
  AdmissionNotification.belongsTo(ParentStudentRelation, {
    foreignKey: 'parentId',
    as: 'parentRelation',
  });
  AdmissionNotification.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  AdmissionNotification.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });
  AdmissionNotification.belongsTo(MessageTemplate, {
    foreignKey: 'templateId',
    as: 'template',
  });
};
