import * as yaml from 'js-yaml';
import { validateThemeRaw } from './validator';
import { themeRegistry } from './registry';
import { persistCustomThemes } from './persistence';
import type { ThemeImportResult } from './types';

export type { ThemeImportResult } from './types';

/**
 * 从 YAML 字符串解析并注册一个主题。
 * 如果 id 不提供，会从 name 自动生成。
 * 返回导入结果。
 */
export function importThemeFromYaml(yamlContent: string, id?: string): ThemeImportResult {
  let parsed: any;

  try {
    parsed = yaml.load(yamlContent);
  } catch (e) {
    const message = e instanceof Error ? e.message : '未知解析错误';
    return { success: false, error: `YAML 解析失败: ${message}` };
  }

  // YAML 解析为标量等情况
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'YAML 内容无效：需要一个对象格式的主题定义' };
  }

  const result = validateThemeRaw(parsed, id);

  if (result.success) {
    // 检查 ID 冲突 —— 如果内置主题已有同名 ID，追加后缀
    let finalId = result.theme.id;
    if (themeRegistry.has(finalId)) {
      // 检查是否是内置主题，如果是，追加后缀避免冲突
      if (isBuiltinId(finalId)) {
        finalId = `${finalId}-custom-${Date.now().toString(36)}`;
        result.theme.id = finalId;
      }
    }
    themeRegistry.register(result.theme);
    persistCustomThemes();
  }

  return result;
}

/**
 * 从 File 对象（浏览器）导入 YAML 主题
 */
export function importThemeFromFile(file: File): Promise<ThemeImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') {
        resolve({ success: false, error: '无法读取文件内容' });
        return;
      }

      // 从文件名生成 id
      const id = filenameToId(file.name);
      const result = importThemeFromYaml(content, id);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({ success: false, error: '文件读取失败' });
    };

    reader.readAsText(file);
  });
}

/**
 * 从 YAML 文本读取并返回主题定义（不注册）。
 */
export function parseThemeYaml(yamlContent: string, id?: string): ThemeImportResult {
  let parsed: any;

  try {
    parsed = yaml.load(yamlContent);
  } catch (e) {
    const message = e instanceof Error ? e.message : '未知解析错误';
    return { success: false, error: `YAML 解析失败: ${message}` };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'YAML 内容无效' };
  }

  return validateThemeRaw(parsed, id);
}

function filenameToId(filename: string): string {
  return filename
    .replace(/\.(yaml|yml)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || 'imported-theme';
}

function isBuiltinId(id: string): boolean {
  const builtinIds = [
    'tian-qing', 'chen-guang', 'hu-po', 'na-tie',
    'mo-ye', 'xing-yun', 'ji-guang', 'zi-teng',
  ];
  return builtinIds.includes(id);
}
