#!/bin/bash
# API 测试脚本

BASE_URL="http://localhost:3001/api"
PASS=0
FAIL=0

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local description=$5

  if [ -n "$data" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    body=$(curl -s -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint")
    body=$(curl -s -X $method "$BASE_URL$endpoint")
  fi

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $description (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} $description (Expected: $expected_status, Got: $status)"
    echo "  Response: $body"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== taskwarrior-motion API 测试 ==="
echo ""

# 1. 获取任务列表
test_endpoint "GET" "/tasks" "" "200" "获取任务列表"

# 2. 创建任务
echo "创建测试任务..."
curl -s -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -d '{"description": "API 测试任务", "project": "test", "tags": ["test", "api"], "priority": "H"}'
echo ""
echo "---"

# 3. 获取任务列表（应该包含新任务）
test_endpoint "GET" "/tasks" "" "200" "获取任务列表（包含新任务）"

# 4. 获取单个任务
TASK_UUID=$(curl -s "$BASE_URL/tasks" | python3 -c "import sys, json; tasks=[t for t in json.load(sys.stdin) if t['description']=='API 测试任务']; print(tasks[0]['uuid'] if tasks else '')")
if [ -n "$TASK_UUID" ]; then
  test_endpoint "GET" "/tasks/$TASK_UUID" "" "200" "获取单个任务"
else
  echo -e "${RED}✗${NC} 无法获取任务 UUID"
  FAIL=$((FAIL + 1))
fi

# 5. 更新任务
if [ -n "$TASK_UUID" ]; then
  test_endpoint "PUT" "/tasks/$TASK_UUID" '{"description": "更新后的 API 测试任务", "priority": "M"}' "200" "更新任务"
fi

# 6. 开始计时
if [ -n "$TASK_UUID" ]; then
  test_endpoint "POST" "/tasks/$TASK_UUID/start" "" "200" "开始计时"
fi

# 7. 停止计时
if [ -n "$TASK_UUID" ]; then
  test_endpoint "POST" "/tasks/$TASK_UUID/stop" "" "200" "停止计时"
fi

# 8. 完成任务
if [ -n "$TASK_UUID" ]; then
  test_endpoint "POST" "/tasks/$TASK_UUID/done" "" "200" "完成任务"
fi

# 9. 尝试重复完成（应该失败）
if [ -n "$TASK_UUID" ]; then
  status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/tasks/$TASK_UUID/done")
  body=$(curl -s -X POST "$BASE_URL/tasks/$TASK_UUID/done")
  if [ "$status" = "500" ]; then
    echo -e "${GREEN}✓${NC} 重复完成任务（预期失败）"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} 重复完成任务（预期 500，实际 $status）"
    FAIL=$((FAIL + 1))
  fi
  echo "  Response: $body"
  echo "---"
fi

# 10. 撤销操作
test_endpoint "POST" "/undo" "" "200" "撤销操作"

# 11. 删除任务
if [ -n "$TASK_UUID" ]; then
  test_endpoint "DELETE" "/tasks/$TASK_UUID" "" "200" "删除任务"
fi

# 12. 获取不存在的任务
test_endpoint "GET" "/tasks/non-existent-uuid" "" "404" "获取不存在的任务"

# 13. 更新不存在的任务
test_endpoint "PUT" "/tasks/non-existent-uuid" '{"description": "test"}' "404" "更新不存在的任务"

# 14. 删除不存在的任务
test_endpoint "DELETE" "/tasks/non-existent-uuid" "" "404" "删除不存在的任务"

# 测试结果汇总
echo ""
echo "=== 测试结果 ==="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}所有测试通过！${NC}"
  exit 0
else
  echo -e "${RED}有测试失败${NC}"
  exit 1
fi
