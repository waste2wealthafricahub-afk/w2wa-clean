import React, { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export default function RecyclingLogForm() {

  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    schoolId: "",
    plastic: "",
    paper: "",
    metal: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =====================================
  // LOAD SCHOOLS
  // =====================================
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {

      const snapshot = await getDocs(
        collection(db, "schools")
      );

      const schoolsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSchools(schoolsData);

    } catch (error) {

      console.error(
        "Error loading schools:",
        error
      );
    }
  };

  // =====================================
  // HANDLE INPUT
  // =====================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // CALCULATE TOTAL VALUE
  // =====================================
  const calculateTotalValue = () => {

    const plastic =
      Number(formData.plastic || 0);

    const paper =
      Number(formData.paper || 0);

    const metal =
      Number(formData.metal || 0);

    // Pricing logic
    const plasticValue = plastic * 100;

    const paperValue = paper * 50;

    const metalValue = metal * 200;

    return (
      plasticValue +
      paperValue +
      metalValue
    );
  };

  // =====================================
  // SUBMIT FORM
  // =====================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    try {

      const totalValue =
        calculateTotalValue();

      await addDoc(
        collection(db, "recyclingLogs"),
        {
          schoolId: formData.schoolId,

          plastic: Number(
            formData.plastic || 0
          ),

          paper: Number(
            formData.paper || 0
          ),

          metal: Number(
            formData.metal || 0
          ),

          totalValue,

          createdAt: serverTimestamp(),
        }
      );

      // SUCCESS MESSAGE
      setMessage(
        "Recycling log submitted successfully."
      );

      // RESET FORM
      setFormData({
        schoolId: "",
        plastic: "",
        paper: "",
        metal: "",
      });

    } catch (error) {

      console.error(
        "Submission Error:",
        error
      );

      setMessage(
        "Failed to submit recycling log."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1>Recycling Log Entry</h1>

        <p style={{ color: "#666" }}>
          Record school recycling activity
        </p>
      </div>

      {/* FORM CARD */}
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "10px",
          boxShadow:
            "0 2px 5px rgba(0,0,0,0.1)",
          maxWidth: "600px",
        }}
      >
        <form onSubmit={handleSubmit}>

          {/* SCHOOL */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>Select School</strong>
            </label>

            <br />

            <select
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            >
              <option value="">
                -- Select School --
              </option>

              {schools.map((school) => (
                <option
                  key={school.id}
                  value={school.id}
                >
                  {school.schoolName ||
                    school.name}
                </option>
              ))}
            </select>
          </div>

          {/* PLASTIC */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>
                Plastic (kg)
              </strong>
            </label>

            <br />

            <input
              type="number"
              name="plastic"
              value={formData.plastic}
              onChange={handleChange}
              min="0"
              placeholder="Enter plastic quantity"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* PAPER */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>
                Paper (kg)
              </strong>
            </label>

            <br />

            <input
              type="number"
              name="paper"
              value={formData.paper}
              onChange={handleChange}
              min="0"
              placeholder="Enter paper quantity"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* METAL */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>
                Metal (kg)
              </strong>
            </label>

            <br />

            <input
              type="number"
              name="metal"
              value={formData.metal}
              onChange={handleChange}
              min="0"
              placeholder="Enter metal quantity"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            />
          </div>

          {/* TOTAL VALUE */}
          <div
            style={{
              background: "#f0f4f8",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <strong>
              Estimated Recycling Value:
            </strong>

            <h2>
              ₦
              {calculateTotalValue().toLocaleString()}
            </h2>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2e7d32",
              color: "#fff",
              border: "none",
              padding:
                "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              fontSize: "16px",
            }}
          >
            {loading
              ? "Submitting..."
              : "Submit Recycling Log"}
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background:
                message.includes("success")
                  ? "#d4edda"
                  : "#f8d7da",
              color:
                message.includes("success")
                  ? "#155724"
                  : "#721c24",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}