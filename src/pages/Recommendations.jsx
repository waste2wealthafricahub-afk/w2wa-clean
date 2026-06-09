import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const generateRecommendations = async () => {
      const schoolSnap = await getDocs(collection(db, "schools"));
      const repSnap = await getDocs(collection(db, "representatives"));
      const logsSnap = await getDocs(collection(db, "pendingLogs"));

      const schools = schoolSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reps = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const logs = logsSnap.docs.map(d => d.data());

      const approved = logs.filter(l => l.status === "approved");

      const recommendations = [];

      // 🔹 1. Inactive schools
      const inactiveSchools = schools.filter(s => {
        return !approved.some(l => l.schoolId === s.id);
      });

      if (inactiveSchools.length > 0) {
        recommendations.push(
          `⚠️ ${inactiveSchools.length} inactive schools. Schedule engagement visits.`
        );
      }

      // 🔹 2. Top performing schools
      const schoolStats = schools.map(s => {
        const total = approved
          .filter(l => l.schoolId === s.id)
          .reduce((sum, l) => sum + (l.totalWeight || 0), 0);

        return { name: s.schoolName, total };
      });

      schoolStats.sort((a, b) => b.total - a.total);

      if (schoolStats.length > 0 && schoolStats[0].total > 200) {
        recommendations.push(
          `🏫 ${schoolStats[0].name} is performing strongly. Consider assigning more reps.`
        );
      }

      // 🔹 3. Underperforming reps
      const repStats = reps.map(r => {
        const total = approved
          .filter(l => l.repId === r.id)
          .reduce((sum, l) => sum + (l.totalWeight || 0), 0);

        return { name: r.fullName, total };
      });

      const weakReps = repStats.filter(r => r.total < 50);

      if (weakReps.length > 0) {
        recommendations.push(
          `👤 ${weakReps.length} reps underperforming. Provide training or reassignment.`
        );
      }

      // 🔹 4. High-performing reps
      const strongReps = repStats.filter(r => r.total > 200);

      if (strongReps.length > 0) {
        recommendations.push(
          `🔥 ${strongReps.length} reps are highly productive. Increase their wallet limits.`
        );
      }

      // 🔹 5. System growth
      const totalWeight = approved.reduce(
        (sum, l) => sum + (l.totalWeight || 0),
        0
      );

      if (totalWeight < 500) {
        recommendations.push(
          "📉 Overall waste is low. Increase awareness campaigns."
        );
      } else {
        recommendations.push(
          "📈 System performing well. Focus on scaling operations."
        );
      }

      setRecs(recommendations);
    };

    generateRecommendations();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎯 Smart Recommendations</h2>

      {recs.length === 0 && <p>No recommendations yet</p>}

      {recs.map((rec, i) => (
        <div key={i} style={card}>
          {rec}
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