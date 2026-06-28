# Figma 导入资料

> 本文件夹包含将当前代码实现导入 Figma 所需的所有资料。

## 文件说明

| 文件 | 用途 |
|------|------|
| `prompt.md` | 发给 Figma Make AI 的提示词 |
| `screens.md` | 所有页面的视觉描述（ASCII 布局图 + 元素尺寸 + 颜色值） |
| `design-tokens.md` | 所有精确视觉数值（颜色/渐变/圆角/间距/动画） |
| `ui-comparison.md` | 原始设计稿 vs 当前实现的对比文档 |

## 使用方式

1. 打开 Figma Make
2. 将 `prompt.md` 内容复制粘贴给 Figma Make
3. 将 `screens.md` + `design-tokens.md` 作为附件上传
4. Figma Make 会根据这些资料生成 Figma 设计稿
