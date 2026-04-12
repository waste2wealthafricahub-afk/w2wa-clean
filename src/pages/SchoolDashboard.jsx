import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function SchoolDashboard() {
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({
    metal: 0,
    plastic: 0,
    paper: 0,
    value: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;

      const userSnap = await getDocs(
        query(collection(db, "users"), where("__name__", "==", user.uid))
      );

      const userData = userSnap.docs[0].data();
      const schoolId = userData.schoolId;

      const q = query(
        collection(db, "recyclingLogs"),
        where("schoolId", "==", schoolId),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data());

      setLogs(data);

      let metal = 0, plastic = 0, paper = 0, value = 0;

      data.forEach(d => {
        metal += d.metal || 0;
        plastic += d.plastic || 0;
        paper += d.paper || 0;
        value += d.totalValue || 0;
      });

      setTotals({ metal, plastic, paper, value });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  const chartData = [
    { name: "Metal", value: totals.metal },
    { name: "Plastic", value: totals.plastic },
    { name: "Paper", value: totals.paper }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>School Dashboard</h2>

      <div>
        <p>Metal: {totals.metal} kg</p>
        <p>Plastic: {totals.plastic} kg</p>
        <p>Paper: {totals.paper} kg</p>
        <p>Total Value: ₦{totals.value}</p>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Recent Activity</h3>
      {logs.map((log, i) => (
        <div key={i} style={{ borderBottom: "1px solid #ccc", marginBottom: 10 }}>
          <p>{log.createdAt?.toDate().toLocaleString()}</p>
          <p>Metal: {log.metal}</p>
          <p>Plastic: {log.plastic}</p>
          <p>Paper: {log.paper}</p>
          <p>Value: ₦{log.totalValue}</p>
        </div>
      ))}
    </div>
  );
}
