import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { AssessmentConfig } from './assessment-config.model';
import { Parent } from './parent.model';
import { Student } from './student.model';
import { User } from './user.model';

export type AssessmentStatus = 'in_progress' | 'completed' | 'cancelled';

/**
 * 测评记录模型
 */
export class AssessmentRecord extends Model<
  InferAttributes<AssessmentRecord>,
  InferCreationAttributes<AssessmentRecord>
> {
  declare id: CreationOptional<number>;
  declare recordNo: string;
  declare configId: number;
  declare childName: string;
  declare childAge: number;
  declare childGender?: 'male' | 'female';
  declare parentId?: number;
  declare studentId?: number;
  declare userId?: number;
  declare phone?: string;
  declare status: AssessmentStatus;
  declare startTime: Date;
  declare endTime?: Date;
  declare totalScore?: number;
  declare maxScore?: number;
  declare dimensionScores?: any; // JSON格式
  declare developmentQuotient?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare readonly config?: AssessmentConfig;
  declare readonly parent?: Parent;
  declare readonly student?: Student;
  declare readonly user?: User;

  static initModel(sequelize: Sequelize): void {
    AssessmentRecord.init(
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
        configId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_configs',
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
        childGender: {
          type: DataTypes.ENUM('male', 'female'),
          allowNull: true,
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
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('in_progress', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'in_progress',
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        totalScore: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        maxScore: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        dimensionScores: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        developmentQuotient: {
          type: DataTypes.DECIMAL(5, 2),
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
        tableName: 'assessment_records',
        timestamps: true,
      }
    );
  }

  static associate(models: {
    AssessmentConfig: typeof AssessmentConfig;
    Parent: typeof Parent;
    Student: typeof Student;
    User: typeof User;
  }): void {
    AssessmentRecord.belongsTo(models.AssessmentConfig, {
      foreignKey: 'configId',
      as: 'config',
    });
    AssessmentRecord.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    AssessmentRecord.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student',
    });
    AssessmentRecord.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}







// 为了兼容旧代码，添加默认导出
export default AssessmentRecord;