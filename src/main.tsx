import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TestApp } from './project-manager-test/TestApp'
import('./index.css')

// Determine which app to render based on environment
const showTestApp = import.meta.env.DEV && import.meta.env.VITE_SHOW_TEST_APP === 'true';

const AppComponent = showTestApp ? TestApp : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
