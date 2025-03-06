import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AppComponents from './AppComponents'
import './index.css'
import AppPage from './AppPage.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    <AppPage />
    <AppComponents />
  </React.StrictMode>,
)
