import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
  import { updateDoc } from "firebase/firestore";
export default function SchoolApprovals() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const snapshot = await getDocs(collection(db, "pendingLogs"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);


const approveLog = async (log) => {
  try {
    // 1. Move to recyclingLogs
    await addDoc(collection(db, "recyclingLogs"), {
      schoolId: log.schoolId,
      plastic: log.plastic,
      paper: log.paper,
      metal: log.metal,
      totalWeight: log.totalWeight,
      totalValue: log.totalValue,
      submittedBy: log.submittedBy,
      createdAt: new Date(),
    });

    // 2. ✅ UPDATE PAYMENT STATUS (THIS IS STEP 3)
    if (log.paymentId) {
      await updateDoc(doc(db, "payments", log.paymentId), {
        status: "confirmed",
      });
    }

    // 3. Remove from pendingLogs
    await deleteDoc(doc(db, "pendingLogs", log.id));

    alert("Waste approved and payment confirmed!");

    fetchLogs();
  } catch (error) {
    console.error(error);
    alert("Error approving log");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Waste Approvals</h2>

      {logs.length === 0 ? (
        <p>No pending entries</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
            }}
          >
            <p><strong>Plastic:</strong> {log.plastic} kg</p>
            <p><strong>Paper:</strong> {log.paper} kg</p>
            <p><strong>Metal:</strong> {log.metal} kg</p>
            <p><strong>Value:</strong> ₦{log.totalValue}</p>

            <button
              onClick={() => approveLog(log)}
              style={{
                background: "green",
                color: "#fff",
                padding: "8px 12px",
                border: "none",
              }}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}