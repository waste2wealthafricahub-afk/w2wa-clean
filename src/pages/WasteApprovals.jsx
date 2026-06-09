import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";

export default function WasteApprovals() {
  const [logs, setLogs] = useState([]);

  // 🔹 Fetch only pending logs
  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, "pendingLogs"),
        where("status", "==", "pending")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ✅ APPROVE (wallet deduction + transaction)
  const approve = async (log) => {
    try {
      // Get rep
      const repRef = doc(db, "representatives", log.repId);
      const repSnap = await getDoc(repRef);

      if (!repSnap.exists()) {
        alert("Rep not found");
        return;
      }

      const repData = repSnap.data();
      const currentBalance = repData.walletBalance || 0;

      // Check balance
      if (currentBalance < log.totalValue) {
        alert("Insufficient wallet balance");
        return;
      }

      const newBalance = currentBalance - log.totalValue;

      // Update wallet
      await updateDoc(repRef, {
        walletBalance: newBalance,
      });

      // Record transaction
      await addDoc(collection(db, "transactions"), {
        repId: log.repId,
        amount: log.totalValue,
        type: "debit",
        balanceAfter: newBalance,
        createdAt: new Date(),
      });

      // Mark log as approved
      await updateDoc(doc(db, "pendingLogs", log.id), {
        status: "approved",
      });
await addDoc(collection(db, "notifications"), {
  userId: log.repId,
  title: "Waste Approved",
  message: `Your waste (${log.totalWeight}kg) has been approved`,
  read: false,
  createdAt: new Date(),
});
      alert("Approved and wallet updated");

      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  // ❌ REJECT (no wallet impact)
  const reject = async (id) => {
    try {
      await updateDoc(doc(db, "pendingLogs", id), {
        status: "rejected",
      });

      alert("Rejected");

      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Rejection failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Waste Approvals</h2>

      {logs.length === 0 && <p>No pending waste logs</p>}

      {logs.map((log) => (
        <div key={log.id} style={card}>
          <p><strong>School:</strong> {log.schoolId}</p>
          <p><strong>Weight:</strong> {log.totalWeight} kg</p>
          <p><strong>Value:</strong> ₦{log.totalValue}</p>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => approve(log)} style={approveBtn}>
              Approve
            </button>

            <button onClick={() => reject(log.id)} style={rejectBtn}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 🎨 Styles
const card = {
  border: "1px solid #ccc",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "8px",
};

const approveBtn = {
  marginRight: "10px",
  padding: "8px 12px",
  backgroundColor: "green",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const rejectBtn = {
  padding: "8px 12px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  cursor: "pointer",
};