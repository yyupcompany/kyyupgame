/**
 * 更新幼儿园示例数据
 * 填充真实的幼儿园信息
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

// 真实的幼儿园示例数据
const sampleData = {
  name: '阳光幼儿园',
  description: '阳光幼儿园创办于2015年，是一所集教育、保育、科研为一体的现代化幼儿园。我们秉承"以爱育爱，以心育心"的教育理念，致力于为3-6岁儿童提供优质的学前教育服务。园所占地面积5000平方米，建筑面积3500平方米，拥有宽敞明亮的教室、多功能活动室、户外游乐场等完善的教学设施。我们拥有一支高素质、专业化的教师团队，所有教师均持有幼儿教师资格证，并定期参加专业培训。幼儿园采用国际先进的蒙台梭利教育理念，结合中国传统文化，开设了丰富多彩的特色课程，包括艺术创作、科学探索、体能训练、国学启蒙等，全方位培养孩子的综合素质。',
  studentCount: 280,
  teacherCount: 35,
  classCount: 12,
  contactPerson: '李园长',
  consultationPhone: '400-123-4567',
  address: '北京市朝阳区阳光街123号',
  phone: '010-12345678',
  email: 'sunshine@kindergarten.com',
  principal: '李明',
  area: 5000,
  buildingArea: 3500,
  features: '蒙台梭利教育、双语教学、艺术特色、科学探索、户外活动、营养配餐',
  philosophy: '以爱育爱，以心育心。尊重每个孩子的个性发展，培养具有独立思考能力、创新精神和国际视野的未来公民。',
  feeDescription: '学费：3500元/月（含保教费、餐费）；兴趣班：根据课程不同，200-500元/月；校车接送：500元/月（可选）'
};

async function updateKindergartenData() {
  try {
    console.log('🔧 更新幼儿园示例数据...\n');

    // 查找第一个幼儿园记录
    const [kindergartens] = await sequelize.query(`
      SELECT id FROM kindergartens WHERE status = 1 LIMIT 1
    `);

    if (kindergartens.length === 0) {
      console.log('❌ 未找到幼儿园记录');
      return;
    }

    const kindergartenId = kindergartens[0].id;
    console.log(`✅ 找到幼儿园ID: ${kindergartenId}`);

    // 更新数据
    await sequelize.query(`
      UPDATE kindergartens SET
        name = ?,
        description = ?,
        student_count = ?,
        teacher_count = ?,
        class_count = ?,
        contact_person = ?,
        consultation_phone = ?,
        address = ?,
        phone = ?,
        email = ?,
        principal = ?,
        area = ?,
        building_area = ?,
        features = ?,
        philosophy = ?,
        fee_description = ?,
        updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [
        sampleData.name,
        sampleData.description,
        sampleData.studentCount,
        sampleData.teacherCount,
        sampleData.classCount,
        sampleData.contactPerson,
        sampleData.consultationPhone,
        sampleData.address,
        sampleData.phone,
        sampleData.email,
        sampleData.principal,
        sampleData.area,
        sampleData.buildingArea,
        sampleData.features,
        sampleData.philosophy,
        sampleData.feeDescription,
        kindergartenId
      ]
    });

    console.log('✅ 幼儿园数据更新成功！\n');
    console.log('📋 更新的数据:');
    console.log(`   - 幼儿园名称: ${sampleData.name}`);
    console.log(`   - 学生人数: ${sampleData.studentCount}`);
    console.log(`   - 教师人数: ${sampleData.teacherCount}`);
    console.log(`   - 班级数量: ${sampleData.classCount}`);
    console.log(`   - 联系人: ${sampleData.contactPerson}`);
    console.log(`   - 咨询电话: ${sampleData.consultationPhone}`);
    console.log(`   - 地址: ${sampleData.address}`);
    console.log(`   - 园区面积: ${sampleData.area}平方米`);
    console.log(`   - 建筑面积: ${sampleData.buildingArea}平方米`);

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

updateKindergartenData();

