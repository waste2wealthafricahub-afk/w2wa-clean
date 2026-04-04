import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>W2WA School Program</h1>

      <button onClick={() => navigate("/login")}>
        Login
      </button>

      <button onClick={() => navigate("/register")}>
        Register School
      </button>
    </div>
  );
}