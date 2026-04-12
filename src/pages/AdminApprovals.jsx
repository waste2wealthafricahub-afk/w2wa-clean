import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminApprovals() {
  const [schoolApps, setSchoolApps] = useState([]);
  const [repApps, setRepApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);

    const schoolSnap = await getDocs(collection(db, "schoolApplications"));
    const repSnap = await getDocs(collection(db, "repApplications"));

    setSchoolApps(
      schoolSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );

    setRepApps(
      repSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );

    setLoading(false);
  };

  /* ===============================
     APPROVE SCHOOL APPLICATION
  =============================== */
  const approveSchool = async (app) => {
    try {
      const schoolRef = doc(collection(db, "schools"));

      // Create school profile
      await setDoc(schoolRef, {
        schoolName: app.schoolName,
        email: app.email,
        location: app.location,
        teacherName: app.teacherName,
        phone: app.phone,
        createdAt: serverTimestamp(),
      });

      // Link user account if UID exists
      if (app.uid) {
        await setDoc(doc(db, "users", app.uid), {
          email: app.email,
          role: "school",
          schoolId: schoolRef.id,
          schoolName: app.schoolName,
          teacherName: app.teacherName,
          createdAt: serverTimestamp(),
        });
      }

      // Update application status
      await updateDoc(doc(db, "schoolApplications", app.id), {
        status: "approved",
      });

      alert("School approved successfully!");
      fetchApplications();
    } catch (error) {
      console.error("Error approving school:", error);
      alert("Approval failed.");
    }
  };

  /* ===============================
     APPROVE REP APPLICATION
  =============================== */
  const approveRep = async (app) => {
    try {
      const repRef = doc(collection(db, "reps"));

      await setDoc(repRef, {
        name: app.fullName,
        email: app.email,
        phone: app.phone,
        location: app.location,
        createdAt: serverTimestamp(),
      });

      if (app.uid) {
        await setDoc(doc(db, "users", app.uid), {
          email: app.email,
          role: "rep",
          repId: repRef.id,
          name: app.fullName,
          createdAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, "repApplications", app.id), {
        status: "approved",
      });

      alert("Representative approved successfully!");
      fetchApplications();
    } catch (error) {
      console.error("Error approving rep:", error);
      alert("Approval failed.");
    }
  };

  /* ===============================
     REJECT APPLICATION
  =============================== */
  const rejectApplication = async (collectionName, id) => {
    if (!window.confirm("Are you sure you want to reject this application?"))
      return;

    await deleteDoc(doc(db, collectionName, id));
    fetchApplications();
  };

  if (loading) return <p>Loading applications...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📋 Admin Approval Panel</h2>

      {/* SCHOOL APPLICATIONS */}
      <h3>🏫 School Applications</h3>
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>School</th>
            <th>Email</th>
            <th>Location</th>
            <th>Teacher</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schoolApps.filter(app => app.status === "pending").length === 0 ? (
            <tr>
              <td colSpan="5" align="center">No pending applications</td>
            </tr>
          ) : (
            schoolApps
              .filter((app) => app.status === "pending")
              .map((app) => (
                <tr key={app.id}>
                  <td>{app.schoolName}</td>
                  <td>{app.email}</td>
                  <td>{app.location}</td>
                  <td>{app.teacherName}</td>
                  <td>
                    <button onClick={() => approveSchool(app)}>Approve</button>
                    <button
                      onClick={() =>
                        rejectApplication("schoolApplications", app.id)
                      }
                      style={{ marginLeft: "10px", color: "red" }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      {/* REP APPLICATIONS */}
      <h3 style={{ marginTop: "40px" }}>👨‍💼 Representative Applications</h3>
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {repApps.filter(app => app.status === "pending").length === 0 ? (
            <tr>
              <td colSpan="5" align="center">No pending applications</td>
            </tr>
          ) : (
            repApps
              .filter((app) => app.status === "pending")
              .map((app) => (
                <tr key={app.id}>
                  <td>{app.fullName}</td>
                  <td>{app.email}</td>
                  <td>{app.location}</td>
                  <td>{app.phone}</td>
                  <td>
                    <button onClick={() => approveRep(app)}>Approve</button>
                    <button
                      onClick={() =>
                        rejectApplication("repApplications", app.id)
                      }
                      style={{ marginLeft: "10px", color: "red" }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
}