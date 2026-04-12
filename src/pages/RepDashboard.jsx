import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RepDashboard() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const snapshot = await getDocs(collection(db, "schools"));
        const schoolList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchools(schoolList);
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Representative Dashboard</h2>

      {schools.length === 0 ? (
        <p>No schools assigned.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name || "N/A"}</td>
                <td>{school.email || "N/A"}</td>
                <td>
                  {school.approved ? (
                    <span style={{ color: "green" }}>Approved</span>
                  ) : (
                    <span style={{ color: "orange" }}>Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};