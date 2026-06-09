import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RepPerformance() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        // Get logs
        const logsSnap = await getDocs(collection(db, "recyclingLogs"));
        const logs = logsSnap.docs.map((doc) => doc.data());

        // Get users (reps)
        const usersSnap = await getDocs(collection(db, "users"));
        const users = {};
        usersSnap.docs.forEach((doc) => {
          users[doc.id] = doc.data();
        });

        const repMap = {};

        logs.forEach((log) => {
          const repId = log.submittedBy;

          if (!repId) return;

          if (!repMap[repId]) {
            repMap[repId] = {
              name: users[repId]?.name || "Unknown Rep",
              totalWeight: 0,
              totalValue: 0,
            };
          }

          repMap[repId].totalWeight += log.totalWeight || 0;
          repMap[repId].totalValue += log.totalValue || 0;
        });

        const result = Object.values(repMap).sort(
          (a, b) => b.totalWeight - a.totalWeight
        );

        setRanking(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rep Performance Dashboard</h2>

      {ranking.length === 0 ? (
        <p>No performance data yet</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Rep</th>
              <th>Waste (kg)</th>
              <th>Value (₦)</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((rep, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{rep.name}</td>
                <td>{rep.totalWeight}</td>
                <td>{rep.totalValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}