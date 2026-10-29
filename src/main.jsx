import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/unbounded/500.css'
import '@fontsource/unbounded/700.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/600.css'
import Admin from './Admin.jsx'
import App from './App.jsx'
import './styles.css'

const Page = window.location.pathname.startsWith('/admin') ? Admin : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
