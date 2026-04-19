import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SchoolDashboard() {
  const [club, setClub] = useState(null);
  const [programmeLaunch, setProgrammeLaunch] = useState(null);
  const [trainingCount, setTrainingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const schoolEmail = user.email;

        // 🔹 1. Get School
        const schoolSnap = await getDocs(
          query(collection(db, "schools"), where("email", "==", schoolEmail))
        );

        if (schoolSnap.empty) {
          console.log("No school found");
          setLoading(false);
          return;
        }

        const schoolDoc = schoolSnap.docs[0];
        const schoolId = schoolDoc.id;

        // 🔹 2. Get Club
        const clubSnap = await getDocs(
          query(collection(db, "clubs"), where("schoolId", "==", schoolId))
        );

        if (!clubSnap.empty) {
          setClub(clubSnap.docs[0].data());
        }

        // 🔹 3. Get Programme Launch
        const launchSnap = await getDocs(
          query(
            collection(db, "clubActivities"),
            where("schoolId", "==", schoolId),
            where("type", "==", "onboarding")
          )
        );

        if (!launchSnap.empty) {
          setProgrammeLaunch(launchSnap.docs[0].data());
        }

        // 🔹 4. Get Training Sessions
        const trainingSnap = await getDocs(
          query(
            collection(db, "trainingSessions"),
            where("schoolId", "==", schoolId)
          )
        );

        setTrainingCount(trainingSnap.size);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>School Dashboard</h2>

      {/* CLUB STATUS */}
      <div style={cardStyle}>
        <h3>Club Status</h3>
        <p>{club ? "Established ✅" : "Not Created ❌"}</p>
      </div>

      {/* PROGRAMME LAUNCH */}
      <div style={cardStyle}>
        <h3>Programme Launch</h3>
        <p>
          {programmeLaunch
            ? programmeLaunch.status || "Completed ✅"
            : "Pending ❌"}
        </p>
      </div>

      {/* TRAINING PROGRESS */}
      <div style={cardStyle}>
        <h3>Training Progress</h3>
        <p>{trainingCount} Sessions Completed</p>
      </div>
    </div>
  );
}

// Simple styling
const cardStyle = {
  background: "#f5f5f5",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px"
};