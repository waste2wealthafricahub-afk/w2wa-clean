import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
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

export default function MonitoringDashboard() {
  const [loading, setLoading] =
    useState(true);

  const [registeredSchools,
    setRegisteredSchools] =
    useState(0);

  const [approvedSchools,
    setApprovedSchools] =
    useState(0);

  const [activeEmcccSchools,
    setActiveEmcccSchools] =
    useState(0);

  const [studentsReached,
    setStudentsReached] =
    useState(0);

  const [lgaCovered,
    setLgaCovered] =
    useState(0);

  const [pendingActivities,
    setPendingActivities] =
    useState(0);

  const [complianceData,
    setComplianceData] =
    useState([]);

  const [riskAlerts,
    setRiskAlerts] =
    useState([]);

  const [activities,
    setActivities] =
    useState([]);

    const [schoolMap, setSchoolMap] =
  useState({});

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const updateActivityStatus =
    async (
      activityId,
      newStatus
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "emcccActivities",
            activityId
          ),
          {
            status: newStatus,
          }
        );

        alert(
          `Activity ${newStatus}`
        );

        fetchMonitoringData();
      } catch (error) {
        console.error(error);
      }
    };

  const fetchMonitoringData =
    async () => {
      try {
        setLoading(true);

        const schoolsSnapshot =
          await getDocs(
            collection(
              db,
              "schools"
            )
          );

        const schoolsList =
          schoolsSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

          const schoolLookup = {};

            schoolsList.forEach((school) => {
  schoolLookup[
    school.schoolId
  ] = school.schoolName;
          });

            setSchoolMap(
             schoolLookup
          );
        setRegisteredSchools(
          schoolsList.length
        );

        setApprovedSchools(
          schoolsList.filter(
            (school) =>
              school.approved
          ).length
        );

        const uniqueLGAs = [
          ...new Set(
            schoolsList
              .filter(
                (school) =>
                  school.approved
              )
              .map(
                (school) =>
                  school.localGovernment
              )
          ),
        ];

        setLgaCovered(
          uniqueLGAs.length
        );

        const emcccSnapshot =
          await getDocs(
            collection(
              db,
              "emcccSchools"
            )
          );

        const emcccList =
          emcccSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setActiveEmcccSchools(
          emcccList.length
        );

        const alerts = [];

        const compliance =
          emcccList.map(
            (school) => {
              const hasPatron =
                school.patronType &&
                school.patronType !== "";

              const hasCoordinator =
                school.coordinators &&
                school.coordinators.length > 0;

              const launchCompleted =
                school.launchDate !== null &&
                school.launchDate !== "";

              if (!hasPatron) {
                alerts.push(
                  `${school.schoolName} — No patron assigned`
                );
              }

              if (
                !hasCoordinator
              ) {
                alerts.push(
                  `${school.schoolName} — No coordinator assigned`
                );
              }

              if (
                !launchCompleted
              ) {
                alerts.push(
                  `${school.schoolName} — EMCCC launch pending`
                );
              }

              let status =
                "Pending";

              if (
                hasPatron &&
                hasCoordinator &&
                launchCompleted
              ) {
                status =
                  "Compliant";
              }

              return {
                schoolName:
                  school.schoolName,
                hasPatron,
                hasCoordinator,
                launchCompleted,
                week:
                  school.weekCompleted || 0,
                status,
              };
            }
          );

        setComplianceData(
          compliance
        );
        setRiskAlerts(alerts);

        const activitiesSnapshot =
          await getDocs(
            collection(
              db,
              "emcccActivities"
            )
          );

        const activitiesList =
          activitiesSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setActivities(
          activitiesList
        );

        let totalStudents = 0;

        activitiesList.forEach(
          (activity) => {
            totalStudents +=
              Number(
                activity.attendance || 0
              );
          }
        );

        setStudentsReached(
          totalStudents
        );

        setPendingActivities(
          activitiesList.filter(
            (activity) =>
              activity.status ===
              "pending"
          ).length
        );

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>
        EMCCC Monitoring &
        Compliance Command Center
      </h1>

      <p>
        Waste2Wealth Africa Hub
      </p>

      <div style={styles.cardGrid}>
        <Card title="Registered Schools" value={registeredSchools} />
        <Card title="Approved Schools" value={approvedSchools} />
        <Card title="Active EMCCC Schools" value={activeEmcccSchools} />
        <Card title="Students Reached" value={studentsReached} />
        <Card title="LGAs Covered" value={lgaCovered} />
        <Card title="Pending Activities" value={pendingActivities} />
      </div>

      <div style={styles.section}>
        <h2>Risk Alerts</h2>
        {riskAlerts.length === 0
          ? <p>No active risk alerts.</p>
          : riskAlerts.map(
              (alert, i) => (
                <div
                  key={i}
                  style={styles.alert}
                >
                  🚨 {alert}
                </div>
              )
            )}
      </div>

      <div style={styles.section}>
        <h2>
          EMCCC Compliance Monitor
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>School</th>
              <th style={styles.th}>Patron</th>
              <th style={styles.th}>Coordinator</th>
              <th style={styles.th}>Launch</th>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.map(
              (school, i) => (
                <tr key={i}>
                  <td style={styles.td}>{school.schoolName}</td>
                  <td style={styles.td}>{school.hasPatron ? "Yes" : "No"}</td>
                  <td style={styles.td}>{school.hasCoordinator ? "Yes" : "No"}</td>
                  <td style={styles.td}>{school.launchCompleted ? "Done" : "Pending"}</td>
                  <td style={styles.td}>{school.week}/10</td>
                  <td style={styles.td}>{school.status}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h2>
          Activity Approval Queue
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
  School Name
</th>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Attendance</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
           {activities
  .filter(
    (activity) =>
      activity.status ===
      "pending"
  )
  .map((activity) => (
                <tr key={activity.id}>
 <td style={styles.td}>
  {schoolMap[
    activity.schoolId
  ] || activity.schoolId}
</td>
                  <td style={styles.td}>{activity.weekNumber}</td>
                  <td style={styles.td}>{activity.title}</td>
                  <td style={styles.td}>{activity.attendance}</td>
                  <td style={styles.td}>{activity.status}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.approveBtn}
                      onClick={() =>
                        updateActivityStatus(
                          activity.id,
                          "approved"
                        )
                      }
                    >
                      Approve
                    </button>

                    <button
                      style={styles.rejectBtn}
                      onClick={() =>
                        updateActivityStatus(
                          activity.id,
                          "rejected"
                        )
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    background: "#f5f7fa",
    minHeight: "100vh",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  alert: {
    padding: "12px",
    marginBottom: "10px",
    background: "#fff4e5",
    borderRadius: "8px",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },

  th: {
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
  },

  approveBtn: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    marginRight: "8px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  rejectBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};