import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { paySchool } from "../services/payoutService";

export default function Payout() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      const snapshot = await getDocs(collection(db, "schools"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setSchools(list);
    };

    fetchSchools();
  }, []);

  const handlePayout = async () => {
    if (!selectedSchool || !amount) {
      alert("Select school and enter amount");
      return;
    }

    try {
      setLoading(true);

      await paySchool(selectedSchool, Number(amount));

      alert("Payout successful");

      setAmount("");
      setSelectedSchool("");
    } catch (error) {
      console.error(error);
      alert("Error processing payout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pay School</h2>

      <div style={{ marginBottom: "10px" }}>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button onClick={handlePayout} disabled={loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
    </div>
  );
}