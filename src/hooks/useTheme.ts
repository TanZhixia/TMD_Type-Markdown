import { useEffect, useCallback, useState } from 'react';
import { useSettingsStore, THEMES } from '../stores';
import { themeRegistry } from '../themes/registry';
import type { ThemeGroup } from '../themes/types';

/**
 * 获取主题的分组（light/dark）。
 * 优先从 registry 查找，回退到 settingsStore 的 THEMES 常量。
 */
function getThemeGroup(themeId: string): ThemeGroup {
  if (!themeId) return 'light';
  const theme = themeRegistry.get(themeId);
  if (theme) return theme.group;
  const meta = THEMES[themeId];
  return meta?.group ?? 'light';
}

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);
  const systemLightTheme = useSettingsStore((state) => state.systemLightTheme);
  const systemDarkTheme = useSettingsStore((state) => state.systemDarkTheme);
  const [effectiveThemeId, setEffectiveThemeId] = useState<string>('tian-qing');

  const updateTheme = useCallback(() => {
    let newThemeId: string;

    if (theme === 'system') {
      newThemeId = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? systemDarkTheme
        : systemLightTheme;
    } else {
      newThemeId = theme;
    }

    setEffectiveThemeId(newThemeId);

    // 1. 通过 registry 注入主题 CSS 变量（动态 <style>）
    themeRegistry.applyTheme(newThemeId);

    // 2. 设置 data-theme 属性（CSS selector 目标，与注入的 [data-theme] 配合）
    const root = document.documentElement;
    root.setAttribute('data-theme', newThemeId);

    // 3. 切换 Tailwind dark 类
    const group = getThemeGroup(newThemeId);
    if (group === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, systemLightTheme, systemDarkTheme]);

  useEffect(() => {
    updateTheme();
  }, [updateTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newThemeId = mediaQuery.matches
        ? useSettingsStore.getState().systemDarkTheme
        : useSettingsStore.getState().systemLightTheme;

      setEffectiveThemeId(newThemeId);

      themeRegistry.applyTheme(newThemeId);

      const root = document.documentElement;
      root.setAttribute('data-theme', newThemeId);

      const group = getThemeGroup(newThemeId);
      if (group === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const themeGroup = getThemeGroup(effectiveThemeId);

  return { effectiveThemeId, themeGroup };
}
