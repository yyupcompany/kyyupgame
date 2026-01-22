import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { ParentStudentRelation } from './parent-student-relation.model';

export interface ParentCommunicationAttributes {
  id: number;
  parentId: number;
  studentId: number;
  communicationType: string; // 'phone' | 'message' | 'meeting' | 'video' | 'wechat'
  direction: string; // 'inbound' | 'outbound'
  content: string;
  summary: string | null;
  sentiment: number | null; // -1 to 1, 情感倾向
  topics: string[]; // ['学习', '行为', '健康', etc.]
  duration: number | null; // 通话时长(秒)
  attachments: string[]; // 附件URL列表
  status: string; // 'completed' | 'followup_needed' | 'escalated'
  followupRequired: boolean;
  nextFollowupDate: Date | null;
  nextFollowupType: string | null;
  responseRequired: boolean;
  responseDeadline: Date | null;
  aiGenerated: boolean;
  aiSuggestions: string | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ParentCommunicationCreationAttributes = Optional<
  ParentCommunicationAttributes,
  | 'id'
  | 'summary'
  | 'sentiment'
  | 'duration'
  | 'attachments'
  | 'followupRequired'
  | 'nextFollowupDate'
  | 'nextFollowupType'
  | 'responseRequired'
  | 'responseDeadline'
  | 'aiGenerated'
  | 'aiSuggestions'
  | 'deletedAt'
>;

export class ParentCommunication
  extends Model<ParentCommunicationAttributes, ParentCommunicationCreationAttributes>
  implements ParentCommunicationAttributes
{
  public id!: number;
  public parentId!: number;
  public studentId!: number;
  public communicationType!: string;
  public direction!: string;
  public content!: string;
  public summary!: string | null;
  public sentiment!: number | null;
  public topics!: string[];
  public duration!: number | null;
  public attachments!: string[];
  public status!: string;
  public followupRequired!: boolean;
  public nextFollowupDate!: Date | null;
  public nextFollowupType!: string | null;
  public responseRequired!: boolean;
  public responseDeadline!: Date | null;
  public aiGenerated!: boolean;
  public aiSuggestions!: string | null;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly parent?: ParentStudentRelation;
  public readonly creator?: User;

  /**
   * 计算沟通效率得分 (0-100)
   */
  public getEfficiencyScore(): number {
    let score = 60; // 基础分

    // 根据状态加分
    if (this.status === 'completed') score += 20;
    else if (this.status === 'followup_needed') score += 10;

    // 根据情感倾向调整
    if (this.sentiment !== null) {
      if (this.sentiment > 0.5) score += 10;
      else if (this.sentiment > 0) score += 5;
      else if (this.sentiment < -0.5) score -= 10;
      else if (this.sentiment < 0) score -= 5;
    }

    // 根据是否需要后续跟进调整
    if (!this.followupRequired) score += 5;
    if (!this.responseRequired) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 检查是否需要提醒
   */
  public needsReminder(): boolean {
    if (!this.responseRequired || !this.responseDeadline) return false;
    if (new Date(this.responseDeadline) < new Date()) return false;
    const reminderTime = new Date(this.responseDeadline);
    reminderTime.setHours(reminderTime.getHours() - 24); // 提前24小时提醒
    return new Date() >= reminderTime;
  }
}

const defineAttributes = (sequelize: Sequelize) => {
  ParentCommunication.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '沟通记录ID - 主键'
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'parent_id',
        comment: '家长ID - 关联家长学生关系表',
        references: {
          model: 'parent_student_relations',
          key: 'id'
        }
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
        comment: '学生ID - 关联学生表',
        references: {
          model: 'students',
          key: 'id'
        }
      },
      communicationType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'communication_type',
        comment: '沟通类型 - 电话、消息、会议、视频、微信等'
      },
      direction: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '沟通方向 - inbound(家长发起) 或 outbound(教师发起)'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '沟通内容'
      },
      summary: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'AI生成的沟通摘要'
      },
      sentiment: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: '情感倾向得分 -1到1'
      },
      topics: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '沟通话题标签数组'
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '沟通时长(秒)'
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: '附件URL列表'
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'completed',
        comment: '沟通状态 - completed, followup_needed, escalated'
      },
      followupRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'followup_required',
        comment: '是否需要后续跟进'
      },
      nextFollowupDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'next_followup_date',
        comment: '下次跟进日期'
      },
      nextFollowupType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'next_followup_type',
        comment: '下次跟进类型'
      },
      responseRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'response_required',
        comment: '是否需要回复'
      },
      responseDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'response_deadline',
        comment: '回复截止时间'
      },
      aiGenerated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'ai_generated',
        comment: '是否AI生成的内容'
      },
      aiSuggestions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ai_suggestions',
        comment: 'AI建议的后续跟进方案'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        comment: '创建人ID - 外键关联用户表',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        comment: '创建时间'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        comment: '更新时间'
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
        comment: '删除时间'
      }
    },
    {
      sequelize,
      tableName: 'parent_communications',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          fields: ['parent_id']
        },
        {
          fields: ['student_id']
        },
        {
          fields: ['created_by']
        },
        {
          fields: ['communication_type']
        },
        {
          fields: ['status']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );
};

const defineAssociations = () => {
  ParentCommunication.belongsTo(ParentStudentRelation, {
    foreignKey: 'parentId',
    as: 'parent',
    onDelete: 'CASCADE'
  });
  ParentCommunication.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

// 导出初始化函数
export const initParentCommunication = (sequelize: Sequelize): void => {
  defineAttributes(sequelize);
};

export const initParentCommunicationAssociations = (): void => {
  defineAssociations();
};

export default ParentCommunication;
