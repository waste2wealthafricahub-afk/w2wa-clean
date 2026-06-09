import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Badges() {
  const [repBadges, setRepBadges] = useState([]);

  useEffect(() => {
    const loadBadges = async () => {
      const repsSnap = await getDocs(collection(db, "representatives"));
      const logsSnap = await getDocs(collection(db, "pendingLogs"));

      const reps = repsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      const logs = logsSnap.docs.map(d => d.data());

      const data = reps.map(rep => {
        const repLogs = logs.filter(l => l.repId === rep.id);

        const totalWeight = repLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        const totalEntries = repLogs.length;

        const badges = [];

        // 🎯 Badge rules
        if (totalWeight >= 1000) badges.push("♻️ Waste Champion");
        if (totalEntries >= 20) badges.push("🔥 Active Recycler");

        return {
          name: rep.fullName,
          totalWeight,
          totalEntries,
          badges,
        };
      });

      // 🏆 Top Performer (rank 1)
      const sorted = [...data].sort(
        (a, b) => b.totalWeight - a.totalWeight
      );

      if (sorted.length > 0) {
        sorted[0].badges.push("🏆 Top Performer");
      }

      setRepBadges(sorted);
    };

    loadBadges();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏅 Badges</h2>

      {repBadges.map((rep, i) => (
        <div key={i} style={card}>
          <h3>{rep.name}</h3>
          <p>♻️ {rep.totalWeight} kg</p>
          <p>🧾 {rep.totalEntries} entries</p>

          <p>
            {rep.badges.length > 0
              ? rep.badges.join(" | ")
              : "No badges yet"}
          </p>
        </div>
      ))}
    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
};