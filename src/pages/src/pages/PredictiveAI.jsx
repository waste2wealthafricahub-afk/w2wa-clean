import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PredictiveAI() {
  const [prediction, setPrediction] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const runPrediction = async () => {
      const logsSnap = await getDocs(collection(db, "pendingLogs"));
      const logs = logsSnap.docs.map(d => d.data());

      const approved = logs.filter(l => l.status === "approved");

      // 🗓 Group by month
      const monthly = {};

      approved.forEach(log => {
        if (!log.createdAt) return;

        const date = new Date(log.createdAt.seconds * 1000);
        const key = `${date.getFullYear()}-${date.getMonth()}`;

        if (!monthly[key]) monthly[key] = 0;

        monthly[key] += log.totalWeight || 0;
      });

      const values = Object.values(monthly);

      if (values.length < 2) {
        setPrediction({ message: "Not enough data yet" });
        return;
      }

      // 📈 Trend calculation
      const last = values[values.length - 1];
      const prev = values[values.length - 2];

      const trend = last - prev;
      const nextPrediction = last + trend;

      setPrediction({
        lastMonth: last,
        growth: trend,
        nextMonth: nextPrediction,
      });

      // ⚠️ Alerts
      const alertList = [];

      if (trend < 0) {
        alertList.push("⚠️ Waste collection is declining");
      }

      if (trend === 0) {
        alertList.push("⚠️ No growth detected");
      }

      if (trend > 0) {
        alertList.push("📈 Positive growth trend");
      }

      setAlerts(alertList);
    };

    runPrediction();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔮 Predictive AI</h2>

      {prediction.message && <p>{prediction.message}</p>}

      {!prediction.message && (
        <>
          <div style={card}>
            <p>Last Month: {prediction.lastMonth} kg</p>
            <p>Growth: {prediction.growth} kg</p>
            <h3>Next Month Prediction:</h3>
            <h2>{prediction.nextMonth} kg</h2>
          </div>

          <h3>Insights</h3>
          {alerts.map((a, i) => (
            <div key={i} style={alertCard}>
              {a}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px",
};

const alertCard = {
  padding: "10px",
  marginBottom: "10px",
  background: "#f4f6f8",
};