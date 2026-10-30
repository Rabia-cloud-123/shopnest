import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import Admin from './Admin.jsx'
import App from './App.jsx'
import './styles.css'

const Page = window.location.pathname.startsWith('/admin') ? Admin : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
