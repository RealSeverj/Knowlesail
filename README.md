# Knowlesail

本仓库已按 Tailwind CSS + Varlet UI 的最佳实践完成配置统一。以下为开发指南，帮助你快速上手并保持代码一致性。

## Todos
- 为todo加入自然语言添加代办
- 适配安卓手机的顶栏

## 快速开始

- 安装依赖：make install
- 运行开发：make dev
- 构建生产：make build
- 预览构建：make preview
- 安装Capacitor依赖：make install-capacitor
- 同步安卓项目：make sync-android
- 打开安卓项目：make open-android
- 运行安卓项目：make run-android
- 构建APK：make build-apk

## 技术栈

- Vue 3 + Vite 7
- Pinia 状态管理
- Tailwind CSS 3（启用 data-theme 暗色模式）
- Varlet UI 3（移动端优先的 Vue3 组件库）

## 目录约定（节选）

- 全局样式入口：`src/style.css`
  - 顺序：自定义变量与主题 → Tailwind 基础/组件/工具 → 全局 reset → 其他样式
- 主题变量：`src/assets/styles/variables.css`
- 主题工具类：`src/assets/styles/themes.css`
- 响应式工具类：`src/assets/styles/responsive.css`

## Tailwind 使用规范

- 已启用暗色模式选择器：`dark:` 与 `[data-theme="dark"]`，通过 `document.documentElement.setAttribute('data-theme', 'dark')` 生效。
- 在 SFC 中优先使用原子类；当样式复用较多时，将组合类提取到 `themes.css` 或组件私有 `<style>`。
- 原子类顺序建议：布局 → 尺寸 → 间距 → 排版 → 颜色/背景 → 边框 → 其他（保持可读性）。

## Varlet 使用规范

- 全局注册：在 `src/main.js` 已 `app.use(Varlet)`，并引入 `@varlet/ui/es/style` 与 `@varlet/icons`。
- 桌面端调试：已引入 `@vant/touch-emulator` 模拟触摸事件，无需额外操作。
- 主题适配：推荐覆盖 CSS 变量（见 `variables.css` 的 “Varlet UI 主题变量覆盖” 片段），避免直接修改组件内部样式。

## 主题与暗色模式

- 统一通过 `useTheme` 组合式函数切换：`document.documentElement` 上的 `data-theme` 会影响 Tailwind 与自定义变量。
- Tailwind 已配置 `darkMode: ['class', '[data-theme="dark"]']`，因此两种触发方式都可兼容。

## 代码风格

- 组件按需拆分，公共组件放在 `src/components/Common`。
- 路由视图在 `src/views`，路由守卫逻辑在 `src/router/guards.js`。
- API 调用通过 `src/api/*` 封装，Pinia stores 位于 `src/stores/*`。

## 常见问题

1. 暗色模式不生效？
   - 确认是否调用了 `useTheme().initTheme()`。
   - 检查 `<html>` 是否存在 `data-theme="dark"` 属性。
2. 移动端交互在桌面无效？
   - 开发环境已启用触摸模拟，刷新页面重试；若在生产环境需要，请谨慎评估再启用。
3. Tailwind 类名冲突或被覆盖？
   - 确保 `src/style.css` 中导入顺序保持：变量/主题 → `@tailwind base; @tailwind components; @tailwind utilities;` → reset/自定义。

---

如需进一步规范或新增主题，请遵循上述文件约定新增变量并在 `themes.css` 中补充对应工具类。

## 📱 "学海智航" 项目架构规划

### 🎯 项目定位与设计理念

- **响应式设计**：手机优先，桌面端自适应
- **模块化架构**：易于维护和扩展
- **未来兼容**：为转向原生 App 做准备

### 🏗️ 核心架构设计

#### 1. 导航结构 (Bottom Navigation)

```
[课程表] [代办事项] [🏠智能助手] [知识库] [个人中心]
     ↑           ↑         ↑        ↑        ↑
CurriculumView TodoView  HomeView KnowledgeView ProfileView
```

#### 2. 技术栈建议

- **Vue 3** + Composition API
- **Vue Router** (需要添加)
- **Pinia** (状态管理，需要添加)
- **Varlet UI** (移动端 UI 组件库)
- **Axios** (HTTP 请求)
- **Tailwind CSS**(响应式样式)
- **Capacitor**(迁移多端)

### 📁 完整目录结构规划

```
src/
├── main.js                 # 应用入口
├── App.vue                 # 根组件
├── style.css              # 全局样式
├── router/                # 路由配置
│   ├── index.js           # 路由主配置
│   └── guards.js          # 路由守卫
├── stores/                # Pinia状态管理
│   ├── index.js           # Store入口
│   ├── auth.js            # 认证状态
│   ├── curriculum.js      # 课程表状态
│   ├── todo.js            # 待办事项状态
│   ├── chat.js            # 聊天状态
│   ├── knowledge.js       # 知识库状态
│   ├── community.js       # 社区状态
│   └── profile.js         # 个人信息状态
├── api/                   # API接口层
│   ├── axios-config.js    # Axios配置 ✓
│   ├── auth.js            # 认证接口 ✓
│   ├── curriculum.js      # 课程表接口 ✓
│   ├── todo.js            # 待办事项接口 ✓
│   ├── chat.js            # 智能助手接口 ✓
│   ├── knowledge.js       # 知识库接口 ✓
│   ├── community.js       # 社区接口
│   └── profile.js         # 个人信息接口 ✓
├── components/            # 通用组件
│   ├── Layout/            # 布局组件 ✓
│   │   ├── AppHeader.vue  # 顶部导航
│   │   ├── BottomNav.vue  # 底部导航
│   │   ├── Sidebar.vue    # 侧边栏(桌面端)
│   │   └── AppLayout.vue  # 主布局容器
│   ├── Common/            # 通用基础组件
│   │   ├── LoadingSpinner.vue
│   │   ├── EmptyState.vue
│   │   ├── BackButton.vue
│   │   ├── SearchBar.vue
│   │   └── PullRefresh.vue
│   ├── Curriculum/        # 课程表组件 ✓
│   │   ├── WeekView.vue   # 周视图
│   │   ├── DayView.vue    # 日视图
│   │   ├── CourseCard.vue # 课程卡片
│   │   └── AddCourse.vue  # 添加课程
│   ├── Todo/              # 待办事项组件 ✓
│   │   ├── TodoList.vue   # 待办清单
│   │   ├── TodoItem.vue   # 待办项
│   │   ├── AddTodo.vue    # 添加待办
│   │   └── CategoryFilter.vue # 分类筛选
│   ├── Home/              # 智能助手组件 ✓
│   │   ├── ChatInterface.vue # 聊天界面
│   │   ├── MessageItem.vue   # 消息项
│   │   ├── InputBox.vue      # 输入框
│   │   ├── QuickActions.vue  # 快捷操作
│   │   ├── VoiceInput.vue    # 语音输入
│   │   ├── ChatSelection.vue # 聊天记录选择器
│   │   └── ExportToKnowledge.vue # 导出到知识库
│   ├── Knowledge/         # 知识库组件 ✓
│   │   ├── CategoryTree.vue  # 分类树
│   │   ├── NoteCard.vue      # 笔记卡片
│   │   ├── SearchResults.vue # 搜索结果
│   │   ├── NoteEditor.vue    # 笔记编辑器
│   │   ├── TagManager.vue    # 标签管理
│   │   ├── ChatImporter.vue  # 聊天记录导入器
│   │   ├── AnnotationEditor.vue # 批注编辑器
│   │   ├── CommunityPanel.vue   # 社区面板
│   │   ├── OfficialLibrary.vue  # 官方知识库
│   │   ├── MyNotes.vue         # 我的笔记
│   │   ├── PublishDialog.vue   # 发布对话框
│   │   ├── NoteInteraction.vue # 笔记互动组件
│   │   └── VersionHistory.vue  # 版本历史
│   ├── Profile/           # 个人中心组件 ✓
│   │   ├── UserInfo.vue   # 用户信息
│   │   ├── SettingsList.vue # 设置列表
│   │   ├── ThemeSwitch.vue  # 主题切换
│   │   └── DataSync.vue     # 数据同步
│   ├── ComfirmDialog.vue  # 确认对话框 ✓
│   └── ToastContainer.vue # 消息提示 ✓
├── views/                 # 页面视图
│   ├── CurriculumView.vue # 课程表页面 ✓
│   ├── TodoView.vue       # 待办事项页面 ✓
│   ├── HomeView.vue       # 智能助手页面 ✓
│   ├── KnowledgeView.vue  # 知识库页面 ✓
│   ├── ProfileView.vue    # 个人中心页面 ✓
│   ├── Auth/              # 认证相关页面 ✓
│   │   ├── LoginPage.vue  # 登录页 ✓
│   │   └── RegisterPage.vue # 注册页 ✓
│   ├── Knowledge/         # 知识库子页面
│   │   ├── OfficialPage.vue   # 官方知识库页面
│   │   ├── CommunityPage.vue  # 社区页面
│   │   ├── MyNotesPage.vue    # 我的笔记页面
│   │   ├── NoteDetailPage.vue # 笔记详情页
│   │   └── NoteEditPage.vue   # 笔记编辑页
│   └── Profile/           # 个人中心子页面 ✓
│       ├── ProfileEdit.vue    # 个人信息编辑 ✓
│       ├── PreferenceSettings.vue # 偏好设置 ✓
│       └── AboutPage.vue      # 关于页面 ✓
├── utils/                 # 工具函数
│   ├── date.js           # 日期处理
│   ├── storage.js        # 本地存储
│   ├── validation.js     # 表单验证
│   ├── permission.js     # 权限处理
│   └── responsive.js     # 响应式工具
├── composables/          # Vue 3 组合式函数
│   ├── useAuth.js        # 认证逻辑
│   ├── useTheme.js       # 主题切换
│   ├── useNetwork.js     # 网络状态
│   ├── usePullRefresh.js # 下拉刷新
│   ├── useResponsive.js  # 响应式判断
│   ├── useChatExport.js  # 聊天记录导出
│   └── useCommunity.js   # 社区功能
└── assets/               # 静态资源
    ├── images/           # 图片资源
    ├── icons/            # 图标资源
    └── styles/           # 样式文件
        ├── variables.css # CSS变量
        ├── responsive.css # 响应式样式
        └── themes.css    # 主题样式
```

### 🎨 UI/UX 设计方案

#### 1. 底部导航设计

```
┌─────────────────────────────────────┐
│                                     │
│           主要内容区域               │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [📚] [✅] [🏠] [📖] [👤]         │
│ 课程表  代办  助手  知识库  我的      │
└─────────────────────────────────────┘
```

#### 2. 页面布局特点

- **课程表**：周视图/日视图切换，时间轴布局
- **智能代办**：分类标签，优先级标识，进度追踪
- **智能助手**：聊天气泡，语音输入，快捷回复
- **知识库**：三层架构展示(官方/社区/我的)，智能导入聊天记录，社区互动
- **个人中心**：卡片式设置，数据统计展示

### 📱 响应式策略

#### 断点设置

```css
/* 手机端优先 */
@media (max-width: 768px) {
  /* 底部导航 + 单列布局 */
}

/* 平板端适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  /* 可选侧边栏 + 双列布局 */
}

/* 桌面端增强 */
@media (min-width: 1024px) {
  /* 侧边栏导航 + 多列布局 */
}
```

### 🔧 核心功能模块

#### 1. 课程表模块

- 周视图/日视图切换
- 在日视图中包含 todo 展示、点击为课程添加作业（自动加入 todo）
- 课程时间提醒
- 课程笔记关联
- 作业截止日期

#### 2. 智能代办模块

- 四象限展示
- AI 优先级推荐
- 番茄钟集成
- 进度可视化
- 数据统计分析

#### 3. 智能助手模块

- 多轮对话能力
- 语音交互
- 学习建议生成
- 快捷操作面板（支持拍照、上传文件、开关在线查找）
- **聊天记录管理**：支持选择对话片段导出到知识库
- **智能标记**：自动识别重要内容并提供标记建议

#### 4. 知识库模块

- **三层架构**：官方知识库 → 社区共建 → 我的笔记
- **智能导入**：从首页聊天记录一键生成笔记
- **批注功能**：对聊天内容进行标注和补充说明
- **分享机制**：私人笔记可选择发布到社区
- **智能推荐**：根据最近课程和学习进度推荐相关笔记
- **标签分类系统**：支持多级标签和智能分类
- **全文搜索**：跨官方、社区、个人三大类别的统一搜索
- **社区互动**：点赞、评论、收藏、关注作者
- **版本控制**：笔记的编辑历史和协作功能

#### 5. 个人中心模块

- 学习数据统计（创建的笔记数、完成的清单量、笔记收获的点赞、社区贡献度）
- 主题切换
- 数据同步备份
- 偏好设置(主页 AI 的聊天风格等)

### 🚀 实施步骤建议

1. **第一阶段**：基础架构搭建

   - 安装核心依赖
   - 设置路由和状态管理
   - 创建基础布局组件

2. **第二阶段**：核心页面开发

   - 完成 5 个主要页面的基础功能
   - 实现底部导航

3. **第三阶段**：功能完善

   - 添加高级功能
   - 优化用户体验
   - 响应式适配

4. **第四阶段**：测试优化
   - 性能优化
   - 兼容性测试
   - 用户体验优化
