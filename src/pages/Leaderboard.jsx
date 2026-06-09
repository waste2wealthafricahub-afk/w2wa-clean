import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Leaderboard() {
  const [schoolRank, setSchoolRank] = useState([]);
  const [repRank, setRepRank] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // 🔹 Get schools
      const schoolSnap = await getDocs(collection(db, "schools"));
      const schools = schoolSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // 🔹 Get reps
      const repSnap = await getDocs(collection(db, "representatives"));
      const reps = repSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // 🔹 Get logs
      const logsSnap = await getDocs(collection(db, "pendingLogs"));
      const logs = logsSnap.docs.map((d) => d.data());

      // ======================
      // 🏫 SCHOOL RANKING
      // ======================
      const schoolData = schools.map((school) => {
        const schoolLogs = logs.filter(
          (l) => l.schoolId === school.id && l.status === "approved"
        );

        const totalWeight = schoolLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        const totalValue = schoolLogs.reduce(
          (sum, l) => sum + (l.totalValue || 0),
          0
        );

        return {
          name: school.schoolName,
          totalWeight,
          totalValue,
        };
      });

      schoolData.sort((a, b) => b.totalWeight - a.totalWeight);

      // ======================
      // 👤 REP RANKING
      // ======================
      const repData = reps.map((rep) => {
        const repLogs = logs.filter(
          (l) => l.repId === rep.id && l.status === "approved"
        );

        const totalWeight = repLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        return {
          name: rep.fullName,
          totalWeight,
        };
      });

      repData.sort((a, b) => b.totalWeight - a.totalWeight);

      setSchoolRank(schoolData);
      setRepRank(repData);
    };

    loadData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 Leaderboard</h2>

      {/* 🏫 Schools */}
      <h3>Top Schools</h3>
      {schoolRank.map((s, i) => (
        <div key={i} style={card}>
          <h4>
            #{i + 1} - {s.name}
          </h4>
          <p>♻️ {s.totalWeight} kg</p>
          <p>💰 ₦{s.totalValue}</p>
        </div>
      ))}

      {/* 👤 Reps */}
      <h3 style={{ marginTop: 30 }}>Top Representatives</h3>
      {repRank.map((r, i) => (
        <div key={i} style={card}>
          <h4>
            #{i + 1} - {r.name}
          </h4>
          <p>♻️ {r.totalWeight} kg</p>
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