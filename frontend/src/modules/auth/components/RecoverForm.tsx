// modules/auth/components/RecoverForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phoneSchema } from "../utils/validation";

const recoverSchema = z.object({
  phone: phoneSchema,
});

type RecoverFormData = z.infer<typeof recoverSchema>;

interface Props {
  onSubmit: (data: {phone: string}) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function RecoverForm({
  onSubmit,
  isLoading,
  error,
  success,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
    mode: "onChange",
  });

  const handleFormSubmit = async (data: RecoverFormData) => {
    await onSubmit({ phone: data.phone });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>
          Si el teléfono está registrado, recibirás instrucciones.
        </p>
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
        {isLoading ? "Enviando..." : "Recuperar cuenta"}
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
