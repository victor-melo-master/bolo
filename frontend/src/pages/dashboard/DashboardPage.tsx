// src/pages/dashboard/DashboardPage.tsx
import { useAuthStore } from '../../shared/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { isAdminProfile, isPassengerProfile } from '../../modules/auth/types';
import { useLogout } from '../../modules/auth/hooks/useLogout';
import { useDeleteAccount } from '../../modules/auth/hooks/useDeleteAccount';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.userType());
  const navigate = useNavigate();

  const { execute: handleLogout } = useLogout(() => {
    navigate('/', { replace: true });
  });

  const { execute: handleDeleteAccount, isLoading: isDeleting } = useDeleteAccount();

  const onDeleteClick = () => {
    if (window.confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      handleDeleteAccount();
      navigate('/', { replace: true });
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Cargando datos del usuario...</div>;
  }

  const isAdmin = userType === 'admin';
  const isSuperAdmin = isAdmin && isAdminProfile(user) && user.role === 'super_admin';
  const canDelete = !isSuperAdmin;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Panel de {isAdmin ? 'Administración' : 'Usuario'}</h1>

      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <p><strong>Nombre:</strong> {user.fullName}</p>
        <p><strong>Teléfono:</strong> {user.phone}</p>
        {user.email && <p><strong>Email:</strong> {user.email}</p>}

        {isAdmin && isAdminProfile(user) && (
          <p><strong>Rol:</strong> {user.role}</p>
        )}
        {!isAdmin && isPassengerProfile(user) && (
          <p><strong>Categoría:</strong> {user.category}</p>
        )}
      </div>

      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <Link to="/profile" style={linkStyle}>Editar perfil</Link>
        <Link to="/profile/password" style={linkStyle}>Cambiar contraseña</Link>
        {isAdmin && isAdminProfile(user) && user.role === 'super_admin' && (
          <Link to="/admin/create" style={{ ...linkStyle, background: '#2196F3', color: '#fff' }}>
            Crear administrador / conductor
          </Link>
        )}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Cerrar sesión
        </button>
        
        <button
          onClick={onDeleteClick}
          disabled={!canDelete || isDeleting}
          title={!canDelete ? 'No puedes eliminar tu propia cuenta de Super Admin por seguridad' : ''}
          style={{
            ...logoutButtonStyle,
            backgroundColor: canDelete ? '#9e9e9e' : '#e0e0e0',
            cursor: canDelete ? 'pointer' : 'not-allowed',
            opacity: canDelete ? 1 : 0.7,
          }}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
        </button>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  padding: '10px 18px',
  background: '#e0e0e0',
  color: '#333',
  textDecoration: 'none',
  borderRadius: 6,
  fontWeight: 500,
};

const logoutButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#d32f2f',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 500,
};