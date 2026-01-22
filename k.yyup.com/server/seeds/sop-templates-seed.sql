-- ============================================
-- SOP模板系统种子数据
-- 描述: 创建默认的销售SOP模板
-- ============================================

-- 获取k004租户ID（假设为1，实际应根据环境调整）
SET @tenant_id = 1;

-- 1. 插入默认销售SOP模板
INSERT INTO sop_templates (name, type, description, icon, color, is_system, is_active, sort_order, tenant_id)
VALUES 
('标准销售跟进流程', 'sales', '适用于幼儿园招生的标准销售跟进SOP，包含从初次接触到签约成交的完整流程。', 'TrendingUp', '#67C23A', TRUE, TRUE, 1, @tenant_id);

-- 获取刚插入的模板ID
SET @template_id = LAST_INSERT_ID();

-- 2. 插入销售SOP的5个节点
INSERT INTO sop_template_nodes (template_id, node_order, node_name, node_description, content_type, content_data, feedback_config, duration_days, is_required, checklist)
VALUES 
-- 节点1：初次联系
(@template_id, 1, '初次联系', '与客户建立首次联系，了解基本需求', 'mixed', JSON_OBJECT(
  'text', JSON_OBJECT(
    'title', '初次联系要点',
    'content', '<h3>沟通目标</h3><ul><li>了解客户基本信息（孩子年龄、家庭住址）</li><li>了解客户关注点和需求</li><li>建立初步信任关系</li><li>约定下次联系时间</li></ul><h3>话术参考</h3><p>您好，我是XX幼儿园的XXX老师。请问您的孩子今年多大了？方便了解一下您对幼儿园的期望吗？</p>',
    'summary', '建立首次联系，了解基本需求'
  ),
  'videos', JSON_ARRAY(),
  'images', JSON_ARRAY(),
  'audios', JSON_ARRAY(),
  'documents', JSON_ARRAY()
), JSON_OBJECT(
  'type', 'form',
  'required', TRUE,
  'fields', JSON_ARRAY(
    JSON_OBJECT('id', 'customer_attitude', 'label', '客户态度', 'type', 'select', 'options', JSON_ARRAY('热情', '一般', '冷淡'), 'required', TRUE),
    JSON_OBJECT('id', 'child_age', 'label', '孩子年龄', 'type', 'number', 'required', TRUE),
    JSON_OBJECT('id', 'key_concerns', 'label', '关注要点', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'next_contact', 'label', '下次联系时间', 'type', 'text', 'required', FALSE)
  )
), 3, TRUE, JSON_ARRAY(
  '记录客户基本信息',
  '了解孩子年龄和特点',
  '询问关注的重点',
  '约定下次联系时间'
)),

-- 节点2：预约参观
(@template_id, 2, '预约参观', '邀请客户到园参观，展示园区环境和课程', 'mixed', JSON_OBJECT(
  'text', JSON_OBJECT(
    'title', '预约参观指南',
    'content', '<h3>参观准备</h3><ul><li>提前确认参观时间（避开活动高峰期）</li><li>准备园区介绍资料</li><li>安排专人接待讲解</li><li>准备小礼品或体验课</li></ul><h3>参观路线</h3><ol><li>前台接待→环境介绍</li><li>教室参观→课程展示</li><li>活动区域→特色介绍</li><li>办公室洽谈→答疑解惑</li></ol>',
    'summary', '邀请客户实地参观园区'
  ),
  'videos', JSON_ARRAY(),
  'images', JSON_ARRAY(),
  'audios', JSON_ARRAY(),
  'documents', JSON_ARRAY()
), JSON_OBJECT(
  'type', 'form',
  'required', TRUE,
  'fields', JSON_ARRAY(
    JSON_OBJECT('id', 'visit_date', 'label', '参观日期', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'visit_feedback', 'label', '客户反馈', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'satisfaction', 'label', '满意度', 'type', 'select', 'options', JSON_ARRAY('非常满意', '满意', '一般', '不满意'), 'required', TRUE)
  )
), 5, TRUE, JSON_ARRAY(
  '预约参观时间',
  '准备介绍资料',
  '安排接待人员',
  '记录客户反馈'
)),

-- 节点3：试听体验
(@template_id, 3, '试听体验', '安排孩子试听体验课，收集反馈', 'mixed', JSON_OBJECT(
  'text', JSON_OBJECT(
    'title', '试听体验流程',
    'content', '<h3>体验课安排</h3><ul><li>根据孩子年龄安排合适班级</li><li>选择特色课程或主题活动</li><li>准备体验课所需材料</li><li>安排老师全程关注</li></ul><h3>观察要点</h3><ul><li>孩子的适应能力</li><li>与其他小朋友的互动</li><li>对课程的兴趣程度</li><li>家长的观察反馈</li></ul>',
    'summary', '安排孩子体验课程'
  ),
  'videos', JSON_ARRAY(),
  'images', JSON_ARRAY(),
  'audios', JSON_ARRAY(),
  'documents', JSON_ARRAY()
), JSON_OBJECT(
  'type', 'form',
  'required', TRUE,
  'fields', JSON_ARRAY(
    JSON_OBJECT('id', 'trial_date', 'label', '体验日期', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'child_performance', 'label', '孩子表现', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'parent_feedback', 'label', '家长反馈', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'interest_level', 'label', '意向程度', 'type', 'select', 'options', JSON_ARRAY('强烈', '中等', '较弱'), 'required', TRUE)
  )
), 7, TRUE, JSON_ARRAY(
  '安排试听课程',
  '观察孩子表现',
  '收集家长反馈',
  '评估入园意向'
)),

-- 节点4：方案讲解
(@template_id, 4, '方案讲解', '根据客户需求讲解报名方案和优惠政策', 'mixed', JSON_OBJECT(
  'text', JSON_OBJECT(
    'title', '方案讲解要点',
    'content', '<h3>方案内容</h3><ul><li>课程安排和教学特色</li><li>收费标准和缴费方式</li><li>优惠政策和活动</li><li>入园流程和时间</li></ul><h3>解决疑虑</h3><ul><li>针对性回答家长关注的问题</li><li>对比其他园所的优势</li><li>提供成功案例和家长评价</li><li>给予适当的优惠激励</li></ul>',
    'summary', '讲解报名方案和政策'
  ),
  'videos', JSON_ARRAY(),
  'images', JSON_ARRAY(),
  'audios', JSON_ARRAY(),
  'documents', JSON_ARRAY()
), JSON_OBJECT(
  'type', 'form',
  'required', TRUE,
  'fields', JSON_ARRAY(
    JSON_OBJECT('id', 'plan_type', 'label', '推荐方案', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'concerns', 'label', '主要疑虑', 'type', 'text', 'required', FALSE),
    JSON_OBJECT('id', 'decision_time', 'label', '预计决策时间', 'type', 'text', 'required', FALSE)
  )
), 5, TRUE, JSON_ARRAY(
  '准备报名方案',
  '讲解收费标准',
  '介绍优惠政策',
  '解答客户疑问'
)),

-- 节点5：签约成交
(@template_id, 5, '签约成交', '确认意向，办理报名签约手续', 'mixed', JSON_OBJECT(
  'text', JSON_OBJECT(
    'title', '签约成交流程',
    'content', '<h3>签约准备</h3><ul><li>核对报名信息准确性</li><li>准备报名表和协议</li><li>确认缴费方式和时间</li><li>说明入园注意事项</li></ul><h3>后续服务</h3><ul><li>添加家长微信群</li><li>发送入园须知</li><li>安排入园体检</li><li>建立学生档案</li></ul>',
    'summary', '完成报名签约手续'
  ),
  'videos', JSON_ARRAY(),
  'images', JSON_ARRAY(),
  'audios', JSON_ARRAY(),
  'documents', JSON_ARRAY()
), JSON_OBJECT(
  'type', 'form',
  'required', TRUE,
  'fields', JSON_ARRAY(
    JSON_OBJECT('id', 'contract_date', 'label', '签约日期', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'payment_method', 'label', '缴费方式', 'type', 'select', 'options', JSON_ARRAY('全款', '分期'), 'required', TRUE),
    JSON_OBJECT('id', 'enrollment_date', 'label', '预计入园日期', 'type', 'text', 'required', TRUE),
    JSON_OBJECT('id', 'notes', 'label', '备注说明', 'type', 'text', 'required', FALSE)
  )
), 3, TRUE, JSON_ARRAY(
  '核对报名信息',
  '签署报名协议',
  '确认缴费金额',
  '安排后续事宜'
));

-- ============================================
-- 数据说明
-- ============================================
-- 1. 模板类型为'sales'，教师端只显示此类型
-- 2. is_system=TRUE表示系统模板，不可删除
-- 3. 每个节点包含文本内容、反馈表单和检查清单
-- 4. content_data使用JSON格式存储多媒体内容
-- 5. feedback_config定义反馈表单字段
-- ============================================
