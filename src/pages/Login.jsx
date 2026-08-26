import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // =====================
      // ADMIN
      // =====================
      if (
        email ===
        "waste2wealthafricahub@gmail.com"
      ) {
        navigate("/admin-dashboard");
        setLoading(false);
        return;
      }

      // =====================
      // MINISTRY MONITOR
      // =====================
      const monitorQuery = query(
        collection(db, "monitors"),
        where("email", "==", email)
      );

      const monitorSnapshot =
        await getDocs(monitorQuery);

      if (!monitorSnapshot.empty) {
        const monitorData =
          monitorSnapshot.docs[0].data();

        if (!monitorData.approved) {
          alert(
            "Monitor not approved yet"
          );

          setLoading(false);
          return;
        }

        navigate(
          "/monitoring-dashboard"
        );

        setLoading(false);
        return;
      }

      // =====================
      // REPRESENTATIVE
      // =====================
      const repQuery = query(
        collection(
          db,
          "representatives"
        ),
        where("email", "==", email)
      );

      const repSnapshot =
        await getDocs(repQuery);

      if (!repSnapshot.empty) {
        const repData =
          repSnapshot.docs[0].data();

        if (!repData.approved) {
          alert(
            "Representative not approved yet"
          );

          setLoading(false);
          return;
        }

        navigate("/rep-dashboard");

        setLoading(false);
        return;
      }

      // =====================
      // SCHOOL
      // =====================
      const schoolQuery = query(
        collection(db, "schools"),
        where("email", "==", email)
      );

      const schoolSnapshot =
        await getDocs(schoolQuery);

      if (!schoolSnapshot.empty) {
        navigate("/school-dashboard");

        setLoading(false);
        return;
      }

      alert("User role not found");

    } catch (error) {
      console.error(error);

      alert(
        "Login failed: " +
          error.message
      );
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        {/* =====================
            TITLE
        ====================== */}
        <h2 style={styles.title}>
          EMCCC PORTAL
        </h2>

        {/* =====================
            LOGIN FORM
        ====================== */}
        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* =====================
            REGISTRATION LINKS
        ====================== */}

        <p style={styles.text}>
          New School?{" "}
          <Link
            to="/school-registration"
            style={styles.link}
          >
            Register Here
          </Link>
        </p>

        <p style={styles.text}>
          Representative?{" "}
          <Link
            to="/rep-registration"
            style={styles.link}
          >
            Register Here
          </Link>
        </p>

        <p style={styles.text}>
          Monitor?{" "}
          <Link
            to="/monitor-registration"
            style={styles.link}
          >
            Register Here
          </Link>
        </p>

        {/* =====================
            FOOTER
        ====================== */}

        <p style={styles.footer}>
          Powered by{" "}
          <strong>
            W2WA School Project
          </strong>
        </p>

      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "410px",
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "14px",
    boxShadow:
      "0 5px 18px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "26px",
    color: "#111111",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    border: "1px solid #c8c8c8",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#eef4ff",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "5px",
    marginBottom: "12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#087df5",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  text: {
    textAlign: "center",
    margin: "13px 0",
    fontSize: "14px",
  },

  link: {
    color: "#0066ff",
    fontWeight: "600",
    textDecoration: "none",
  },

  footer: {
    textAlign: "center",
    marginTop: "28px",
    paddingTop: "15px",
    borderTop:
      "1px solid #eeeeee",
    fontSize: "13px",
    color: "#777777",
  },
};