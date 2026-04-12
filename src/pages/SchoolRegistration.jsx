import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SchoolRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    location: "",
    teacherName: "",
    phone: "",
    studentPopulation: "",
    wasteFocus: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const generateReference = () => {
    return `W2WA-SCH-${Date.now().toString().slice(-6)}`;
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

      await addDoc(collection(db, "schoolApplications"), {
        ...formData,
        applicationRef,
        status: "pending",
        role: "school",
        createdAt: serverTimestamp(),
      });

      setSuccess(
        `Application submitted successfully! Reference No: ${applicationRef}`
      );

      setFormData({
        schoolName: "",
        email: "",
        location: "",
        teacherName: "",
        phone: "",
        studentPopulation: "",
        wasteFocus: "",
      });

      // Redirect after 3 seconds
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
        <h2>🏫 Register Your School</h2>
        <p>Join the Waste-to-Wealth Schools Program.</p>

        {success && <p style={successStyle}>{success}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="schoolName"
            placeholder="School Name"
            value={formData.schoolName}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="School Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="teacherName"
            placeholder="Coordinator/Teacher Name"
            value={formData.teacherName}
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
            type="number"
            name="studentPopulation"
            placeholder="Student Population"
            value={formData.studentPopulation}
            onChange={handleChange}
            style={inputStyle}
          />

          <select
            name="wasteFocus"
            value={formData.wasteFocus}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Primary Waste Focus</option>
            <option value="Plastic">Plastic</option>
            <option value="Paper">Paper</option>
            <option value="Metal">Metal</option>
            <option value="Organic">Organic</option>
            <option value="Mixed">Mixed Waste</option>
          </select>

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
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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