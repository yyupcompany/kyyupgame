'use strict';

/**
 * 文档中心完整模板种子数据生成脚本
 *
 * 自动生成所有73个模板的种子数据
 * 创建时间: 2025-11-14
 * 模板总数: 73个
 */

const fs = require('fs');
const path = require('path');

// 73个模板的基础信息
const templateConfigs = [
  // ===== 年度检查类 (12个) =====
  {
    id: 1001,
    code: '01-01',
    name: '幼儿园年检自查报告',
    title: '幼儿园年检自查报告',
    description: '幼儿园年度检查综合自查报告，包含办园条件、安全卫生、保育教育等方面全面检查',
    category: 'annual',
    sub_category: 'inspection',
    priority: 'required',
    frequency: 'yearly',
    line_count: 300,
    estimated_fill_time: 120,
    sort_order: 1
  },
  {
    id: 1002,
    code: '01-02',
    name: '幼儿园年检评分表',
    title: '幼儿园年检评分表',
    description: '幼儿园年度检查评分标准表，用于量化评估办园水平',
    category: 'annual',
    sub_category: 'evaluation',
    priority: 'required',
    frequency: 'yearly',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 2
  },
  {
    id: 1003,
    code: '01-03',
    name: '幼儿园基本情况统计表',
    title: '幼儿园基本情况统计表',
    description: '幼儿园基础信息统计表，年检必备文档',
    category: 'annual',
    sub_category: 'statistics',
    priority: 'required',
    frequency: 'yearly',
    line_count: 80,
    estimated_fill_time: 45,
    sort_order: 3
  },
  {
    id: 1004,
    code: '01-04',
    name: '办园行为督导评估自评表',
    title: '办园行为督导评估自评表',
    description: '幼儿园办园行为督导评估自查自评表',
    category: 'annual',
    sub_category: 'supervision',
    priority: 'required',
    frequency: 'yearly',
    line_count: 150,
    estimated_fill_time: 90,
    sort_order: 4
  },
  {
    id: 1005,
    code: '01-05',
    name: '办园条件自查报告',
    title: '办园条件自查报告',
    description: '幼儿园办园条件专项自查报告',
    category: 'annual',
    sub_category: 'conditions',
    priority: 'required',
    frequency: 'yearly',
    line_count: 120,
    estimated_fill_time: 75,
    sort_order: 5
  },
  {
    id: 1006,
    code: '01-06',
    name: '保育教育工作总结',
    title: '保育教育工作总结',
    description: '幼儿园保育教育工作年度总结报告',
    category: 'annual',
    sub_category: 'education',
    priority: 'required',
    frequency: 'yearly',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 6
  },
  {
    id: 1007,
    code: '01-07',
    name: '教师队伍建设情况报告',
    title: '教师队伍建设情况报告',
    description: '幼儿园教师队伍建设年度情况报告',
    category: 'annual',
    sub_category: 'teachers',
    priority: 'required',
    frequency: 'yearly',
    line_count: 80,
    estimated_fill_time: 50,
    sort_order: 7
  },
  {
    id: 1008,
    code: '01-08',
    name: '等级评估申报表',
    title: '等级评估申报表',
    description: '幼儿园等级评估申报申请表',
    category: 'annual',
    sub_category: 'grade_assessment',
    priority: 'optional',
    frequency: 'as_needed',
    line_count: 200,
    estimated_fill_time: 120,
    sort_order: 8
  },
  {
    id: 1009,
    code: '01-09',
    name: '等级评估自评报告',
    title: '等级评估自评报告',
    description: '幼儿园等级评估自查自评报告',
    category: 'annual',
    sub_category: 'grade_assessment',
    priority: 'optional',
    frequency: 'as_needed',
    line_count: 250,
    estimated_fill_time: 150,
    sort_order: 9
  },
  {
    id: 1010,
    code: '01-10',
    name: '普惠性幼儿园认定申请表',
    title: '普惠性幼儿园认定申请表',
    description: '普惠性幼儿园认定申请表格',
    category: 'annual',
    sub_category: 'public_welfare',
    priority: 'optional',
    frequency: 'as_needed',
    line_count: 180,
    estimated_fill_time: 100,
    sort_order: 10
  },
  {
    id: 1011,
    code: '01-11',
    name: '普惠性幼儿园收费承诺书',
    title: '普惠性幼儿园收费承诺书',
    description: '普惠性幼儿园收费标准承诺书',
    category: 'annual',
    sub_category: 'public_welfare',
    priority: 'optional',
    frequency: 'as_needed',
    line_count: 50,
    estimated_fill_time: 30,
    sort_order: 11
  },
  {
    id: 1012,
    code: '01-12',
    name: '办学许可证及相关证照',
    title: '办学许可证及相关证照',
    description: '幼儿园办学许可证及相关证照清单',
    category: 'annual',
    sub_category: 'licenses',
    priority: 'required',
    frequency: 'yearly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 12
  },

  // ===== 专项检查类 (32个) =====
  {
    id: 1013,
    code: '02-13',
    name: '幼儿晨检记录表',
    title: '幼儿晨检记录表',
    description: '每日幼儿健康晨检记录，用于疾病预防和健康监测',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'daily',
    line_count: 50,
    estimated_fill_time: 30,
    sort_order: 13
  },
  {
    id: 1014,
    code: '02-14',
    name: '幼儿午检记录表',
    title: '幼儿午检记录表',
    description: '幼儿午间健康检查记录表',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'daily',
    line_count: 40,
    estimated_fill_time: 25,
    sort_order: 14
  },
  {
    id: 1015,
    code: '02-15',
    name: '因病缺勤追踪登记表',
    title: '因病缺勤追踪登记表',
    description: '幼儿因病缺勤追踪登记记录',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'daily',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 15
  },
  {
    id: 1016,
    code: '02-16',
    name: '传染病疫情报告记录',
    title: '传染病疫情报告记录',
    description: '幼儿园传染病疫情报告记录表',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'as_needed',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 16
  },
  {
    id: 1017,
    code: '02-17',
    name: '预防接种证查验登记表',
    title: '预防接种证查验登记表',
    description: '幼儿预防接种证查验登记记录',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'semester',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 17
  },
  {
    id: 1018,
    code: '02-18',
    name: '幼儿健康检查记录表',
    title: '幼儿健康检查记录表',
    description: '幼儿定期健康检查记录表',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'semester',
    line_count: 80,
    estimated_fill_time: 50,
    sort_order: 18
  },
  {
    id: 1019,
    code: '02-19',
    name: '卫生消毒记录表',
    title: '卫生消毒记录表',
    description: '幼儿园日常卫生消毒记录表',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'daily',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 19
  },
  {
    id: 1020,
    code: '02-20',
    name: '紫外线消毒记录表',
    title: '紫外线消毒记录表',
    description: '紫外线灯消毒使用记录表',
    category: 'special',
    sub_category: 'health',
    priority: 'required',
    frequency: 'daily',
    line_count: 40,
    estimated_fill_time: 20,
    sort_order: 20
  },
  {
    id: 1021,
    code: '02-21',
    name: '食品采购台账',
    title: '食品采购台账',
    description: '幼儿园食品采购记录台账',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'daily',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 21
  },
  {
    id: 1022,
    code: '02-22',
    name: '食品留样记录表',
    title: '食品留样记录表',
    description: '幼儿园食品留样管理记录表',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'daily',
    line_count: 50,
    estimated_fill_time: 25,
    sort_order: 22
  },
  {
    id: 1023,
    code: '02-23',
    name: '食品安全自查记录表',
    title: '食品安全自查记录表',
    description: '幼儿园食品安全定期自查记录',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'weekly',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 23
  },
  {
    id: 1024,
    code: '02-24',
    name: '从业人员健康证明登记表',
    title: '从业人员健康证明登记表',
    description: '厨房及保育人员健康证明登记表',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'yearly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 24
  },
  {
    id: 1025,
    code: '02-25',
    name: '食堂设备清洗消毒记录',
    title: '食堂设备清洗消毒记录',
    description: '食堂设备清洗消毒日常记录',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'daily',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 25
  },
  {
    id: 1026,
    code: '02-26',
    name: '食品安全事故应急预案',
    title: '食品安全事故应急预案',
    description: '幼儿园食品安全事故应急预案',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'yearly',
    line_count: 120,
    estimated_fill_time: 80,
    sort_order: 26
  },
  {
    id: 1027,
    code: '02-27',
    name: '每周食谱公示表',
    title: '每周食谱公示表',
    description: '幼儿园每周营养食谱公示表',
    category: 'special',
    sub_category: 'food_safety',
    priority: 'required',
    frequency: 'weekly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 27
  },
  {
    id: 1028,
    code: '02-28',
    name: '消防设施检查记录表',
    title: '消防设施检查记录表',
    description: '幼儿园消防设施定期检查记录',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'monthly',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 28
  },
  {
    id: 1029,
    code: '02-29',
    name: '消防安全自查记录表',
    title: '消防安全自查记录表',
    description: '幼儿园消防安全定期自查记录',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'monthly',
    line_count: 100,
    estimated_fill_time: 50,
    sort_order: 29
  },
  {
    id: 1030,
    code: '02-30',
    name: '灭火器检查记录表',
    title: '灭火器检查记录表',
    description: '灭火器定期检查维护记录',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'monthly',
    line_count: 50,
    estimated_fill_time: 25,
    sort_order: 30
  },
  {
    id: 1031,
    code: '02-31',
    name: '应急疏散演练记录表',
    title: '应急疏散演练记录表',
    description: '幼儿园应急疏散演练活动记录',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'semester',
    line_count: 70,
    estimated_fill_time: 40,
    sort_order: 31
  },
  {
    id: 1032,
    code: '02-32',
    name: '消防安全培训记录表',
    title: '消防安全培训记录表',
    description: '消防安全知识培训记录',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'semester',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 32
  },
  {
    id: 1033,
    code: '02-33',
    name: '火灾应急预案',
    title: '火灾应急预案',
    description: '幼儿园火灾事故应急预案',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'yearly',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 33
  },
  {
    id: 1034,
    code: '02-34',
    name: '消防安全责任书',
    title: '消防安全责任书',
    description: '幼儿园消防安全责任承诺书',
    category: 'special',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'yearly',
    line_count: 50,
    estimated_fill_time: 25,
    sort_order: 34
  },
  {
    id: 1035,
    code: '02-35',
    name: '校车安全检查记录表',
    title: '校车安全检查记录表',
    description: '校车安全状况日常检查记录',
    category: 'special',
    sub_category: 'school_bus',
    priority: 'conditional',
    frequency: 'daily',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 35
  },
  {
    id: 1036,
    code: '02-36',
    name: '校车驾驶员资质登记表',
    title: '校车驾驶员资质登记表',
    description: '校车驾驶员资质信息登记表',
    category: 'special',
    sub_category: 'school_bus',
    priority: 'conditional',
    frequency: 'yearly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 36
  },
  {
    id: 1037,
    code: '02-37',
    name: '校车随车照管人员登记表',
    title: '校车随车照管人员登记表',
    description: '校车随车照管人员信息登记表',
    category: 'special',
    sub_category: 'school_bus',
    priority: 'conditional',
    frequency: 'yearly',
    line_count: 50,
    estimated_fill_time: 25,
    sort_order: 37
  },
  {
    id: 1038,
    code: '02-38',
    name: '校车运行记录表',
    title: '校车运行记录表',
    description: '校车日常运行情况记录表',
    category: 'special',
    sub_category: 'school_bus',
    priority: 'conditional',
    frequency: 'daily',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 38
  },
  {
    id: 1039,
    code: '02-39',
    name: '校车安全应急预案',
    title: '校车安全应急预案',
    description: '校车安全事故应急预案',
    category: 'special',
    sub_category: 'school_bus',
    priority: 'conditional',
    frequency: 'yearly',
    line_count: 90,
    estimated_fill_time: 50,
    sort_order: 39
  },
  {
    id: 1040,
    code: '02-40',
    name: '安全隐患排查记录表',
    title: '安全隐患排查记录表',
    description: '幼儿园安全隐患定期排查记录',
    category: 'special',
    sub_category: 'safety_production',
    priority: 'required',
    frequency: 'monthly',
    line_count: 100,
    estimated_fill_time: 50,
    sort_order: 40
  },
  {
    id: 1041,
    code: '02-41',
    name: '安全隐患整改台账',
    title: '安全隐患整改台账',
    description: '安全隐患整改跟踪管理台账',
    category: 'special',
    sub_category: 'safety_production',
    priority: 'required',
    frequency: 'monthly',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 41
  },
  {
    id: 1042,
    code: '02-42',
    name: '安全生产责任书',
    title: '安全生产责任书',
    description: '幼儿园安全生产责任承诺书',
    category: 'special',
    sub_category: 'safety_production',
    priority: 'required',
    frequency: 'yearly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 42
  },
  {
    id: 1043,
    code: '02-43',
    name: '安全教育培训记录表',
    title: '安全教育培训记录表',
    description: '幼儿园安全教育培训活动记录',
    category: 'special',
    sub_category: 'safety_production',
    priority: 'required',
    frequency: 'semester',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 43
  },
  {
    id: 1044,
    code: '02-44',
    name: '突发事件应急预案',
    title: '突发事件应急预案',
    description: '幼儿园突发事件总体应急预案',
    category: 'special',
    sub_category: 'emergency',
    priority: 'required',
    frequency: 'yearly',
    line_count: 120,
    estimated_fill_time: 80,
    sort_order: 44
  },

  // ===== 常态化督导类 (5个) =====
  {
    id: 1045,
    code: '03-45',
    name: '责任督学月度检查记录表',
    title: '责任督学月度检查记录表',
    description: '责任督学月度检查督导记录',
    category: 'routine',
    sub_category: 'supervision',
    priority: 'required',
    frequency: 'monthly',
    line_count: 90,
    estimated_fill_time: 45,
    sort_order: 45
  },
  {
    id: 1046,
    code: '03-46',
    name: '督导问题整改报告',
    title: '督导问题整改报告',
    description: '督导检查问题整改落实报告',
    category: 'routine',
    sub_category: 'supervision',
    priority: 'required',
    frequency: 'as_needed',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 46
  },
  {
    id: 1047,
    code: '03-47',
    name: '保教质量自查表',
    title: '保教质量自查表',
    description: '幼儿园保教质量定期自查表',
    category: 'routine',
    sub_category: 'quality',
    priority: 'required',
    frequency: 'semester',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 47
  },
  {
    id: 1048,
    code: '03-48',
    name: '日常巡查记录表',
    title: '日常巡查记录表',
    description: '幼儿园日常管理巡查记录',
    category: 'routine',
    sub_category: 'inspection',
    priority: 'required',
    frequency: 'weekly',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 48
  },
  {
    id: 1049,
    code: '03-49',
    name: '规范办园自查表',
    title: '规范办园自查表',
    description: '幼儿园规范办园情况自查表',
    category: 'routine',
    sub_category: 'compliance',
    priority: 'required',
    frequency: 'semester',
    line_count: 120,
    estimated_fill_time: 70,
    sort_order: 49
  },

  // ===== 教职工管理类 (6个) =====
  {
    id: 1050,
    code: '04-50',
    name: '教职工花名册',
    title: '教职工花名册',
    description: '幼儿园全体教职工基本信息登记表，年检必备文档',
    category: 'staff',
    sub_category: 'management',
    priority: 'required',
    frequency: 'yearly',
    line_count: 200,
    estimated_fill_time: 120,
    sort_order: 50
  },
  {
    id: 1051,
    code: '04-51',
    name: '教师资格证登记表',
    title: '教师资格证登记表',
    description: '教师资格证书登记管理表',
    category: 'staff',
    sub_category: 'qualifications',
    priority: 'required',
    frequency: 'yearly',
    line_count: 80,
    estimated_fill_time: 45,
    sort_order: 51
  },
  {
    id: 1052,
    code: '04-52',
    name: '教职工健康证明登记表',
    title: '教职工健康证明登记表',
    description: '教职工健康证明登记管理表',
    category: 'staff',
    sub_category: 'health',
    priority: 'required',
    frequency: 'yearly',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 52
  },
  {
    id: 1053,
    code: '04-53',
    name: '教师培训记录表',
    title: '教师培训记录表',
    description: '教师参加培训学习记录表',
    category: 'staff',
    sub_category: 'training',
    priority: 'required',
    frequency: 'continuous',
    line_count: 100,
    estimated_fill_time: 50,
    sort_order: 53
  },
  {
    id: 1054,
    code: '04-54',
    name: '教师考勤记录表',
    title: '教师考勤记录表',
    description: '教职工月度考勤记录表',
    category: 'staff',
    sub_category: 'attendance',
    priority: 'required',
    frequency: 'monthly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 54
  },
  {
    id: 1055,
    code: '04-55',
    name: '教师绩效考核表',
    title: '教师绩效考核表',
    description: '教师月度/学期绩效考核表',
    category: 'staff',
    sub_category: 'evaluation',
    priority: 'required',
    frequency: 'semester',
    line_count: 120,
    estimated_fill_time: 80,
    sort_order: 55
  },

  // ===== 幼儿管理类 (5个) =====
  {
    id: 1056,
    code: '05-56',
    name: '幼儿花名册',
    title: '幼儿花名册',
    description: '在园幼儿基本信息登记表，年检必备文档',
    category: 'student',
    sub_category: 'management',
    priority: 'required',
    frequency: 'semester',
    line_count: 150,
    estimated_fill_time: 180,
    sort_order: 56
  },
  {
    id: 1057,
    code: '05-57',
    name: '幼儿入园体检表',
    title: '幼儿入园体检表',
    description: '新生入园健康检查记录表',
    category: 'student',
    sub_category: 'health',
    priority: 'required',
    frequency: 'as_needed',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 57
  },
  {
    id: 1058,
    code: '05-58',
    name: '幼儿成长档案',
    title: '幼儿成长档案',
    description: '幼儿个人成长发展档案',
    category: 'student',
    sub_category: 'development',
    priority: 'required',
    frequency: 'continuous',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 58
  },
  {
    id: 1059,
    code: '05-59',
    name: '幼儿接送登记表',
    title: '幼儿接送登记表',
    description: '幼儿每日接送安全记录表',
    category: 'student',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'daily',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 59
  },
  {
    id: 1060,
    code: '05-60',
    name: '幼儿意外伤害记录表',
    title: '幼儿意外伤害记录表',
    description: '幼儿意外伤害事故记录处理表',
    category: 'student',
    sub_category: 'safety',
    priority: 'required',
    frequency: 'as_needed',
    line_count: 90,
    estimated_fill_time: 45,
    sort_order: 60
  },

  // ===== 财务管理类 (5个) =====
  {
    id: 1061,
    code: '06-61',
    name: '收费公示表',
    title: '收费公示表',
    description: '幼儿园收费项目标准公示表',
    category: 'finance',
    sub_category: 'fees',
    priority: 'required',
    frequency: 'yearly',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 61
  },
  {
    id: 1062,
    code: '06-62',
    name: '财务收支明细表',
    title: '财务收支明细表',
    description: '幼儿园财务收支明细记录表',
    category: 'finance',
    sub_category: 'accounting',
    priority: 'required',
    frequency: 'monthly',
    line_count: 100,
    estimated_fill_time: 60,
    sort_order: 62
  },
  {
    id: 1063,
    code: '06-63',
    name: '固定资产登记表',
    title: '固定资产登记表',
    description: '幼儿园固定资产登记管理表',
    category: 'finance',
    sub_category: 'assets',
    priority: 'required',
    frequency: 'yearly',
    line_count: 120,
    estimated_fill_time: 80,
    sort_order: 63
  },
  {
    id: 1064,
    code: '06-64',
    name: '采购合同登记表',
    title: '采购合同登记表',
    description: '采购合同登记管理表',
    category: 'finance',
    sub_category: 'procurement',
    priority: 'required',
    frequency: 'continuous',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 64
  },
  {
    id: 1065,
    code: '06-65',
    name: '经费使用情况报告',
    title: '经费使用情况报告',
    description: '幼儿园经费使用情况报告',
    category: 'finance',
    sub_category: 'budget',
    priority: 'required',
    frequency: 'semester',
    line_count: 90,
    estimated_fill_time: 50,
    sort_order: 65
  },

  // ===== 保教工作类 (8个) =====
  {
    id: 1066,
    code: '07-66',
    name: '教学计划',
    title: '教学计划',
    description: '幼儿园学期教学计划表',
    category: 'education',
    sub_category: 'planning',
    priority: 'required',
    frequency: 'semester',
    line_count: 100,
    estimated_fill_time: 70,
    sort_order: 66
  },
  {
    id: 1067,
    code: '07-67',
    name: '周活动计划表',
    title: '周活动计划表',
    description: '班级周活动教学计划表',
    category: 'education',
    sub_category: 'planning',
    priority: 'required',
    frequency: 'weekly',
    line_count: 80,
    estimated_fill_time: 50,
    sort_order: 67
  },
  {
    id: 1068,
    code: '07-68',
    name: '教研活动记录表',
    title: '教研活动记录表',
    description: '教师教研活动记录表',
    category: 'education',
    sub_category: 'research',
    priority: 'required',
    frequency: 'weekly',
    line_count: 70,
    estimated_fill_time: 40,
    sort_order: 68
  },
  {
    id: 1069,
    code: '07-69',
    name: '家长会记录表',
    title: '家长会记录表',
    description: '家长会活动记录表',
    category: 'education',
    sub_category: 'parent_communication',
    priority: 'required',
    frequency: 'semester',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 69
  },
  {
    id: 1070,
    code: '07-70',
    name: '家访记录表',
    title: '家访记录表',
    description: '教师家访活动记录表',
    category: 'education',
    sub_category: 'parent_communication',
    priority: 'required',
    frequency: 'continuous',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 70
  },
  {
    id: 1071,
    code: '07-71',
    name: '幼儿观察记录表',
    title: '幼儿观察记录表',
    description: '幼儿日常发展观察记录表',
    category: 'education',
    sub_category: 'observation',
    priority: 'required',
    frequency: 'daily',
    line_count: 80,
    estimated_fill_time: 40,
    sort_order: 71
  },
  {
    id: 1072,
    code: '07-72',
    name: '区域活动记录表',
    title: '区域活动记录表',
    description: '区域活动开展情况记录表',
    category: 'education',
    sub_category: 'activities',
    priority: 'required',
    frequency: 'daily',
    line_count: 70,
    estimated_fill_time: 35,
    sort_order: 72
  },
  {
    id: 1073,
    code: '07-73',
    name: '户外活动记录表',
    title: '户外活动记录表',
    description: '户外体育活动开展记录表',
    category: 'education',
    sub_category: 'activities',
    priority: 'required',
    frequency: 'daily',
    line_count: 60,
    estimated_fill_time: 30,
    sort_order: 73
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    try {
      console.log('🚀 开始插入73个文档模板种子数据...');

      // 获取管理员ID
      const [users] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE username = 'admin' LIMIT 1"
      );
      const adminId = users[0]?.id || 1;

      // 检查表是否存在
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('document_templates')) {
        console.log('❌ document_templates表不存在，跳过种子数据插入');
        return;
      }

      // 检查是否已有数据
      const existingCount = await queryInterface.sequelize.query(
        "SELECT COUNT(*) as count FROM document_templates WHERE code LIKE '01-%' OR code LIKE '02-%' OR code LIKE '03-%' OR code LIKE '04-%' OR code LIKE '05-%' OR code LIKE '06-%' OR code LIKE '07-%'",
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (existingCount[0].count >= 70) {
        console.log(`✅ 已存在${existingCount[0].count}个模板数据，跳过插入`);
        return;
      }

      // 生成所有模板数据
      const templates = templateConfigs.map(config => ({
        ...config,
        content_type: 'markdown',
        template_content: generateTemplateContent(config),
        variables: JSON.stringify(generateTemplateVariables(config)),
        is_detailed: config.line_count > 100,
        is_system: true,
        is_active: true,
        version: '1.0',
        created_by: adminId,
        updated_by: adminId,
        created_at: now,
        updated_at: now
      }));

      console.log(`📝 准备插入${templates.length}个模板...`);

      await queryInterface.bulkInsert('document_templates', templates);

      console.log(`✅ 成功插入${templates.length}个文档模板种子数据！`);

    } catch (error) {
      console.error('❌ 插入文档模板种子数据失败:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🗑️ 开始删除73个文档模板种子数据...');

      // 检查表是否存在
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('document_templates')) {
        console.log('❌ document_templates表不存在，跳过数据删除');
        return;
      }

      const deletedCount = await queryInterface.bulkDelete('document_templates', {
        code: {
          [Sequelize.Op.or]: [
            { [Sequelize.Op.like]: '01-%' },
            { [Sequelize.Op.like]: '02-%' },
            { [Sequelize.Op.like]: '03-%' },
            { [Sequelize.Op.like]: '04-%' },
            { [Sequelize.Op.like]: '05-%' },
            { [Sequelize.Op.like]: '06-%' },
            { [Sequelize.Op.like]: '07-%' }
          ]
        }
      });

      console.log(`✅ 成功删除文档模板种子数据`);

    } catch (error) {
      console.error('❌ 删除文档模板种子数据失败:', error);
      throw error;
    }
  }
};

// 生成模板内容
function generateTemplateContent(config) {
  return `# ${config.title}

**幼儿园名称**: {{幼儿园名称}}
**填写日期**: {{填写日期}}
**填写人员**: {{填写人员}}

---

## 模板说明

本模板为${config.description}，请根据实际情况填写相关内容。

---

## 基本信息

| 项目 | 内容 |
|------|------|
| 模板编号 | ${config.code} |
| 使用频率 | ${config.frequency} |
| 填写时长 | 约${config.estimated_fill_time}分钟 |
| 优先级 | ${config.priority} |

---

## 填写说明

请按照以下要求填写本模板：

1. **基本信息**: 填写幼儿园基本信息
2. **检查内容**: 根据实际情况逐项检查填写
3. **发现问题**: 详细记录发现的问题
4. **整改措施**: 制定相应的整改措施
5. **签字确认**: 相关人员签字确认

---

## 注意事项

- 所有信息必须真实准确
- 发现问题要及时整改
- 定期更新相关记录
- 妥善保管相关资料

---

**填表人**: ________________
**审核人**: ________________
**日期**: {{填写日期}}`;
}

// 生成模板变量
function generateTemplateVariables(config) {
  const baseVariables = [
    { name: '幼儿园名称', label: '幼儿园名称', type: 'string', required: true, default: '' },
    { name: '填写日期', label: '填写日期', type: 'date', required: true, default: '{{today}}' },
    { name: '填写人员', label: '填写人员', type: 'string', required: true, default: '' }
  ];

  // 根据不同类别添加特定变量
  const categoryVariables = {
    'annual': [
      { name: '检查年度', label: '检查年度', type: 'string', required: true, default: '' },
      { name: '自查日期', label: '自查日期', type: 'date', required: true, default: '{{today}}' },
      { name: '园长姓名', label: '园长姓名', type: 'string', required: true, default: '' }
    ],
    'special': [
      { name: '检查日期', label: '检查日期', type: 'date', required: true, default: '{{today}}' },
      { name: '检查人员', label: '检查人员', type: 'string', required: true, default: '' }
    ],
    'routine': [
      { name: '检查时间', label: '检查时间', type: 'datetime', required: true, default: '' },
      { name: '督导人员', label: '督导人员', type: 'string', required: true, default: '' }
    ],
    'staff': [
      { name: '统计日期', label: '统计日期', type: 'date', required: true, default: '{{today}}' },
      { name: '制表人', label: '制表人', type: 'string', required: true, default: '' }
    ],
    'student': [
      { name: '统计日期', label: '统计日期', type: 'date', required: true, default: '{{today}}' },
      { name: '班级', label: '班级', type: 'string', required: true, default: '' }
    ],
    'finance': [
      { name: '统计期间', label: '统计期间', type: 'string', required: true, default: '' },
      { name: '负责人', label: '负责人', type: 'string', required: true, default: '' }
    ],
    'education': [
      { name: '学期', label: '学期', type: 'string', required: true, default: '' },
      { name: '班级', label: '班级', type: 'string', required: true, default: '' }
    ]
  };

  return [...baseVariables, ...(categoryVariables[config.category] || [])];
}