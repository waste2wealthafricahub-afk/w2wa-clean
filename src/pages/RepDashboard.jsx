import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RepDashboard() {
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({
    waste: 0,
    value: 0,
    submissions: 0
  });

  useEffect(() => {
    loadRepData();
  }, []);

  async function loadRepData() {
    const user = auth.currentUser;
    if (!user) return;

    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const submissionsSnapshot = await getDocs(collection(db, "taskSubmissions"));

    const mySchools = [];
    let waste = 0;
    let value = 0;
    let submissions = 0;

    schoolsSnapshot.forEach(doc => {
      const s = doc.data();
      if (s.repId === user.uid) {
        mySchools.push({ id: doc.id, ...s });
      }
    });

    logsSnapshot.forEach(doc => {
      const d = doc.data();
      if (mySchools.find(s => s.id === d.schoolId)) {
        waste += (d.plastic || 0) + (d.paper || 0) + (d.metal || 0);
        value += d.totalValue || 0;
      }
    });

    submissionsSnapshot.forEach(doc => {
      const s = doc.data();
      if (mySchools.find(sc => sc.id === s.schoolId)) {
        submissions++;
      }
    });

    setSchools(mySchools);
    setStats({ waste, value, submissions });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧑‍🔧 Rep Dashboard</h1>

      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "10px" }}>
        <p>🏫 My Schools: {schools.length}</p>
        <p>♻️ Waste: {stats.waste} kg</p>
        <p>💰 Value: ₦{stats.value}</p>
        <p>📘 Submissions: {stats.submissions}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Assigned Schools</h3>
        {schools.map((s, i) => (
          <div key={i}>
            <p>{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
