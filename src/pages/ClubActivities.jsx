import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { getUserSchool } from "../utils/getUserSchool";

export default function ClubActivities() {
  const [school, setSchool] = useState(null);

  const [form, setForm] = useState({
    activity: "",
    week: "",
    description: "",
    evidence: "",
    studentsInvolved: 0
  });

  useEffect(() => {
    loadSchool();
  }, []);

  async function loadSchool() {
    const user = auth.currentUser;
    if (!user) return;

    const schoolData = await getUserSchool(user.uid);
    setSchool(schoolData);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submitActivity() {
    try {
      await addDoc(collection(db, "clubActivities"), {
        schoolId: school.id,
        schoolName: school.name,
        ...form,
        studentsInvolved: Number(form.studentsInvolved),
        createdAt: new Date()
      });

      alert("Activity submitted ✅");

    } catch (err) {
      console.error(err);
    }
  }

  if (!school) return <p>Loading school...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📘 {school.name} Activities</h1>

      <input name="activity" placeholder="Activity" onChange={handleChange} />
      <input name="week" placeholder="Week (2026-W01)" onChange={handleChange} />

      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input name="evidence" placeholder="Evidence (link/text)" onChange={handleChange} />

      <input name="studentsInvolved" placeholder="Students involved" onChange={handleChange} />

      <button onClick={submitActivity}>Submit Activity</button>
    </div>
  );
}