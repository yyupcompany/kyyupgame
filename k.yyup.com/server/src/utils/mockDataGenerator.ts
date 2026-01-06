/**
 * 模拟数据生成器
 * 生成符合真实场景的测试数据
 */

// 真实姓氏库
const lastNames = [
  '李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '邓', '冯', '韩', '曹',
  '曾', '彭', '萧', '蔡', '潘', '田', '董', '袁', '于', '余',
  '叶', '蒋', '杜', '苏', '魏', '程', '吕', '丁', '沈', '任',
  '姚', '卢', '傅', '钟', '姜', '崔', '谭', '廖', '范', '汪',
  '陆', '金', '石', '戴', '贾', '韦', '夏', '邱', '方', '侯',
  '邹', '熊', '孟', '秦', '白', '江', '阎', '薛', '尹', '段',
  '雷', '黎', '史', '龙', '贺', '陶', '顾', '毛', '郝', '龚',
  '邵', '万', '钱', '严', '覃', '武', '戚', '莫', '孔', '向'
];

// 真实名字常用字
const firstNameChars = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军',
  '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞',
  '平', '刚', '桂英', '文', '云', '洁', '红', '健', '亮', '浩',
  '凯', '慧', '翔', '亚', '萍', '莉', '博', '悦', '勤', '宇',
  '晶', '越', '佳', '宁', '子', '琪', '欣', '雅', '诗', '如',
  '宝', '璐', '佩', '宏', '依', '昊', '哲', '菲', '昕', '楠',
  '智', '颖', '玉', '建', '莹', '晨', '睿', '阳', '思', '峰',
  '雪', '尧', '瑜', '皓', '玲', '冰', '瑶', '虹', '瑞', '泽',
  '旭', '恒', '嘉', '雨', '婷', '淼', '晓', '轩', '希', '芮',
  '航', '硕', '泓', '宸', '梓', '晗', '煜', '辰', '宣', '俊'
];

// 儿童名字常用字（偏可爱、活泼）
const childFirstNameChars = [
  '萌', '乐', '佳', '欢', '悦', '宝', '瑶', '睿', '安', '诺',
  '甜', '乖', '聪', '美', '阳', '洋', '嘉', '茹', '辰', '轩',
  '乐乐', '果果', '嘟嘟', '多多', '贝贝', '晨晨', '萱萱', '悦悦', '然然', '泡泡',
  '铛铛', '小小', '淘淘', '可可', '豆豆', '点点', '笑笑', '圆圆', '甜甜', '跳跳',
  '天天', '亮亮', '旺旺', '康康', '丫丫', '毛毛', '彤彤', '莹莹', '童童', '菲菲',
  '皮皮', '明明', '朵朵', '安安', '乐乐', '欢欢', '哈哈', '乐乐', '露露', '畅畅',
  '萌萌', '阳阳', '星星', '晶晶', '洋洋', '蓓蓓', '晨晨', '乐乐', '静静', '泡泡',
  '皮皮', '佳佳', '楠楠', '婷婷', '宝宝', '贝贝', '宁宁', '莎莎', '飞飞', '加加'
];

// 学历级别
const educationLevels = ['高中', '专科', '本科', '硕士', '博士'];

// 职业类型
const occupations = [
  '工程师', '教师', '医生', '律师', '会计师', '销售经理', '市场专员',
  '人力资源专员', '客户服务代表', '产品经理', '设计师', '研究员',
  '公务员', '企业家', '银行职员', '保险顾问', '投资顾问', '编辑',
  '记者', '厨师', '健身教练', '导游', '飞行员', '护士', '药剂师',
  '物流专员', '建筑师', '室内设计师', '程序员', '网络工程师'
];

// 公司名称库
const companies = [
  '腾讯科技', '阿里巴巴', '字节跳动', '百度科技', '京东集团',
  '网易科技', '美团点评', '滴滴出行', '小米科技', '华为技术',
  '中国移动', '中国电信', '中国银行', '工商银行', '建设银行',
  '招商银行', '平安保险', '太平洋保险', '国泰君安证券', '海通证券',
  '宝钢集团', '中石油', '中石化', '中国铁建', '中国建筑',
  '万科地产', '恒大地产', '碧桂园', '融创中国', '保利地产',
  '联想集团', '海尔集团', '格力电器', '美的集团', '苏宁易购',
  '国美电器', '中兴通讯', '上汽集团', '一汽集团', '东风汽车',
  '青岛啤酒', '五粮液集团', '茅台集团', '蒙牛乳业', '伊利集团'
];

// 幼儿园班级名称
const classTypes = ['小班', '中班', '大班'];
const classNames = ['向日葵', '蒲公英', '玫瑰', '郁金香', '荷花', '百合', '樱花', '桂花', '苹果', '香蕉'];

// 活动类型
const activityTypes = ['开放日', '亲子活动', '才艺表演', '户外游玩', '节日庆祝', '科学探索', '手工制作', '体育活动', '音乐舞蹈', '绘画展览'];

/**
 * 生成随机整数，包括min和max
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机真实姓名
 * @param isFemale 是否女性
 * @param isChild 是否儿童
 */
export const generateRealName = (isFemale: boolean = Math.random() > 0.5, isChild: boolean = false): string => {
  const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
  
  let firstNamePool = isChild ? childFirstNameChars : firstNameChars;
  // 使用更适合女性/男性的名字
  const firstNameIndex = getRandomInt(0, firstNamePool.length - 1);
  const firstName = firstNamePool[firstNameIndex];
  
  return lastName + firstName;
};

/**
 * 生成随机手机号
 */
export const generatePhoneNumber = (): string => {
  const prefixes = ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '184', '187', '188', '178', '170', '186'];
  const prefix = prefixes[getRandomInt(0, prefixes.length - 1)];
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += getRandomInt(0, 9).toString();
  }
  return prefix + suffix;
};

/**
 * 生成随机邮箱
 * @param name 姓名
 */
export const generateEmail = (name: string): string => {
  const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'hotmail.com', 'sina.com', 'sohu.com', 'yahoo.com'];
  const domain = domains[getRandomInt(0, domains.length - 1)];
  
  // 将姓名转为拼音（这里简化处理，实际应使用拼音转换库）
  const namePinyin = name.replace(/[\u4e00-\u9fa5]/g, '').toLowerCase() || 'user';
  
  return `${namePinyin}${getRandomInt(1000, 9999)}@${domain}`;
};

/**
 * 生成随机生日（2.5-6岁儿童）
 */
export const generateChildBirthday = (): Date => {
  const now = new Date();
  const minAge = 2.5; // 2.5岁
  const maxAge = 6; // 6岁
  
  // 计算日期范围（以天为单位）
  const minDaysAgo = Math.floor(maxAge * 365);
  const maxDaysAgo = Math.floor(minAge * 365);
  
  // 随机天数
  const randomDaysAgo = getRandomInt(maxDaysAgo, minDaysAgo);
  
  // 计算出生日期
  const birthDate = new Date(now);
  birthDate.setDate(birthDate.getDate() - randomDaysAgo);
  
  return birthDate;
};

/**
 * 生成随机教育程度
 */
export const generateEducationLevel = (): string => {
  return educationLevels[getRandomInt(0, educationLevels.length - 1)];
};

/**
 * 生成随机职业
 */
export const generateOccupation = (): string => {
  return occupations[getRandomInt(0, occupations.length - 1)];
};

/**
 * 生成随机公司名称
 */
export const generateCompany = (): string => {
  return companies[getRandomInt(0, companies.length - 1)];
};

/**
 * 生成随机班级名称
 */
export const generateClassName = (): string => {
  const type = classTypes[getRandomInt(0, classTypes.length - 1)];
  const name = classNames[getRandomInt(0, classNames.length - 1)];
  return `${type}${name}班`;
};

/**
 * 生成随机活动名称
 */
export const generateActivityName = (): string => {
  const type = activityTypes[getRandomInt(0, activityTypes.length - 1)];
  const season = ['春季', '夏季', '秋季', '冬季'][getRandomInt(0, 3)];
  return `${season}${type}`;
};

/**
 * 生成随机地址
 */
export const generateAddress = (): string => {
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '河南省', '四川省', '湖北省', '湖南省'];
  const cities = ['北京市', '上海市', '广州市', '深圳市', '南京市', '杭州市', '济南市', '郑州市', '成都市', '武汉市', '长沙市'];
  const districts = ['朝阳区', '海淀区', '浦东新区', '天河区', '福田区', '玄武区', '西湖区', '历下区', '金水区', '武侯区', '洪山区', '岳麓区'];
  const streets = ['中关村', '望京', '陆家嘴', '珠江新城', '车公庙', '新街口', '西溪', '山大路', '农业路', '科华北路', '光谷', '麓山'];
  
  const province = provinces[getRandomInt(0, provinces.length - 1)];
  const city = cities[getRandomInt(0, cities.length - 1)];
  const district = districts[getRandomInt(0, districts.length - 1)];
  const street = streets[getRandomInt(0, streets.length - 1)];
  const number = getRandomInt(1, 200);
  
  return `${province}${city}${district}${street}${number}号`;
};

export default {
  getRandomInt,
  generateRealName,
  generatePhoneNumber,
  generateEmail,
  generateChildBirthday,
  generateEducationLevel,
  generateOccupation,
  generateCompany,
  generateClassName,
  generateActivityName,
  generateAddress
}; 
 
 