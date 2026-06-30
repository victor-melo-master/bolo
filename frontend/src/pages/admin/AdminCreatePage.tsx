// src/pages/admin/AdminCreatePage.tsx
import { useCreateAdmin } from '../../modules/auth/hooks/useCreateAdmin';
import CreateAdminForm from '../../modules/auth/components/CreateAdminForm';
import { Link } from 'react-router-dom';
import type { CreateAdminRequest } from '../../modules/auth/types';

export default function AdminCreatePage() {
  const { execute, isLoading, error, success } = useCreateAdmin();

  const handleSubmit = async (data: CreateAdminRequest) => {
    await execute(data);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Crear administrador / conductor</h1>
      <CreateAdminForm onSubmit={handleSubmit} isLoading={isLoading} error={error} success={success} />
      <p style={{ marginTop: 16 }}>
        <Link to="/dashboard">← Volver al panel</Link>
      </p>
    </div>
  );
}