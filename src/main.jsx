import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ServerStatusProvider } from './ServerStatusContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServerStatusProvider>
      <App />
    </ServerStatusProvider>
  </StrictMode>,
)
