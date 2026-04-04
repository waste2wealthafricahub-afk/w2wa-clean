import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RevenueDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    avgPerSchool: 0,
    topSchool: "",
    topValue: 0
  });

  useEffect(() => {
    loadRevenue();
  }, []);

  async function loadRevenue() {
    const logsSnapshot = await getDocs(collection(db, "recyclingLogs"));
    const schoolsSnapshot = await getDocs(collection(db, "schools"));

    const schoolMap = {};
    let totalRevenue = 0;

    logsSnapshot.forEach(doc => {
      const d = doc.data();

      totalRevenue += d.totalValue || 0;

      if (!schoolMap[d.schoolId]) {
        schoolMap[d.schoolId] = 0;
      }

      schoolMap[d.schoolId] += d.totalValue || 0;
    });

    let topSchool = "";
    let topValue = 0;

    Object.entries(schoolMap).forEach(([id, val]) => {
      if (val > topValue) {
        topSchool = id;
        topValue = val;
      }
    });

    setData({
      totalRevenue,
      avgPerSchool: totalRevenue / schoolsSnapshot.size,
      topSchool,
      topValue
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>💰 Revenue Dashboard</h1>

      <p>💵 Total Revenue: ₦{data.totalRevenue}</p>
      <p>🏫 Avg per School: ₦{Math.round(data.avgPerSchool)}</p>
      <p>🏆 Top School ID: {data.topSchool}</p>
      <p>🔥 Top Value: ₦{data.topValue}</p>
    </div>
  );
}