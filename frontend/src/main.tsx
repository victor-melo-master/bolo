// src/main.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * main — Punto de entrada de la aplicación React
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza el componente raíz <App> dentro de <StrictMode> en el
 * elemento DOM con id "root". Inicializa el árbol de la aplicación.
 *
 * Capa: entry point
 * Dependencias: React 19, react-dom/client
 *
 * @module main
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
