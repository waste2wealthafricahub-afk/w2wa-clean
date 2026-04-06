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
const [leaderboard, setLeaderboard] = useState([]);

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
// ===== GET SCHOOL NAMES =====
const schoolSnap = await getDocs(collection(db, "schools"));

const schoolMap = {};

schoolSnap.forEach((doc) => {
  const data = doc.data();
  schoolMap[doc.id] = data.name || "Unnamed School";
});

console.log("SCHOOL MAP:", schoolMap);
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
// ===== LEADERBOARD =====
console.log("BUILDING LEADERBOARD...");

const schoolStats = {};

wasteSnap.forEach((doc) => {
  const data = doc.data();
  const schoolId = data.schoolId || "Unknown";
const schoolName = schoolMap[schoolId] || "Unknown School";
  const plastic = Number(data.plastic || 0);
  const paper = Number(data.paper || 0);
  const metal = Number(data.metal || 0);

  const totalKg = plastic + paper + metal;

  const itemValue =
    plastic * 150 +
    paper * 100 +
    metal * 300;

  if (!schoolStats[schoolId]) {
  schoolStats[schoolId] = {
  schoolId,
  name: schoolName,
  waste: 0,
  value: 0,
};
  }

  schoolStats[schoolId].waste += totalKg;
  schoolStats[schoolId].value += itemValue; // ✅ FIXED
});

// convert to array
const leaderboardArray = Object.values(schoolStats);

// sort by value (highest first)
leaderboardArray.sort((a, b) => b.value - a.value);

console.log("LEADERBOARD:", leaderboardArray);

setLeaderboard(leaderboardArray);
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
<h2 style={{ marginTop: "40px" }}>🏆 School Leaderboard</h2>

<table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
  <thead>
    <tr style={{ background: "#f0f0f0" }}>
      <th>#</th>
      <th>School</th>
      <th>Waste (kg)</th>
      <th>Value (₦)</th>
    </tr>
  </thead>

  <tbody>
    {leaderboard.map((school, index) => (
      <tr
  key={school.schoolId}
  style={{
    textAlign: "center",
    background: index === 0 ? "#ffe082" : "white"
  }}
>        <td>{index + 1}</td>
        <td>{school.name}</td>
        <td>{school.waste}</td>
        <td>₦{school.value.toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</table>

      <div style={{ marginTop: "30px" }}>
        <h3>System Status</h3>
        <p>Total Waste: {totalWaste} kg</p>
        <p>Total Value: ₦{totalValue}</p>
      <h2 style={{ marginTop: "40px" }}>🏆 School Leaderboard</h2>

{leaderboard.length === 0 ? (
  <p>No data yet...</p>
) : (
  <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f0f0f0" }}>
        <th>#</th>
        <th>School</th>
        <th>Waste (kg)</th>
        <th>Value (₦)</th>
      </tr>
    </thead>

    <tbody>
      {leaderboard.map((school, index) => (
        <tr
          key={school.schoolId}
          style={{
            textAlign: "center",
            background: index === 0 ? "#ffe082" : "white"
          }}
        >
          <td>
            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
          </td>
          <td>{school.name || school.schoolId}</td>
          <td>{school.waste}</td>
          <td>₦{school.value.toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
      </div>
    </div>
  );
}