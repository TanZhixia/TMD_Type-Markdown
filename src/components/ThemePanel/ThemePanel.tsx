import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Monitor, Sun, Moon, Upload, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { themeRegistry } from '../../themes/registry';
import { importThemeFromFile } from '../../themes/yamlLoader';
import { persistCustomThemes } from '../../themes/persistence';
import { BUILTIN_THEME_IDS } from '../../themes';
import type { ThemeDefinition, ThemeGroup } from '../../themes/types';

interface ThemePanelProps {
  embedded?: boolean;
  onClose?: () => void;
}

/** 从注册表获取主题列表，按 light/dark 分组 */
function getThemeGroups(): { label: string; key: ThemeGroup; themes: ThemeDefinition[] }[] {
  const all = themeRegistry.getAll();
  return [
    { label: 'Light', key: 'light', themes: all.filter((t) => t.group === 'light') },
    { label: 'Dark', key: 'dark', themes: all.filter((t) => t.group === 'dark') },
  ];
}

/** 获取主题预览颜色（3 点色块） */
function getPreviewColors(theme: ThemeDefinition): string[] {
  if (theme.preview && theme.preview.length >= 3) {
    return theme.preview.slice(0, 3);
  }
  const v = theme.variables;
  return [
    v['editor-bg'] || '#ffffff',
    v['accent-500'] || '#3b82f6',
    v['editor-text'] || '#1e293b',
  ];
}

export const ThemePanel: React.FC<ThemePanelProps> = ({ embedded = false, onClose }) => {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const systemLightTheme = useSettingsStore((s) => s.systemLightTheme);
  const systemDarkTheme = useSettingsStore((s) => s.systemDarkTheme);
  const setSystemLightTheme = useSettingsStore((s) => s.setSystemLightTheme);
  const setSystemDarkTheme = useSettingsStore((s) => s.setSystemDarkTheme);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState(0);

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const refreshThemes = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  const isBuiltin = useCallback((id: string) => {
    return (BUILTIN_THEME_IDS as readonly string[]).includes(id);
  }, []);

  const handleDeleteTheme = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = themeRegistry.get(id);
    if (!target) return;

    const group = target.group;

    if (theme === id) {
      const fallback = group === 'dark' ? 'mo-ye' : 'tian-qing';
      setTheme(fallback);
    }

    // 如果系统模式的子主题刚好是它，也重置
    if (systemLightTheme === id) {
      setSystemLightTheme('tian-qing');
    }
    if (systemDarkTheme === id) {
      setSystemDarkTheme('mo-ye');
    }

    themeRegistry.remove(id);
    persistCustomThemes();
    refreshThemes();
  }, [theme, systemLightTheme, systemDarkTheme, setTheme, setSystemLightTheme, setSystemDarkTheme, refreshThemes]);

  // 浮层模式点击外部关闭
  useEffect(() => {
    if (embedded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [embedded, onClose]);

  // 导入 YAML
  const handleImportYaml = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setImportStatus({ type: 'error', message: '请选择 .yaml 或 .yml 文件' });
      return;
    }

    setImportStatus(null);
    const result = await importThemeFromFile(file);

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `主题「${result.theme.name}」导入成功`,
      });
      refreshThemes();
      setTheme(result.theme.id);
    } else {
      setImportStatus({ type: 'error', message: result.error });
    }

    e.target.value = '';
  }, [refreshThemes, setTheme]);

  useEffect(() => {
    if (!importStatus) return;
    const timer = setTimeout(() => setImportStatus(null), 3000);
    return () => clearTimeout(timer);
  }, [importStatus]);

  const themeGroups = getThemeGroups();
  const isSystemSelected = theme === 'system';

  // ======= 面板共享内容 =======
  const panelContent = (
    <div className="p-3">
      {/* 隐藏文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 导入状态 */}
      {importStatus && (
        <div
          className={`
            flex items-center gap-2 px-3 py-2 mb-3 rounded-lg text-[12px]
            animate-slide-down
            ${importStatus.type === 'success'
              ? 'bg-[var(--success-500)]/10 text-[var(--success-500)]'
              : 'bg-[var(--error-500)]/10 text-[var(--error-500)]'
            }
          `}
        >
          {importStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="flex-1">{importStatus.message}</span>
          <button className="opacity-60 hover:opacity-100" onClick={() => setImportStatus(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* 主题网格 */}
      {themeGroups.map((group) => {
        if (group.themes.length === 0) return null;
        return (
          <div key={group.key} className="mb-3 last:mb-0">
            <div
              className="text-[11px] font-medium mb-2 uppercase tracking-wider"
              style={{ color: 'var(--editor-text-muted)' }}
            >
              {group.label}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {group.themes.map((t) => {
                const active = theme === t.id;
                const colors = getPreviewColors(t);
                return (
                  <div key={t.id} className="relative group">
                    {!isBuiltin(t.id) && (
                      <button
                        className="
                          absolute -top-1 -right-1 z-10
                          w-4 h-4 rounded-full
                          flex items-center justify-center
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-[var(--transition-fast)]
                          bg-[var(--error-500)] text-white
                          hover:bg-[var(--error-600)]
                          shadow-sm
                        "
                        onClick={(e) => handleDeleteTheme(e, t.id)}
                        title={`删除「${t.name}」`}
                      >
                        <X size={8} strokeWidth={3} />
                      </button>
                    )}
                    <button
                      className={`
                        flex flex-col items-center justify-center rounded-lg p-2
                        transition-all duration-[var(--transition-fast)] cursor-pointer
                        bg-[var(--editor-surface)]
                        hover:bg-[var(--sidebar-hover)]
                        w-full
                        ${active ? 'ring-2 ring-[var(--accent-500)] bg-[var(--sidebar-hover)]' : ''}
                      `}
                      style={{
                        borderWidth: active ? '2px' : '0px',
                        borderStyle: 'solid',
                        borderColor: active ? 'var(--accent-500)' : 'transparent',
                      }}
                      onClick={() => setTheme(t.id)}
                      title={t.name}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {colors.slice(0, 3).map((color, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded-full"
                            style={{ width: 10, height: 10, backgroundColor: color, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
                          />
                        ))}
                      </div>
                      <span className="text-[12px] leading-tight font-medium" style={{ color: 'var(--editor-text)' }}>
                        {t.name}
                      </span>
                      <span className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--editor-text-muted)' }}>
                        {t.group === 'light' ? 'Light' : 'Dark'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 导入 YAML 按钮 */}
      <button
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg mb-2 transition-all duration-[var(--transition-fast)] cursor-pointer text-[var(--accent-500)] hover:bg-[var(--sidebar-hover)] border border-dashed border-[var(--editor-border)]"
        onClick={handleImportYaml}
        title="导入 YAML 主题文件"
      >
        <Upload size={14} />
        <span className="text-[12px] font-medium">导入 YAML 主题</span>
      </button>

      {/* 分隔线 */}
      <div className="my-3 border-t" style={{ borderColor: 'var(--editor-border)' }} />

      {/* 跟随系统 */}
      <button
        className={`
          w-full flex items-center gap-2 px-2 py-2 rounded-lg
          transition-all duration-[var(--transition-fast)] cursor-pointer
          hover:bg-[var(--sidebar-hover)]
          ${isSystemSelected ? 'ring-2 ring-[var(--accent-500)] bg-[var(--sidebar-hover)]' : ''}
        `}
        style={{
          borderWidth: isSystemSelected ? '2px' : '0px',
          borderStyle: 'solid',
          borderColor: isSystemSelected ? 'var(--accent-500)' : 'transparent',
        }}
        onClick={() => setTheme('system')}
      >
        <Monitor size={16} style={{ color: 'var(--editor-text-secondary)' }} />
        <span className="text-[13px] font-medium" style={{ color: 'var(--editor-text)' }}>
          跟随系统
        </span>
        {isSystemSelected && (
          <span className="ml-auto inline-block w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent-500)' }}>
            <svg viewBox="0 0 16 16" fill="white" className="w-4 h-4">
              <path d="M12.5 4.5L6 11l-2.5-2.5 1-1L6 9l5.5-5.5 1 1z" />
            </svg>
          </span>
        )}
      </button>

      {/* 亮/暗子选择器 */}
      {isSystemSelected && (
        <div className="mt-2 space-y-2 pl-2">
          <div className="flex items-center gap-2">
            <Sun size={13} style={{ color: 'var(--editor-text-muted)' }} />
            <span className="text-[11px]" style={{ color: 'var(--editor-text-muted)' }}>亮色</span>
            <div className="flex gap-1 flex-1 justify-end flex-wrap">
              {themeRegistry.getLightThemes().map((t) => (
                <button
                  key={t.id}
                  className="rounded px-1.5 py-0.5 text-[11px] transition-all cursor-pointer"
                  style={{
                    backgroundColor: systemLightTheme === t.id ? 'var(--accent-500)' : 'var(--editor-surface)',
                    color: systemLightTheme === t.id ? 'white' : 'var(--editor-text-secondary)',
                    border: `1px solid ${systemLightTheme === t.id ? 'var(--accent-500)' : 'var(--editor-border)'}`,
                  }}
                  onClick={() => setSystemLightTheme(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Moon size={13} style={{ color: 'var(--editor-text-muted)' }} />
            <span className="text-[11px]" style={{ color: 'var(--editor-text-muted)' }}>暗色</span>
            <div className="flex gap-1 flex-1 justify-end flex-wrap">
              {themeRegistry.getDarkThemes().map((t) => (
                <button
                  key={t.id}
                  className="rounded px-1.5 py-0.5 text-[11px] transition-all cursor-pointer"
                  style={{
                    backgroundColor: systemDarkTheme === t.id ? 'var(--accent-500)' : 'var(--editor-surface)',
                    color: systemDarkTheme === t.id ? 'white' : 'var(--editor-text-secondary)',
                    border: `1px solid ${systemDarkTheme === t.id ? 'var(--accent-500)' : 'var(--editor-border)'}`,
                  }}
                  onClick={() => setSystemDarkTheme(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 嵌入模式：只渲染内容（用于 SettingsPanel）
  if (embedded) {
    return panelContent;
  }

  // 浮层模式：渲染外壳
  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-[calc(100%+4px)] z-[100] animate-scale-in"
      style={{
        width: 280,
        borderRadius: 12,
        backgroundColor: 'var(--editor-bg)',
        border: '1px solid var(--editor-border)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }}
    >
      {panelContent}
    </div>
  );
};

export default ThemePanel;
