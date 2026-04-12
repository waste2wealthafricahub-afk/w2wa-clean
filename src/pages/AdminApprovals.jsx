import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

export default function AdminApprovals() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "schools"));
      const schoolList = querySnapshot.docs.map((doc) => ({
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

  const approveSchool = async (id) => {
    try {
      const schoolRef = doc(db, "schools", id);
      await updateDoc(schoolRef, {
        approved: true,
      });
      fetchSchools();
    } catch (error) {
      console.error("Error approving school:", error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Admin Approvals</h2>

      {loading ? (
        <p>Loading schools...</p>
      ) : schools.length === 0 ? (
        <p>No schools registered.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>School Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.name || "N/A"}</td>
                <td>{school.email || "N/A"}</td>
                <td>
                  {school.approved ? (
                    <span style={styles.approved}>Approved</span>
                  ) : (
                    <span style={styles.pending}>Pending</span>
                  )}
                </td>
                <td>
                  {!school.approved && (
                    <button
                      style={styles.button}
                      onClick={() => approveSchool(school.id)}
                    >
                      Approve
                    </button>
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
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  button: {
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  approved: {
    color: "green",
    fontWeight: "bold",
  },
  pending: {
    color: "orange",
    fontWeight: "bold",
  },
};