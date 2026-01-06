import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 学生人脸库Model
 */
export class StudentFaceLibrary extends Model<
  InferAttributes<StudentFaceLibrary>,
  InferCreationAttributes<StudentFaceLibrary>
> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare faceToken: string;
  declare referencePhotoUrl: string;
  declare qualityScore: CreationOptional<number>;

  // 建档信息
  declare createdBy: number | null;
  declare isPrimary: CreationOptional<boolean>;
  declare lastUsedAt: Date | null;
  declare matchCount: CreationOptional<number>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public static initModel(sequelize: Sequelize): typeof StudentFaceLibrary {
    StudentFaceLibrary.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'student_id',
          comment: '学生ID',
        },
        faceToken: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'face_token',
          comment: '百度AI人脸Token',
        },
        referencePhotoUrl: {
          type: DataTypes.STRING(500),
          allowNull: false,
          field: 'reference_photo_url',
          comment: '参考照片URL',
        },
        qualityScore: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0,
          field: 'quality_score',
          comment: '人脸质量评分',
        },
        createdBy: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'created_by',
          comment: '建档老师ID',
        },
        isPrimary: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_primary',
          comment: '是否主要人脸模板',
        },
        lastUsedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_used_at',
          comment: '最后匹配时间',
        },
        matchCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'match_count',
          comment: '成功匹配次数',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'student_face_library',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
      }
    );

    return StudentFaceLibrary;
  }
}





