import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function ApproveReps() {
  const [reps, setReps] = useState([]);

  const fetchReps = async () => {
    const snapshot = await getDocs(collection(db, "representatives"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setReps(data);
  };

  useEffect(() => {
    fetchReps();
  }, []);

  const approveRep = async (id) => {
    await updateDoc(doc(db, "representatives", id), {
      approved: true,
    });

    alert("Rep approved");
    fetchReps();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Approve Representatives</h2>

      {reps.length === 0 && <p>No reps found</p>}

      {reps.map((rep) => (
        <div
          key={rep.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
          }}
        >
          <h3>{rep.fullName}</h3>
          <p>{rep.email}</p>
          <p>{rep.region}</p>

          <p>
            Status:{" "}
            <strong>
              {rep.approved ? "✅ Approved" : "⏳ Pending"}
            </strong>
          </p>

          {!rep.approved && (
            <button onClick={() => approveRep(rep.id)}>
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}