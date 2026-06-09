import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    loadClubs();
    loadSchools();
  }, []);

  const loadClubs = async () => {
    const snap = await getDocs(collection(db, "clubs"));
    setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadSchools = async () => {
    const snap = await getDocs(collection(db, "schools"));
    setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const createClub = async () => {
    if (!name || !schoolId) return;

    await addDoc(collection(db, "clubs"), {
      name,
      schoolId,
      createdAt: new Date()
    });

    setName("");
    setSchoolId("");
    loadClubs();
  };

  const getSchoolName = (id) => {
    const school = schools.find(s => s.id === id);
    return school ? school.name : "Unknown School";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>School Clubs</h2>

      <p style={{ color: "green" }}>
        Clubs drive environmental education in each school
      </p>

      <input
        placeholder="Club name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
        <option value="">Select School</option>
        {schools.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <button onClick={createClub}>Create Club</button>

      <ul>
        {clubs.map(c => (
          <li key={c.id}>
            {c.name} — ({getSchoolName(c.schoolId)})
          </li>
        ))}
      </ul>
    </div>
  );
}