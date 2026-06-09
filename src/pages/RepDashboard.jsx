import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function RepDashboard() {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // ✅ Get rep directly (no searching)
      const repRef = doc(db, "representatives", user.uid);
      const repSnap = await getDoc(repRef);

      if (!repSnap.exists()) return;

      const assignedIds = repSnap.data().assignedSchoolIds || [];

      // Fetch schools
      const schoolsSnap = await getDocs(collection(db, "schools"));

      const filtered = schoolsSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((s) => assignedIds.includes(s.id));

      setSchools(filtered);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rep Dashboard</h2>

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/waste-entry")}>
          Enter Waste
        </button>

        <button onClick={() => navigate("/wallet")}>
          Wallet
        </button>
<button onClick={() => navigate("/notifications")}>
  Notifications 🔔
</button>
        {/* ✅ THIS IS YOUR STEP 3 BUTTON */}
        <button onClick={() => navigate("/rep-performance")}>
          View Performance
        </button>
      </div>

      <h3>My Schools</h3>

      {schools.length === 0 && <p>No assigned schools</p>}

      {schools.map((school) => (
        <div key={school.id}>
          <p>{school.schoolName}</p>
        </div>
      ))}
    </div>
  );
}