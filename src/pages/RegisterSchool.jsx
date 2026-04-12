import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterSchool() {
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function generatePassword() {
    return Math.random().toString(36).slice(-8);
  }

  async function register(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const password = generatePassword();

      // 🔐 Create authentication account
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = res.user.uid;

      // 🏫 Save school information
      await setDoc(doc(db, "schools", uid), {
        name: schoolName,
        email,
        location,
        teacherName,
        teacherUid: uid,
        createdAt: serverTimestamp(),
      });

      // 👤 Save user role
      await setDoc(doc(db, "users", uid), {
        email,
        role: "school",
        schoolId: uid,
        createdAt: serverTimestamp(),
      });

      setMessage(
        `Registration successful! Temporary password: ${password}`
      );

      setSchoolName("");
      setEmail("");
      setTeacherName("");
      setLocation("");
    } catch (error) {
      console.error("Registration Error:", error);
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Register Your School</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={register}>
        <input
          type="text"
          placeholder="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Official Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Coordinator/Teacher Name"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Location (City)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Registering..." : "Register School"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2c7be5",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};