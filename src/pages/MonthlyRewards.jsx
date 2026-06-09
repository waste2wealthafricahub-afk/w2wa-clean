import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MonthlyRewards() {
  const [topSchools, setTopSchools] = useState([]);
  const [topReps, setTopReps] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const schoolSnap = await getDocs(collection(db, "schools"));
      const repSnap = await getDocs(collection(db, "representatives"));
      const logsSnap = await getDocs(collection(db, "pendingLogs"));

      const schools = schoolSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reps = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const logs = logsSnap.docs.map(d => d.data());

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 🔥 FILTER CURRENT MONTH ONLY
      const monthlyLogs = logs.filter(l => {
        if (!l.createdAt) return false;

        const date = new Date(l.createdAt.seconds * 1000);

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          l.status === "approved"
        );
      });

      // 🏫 SCHOOL RANKING
      const schoolStats = schools.map(s => {
        const sLogs = monthlyLogs.filter(l => l.schoolId === s.id);

        const total = sLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        return { name: s.schoolName, total };
      });

      schoolStats.sort((a, b) => b.total - a.total);

      // 👤 REP RANKING
      const repStats = reps.map(r => {
        const rLogs = monthlyLogs.filter(l => l.repId === r.id);

        const total = rLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        return { name: r.fullName, total };
      });

      repStats.sort((a, b) => b.total - a.total);

      setTopSchools(schoolStats.slice(0, 3));
      setTopReps(repStats.slice(0, 3));
    };

    loadData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Monthly Rewards</h2>

      <h3>🏫 Top Schools (This Month)</h3>
      {topSchools.map((s, i) => (
        <div key={i} style={card}>
          <h4>#{i + 1} - {s.name}</h4>
          <p>♻️ {s.total} kg</p>
          <p>🎁 {rewardLabel(i)}</p>
        </div>
      ))}

      <h3 style={{ marginTop: 30 }}>👤 Top Reps (This Month)</h3>
      {topReps.map((r, i) => (
        <div key={i} style={card}>
          <h4>#{i + 1} - {r.name}</h4>
          <p>♻️ {r.total} kg</p>
          <p>🎁 {rewardLabel(i)}</p>
        </div>
      ))}
    </div>
  );
}

function rewardLabel(rank) {
  if (rank === 0) return "🥇 Gold";
  if (rank === 1) return "🥈 Silver";
  if (rank === 2) return "🥉 Bronze";
  return "";
}

const card = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
};