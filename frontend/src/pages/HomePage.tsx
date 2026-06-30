import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>Bienvenido a BOLO</h1>
      <p>Selecciona tu tipo de acceso</p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          marginTop: 32,
        }}
      >
        <Link
          to="/login"
          style={{
            padding: "12px 24px",
            background: "#4CAF50",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
          }}
        >
          Soy Pasajero
        </Link>
        <Link
          to="/admin/login"
          style={{
            padding: "12px 24px",
            background: "#2196F3",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
          }}
        >
          Soy Administrador
        </Link>
      </div>
    </div>
  );
}
