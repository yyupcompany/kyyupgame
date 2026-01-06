import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class UserAchievement extends Model<
  InferAttributes<UserAchievement>,
  InferCreationAttributes<UserAchievement>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare childId: number | null;
  declare achievementId: number;
  declare unlockedAt: CreationOptional<Date>;
  declare progress: CreationOptional<number>;
  declare isNotified: CreationOptional<number>;

  static initModel(sequelize: Sequelize): void {
    UserAchievement.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        childId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        achievementId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        unlockedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        progress: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        isNotified: {
          type: DataTypes.TINYINT,
          defaultValue: 0
        }
      },
      {
        sequelize,
        tableName: 'user_achievements',
        timestamps: false,
        underscored: true
      }
    );
  }
}





