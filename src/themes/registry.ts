import type { ThemeDefinition, ThemeGroup } from './types';
import { generateThemeCss } from './cssGenerator';

/**
 * 主题注册表 — 管理所有内置和导入的主题。
 * 提供注册、查找、获取集合的能力。
 */
class ThemeRegistry {
  private themes = new Map<string, ThemeDefinition>();
  private styleElement: HTMLStyleElement | null = null;

  /** 注册一个主题。如果 ID 已存在则覆盖。 */
  register(theme: ThemeDefinition): void {
    this.themes.set(theme.id, theme);
  }

  /** 批量注册主题。 */
  registerAll(themes: ThemeDefinition[]): void {
    for (const theme of themes) {
      this.register(theme);
    }
  }

  /** 通过 ID 获取主题。 */
  get(id: string): ThemeDefinition | undefined {
    return this.themes.get(id);
  }

  /** 获取所有主题。 */
  getAll(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /** 按分组获取主题。 */
  getByGroup(group: ThemeGroup): ThemeDefinition[] {
    return this.getAll().filter((t) => t.group === group);
  }

  /** 获取所有亮色主题。 */
  getLightThemes(): ThemeDefinition[] {
    return this.getByGroup('light');
  }

  /** 获取所有暗色主题。 */
  getDarkThemes(): ThemeDefinition[] {
    return this.getByGroup('dark');
  }

  /** 获取已注册的主题数量。 */
  get count(): number {
    return this.themes.size;
  }

  /** 检查主题是否已注册。 */
  has(id: string): boolean {
    return this.themes.has(id);
  }

  /** 移除一个主题。 */
  remove(id: string): boolean {
    return this.themes.delete(id);
  }

  /** 应用指定主题 — 将主题 CSS 变量注入到 document 中。 */
  applyTheme(themeId: string): void {
    const theme = this.get(themeId);
    if (!theme) {
      console.warn(`[ThemeRegistry] 主题 "${themeId}" 未找到`);
      return;
    }

    // 移除旧的 style 元素
    if (this.styleElement) {
      this.styleElement.remove();
    }

    const css = generateThemeCss(theme);
    this.styleElement = document.createElement('style');
    this.styleElement.id = `theme-vars-${themeId}`;
    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
  }

  /** 清理注册表 */
  clear(): void {
    this.themes.clear();
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}

/** 全局主题注册表单例 */
export const themeRegistry = new ThemeRegistry();
