import React, {
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

export default function MonitorRegistration() {
  const [fullName,
    setFullName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [position,
    setPosition] =
    useState("");

  const [accessCode,
    setAccessCode] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleRegister =
    async (e) => {
      e.preventDefault();

      if (
        accessCode !==
        "OGUN-EMCCC-2026"
      ) {
        alert(
          "Invalid Ministry Access Code"
        );
        return;
      }

      try {
        setLoading(true);

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        await setDoc(
          doc(
            db,
            "monitors",
            user.uid
          ),
          {
            fullName,
            email,
            phone,
            position,
            organization:
              "Ogun State Ministry of Environment",
            approved: false,
            role: "monitor",
            createdAt:
              new Date(),
          }
        );

        alert(
          "Registration submitted successfully. Await admin approval before login."
        );

        setFullName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setPosition("");
        setAccessCode("");
        setLoading(false);

      } catch (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
      }
    };
      return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>
          Ministry Monitor Registration
        </h1>

        <p>
          Ogun State Ministry of Environment
        </p>

        <form
          onSubmit={
            handleRegister
          }
        >
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
            required
          />

          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            required
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Position / Designation"
            value={position}
            onChange={(e) =>
              setPosition(
                e.target.value
              )
            }
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Ministry Access Code"
            value={accessCode}
            onChange={(e) =>
              setAccessCode(
                e.target.value
              )
            }
            required
          />

          <button
            style={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
    padding: "20px",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.1)",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginTop: "15px",
    borderRadius: "8px",
    border:
      "1px solid #ccc",
    boxSizing:
      "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    marginTop: "20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};