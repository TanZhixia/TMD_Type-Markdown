import React, { useState } from 'react';
import { useFileOperations } from '../../hooks/useFileOperations';
import {
  FilePlus,
  FileText,
  FolderOpen,
  Settings,
  Palette,
  Command,
  LucideIcon
} from 'lucide-react';
import { useSettingsStore, THEMES } from '../../stores';
import { themeRegistry } from '../../themes/registry';
import { ThemePanel } from '../ThemePanel/ThemePanel';
import { ShortcutsPanel } from '../Shortcuts/ShortcutsPanel';

/**
 * 顶部工具栏组件
 * 现代化设计 - 使用 SVG 图标，清晰分组，优雅悬停效果
 */
function getCurrentThemeName(): string {
  const { theme, systemLightTheme, systemDarkTheme } = useSettingsStore.getState();
  const effectiveId = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches ? systemDarkTheme : systemLightTheme
    : theme;
  const t = themeRegistry.get(effectiveId);
  return t?.name ?? THEMES[effectiveId]?.name ?? effectiveId;
}

export const Toolbar: React.FC = () => {
  const { handleNewFile, handleOpenFile, handleOpenFolder } = useFileOperations();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [_, forceUpdate] = useState(0);

  // 主题改变时刷新
  React.useEffect(() => {
    const unsub = useSettingsStore.subscribe(() => {
      forceUpdate(n => n + 1);
    });
    return unsub;
  }, []);

  return (
    <>
      <div className="h-11 bg-[var(--toolbar-bg)] border-b border-[var(--editor-border)] flex items-center px-3 gap-1 select-none">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2 mr-3 pr-3 border-r border-[var(--editor-border)]">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[var(--accent-400)] to-[var(--accent-600)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-semibold text-[var(--editor-text)] hidden sm:inline">
            MD Editor
          </span>
        </div>

        {/* 文件操作组 */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={FilePlus}
            title="新建文档"
            onClick={handleNewFile}
          />
          <ToolbarButton
            icon={FileText}
            title="打开文件"
            onClick={handleOpenFile}
          />
          <ToolbarButton
            icon={FolderOpen}
            title="打开文件夹"
            onClick={handleOpenFolder}
          />
        </div>

        {/* 分隔线 */}
        <div className="w-px h-5 bg-[var(--editor-border)] mx-2" />



        {/* 右侧工具 */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* 快捷键提示 */}
          <ToolbarButton
            icon={Command}
            title="快捷键"
            onClick={() => setShowShortcuts(true)}
          />

          {/* 分隔线 */}
          <div className="w-px h-5 bg-[var(--editor-border)] mx-1" />

          {/* 主题切换 */}
          <div className="relative">
            <button
              className="
                group relative flex items-center gap-1.5
                pl-2 pr-2.5 h-8 rounded-md
                transition-all duration-[var(--transition-fast)]
                text-[var(--editor-text-secondary)] hover:bg-[var(--toolbar-hover)] hover:text-[var(--editor-text)]
                active:bg-[var(--toolbar-active)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]
              "
              onClick={() => setShowThemePanel(!showThemePanel)}
              title={`当前主题: ${getCurrentThemeName()}`}
            >
              <Palette size={16} className="transition-transform duration-[var(--transition-fast)] group-hover:scale-110" />
              <span className="text-[11px] max-w-[48px] truncate">{getCurrentThemeName()}</span>
            </button>
            {showThemePanel && (
              <ThemePanel onClose={() => setShowThemePanel(false)} />
            )}
          </div>

          <div className="w-px h-5 bg-[var(--editor-border)] mx-1" />

          <ToolbarButton
            icon={Settings}
            title="设置"
            onClick={() => {
              setShowThemePanel(false);
              window.dispatchEvent(new CustomEvent('open-settings'));
            }}
          />
        </div>
      </div>

      {showShortcuts && (
        <ShortcutsPanel mode="dialog" onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
};

interface ToolbarButtonProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  shortcut?: string;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  title,
  onClick,
  shortcut,
  active = false
}) => {
  return (
    <button
      className={`
        group relative flex items-center justify-center
        w-8 h-8 rounded-md
        transition-all duration-[var(--transition-fast)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] focus-visible:ring-offset-1
        ${active
          ? 'bg-[var(--toolbar-active)] text-[var(--accent-500)]'
          : 'text-[var(--editor-text-secondary)] hover:bg-[var(--toolbar-hover)] hover:text-[var(--editor-text)] active:bg-[var(--toolbar-active)]'
        }
      `}
      onClick={onClick}
      title={shortcut ? `${title} (${shortcut})` : title}
    >
      <Icon size={18} className="transition-transform duration-[var(--transition-fast)] group-hover:scale-110" />

      {/* 悬停提示 */}
      <div className="
        absolute top-full left-1/2 -translate-x-1/2 mt-2
        px-2 py-1 rounded-md
        bg-[var(--editor-text)] text-[var(--editor-bg)]
        text-xs whitespace-nowrap
        opacity-0 invisible
        group-hover:opacity-100 group-hover:visible
        transition-all duration-[var(--transition-fast)]
        pointer-events-none z-50
        shadow-lg
      ">
        {title}
        {shortcut && (
          <span className="ml-1.5 opacity-70 text-[10px]">{shortcut}</span>
        )}
      </div>
    </button>
  );
};

export default Toolbar;
