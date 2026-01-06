import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class GameLevel extends Model<
  InferAttributes<GameLevel>,
  InferCreationAttributes<GameLevel>
> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare levelNumber: number;
  declare levelName: string | null;
  declare difficulty: 'easy' | 'medium' | 'hard';
  declare config: any;
  declare unlockCondition: any | null;
  declare starRequirements: any | null;
  declare rewards: any | null;
  declare status: 'active' | 'locked';
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    GameLevel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        gameId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        levelNumber: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        levelName: {
          type: DataTypes.STRING(100),
          allowNull: true
        },
        difficulty: {
          type: DataTypes.ENUM('easy', 'medium', 'hard'),
          allowNull: false
        },
        config: {
          type: DataTypes.JSON,
          allowNull: false
        },
        unlockCondition: {
          type: DataTypes.JSON,
          allowNull: true
        },
        starRequirements: {
          type: DataTypes.JSON,
          allowNull: true
        },
        rewards: {
          type: DataTypes.JSON,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('active', 'locked'),
          defaultValue: 'active'
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'game_levels',
        timestamps: false,
        underscored: true
      }
    );
  }
}





