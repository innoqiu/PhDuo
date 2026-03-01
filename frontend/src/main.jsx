import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DatabaseOperations from './DatabaseOperations.jsx'
import ReportDisplay from './ReportDisplay.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dbp" element={<DatabaseOperations />} />
        <Route path="/report" element={<ReportDisplay />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
