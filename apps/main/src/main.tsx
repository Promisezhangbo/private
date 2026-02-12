import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import QiankunProvider from '@/components/QiankunProvider'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QiankunProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QiankunProvider>
  </StrictMode>
)





