import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { PhysicalTrainingItem } from './physical-training-item.model';
import { AssessmentRecord } from './assessment-record.model';
import { Parent } from './parent.model';
import { Student } from './student.model';

/**
 * 体能测评记录模型
 */
export class PhysicalAssessmentRecord extends Model<
  InferAttributes<PhysicalAssessmentRecord>,
  InferCreationAttributes<PhysicalAssessmentRecord>
> {
  declare id: CreationOptional<number>;
  declare recordNo: string;
  declare itemId: number;
  declare assessmentRecordId?: number;
  declare childName: string;
  declare childAge: number;
  declare parentId?: number;
  declare studentId?: number;
  declare result: any; // JSON格式
  declare score: number;
  declare maxScore: number;
  declare evidenceUrl?: string;
  declare assessorNote?: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare readonly item?: PhysicalTrainingItem;
  declare readonly assessmentRecord?: AssessmentRecord;
  declare readonly parent?: Parent;
  declare readonly student?: Student;

  static initModel(sequelize: Sequelize): void {
    PhysicalAssessmentRecord.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recordNo: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        itemId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'physical_training_items',
            key: 'id',
          },
        },
        assessmentRecordId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'assessment_records',
            key: 'id',
          },
        },
        childName: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        childAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'parents',
            key: 'id',
          },
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'students',
            key: 'id',
          },
        },
        result: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        score: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        maxScore: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        evidenceUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        assessorNote: {
          type: DataTypes.TEXT,
          allowNull: true,
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
      },
      {
        sequelize,
        tableName: 'physical_assessment_records',
        timestamps: true,
      }
    );
  }

  static associate(models: {
    PhysicalTrainingItem: typeof PhysicalTrainingItem;
    AssessmentRecord: typeof AssessmentRecord;
    Parent: typeof Parent;
    Student: typeof Student;
  }): void {
    PhysicalAssessmentRecord.belongsTo(models.PhysicalTrainingItem, {
      foreignKey: 'itemId',
      as: 'item',
    });
    PhysicalAssessmentRecord.belongsTo(models.AssessmentRecord, {
      foreignKey: 'assessmentRecordId',
      as: 'assessmentRecord',
    });
    PhysicalAssessmentRecord.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    PhysicalAssessmentRecord.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student',
    });
  }
}





