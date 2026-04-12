import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Authenticate user
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // Fetch user role from Firestore
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User record not found. Contact the administrator.");
      }

      const role = userSnap.data().role;

      // Redirect based on role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "school":
          navigate("/school");
          break;
        case "rep":
          navigate("/rep");
          break;
        default:
          throw new Error("Unauthorized role detected.");
      }
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center" }}>🌍 W2WA Portal Login</h2>
        <p style={{ textAlign: "center", color: "#555" }}>
          Waste-to-Wealth Schools Platform
        </p>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Registration Links */}
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <p>
            <Link to="/register-school" style={linkStyle}>
              🏫 Register Your School
            </Link>
          </p>
          <p>
            <Link to="/apply-rep" style={linkStyle}>
              👨‍💼 Apply as a Representative
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "#f4f7fb",
};

const cardStyle = {
  background: "#ffffff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2c7be5",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

const linkStyle = {
  color: "#2c7be5",
  textDecoration: "none",
  fontWeight: "bold",
};

const errorStyle = {
  color: "red",
  textAlign: "center",
  marginBottom: "10px",
};