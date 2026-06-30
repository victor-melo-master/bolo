// src/modules/auth/components/CreateAdminForm.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAdminForm — Formulario de creación de administradores
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza campos para crear un nuevo admin (teléfono, nombre,
 * contraseña, email, cédula, rol). Solo accesible para usuarios
 * super_admin. Valida con Zod y muestra mensaje de éxito.
 *
 * Capa: UI (componente de formulario)
 * Dependencias: react-hook-form, zod, EyeIcon
 * Props: onSubmit, isLoading, error, success
 *
 * @module CreateAdminForm
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema } from "../utils/validation";
import { useState } from "react";
import EyeIcon from "../../../shared/components/EyeIcon";
import type { z } from "zod";

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

interface Props {
  onSubmit: (data: CreateAdminFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function CreateAdminForm({
  onSubmit,
  isLoading,
  error,
  success,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    mode: "onChange",
  });

  const handleFormSubmit = async (data: CreateAdminFormData) => {
    await onSubmit(data);
    reset();
    setShowPassword(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
    border: "1px solid #ccc",
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: 4,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    color: "#555",
  };

  const buttonBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
    marginTop: 8,
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div style={{ marginBottom: 12 }}>
        <input
          {...register("phone")}
          placeholder="Teléfono (0412XXXXXXX)"
          style={inputStyle}
        />
        {errors.phone && (
          <small style={{ color: "red" }}>{errors.phone.message}</small>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          {...register("fullName")}
          placeholder="Nombre completo"
          style={inputStyle}
        />
        {errors.fullName && (
          <small style={{ color: "red" }}>{errors.fullName.message}</small>
        )}
      </div>

      <div style={{ marginBottom: 12, position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          placeholder="Contraseña"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={eyeButtonStyle}
          tabIndex={-1}
          aria-label={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
        >
          <EyeIcon open={showPassword} size={20} />
        </button>
        {errors.password && (
          <small style={{ color: "red" }}>{errors.password.message}</small>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          {...register("email")}
          placeholder="Email (opcional)"
          style={inputStyle}
        />
        {errors.email && (
          <small style={{ color: "red" }}>{errors.email.message}</small>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          {...register("cedula")}
          placeholder="Cédula o pasaporte (opcional)"
          style={inputStyle}
        />
        {errors.cedula && (
          <small style={{ color: "red" }}>{errors.cedula.message}</small>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Rol: </label>
        <select {...register("role")} style={inputStyle}>
          <option value="driver">Conductor</option>
          <option value="association_admin">Admin de Asociación</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {errors.role && (
          <small style={{ color: "red" }}>{errors.role.message}</small>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>¡Administrador creado exitosamente!</p>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        style={{
          ...buttonBaseStyle,
          backgroundColor: !isValid || isLoading ? "#bdbdbd" : "#1976d2",
          cursor: !isValid || isLoading ? "not-allowed" : "pointer",
          opacity: !isValid || isLoading ? 0.8 : 1,
        }}
      >
        {isLoading ? "Creando..." : "Crear administrador"}
      </button>
    </form>
  );
}
