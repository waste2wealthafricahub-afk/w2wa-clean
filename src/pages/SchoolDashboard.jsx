import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SchoolDashboard() {
  const [waste, setWaste] = useState(0);
  const [value, setValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Query waste logs belonging to the logged-in school
        const q = query(
          collection(db, "wasteLogs"),
          where("schoolEmail", "==", user.email)
        );

        const querySnapshot = await getDocs(q);

        let totalWaste = 0;
        let totalValue = 0;
        const wasteData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            totalWaste += Number(data.weight || 0);
            totalValue += Number(data.value || 0);
            wasteData.push({ id: doc.id, ...data });
          }
        });

        setWaste(totalWaste);
        setValue(totalValue);
        setLogs(wasteData);
      } catch (error) {
        console.error("Error fetching school data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>School Dashboard</h2>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Total Waste</h3>
          <p>{waste} kg</p>
        </div>

        <div style={styles.card}>
          <h3>Total Value</h3>
          <p>₦{value.toLocaleString()}</p>
        </div>
      </div>

      <h3>Waste Logs</h3>
      {logs.length === 0 ? (
        <p>No waste records found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Waste Type</th>
              <th>Weight (kg)</th>
              <th>Value (₦)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.date || "N/A"}</td>
                <td>{log.type || "N/A"}</td>
                <td>{log.weight || 0}</td>
                <td>₦{Number(log.value || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  cards: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  card: {
    background: "#f4f6f8",
    padding: "20px",
    borderRadius: "10px",
    minWidth: "200px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
