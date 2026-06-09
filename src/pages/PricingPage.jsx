import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PricingPage() {
  const [prices, setPrices] = useState({
    plastic: "",
    paper: "",
    metal: "",
  });
  const [loading, setLoading] = useState(true);

  // Load current prices
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const snap = await getDoc(doc(db, "prices", "current"));
        if (snap.exists()) {
          setPrices(snap.data());
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    loadPrices();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setPrices({
      ...prices,
      [e.target.name]: e.target.value,
    });
  };

  // Save prices
  const handleSave = async (e) => {
    e.preventDefault();

    const data = {
      plastic: Number(prices.plastic) || 0,
      paper: Number(prices.paper) || 0,
      metal: Number(prices.metal) || 0,
    };

    try {
      await setDoc(doc(db, "prices", "current"), data);
      alert("Prices updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating prices");
    }
  };

  if (loading) return <p>Loading prices...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>💰 Pricing Management</h2>

      <form onSubmit={handleSave}>
        <input
          type="number"
          name="plastic"
          placeholder="Plastic price (₦/kg)"
          value={prices.plastic}
          onChange={handleChange}
          style={input}
        />

        <input
          type="number"
          name="paper"
          placeholder="Paper price (₦/kg)"
          value={prices.paper}
          onChange={handleChange}
          style={input}
        />

        <input
          type="number"
          name="metal"
          placeholder="Metal price (₦/kg)"
          value={prices.metal}
          onChange={handleChange}
          style={input}
        />

        <button type="submit" style={button}>
          Save Prices
        </button>
      </form>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const button = {
  width: "100%",
  padding: "12px",
  backgroundColor: "green",
  color: "white",
  border: "none",
  cursor: "pointer",
};