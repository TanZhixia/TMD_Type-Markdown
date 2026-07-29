/**
 * TMD Type-Markdown 主题系统
 *
 * 特性：
 * - 支持从 YAML 文件导入自定义主题
 * - 运行时 CSS 变量注入
 * - 内置 8 个主题（天青、晨光、琥珀、霜华、墨夜、星云、极光、紫藤）
 * - 完整的主题验证
 */

export { themeRegistry } from './registry';
export { importThemeFromYaml, importThemeFromFile, parseThemeYaml } from './yamlLoader';
export { validateThemeRaw } from './validator';
export { generateThemeCss } from './cssGenerator';
export { builtinThemes } from './builtin';

export type {
  ThemeDefinition,
  ThemeVariables,
  ThemeGroup,
  ThemeMeta,
  ThemeImportResult,
  CssVariableValue,
} from './types';

export { REQUIRED_VARIABLES } from './types';

/** 内置主题 ID 列表 */
export const BUILTIN_THEME_IDS = [
  'tian-qing', 'chen-guang', 'hu-po', 'na-tie',
  'mo-ye', 'xing-yun', 'ji-guang', 'zi-teng',
] as const;
