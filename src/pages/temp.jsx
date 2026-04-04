import { useState } from "react";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function SchoolDashboard() {
  const [wasteKg, setWasteKg] = useState("");
  const [wasteType, setWasteType] = useState("plastic");
  const [loading, setLoading] = useState(false);

  // 💰 pricing per waste type
  const priceMap = {
    plastic: 200,
    organic: 100,
    metal: 300,
  };

  const value = wasteKg ? wasteKg * priceMap[wasteType] : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!wasteKg) {
      alert("Enter waste amount");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        return;
      }

      // 🔥 get user record
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        alert("User record not found");
        return;
      }

      const userData = userDoc.data();

      // 🔥 get school record
      const schoolDoc = await getDoc(doc(db, "schools", userData.schoolId));

      const schoolName = schoolDoc.exists()
        ? schoolDoc.data().name
        : "Unknown School";

      // 🔥 save submission
      await addDoc(collection(db, "recyclingLogs"), {
        schoolId: userData.schoolId,
        schoolName: schoolName,
        wasteKg: Number(wasteKg),
        wasteType: wasteType,
        value: value,
        createdAt: new Date(),
      });

      alert("✅ Submission successful!");

      setWasteKg("");

    } catch (error) {
      console.error(error);
      alert("Error submitting data");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>🏫 School Dashboard</h2>

      <form onSubmit={handleSubmit}>
        
        {/* Waste Input */}
        <input
          type="number"
          placeholder="Enter waste (kg)"
          value={wasteKg}
          onChange={(e) => setWasteKg(e.target.value)}
        />

        <br /><br />

        {/* Waste Type */}
        <select value={wasteType} onChange={(e) => setWasteType(e.target.value)}>
          <option value="plastic">Plastic</option>
          <option value="organic">Organic</option>
          <option value="metal">Metal</option>
        </select>

        <br /><br />

        {/* Value Preview */}
        <strong>💰 Estimated Value: ₦{value}</strong>

        <br /><br />

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Waste"}
        </button>

      </form>
    </div>
  );
}