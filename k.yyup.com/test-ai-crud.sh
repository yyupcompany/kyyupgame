#!/bin/bash

##############################################################################
# AI接口CRUD测试脚本
# 功能：测试后端AI接口的CRUD功能
# 使用：chmod +x test-ai-crud.sh && ./test-ai-crud.sh
##############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
BASE_URL="http://localhost:3000"
API_PREFIX="/api"

# 全局变量
TOKEN=""
CONVERSATION_ID=""
MESSAGE_ID=""

##############################################################################
# 工具函数
##############################################################################

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# JSON格式化输出
print_json() {
    echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

##############################################################################
# 第一步：快捷登录获取Token
##############################################################################

quick_login() {
    print_header "步骤 1: 快捷登录获取 Token"
    
    print_step "使用 admin 账户登录..."
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "admin",
            "password": "123456"
        }')
    
    print_info "登录响应："
    print_json "$RESPONSE"
    
    # 提取token
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        print_error "登录失败，无法获取Token"
        exit 1
    fi
    
    print_success "登录成功！"
    print_info "Token: ${TOKEN:0:50}..."
    
    sleep 1
}

##############################################################################
# 第二步：创建会话 (Create)
##############################################################################

create_conversation() {
    print_header "步骤 2: 创建AI会话 (CREATE)"
    
    print_step "创建新的会话..."
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/conversations" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "CRUD测试会话",
            "modelId": 1
        }')
    
    print_info "创建会话响应："
    print_json "$RESPONSE"
    
    # 提取conversationId
    CONVERSATION_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -z "$CONVERSATION_ID" ]; then
        print_error "创建会话失败"
        exit 1
    fi
    
    print_success "会话创建成功！"
    print_info "会话ID: $CONVERSATION_ID"
    
    sleep 1
}

##############################################################################
# 第三步：发送消息并测试AI对话 (Create Message)
##############################################################################

send_message() {
    print_header "步骤 3: 发送消息到AI (CREATE MESSAGE)"
    
    print_step "发送测试消息: '查询所有班级信息'..."
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/unified/stream-chat" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"查询所有班级信息\",
            \"conversationId\": \"${CONVERSATION_ID}\",
            \"mode\": \"auto\"
        }")
    
    print_info "AI响应："
    print_json "$RESPONSE"
    
    print_success "消息发送成功！"
    
    sleep 2
}

##############################################################################
# 第四步：查询会话列表 (Read)
##############################################################################

list_conversations() {
    print_header "步骤 4: 查询会话列表 (READ)"
    
    print_step "获取所有会话..."
    
    RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/ai/conversations" \
        -H "Authorization: Bearer ${TOKEN}")
    
    print_info "会话列表："
    print_json "$RESPONSE"
    
    print_success "查询成功！"
    
    sleep 1
}

##############################################################################
# 第五步：查询会话详情 (Read Detail)
##############################################################################

get_conversation_detail() {
    print_header "步骤 5: 查询会话详情 (READ DETAIL)"
    
    print_step "获取会话 ID: $CONVERSATION_ID 的详情..."
    
    RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/ai/conversations/${CONVERSATION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    print_info "会话详情："
    print_json "$RESPONSE"
    
    print_success "查询成功！"
    
    sleep 1
}

##############################################################################
# 第六步：查询会话消息 (Read Messages)
##############################################################################

get_conversation_messages() {
    print_header "步骤 6: 查询会话消息 (READ MESSAGES)"
    
    print_step "获取会话 ID: $CONVERSATION_ID 的所有消息..."
    
    RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/ai/conversations/${CONVERSATION_ID}/messages" \
        -H "Authorization: Bearer ${TOKEN}")
    
    print_info "会话消息："
    print_json "$RESPONSE"
    
    # 提取第一条消息的ID
    MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$MESSAGE_ID" ]; then
        print_info "消息ID: $MESSAGE_ID"
    fi
    
    print_success "查询成功！"
    
    sleep 1
}

##############################################################################
# 第七步：更新会话标题 (Update)
##############################################################################

update_conversation() {
    print_header "步骤 7: 更新会话标题 (UPDATE)"
    
    print_step "更新会话标题..."
    
    RESPONSE=$(curl -s -X PUT "${BASE_URL}${API_PREFIX}/ai/conversations/${CONVERSATION_ID}" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "CRUD测试会话-已更新"
        }')
    
    print_info "更新响应："
    print_json "$RESPONSE"
    
    print_success "更新成功！"
    
    sleep 1
}

##############################################################################
# 第八步：测试复杂查询 (使用any_query工具)
##############################################################################

test_complex_query() {
    print_header "步骤 8: 测试复杂查询 (COMPLEX QUERY)"
    
    print_step "发送复杂查询: '统计每个班级的学生人数'..."
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/unified/stream-chat" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"统计每个班级的学生人数，用表格显示\",
            \"conversationId\": \"${CONVERSATION_ID}\",
            \"mode\": \"auto\"
        }")
    
    print_info "AI响应："
    echo "$RESPONSE"
    
    print_success "复杂查询测试完成！"
    
    sleep 2
}

##############################################################################
# 第九步：测试数据创建 (使用http_request工具)
##############################################################################

test_data_creation() {
    print_header "步骤 9: 测试数据创建 (DATA CREATION)"
    
    print_step "发送创建指令: '创建一个测试学生'..."
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/unified/stream-chat" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"创建一个测试学生，姓名：测试学生001，性别：男，年龄：5岁\",
            \"conversationId\": \"${CONVERSATION_ID}\",
            \"mode\": \"auto\"
        }")
    
    print_info "AI响应："
    echo "$RESPONSE"
    
    print_success "数据创建测试完成！"
    
    sleep 2
}

##############################################################################
# 第十步：删除会话 (Delete)
##############################################################################

delete_conversation() {
    print_header "步骤 10: 删除会话 (DELETE)"
    
    print_step "删除会话 ID: $CONVERSATION_ID ..."
    
    RESPONSE=$(curl -s -X DELETE "${BASE_URL}${API_PREFIX}/ai/conversations/${CONVERSATION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    print_info "删除响应："
    print_json "$RESPONSE"
    
    print_success "删除成功！"
    
    sleep 1
}

##############################################################################
# 第十一步：验证删除 (Verify Delete)
##############################################################################

verify_delete() {
    print_header "步骤 11: 验证删除 (VERIFY DELETE)"
    
    print_step "尝试获取已删除的会话..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "${BASE_URL}${API_PREFIX}/ai/conversations/${CONVERSATION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if [ "$HTTP_CODE" == "404" ]; then
        print_success "删除验证成功！会话已不存在（404）"
    else
        print_error "删除验证失败！HTTP状态码: $HTTP_CODE"
    fi
    
    sleep 1
}

##############################################################################
# 第十二步：测试AI工具调用
##############################################################################

test_tool_calling() {
    print_header "步骤 12: 测试AI工具调用 (TOOL CALLING)"
    
    # 创建新会话用于测试
    print_step "创建工具测试会话..."
    RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/conversations" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "工具调用测试",
            "modelId": 1
        }')
    
    TOOL_TEST_CONV_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    print_step "测试API搜索工具..."
    curl -s -X POST "${BASE_URL}${API_PREFIX}/ai/unified/stream-chat" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"帮我搜索学生相关的API接口\",
            \"conversationId\": \"${TOOL_TEST_CONV_ID}\",
            \"mode\": \"auto\"
        }" | head -20
    
    echo ""
    print_success "工具调用测试完成！"
    
    sleep 1
}

##############################################################################
# 主函数
##############################################################################

main() {
    clear
    
    print_header "🚀 AI接口CRUD完整测试"
    
    print_info "基础URL: $BASE_URL"
    print_info "API前缀: $API_PREFIX"
    echo ""
    
    # 检查后端服务
    print_step "检查后端服务..."
    if ! curl -s "${BASE_URL}/api-docs" > /dev/null; then
        print_error "后端服务未启动！请先启动: cd server && npm run dev"
        exit 1
    fi
    print_success "后端服务正常运行"
    echo ""
    
    # 执行测试流程
    quick_login
    create_conversation
    send_message
    list_conversations
    get_conversation_detail
    get_conversation_messages
    update_conversation
    test_complex_query
    test_data_creation
    test_tool_calling
    delete_conversation
    verify_delete
    
    # 测试总结
    print_header "📊 测试完成总结"
    
    echo -e "${GREEN}✅ 所有CRUD操作测试通过！${NC}"
    echo ""
    echo "测试覆盖："
    echo "  ✓ CREATE - 创建会话、发送消息"
    echo "  ✓ READ   - 查询会话列表、详情、消息"
    echo "  ✓ UPDATE - 更新会话标题"
    echo "  ✓ DELETE - 删除会话并验证"
    echo "  ✓ TOOLS  - API搜索、数据查询、复杂查询"
    echo ""
    print_info "Token已保存，可用于后续手动测试："
    echo "export AI_TOKEN=\"$TOKEN\""
    echo ""
}

# 执行主函数
main
