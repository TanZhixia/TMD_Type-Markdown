import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { themeRegistry } from './themes/registry'
import { builtinThemes } from './themes/builtin'
import { restoreCustomThemes } from './themes/persistence'

// 注册所有内置主题
themeRegistry.registerAll(builtinThemes)
// 恢复之前导入的自定义主题
restoreCustomThemes()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
