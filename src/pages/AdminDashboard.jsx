import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function AdminDashboard() {
  const [schools, setSchools] = useState(0);
  const [reps, setReps] = useState(0);
  const [trainings, setTrainings] = useState(0);
  const [clubs, setClubs] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // SCHOOLS (from users collection)
      const userSnap = await getDocs(collection(db, "users"));

      let schoolCount = 0;

      userSnap.forEach((doc) => {
        const data = doc.data();
        if (data.role === "school") schoolCount++;
      });

      setSchools(schoolCount);

      // REPS (from reps collection)
      const repSnap = await getDocs(collection(db, "reps"));
      setReps(repSnap.size);

      // TRAININGS (from trainingSessions collection)
      const trainingSnap = await getDocs(collection(db, "trainingSessions"));
      setTrainings(trainingSnap.size);

      // CLUBS (from clubs collection)
      const clubSnap = await getDocs(collection(db, "clubs"));
      setClubs(clubSnap.size);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>Total Schools: {schools}</div>
        <div>Total Reps: {reps}</div>
        <div>Total Trainings: {trainings}</div>
        <div>Total Clubs: {clubs}</div>
      </div>
    </div>
  );
}
