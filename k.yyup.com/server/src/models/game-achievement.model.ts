import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class GameAchievement extends Model<
  InferAttributes<GameAchievement>,
  InferCreationAttributes<GameAchievement>
> {
  declare id: CreationOptional<number>;
  declare achievementKey: string;
  declare achievementName: string;
  declare description: string | null;
  declare iconUrl: string | null;
  declare category: 'beginner' | 'advanced' | 'master' | 'special';
  declare condition: any;
  declare reward: any | null;
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    GameAchievement.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        achievementKey: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false
        },
        achievementName: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        iconUrl: {
          type: DataTypes.STRING(500),
          allowNull: true
        },
        category: {
          type: DataTypes.ENUM('beginner', 'advanced', 'master', 'special'),
          allowNull: false
        },
        condition: {
          type: DataTypes.JSON,
          allowNull: false
        },
        reward: {
          type: DataTypes.JSON,
          allowNull: true
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'game_achievements',
        timestamps: false,
        underscored: true
      }
    );
  }
}





