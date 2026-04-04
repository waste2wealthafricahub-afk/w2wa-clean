import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ComplianceDashboard() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    loadCompliance();
  }, []);

  async function loadCompliance() {
    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const trainingSnapshot = await getDocs(collection(db, "trainingSessions"));

    const schoolMap = {};

    // Initialize schools
    schoolsSnapshot.forEach(doc => {
      schoolMap[doc.id] = {
        name: doc.data().name,
        wasteEntries: 0,
        trainingSessions: 0,
        score: 0
      };
    });

    // Count waste activity
    logsSnapshot.forEach(doc => {
      const d = doc.data();
      if (!schoolMap[d.schoolId]) return;

      schoolMap[d.schoolId].wasteEntries += 1;
    });

    // Count training activity
    trainingSnapshot.forEach(doc => {
      const t = doc.data();
      if (!schoolMap[t.schoolId]) return;

      schoolMap[t.schoolId].trainingSessions += 1;
    });

    // Calculate score
    Object.values(schoolMap).forEach(s => {
      const trainingScore = Math.min(s.trainingSessions * 10, 50); // max 50
      const activityScore = Math.min(s.wasteEntries * 5, 50);      // max 50

      s.score = trainingScore + activityScore;
    });

    const result = Object.values(schoolMap).sort((a, b) => b.score - a.score);

    setSchools(result);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 School Compliance Dashboard</h1>

      {schools.map((s, i) => (
        <div key={i} style={{
          padding: "10px",
          borderBottom: "1px solid #ccc",
          background: i === 0 ? "#d4edda" : ""
        }}>
          <strong>
            {["🥇","🥈","🥉"][i] || `#${i + 1}`} — {s.name}
          </strong>

          <p>📘 Training Sessions: {s.trainingSessions}</p>
          <p>♻️ Waste Entries: {s.wasteEntries}</p>
          <p>🏆 Score: {s.score}%</p>
        </div>
      ))}
    </div>
  );
}