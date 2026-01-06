import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 测评配置模型
 */
export class AssessmentConfig extends Model<
  InferAttributes<AssessmentConfig>,
  InferCreationAttributes<AssessmentConfig>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string;
  declare minAge: number;
  declare maxAge: number;
  declare dimensions: any; // JSON数组
  declare status: 'active' | 'inactive';
  declare creatorId?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    AssessmentConfig.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        minAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        maxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        dimensions: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active',
        },
        creatorId: {
          type: DataTypes.INTEGER,
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
        tableName: 'assessment_configs',
        timestamps: true,
      }
    );
  }
}





