import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

export default function ProofReview() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    const snapshot = await getDocs(collection(db, "taskSubmissions"));

    const list = [];
    snapshot.forEach(docItem => {
      list.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    setSubmissions(list);
  }

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "taskSubmissions", id), {
        status
      });

      alert(`Marked as ${status}`);

      // refresh
      loadSubmissions();

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>👁️ Proof Review</h1>

      {submissions.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "10px"
          }}
        >
          <strong>{s.schoolName}</strong>

          <p>📅 Week: {s.week}</p>
          <p>✅ Tasks Completed: {s.score}/{s.totalTasks}</p>

          {/* 📸 IMAGE */}
          {s.proofImage && (
            <img
              src={s.proofImage}
              alt="proof"
              style={{ width: "200px", marginTop: "10px" }}
            />
          )}

          <p>Status: {s.status || "pending"}</p>

          {/* ACTION BUTTONS */}
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => updateStatus(s.id, "approved")}>
              ✅ Approve
            </button>

            <button
              onClick={() => updateStatus(s.id, "rejected")}
              style={{ marginLeft: "10px" }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
