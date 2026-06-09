import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase";

import {
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

export default function SchoolRegistration() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      schoolName: "",
      teacherName: "",
      email: "",
      password: "",
      phone: "",
      state: "",
      address: "",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const schoolId =
        formData.schoolName
          .replace(/\s+/g, "")
          .toLowerCase();

      await addDoc(
        collection(db, "schools"),
        {
          schoolName:
            formData.schoolName,

          teacherName:
            formData.teacherName,

          email:
            formData.email,

          phone:
            formData.phone,

          address:
            formData.address,

          state:
            formData.state,

          schoolId,

          role: "school",

          approved: false,

          status: "pending",

          uid:
            userCredential.user.uid,

          createdAt:
            new Date(),
        }
      );
await setDoc(
  doc(db, "schoolWallets", schoolId),
  {
    schoolId,
    balance: 0,
    totalEarned: 0,
    totalDeductions: 0,
    createdAt: new Date(),
  }
);
      alert(
        "School registered successfully"
      );

      navigate("/");

    } catch (error) {

      console.error(error);

      alert(error.message);
    }

    setLoading(false);
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "450px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >

        <h2>
          School Registration
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="schoolName"
            placeholder="School Name"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="teacherName"
            placeholder="Teacher Name"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="address"
            placeholder="School Address"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Registering..."
              : "Register School"}
          </button>

        </form>

      </div>

    </div>
  );
}

const styles = {

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "20px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};