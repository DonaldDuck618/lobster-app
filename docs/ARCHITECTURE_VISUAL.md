# 🦞 能虾助手 - 可视化架构图

**版本**: v1.0  
**更新日期**: 2026-03-12  
**工具**: Mermaid.js

---

## 1️⃣ 系统架构总览

```mermaid
graph TB
    subgraph 用户层
        A[微信小程序] --> E[统一 API 网关]
        B[iOS App] --> E
        C[Android App] --> E
        D[Web/Desktop] --> E
    end
    
    subgraph 网关层
        E[API Gateway<br/>Nginx + Node.js] --> F[认证中间件]
        E --> G[限流中间件]
        E --> H[日志中间件]
    end
    
    subgraph 服务层
        F --> I[认证服务]
        F --> J[对话服务]
        F --> K[文件服务]
        F --> L[会员服务]
        F --> M[工具服务]
    end
    
    subgraph 数据层
        I --> N[(PostgreSQL<br/>主数据库)]
        J --> O[(Redis<br/>缓存/会话)]
        K --> P[Aliyun OSS<br/>文件存储]
        L --> N
        M --> N
        M --> O
    end
    
    subgraph 第三方服务
        M --> Q[通义千问 API]
        M --> R[阿里云短信]
        M --> S[内容安全]
        M --> T[微信支付]
    end
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style K fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style N fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style O fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style P fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
```

---

## 2️⃣ 多端复用架构

```mermaid
graph TB
    subgraph 共享代码层 [100% 复用]
        A[API 调用层<br/>auth.js, chat.js, file.js]
        B[工具函数库<br/>format.js, validate.js]
        C[业务逻辑层<br/>chat.js, report.js]
    end
    
    subgraph 平台适配层
        D[微信小程序<br/>uni-app]
        E[Web/H5<br/>Vue3]
        F[Desktop<br/>Electron]
    end
    
    subgraph 平台特定功能
        G[微信登录<br/>相机/位置]
        H[浏览器特性<br/>通知/分享]
        I[桌面特性<br/>托盘/快捷键]
    end
    
    A --> D
    B --> D
    C --> D
    
    A --> E
    B --> E
    C --> E
    
    A --> F
    B --> F
    C --> F
    
    D --> G
    E --> H
    F --> I
    
    style 共享代码层 fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style 平台适配层 fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style 平台特定功能 fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
```

---

## 3️⃣ 认证授权流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 客户端
    participant API as API 网关
    participant Auth as 认证服务
    participant DB as 数据库
    
    User->>Client: 输入手机号 + 验证码
    Client->>API: POST /auth/login/phone
    API->>Auth: 验证请求
    Auth->>DB: 查询用户
    DB-->>Auth: 用户信息
    Auth->>Auth: 验证验证码
    Auth->>Auth: 生成 JWT Token
    Auth-->>API: 返回 Token + 用户信息
    API-->>Client: 响应数据
    Client->>Client: 保存 Token
    Client-->>User: 登录成功
    
    Note over Client,API: 后续请求携带 Token
    Client->>API: API 请求 + Bearer Token
    API->>API: 验证 Token
    API->>DB: 查询权限
    DB-->>API: 权限信息
    API-->>Client: 返回数据
```

---

## 4️⃣ 数据库 ER 图

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ FILES : owns
    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ ORDERS : places
    SESSIONS ||--o{ MESSAGES : contains
    SUBSCRIPTIONS ||--o{ ORDERS : generates
    
    USERS {
        uuid id PK
        string phone UK
        string email UK
        string password_hash
        string nickname
        string avatar_url
        string wechat_openid
        timestamp created_at
        timestamp updated_at
    }
    
    SESSIONS {
        uuid id PK
        uuid user_id FK
        string title
        string type
        timestamp created_at
        timestamp last_active_at
        boolean is_deleted
    }
    
    MESSAGES {
        uuid id PK
        uuid session_id FK
        string role
        text content
        string model
        int tokens
        decimal cost
        timestamp created_at
    }
    
    FILES {
        uuid id PK
        uuid user_id FK
        string filename
        string original_name
        string mime_type
        int size
        string storage_path
        timestamp created_at
    }
    
    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        string plan_id
        string plan_name
        decimal price
        string status
        timestamp start_date
        timestamp end_date
        timestamp created_at
    }
    
    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid subscription_id FK
        string plan_id
        decimal amount
        string status
        string transaction_id
        timestamp paid_at
        timestamp created_at
    }
```

---

## 5️⃣ 数据流架构

```mermaid
graph LR
    A[用户操作] --> B[前端 UI]
    B --> C[API 请求]
    C --> D[API 网关]
    D --> E[路由分发]
    E --> F[业务逻辑]
    F --> G[数据访问]
    G --> H[数据库]
    H --> I[数据持久化]
    I --> G
    G --> F
    F --> J[业务处理]
    J --> K[结果格式化]
    K --> L[HTTP 响应]
    L --> M[前端渲染]
    M --> N[UI 更新]
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style N fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
```

---

## 6️⃣ 部署架构

```mermaid
graph TB
    subgraph 用户访问层
        A[用户请求] --> B[DNS 解析]
        B --> C[CDN 加速]
    end
    
    subgraph 负载均衡层
        C --> D[Nginx 反向代理<br/>HTTPS 终止]
        D --> E[负载均衡]
    end
    
    subgraph 应用服务层
        E --> F[Node.js #1<br/>PM2 管理]
        E --> G[Node.js #2<br/>PM2 管理]
        E --> H[Node.js #3<br/>PM2 管理]
    end
    
    subgraph 数据存储层
        F --> I[(PostgreSQL<br/>主从复制)]
        G --> I
        H --> I
        
        F --> J[(Redis<br/>集群)]
        G --> J
        H --> J
        
        F --> K[Aliyun OSS<br/>文件存储]
        G --> K
        H --> K
    end
    
    subgraph 监控运维层
        I --> L[云监控]
        J --> L
        K --> L
        L --> M[日志服务]
        L --> N[告警通知]
    end
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style K fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
```

---

## 7️⃣ 微服务架构

```mermaid
graph TB
    subgraph API 网关
        A[API Gateway<br/>Express.js]
    end
    
    subgraph 核心服务
        A --> B[用户服务<br/>User Service]
        A --> C[对话服务<br/>Chat Service]
        A --> D[文件服务<br/>File Service]
        A --> E[会员服务<br/>Member Service]
    end
    
    subgraph 工具服务
        A --> F[Excel 工具<br/>Excel Tool]
        A --> G[搜索工具<br/>Search Tool]
        A --> H[写作工具<br/>Writing Tool]
    end
    
    subgraph 支撑服务
        A --> I[短信服务<br/>SMS Service]
        A --> J[大模型路由<br/>LLM Router]
        A --> K[内容审核<br/>Content Safety]
    end
    
    subgraph 数据存储
        B --> L[(用户数据库)]
        C --> M[(会话数据库)]
        D --> N[(文件数据库)]
        D --> O[OSS 存储]
        E --> P[(订单数据库)]
    end
    
    style A fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style K fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style N fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style O fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style P fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
```

---

## 8️⃣ CI/CD 流程

```mermaid
graph LR
    A[代码提交] --> B[GitHub]
    B --> C[GitHub Actions]
    C --> D[代码检查]
    D --> E[单元测试]
    E --> F[构建打包]
    F --> G[部署测试]
    G --> H{测试通过？}
    H -->|是 | I[部署生产]
    H -->|否 | J[通知开发]
    I --> K[健康检查]
    K --> L[更新完成]
    J --> M[修复 Bug]
    M --> A
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#4facfe,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#43e97b,stroke:#333,stroke-width:2px,color:#fff
    style J fill:#fa709a,stroke:#333,stroke-width:2px,color:#fff
```

---

## 9️⃣ 技术栈全景图

```mermaid
mindmap
  root((能虾助手<br/>技术栈))
    前端技术
      微信小程序
        uni-app
        Vue3
      Web
        Vite
        Vue3
      Desktop
        Electron
      UI 组件
        uView UI
    后端技术
      运行时
        Node.js 22+
      框架
        Express.js
      语言
        JavaScript
        TypeScript
      进程管理
        PM2
    数据库
      关系型
        PostgreSQL
        MySQL
      缓存
        Redis
      对象存储
        Aliyun OSS
    第三方服务
      大模型
        通义千问
        智谱 GLM
        Kimi
      短信
        阿里云
      支付
        微信支付
        支付宝
      安全
        内容安全
    DevOps
      版本控制
        Git
        GitHub
      CI/CD
        GitHub Actions
      监控
        云监控
        日志服务
      部署
        阿里云 ECS
```

---

## 🔟 业务流程图

```mermaid
graph TB
    A[用户注册/登录] --> B{登录方式？}
    B -->|手机号 | C[发送验证码]
    B -->|微信 | D[微信授权]
    C --> E[输入验证码]
    D --> E
    E --> F[验证通过]
    F --> G[进入首页]
    G --> H{选择功能？}
    H -->|对话 | I[输入问题]
    H -->|上传文件 | J[选择文件]
    H -->|模板 | K[选择模板]
    I --> L[AI 分析]
    J --> L
    K --> L
    L --> M[生成结果]
    M --> N[查看结果]
    N --> O{保存/导出？}
    O -->|保存 | P[保存到数据中心]
    O -->|导出 | Q[导出文件]
    P --> R[完成]
    Q --> R
    
    style A fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#43e97b,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#f093fb,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#f5576c,stroke:#333,stroke-width:2px,color:#fff
    style R fill:#43e97b,stroke:#333,stroke-width:2px,color:#fff
```

---

## 📋 如何使用

### 在 GitHub 查看

1. 打开 `.md` 文件
2. GitHub 自动渲染 Mermaid 图表
3. 支持缩放和全屏查看

### 在本地查看

**方式 1: VS Code**
```
安装插件：Mermaid Preview
打开 .md 文件
预览图表
```

**方式 2: 在线编辑器**
```
访问：https://mermaid.live
复制图表代码
粘贴预览
```

**方式 3: Node.js**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.mmd -o output.png
```

---

🦞 **能虾助手出品 | 可视化架构图完成！**

*最后更新：2026-03-12*
