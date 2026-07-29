import type { ThemeDefinition, ThemeVariables } from './types';

/**
 * 将主题定义生成为 CSS 字符串（:root 级别变量 + .dark 类）。
 * 生成的 CSS 会注入到 document 中。
 */
export function generateThemeCss(theme: ThemeDefinition): string {
  const varLines = generateVariableDeclarations(theme.variables);
  const group = theme.group;

  let css = `/* Theme: ${theme.id} (${theme.name}) */\n`;

  // 1. data-theme 属性选择器 — 主定义
  css += `[data-theme="${theme.id}"] {\n${varLines}}\n\n`;

  // 2. 如果是 dark 主题，同时生成 .dark 类，确保 Tailwind dark: 前缀生效
  if (group === 'dark') {
    css += `.dark {\n${varLines}}\n`;
  }

  return css;
}

/**
 * 生成变量声明字符串（缩进后）。
 */
function generateVariableDeclarations(variables: ThemeVariables): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      lines.push(`  --${key}: ${value};`);
    }
  }
  return lines.join('\n');
}

/**
 * 为导入的自定义主题生成 ID 用的随机后缀
 */
export function generateUniqueId(base: string): string {
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
