/** CSS 变量值（颜色或长度值） */
export type CssVariableValue = string;

/** 主题分组 */
export type ThemeGroup = 'light' | 'dark';

/**
 * 主题的所有 CSS 变量定义。
 * 所有变量均为可选，缺失的变量会自动沿用 :root 默认值。
 */
export interface ThemeVariables {
  // ===== 主色调 =====
  'primary-50'?: CssVariableValue;
  'primary-100'?: CssVariableValue;
  'primary-200'?: CssVariableValue;
  'primary-300'?: CssVariableValue;
  'primary-400'?: CssVariableValue;
  'primary-500'?: CssVariableValue;
  'primary-600'?: CssVariableValue;
  'primary-700'?: CssVariableValue;
  'primary-800'?: CssVariableValue;
  'primary-900'?: CssVariableValue;

  // ===== 强调色 =====
  'accent-50'?: CssVariableValue;
  'accent-100'?: CssVariableValue;
  'accent-200'?: CssVariableValue;
  'accent-300'?: CssVariableValue;
  'accent-400'?: CssVariableValue;
  'accent-500'?: CssVariableValue;
  'accent-600'?: CssVariableValue;
  'accent-700'?: CssVariableValue;
  'accent-800'?: CssVariableValue;

  // ===== 语义色 =====
  'success-500'?: CssVariableValue;
  'success-600'?: CssVariableValue;
  'warning-500'?: CssVariableValue;
  'warning-600'?: CssVariableValue;
  'error-500'?: CssVariableValue;
  'error-600'?: CssVariableValue;

  // ===== 编辑器 =====
  'editor-bg'?: CssVariableValue;
  'editor-surface'?: CssVariableValue;
  'editor-text'?: CssVariableValue;
  'editor-text-secondary'?: CssVariableValue;
  'editor-text-muted'?: CssVariableValue;
  'editor-border'?: CssVariableValue;
  'editor-border-focus'?: CssVariableValue;
  'editor-code-bg'?: CssVariableValue;
  'editor-heading'?: CssVariableValue;
  'editor-link'?: CssVariableValue;
  'editor-accent'?: CssVariableValue;
  'editor-quote-bg'?: CssVariableValue;
  'editor-selection'?: CssVariableValue;

  // ===== 侧边栏 =====
  'sidebar-bg'?: CssVariableValue;
  'sidebar-surface'?: CssVariableValue;
  'sidebar-text'?: CssVariableValue;
  'sidebar-text-muted'?: CssVariableValue;
  'sidebar-hover'?: CssVariableValue;
  'sidebar-active'?: CssVariableValue;
  'sidebar-border'?: CssVariableValue;

  // ===== 工具栏 =====
  'toolbar-bg'?: CssVariableValue;
  'toolbar-hover'?: CssVariableValue;
  'toolbar-active'?: CssVariableValue;

  // ===== 标签栏 =====
  'tab-bg'?: CssVariableValue;
  'tab-active-bg'?: CssVariableValue;
  'tab-inactive-bg'?: CssVariableValue;
  'tab-hover-bg'?: CssVariableValue;
  'tab-border'?: CssVariableValue;
  'tab-active-indicator'?: CssVariableValue;

  // ===== 标题栏 =====
  'titlebar-bg'?: CssVariableValue;

  // ===== 状态栏 =====
  'statusbar-bg'?: CssVariableValue;
  'statusbar-text'?: CssVariableValue;

  // ===== 阴影 =====
  'shadow-sm'?: CssVariableValue;
  'shadow-md'?: CssVariableValue;
  'shadow-lg'?: CssVariableValue;

  // ===== 圆角 =====
  'radius-sm'?: CssVariableValue;
  'radius-md'?: CssVariableValue;
  'radius-lg'?: CssVariableValue;
  'radius-xl'?: CssVariableValue;

  // ===== 过渡 =====
  'transition-fast'?: CssVariableValue;
  'transition-normal'?: CssVariableValue;
  'transition-slow'?: CssVariableValue;

  // ===== 语法高亮 (hljs) =====
  'hljs-comment'?: CssVariableValue;
  'hljs-keyword'?: CssVariableValue;
  'hljs-string'?: CssVariableValue;
  'hljs-attr'?: CssVariableValue;
  'hljs-number'?: CssVariableValue;
  'hljs-title'?: CssVariableValue;
  'hljs-function'?: CssVariableValue;
  'hljs-params'?: CssVariableValue;
  'hljs-variable'?: CssVariableValue;
  'hljs-class'?: CssVariableValue;
  'hljs-meta'?: CssVariableValue;
  'hljs-deletion'?: CssVariableValue;
  'hljs-regexp'?: CssVariableValue;
  'hljs-selector-class'?: CssVariableValue;
  'hljs-selector-id'?: CssVariableValue;
  'hljs-link'?: CssVariableValue;
  'hljs-addition'?: CssVariableValue;
  'hljs-built_in'?: CssVariableValue;
  'hljs-literal'?: CssVariableValue;
  'hljs-type'?: CssVariableValue;
  'hljs-symbol'?: CssVariableValue;
  'hljs-bullet'?: CssVariableValue;

  // ===== 代码 =====
  'code-inline-bg'?: CssVariableValue;
  'code-inline-text'?: CssVariableValue;
  'code-block-bg'?: CssVariableValue;
  'code-block-container-bg'?: CssVariableValue;
  'code-block-text'?: CssVariableValue;

  // ===== 滚动条 =====
  'scrollbar-track'?: CssVariableValue;
  'scrollbar-thumb'?: CssVariableValue;

  // ===== Markdown Alert =====
  'alert-note-border'?: CssVariableValue;
  'alert-note-bg'?: CssVariableValue;
  'alert-note-text'?: CssVariableValue;
  'alert-tip-border'?: CssVariableValue;
  'alert-tip-bg'?: CssVariableValue;
  'alert-tip-text'?: CssVariableValue;
  'alert-important-border'?: CssVariableValue;
  'alert-important-bg'?: CssVariableValue;
  'alert-important-text'?: CssVariableValue;
  'alert-warning-border'?: CssVariableValue;
  'alert-warning-bg'?: CssVariableValue;
  'alert-warning-text'?: CssVariableValue;
  'alert-caution-border'?: CssVariableValue;
  'alert-caution-bg'?: CssVariableValue;
  'alert-caution-text'?: CssVariableValue;
}

/**
 * 主题元数据。
 * name        - 显示名称（如"天青"）
 * group       - 主题分组（light/dark）
 * preview     - 预览颜色数组（最多3个色块用于UI展示）
 * description - 可选描述
 */
export interface ThemeMeta {
  name: string;
  group: ThemeGroup;
  preview?: string[];
  description?: string;
}

/** 完整的主题定义 */
export interface ThemeDefinition extends ThemeMeta {
  id: string;
  variables: ThemeVariables;
}

/** 导入结果 */
export type ThemeImportResult =
  | { success: true; theme: ThemeDefinition }
  | { success: false; error: string };

/** 必需的顶层键（不含 id，id 由 id 字段衍生） */
export const REQUIRED_TOP_KEYS = ['name', 'group', 'variables'] as const;

/** 必需的变量键（编辑器基本颜色，缺失则拒绝导入） */
export const REQUIRED_VARIABLES: (keyof ThemeVariables)[] = [
  'editor-bg',
  'editor-surface',
  'editor-text',
  'editor-text-secondary',
  'editor-border',
  'sidebar-bg',
  'sidebar-text',
  'accent-500',
];
