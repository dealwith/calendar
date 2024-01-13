import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Theme, ThemePanel } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme
      accentColor="mint"
      grayColor="gray"
      panelBackground="solid"
      scaling="100%"
      radius="full"
      appearance='dark'
    >
      <App />
      <ThemePanel />
    </Theme>
  </React.StrictMode>,
)
