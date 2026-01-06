import { DataTypes, QueryInterface } from 'sequelize';

/**
 * 为 assessment_questions 表添加语音字段
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('assessment_questions', 'audioUrl', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '题目语音播报URL'
  });
  
  await queryInterface.addColumn('assessment_questions', 'audioText', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '语音播报文本内容'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('assessment_questions', 'audioUrl');
  await queryInterface.removeColumn('assessment_questions', 'audioText');
}





