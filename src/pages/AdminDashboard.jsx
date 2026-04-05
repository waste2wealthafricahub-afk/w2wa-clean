import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function AdminDashboard() {
  const [schools, setSchools] = useState(0);
  const [reps, setReps] = useState(0);
  const [trainings, setTrainings] = useState(0);
  const [clubs, setClubs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      console.log("FETCH RUNNING...");

      // ✅ USERS → count schools
      const userSnap = await getDocs(collection(db, "users"));
      let schoolCount = 0;

      userSnap.forEach((doc) => {
        const data = doc.data();
        if (data.role === "school") schoolCount++;
      });

      setSchools(schoolCount);

      // ✅ REPS
      const repSnap = await getDocs(collection(db, "reps"));
      console.log("REPS:", repSnap.size);
      setReps(repSnap.size);

      // ✅ TRAININGS (CHECK NAME IN FIREBASE IF 0)
      const trainingSnap = await getDocs(collection(db, "trainingSessions"));
      console.log("TRAININGS:", trainingSnap.size);
      setTrainings(trainingSnap.size);

      // ✅ CLUBS
      const clubSnap = await getDocs(collection(db, "clubs"));
      console.log("CLUBS:", clubSnap.size);
      setClubs(clubSnap.size);

      setLoading(false);

    } catch (error) {
      console.error("Dashboard Error:", error);
      setLoading(false);
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* ✅ SUMMARY CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginTop: "20px"
      }}>
        <Card title="Schools" value={schools} />
        <Card title="Reps" value={reps} />
        <Card title="Trainings" value={trainings} />
        <Card title="Clubs" value={clubs} />
      </div>

      {/* ✅ STATUS MESSAGE */}
      <div style={{ marginTop: "30px" }}>
        <h3>System Status</h3>
        <p>
          {reps === 0 && "⚠ No reps found. "}
          {trainings === 0 && "⚠ No trainings recorded. "}
          {clubs === 0 && "⚠ No clubs created. "}
        </p>
      </div>
    </div>
  );
}

// ✅ SIMPLE CARD COMPONENT
function Card({ title, value }) {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "10px",
      background: "#f5f5f5",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}
