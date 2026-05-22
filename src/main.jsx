import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrencyPreferenceProvider } from './contexts/CurrencyPreferenceContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyPreferenceProvider>
      <App />
    </CurrencyPreferenceProvider>
  </StrictMode>,
)
