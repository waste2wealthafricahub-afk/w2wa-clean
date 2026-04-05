import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [schools, setSchools] = useState(0);
  const [reps, setReps] = useState(0);
  const [trainings, setTrainings] = useState(0);
  const [clubs, setClubs] = useState(0);
  const [totalWaste, setTotalWaste] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const fetchAllData = async () => {
    try {
      console.log("FETCH RUNNING...");

      // ===== SCHOOLS =====
      const userSnap = await getDocs(collection(db, "users"));
      let schoolCount = 0;

      userSnap.forEach((doc) => {
        if (doc.data().role === "school") {
          schoolCount++;
        }
      });

      setSchools(schoolCount);

      // ===== REPS =====
      const repSnap = await getDocs(collection(db, "reps"));
      console.log("REPS:", repSnap.size);
      setReps(repSnap.size);

      // ===== TRAININGS =====
      const trainingSnap = await getDocs(collection(db, "trainingSessions"));
      console.log("TRAININGS:", trainingSnap.size);
      setTrainings(trainingSnap.size);

      // ===== CLUBS =====
      const clubSnap = await getDocs(collection(db, "clubs"));
      console.log("CLUBS:", clubSnap.size);
      setClubs(clubSnap.size);

      // ===== WASTE SECTION =====
console.log("ABOUT TO FETCH WASTE...");

// 🔴 THIS IS WHAT YOU WERE MISSING
const wasteSnap = await getDocs(collection(db, "recyclingLogs"));

console.log("WASTE DOCS:", wasteSnap.size);

let waste = 0;
let value = 0;

const priceMap = {
  plastic: 150,
  paper: 100,
  metal: 300,
};

wasteSnap.forEach((doc) => {
  const data = doc.data();

  const plastic = Number(data.plastic || 0);
  const paper = Number(data.paper || 0);
  const metal = Number(data.metal || 0);

  waste += plastic + paper + metal;

  value +=
    plastic * priceMap.plastic +
    paper * priceMap.paper +
    metal * priceMap.metal;
});

console.log("TOTAL WASTE:", waste);
console.log("TOTAL VALUE:", value);

setTotalWaste(waste);
setTotalValue(value);
// ===== END =====

    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>Schools: {schools}</div>
        <div>Reps: {reps}</div>
        <div>Trainings: {trainings}</div>
        <div>Clubs: {clubs}</div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>System Status</h3>
        <p>Total Waste: {totalWaste} kg</p>
        <p>Total Value: ₦{totalValue}</p>
      </div>
    </div>
  );
}