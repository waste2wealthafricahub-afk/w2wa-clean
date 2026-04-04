import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getGrade } from "../utils/gradingSystem";

export default function GradingDashboard() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    loadGrades();
  }, []);

  async function loadGrades() {
    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const trainingSnapshot = await getDocs(collection(db, "trainingSessions"));
    const activitiesSnapshot = await getDocs(collection(db, "clubActivities"));

    const map = {};

    // ✅ Initialize schools (FIXED: no duplicate)
    schoolsSnapshot.forEach(doc => {
      map[doc.id] = {
        name: doc.data().name,
        waste: 0,
        sessions: 0,
        students: 0,
        activities: 0,
        grade: "F",
        isActiveClub: false
      };
    });

    // ♻️ Waste
    logsSnapshot.forEach(doc => {
      const d = doc.data();
      if (!map[d.schoolId]) return;

      map[d.schoolId].waste +=
        (d.plastic || 0) +
        (d.paper || 0) +
        (d.metal || 0);
    });

    // 📘 Training
    trainingSnapshot.forEach(doc => {
      const t = doc.data();
      if (!map[t.schoolId]) return;

      map[t.schoolId].sessions += 1;
      map[t.schoolId].students += t.studentsReached || 0;
    });

    // 🏫 Club Activities
    activitiesSnapshot.forEach(doc => {
      const a = doc.data();
      if (!map[a.schoolId]) return;

      map[a.schoolId].activities += 1;
    });

    // 🅰️ Grade + Active Club
    Object.values(map).forEach(s => {
      s.grade = getGrade(s);

      // ✅ Active club logic
      s.isActiveClub = s.activities >= 5;
    });

    setSchools(Object.values(map));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🅰️ School Grading</h1>

      {schools.map((s, i) => (
        <div
          key={i}
          style={{
            borderBottom: "1px solid #ccc",
            padding: "10px",
            background: s.grade === "A" ? "#e6ffe6" : ""
          }}
        >
          <strong>{s.name}</strong>

          <p>♻️ {s.waste} kg</p>
          <p>📘 {s.sessions} sessions</p>
          <p>👨‍🎓 {s.students} students</p>
          <p>🏫 Activities: {s.activities}</p>

          <h2>Grade: {s.grade}</h2>

          {/* ✅ THIS IS WHAT YOU WERE LOOKING FOR */}
          <p style={{ color: s.isActiveClub ? "green" : "red" }}>
            🏫 Active Club: {s.isActiveClub ? "Yes" : "No"}
          </p>
        </div>
      ))}
    </div>
  );
}