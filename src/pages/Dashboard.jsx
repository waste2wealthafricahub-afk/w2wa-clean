import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const [plastic, setPlastic] = useState("");
  const [paper, setPaper] = useState("");
  const [metal, setMetal] = useState("");

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ WAIT FOR AUTH PROPERLY
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login");
        return;
      }

      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  // ✅ LOAD DATA AFTER USER IS READY
  useEffect(() => {
    if (!user) return;

    loadData();
  }, [user]);

  async function loadData() {
    try {
      const q = query(
        collection(db, "recyclingLogs"),
        where("schoolId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      let sum = 0;

      snapshot.forEach(doc => {
        const d = doc.data();
        sum += (d.plastic || 0) + (d.paper || 0) + (d.metal || 0);
      });

      setTotal(sum);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function submitWaste() {
    if (!plastic && !paper && !metal) {
      alert("Enter waste values");
      return;
    }

    try {
      await addDoc(collection(db, "recyclingLogs"), {
        schoolId: user.uid,
        plastic: Number(plastic) || 0,
        paper: Number(paper) || 0,
        metal: Number(metal) || 0,
        createdAt: new Date()
      });

      alert("Waste submitted!");

      setPlastic("");
      setPaper("");
      setMetal("");

      loadData();

    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading Dashboard...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏫 School Dashboard</h1>

      <input
        placeholder="Plastic (kg)"
        value={plastic}
        onChange={(e) => setPlastic(e.target.value)}
      />

      <input
        placeholder="Paper (kg)"
        value={paper}
        onChange={(e) => setPaper(e.target.value)}
      />

      <input
        placeholder="Metal (kg)"
        value={metal}
        onChange={(e) => setMetal(e.target.value)}
      />

      <h3>💰 Total Waste: {total} kg</h3>

      <button onClick={submitWaste}>Submit Waste</button>

      <br /><br />

      <button onClick={() => navigate("/checklist")}>
        📅 Weekly Tasks
      </button>
    </div>
  );
}


