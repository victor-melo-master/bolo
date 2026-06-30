// src/App.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * App — Componente raíz de la aplicación
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza el enrutador principal. Es el componente montado por
 * createRoot en main.tsx.
 *
 * Capa: root component
 * Dependencias: react-router-dom, AppRouter
 *
 * @module App
 */
import AppRouter from './routes/AppRouter';

export default function App() {
  return <AppRouter />;
}