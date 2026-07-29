import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themeRegistry } from '../themes/registry';

/** 主题 ID — 支持内置和自定义主题 */
export type ThemeId = string;
export type Theme = ThemeId | 'system';
export type ThemeGroup = 'light' | 'dark';
export type EditorWidth = 'full' | 'wide' | 'normal';
export type LineHeight = 1 | 1.15 | 1.5 | 2 | 2.5 | 3;
export type TabBarStyle = 'horizontal' | 'vertical';

/** 内置主题元数据（保证 registry 未初始化时也可用） */
const BUILTIN_THEMES_META: Record<string, { name: string; group: ThemeGroup }> = {
  'chen-guang': { name: '晨光', group: 'light' },
  'tian-qing': { name: '天青', group: 'light' },
  'hu-po': { name: '琥珀', group: 'light' },
  'na-tie': { name: '霜华', group: 'light' },
  'mo-ye': { name: '墨夜', group: 'dark' },
  'xing-yun': { name: '星云', group: 'dark' },
  'ji-guang': { name: '极光', group: 'dark' },
  'zi-teng': { name: '紫藤', group: 'dark' },
};

/**
 * 兼容旧版的 THEMES 导出。
 * 优先从注册表获取（内置 + 用户导入），
 * 取不到时回退到硬编码内置数据。
 */
export const THEMES: Record<string, { name: string; group: ThemeGroup }> = new Proxy(
  {} as Record<string, { name: string; group: ThemeGroup }>,
  {
    get(_, id: string | symbol) {
      if (typeof id !== 'string') return undefined;
      const reg = themeRegistry.get(id);
      if (reg) return { name: reg.name, group: reg.group };
      return BUILTIN_THEMES_META[id];
    },
    has(_, id: string | symbol) {
      if (typeof id !== 'string') return false;
      return themeRegistry.has(id) || id in BUILTIN_THEMES_META;
    },
    ownKeys() {
      const regThemes = themeRegistry.getAll().map((t) => t.id);
      return [...new Set([...Object.keys(BUILTIN_THEMES_META), ...regThemes])];
    },
  }
);

export const EMBED_MAX_DEPTH_MIN = 1;
export const EMBED_MAX_DEPTH_MAX = 5;
export const EMBED_MAX_DEPTH_DEFAULT = 3;

export const EMBED_MAX_COUNT_MIN = 1;
export const EMBED_MAX_COUNT_MAX = 30;
export const EMBED_MAX_COUNT_DEFAULT = 5;

function getThemeMeta(themeId: string): { name: string; group: ThemeGroup } | undefined {
  const reg = themeRegistry.get(themeId);
  if (reg) return { name: reg.name, group: reg.group };
  return BUILTIN_THEMES_META[themeId];
}

function getThemeGroup(themeId: string): ThemeGroup {
  return getThemeMeta(themeId)?.group ?? 'light';
}

function resolveSystemThemeId(): string {
  const state = useSettingsStore.getState();
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? state.systemDarkTheme
    : state.systemLightTheme;
}

interface SettingsState {
  theme: Theme;
  systemLightTheme: ThemeId;
  systemDarkTheme: ThemeId;
  imageDirectory: string;
  autoSave: boolean;
  autoSaveDelay: number;
  embedMaxDepth: number;
  embedMaxCount: number;
  editorWidth: EditorWidth;
  lineHeight: LineHeight;
  headingFolding: boolean;
  tabBarStyle: TabBarStyle;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemLightTheme: (themeId: ThemeId) => void;
  setSystemDarkTheme: (themeId: ThemeId) => void;
  setImageDirectory: (dir: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveDelay: (delay: number) => void;
  setEmbedMaxDepth: (depth: number) => void;
  setEmbedMaxCount: (count: number) => void;
  setEditorWidth: (width: EditorWidth) => void;
  setLineHeight: (height: LineHeight) => void;
  setHeadingFolding: (folding: boolean) => void;
  setTabBarStyle: (style: TabBarStyle) => void;
  getEffectiveTheme: () => 'light' | 'dark';
  getEffectiveThemeId: () => ThemeId;
  getThemeGroup: () => ThemeGroup;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemLightTheme: 'tian-qing' as ThemeId,
      systemDarkTheme: 'mo-ye' as ThemeId,
      imageDirectory: 'img',
      autoSave: true,
      autoSaveDelay: 1000,
      embedMaxDepth: EMBED_MAX_DEPTH_DEFAULT,
      embedMaxCount: EMBED_MAX_COUNT_DEFAULT,
      editorWidth: 'full' as EditorWidth,
      lineHeight: 1.5 as LineHeight,
      headingFolding: true,
      tabBarStyle: 'horizontal' as TabBarStyle,

      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().getEffectiveThemeId();
        const currentGroup = getThemeGroup(current);
        set({ theme: currentGroup === 'dark' ? 'tian-qing' : 'mo-ye' });
      },
      setSystemLightTheme: (themeId: string) => {
        if (getThemeGroup(themeId) === 'light') set({ systemLightTheme: themeId });
      },
      setSystemDarkTheme: (themeId: string) => {
        if (getThemeGroup(themeId) === 'dark') set({ systemDarkTheme: themeId });
      },
      setImageDirectory: (dir: string) => set({ imageDirectory: dir }),
      setAutoSave: (enabled: boolean) => set({ autoSave: enabled }),
      setAutoSaveDelay: (delay: number) => set({ autoSaveDelay: delay }),
      setEmbedMaxDepth: (depth: number) => {
        const clampedDepth = Math.min(EMBED_MAX_DEPTH_MAX, Math.max(EMBED_MAX_DEPTH_MIN, depth));
        set({ embedMaxDepth: clampedDepth });
      },
      setEmbedMaxCount: (count: number) => {
        const clampedCount = Math.min(EMBED_MAX_COUNT_MAX, Math.max(EMBED_MAX_COUNT_MIN, count));
        set({ embedMaxCount: clampedCount });
      },
      setEditorWidth: (width: EditorWidth) => set({ editorWidth: width }),
      setLineHeight: (height: LineHeight) => set({ lineHeight: height }),
      setHeadingFolding: (folding: boolean) => set({ headingFolding: folding }),
      setTabBarStyle: (style: TabBarStyle) => set({ tabBarStyle: style }),

      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return getThemeGroup(theme);
      },

      getEffectiveThemeId: () => {
        const { theme } = get();
        if (theme === 'system') {
          return resolveSystemThemeId();
        }
        return theme;
      },

      getThemeGroup: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return getThemeGroup(theme);
      },
    }),
    {
      name: 'md-editor-settings',
      version: 6,
      migrate: (persistedState: any) => {
        if (persistedState && persistedState.theme === 'shuang-ye') {
          persistedState.theme = 'na-tie';
        }
        if (persistedState && persistedState.theme === 'nuan-yang') {
          persistedState.theme = 'na-tie';
        }
        if (persistedState && persistedState.theme === 'light') {
          persistedState.theme = 'tian-qing';
        } else if (persistedState && persistedState.theme === 'dark') {
          persistedState.theme = 'mo-ye';
        }
        if (persistedState && !persistedState.systemLightTheme) {
          persistedState.systemLightTheme = 'tian-qing';
        }
        if (persistedState && !persistedState.systemDarkTheme) {
          persistedState.systemDarkTheme = 'mo-ye';
        }
        if (persistedState && persistedState.headingFolding === undefined) {
          persistedState.headingFolding = true;
        }
        if (persistedState && !persistedState.tabBarStyle) {
          persistedState.tabBarStyle = 'horizontal';
        }
        return persistedState;
      },
    }
  )
);
