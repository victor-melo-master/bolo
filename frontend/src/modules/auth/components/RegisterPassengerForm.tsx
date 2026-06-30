// src/modules/auth/components/RegisterPassengerForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerPassengerSchema,
  type RegisterPassengerFormData,
} from "../utils/validation";
import EyeIcon from "../../../shared/components/EyeIcon";

interface Props {
  onSubmit: (data: RegisterPassengerFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function RegisterPassengerForm({
  onSubmit,
  isLoading,
  error,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterPassengerFormData>({
    resolver: zodResolver(registerPassengerSchema),
    mode: "onChange",
  });

  const handleFormSubmit = async (data: RegisterPassengerFormData) => {
    await onSubmit(data);
    setShowPassword(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Nombre completo */}
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

      {/* Teléfono */}
      <div style={{ marginBottom: 12 }}>
        <input
          {...register("phone")}
          placeholder="Teléfono (0412-1234567)"
          style={inputStyle}
        />
        {errors.phone && (
          <small style={{ color: "red" }}>{errors.phone.message}</small>
        )}
      </div>

      {/* Contraseña con ojito */}
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

      {/* Email (opcional) */}
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

      {/* Cédula o pasaporte (opcional) */}
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

      {/* Categoría */}
      <div style={{ marginBottom: 12 }}>
        <select {...register("category")} style={inputStyle}>
          <option value="normal">Normal</option>
          <option value="student">Estudiante</option>
          <option value="elderly">Tercera edad</option>
        </select>
        {errors.category && (
          <small style={{ color: "red" }}>{errors.category.message}</small>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        style={{
          ...buttonBaseStyle,
          backgroundColor: !isValid || isLoading ? "#bdbdbd" : "#2e7d32",
          cursor: !isValid || isLoading ? "not-allowed" : "pointer",
          opacity: !isValid || isLoading ? 0.8 : 1,
        }}
      >
        {isLoading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
}

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