import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

export default function AdminApprovals() {
  const [schools, setSchools] = useState([]);

  // 🔹 Fetch unapproved schools
  const fetchSchools = async () => {
    const snapshot = await getDocs(collection(db, "schools"));

    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    // Only show unapproved schools
    const pending = data.filter((s) => !s.approved);

    setSchools(pending);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // 🔥 APPROVE FUNCTION (CORE LOGIC)
  const approveSchool = async (school) => {
    try {
      const schoolId = school.id;

      // ✅ 1. Approve school
      await updateDoc(doc(db, "schools", schoolId), {
        approved: true,
      });

      // ✅ 2. Create Club
      await setDoc(doc(db, "clubs", schoolId), {
        clubName: "W2WA Environmental Management Club",
        schoolId: schoolId,
        membersCount: 0,
        createdAt: serverTimestamp(),
      });

      // ✅ 3. Create Programme Launch
      await setDoc(doc(db, "clubActivities", `${schoolId}_launch`), {
        title: "W2WA-EMC Programme Launch",
        schoolId: schoolId,
        type: "onboarding",
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      alert("✅ School approved and initialized");

      // Refresh list
      fetchSchools();

    } catch (error) {
      console.error(error);
      alert("❌ Error approving school");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Approvals</h2>

      {schools.length === 0 ? (
        <p>No pending schools</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>School Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.schoolName}</td>
                <td>{school.email}</td>
                <td>
                  <button onClick={() => approveSchool(school)}>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
