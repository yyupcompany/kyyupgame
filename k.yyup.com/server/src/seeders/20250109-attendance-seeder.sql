-- 考勤中心种子数据
-- 为测试考勤中心功能生成模拟考勤数据

USE kargerdensales;

-- 简化版本的种子数据
-- 为前100个学生生成最近7天的考勤数据
-- recorded_by 使用实际存在的用户ID (206)

INSERT INTO attendances (
  student_id, class_id, kindergarten_id, attendance_date, status,
  check_in_time, check_out_time, temperature, health_status,
  notes, recorded_by, recorded_at
)
SELECT
  s.id AS student_id,
  s.class_id,
  1 AS kindergarten_id,
  DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 7) DAY) AS attendance_date,
  ELT(FLOOR(1 + RAND() * 5), 'present', 'present', 'present', 'late', 'absent') AS status,
  CONCAT(8 + FLOOR(RAND()), ':', LPAD(FLOOR(RAND() * 60), 2, '0'), ':00') AS check_in_time,
  CONCAT(16 + FLOOR(RAND()), ':', LPAD(FLOOR(RAND() * 60), 2, '0'), ':00') AS check_out_time,
  ROUND(36.2 + RAND() * 0.6, 1) AS temperature,
  'normal' AS health_status,
  '正常' AS notes,
  206 AS recorded_by,
  NOW() AS recorded_at
FROM students s
WHERE s.id IS NOT NULL
  AND s.class_id IS NOT NULL
  AND s.deleted_at IS NULL
LIMIT 500;

-- 显示插入结果
SELECT
  COUNT(*) AS total_attendances,
  COUNT(DISTINCT student_id) AS total_students,
  COUNT(DISTINCT class_id) AS total_classes,
  MIN(attendance_date) AS earliest_date,
  MAX(attendance_date) AS latest_date
FROM attendances;

-- 按状态统计
SELECT
  status,
  COUNT(*) AS count
FROM attendances
GROUP BY status
ORDER BY count DESC;

SELECT '考勤数据生成完成！' AS result;
