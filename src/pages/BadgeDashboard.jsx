import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { calculateBadges } from "../utils/badgeEngine";export default function BadgeDashboard() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    loadBadges();
  }, []);
async function saveBadges(schoolId, newBadges, existingBadges = []) {
  // Prevent unnecessary updates
  const isSame =
    JSON.stringify(newBadges.sort()) ===
    JSON.stringify((existingBadges || []).sort());

  if (isSame) return;

  try {
    await updateDoc(doc(db, "schools", schoolId), {
      badges: newBadges
    });
  } catch (error) {
    console.error("Badge save error:", error);
  }
}
  async function loadBadges() {
    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const trainingSnapshot = await getDocs(collection(db, "trainingSessions"));

    const schoolMap = {};
const schoolData = {
  waste: s.waste,
  sessions: s.sessions,
  students: s.students,
  activities: s.activities
};

const badges = calculateBadges(schoolData);
    // Init
    schoolsSnapshot.forEach(doc => {
     const data = doc.data();

schoolMap[doc.id] = {
  id: doc.id,
  name: data.name,
  waste: 0,
  students: 0,
  sessions: 0,
  badges: data.badges || [] // existing badges
};
    });

    // Waste
    logsSnapshot.forEach(doc => {
      const d = doc.data();
      if (!schoolMap[d.schoolId]) return;

      const waste =
        (d.plastic || 0) +
        (d.paper || 0) +
        (d.metal || 0);

      schoolMap[d.schoolId].waste += waste;
    });

    // Training
    trainingSnapshot.forEach(doc => {
      const t = doc.data();
      if (!schoolMap[t.schoolId]) return;

      schoolMap[t.schoolId].students += t.studentsReached || 0;
      schoolMap[t.schoolId].sessions += 1;
    });

    // Calculate badges
    for (let s of Object.values(schoolMap)) {
  const newBadges = calculateBadges(s);

  await saveBadges(s.id, newBadges, s.badges);

  s.badges = newBadges;
}
    setSchools(Object.values(schoolMap));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏅 School Badges</h1>

      {schools.map((s, i) => (
        <div key={i} style={{
          padding: "10px",
          borderBottom: "1px solid #ccc"
        }}>
          <strong>{s.name}</strong>

          <p>♻️ {s.waste} kg</p>
          <p>👨‍🎓 {s.students} students</p>

          <div>
            {s.badges.map((b, idx) => (
              <span key={idx} style={{ marginRight: "10px" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}