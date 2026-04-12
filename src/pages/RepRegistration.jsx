import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RepRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    motivation: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const generateReference = () => {
    return `W2WA-REP-${Date.now().toString().slice(-6)}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const applicationRef = generateReference();

      await addDoc(collection(db, "repApplications"), {
        ...formData,
        applicationRef,
        role: "rep",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess(
        `Application submitted successfully! Reference No: ${applicationRef}`
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        experience: "",
        motivation: "",
      });

      // Redirect after submission
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>👨‍💼 Representative Application</h2>
        <p>Apply to become a Waste-to-Wealth Ambassador.</p>

        {success && <p style={successStyle}>{success}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="location"
            placeholder="City/State"
            value={formData.location}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="experience"
            placeholder="Relevant Experience"
            value={formData.experience}
            onChange={handleChange}
            style={inputStyle}
          />

          <textarea
            name="motivation"
            placeholder="Why do you want to become a representative?"
            value={formData.motivation}
            onChange={handleChange}
            style={{ ...inputStyle, height: "80px" }}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Styles */
const containerStyle = {
  background: "#f4f7fb",
  minHeight: "100vh",
  padding: "20px",
};

const cardStyle = {
  maxWidth: "500px",
  margin: "40px auto",
  padding: "30px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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

const successStyle = {
  color: "green",
  fontWeight: "bold",
};

const errorStyle = {
  color: "red",
  fontWeight: "bold",
};