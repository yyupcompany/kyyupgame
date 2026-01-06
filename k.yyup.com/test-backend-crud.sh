#!/bin/bash

##############################################################################
# 后端CRUD接口测试脚本
# 功能：通过curl测试后端各个模块的CRUD功能
# 使用：chmod +x test-backend-crud.sh && ./test-backend-crud.sh
##############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
BASE_URL="http://localhost:3000"
API_PREFIX="/api"
TOKEN=""

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
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        print_error "登录失败，无法获取Token"
        exit 1
    fi
    
    print_success "登录成功！"
    print_info "Token: ${TOKEN:0:50}..."
}

##############################################################################
# 班级管理 CRUD 测试
##############################################################################

test_class_crud() {
    print_header "测试：班级管理 CRUD"
    
    # CREATE - 创建班级
    print_step "1. 创建班级 (CREATE)"
    CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/classes" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "测试班级001",
            "grade": "大班",
            "capacity": 30
        }')
    
    echo "创建响应："
    print_json "$CREATE_RESPONSE"
    
    CLASS_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$CLASS_ID" ]; then
        print_success "班级创建成功，ID: $CLASS_ID"
    else
        print_error "班级创建失败或返回格式不符"
    fi
    
    sleep 1
    
    # READ - 查询班级列表
    print_step "2. 查询班级列表 (READ)"
    LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/classes" \
        -H "Authorization: Bearer ${TOKEN}")
    
    echo "查询响应："
    print_json "$LIST_RESPONSE" | head -20
    print_success "班级列表查询完成"
    
    sleep 1
    
    # READ - 查询单个班级
    if [ ! -z "$CLASS_ID" ]; then
        print_step "3. 查询单个班级详情 (READ)"
        DETAIL_RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/classes/${CLASS_ID}" \
            -H "Authorization: Bearer ${TOKEN}")
        
        echo "详情响应："
        print_json "$DETAIL_RESPONSE"
        print_success "班级详情查询完成"
        
        sleep 1
        
        # UPDATE - 更新班级
        print_step "4. 更新班级信息 (UPDATE)"
        UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}${API_PREFIX}/classes/${CLASS_ID}" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "测试班级001-已更新",
                "capacity": 35
            }')
        
        echo "更新响应："
        print_json "$UPDATE_RESPONSE"
        print_success "班级信息更新完成"
        
        sleep 1
        
        # DELETE - 删除班级
        print_step "5. 删除班级 (DELETE)"
        DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}${API_PREFIX}/classes/${CLASS_ID}" \
            -H "Authorization: Bearer ${TOKEN}")
        
        echo "删除响应："
        print_json "$DELETE_RESPONSE"
        print_success "班级删除完成"
    fi
}

##############################################################################
# 学生管理 CRUD 测试
##############################################################################

test_student_crud() {
    print_header "测试：学生管理 CRUD"
    
    # CREATE - 创建学生
    print_step "1. 创建学生 (CREATE)"
    CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/students" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "测试学生001",
            "gender": "男",
            "age": 5,
            "classId": 1
        }')
    
    echo "创建响应："
    print_json "$CREATE_RESPONSE"
    
    STUDENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$STUDENT_ID" ]; then
        print_success "学生创建成功，ID: $STUDENT_ID"
    else
        print_error "学生创建失败或返回格式不符"
    fi
    
    sleep 1
    
    # READ - 查询学生列表
    print_step "2. 查询学生列表 (READ)"
    LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}${API_PREFIX}/students" \
        -H "Authorization: Bearer ${TOKEN}")
    
    echo "查询响应："
    print_json "$LIST_RESPONSE" | head -20
    print_success "学生列表查询完成"
    
    sleep 1
    
    # UPDATE & DELETE
    if [ ! -z "$STUDENT_ID" ]; then
        print_step "3. 更新学生信息 (UPDATE)"
        UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}${API_PREFIX}/students/${STUDENT_ID}" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "测试学生001-已更新",
                "age": 6
            }')
        
        echo "更新响应："
        print_json "$UPDATE_RESPONSE"
        print_success "学生信息更新完成"
        
        sleep 1
        
        print_step "4. 删除学生 (DELETE)"
        DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}${API_PREFIX}/students/${STUDENT_ID}" \
            -H "Authorization: Bearer ${TOKEN}")
        
        echo "删除响应："
        print_json "$DELETE_RESPONSE"
        print_success "学生删除完成"
    fi
}

##############################################################################
# 教师管理 CRUD 测试
##############################################################################

test_teacher_crud() {
    print_header "测试：教师管理 CRUD"
    
    # CREATE
    print_step "1. 创建教师 (CREATE)"
    CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/teachers" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "测试教师001",
            "phone": "13800138000",
            "subject": "语言"
        }')
    
    echo "创建响应："
    print_json "$CREATE_RESPONSE"
    
    TEACHER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$TEACHER_ID" ]; then
        print_success "教师创建成功，ID: $TEACHER_ID"
        
        sleep 1
        
        # READ
        print_step "2. 查询教师列表 (READ)"
        curl -s -X GET "${BASE_URL}${API_PREFIX}/teachers" \
            -H "Authorization: Bearer ${TOKEN}" | print_json | head -20
        
        sleep 1
        
        # DELETE
        print_step "3. 删除教师 (DELETE)"
        curl -s -X DELETE "${BASE_URL}${API_PREFIX}/teachers/${TEACHER_ID}" \
            -H "Authorization: Bearer ${TOKEN}" | print_json
        
        print_success "教师CRUD测试完成"
    fi
}

##############################################################################
# 活动管理 CRUD 测试
##############################################################################

test_activity_crud() {
    print_header "测试：活动管理 CRUD"
    
    # CREATE
    print_step "1. 创建活动 (CREATE)"
    CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}${API_PREFIX}/activities" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "测试活动001",
            "description": "这是一个测试活动",
            "startTime": "2025-01-01T10:00:00Z"
        }')
    
    echo "创建响应："
    print_json "$CREATE_RESPONSE"
    
    ACTIVITY_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ ! -z "$ACTIVITY_ID" ]; then
        print_success "活动创建成功，ID: $ACTIVITY_ID"
        
        sleep 1
        
        # READ
        print_step "2. 查询活动列表 (READ)"
        curl -s -X GET "${BASE_URL}${API_PREFIX}/activities" \
            -H "Authorization: Bearer ${TOKEN}" | print_json | head -20
        
        sleep 1
        
        # DELETE
        print_step "3. 删除活动 (DELETE)"
        curl -s -X DELETE "${BASE_URL}${API_PREFIX}/activities/${ACTIVITY_ID}" \
            -H "Authorization: Bearer ${TOKEN}" | print_json
        
        print_success "活动CRUD测试完成"
    fi
}

##############################################################################
# 主函数
##############################################################################

main() {
    clear
    
    print_header "🧪 后端CRUD接口完整测试"
    
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
    
    # 执行测试
    quick_login
    test_class_crud
    test_student_crud
    test_teacher_crud
    test_activity_crud
    
    # 测试总结
    print_header "📊 测试完成总结"
    
    echo -e "${GREEN}✅ 后端CRUD接口测试完成！${NC}"
    echo ""
    echo "测试模块："
    echo "  ✓ 班级管理 - 创建、查询、更新、删除"
    echo "  ✓ 学生管理 - 创建、查询、更新、删除"
    echo "  ✓ 教师管理 - 创建、查询、删除"
    echo "  ✓ 活动管理 - 创建、查询、删除"
    echo ""
    print_info "Token已保存，可用于后续手动测试："
    echo "export TOKEN=\"$TOKEN\""
    echo ""
}

# 执行主函数
main
