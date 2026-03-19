# 能虾助手 - Web 端 UI/UX 设计方案

**版本：** v1.0  
**参考文档：** 产品需求文档 - 多端统一版（整合仓库文档）.md  
**设计风格：** 参考豆包（简洁、年轻、活力）+ 能虾品牌规范  
**设计工具：** Figma / Sketch  
**更新日期：** 2026-03-18  

---

## 一、设计概述

### 1.1 设计目标

```yaml
goals:
  - 简洁友好：降低技术距离感，参考豆包风格
  - 高效易用：3 步内完成核心操作
  - 品牌一致：能虾紫 (#667eea)、🦐 Logo
  - 响应式：支持桌面端和移动端 Web
```

### 1.2 设计原则

```yaml
principles:
  - clarity: 清晰 - 信息层次分明
  - efficiency: 高效 - 减少操作步骤
  - consistency: 一致 - 多端统一体验
  - delight: 惊喜 - 微动画和友好文案
```

### 1.3 目标用户

```yaml
users:
  - 职场白领：办公提效，快速生成报告
  - 电商卖家：数据分析，客服自动化
  - 学生：学习助手，资料搜集
  - 自由职业者：生产力工具
```

---

## 二、设计系统（Design System）

### 2.1 色彩系统

```yaml
colors:
  # 品牌色（整合自 BRANDING.md）
  brand:
    primary: "#667eea"      # 能虾紫（主色）
    secondary: "#764ba2"    # 深紫（辅助色）
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  
  # 功能色
  functional:
    success: "#10b981"      # 成功
    warning: "#f59e0b"      # 警告
    error: "#ef4444"        # 错误
    info: "#3b82f6"         # 信息
  
  # 中性色
  neutral:
    white: "#FFFFFF"
    gray-50: "#F9FAFB"
    gray-100: "#F3F4F6"
    gray-200: "#E5E7EB"
    gray-300: "#D1D5DB"
    gray-400: "#9CA3AF"
    gray-500: "#6B7280"
    gray-600: "#4B5563"
    gray-700: "#374151"
    gray-800: "#1F2937"
    gray-900: "#111827"
    black: "#000000"
  
  # 使用场景
  usage:
    primary_button: brand.primary
    secondary_button: white + gray-300 border
    link: brand.primary
    text_primary: gray-900
    text_secondary: gray-500
    background: gray-50
    surface: white
    border: gray-200
```

### 2.2 字体系统

```yaml
typography:
  font_family:
    chinese: "PingFang SC, Microsoft YaHei, 思源黑体"
    english: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"
    mono: "'Fira Code', 'Courier New', monospace"
  
  font_sizes:
    xs: 12px   # 辅助文字
    sm: 14px   # 次要文字
    md: 16px   # 正文
    lg: 18px   # 小标题
    xl: 24px   # 大标题
    xxl: 32px  # 超大标题
    xxxl: 48px # 展示标题
  
  font_weights:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
  
  line_heights:
    tight: 1.2
    normal: 1.5
    relaxed: 1.75
  
  usage:
    heading_xl: { size: 32px, weight: 700, line_height: 1.2 }
    heading_lg: { size: 24px, weight: 600, line_height: 1.3 }
    heading_md: { size: 18px, weight: 600, line_height: 1.4 }
    body: { size: 16px, weight: 400, line_height: 1.5 }
    caption: { size: 14px, weight: 400, line_height: 1.5 }
```

### 2.3 间距系统

```yaml
spacing:
  base: 4px
  
  scale:
    xs: 4px     # 超小间距
    sm: 8px     # 小间距
    md: 16px    # 中间距
    lg: 24px    # 大间距
    xl: 32px    # 超大间距
    xxl: 48px   # 超大间距
    xxxl: 64px  # 展示间距
  
  usage:
    component_padding: md
    section_padding: xl
    card_gap: lg
    button_padding: "sm md"
```

### 2.4 圆角系统

```yaml
border_radius:
  none: 0
  sm: 4px      # 小按钮
  md: 8px      # 卡片
  lg: 12px     # 大卡片
  xl: 16px     # 模态框
    full: 9999px # 圆形
  
  usage:
    button: md
    card: lg
    input: md
    avatar: full
    modal: xl
```

### 2.5 阴影系统

```yaml
shadows:
  none: "none"
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  
  usage:
    card: md
    dropdown: lg
    modal: xl
    hover: lg
```

### 2.6 动画系统

```yaml
animations:
  duration:
    fast: 150ms
    normal: 300ms
    slow: 500ms
  
  easing:
    default: "ease-in-out"
    ease_out: "cubic-bezier(0.33, 1, 0.68, 1)"
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  
  animations:
    fade_in:
      from: { opacity: 0 }
      to: { opacity: 1 }
      duration: normal
    
    slide_up:
      from: { transform: "translateY(20px)", opacity: 0 }
      to: { transform: "translateY(0)", opacity: 1 }
      duration: normal
    
    scale_in:
      from: { transform: "scale(0.95)", opacity: 0 }
      to: { transform: "scale(1)", opacity: 1 }
      duration: fast
    
    loading_dots:
      0%: { transform: "translateY(0)" }
      50%: { transform: "translateY(-10px)" }
      100%: { transform: "translateY(0)" }
      duration: "1.4s"
      iteration: infinite
  
  usage:
    page_transition: slide_up
    modal_open: scale_in
    button_hover: fast
    loading: loading_dots
```

---

## 三、组件库

### 3.1 按钮（Button）

```yaml
component: Button
variants:
  - primary:
      background: brand.gradient
      color: white
      border: none
      usage: 主要操作（登录、发送、支付）
  
  - secondary:
      background: white
      color: gray-700
      border: 1px solid gray-300
      usage: 次要操作（取消、返回）
  
  - ghost:
      background: transparent
      color: brand.primary
      border: none
      usage: 链接式操作（查看更多、了解详情）
  
  - danger:
      background: error
      color: white
      border: none
      usage: 危险操作（删除、退出）

sizes:
  sm: { height: 32px, padding: "8px 16px", font_size: 14px }
  md: { height: 40px, padding: "10px 24px", font_size: 16px }
  lg: { height: 48px, padding: "12px 32px", font_size: 18px }

states:
  default: { opacity: 1 }
  hover: { opacity: 0.9, shadow: md }
  active: { opacity: 0.8, transform: "scale(0.98)" }
  disabled: { opacity: 0.5, cursor: not-allowed }
  loading: { opacity: 0.7, cursor: wait }

examples:
  - |
    [立即体验] (Primary, md)
  - |
    [取消] (Secondary, md)
  - |
    [了解更多 →] (Ghost, sm)
```

### 3.2 输入框（Input）

```yaml
component: Input
variants:
  - text: 文本输入
  - password: 密码输入
  - textarea: 多行文本
  - search: 搜索框

states:
  default:
    border: 1px solid gray-300
    background: white
  
  focus:
    border: 2px solid brand.primary
    outline: none
    shadow: "0 0 0 3px rgba(102, 126, 234, 0.1)"
  
  error:
    border: 1px solid error
    background: "#FEF2F2"
  
  disabled:
    background: gray-100
    cursor: not-allowed

sizes:
  sm: { height: 32px, font_size: 14px }
  md: { height: 40px, font_size: 16px }
  lg: { height: 48px, font_size: 18px }

features:
  - placeholder: 占位符
  - prefix: 前缀图标
  - suffix: 后缀图标（清除、显示密码）
  - maxlength: 最大长度
  - show_count: 显示字数

examples:
  - |
    ┌─────────────────────────────┐
    │ 请输入手机号...              │
    └─────────────────────────────┘
```

### 3.3 卡片（Card）

```yaml
component: Card
variants:
  - elevated:
      background: white
      shadow: md
      border: none
      usage: 内容卡片
  
  - outlined:
      background: white
      shadow: none
      border: 1px solid gray-200
      usage: 选项卡片
  
  - filled:
      background: gray-50
      shadow: none
      border: none
      usage: 分组卡片

padding: lg
border_radius: lg

examples:
  - |
    ┌─────────────────────────┐
    │  卡片标题               │
    │  卡片内容...            │
    │  [操作按钮]             │
    └─────────────────────────┘
```

### 3.4 对话气泡（Chat Bubble）

```yaml
component: ChatBubble
variants:
  - user:
      align: right
      background: brand.primary
      color: white
      border_radius: "16px 16px 0 16px"
  
  - ai:
      align: left
      background: white
      color: gray-900
      border: 1px solid gray-200
      border_radius: "16px 16px 16px 0"
      avatar: 🦐

features:
  - text: 文字消息
  - image: 图片消息
  - file: 文件消息
  - loading: 加载中状态
  - error: 错误状态

examples:
  - |
    AI:
    🦐 你好！我是能虾助手
    有什么可以帮你的？
    
    User:
                    帮我写一份周报
```

### 3.5 快捷指令（Quick Action）

```yaml
component: QuickAction
style:
  background: white
  border: 1px solid gray-200
  border_radius: md
  padding: md
  hover:
    border_color: brand.primary
    shadow: md

layout: grid
columns: 3 (desktop), 2 (mobile)
gap: md

items:
  - icon: 📝
    title: 帮我写周报
    desc: 1 分钟生成工作报告
  
  - icon: 📊
    title: 分析 Excel
    desc: 自动分析数据生成图表
  
  - icon: 🔍
    title: 搜索报告
    desc: 自动搜索行业报告
  
  - icon: ✉️
    title: 写一封邮件
    desc: 专业邮件模板
  
  - icon: 📸
    title: 图片 OCR
    desc: 快速识别图片文字
  
  - icon: 🎤
    title: 语音输入
    desc: 解放双手
```

### 3.6 文件上传（File Upload）

```yaml
component: FileUpload
variants:
  - drag_drop:
      area: 大区域拖拽
      text: "拖拽文件到此处，或点击上传"
      icon: 📎
  
  - button:
      text: "选择文件"
      icon: 📎

supported_formats: [.xlsx, .csv, .pdf, .jpg, .png]
max_size: 100MB

states:
  - idle: 等待上传
  - uploading: 显示进度条
  - success: 上传成功
  - error: 上传失败（显示错误信息）

features:
  - progress: 上传进度
  - preview: 文件预览
  - remove: 移除文件
  - multiple: 多文件上传
```

### 3.7 会员卡片（Membership Card）

```yaml
component: MembershipCard
variants:
  - free:
      name: 免费版
      price: ¥0/月
      color: gray-500
      features:
        - 每天 5 次 Agent 调用
        - 基础文件处理
        - 10MB 文件限制
      cta: [当前套餐]
      disabled: true
  
  - standard:
      name: 标准版 ⭐ 最受欢迎
      price: ¥19/月 或 ¥98/年
      color: brand.primary
      badge: 最受欢迎
      features:
        - 无限次 Agent 调用
        - 全工具链使用
        - 100MB 文件限制
        - 自定义 Skill
      cta: [立即开通]
  
  - pro:
      name: 专业版
      price: ¥39/月 或 ¥198/年
      color: purple-600
      features:
        - 标准版所有功能
        - 端侧模型使用
        - 团队协作功能
        - 500MB 文件限制
        - 专属客服
      cta: [立即开通]
  
  - enterprise:
      name: 企业版
      price: ¥5000/年起
      color: amber-600
      features:
        - 专业版所有功能
        - 私有化部署
        - 定制开发
        - 1GB 文件限制
        - SLA 保障
      cta: [联系销售]

layout: grid
columns: 4 (desktop), 2 (mobile)
gap: lg
```

---

## 四、页面设计

### 4.1 首页（未登录）

```yaml
page: HomePage
url: /
layout: LandingLayout

sections:
  - header:
      height: 64px
      background: transparent
      items:
        - logo:
            icon: 🦐
            text: 能虾助手
            font_size: 20px
            font_weight: bold
            click: /
        - spacer: { flex: 1 }
        - nav:
            - { text: 功能，click: "#features" }
            - { text: 价格，click: "#pricing" }
            - { text: 登录，click: "/login", type: button }
  
  - hero:
      align: center
      padding: "80px 20px"
      background: brand.gradient
      items:
        - mascot:
            image: /assets/mascot-3d.png
            width: 200px
            animation: float
        - title:
            text: "你好，我是能虾助手"
            font_size: 32px
            font_weight: bold
            color: white
            margin_top: 24px
        - subtitle:
            text: "让 AI 真正为你工作，开启高效智能生活"
            font_size: 16px
            color: white (opacity: 0.9)
            margin_top: 12px
        - cta_button:
            text: "立即体验 →"
            type: primary
            size: lg
            margin_top: 32px
            click: /login
        - feature_cards:
            layout: grid
            columns: 3
            gap: 24px
            margin_top: 64px
            items:
              - icon: 💬
                title: 智能对话
                desc: AI 助手随时待命
              - icon: 📊
                title: 文件处理
                desc: Excel/PDF 轻松分析
              - icon: 🔍
                title: 网络搜索
                desc: 获取最新信息
              - icon: 📝
                title: 文案写作
                desc: 周报/邮件一键生成
              - icon: 📸
                title: 图片 OCR
                desc: 快速识别文字
              - icon: ⚡
                title: 自动化任务
                desc: 定时任务自动执行
  
  - features:
      id: features
      title: 核心功能
      layout: grid
      columns: 2
      gap: 32px
      items:
        - card:
            icon: 💬
            title: AI 智能对话
            desc: 基于大模型的 AI 助手，支持多轮对话，理解上下文
            features:
              - 文字对话
              - 文件上传
              - 语音输入
              - 图片识别
        - card:
            icon: 📊
            title: Excel 数据分析
            desc: 自动分析数据，生成图表和洞察报告
            features:
              - 数据概览
              - 趋势分析
              - 异常检测
              - 报告导出
        - card:
            icon: 🔍
            title: 网络搜索
            desc: 多源搜索，智能摘要，信息来源可追溯
            features:
              - 多源搜索
              - 智能摘要
              - 来源标注
              - 导出报告
        - card:
            icon: 📝
            title: 文案写作
            desc: 周报、邮件、营销文案，一键生成
            features:
              - 预设模板
              - 自定义输入
              - 多版本选择
              - 编辑修改
  
  - pricing:
      id: pricing
      title: 会员套餐
      layout: grid
      columns: 4
      gap: 24px
      items:
        - membership_card: free
        - membership_card: standard
        - membership_card: pro
        - membership_card: enterprise
  
  - footer:
      height: 200px
      background: gray-900
      items:
        - links:
            layout: flex
            gap: 48px
            items:
              - group: 产品
                links: [功能，价格，更新日志]
              - group: 公司
                links: [关于我们，联系方式，加入我们]
              - group: 法律
                links: [隐私政策，用户协议，免责声明]
        - copyright:
            text: "© 2026 能虾助手 版权所有"
            color: gray-500
            margin_top: 32px
```

### 4.2 登录页

```yaml
page: LoginPage
url: /login
layout: AuthLayout

sections:
  - header:
      items:
        - logo:
            icon: 🦐
            text: 能虾助手
            click: /
        - spacer: { flex: 1 }
        - link:
            text: 还没有账号？立即注册
            click: /register
  
  - main:
      align: center
      max_width: 400px
      items:
        - title:
            text: 欢迎回来
            font_size: 24px
            font_weight: bold
            margin_bottom: lg
        - login_form:
            items:
              - phone_input:
                  label: 手机号
                  type: tel
                  placeholder: 请输入手机号
                  required: true
                  rules:
                    - pattern: "^1[3-9]\\d{9}$"
                      message: 请输入正确的手机号
              
              - verify_code_input:
                  label: 验证码
                  type: text
                  placeholder: 请输入验证码
                  required: true
                  suffix:
                    - button:
                        text: 获取验证码
                        click: sendCode
                        disabled_after_click: 60s
              
              - password_input:
                  label: 密码
                  type: password
                  placeholder: 请输入密码
                  required: true
                  min_length: 6
                  suffix:
                    - icon: 👁️
                      click: togglePassword
              
              - forgot_password:
                  text: 忘记密码？
                  click: /forgot-password
                  align: right
              
              - submit_button:
                  text: 登录
                  type: primary
                  size: lg
                  full_width: true
                  click: handleLogin
              
              - divider:
                  text: 其他登录方式
              
              - wechat_login:
                  icon: 微信
                  text: 微信登录
                  click: handleWechatLogin
                  full_width: true
```

### 4.3 对话页（核心页面）

```yaml
page: ChatPage
url: /app/chat
layout: AppLayout

sections:
  - sidebar:
      width: 280px
      collapsible: true
      items:
        - new_chat_button:
            text: "+ 新建对话"
            type: primary
            full_width: true
            click: createNewChat
        - conversation_list:
            items:
              - item:
                  title: 今天的对话
                  time: 14:30
                  preview: 帮我写一份周报...
                  active: true
                  click: loadConversation
              - item:
                  title: Excel 数据分析
                  time: 昨天
                  preview: 上传了销售数据.xlsx
                  click: loadConversation
              - item:
                  title: 行业报告搜索
                  time: 3 天前
                  preview: 搜索 AI 行业报告
                  click: loadConversation
        - bottom_menu:
            items:
              - { icon: ⚙️, text: 设置，click: /settings }
              - { icon: 👤, text: 个人中心，click: /profile }
  
  - main_content:
      flex: 1
      items:
        - header:
            height: 64px
            border_bottom: 1px solid gray-200
            items:
              - toggle_sidebar:
                  icon: ☰
                  click: toggleSidebar
              - conversation_title:
                  text: 新的对话
                  font_size: 16px
                  font_weight: medium
              - spacer: { flex: 1 }
              - more_actions:
                  icon: ⋮
                  click: showMenu
                  dropdown:
                    - { text: 重命名，click: rename }
                    - { text: 导出，click: export }
                    - { text: 删除，click: delete, danger: true }
        
        - message_list:
            flex: 1
            overflow: auto
            padding: 20px
            items:
              - welcome_message: (if empty)
                  align: center
                  items:
                    - mascot:
                        src: /assets/mascot-3d.png
                        width: 80px
                    - greeting:
                        text: "你好呀！我是能虾助手👋"
                        font_size: 20px
                        font_weight: bold
                        margin_top: 16px
                    - subtitle:
                        text: "有什么可以帮你的？"
                        font_size: 16px
                        color: gray-500
                        margin_top: 8px
                    - quick_actions:
                        layout: grid
                        columns: 3
                        gap: 16px
                        margin_top: 32px
                        items:
                          - { icon: 📝, title: 帮我写周报, click: "帮我写一份周报" }
                          - { icon: 📊, title: 分析 Excel, click: "帮我分析这个 Excel" }
                          - { icon: 🔍, title: 搜索报告, click: "搜索最新的 AI 行业报告" }
                          - { icon: ✉️, title: 写邮件, click: "帮我写一封邮件" }
                          - { icon: 📸, title: 图片 OCR, click: "帮我识别这张图片的文字" }
                          - { icon: 🎤, title: 语音输入, click: startVoiceInput }
              
              - message_bubble: (for each message)
                  if ai:
                    align: left
                    avatar: 🦐
                    background: white
                    border: 1px solid gray-200
                    items:
                      - content: (text/image/file)
                      - actions:
                          - { icon: 📋, text: 复制，click: copy }
                          - { icon: 👍, text: 有用，click: like }
                          - { icon: 👎, text: 无用，click: dislike }
                  
                  if user:
                    align: right
                    background: brand.primary
                    color: white
                    items:
                      - content: (text/image/file)
        
        - input_area:
            height: auto
            min_height: 80px
            padding: 16px
            border_top: 1px solid gray-200
            background: white
            items:
              - attach_button:
                  icon: 📎
                  click: uploadFile
                  tooltip: 上传文件
              - input_box:
                  placeholder: "输入你的问题..."
                  min_height: 40px
                  max_height: 120px
                  flex: 1
                  autosize: true
              - voice_button:
                  icon: 🎤
                  click: startVoiceInput
                  tooltip: 语音输入
                  state:
                    - default: 🎤
                    - recording: 🔴
              - send_button:
                  icon: ➤
                  type: primary
                  disabled: if input.empty
                  click: sendMessage
```

### 4.4 文件页

```yaml
page: FilesPage
url: /app/files
layout: AppLayout

sections:
  - header:
      title: 文件管理
      actions:
        - button:
            text: 上传文件
            type: primary
            click: uploadFile
    
  - main_content:
      items:
        - upload_area:
            type: drag_drop
            text: "拖拽文件到此处，或点击上传"
            icon: 📎
            supported_formats: [.xlsx, .csv, .pdf, .jpg, .png]
            max_size: 100MB
        
        - file_list:
            layout: grid
            columns: 4
            gap: 16px
            items:
              - file_card:
                  icon: 📊
                  name: 销售数据.xlsx
                  size: 2.3 MB
                  upload_time: 2026-03-18 14:30
                  actions:
                    - { icon: 👁️, click: preview }
                    - { icon: ⬇️, click: download }
                    - { icon: 🗑️, click: delete }
              
              - file_card:
                  icon: 📄
                  name: 产品文档.pdf
                  size: 1.5 MB
                  upload_time: 2026-03-17 10:20
                  actions: [...]
```

### 4.5 个人中心页

```yaml
page: ProfilePage
url: /app/profile
layout: AppLayout

sections:
  - header:
      title: 个人中心
  
  - main_content:
      max_width: 800px
      items:
        - user_info_card:
            items:
              - avatar:
                  src: /assets/default-avatar.png
                  size: 80px
              - name:
                  text: 用户昵称
                  font_size: 20px
                  font_weight: bold
              - phone:
                  text: 138****1234
                  color: gray-500
              - edit_button:
                  text: 编辑资料
                  click: editProfile
        
        - membership_card:
            current_plan: 标准会员
            expire_date: 2026-04-18
            features:
              - 无限次 Agent 调用
              - 全工具链使用
              - 100MB 文件限制
            actions:
              - { text: 续费，click: renew }
              - { text: 升级，click: upgrade }
        
        - menu_list:
            items:
              - { icon: ⚙️, text: 账号设置，click: /settings/account }
              - { icon: 💳, text: 会员管理，click: /settings/membership }
              - { icon: 📊, text: 使用统计，click: /settings/stats }
              - { icon: ❓, text: 帮助与反馈，click: /help }
              - { icon: 📜, text: 隐私政策，click: /privacy }
              - { icon: 🚪, text: 退出登录，click: logout, danger: true }
```

---

## 五、响应式设计

### 5.1 断点

```yaml
breakpoints:
  xs: 375px   # 小屏手机
  sm: 768px   # 大屏手机
  md: 1024px  # 平板
  lg: 1440px  # 桌面
  xl: 1920px  # 大屏桌面
```

### 5.2 布局适配

```yaml
responsive:
  mobile:
    width: 100%
    navigation: bottom_tabs
    sidebar: hidden
    input: fixed_bottom
    card_columns: 1
  
  tablet:
    width: 100%
    navigation: side_drawer
    sidebar: collapsible
    input: fixed_bottom
    card_columns: 2
  
  desktop:
    width: 100%
    max_width: 1440px
    navigation: sidebar
    sidebar: fixed
    input: fixed_bottom
    card_columns: 3-4
```

---

## 六、交互细节

### 6.1 加载状态

```yaml
loading:
  skeleton:
    - 页面加载时使用骨架屏
    - 动画：pulse
    - 颜色：gray-100 → gray-200
  
  spinner:
    - 按钮/小区域加载
    - 动画：rotate
    - 颜色：brand.primary
  
  progress_bar:
    - 文件上传进度
    - 动画：slide
    - 颜色：brand.primary
```

### 6.2 错误提示

```yaml
error:
  toast:
    - 位置：顶部居中
    - 背景：error
    - 颜色：white
    - 自动消失：3s
  
  inline:
    - 输入框错误
    - 边框：error
    - 提示文字：error (font_size: 14px)
  
  modal:
    - 严重错误
    - 标题：操作失败
    - 内容：错误详情
    - 按钮：[重试] [取消]
```

### 6.3 成功提示

```yaml
success:
  toast:
    - 位置：顶部居中
    - 背景：success
    - 颜色：white
    - 图标：✓
    - 自动消失：2s
```

---

## 七、设计稿交付

### 7.1 Figma 文件结构

```yaml
figma:
  pages:
    - 封面
    - 设计系统
      - 色彩
      - 字体
      - 组件
    - 页面设计
      - 首页
      - 登录页
      - 对话页
      - 文件页
      - 个人中心
    - 交互原型
    - 切图导出
```

### 7.2 交付物

```yaml
deliverables:
  - figma_file: 设计源文件
  - style_guide: 设计规范文档
  - components: 组件库
  - prototypes: 交互原型
  - assets: 切图资源（SVG/PNG）
  - code_snippets: 关键代码片段
```

---

## 八、下一步

### 8.1 设计阶段

```yaml
phases:
  - phase: 设计稿
    duration: 1 周
    deliverables:
      - 首页设计
      - 对话页设计
      - 组件库
  
  - phase: 交互原型
    duration: 3 天
    deliverables:
      - 可点击原型
      - 交互说明
  
  - phase: 设计评审
    duration: 2 天
    deliverables:
      - 评审意见
      - 修改稿
```

### 8.2 开发对接

```yaml
handoff:
  tools:
    - Figma (设计稿)
    - Zeplin (切图标注)
    - Storybook (组件文档)
  
  process:
    - 设计评审
    - 技术评审
    - 开发实现
    - 设计验收
```

---

**文档结束**

---

**能虾助手 - 让 AI 真正为你工作** 🦐

*最后更新：2026-03-18*  
*设计师：无敌大头虾*
