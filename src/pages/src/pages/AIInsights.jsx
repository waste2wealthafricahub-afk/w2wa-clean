import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AIInsights() {
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

      // 🔥 Insight 1: Inactive schools
      const inactiveSchools = schools.filter(s => {
        const hasActivity = approvedLogs.some(l => l.schoolId === s.id);
        return !hasActivity;
      });

      if (inactiveSchools.length > 0) {
        insightsList.push(
          `⚠️ ${inactiveSchools.length} schools have no activity. Consider engagement.`
        );
      }

      // 🔥 Insight 2: Top performing school
      const schoolStats = schools.map(s => {
        const total = approvedLogs
          .filter(l => l.schoolId === s.id)
          .reduce((sum, l) => sum + (l.totalWeight || 0), 0);

        return { name: s.schoolName, total };
      });

      schoolStats.sort((a, b) => b.total - a.total);

      if (schoolStats.length > 0) {
        insightsList.push(
          `🏫 Top school: ${schoolStats[0].name} (${schoolStats[0].total} kg)`
        );
      }

      // 🔥 Insight 3: Underperforming reps
      const repStats = reps.map(r => {
        const total = approvedLogs
          .filter(l => l.repId === r.id)
          .reduce((sum, l) => sum + (l.totalWeight || 0), 0);

        return { name: r.fullName, total };
      });

      const lowReps = repStats.filter(r => r.total < 50);

      if (lowReps.length > 0) {
        insightsList.push(
          `👤 ${lowReps.length} reps are underperforming (<50kg)`
        );
      }

      // 🔥 Insight 4: Total system output
      const totalWeight = approvedLogs.reduce(
        (sum, l) => sum + (l.totalWeight || 0),
        0
      );

      insightsList.push(
        `📊 Total waste processed: ${totalWeight} kg`
      );

      setInsights(insightsList);
    };

    generateInsights();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🧠 AI Insights</h2>

      {insights.length === 0 && <p>No insights yet</p>}

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