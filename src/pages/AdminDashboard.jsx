import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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

      // ===== USERS =====
      const userSnap = await getDocs(collection(db, "users"));

      let schoolCount = 0;
      const schoolNameMap = {};

      userSnap.forEach((doc) => {
        const data = doc.data();

        if (data.role === "school") {
          schoolCount++;
          schoolNameMap[doc.id] = data.name || "Unnamed School";
        }
      });

      setSchools(schoolCount);

      // ===== OTHER COUNTS =====
      const repSnap = await getDocs(collection(db, "reps"));
      const trainingSnap = await getDocs(collection(db, "trainingSessions"));
      const clubSnap = await getDocs(collection(db, "clubs"));

      setReps(repSnap.size);
      setTrainings(trainingSnap.size);
      setClubs(clubSnap.size);

      // ===== WASTE =====
      const wasteSnap = await getDocs(collection(db, "recyclingLogs"));

      let waste = 0;
      let value = 0;

      const schoolStats = {};

      wasteSnap.forEach((doc) => {
        const data = doc.data();

        const schoolId = data.schoolId?.trim();
        if (!schoolId) return;

        const plastic = Number(data.plastic || 0);
        const paper = Number(data.paper || 0);
        const metal = Number(data.metal || 0);

        const totalKg = plastic + paper + metal;

        const itemValue =
          plastic * 150 +
          paper * 100 +
          metal * 300;

        waste += totalKg;
        value += itemValue;

        if (!schoolStats[schoolId]) {
          schoolStats[schoolId] = {
            schoolId,
            name: schoolNameMap[schoolId] || "⚠️ Not Linked",
            waste: 0,
            value: 0,
          };
        }

        schoolStats[schoolId].waste += totalKg;
        schoolStats[schoolId].value += itemValue;
      });

      setTotalWaste(waste);
      setTotalValue(value);

      const leaderboardArray = Object.values(schoolStats).sort(
        (a, b) => b.value - a.value
      );

      setLeaderboard(leaderboardArray);

    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ===== SAFE CHART DATA =====
  const chartData = leaderboard.length
    ? leaderboard.map((s) => ({
        name: s.name,
        waste: s.waste,
      }))
    : [];

  const cardStyle = {
    padding: "15px",
    background: "#f5f7fb",
    borderRadius: "10px",
    width: "180px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* ===== CARDS ===== */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {[
          { label: "Schools", value: schools },
          { label: "Reps", value: reps },
          { label: "Trainings", value: trainings },
          { label: "Clubs", value: clubs },
        ].map((item) => (
          <div key={item.label} style={cardStyle}>
            <h4>{item.label}</h4>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== LEADERBOARD ===== */}
      <h2 style={{ marginTop: "40px" }}>🏆 School Leaderboard</h2>

      <table
        style={{
          width: "100%",
          marginTop: "10px",
          borderCollapse: "collapse",
        }}
      >
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
                background: index === 0 ? "#ffeaa7" : "white",
              }}
            >
              <td>
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : index + 1}
              </td>
              <td>{school.name}</td>
              <td>{school.waste}</td>
              <td>₦{school.value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== CHART ===== */}
      <h2 style={{ marginTop: "40px" }}>📊 Waste Collection Chart</h2>

      <div style={{ width: "100%", height: 300 }}>
        {chartData.length ? (
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="waste" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available</p>
        )}
      </div>

      {/* ===== ANALYTICS ===== */}
      <h2 style={{ marginTop: "40px" }}>📈 Analytics</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
        <div style={cardStyle}>
          <h4>Top School</h4>
          <p>{leaderboard[0]?.name || "-"}</p>
        </div>

        <div style={cardStyle}>
          <h4>Highest Value</h4>
          <p>₦{leaderboard[0]?.value?.toLocaleString() || 0}</p>
        </div>

        <div style={cardStyle}>
          <h4>Total Waste</h4>
          <p>{totalWaste} kg</p>
        </div>

        <div style={cardStyle}>
          <h4>Average / School</h4>
          <p>
            {leaderboard.length
              ? (totalWaste / leaderboard.length).toFixed(1)
              : 0}{" "}
            kg
          </p>
        </div>
      </div>

      {/* ===== SYSTEM STATUS ===== */}
      <div style={{ marginTop: "30px" }}>
        <h3>System Status</h3>
        <p>Total Waste: {totalWaste} kg</p>
        <p>Total Value: ₦{totalValue.toLocaleString()}</p>
      </div>
    </div>
  );
}