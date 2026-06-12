export const mockTree = [
  {
    id: 'node-1',
    name: '前端组',
    type: 'directory',
    children: [
      {
        id: 'node-1-1',
        name: '技术文档',
        type: 'directory',
        children: [
          { id: 'node-1-1-1', name: '架构设计', type: 'directory', children: [] },
          { id: 'node-1-1-2', name: '组件库', type: 'directory', children: [] }
        ]
      },
      {
        id: 'node-1-2',
        name: '会议纪要',
        type: 'directory',
        children: [
          { id: 'article-1', name: '2024-01 技术分享周会', type: 'article', articleId: 'article-1' }
        ]
      }
    ]
  },
  {
    id: 'node-2',
    name: '后端组',
    type: 'directory',
    children: [
      {
        id: 'node-2-1',
        name: '订单系统',
        type: 'directory',
        children: [
          {
            id: 'node-2-1-1',
            name: '退款流程',
            type: 'directory',
            children: [
              {
                id: 'node-2-1-1-1',
                name: '异常处理',
                type: 'directory',
                children: [
                  { id: 'article-2', name: '2024-02-15 退款失败事故复盘', type: 'article', articleId: 'article-2' }
                ]
              },
              { id: 'article-3', name: '退款 API 接口文档', type: 'article', articleId: 'article-3' }
            ]
          },
          { id: 'article-4', name: '订单系统架构设计', type: 'article', articleId: 'article-4' }
        ]
      },
      {
        id: 'node-2-2',
        name: '用户系统',
        type: 'directory',
        children: [
          { id: 'article-5', name: '用户认证方案', type: 'article', articleId: 'article-5' }
        ]
      }
    ]
  },
  {
    id: 'node-3',
    name: '运维组',
    type: 'directory',
    children: [
      { id: 'article-6', name: '生产环境部署 SOP', type: 'article', articleId: 'article-6' },
      { id: 'article-7', name: '监控告警配置指南', type: 'article', articleId: 'article-7' }
    ]
  },
  {
    id: 'node-4',
    name: '产品组',
    type: 'directory',
    children: [
      { id: 'article-8', name: '知识库产品 PRD', type: 'article', articleId: 'article-8' }
    ]
  }
]

const sampleMarkdown = `# 示例文档

这是一篇示例技术文档，展示 Markdown 编辑器的各种功能。

## 代码块

支持多种编程语言的语法高亮：

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
  return {
    message: 'Welcome',
    timestamp: Date.now()
  }
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
\`\`\`

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
\`\`\`

## 表格

| 功能 | 状态 | 负责人 |
| --- | --- | --- |
| 目录树 | 已完成 | 张三 |
| 编辑器 | 进行中 | 李四 |
| 搜索 | 未开始 | 王五 |

## 列表

- 有序列表
  1. 第一项
  2. 第二项
  3. 第三项

- 无序列表
  - 前端
  - 后端
  - 运维

## 引用

> 好的代码是自解释的。
> —— Steve McConnell

## 数学公式

行内公式: $E = mc^2$

块级公式:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[处理]
    B -->|否| D[结束]
    C --> D
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    用户->>前端: 点击保存
    前端->>后端: POST /articles
    后端-->>前端: 200 OK
    前端-->>用户: 保存成功
\`\`\`

## 链接和图片

[访问官网](https://example.com)

---

*最后更新: 2024-01-15*
`

export const mockArticles = {
  'article-1': {
    id: 'article-1',
    title: '2024-01 技术分享周会',
    author: { id: 'user-1', name: '张三' },
    category: '会议纪要',
    tags: ['周会', '技术分享', '前端'],
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T12:30:00Z',
    views: 45,
    likes: 12,
    comments: 3,
    content: sampleMarkdown
  },
  'article-2': {
    id: 'article-2',
    title: '2024-02-15 退款失败事故复盘',
    author: { id: 'user-2', name: '李四' },
    category: '流程文档',
    tags: ['事故复盘', '退款', '后端'],
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2024-02-16T09:00:00Z',
    views: 128,
    likes: 35,
    comments: 8,
    content: '# 退款失败事故复盘\n\n## 事故概述\n\n2024年2月15日下午2点，订单系统退款功能出现异常...'
  },
  'article-3': {
    id: 'article-3',
    title: '退款 API 接口文档',
    author: { id: 'user-2', name: '李四' },
    category: '技术文档',
    tags: ['API', '退款', '后端'],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-02-20T16:00:00Z',
    views: 256,
    likes: 42,
    comments: 15,
    content: sampleMarkdown
  },
  'article-4': {
    id: 'article-4',
    title: '订单系统架构设计',
    author: { id: 'user-3', name: '王五' },
    category: '技术文档',
    tags: ['架构', '订单系统', '后端'],
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    views: 312,
    likes: 67,
    comments: 23,
    content: '# 订单系统架构设计\n\n## 系统概述\n\n订单系统是电商平台的核心模块...'
  },
  'article-5': {
    id: 'article-5',
    title: '用户认证方案',
    author: { id: 'user-3', name: '王五' },
    category: '技术文档',
    tags: ['认证', 'JWT', '用户系统'],
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 189,
    likes: 28,
    comments: 11,
    content: sampleMarkdown
  },
  'article-6': {
    id: 'article-6',
    title: '生产环境部署 SOP',
    author: { id: 'user-4', name: '赵六' },
    category: '流程文档',
    tags: ['部署', 'SOP', '运维'],
    createdAt: '2023-11-20T08:00:00Z',
    updatedAt: '2024-02-10T15:00:00Z',
    views: 98,
    likes: 19,
    comments: 5,
    content: '# 生产环境部署 SOP\n\n## 部署前检查...'
  },
  'article-7': {
    id: 'article-7',
    title: '监控告警配置指南',
    author: { id: 'user-4', name: '赵六' },
    category: '技术文档',
    tags: ['监控', '告警', '运维'],
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2024-02-05T09:00:00Z',
    views: 76,
    likes: 14,
    comments: 2,
    content: sampleMarkdown
  },
  'article-8': {
    id: 'article-8',
    title: '知识库产品 PRD',
    author: { id: 'user-5', name: '孙七' },
    category: '产品文档',
    tags: ['PRD', '知识库', '产品'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-20T17:00:00Z',
    views: 156,
    likes: 31,
    comments: 18,
    content: '# 知识库产品 PRD\n\n## 产品背景...'
  }
}

export const mockVersions = {
  'article-1': [
    { id: 'v3', version: 3, createdAt: '2024-01-08T12:30:00Z', author: { name: '张三' }, summary: '补充会议决议' },
    { id: 'v2', version: 2, createdAt: '2024-01-08T11:00:00Z', author: { name: '张三' }, summary: '添加技术方案讨论' },
    { id: 'v1', version: 1, createdAt: '2024-01-08T10:00:00Z', author: { name: '张三' }, summary: '初始版本' }
  ]
}

export const mockComments = {
  'article-1': [
    {
      id: 'cmt-1',
      articleId: 'article-1',
      author: { id: 'user-2', name: '李四' },
      content: '这次技术分享质量很高，建议把代码示例也同步到 Git 仓库方便大家参考。',
      createdAt: '2024-01-08T13:00:00Z',
      likes: 5,
      replies: [
        {
          id: 'cmt-1-r1',
          parentId: 'cmt-1',
          author: { id: 'user-1', name: '张三' },
          content: '好的，我整理完就发群里。',
          createdAt: '2024-01-08T14:20:00Z',
          likes: 2,
          replies: []
        }
      ]
    },
    {
      id: 'cmt-2',
      articleId: 'article-1',
      author: { id: 'user-3', name: '王五' },
      content: 'Vue 3 组合式 API 那部分讲得很清楚，我有个问题：setup script 里如何优雅地处理大量的 props 解构？',
      createdAt: '2024-01-09T09:15:00Z',
      likes: 3,
      replies: []
    },
    {
      id: 'cmt-3',
      articleId: 'article-1',
      author: { id: 'user-6', name: '产品孙七' },
      content: '文档结构很清晰，希望以后周会纪要都按这个格式来。',
      createdAt: '2024-01-10T11:30:00Z',
      likes: 8,
      replies: []
    }
  ],
  'article-3': [
    {
      id: 'cmt-a3-1',
      articleId: 'article-3',
      author: { id: 'user-4', name: '赵六' },
      content: '退款超时时间配置文档里好像没写清楚，默认是多少秒？',
      createdAt: '2024-02-01T10:00:00Z',
      likes: 2,
      replies: [
        {
          id: 'cmt-a3-1-r1',
          parentId: 'cmt-a3-1',
          author: { id: 'user-2', name: '李四' },
          content: '默认 30 秒，可在 refund_timeout_ms 配置项里改。',
          createdAt: '2024-02-01T10:30:00Z',
          likes: 1,
          replies: []
        }
      ]
    }
  ]
}

export const mockCurrentUser = {
  id: 'user-1',
  name: '张三',
  email: 'zhangsan@company.com',
  department: '前端组',
  role: 'developer'
}
