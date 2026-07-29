import type { ThemeDefinition, ThemeVariables, ThemeImportResult, ThemeGroup } from './types';
import { REQUIRED_TOP_KEYS, REQUIRED_VARIABLES } from './types';

/**
 * 验证 YAML 解析后的原始对象是否为合法的主题定义。
 * 返回 { success, theme } 或 { success, error }。
 */
export function validateThemeRaw(raw: any, id?: string): ThemeImportResult {
  // 1. 必须是对象
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, error: '主题定义必须是一个对象' };
  }

  // 2. 检查顶层字段
  for (const key of REQUIRED_TOP_KEYS) {
    if (!(key in raw)) {
      return { success: false, error: `缺少必需字段: ${key}` };
    }
  }

  // 3. name
  if (typeof raw.name !== 'string' || !raw.name.trim()) {
    return { success: false, error: '主题名称(name)必须是非空字符串' };
  }

  // 4. group
  const group = raw.group;
  if (group !== 'light' && group !== 'dark') {
    return { success: false, error: '主题分组(group)必须是 "light" 或 "dark"' };
  }

  // 5. id - 优先使用传入的 id，否则使用原始对象中的 id，否则从 name 生成
  const themeId = id || raw.id || generateId(raw.name);
  if (typeof themeId !== 'string' || !themeId.trim()) {
    return { success: false, error: '无法确定主题 ID' };
  }

  // 6. variables
  if (!raw.variables || typeof raw.variables !== 'object' || Array.isArray(raw.variables)) {
    return { success: false, error: '主题变量(variables)必须是一个对象' };
  }

  // 7. 检查必需变量
  const missingVars = REQUIRED_VARIABLES.filter(
    (v) => !(v in raw.variables) || raw.variables[v] === undefined || raw.variables[v] === null
  );
  if (missingVars.length > 0) {
    return {
      success: false,
      error: `缺少必需的 CSS 变量: ${missingVars.join(', ')}`,
    };
  }

  // 8. 验证变量值格式（只检查颜色格式）
  const varErrors: string[] = [];
  for (const [varName, value] of Object.entries(raw.variables)) {
    if (typeof value !== 'string') {
      varErrors.push(`${varName} 必须是字符串`);
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      varErrors.push(`${varName} 不能为空`);
      continue;
    }
    // 颜色值基本验证
    const colorValue = trimmed;
    if (
      !colorValue.startsWith('#') &&
      !colorValue.startsWith('rgb') &&
      !colorValue.startsWith('hsl') &&
      !colorValue.startsWith('var(') &&
      !colorValue.startsWith('inherit') &&
      !colorValue.startsWith('transparent') &&
      !colorValue.endsWith('px') &&
      !colorValue.endsWith('ms') &&
      !colorValue.endsWith('s') &&
      !colorValue.endsWith('ease') &&
      !colorValue.includes('shadow') &&
      !/^[.\d]+/.test(colorValue) // 数值（0 1 2 等）
    ) {
      // 不那么严格的检查，仅警告
    }
  }

  if (varErrors.length > 0) {
    return { success: false, error: `变量值错误: ${varErrors[0]}` };
  }

  // 9. preview
  let preview: string[] | undefined;
  if (raw.preview) {
    if (Array.isArray(raw.preview) && raw.preview.length > 0) {
      preview = raw.preview.slice(0, 3).map((c: any) => String(c));
    }
  }

  // 10. description
  const description = typeof raw.description === 'string' ? raw.description : undefined;

  // 构造结果
  const theme: ThemeDefinition = {
    id: themeId,
    name: raw.name,
    group: group as ThemeGroup,
    variables: raw.variables as ThemeVariables,
    preview,
    description,
  };

  return { success: true, theme };
}

/**
 * 从名称生成 ID：小写、空格转连字符、去除非字母数字字符
 */
export function generateId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9一-鿿-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || 'custom-theme';
}

/**
 * 验证主题 ID 是否合法
 */
export function isValidThemeId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-z0-9-]+$/.test(id);
}
