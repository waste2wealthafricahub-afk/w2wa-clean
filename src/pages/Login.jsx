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

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const handleLogin = async (
    e
  ) => {

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
// =====================
// ADMIN
// =====================
if (
  email ===
  "waste2wealthafricahub@gmail.com"
) {

  navigate(
    "/admin-dashboard"
  );

  setLoading(false);

  return;
}
// =====================
// MONITOR
// =====================
const monitorQuery = query(
  collection(
    db,
    "monitors"
  ),
  where(
    "email",
    "==",
    email
  )
);

const monitorSnapshot =
  await getDocs(
    monitorQuery
  );

if (!monitorSnapshot.empty) {
  const monitorData =
    monitorSnapshot.docs[0].data();

  if (
    !monitorData.approved
  ) {
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
        where(
          "email",
          "==",
          email
        )
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

        navigate(
          "/rep-dashboard"
        );

        setLoading(false);

        return;
      }

      // =====================
      // SCHOOL
      // =====================
      const schoolQuery = query(
        collection(db, "schools"),
        where(
          "email",
          "==",
          email
        )
      );

      const schoolSnapshot =
        await getDocs(
          schoolQuery
        );

      if (!schoolSnapshot.empty) {

        navigate(
          "/school-dashboard"
        );

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

        <h2>
          W2WASCHOOL Login
        </h2>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
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
  },

  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
  },

  text: {
    marginTop: "15px",
    fontSize: "14px",
  },

  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};