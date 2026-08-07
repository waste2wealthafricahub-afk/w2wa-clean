import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

export default function UserManagement() {

  const [activeTab, setActiveTab] =
    useState("schools");

  const [schools, setSchools] =
    useState([]);

  const [
    representatives,
    setRepresentatives,
  ] = useState([]);

  const [monitors, setMonitors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      // Schools
      const schoolSnap =
        await getDocs(
          collection(
            db,
            "schools"
          )
        );

      setSchools(
        schoolSnap.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );

      // Representatives
      const repSnap =
        await getDocs(
          collection(
            db,
            "representatives"
          )
        );

      setRepresentatives(
        repSnap.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );

      // Monitors
      const monitorSnap =
        await getDocs(
          collection(
            db,
            "monitors"
          )
        );

      setMonitors(
        monitorSnap.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );

      setLoading(false);

    } catch (error) {

      console.error(error);

      setLoading(false);

    }

  };

  if (loading) {

    return (
      <div style={{padding:"30px"}}>
        Loading User Management...
      </div>
    );

  }

  return (

  <div style={styles.page}>

    <h1>User Management</h1>

    <p>
      Manage Schools,
      Representatives and
      Ministry Monitors
    </p>

    <div style={styles.tabs}>

      <button
        style={
          activeTab==="schools"
          ? styles.activeButton
          : styles.button
        }
        onClick={()=>
          setActiveTab("schools")
        }
      >
        Schools
      </button>

      <button
        style={
          activeTab==="representatives"
          ? styles.activeButton
          : styles.button
        }
        onClick={()=>
          setActiveTab("representatives")
        }
      >
        Representatives
      </button>

      <button
        style={
          activeTab==="monitors"
          ? styles.activeButton
          : styles.button
        }
        onClick={()=>
          setActiveTab("monitors")
        }
      >
        Monitors
      </button>

    </div>

    <table style={styles.table}>

      <thead>

        <tr>

          <th style={styles.th}>Name</th>

          <th style={styles.th}>Email</th>

          <th style={styles.th}>Status</th>

          <th style={styles.th}>Action</th>

        </tr>

      </thead>

      <tbody>

        {activeTab==="schools" &&

          schools.map((school)=>(

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

                <button
                  style={styles.actionButton}
                >
                  View
                </button>

              </td>

            </tr>

          ))

        }

        {activeTab==="representatives" &&

          representatives.map((rep)=>(

            <tr key={rep.id}>

              <td style={styles.td}>
                {rep.fullName}
              </td>

              <td style={styles.td}>
                {rep.email}
              </td>

              <td style={styles.td}>
                {rep.approved
                  ? "Approved"
                  : "Pending"}
              </td>

              <td style={styles.td}>

                <button
                  style={styles.actionButton}
                >
                  View
                </button>

              </td>

            </tr>

          ))

        }

        {activeTab==="monitors" &&

          monitors.map((monitor)=>(

            <tr key={monitor.id}>

              <td style={styles.td}>
                {monitor.fullName}
              </td>

              <td style={styles.td}>
                {monitor.email}
              </td>

              <td style={styles.td}>
                {monitor.approved
                  ? "Approved"
                  : "Pending"}
              </td>

              <td style={styles.td}>

                <button
                  style={styles.actionButton}
                >
                  View
                </button>

              </td>

            </tr>

          ))

        }

      </tbody>

    </table>

  </div>

);

}

const styles = {

  page:{
    padding:"20px",
    background:"#f5f7fa",
    minHeight:"100vh",
  },

  tabs:{
    display:"flex",
    gap:"10px",
    marginTop:"25px",
    marginBottom:"25px",
  },

  button:{
    padding:"10px 20px",
    background:"#ddd",
    border:"none",
    borderRadius:"8px",
    cursor:"pointer",
  },

  activeButton:{
    padding:"10px 20px",
    background:"#2563eb",
    color:"#fff",
    border:"none",
    borderRadius:"8px",
    cursor:"pointer",
  },

};