#!/bin/bash

# AI功能测试脚本
# 测试AI搜索、智能代理和工具调用功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API配置
API_BASE_URL="http://localhost:3000"
LOGIN_EMAIL="${LOGIN_EMAIL:-admin@example.com}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-admin123}"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_header "检查依赖"
    
    if ! command -v curl &> /dev/null; then
        print_error "curl 未安装"
        exit 1
    fi
    print_success "curl 已安装"
    
    if ! command -v jq &> /dev/null; then
        print_error "jq 未安装，请先安装: sudo apt-get install jq"
        exit 1
    fi
    print_success "jq 已安装"
}

# 检查后端服务
check_backend() {
    print_header "检查后端服务"
    
    if curl -s -f "${API_BASE_URL}/health" > /dev/null 2>&1; then
        print_success "后端服务运行正常"
    else
        print_error "后端服务未运行，请先启动: npm run start:backend"
        exit 1
    fi
}

# 登录获取token
login() {
    print_header "用户登录"
    
    print_info "尝试登录: ${LOGIN_EMAIL}"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${LOGIN_EMAIL}\",\"password\":\"${LOGIN_PASSWORD}\"}")
    
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token // empty')
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        print_error "登录失败"
        echo "$RESPONSE" | jq .
        exit 1
    fi
    
    print_success "登录成功，Token已获取"
    echo "Token: ${TOKEN:0:50}..."
}

# 测试场景1: 简单搜索
test_simple_search() {
    print_header "测试场景1: 简单网络搜索"
    
    print_info "查询: 搜索最新的幼儿园教育政策"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai-query" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{
            "query": "搜索最新的幼儿园教育政策",
            "enableSearch": true,
            "userId": 1
        }')
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" == "true" ]; then
        print_success "搜索测试通过"
        echo "$RESPONSE" | jq '.data.response' -r | head -20
    else
        print_error "搜索测试失败"
        echo "$RESPONSE" | jq .
        return 1
    fi
}

# 测试场景2: 多工具调用
test_multi_tool() {
    print_header "测试场景2: 多工具调用"
    
    print_info "复杂任务: 搜索+策划+生成清单"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai-query" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{
            "query": "请帮我完成以下任务：1. 搜索最新的幼儿园教育政策和趋势；2. 基于搜索结果，为我们幼儿园策划一个符合最新教育理念的春季亲子活动方案；3. 生成活动的详细流程和物料清单；4. 创建一个待办事项列表来跟踪活动准备工作。",
            "enableSearch": true,
            "enableAgent": true,
            "enableTools": true,
            "userId": 1
        }')
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" == "true" ]; then
        print_success "多工具调用测试通过"
        echo "$RESPONSE" | jq '.data.response' -r | head -30
    else
        print_error "多工具调用测试失败"
        echo "$RESPONSE" | jq .
        return 1
    fi
}

# 测试场景3: 智能代理
test_agent() {
    print_header "测试场景3: 智能代理 - 活动策划师"
    
    print_info "调用活动策划师代理"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai-query" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{
            "query": "作为活动策划师，帮我设计一个适合3-6岁儿童的科学探索主题活动，包括活动目标、流程、材料清单和预算估算。",
            "enableAgent": true,
            "agentType": "activity_planner",
            "userId": 1
        }')
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" == "true" ]; then
        print_success "智能代理测试通过"
        echo "$RESPONSE" | jq '.data.response' -r | head -30
    else
        print_error "智能代理测试失败"
        echo "$RESPONSE" | jq .
        return 1
    fi
}

# 测试场景4: 数据查询
test_data_query() {
    print_header "测试场景4: 数据查询"
    
    print_info "查询: 本月活动参与人数统计"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai-query" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{
            "query": "查询本月活动参与人数最多的前5个活动，并提供详细数据分析",
            "enableTools": true,
            "userId": 1
        }')
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" == "true" ]; then
        print_success "数据查询测试通过"
        echo "$RESPONSE" | jq '.data.response' -r | head -20
    else
        print_error "数据查询测试失败"
        echo "$RESPONSE" | jq .
        return 1
    fi
}

# 查看查询历史
view_history() {
    print_header "查看查询历史"
    
    RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/ai-query/history?page=1&pageSize=5" \
        -H "Authorization: Bearer ${TOKEN}")
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" == "true" ]; then
        print_success "历史记录获取成功"
        echo "$RESPONSE" | jq '.data.items[] | {query: .query, createdAt: .createdAt, success: .success}' -c
    else
        print_warning "历史记录获取失败（可能是权限问题）"
    fi
}

# 主测试流程
main() {
    print_header "🤖 AI功能测试套件"
    echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "API地址: ${API_BASE_URL}"
    echo "测试用户: ${LOGIN_EMAIL}"
    echo ""
    
    # 检查依赖
    check_dependencies
    
    # 检查后端服务
    check_backend
    
    # 登录
    login
    
    # 运行测试
    PASSED=0
    FAILED=0
    
    # 测试1: 简单搜索
    if test_simple_search; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    sleep 2
    
    # 测试2: 多工具调用
    if test_multi_tool; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    sleep 2
    
    # 测试3: 智能代理
    if test_agent; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    sleep 2
    
    # 测试4: 数据查询
    if test_data_query; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    sleep 2
    
    # 查看历史
    view_history
    
    # 测试总结
    print_header "测试总结"
    echo "通过: ${PASSED}/4"
    echo "失败: ${FAILED}/4"
    
    if [ $FAILED -eq 0 ]; then
        print_success "所有测试通过！🎉"
        exit 0
    else
        print_error "部分测试失败"
        exit 1
    fi
}

# 运行主函数
main

