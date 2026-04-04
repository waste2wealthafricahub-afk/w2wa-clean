import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AssignSchools() {
  const [reps, setReps] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedRep, setSelectedRep] = useState("");
  const [selectedSchools, setSelectedSchools] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const repsSnapshot = await getDocs(collection(db, "reps"));
    const schoolsSnapshot = await getDocs(collection(db, "schools"));

    const repsList = [];
    const schoolsList = [];

    repsSnapshot.forEach(doc => {
      repsList.push({ id: doc.id, ...doc.data() });
    });

    schoolsSnapshot.forEach(doc => {
      schoolsList.push({ id: doc.id, ...doc.data() });
    });

    setReps(repsList);
    setSchools(schoolsList);
  }

  function toggleSchool(id) {
    if (selectedSchools.includes(id)) {
      setSelectedSchools(selectedSchools.filter(s => s !== id));
    } else {
      setSelectedSchools([...selectedSchools, id]);
    }
  }

  async function assignSchools() {
    if (!selectedRep) {
      alert("Select a rep first");
      return;
    }

    await updateDoc(doc(db, "reps", selectedRep), {
      assignedSchools: selectedSchools
    });

    alert("✅ Schools assigned successfully");
    setSelectedSchools([]);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏫 Assign Schools to Rep</h1>

      {/* SELECT REP */}
      <select
        value={selectedRep}
        onChange={(e) => setSelectedRep(e.target.value)}
      >
        <option value="">Select Rep</option>
        {reps.map(rep => (
          <option key={rep.id} value={rep.id}>
            {rep.fullName} ({rep.assignedArea})
          </option>
        ))}
      </select>

      {/* SCHOOL LIST */}
      <div style={{ marginTop: "20px" }}>
        <h3>Select Schools</h3>

        {schools.map(school => (
          <div key={school.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedSchools.includes(school.id)}
                onChange={() => toggleSchool(school.id)}
              />
              {school.name}
            </label>
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <button
        onClick={assignSchools}
        style={{ marginTop: "20px" }}
      >
        Assign Schools
      </button>
    </div>
  );
}