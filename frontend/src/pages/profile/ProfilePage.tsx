// src/pages/profile/ProfilePage.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * ProfilePage — Página de edición de perfil
 * ═══════════════════════════════════════════════════════════════
 *
 * Obtiene el perfil actual vía useProfile y muestra el formulario
 * ProfileForm para editar los datos. Usa useUpdateProfile para
 * enviar los cambios al backend.
 *
 * Capa: page
 * Dependencias: useProfile, useUpdateProfile, ProfileForm, router
 *
 * @module ProfilePage
 */
import { useProfile } from '../../modules/auth/hooks/useProfile';
import { useUpdateProfile } from '../../modules/auth/hooks/useUpdateProfile';
import ProfileForm from '../../modules/auth/components/ProfileForm';
import { Link } from 'react-router-dom';
import type { UpdateProfileRequest } from '../../modules/auth/types';

export default function ProfilePage() {
  const { profile, isLoading: loadingProfile, error: profileError } = useProfile();
  const { execute, isLoading: updating, error: updateError } = useUpdateProfile();

  const handleSubmit = async (data: UpdateProfileRequest) => {
    await execute(data);
  };

  if (loadingProfile) return <div style={{ textAlign: 'center', marginTop: 40 }}>Cargando perfil...</div>;
  if (profileError) return <div style={{ color: 'red', textAlign: 'center' }}>Error: {profileError}</div>;
  if (!profile) return <div>No se pudo cargar el perfil</div>;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h1>Editar perfil</h1>
      <ProfileForm user={profile} onSubmit={handleSubmit} isLoading={updating} error={updateError} />
      <p style={{ marginTop: 16 }}>
        <Link to="/profile/password">Cambiar contraseña</Link> | <Link to="/dashboard">Volver al panel</Link>
      </p>
    </div>
  );
}