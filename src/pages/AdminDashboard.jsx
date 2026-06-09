import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

const Card = ({ title, value }) => (
  <div
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <h4
      style={{
        color: "#666",
        marginBottom: "10px",
      }}
    >
      {title}
    </h4>

    <h2>{value}</h2>
  </div>
);

export default function AdminDashboard() {

  // =========================
  // STATES
  // =========================
  const [schools, setSchools] =
    useState([]);

  const [representatives,
    setRepresentatives] =
    useState([]);

  const [logs, setLogs] =
    useState([]);

  const [trainingSessions,
    setTrainingSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {

    try {

      // =====================
      // SCHOOLS
      // =====================
      const schoolsSnapshot =
        await getDocs(
          collection(db, "schools")
        );

      const schoolsList =
        schoolsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setSchools(schoolsList);

      // =====================
      // REPRESENTATIVES
      // =====================
      const repsSnapshot =
        await getDocs(
          collection(
            db,
            "representatives"
          )
        );

      const repsList =
        repsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setRepresentatives(
        repsList
      );

      // =====================
      // RECYCLING LOGS
      // =====================
      const logsSnapshot =
        await getDocs(
          collection(
            db,
            "recyclingLogs"
          )
        );

      const logsList =
        logsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setLogs(logsList);

      // =====================
      // TRAINING SESSIONS
      // =====================
      const trainingSnapshot =
        await getDocs(
          collection(
            db,
            "trainingSessions"
          )
        );

      const trainingList =
        trainingSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setTrainingSessions(
        trainingList
      );

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);
    }
  };

  // =========================
  // APPROVE REPRESENTATIVE
  // =========================
  const approveRepresentative =
    async (id) => {

    try {

      await updateDoc(
        doc(
          db,
          "representatives",
          id
        ),
        {
          approved: true,
        }
      );

      alert(
        "Representative approved"
      );

      fetchDashboardData();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // APPROVE SCHOOL
  // =========================
  const approveSchool = async (
    id
  ) => {

    try {

      await updateDoc(
        doc(db, "schools", id),
        {
          approved: true,
          status: "approved",
        }
      );

      alert("School approved");

      fetchDashboardData();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // CALCULATIONS
  // =========================

  const totalWaste = logs.reduce(
    (sum, item) =>
      sum +
      Number(item.totalWeight || 0),
    0
  );

  const totalValue = logs.reduce(
    (sum, item) =>
      sum +
      Number(item.totalValue || 0),
    0
  );

  const totalStudents =
    trainingSessions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.studentsReached || 0
        ),
      0
    );

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>
          Loading Admin Dashboard...
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

      {/* HEADER */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h1>
          Admin Dashboard
        </h1>

        <p>
          W2WASCHOOL Environmental
          Management System
        </p>
      </div>

      {/* METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <Card
          title="Registered Schools"
          value={schools.length}
        />

        <Card
          title="Representatives"
          value={representatives.length}
        />

        <Card
          title="Students Trained"
          value={totalStudents}
        />

        <Card
          title="Total Waste"
          value={`${totalWaste} kg`}
        />

        <Card
          title="Recycling Value"
          value={`₦${totalValue.toLocaleString()}`}
        />
      </div>

      {/* SCHOOL APPROVALS */}
      <div
        style={styles.section}
      >
        <h2>
          School Approvals
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                School
              </th>

              <th style={styles.th}>
                Email
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td style={styles.td}>
                  {school.schoolName}
                </td>

                <td style={styles.td}>
                  {school.email}
                </td>

                <td style={styles.td}>
                  {school.approved
                    ? "Approved"
                    : "Pending"}
                </td>

                <td style={styles.td}>
                  {!school.approved && (
                    <button
                      style={styles.button}
                      onClick={() =>
                        approveSchool(
                          school.id
                        )
                      }
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REPRESENTATIVE APPROVALS */}
      <div
        style={styles.section}
      >
        <h2>
          Representative Approvals
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                Name
              </th>

              <th style={styles.th}>
                Email
              </th>

              <th style={styles.th}>
                Approved
              </th>

              <th style={styles.th}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {representatives.map(
              (rep) => (
                <tr key={rep.id}>
                  <td style={styles.td}>
                    {rep.fullName}
                  </td>

                  <td style={styles.td}>
                    {rep.email}
                  </td>

                  <td style={styles.td}>
                    {rep.approved
                      ? "Yes"
                      : "No"}
                  </td>

                  <td style={styles.td}>
                    {!rep.approved && (
                      <button
                        style={styles.button}
                        onClick={() =>
                          approveRepresentative(
                            rep.id
                          )
                        }
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* RECENT COLLECTIONS */}
      <div style={styles.section}>
        <h2>
          Recent Collections
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                School ID
              </th>

              <th style={styles.th}>
                Weight
              </th>

              <th style={styles.th}>
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>
                  {log.schoolId}
                </td>

                <td style={styles.td}>
                  {log.totalWeight} kg
                </td>

                <td style={styles.td}>
                  ₦
                  {Number(
                    log.totalValue || 0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
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
    padding: "8px 14px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};