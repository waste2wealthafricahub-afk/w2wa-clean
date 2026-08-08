import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

import UserSummaryCards from "../components/userManagement/UserSummaryCards";
import UserSearch from "../components/userManagement/UserSearch";
import UserTabs from "../components/userManagement/UserTabs";
import UserTable from "../components/userManagement/UserTable";

export default function UserManagement() {

  const [activeTab, setActiveTab] =
    useState("schools");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [schools, setSchools] =
    useState([]);

  const [
    representatives,
    setRepresentatives,
  ] = useState([]);

  const [monitors, setMonitors] =
    useState([]);

  useEffect(() => {

    fetchUsers();

  }, []);

  async function fetchUsers() {

    try {

      setLoading(true);

      const schoolSnap =
        await getDocs(
          collection(
            db,
            "schools"
          )
        );

      setSchools(

        schoolSnap.docs.map(
          (docItem) => ({

            id: docItem.id,

            ...docItem.data(),

          })

        )

      );

      const repSnap =
        await getDocs(
          collection(
            db,
            "representatives"
          )
        );

      setRepresentatives(

        repSnap.docs.map(
          (docItem) => ({

            id: docItem.id,

            ...docItem.data(),

          })

        )

      );

      const monitorSnap =
        await getDocs(
          collection(
            db,
            "monitors"
          )
        );

      setMonitors(

        monitorSnap.docs.map(
          (docItem) => ({

            id: docItem.id,

            ...docItem.data(),

          })

        )

      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to load users."
      );

    } finally {

      setLoading(false);

    }

  }

  async function approveUser(
    collectionName,
    id
  ) {

    try {

      await updateDoc(

        doc(
          db,
          collectionName,
          id
        ),

        {

          approved: true,

        }

      );

      await fetchUsers();

      alert(
        "User approved successfully."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Approval failed."
      );

    }

  }

  async function suspendUser(
    collectionName,
    id
  ) {

    try {

      await updateDoc(

        doc(
          db,
          collectionName,
          id
        ),

        {

          approved: false,

        }

      );

      await fetchUsers();

      alert(
        "User suspended."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to suspend user."
      );

    }

  }
    const filteredSchools =
    useMemo(() => {

      return schools.filter(
        (school) => {

          const text =
            search.toLowerCase();

          return (

            school.schoolName
              ?.toLowerCase()
              .includes(text) ||

            school.email
              ?.toLowerCase()
              .includes(text)

          );

        }

      );

    }, [
      schools,
      search,
    ]);

  const filteredRepresentatives =
    useMemo(() => {

      return representatives.filter(
        (rep) => {

          const text =
            search.toLowerCase();

          return (

            rep.fullName
              ?.toLowerCase()
              .includes(text) ||

            rep.email
              ?.toLowerCase()
              .includes(text)

          );

        }

      );

    }, [
      representatives,
      search,
    ]);

  const filteredMonitors =
    useMemo(() => {

      return monitors.filter(
        (monitor) => {

          const text =
            search.toLowerCase();

          return (

            monitor.fullName
              ?.toLowerCase()
              .includes(text) ||

            monitor.email
              ?.toLowerCase()
              .includes(text)

          );

        }

      );

    }, [
      monitors,
      search,
    ]);

  function handleView(user) {

    alert(

      JSON.stringify(
        user,
        null,
        2
      )

    );

  }

  function handleApprove(user) {

    let collectionName =
      "schools";

    if (
      activeTab ===
      "representatives"
    ) {

      collectionName =
        "representatives";

    }

    if (
      activeTab ===
      "monitors"
    ) {

      collectionName =
        "monitors";

    }

    approveUser(
      collectionName,
      user.id
    );

  }

  function handleSuspend(user) {

    let collectionName =
      "schools";

    if (
      activeTab ===
      "representatives"
    ) {

      collectionName =
        "representatives";

    }

    if (
      activeTab ===
      "monitors"
    ) {

      collectionName =
        "monitors";

    }

    suspendUser(
      collectionName,
      user.id
    );

  }

  if (loading) {

    return (

      <div
        style={{
          padding: "40px",
          fontSize: "20px",
        }}
      >

        Loading User Management...

      </div>

    );

  }

  return (

    <div
      style={styles.page}
    >

      <h1>
        User Management
      </h1>

      <p>
        Manage Schools,
        Representatives
        and Ministry
        Monitors
      </p>

      <UserSummaryCards

        schools={schools}

        representatives={
          representatives
        }

        monitors={monitors}

      />

      <UserSearch

        search={search}

        setSearch={setSearch}

      />

      <UserTabs

        activeTab={
          activeTab
        }

        setActiveTab={
          setActiveTab
        }

      />
            {activeTab ===
        "schools" && (

        <UserTable

          users={
            filteredSchools
          }

          type="school"

          onView={
            handleView
          }

          onApprove={
            handleApprove
          }

          onSuspend={
            handleSuspend
          }

        />

      )}

      {activeTab ===
        "representatives" && (

        <UserTable

          users={
            filteredRepresentatives
          }

          type="representative"

          onView={
            handleView
          }

          onApprove={
            handleApprove
          }

          onSuspend={
            handleSuspend
          }

        />

      )}

      {activeTab ===
        "monitors" && (

        <UserTable

          users={
            filteredMonitors
          }

          type="monitor"

          onView={
            handleView
          }

          onApprove={
            handleApprove
          }

          onSuspend={
            handleSuspend
          }

        />

      )}

    </div>

  );

}

const styles = {

  page:{

    padding:"25px",

    background:"#f4f6f9",

    minHeight:"100vh",

  },
    title:{

    marginBottom:"5px",

  },

  subtitle:{

    color:"#666",

    marginBottom:"25px",

  },

  section:{

    background:"#fff",

    padding:"20px",

    borderRadius:"12px",

    boxShadow:
      "0 2px 8px rgba(0,0,0,.08)",

  },

};
