import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";
import {
  processCollectionPurchase,
} from "../services/walletService";

export default function RepresentativeDashboard() {
  const [schools, setSchools] =
    useState([]);

  const [collectionHistory,
    setCollectionHistory] =
    useState([]);

  const [prices, setPrices] =
    useState({
      plastic: 0,
      paper: 0,
      metal: 0,
    });

  const [selectedSchool,
    setSelectedSchool] =
    useState("");

  const [plastic, setPlastic] =
    useState("");

  const [paper, setPaper] =
    useState("");

  const [metal, setMetal] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOAD ALL DATA
  // =========================
  useEffect(() => {
    fetchSchools();
    fetchPrices();
    fetchCollections();
  }, []);

  // =========================
  // FETCH APPROVED SCHOOLS
  // =========================
  const fetchSchools = async () => {
    try {
      const schoolQuery = query(
        collection(db, "schools"),
        where("approved", "==", true)
      );

      const snapshot =
        await getDocs(schoolQuery);

      const schoolList =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setSchools(schoolList);

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // FETCH CURRENT PRICES
  // =========================
  const fetchPrices = async () => {
    try {
      const priceRef = doc(
        db,
        "prices",
        "current"
      );

      const priceSnap =
        await getDoc(priceRef);

      if (priceSnap.exists()) {
        setPrices(priceSnap.data());
      }

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // FETCH COLLECTION HISTORY
  // =========================
  const fetchCollections = async () => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "collections")
        );

      const list =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setCollectionHistory(list);

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // LIVE CALCULATIONS
  // =========================
  const plasticKg =
    Number(plastic || 0);

  const paperKg =
    Number(paper || 0);

  const metalKg =
    Number(metal || 0);

  const plasticValue =
    plasticKg * prices.plastic;

  const paperValue =
    paperKg * prices.paper;

  const metalValue =
    metalKg * prices.metal;

  const totalWeight =
    plasticKg +
    paperKg +
    metalKg;

  const totalValue =
    plasticValue +
    paperValue +
    metalValue;

  const repLevy =
    totalValue * 0.05;

 const schoolLevy =
  totalValue * 0.05;

  const schoolCredit =
    totalValue - schoolLevy;

  // =========================
  // SUBMIT COLLECTION
  // =========================
 const handleSubmit = async () => {
  if (!selectedSchool) {
    alert("Select school");
    return;
  }

  if (totalWeight <= 0) {
    alert("Enter waste quantity");
    return;
  }

  setLoading(true);

  try {
    // =========================
    // GET LOGGED-IN REP
    // =========================
    const repId =
      auth.currentUser?.uid;

    if (!repId) {
      throw new Error(
        "Representative not authenticated"
      );
    }

    // =========================
    // SAVE COLLECTION RECORD
    // =========================
    await addDoc(
      collection(db, "collections"),
      {
        repId,
        schoolId:
          selectedSchool,

        plasticKg,
        paperKg,
        metalKg,

        plasticPrice:
          prices.plastic,

        paperPrice:
          prices.paper,

        metalPrice:
          prices.metal,

        totalWeight,
        totalValue,

        repLevy,
        schoolLevy,
        schoolCredit,

        status: "completed",

        createdAt:
          serverTimestamp(),
      }
    );

    // =========================
    // PROCESS WALLET MOVEMENT
    // =========================
    await processCollectionPurchase({
      repId,
      schoolId:
        selectedSchool,
      totalValue,
    });

    alert(
      "Collection submitted successfully"
    );

    // =========================
    // RESET FORM
    // =========================
    setSelectedSchool("");
    setPlastic("");
    setPaper("");
    setMetal("");

    fetchCollections();

  } catch (error) {
    console.error(error);

    alert(
      error.message ||
        "Upload failed"
    );
  }

  setLoading(false);
};

  return (
    <div style={styles.page}>
      <h1>
        Representative Dashboard
      </h1>

      <p>
        Record school waste collections
      </p>

      {/* PRICE CARD */}
      <div style={styles.card}>
        <h3>Current Prices</h3>

        <p>
          Plastic:
          ₦{prices.plastic}/kg
        </p>

        <p>
          Paper:
          ₦{prices.paper}/kg
        </p>

        <p>
          Metal:
          ₦{prices.metal}/kg
        </p>
      </div>

      {/* FORM */}
      <div style={styles.card}>
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

        <input
          type="number"
          placeholder="Plastic (kg)"
          value={plastic}
          onChange={(e) =>
            setPlastic(e.target.value)
          }
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Paper (kg)"
          value={paper}
          onChange={(e) =>
            setPaper(e.target.value)
          }
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Metal (kg)"
          value={metal}
          onChange={(e) =>
            setMetal(e.target.value)
          }
          style={styles.input}
        />

        {/* CALCULATION PREVIEW */}
        <div style={styles.preview}>
          <h3>Calculation Preview</h3>

          <p>
            Total Weight:
            {totalWeight} kg
          </p>

          <p>
            Total Value:
            ₦
            {totalValue.toLocaleString()}
          </p>

          <p>
            School Credit:
            ₦
            {schoolCredit.toLocaleString()}
          </p>

          <p>
            Platform Revenue:
            ₦
            {(
              repLevy +
              schoolLevy
            ).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={styles.button}
        >
          {loading
            ? "Submitting..."
            : "Submit Collection"}
        </button>
      </div>

      {/* HISTORY */}
      <div style={styles.card}>
        <h2>Collection History</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                School
              </th>

              <th style={styles.th}>
                Weight
              </th>

              <th style={styles.th}>
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {collectionHistory.map(
              (item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    {item.schoolId}
                  </td>

                  <td style={styles.td}>
                    {item.totalWeight}kg
                  </td>

                  <td style={styles.td}>
                    ₦
                    {item.totalValue?.toLocaleString()}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    background: "#f5f7fa",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },

  preview: {
    background: "#eef6ff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #ddd",
  },
};