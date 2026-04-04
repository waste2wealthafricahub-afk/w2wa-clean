import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { getUserSchool } from "../utils/getUserSchool";

// 📸 Storage
import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function WeeklyChecklist() {
  const [school, setSchool] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [file, setFile] = useState(null);

  const currentWeek = "2026-W03"; // 🔥 change weekly

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // ✅ Get school automatically
      const schoolData = await getUserSchool(user.uid);
      setSchool(schoolData);

      // ✅ Get weekly training tasks
      const docRef = doc(db, "weeklyTraining", currentWeek);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setTasks(data.tasks || []);
      }

    } catch (err) {
      console.error(err);
    }
  }

  function toggleTask(task) {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter(t => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  }

  async function submitTasks() {
    try {
      if (!school) return alert("No school found");

      let imageUrl = "";

      // 📸 Upload proof image
      if (file) {
        const storageRef = ref(
          storage,
          `proofs/${school.id}_${Date.now()}_${file.name}`
        );

        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "taskSubmissions"), {
  schoolId: school.id,
  schoolName: school.name,
  week: currentWeek,
  completedTasks: selectedTasks,
  totalTasks: tasks.length,
  score: selectedTasks.length,
  proofImage: imageUrl,

  status: "pending", // ✅ ADD THIS LINE

  createdAt: new Date()
});

      alert("Weekly tasks submitted ✅");

      // Reset
      setSelectedTasks([]);
      setFile(null);

    } catch (err) {
      console.error(err);
    }
  }

  if (!school) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>📅 Weekly Checklist</h1>
      <h3>{school.name}</h3>

      <p><strong>Week:</strong> {currentWeek}</p>

      {/* TASK LIST */}
      <div style={{ marginTop: "20px" }}>
        {tasks.length === 0 && <p>No tasks found for this week</p>}

        {tasks.map((task, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="checkbox"
                checked={selectedTasks.includes(task)}
                onChange={() => toggleTask(task)}
              />{" "}
              {task}
            </label>
          </div>
        ))}
      </div>

      {/* PHOTO UPLOAD */}
      <div style={{ marginTop: "20px" }}>
        <p>📸 Upload Proof (optional)</p>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {/* SUBMIT */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={submitTasks}>
          Submit Weekly Tasks
        </button>
      </div>
    </div>
  );
}
