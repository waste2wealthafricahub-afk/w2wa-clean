import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Insights() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const generateInsights = async () => {
      const schoolSnap = await getDocs(collection(db, "schools"));
      const repSnap = await getDocs(collection(db, "representatives"));
      const logsSnap = await getDocs(collection(db, "pendingLogs"));

      const schools = schoolSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reps = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const logs = logsSnap.docs.map(d => d.data());

      const approvedLogs = logs.filter(l => l.status === "approved");

      const insightsList = [];

      // 🔹 Insight 1: Inactive schools
      schools.forEach(s => {
        const hasActivity = approvedLogs.some(l => l.schoolId === s.id);
        if (!hasActivity) {
          insightsList.push(`⚠️ ${s.schoolName} has no activity`);
        }
      });

      // 🔹 Insight 2: Low performing reps
      reps.forEach(r => {
        const repLogs = approvedLogs.filter(l => l.repId === r.id);
        if (repLogs.length < 3) {
          insightsList.push(`⚠️ ${r.fullName} is underperforming`);
        }
      });

      // 🔹 Insight 3: Top performer
      const repPerformance = reps.map(r => {
        const total = approvedLogs
          .filter(l => l.repId === r.id)
          .reduce((sum, l) => sum + (l.totalWeight || 0), 0);

        return { name: r.fullName, total };
      });

      repPerformance.sort((a, b) => b.total - a.total);

      if (repPerformance.length > 0) {
        insightsList.push(
          `🔥 Top Rep: ${repPerformance[0].name} (${repPerformance[0].total} kg)`
        );
      }

      // 🔹 Insight 4: Total system performance
      const totalWeight = approvedLogs.reduce(
        (sum, l) => sum + (l.totalWeight || 0),
        0
      );

      insightsList.push(`📊 Total Waste Collected: ${totalWeight} kg`);

      setInsights(insightsList);
    };

    generateInsights();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🧠 AI Insights</h2>

      {insights.map((insight, i) => (
        <div key={i} style={card}>
          {insight}
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