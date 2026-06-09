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
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

export default function RepresentativeRegistration() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      state: "",
    });

  // ==========================
  // HANDLE CHANGE
  // ==========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // ==========================
  // REGISTER REPRESENTATIVE
  // ==========================
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

  await setDoc(
  doc(
    db,
    "representatives",
    userCredential.user.uid
  ),
  {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    state: formData.state,

    role: "representative",

    approved: false,

    assignedSchoolIds: [],

    walletBalance: 0,

    uid: userCredential.user.uid,

    createdAt: new Date(),
  }
);
  
await setDoc(
  doc(
    db,
    "repWallets",
    userCredential.user.uid
  ),
  {
    repId:
      userCredential.user.uid,

    floatBalance: 0,

    totalPurchases: 0,

    totalLeviesPaid: 0,

    createdAt: new Date(),
  }
);
      alert(
        "Representative registration submitted successfully"
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
          Representative Registration
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
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
            name="address"
            placeholder="Address"
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

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Submitting..."
              : "Register Representative"}
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