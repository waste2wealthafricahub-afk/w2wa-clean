import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RepCommissionDashboard() {
  const [reps, setReps] = useState([]);

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    const repsSnapshot = await getDocs(collection(db, "reps"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));

    const repMap = {};

    // init reps
    repsSnapshot.forEach(doc => {
      const r = doc.data();
      repMap[doc.id] = {
        name: r.fullName,
        schools: r.assignedSchools || [],
        rate: r.commissionRate || 10,
        revenue: 0,
        commission: 0
      };
    });

    // aggregate revenue per rep (via assigned schools)
    logsSnapshot.forEach(doc => {
      const d = doc.data();

      Object.values(repMap).forEach(rep => {
        if (rep.schools.includes(d.schoolId)) {
          rep.revenue += d.totalValue || 0;
        }
      });
    });

    // calculate commission
    Object.values(repMap).forEach(rep => {
      rep.commission = (rep.revenue * rep.rate) / 100;
    });

    setReps(Object.values(repMap));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>💸 Rep Commissions</h1>

      {reps.map((r, i) => (
        <div key={i} style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
          <strong>{r.name}</strong>
          <p>🏫 Schools: {r.schools.length}</p>
          <p>💰 Revenue: ₦{r.revenue}</p>
          <p>📊 Rate: {r.rate}%</p>
          <p>💸 Commission: ₦{r.commission}</p>
        </div>
      ))}
    </div>
  );
}