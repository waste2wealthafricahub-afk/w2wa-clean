import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function AdminAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // 🔹 Get all reps
        const repSnap = await getDocs(collection(db, "representatives"));
        const reps = repSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔹 Get transactions
        const txnSnap = await getDocs(collection(db, "transactions"));
        const txns = txnSnap.docs.map((doc) => doc.data());

        // 🔹 Get waste logs
        const wasteSnap = await getDocs(collection(db, "pendingLogs"));
        const wastes = wasteSnap.docs.map((doc) => doc.data());

        // 🔹 Build analytics
        const result = reps.map((rep) => {
          const repTxns = txns.filter((t) => t.repId === rep.id);
          const repWaste = wastes.filter((w) => w.repId === rep.id);

          const totalSpent = repTxns
            .filter((t) => t.type === "debit")
            .reduce((sum, t) => sum + (t.amount || 0), 0);

          const totalWeight = repWaste.reduce(
            (sum, w) => sum + (w.totalWeight || 0),
            0
          );

          return {
            name: rep.fullName,
            totalSpent,
            totalWeight,
            entries: repWaste.length,
          };
        });

        // 🔥 Sort by performance
        result.sort((a, b) => b.totalWeight - a.totalWeight);

        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Admin Analytics</h2>

      {data.map((rep, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>
            #{index + 1} — {rep.name}
          </h3>

          <p>💰 Spent: ₦{rep.totalSpent}</p>
          <p>♻️ Waste: {rep.totalWeight} kg</p>
          <p>🧾 Entries: {rep.entries}</p>
        </div>
      ))}
    </div>
  );
}