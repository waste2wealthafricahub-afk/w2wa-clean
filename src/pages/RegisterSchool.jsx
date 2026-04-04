import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterSchool() {
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");

  function generatePassword() {
    return Math.random().toString(36).slice(-8);
  }

  async function register() {
    try {
      const password = generatePassword();

      // 🔐 Create auth user
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = res.user.uid;

      // 🏫 Save school
      await setDoc(doc(db, "schools", uid), {
        name: schoolName,
        email,
        createdAt: new Date()
      });

      // 👤 Save user role
      await setDoc(doc(db, "users", uid), {
        role: "school"
      });

      alert(`School registered!\nPassword: ${password}`);

    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register School</h1>

      <input
        placeholder="School Name"
        onChange={(e) => setSchoolName(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={register}>Register</button>
    </div>
  );
}
