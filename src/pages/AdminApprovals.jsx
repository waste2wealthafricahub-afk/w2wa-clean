import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";

function AdminApprovals() {
  const [schools, setSchools] = useState([]);

  // Fetch all schools
  const fetchSchools = async () => {
    const snapshot = await getDocs(collection(db, "schools"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSchools(list);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // APPROVE SCHOOL + AUTO CREATE SYSTEM DATA
  const approveSchool = async (school) => {
    try {
      const schoolRef = doc(db, "schools", school.id);

      // 1. Approve school
      await updateDoc(schoolRef, {
        status: "approved",
        approvedAt: new Date(),
      });

      // 2. Create Environmental Club
      await addDoc(collection(db, "clubs"), {
        schoolId: school.id,
        schoolName: school.name,
        clubName: "W2WA Environmental Club",
        status: "active",
        createdAt: new Date(),
      });

      // 3. Create Programme Launch
      await addDoc(collection(db, "programmes"), {
        schoolId: school.id,
        type: "Programme Launch",
        status: "completed",
        date: new Date(),
      });

      // 4. Start Weekly Training
      await addDoc(collection(db, "weeklyTraining"), {
        schoolId: school.id,
        week: 1,
        topic: "Introduction to Waste Management",
        status: "pending",
        createdAt: new Date(),
      });

      alert("School approved and system activated!");
      fetchSchools();
    } catch (error) {
      console.error(error);
      alert("Error approving school");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending School Approvals</h2>

      {schools.filter((s) => s.status !== "approved").length === 0 && (
        <p>No pending schools</p>
      )}

      {schools
        .filter((s) => s.status !== "approved")
        .map((school) => (
          <div
            key={school.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{school.name}</h3>
            <p>{school.email}</p>

            <button
              onClick={() => approveSchool(school)}
              style={{
                padding: "8px 12px",
                background: "green",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Approve
            </button>
          </div>
        ))}
    </div>
  );
}

export default AdminApprovals;