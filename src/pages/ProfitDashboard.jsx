import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ProfitDashboard() {
  const [totalValue, setTotalValue] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 📊 WASTE DATA (Revenue + Volume)
        const wasteSnap = await getDocs(collection(db, "pendingLogs"));

        let value = 0;
        let weight = 0;

        wasteSnap.forEach((doc) => {
          const data = doc.data();
          value += data.totalValue || 0;
          weight += data.totalWeight || 0;
        });

        setTotalValue(value);
        setTotalWeight(weight);

        // 💸 TRANSACTIONS (Rep spending)
        const txnSnap = await getDocs(collection(db, "transactions"));

        let spent = 0;

        txnSnap.forEach((doc) => {
          const t = doc.data();
          if (t.type === "debit") {
            spent += t.amount || 0;
          }
        });

        setTotalSpent(spent);
      } catch (error) {
        console.error("Profit error:", error);
      }
    };

    loadData();
  }, []);

  const profit = totalValue - totalSpent;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>💰 Profit Dashboard</h2>

      <div style={card}>
        <h3>Total Waste Value</h3>
        <h1>₦{totalValue}</h1>
      </div>

      <div style={card}>
        <h3>Total Waste Collected</h3>
        <h2>{totalWeight} kg</h2>
      </div>

      <div style={card}>
        <h3>Total Rep Spending</h3>
        <h1>₦{totalSpent}</h1>
      </div>

      <div style={card}>
        <h3>Net Profit</h3>
        <h1 style={{ color: profit >= 0 ? "green" : "red" }}>
          ₦{profit}
        </h1>
      </div>
    </div>
  );
}

const card = {
  background: "#f4f6f8",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "15px",
};