import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RepLeaderboard() {
  const [repsData, setRepsData] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    const repsSnapshot = await getDocs(collection(db, "reps"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const schoolsSnapshot = await getDocs(collection(db, "schools"));

    const schoolNames = {};
    schoolsSnapshot.forEach(doc => {
      schoolNames[doc.id] = doc.data().name;
    });

    const repsList = [];

    repsSnapshot.forEach(doc => {
      const rep = doc.data();

      repsList.push({
        id: doc.id,
        name: rep.fullName,
        area: rep.assignedArea,
        assignedSchools: rep.assignedSchools || [],
        commissionRate: rep.commissionRate || 0,
        totalWaste: 0,
        totalValue: 0,
        totalCommission: 0
      });
    });

    logsSnapshot.forEach(doc => {
      const d = doc.data();

      repsList.forEach(rep => {
        if (!rep.assignedSchools.includes(d.schoolId)) return;

        const waste =
          (d.plastic || 0) +
          (d.paper || 0) +
          (d.metal || 0);

        const value = d.totalValue || 0;
        const commission = (value * rep.commissionRate) / 100;

        rep.totalWaste += waste;
        rep.totalValue += value;
        rep.totalCommission += commission;
      });
    });

    // 🔥 SORT BY PERFORMANCE (VALUE)
    repsList.sort((a, b) => b.totalValue - a.totalValue);

    setRepsData(repsList);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏆 Rep Performance Leaderboard</h1>

      {repsData.map((rep, i) => (
        <div
          key={rep.id}
          style={{
            padding: "15px",
            borderBottom: "1px solid #ccc"
          }}
        >
          <strong>
            {["🥇","🥈","🥉"][i] || `#${i + 1}`} — {rep.name}
          </strong>

          <p>📍 Area: {rep.area}</p>
          <p>♻️ Waste: {rep.totalWaste} kg</p>
          <p>💰 Value: ₦{rep.totalValue}</p>
          <p>🪙 Commission: ₦{rep.totalCommission.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}