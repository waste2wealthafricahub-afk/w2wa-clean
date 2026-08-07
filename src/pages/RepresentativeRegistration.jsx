import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RepresentativeRegistration() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    state: "",
    localGovernment: "",

  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );

      const uid = userCredential.user.uid;

      // CREATE REPRESENTATIVE
      await setDoc(
        doc(db, "representatives", uid),
        {
          uid,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          state: formData.state.trim(),
          localGovernment:
          formData.localGovernment,
          clubCode: "EMCCC",

          role: "representative",

          approved: false,

          assignedSchoolIds: [],

          createdAt: new Date(),
        }
      );

      // CREATE REP WALLET
      await setDoc(
        doc(db, "repWallets", uid),
        {
          repId: uid,

          repName: formData.fullName.trim(),

          floatBalance: 0,

          totalPurchases: 0,

          totalLeviesPaid: 0,

          createdAt: new Date(),
        }
      );

      alert(
        "Registration submitted successfully. Await administrator approval."
      );

      navigate("/");

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Registration failed."
      );
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h1 style={styles.title}>
            Representative Registration
          </h1>

          <p style={styles.subtitle}>
            Join the W2WASchool network as a waste collection representative.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="text"
            name="address"
            placeholder="Residential Address"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
            disabled={loading}
            style={styles.input}
          />

          <input
            type="text"
            name="localGovernment"
            placeholder="Local Government Area"
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
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#f5f7fa,#e8edf5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#fff",
    borderRadius: "18px",
    padding: "35px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
  },

  header: {
    marginBottom: "25px",
    textAlign: "center",
  },

  title: {
    margin: 0,
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
};