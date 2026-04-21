import { Link } from "react-router-dom";

<h1>Admin Dashboard</h1>

<Link to="/admin-approvals">
  <button style={{ marginBottom: "20px", padding: "10px 15px" }}>
    Approve Schools
  </button>
</Link>
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
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
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({
    totalWaste: 0,
    totalValue: 0,
    topSchool: "-",
    highestValue: 0,
    average: 0,
  });
  const [counts, setCounts] = useState({
    schools: 0,
    reps: 0,
    trainings: 0,
    clubs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logsSnap = await getDocs(collection(db, "recyclingLogs"));
        const schoolsSnap = await getDocs(collection(db, "schools"));
        const repsSnap = await getDocs(collection(db, "reps"));
        const trainingsSnap = await getDocs(collection(db, "trainingSessions"));
        const clubsSnap = await getDocs(collection(db, "clubs"));

        // Dashboard counts
        setCounts({
          schools: schoolsSnap.size,
          reps: repsSnap.size,
          trainings: trainingsSnap.size,
          clubs: clubsSnap.size,
        });

        // Map school document IDs to school names
        const schoolMap = {};
schoolsSnap.forEach((doc) => {
  const data = doc.data();
  schoolMap[doc.id] =
    data.schoolName ||
    data.name ||
    "Unnamed School";
});

        // Aggregate recycling logs
        const schoolData = {};

        logsSnap.forEach((doc) => {
          const data = doc.data();
          const schoolId = data.schoolId;

          if (!schoolId) return;

          if (!schoolData[schoolId]) {
            schoolData[schoolId] = {
              schoolId,
              name: schoolMap[schoolId] || "Not Linked",
              waste: 0,
              value: 0,
            };
          }

          const waste =
            (Number(data.metal) || 0) +
            (Number(data.plastic) || 0) +
            (Number(data.paper) || 0);

          const value = Number(data.totalValue) || 0;

          schoolData[schoolId].waste += waste;
          schoolData[schoolId].value += value;
        });

        const result = Object.values(schoolData).sort(
          (a, b) => b.value - a.value
        );

        setSchools(result);

        // 📊 Compute analytics
        let totalWaste = 0;
        let totalValue = 0;
        let highestValue = 0;
        let topSchool = "-";

        result.forEach((school) => {
          totalWaste += school.waste;
          totalValue += school.value;

          if (school.value > highestValue) {
            highestValue = school.value;
            topSchool = school.name;
          }
        });

        const average =
          result.length > 0
            ? (totalWaste / result.length).toFixed(2)
            : 0;

        setStats({
          totalWaste,
          totalValue,
          topSchool,
          highestValue,
          average,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="Schools" value={counts.schools} />
        <StatCard title="Reps" value={counts.reps} />
        <StatCard title="Trainings" value={counts.trainings} />
        <StatCard title="Clubs" value={counts.clubs} />
      </div>

      {/* LEADERBOARD */}
      <h3>🏆 School Leaderboard</h3>
      <table
        width="100%"
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>#</th>
            <th>School</th>
            <th>Waste (kg)</th>
            <th>Value (₦)</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((s, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{s.name}</td>
              <td>{s.waste}</td>
              <td>₦{s.value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CHART */}
      <h3 style={{ marginTop: "30px" }}>📊 Waste Collection Chart</h3>
<div style={{ width: "100%", height: "400px", minHeight: "300px" }}>
  {schools.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={schools}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#2c7be5" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p>No data available</p>
  )}
</div>

      {/* ANALYTICS */}
      <h3 style={{ marginTop: "30px" }}>📈 Analytics</h3>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <StatCard title="Top School" value={stats.topSchool} />
        <StatCard
          title="Highest Value"
          value={`₦${stats.highestValue.toLocaleString()}`}
        />
        <StatCard
          title="Total Waste"
          value={`${stats.totalWaste} kg`}
        />
        <StatCard
          title="Average / School"
          value={`${stats.average} kg`}
        />
      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#f4f6f9",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        minWidth: "150px",
        textAlign: "center",
        flex: "1",
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}