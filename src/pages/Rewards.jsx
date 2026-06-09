import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Rewards() {
  const [topSchools, setTopSchools] = useState([]);
  const [topReps, setTopReps] = useState([]);

  useEffect(() => {
    const loadRewards = async () => {
      const schoolSnap = await getDocs(collection(db, "schools"));
      const repSnap = await getDocs(collection(db, "representatives"));
      const logsSnap = await getDocs(collection(db, "pendingLogs"));

      const schools = schoolSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reps = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const logs = logsSnap.docs.map(d => d.data());

      // 🏫 SCHOOL REWARD LOGIC
      const schoolStats = schools.map(s => {
        const schoolLogs = logs.filter(
          l => l.schoolId === s.id && l.status === "approved"
        );

        const total = schoolLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        return { name: s.schoolName, total };
      });

      schoolStats.sort((a, b) => b.total - a.total);

      // 👤 REP REWARD LOGIC
      const repStats = reps.map(r => {
        const repLogs = logs.filter(
          l => l.repId === r.id && l.status === "approved"
        );

        const total = repLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        return { name: r.fullName, total };
      });

      repStats.sort((a, b) => b.total - a.total);

      setTopSchools(schoolStats.slice(0, 3));
      setTopReps(repStats.slice(0, 3));
    };

    loadRewards();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎁 Rewards</h2>

      <h3>🏫 Top Schools</h3>
      {topSchools.map((s, i) => (
        <div key={i} style={card}>
          <h4>#{i + 1} - {s.name}</h4>
          <p>♻️ {s.total} kg</p>
          <p>🎁 Reward: {getReward(i)}</p>
        </div>
      ))}

      <h3 style={{ marginTop: 30 }}>👤 Top Representatives</h3>
      {topReps.map((r, i) => (
        <div key={i} style={card}>
          <h4>#{i + 1} - {r.name}</h4>
          <p>♻️ {r.total} kg</p>
          <p>🎁 Reward: {getReward(i)}</p>
        </div>
      ))}
    </div>
  );
}

function getReward(rank) {
  if (rank === 0) return "Gold Award";
  if (rank === 1) return "Silver Award";
  if (rank === 2) return "Bronze Award";
  return "";
}

const card = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
};