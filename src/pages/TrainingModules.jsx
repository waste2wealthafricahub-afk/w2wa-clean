import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function TrainingModules() {
  const [modules, setModules] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [title, setTitle] = useState("");
  const [clubId, setClubId] = useState("");

  useEffect(() => {
    loadModules();
    loadClubs();
  }, []);

  const loadModules = async () => {
    const snap = await getDocs(collection(db, "trainingModules"));
    setModules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadClubs = async () => {
    const snap = await getDocs(collection(db, "clubs"));
    setClubs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const createModule = async () => {
    if (!title || !clubId) return;

    await addDoc(collection(db, "trainingModules"), {
      title,
      clubId,
      createdAt: new Date()
    });

    setTitle("");
    setClubId("");
    loadModules();
  };

  const getClubName = (id) => {
    const club = clubs.find(c => c.id === id);
    return club ? club.name : "Unknown Club";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Training Modules</h2>

      <p style={{ color: "green" }}>
        Training builds environmental knowledge in student clubs
      </p>

      <input
        placeholder="Module title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
        <option value="">Select Club</option>
        {clubs.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <button onClick={createModule}>Add Module</button>

      <ul>
        {modules.map(m => (
          <li key={m.id}>
            {m.title} — ({getClubName(m.clubId)})
          </li>
        ))}
      </ul>
    </div>
  );
}