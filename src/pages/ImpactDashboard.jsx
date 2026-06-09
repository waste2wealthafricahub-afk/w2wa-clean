import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function ImpactDashboard() {
const [stats, setStats] = useState({
plastic: 0,
paper: 0,
metal: 0,
totalValue: 0,
});

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchImpact = async () => {
try {
const snapshot = await getDocs(collection(db, "recyclingLogs"));

    let plastic = 0;
    let paper = 0;
    let metal = 0;
    let totalValue = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      plastic += data.plastic || 0;
      paper += data.paper || 0;
      metal += data.metal || 0;
      totalValue += data.totalValue || 0;
    });

    setStats({ plastic, paper, metal, totalValue });
  } catch (err) {
    console.error(err);
    setError("Failed to load impact data");
  } finally {
    setLoading(false);
  }
};

fetchImpact();

}, []);

const cardStyle = {
background: "#f5f5f5",
padding: "20px",
borderRadius: "10px",
textAlign: "center",
boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

if (loading) {
return <div style={{ padding: "20px" }}>Loading impact data...</div>;
}

if (error) {
return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
}

return (
<div style={{ padding: "20px" }}>
<h1 style={{ marginBottom: "20px" }}>
Environmental Impact Dashboard
</h1>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
    }}
  >
    <div style={cardStyle}>
      <h3>Plastic Collected</h3>
      <p>{stats.plastic} kg</p>
    </div>

    <div style={cardStyle}>
      <h3>Paper Collected</h3>
      <p>{stats.paper} kg</p>
    </div>

    <div style={cardStyle}>
      <h3>Metal Collected</h3>
      <p>{stats.metal} kg</p>
    </div>

    <div style={cardStyle}>
      <h3>Total Value Generated</h3>
      <p>₦ {stats.totalValue}</p>
    </div>

    <div style={cardStyle}>
      <h3>Estimated CO₂ Saved</h3>
      <p>{Math.round(stats.plastic * 1.5)} kg</p>
    </div>
  </div>
</div>

);
}