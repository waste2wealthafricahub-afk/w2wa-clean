import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SchoolRegistration() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "",
    teacherName: "",
    email: "",
    password: "",
    phone: "",
    state: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateSchoolId = (schoolName) => {
    return schoolName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const uid = userCredential.user.uid;

      const schoolId = generateSchoolId(
        formData.schoolName
      );

      // ==========================
      // SCHOOL DOCUMENT
      // ==========================
      await setDoc(
        doc(db, "schools", uid),
        {
          uid,

          schoolId,

          schoolName:
            formData.schoolName,

          teacherName:
            formData.teacherName,

          email:
            formData.email,

          phone:
            formData.phone,

          state:
            formData.state,

          address:
            formData.address,

          role: "school",

          approved: false,

          status: "pending",

          clubCode: "EMCCC",

          clubName:
            "Environmental Management and Climate Change Club",

          createdAt: new Date(),
        }
      );

      // ==========================
      // SCHOOL WALLET
      // ==========================
      await setDoc(
        doc(
          db,
          "schoolWallets",
          schoolId
        ),
        {
          schoolId,

          balance: 0,

          totalEarned: 0,

          totalDeductions: 0,

          createdAt: new Date(),
        }
      );

      alert(
        "School registration submitted successfully."
      );

      navigate("/");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            School Registration
          </h1>

          <p style={styles.subtitle}>
            Environmental Management and
            Climate Change Club (EMCCC)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="schoolName"
            placeholder="School Name"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="teacherName"
            placeholder="Teacher Name"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="School Email"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            required
            onChange={handleChange}
            style={styles.input}
          />

          <textarea
            name="address"
            placeholder="School Address"
            required
            onChange={handleChange}
            style={styles.textarea}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading
              ? "Registering..."
              : "Register School"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg,#e8f4ff,#f5f7fa)",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#fff",
    padding: "35px",
    borderRadius: "18px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
  },

  header: {
    textAlign: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#1f2937",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: "10px",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
};