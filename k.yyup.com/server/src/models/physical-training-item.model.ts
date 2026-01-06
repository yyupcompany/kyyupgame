import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export type PhysicalCategory = 'running' | 'jumping' | 'balancing' | 'climbing' | 'throwing' | 'coordination' | 'agility';

/**
 * 体能训练项目模型
 */
export class PhysicalTrainingItem extends Model<
  InferAttributes<PhysicalTrainingItem>,
  InferCreationAttributes<PhysicalTrainingItem>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string;
  declare category: PhysicalCategory;
  declare minAge: number;
  declare maxAge: number;
  declare instruction: string;
  declare scoringCriteria: any; // JSON格式
  declare mediaUrl?: string;
  declare status: 'active' | 'inactive';
  declare sortOrder: number;
  declare creatorId?: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    PhysicalTrainingItem.init(
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
        category: {
          type: DataTypes.ENUM('running', 'jumping', 'balancing', 'climbing', 'throwing', 'coordination', 'agility'),
          allowNull: false,
        },
        minAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        maxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        instruction: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        scoringCriteria: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        mediaUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active',
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        tableName: 'physical_training_items',
        timestamps: true,
        underscored: true, // 使用下划线命名
      }
    );
  }
}





