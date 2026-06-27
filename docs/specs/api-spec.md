# API 规范

## 概述

taskwarrior-motion API 采用 RESTful 设计，使用 JSON 格式通信。

---

## 基础信息

- **Base URL**：`http://localhost:3001/api`
- **Content-Type**：`application/json`
- **字符编码**：UTF-8
- **认证**：无（本地部署）

---

## 端点列表

### 任务管理

#### 获取任务列表

```http
GET /api/tasks
```

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filter | string | 否 | taskwarrior 过滤器 |
| sort | string | 否 | 排序字段 |
| search | string | 否 | 搜索关键词 |

**响应**：

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "description": "买牛奶",
    "status": "pending",
    "project": "购物",
    "tags": ["生活", "紧急"],
    "priority": "H",
    "due": "2026-06-28",
    "wait": null,
    "scheduled": null,
    "recur": null,
    "depends": [],
    "entry": "2026-06-27T10:00:00Z",
    "modified": "2026-06-27T10:00:00Z",
    "start": null
  }
]
```

**状态码**：
- 200：成功
- 500：服务器错误

---

#### 添加任务

```http
POST /api/tasks
```

**请求体**：

```json
{
  "description": "买牛奶",
  "project": "购物",
  "tags": ["生活"],
  "priority": "H",
  "due": "2026-06-28"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| description | string | 是 | 任务描述 |
| project | string | 否 | 项目名称 |
| tags | string[] | 否 | 标签列表 |
| priority | string | 否 | 优先级（H/M/L） |
| due | string | 否 | 截止日期（YYYY-MM-DD） |

**响应**：

```json
{
  "message": "Task created successfully"
}
```

**状态码**：
- 201：创建成功
- 400：请求无效
- 500：服务器错误

---

#### 修改任务

```http
PUT /api/tasks/:uuid
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| uuid | string | 任务 UUID |

**请求体**：

```json
{
  "description": "买牛奶和面包",
  "project": "购物",
  "priority": "M"
}
```

**响应**：

```json
{
  "message": "Task updated successfully"
}
```

**状态码**：
- 200：成功
- 400：请求无效
- 404：任务不存在
- 500：服务器错误

---

#### 删除任务

```http
DELETE /api/tasks/:uuid
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| uuid | string | 任务 UUID |

**响应**：

```json
{
  "message": "Task deleted successfully"
}
```

**状态码**：
- 200：成功
- 404：任务不存在
- 500：服务器错误

---

### 任务操作

#### 完成任务

```http
POST /api/tasks/:uuid/done
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| uuid | string | 任务 UUID |

**响应**：

```json
{
  "message": "Task completed successfully"
}
```

**状态码**：
- 200：成功
- 404：任务不存在
- 500：服务器错误

---

#### 开始计时

```http
POST /api/tasks/:uuid/start
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| uuid | string | 任务 UUID |

**响应**：

```json
{
  "message": "Task started successfully"
}
```

**状态码**：
- 200：成功
- 404：任务不存在
- 500：服务器错误

---

#### 停止计时

```http
POST /api/tasks/:uuid/stop
```

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| uuid | string | 任务 UUID |

**响应**：

```json
{
  "message": "Task stopped successfully"
}
```

**状态码**：
- 200：成功
- 404：任务不存在
- 500：服务器错误

---

### 其他操作

#### 撤销操作

```http
POST /api/undo
```

**响应**：

```json
{
  "message": "Undo successful"
}
```

**状态码**：
- 200：成功
- 500：服务器错误

---

## 错误响应

### 错误格式

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description is required",
    "details": {
      "field": "description",
      "value": ""
    }
  }
}
```

### 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| INVALID_INPUT | 400 | 输入无效 |
| NOT_FOUND | 404 | 资源不存在 |
| INTERNAL_ERROR | 500 | 内部错误 |
| TASK_ERROR | 500 | taskwarrior 命令执行失败 |

---

## 请求示例

### curl

#### 获取任务列表

```bash
curl http://localhost:3001/api/tasks
```

#### 添加任务

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "买牛奶", "project": "购物", "priority": "H"}'
```

#### 完成任务

```bash
curl -X POST http://localhost:3001/api/tasks/550e8400-e29b-41d4-a716-446655440000/done
```

---

## 响应示例

### 成功响应

```json
{
  "message": "Task created successfully"
}
```

### 错误响应

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description is required"
  }
}
```

---

## 分页

当前 API 不支持分页，返回所有任务。

**未来计划**：
- 支持 `page` 和 `per_page` 参数
- 返回分页元数据

---

## 过滤器语法

### 基本过滤

```
status:pending
status:completed
project:购物
priority:H
```

### 组合过滤

```
status:pending and project:购物
status:pending or priority:H
```

### 日期过滤

```
due:today
due:tomorrow
due:week
due:2026-06-28
```

---

## 排序

### 排序字段

| 字段 | 说明 | 默认方向 |
|------|------|----------|
| urgency | 紧急度 | desc |
| due | 截止日期 | asc |
| project | 项目 | asc |
| description | 描述 | asc |
| entry | 创建时间 | desc |

### 排序语法

```
sort=urgency:desc
sort=due:asc
sort=project:asc,description:asc
```

---

## 搜索

### 搜索参数

```
search=牛奶
search=购物
```

### 搜索范围

- description
- project
- tags

---

## 参考项目

### taskwarrior-web-portal

- **API 设计**：RESTful
- **参考**：
  - 端点命名
  - 错误处理
  - 响应格式

### taskwarrior-webui

- **API 设计**：RESTful
- **参考**：
  - 请求/响应格式
  - 过滤器语法
