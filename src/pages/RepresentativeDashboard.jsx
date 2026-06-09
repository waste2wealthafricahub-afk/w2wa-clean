import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

export default function RepresentativeDashboard() {
  // =========================
  // STATES
  // =========================
  const [schools, setSchools] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [selectedSchool, setSelectedSchool] =
    useState("");

  const [plastic, setPlastic] =
    useState("");

  const [paper, setPaper] =
    useState("");

  const [metal, setMetal] =
    useState("");

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchSchools();
    fetchCollections();
  }, []);

  // =========================
  // FETCH SCHOOLS
  // =========================
  const fetchSchools = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "schools")
      );

      const schoolsList =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setSchools(schoolsList);

    } catch (error) {
      console.error(
        "Error fetching schools:",
        error
      );
    }
  };

  // =========================
  // FETCH COLLECTION HISTORY
  // =========================
  const fetchCollections = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "recyclingLogs")
      );

      const logs = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      setCollections(logs);

    } catch (error) {
      console.error(
        "Error fetching collections:",
        error
      );
    }
  };

  // =========================
  // SUBMIT COLLECTION
  // =========================
  const handleSubmit = async () => {
    try {
      if (!selectedSchool) {
        alert("Please select a school");
        return;
      }

      const totalWeight =
        Number(plastic || 0) +
        Number(paper || 0) +
        Number(metal || 0);

      const totalValue =
        totalWeight * 250;

      await addDoc(
        collection(db, "recyclingLogs"),
        {
          schoolId: selectedSchool,

          plastic: Number(plastic),

          paper: Number(paper),

          metal: Number(metal),

          totalWeight,

          totalValue,

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Collection uploaded successfully"
      );

      // REFRESH HISTORY
      fetchCollections();

      // RESET FORM
      setSelectedSchool("");
      setPlastic("");
      setPaper("");
      setMetal("");

    } catch (error) {
      console.error(
        "Upload Error:",
        error
      );

      alert(
        "Failed to upload collection"
      );
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div
      style={{
        padding: "20px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <h1>
        Representative Dashboard
      </h1>

      <p>
        Record waste collections
        from schools.
      </p>

      {/* ====================== */}
      {/* COLLECTION FORM */}
      {/* ====================== */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "500px",
          marginTop: "20px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* SCHOOL SELECT */}
        <select
          value={selectedSchool}
          onChange={(e) =>
            setSelectedSchool(
              e.target.value
            )
          }
          style={styles.input}
        >
          <option value="">
            Select School
          </option>

          {schools.map((school) => (
            <option
              key={school.id}
              value={school.schoolId}
            >
              {school.schoolName}
            </option>
          ))}
        </select>

        {/* PLASTIC */}
        <input
          type="number"
          placeholder="Plastic (kg)"
          value={plastic}
          onChange={(e) =>
            setPlastic(e.target.value)
          }
          style={styles.input}
        />

        {/* PAPER */}
        <input
          type="number"
          placeholder="Paper (kg)"
          value={paper}
          onChange={(e) =>
            setPaper(e.target.value)
          }
          style={styles.input}
        />

        {/* METAL */}
        <input
          type="number"
          placeholder="Metal (kg)"
          value={metal}
          onChange={(e) =>
            setMetal(e.target.value)
          }
          style={styles.input}
        />

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          style={styles.button}
        >
          Submit Collection
        </button>
      </div>

      {/* ====================== */}
      {/* COLLECTION HISTORY */}
      {/* ====================== */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "30px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2>
          Collection History
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#007bff",
                color: "#fff",
              }}
            >
              <th style={styles.th}>
                School
              </th>

              <th style={styles.th}>
                Plastic
              </th>

              <th style={styles.th}>
                Paper
              </th>

              <th style={styles.th}>
                Metal
              </th>

              <th style={styles.th}>
                Total Value
              </th>
            </tr>
          </thead>

          <tbody>
            {collections.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>
                  {item.schoolId}
                </td>

                <td style={styles.td}>
                  {item.plastic} kg
                </td>

                <td style={styles.td}>
                  {item.paper} kg
                </td>

                <td style={styles.td}>
                  {item.metal} kg
                </td>

                <td style={styles.td}>
                  ₦
                  {item.totalValue?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },

  th: {
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #ddd",
  },
};