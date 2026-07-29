import type { ThemeDefinition } from './types';
import { themeRegistry } from './registry';

const STORAGE_KEY = 'md-editor-custom-themes';

/** 将自定义主题列表保存到 localStorage */
export function persistCustomThemes(): void {
  const all = themeRegistry.getAll();
  const builtinIds: string[] = [
    'tian-qing', 'chen-guang', 'hu-po', 'na-tie',
    'mo-ye', 'xing-yun', 'ji-guang', 'zi-teng',
  ];
  const custom = all.filter((t) => !builtinIds.includes(t.id));

  try {
    // 只存 variables（可序列化数据），不存运行时引用
    const data = custom.map((t) => ({
      id: t.id,
      name: t.name,
      group: t.group,
      variables: t.variables,
      preview: t.preview,
      description: t.description,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[ThemePersistence] 保存自定义主题失败:', e);
  }
}

/** 从 localStorage 恢复并注册所有自定义主题 */
export function restoreCustomThemes(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;

    for (const item of data) {
      // 基本验证
      if (!item.id || !item.name || !item.group || !item.variables) continue;
      if (item.group !== 'light' && item.group !== 'dark') continue;

      const theme: ThemeDefinition = {
        id: item.id,
        name: item.name,
        group: item.group,
        variables: item.variables,
        preview: Array.isArray(item.preview) ? item.preview.slice(0, 3) : undefined,
        description: typeof item.description === 'string' ? item.description : undefined,
      };
      themeRegistry.register(theme);
    }
  } catch (e) {
    // 解析失败时清除损坏的数据
    console.warn('[ThemePersistence] 恢复自定义主题失败，清除数据:', e);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}
