import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class GameRecord extends Model<
  InferAttributes<GameRecord>,
  InferCreationAttributes<GameRecord>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare childId: number | null;
  declare gameId: number;
  declare levelId: number;
  declare score: number;
  declare stars: number;
  declare timeSpent: number;
  declare accuracy: number | null;
  declare mistakes: CreationOptional<number>;
  declare comboMax: CreationOptional<number>;
  declare gameData: any | null;
  declare completedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    GameRecord.init(
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
        gameId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        levelId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        score: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        stars: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        timeSpent: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        accuracy: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        mistakes: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        comboMax: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        gameData: {
          type: DataTypes.JSON,
          allowNull: true
        },
        completedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'game_records',
        timestamps: false,
        underscored: true
      }
    );
  }
}





