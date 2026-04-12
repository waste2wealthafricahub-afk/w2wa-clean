import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Check Admin collection
      const adminQuery = query(
        collection(db, "admins"),
        where("email", "==", user.email)
      );
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        navigate("/admin-dashboard");
        return;
      }

      // Check Schools collection
      const schoolQuery = query(
        collection(db, "schools"),
        where("email", "==", user.email)
      );
      const schoolSnapshot = await getDocs(schoolQuery);

      if (!schoolSnapshot.empty) {
        const schoolData = schoolSnapshot.docs[0].data();

        if (schoolData.status !== "approved") {
          alert("Your school registration is pending admin approval.");
          return;
        }

        navigate("/school-dashboard");
        return;
      }

      // Check Representatives collection
      const repQuery = query(
        collection(db, "representatives"),
        where("email", "==", user.email)
      );
      const repSnapshot = await getDocs(repQuery);

      if (!repSnapshot.empty) {
        const repData = repSnapshot.docs[0].data();

        if (repData.status !== "approved") {
          alert("Your application is pending admin approval.");
          return;
        }

        navigate("/rep-dashboard");
        return;
      }

      alert("No account found. Please register.");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>W2WA School Project</h1>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={styles.links}>
        <p>
          <Link to="/register-school">Register as a School</Link>
        </p>
        <p>
          <Link to="/register-rep">Apply as a Representative</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    textAlign: "center",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#2c7a7b",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  links: {
    marginTop: "15px",
  },
};