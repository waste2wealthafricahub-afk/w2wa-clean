import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function HallOfFame() {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    loadWinners();
  }, []);

  async function loadWinners() {
    const snapshot = await getDocs(collection(db, "hallOfFame"));

    const list = [];
    snapshot.forEach(doc => {
      list.push(doc.data());
    });

    setWinners(list);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏆 Hall of Fame</h1>

      {winners.map((w, i) => (
        <div key={i} style={{
          padding: "10px",
          borderBottom: "1px solid #ccc"
        }}>
          <strong>{w.schoolName}</strong>
          <p>📅 {w.week}</p>
          <p>💰 ₦{w.totalValue}</p>
        </div>
      ))}
    </div>
  );
}