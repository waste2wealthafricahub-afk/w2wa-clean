import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");

  useEffect(() => {
    loadActivities();
    loadModules();
  }, []);

  const loadActivities = async () => {
    const snap = await getDocs(collection(db, "programmeActivities"));
    setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadModules = async () => {
    const snap = await getDocs(collection(db, "trainingModules"));
    setModules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const createActivity = async () => {
    if (!title || !moduleId) return;

    await addDoc(collection(db, "programmeActivities"), {
      title,
      moduleId,
      createdAt: new Date()
    });

    setTitle("");
    setModuleId("");
    loadActivities();
  };

  const getModuleName = (id) => {
    const mod = modules.find(m => m.id === id);
    return mod ? mod.title : "Unknown Module";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Activities</h2>

      <p style={{ color: "green" }}>
        Activities represent real environmental action by students
      </p>

      <input
        placeholder="Activity"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
        <option value="">Select Training Module</option>
        {modules.map(m => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      <button onClick={createActivity}>Add Activity</button>

      <ul>
        {activities.map(a => (
          <li key={a.id}>
            {a.title} — ({getModuleName(a.moduleId)})
          </li>
        ))}
      </ul>
    </div>
  );
}