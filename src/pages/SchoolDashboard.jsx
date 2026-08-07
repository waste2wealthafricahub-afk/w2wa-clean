import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

export default function SchoolDashboard() {

  const [schoolData,
    setSchoolData] =
    useState(null);

  const [totalWaste,
    setTotalWaste] =
    useState(0);

  const [recyclingValue,
    setRecyclingValue] =
    useState(0);

  const [collectionsCount,
    setCollectionsCount] =
    useState(0);

  const [recentLogs,
    setRecentLogs] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);
    const [emcccData,
  setEmcccData] =
  useState(null);

const [currentTraining,
  setCurrentTraining] =
  useState(null);

const [attendance,
  setAttendance] =
  useState("");

const [evidenceUrl,
  setEvidenceUrl] =
  useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    try {

      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const schoolQuery = query(
        collection(db, "schools"),
        where(
          "email",
          "==",
          user.email
        )
      );

      const schoolSnapshot =
        await getDocs(schoolQuery);

      if (schoolSnapshot.empty) {
        setLoading(false);
        return;
      }

      const school =
        schoolSnapshot.docs[0].data();

      setSchoolData(school);

      const schoolId =
        school.schoolId;
        const emcccSnap =
  await getDoc(
    doc(
      db,
      "emcccSchools",
      schoolId
    )
  );

if (emcccSnap.exists()) {
  const emccc =
    emcccSnap.data();

  setEmcccData(emccc);

  const weekNumber =
    emccc.nextTrainingWeek || 1;

  const weekId =
    `week${String(
      weekNumber
    ).padStart(2, "0")}`;

  const trainingSnapshot =
    await getDocs(
      collection(
        db,
        "weeklyTraining"
      )
    );

  const trainingDoc =
    trainingSnapshot.docs.find(
      (doc) =>
        doc.id.startsWith(
          weekId
        )
    );

  if (trainingDoc) {
    setCurrentTraining({
      id:
        trainingDoc.id,
      ...trainingDoc.data(),
    });
  }
}

      const logsQuery = query(
        collection(db, "recyclingLogs"),
        where(
          "schoolId",
          "==",
          schoolId
        )
      );

      const logsSnapshot =
        await getDocs(logsQuery);

      let waste = 0;
      let value = 0;

      logsSnapshot.forEach((doc) => {

        const data = doc.data();

        waste += Number(
          data.totalWeight || 0
        );

        value += Number(
          data.totalValue || 0
        );
      });

      setTotalWaste(waste);

      setRecyclingValue(value);

      setCollectionsCount(
        logsSnapshot.size
      );

      const recentQuery = query(
        collection(db, "recyclingLogs"),
        where(
          "schoolId",
          "==",
          schoolId
        ),
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(5)
      );

      const recentSnapshot =
        await getDocs(recentQuery);

      const logs = [];

      recentSnapshot.forEach((doc) => {
        logs.push(doc.data());
      });

      setRecentLogs(logs);

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);
    }
  };
const submitActivity =
  async () => {
    try {
      if (!schoolData) return;

      if (!attendance) {
        alert(
          "Enter attendance"
        );
        return;
      }

      if (
        !currentTraining
      ) {
        alert(
          "No training found"
        );
        return;
      }

      const docId = `${schoolData.schoolId}_${currentTraining.id}`;

      await setDoc(
        doc(
          db,
          "emcccActivities",
          docId
        ),
        {
          schoolId:
            schoolData.schoolId,

          weekId:
            currentTraining.id,

          weekNumber:
            currentTraining.week,

          title:
            currentTraining.title,

          status:
            "pending",

          attendance:
            Number(
              attendance
            ),

          completedTasks:
            currentTraining.tasks ||
            [],

          evidenceUrl,

          submittedBy:
            "school_admin",

          submittedAt:
            new Date(),

          approvedAt:
            null,
        }
      );

      alert(
        "Activity submitted successfully"
      );

      setAttendance("");
      setEvidenceUrl("");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading School Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >

      <h1>
        School Dashboard
      </h1>

      <h3>
        {schoolData?.schoolName}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >

        <div style={styles.card}>
          <h4>Total Waste</h4>
          <h2>{totalWaste} kg</h2>
        </div>

        <div style={styles.card}>
          <h4>Collections</h4>
          <h2>{collectionsCount}</h2>
        </div>

        <div style={styles.card}>
          <h4>Recycling Value</h4>
          <h2>
            ₦{recyclingValue.toLocaleString()}
          </h2>
        </div>

      </div>

{emcccData && (
  <div style={styles.section}>
    <h2>EMCCC Status</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "15px",
      }}
    >
      <div style={styles.card}>
        <h4>Status</h4>
        <h2>
          {emcccData.status}
        </h2>
      </div>

      <div style={styles.card}>
        <h4>Current Week</h4>
        <h2>
          {
            emcccData.nextTrainingWeek
          }
          /10
        </h2>
      </div>

      <div style={styles.card}>
        <h4>Members</h4>
        <h2>
          {
            emcccData.membersCount
          }
        </h2>
      </div>

      <div style={styles.card}>
        <h4>Launch Status</h4>
        <h2>
          {emcccData.launchDate
            ? "Completed"
            : "Pending"}
        </h2>
      </div>
    </div>
  </div>
)}
{currentTraining && (
  <div style={styles.section}>
    <h2>
      Week {
        currentTraining.week
      } Training
    </h2>

    <h3>
      {
        currentTraining.title
      }
    </h3>

    <p>
      Theme:{" "}
      {
        currentTraining.theme
      }
    </p>

    <h4>Tasks</h4>

    <ul>
      {currentTraining.tasks?.map(
        (
          task,
          index
        ) => (
          <li key={index}>
            {typeof task ===
            "string"
              ? task
              : task.title}
          </li>
        )
      )}
    </ul>
  </div>
)}
      <div style={styles.section}>

        <h2>
 {currentTraining && (
  <div style={styles.section}>
    <h2>
      Submit EMCCC Activity
    </h2>

    <input
      type="number"
      placeholder="Attendance"
      value={attendance}
      onChange={(e) =>
        setAttendance(
          e.target.value
        )
      }
      style={styles.input}
    />

    <input
      type="text"
      placeholder="Evidence URL / Photo Link"
      value={evidenceUrl}
      onChange={(e) =>
        setEvidenceUrl(
          e.target.value
        )
      }
      style={styles.input}
    />

    <button
      style={styles.button}
      onClick={
        submitActivity
      }
    >
      Submit Activity
    </button>
  </div>
)}         
          Recent Collections
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plastic</th>
              <th style={styles.th}>Paper</th>
              <th style={styles.th}>Metal</th>
              <th style={styles.th}>Value</th>
            </tr>
          </thead>

          <tbody>
            {recentLogs.map((log, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  {log.plastic} kg
                </td>

                <td style={styles.td}>
                  {log.paper} kg
                </td>

                <td style={styles.td}>
                  {log.metal} kg
                </td>

                <td style={styles.td}>
                  ₦{log.totalValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "30px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },

  th: {
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #ddd",
  },
  button: {
  padding: "12px 18px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
},

input: {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "8px",
},
};