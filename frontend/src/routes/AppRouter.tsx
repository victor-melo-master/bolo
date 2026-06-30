// src/routes/AppRouter.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * AppRouter — Enrutador principal de la aplicación
 * ═══════════════════════════════════════════════════════════════
 *
 * Define todas las rutas públicas y protegidas usando
 * createBrowserRouter. Las rutas protegidas se envuelven con
 * <ProtectedRoute> y admiten restricción por rol (super_admin).
 *
 * Capa: routing
 * Dependencias: react-router-dom, ProtectedRoute, page components
 *
 * @module AppRouter
 */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '../shared/guards/ProtectedRoute';
import HomePage from '../pages/HomePage';
import PassengerLoginPage from '../pages/auth/PassengerLoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';
import PasswordChangePage from '../pages/profile/PasswordChangePage';
import AdminCreatePage from '../pages/admin/AdminCreatePage';
import UnauthorizedPage from '../pages/error/UnauthorizedPage';
import NotFoundPage from '../pages/error/NotFoundPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <PassengerLoginPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  // Rutas protegidas genéricas
  {
    element: <ProtectedRoute />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/password', element: <PasswordChangePage /> },
    ],
  },
  // Solo super_admin
  {
    element: <ProtectedRoute requiredRole="super_admin" />,
    children: [
      { path: 'admin/create', element: <AdminCreatePage /> },
    ],
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}