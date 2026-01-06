import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { CustomerFollowMedia } from './customer-follow-media.model';

export interface CustomerFollowRecordEnhancedAttributes {
  id: number;
  customerId: number;
  teacherId: number;
  stage: number; // 1-8 对应8个跟进阶段
  subStage: string; // 子阶段标识
  followType: string;
  content: string;
  customerFeedback: string | null;
  aiSuggestions: any | null; // JSON格式存储AI建议
  stageStatus: string; // 'pending', 'in_progress', 'completed', 'skipped'
  mediaFiles: any | null; // JSON格式存储媒体文件引用
  nextFollowDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerFollowRecordEnhancedCreationAttributes = Optional<
  CustomerFollowRecordEnhancedAttributes, 
  'id' | 'customerFeedback' | 'aiSuggestions' | 'mediaFiles' | 'nextFollowDate' | 'completedAt'
>;

export class CustomerFollowRecordEnhanced extends Model<
  CustomerFollowRecordEnhancedAttributes, 
  CustomerFollowRecordEnhancedCreationAttributes
> implements CustomerFollowRecordEnhancedAttributes {
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public stage!: number;
  public subStage!: string;
  public followType!: string;
  public content!: string;
  public customerFeedback!: string | null;
  public aiSuggestions!: any | null;
  public stageStatus!: string;
  public mediaFiles!: any | null;
  public nextFollowDate!: Date | null;
  public completedAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly teacher?: User;
  public readonly media?: CustomerFollowMedia[];

  // 获取阶段名称
  public getStageDisplayName(): string {
    const stageNames = {
      1: '初期接触',
      2: '需求挖掘', 
      3: '方案展示',
      4: '实地体验',
      5: '异议处理',
      6: '促成决策',
      7: '缴费确认',
      8: '入园准备'
    };
    return stageNames[this.stage as keyof typeof stageNames] || '未知阶段';
  }

  // 检查是否需要AI建议
  public needsAISuggestion(): boolean {
    return !this.aiSuggestions || 
           (this.aiSuggestions && new Date().getTime() - new Date(this.updatedAt).getTime() > 24 * 60 * 60 * 1000);
  }

  static initModel(sequelize: Sequelize): void {
    CustomerFollowRecordEnhanced.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '跟进记录ID'
        },
        customerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'customer_id',
          comment: '客户ID'
        },
        teacherId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'teacher_id',
          comment: '教师ID',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        stage: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '跟进阶段 (1-8)',
          validate: {
            min: 1,
            max: 8
          }
        },
        subStage: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'sub_stage',
          comment: '子阶段标识'
        },
        followType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'follow_type',
          comment: '跟进方式'
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '跟进内容'
        },
        customerFeedback: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'customer_feedback',
          comment: '客户反馈'
        },
        aiSuggestions: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'ai_suggestions',
          comment: 'AI建议内容 JSON格式'
        },
        stageStatus: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'skipped'),
          allowNull: false,
          defaultValue: 'pending',
          field: 'stage_status',
          comment: '阶段状态'
        },
        mediaFiles: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'media_files',
          comment: '媒体文件引用 JSON格式'
        },
        nextFollowDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'next_follow_date',
          comment: '下次跟进时间'
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_at',
          comment: '完成时间'
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
        }
      },
      {
        sequelize,
        tableName: 'customer_follow_records_enhanced',
        timestamps: true,
        underscored: true,
        comment: '增强版客户跟进记录表'
      }
    );
  }

  static initAssociations(): void {
    CustomerFollowRecordEnhanced.belongsTo(User, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });
    
    CustomerFollowRecordEnhanced.hasMany(CustomerFollowMedia, {
      sourceKey: 'id',
      foreignKey: 'followRecordId',
      as: 'media'
    });
  }
}

export default CustomerFollowRecordEnhanced;
