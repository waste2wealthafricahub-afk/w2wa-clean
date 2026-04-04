import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [logs, setLogs] = useState([]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch schools
        const schoolSnap = await getDocs(collection(db, "schools"));
        const schoolData = schoolSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchools(schoolData);

        // fetch logs
        const logSnap = await getDocs(collection(db, "recyclingLogs"));
        const logData = logSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLogs(logData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // totals
  const totalWaste = logs.reduce((sum, log) => sum + (log.wasteKg || 0), 0);
  const totalValue = logs.reduce((sum, log) => sum + (log.value || 0), 0);

  // leaderboard
  const schoolStats = {};

  logs.forEach((log) => {
    const name = log.schoolName || "Unknown";

    if (!schoolStats[name]) {
      schoolStats[name] = { totalWaste: 0, totalValue: 0 };
    }

    schoolStats[name].totalWaste += log.wasteKg || 0;
    schoolStats[name].totalValue += log.value || 0;
  });

  const leaderboard = Object.entries(schoolStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalWaste - a.totalWaste);

  // chart data
  const chartData = leaderboard.map((item) => ({
    name: item.name,
    waste: item.totalWaste,
  }));

  return (
    <div style={{ padding: "30px", background: "#f5f5f5", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>👩‍💼 Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={card}>🌍 Total Waste: {totalWaste} kg</div>
        <div style={card}>💰 Total Value: ₦{totalValue}</div>
        <div style={card}>🏫 Schools: {schools.length}</div>
        <div style={card}>📦 Submissions: {logs.length}</div>
      </div>

      {/* SCHOOLS */}
      <div style={box}>
        <h2>🏫 Registered Schools</h2>
        {schools.length === 0 ? (
          <p>No schools found</p>
        ) : (
          <ul>
            {schools.map((s) => (
              <li key={s.id}>{s.name || "Unnamed School"}</li>
            ))}
          </ul>
        )}
      </div>

      {/* RECENT */}
      <div style={box}>
        <h2>📊 Recent Submissions</h2>
        {logs.length === 0 ? (
          <p>No submissions yet</p>
        ) : (
          logs.slice(-5).map((log) => (
            <div key={log.id}>
              🏫 {log.schoolName || "Unknown"} — {log.wasteKg} kg — ₦{log.value}
            </div>
          ))
        )}
      </div>

      {/* PERFORMANCE */}
      <div style={box}>
        <h2>🏆 School Performance</h2>

        {leaderboard.length === 0 ? (
          <p>No data yet</p>
        ) : (
          leaderboard.map((school, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>
                {index + 1}. {school.name}
              </strong>
              <br />
              🌍 Waste: {school.totalWaste} kg  
              💰 Value: ₦{school.totalValue}
            </div>
          ))
        )}
      </div>

      {/* 📊 CHART */}
      <div style={box}>
        <h2>📊 Waste Collection Chart</h2>

        {chartData.length === 0 ? (
          <p>No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="waste" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}

// styles
const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  flex: 1,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const box = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
};