# Figma 设计更新提示词

> 复制以下内容发给设计师或 Figma AI。

---

我有一个任务管理 app 的 Figma 设计稿，现在代码已经实现完毕，但实现过程中做了一些设计变更和新增功能。请基于我提供的信息，更新 Figma 设计稿使其与实际代码一致。

## 参考文件
- 原始设计稿：`design/mockup/src/app/App.tsx`（React 代码，已实现的视觉效果）
- 设计令牌：`docs/design-tokens.md`（所有精确数值）
- UI 对比文档：`docs/design-export/ui-comparison.md`（变更和新增内容）

## 需要更新的内容

### 1. 布局变更
- 左侧面板：热力图下方新增「项目进度/标签」tab 切换区域
- 右侧面板：标题区域新增「事项/看板/日历」三个 tab

### 2. 任务卡片重设计
- 从单行改为两行布局：
  - 第一行：[checkbox] [描述文本] [截止日期 badge]
  - 第二行：[标签 pills] [优先级 badge] [计时按钮] [编辑箭头]

### 3. 新增弹窗（需要设计）
- TaskEditModal：编辑任务（优先级/日期/项目/标签）
- DayCompletedModal：热力图点击弹窗
- ProjectManageModal：项目管理（重命名/删除/任务列表）
- TagManageModal：标签管理（重命名/删除/任务列表）
- HelpModal：键盘快捷键帮助

### 4. 已完成区域
- 列表底部新增折叠区域「已完成 (N)」
- 点击展开显示已完成任务列表
- 样式：实心圆打勾 + 描述中划线 + 完成时间

### 5. 视觉规范
- 所有弹窗使用玻璃拟态风格（半透明 + backdrop-blur）
- 暗色/亮色双主题适配
- 遵循 `docs/design-tokens.md` 中的精确数值

请基于以上信息更新设计稿，确保设计与实际代码实现一致。
