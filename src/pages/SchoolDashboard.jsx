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

      <div style={styles.section}>

        <h2>
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
};