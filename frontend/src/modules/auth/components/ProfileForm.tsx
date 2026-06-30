// src/modules/auth/components/ProfileForm.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * ProfileForm — Formulario de edición de perfil
 * ═══════════════════════════════════════════════════════════════
 *
 * Precarga los datos actuales del usuario y permite modificar
 * nombre, email, cédula y categoría (solo pasajeros). Valida
 * con Zod vía React Hook Form.
 *
 * Capa: UI (componente de formulario)
 * Dependencias: react-hook-form, zod, auth types
 * Props: user, onSubmit, isLoading, error
 *
 * @module ProfileForm
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "../utils/validation";
import type { UpdateProfileRequest, UserProfile } from "../types";

interface Props {
  user: UserProfile;
  onSubmit: (data: UpdateProfileRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function ProfileForm({
  user,
  onSubmit,
  isLoading,
  error,
}: Props) {
  const isAdmin = "role" in user;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email || "",
      cedula: user.cedula || "",
      category: !isAdmin ? user.category : undefined,
    //   role: isAdmin ? user.role : undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ marginBottom: 12 }}>
        <label>Nombre completo</label>
        <input {...register("fullName")} style={inputStyle} />
        {errors.fullName && (
          <small style={{ color: "red" }}>{errors.fullName.message}</small>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Email</label>
        <input
          {...register("email")}
          style={inputStyle}
          placeholder="Opcional"
        />
        {errors.email && (
          <small style={{ color: "red" }}>{errors.email.message}</small>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Cédula o pasaporte</label>
        <input
          {...register("cedula")}
          style={inputStyle}
          placeholder="V-12345678 o pasaporte"
        />
        {errors.cedula && (
          <small style={{ color: "red" }}>{errors.cedula.message}</small>
        )}
      </div>
      {!isAdmin && (
        <div style={{ marginBottom: 12 }}>
          <label>Categoría</label>
          <select {...register("category")} style={inputStyle}>
            <option value="normal">Normal</option>
            <option value="student">Estudiante</option>
            <option value="elderly">Tercera edad</option>
          </select>
          {errors.category && (
            <small style={{ color: "red" }}>{errors.category.message}</small>
          )}
        </div>
      )}
     
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        style={{
          ...inputStyle,
          background: "#1976d2",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  marginTop: 4,
  marginBottom: 4,
  borderRadius: 4,
  border: "1px solid #ccc",
};
