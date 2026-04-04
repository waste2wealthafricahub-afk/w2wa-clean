import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getUserSchool } from "../utils/getUserSchool";

export default function ClubDashboard() {
  const [school, setSchool] = useState(null);

  const [form, setForm] = useState({
    clubName: "",
    president: "",
    secretary: "",
    coordinator: "",
    membersCount: 0
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

  async function createClub() {
    try {
      await setDoc(doc(db, "clubs", school.id), {
        schoolId: school.id,
        schoolName: school.name,

        clubName: form.clubName,

        leaders: {
          president: form.president,
          secretary: form.secretary,
          coordinator: form.coordinator
        },

        membersCount: Number(form.membersCount),
        createdAt: new Date()
      });

      alert("Club created successfully 🎉");

    } catch (err) {
      console.error(err);
    }
  }

  if (!school) return <p>Loading school...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏫 {school.name} Club Setup</h1>

      <input name="clubName" placeholder="Club Name" onChange={handleChange} />

      <h3>Leaders</h3>
      <input name="president" placeholder="President" onChange={handleChange} />
      <input name="secretary" placeholder="Secretary" onChange={handleChange} />
      <input name="coordinator" placeholder="Coordinator" onChange={handleChange} />

      <input name="membersCount" placeholder="Members Count" onChange={handleChange} />

      <button onClick={createClub}>Create Club</button>
    </div>
  );
}