import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function AdminApprovals() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending schools
  const fetchSchools = async () => {
    try {
      const snapshot = await getDocs(collection(db, "schools"));

      const pending = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((school) => school.status === "pending");

      setSchools(pending);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Approve school + AUTO CREATE SYSTEM
  const approveSchool = async (school) => {
    try {
      // 1. Update school status
      await updateDoc(doc(db, "schools", school.id), {
        status: "approved",
      });

      // 2. Create Environmental Club
      await addDoc(collection(db, "clubs"), {
        schoolId: school.id,
        schoolName: school.schoolName,
        name: "Environmental Management Club",
        createdAt: new Date(),
      });

      // 3. Create Programme Launch (FIRST activity)
      await addDoc(collection(db, "programmeActivities"), {
        schoolId: school.id,
        schoolName: school.schoolName,
        title: "W2WA-EMC Programme Launch",
        description:
          "Introduce the Environmental Management Club and Waste-to-Wealth concept",
        week: 1,
        status: "pending",
        createdAt: new Date(),
      });

      // 4. Create First Training Session
      await addDoc(collection(db, "trainingSessions"), {
        schoolId: school.id,
        schoolName: school.schoolName,
        week: 1,
        status: "active",
        createdAt: new Date(),
      });

      alert("School approved and system auto-created successfully!");

      // Refresh list
      fetchSchools();
    } catch (error) {
      console.error(error);
      alert("Error approving school");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pending School Approvals</h1>

      {schools.length === 0 ? (
        <p>No pending schools</p>
      ) : (
        schools.map((school) => (
          <div
            key={school.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>{school.schoolName}</h3>
            <p>{school.email}</p>

            <button
              onClick={() => approveSchool(school)}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "10px 15px",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}