# 🚀 AI接口CRUD测试 - 快速参考

## 一键运行（推荐）

```bash
./run-ai-crud-test.sh
```

自动启动后端并运行完整测试。

---

## 手动运行

### 1️⃣ 启动后端服务

```bash
cd server && npm run dev
```

### 2️⃣ 运行测试（选择一个）

**Node.js版本（推荐）**
```bash
node test-ai-crud.cjs
```

**Bash版本**
```bash
./test-ai-crud.sh
```

---

## 测试内容

✅ **CREATE** - 创建会话、发送消息  
✅ **READ** - 查询会话列表、详情、消息  
✅ **UPDATE** - 更新会话标题  
✅ **DELETE** - 删除会话并验证  
✅ **AI工具** - API搜索、数据查询、复杂查询  

---

## 快速curl测试

```bash
# 1. 登录获取Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. 创建会话
CONV_ID=$(curl -s -X POST http://localhost:3000/api/ai/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"快速测试","modelId":1}' \
  | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "会话ID: $CONV_ID"

# 3. 发送消息
curl -X POST http://localhost:3000/api/ai/unified/stream-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"查询所有班级\",\"conversationId\":\"$CONV_ID\",\"mode\":\"auto\"}"

# 4. 查询会话
curl -X GET http://localhost:3000/api/ai/conversations/$CONV_ID \
  -H "Authorization: Bearer $TOKEN"

# 5. 删除会话
curl -X DELETE http://localhost:3000/api/ai/conversations/$CONV_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 常见问题

**Q: 后端服务未启动？**  
A: `cd server && npm run dev`

**Q: 权限不足？**  
A: `chmod +x *.sh`

**Q: 登录失败？**  
A: 检查数据库admin用户（密码：admin123）

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `run-ai-crud-test.sh` | 一键运行脚本（自动启动后端） |
| `test-ai-crud.cjs` | Node.js测试脚本（推荐） |
| `test-ai-crud.sh` | Bash测试脚本 |
| `AI接口CRUD测试说明.md` | 详细使用文档 |

---

**详细文档**: [AI接口CRUD测试说明.md](./AI接口CRUD测试说明.md)
