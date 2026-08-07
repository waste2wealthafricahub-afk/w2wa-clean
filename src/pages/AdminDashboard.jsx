import { useNavigate } from "react-router-dom";
import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  increment,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import {
  fundRepWallet,
} from "../services/walletService";

const Card = ({ title, value }) => (
  <div style={styles.card}>
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

  const [
    withdrawalRequests,
    setWithdrawalRequests,
  ] = useState([]);

  const [transactions,
    setTransactions] =
    useState([]);

  const [repPerformance,
    setRepPerformance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);
const navigate = useNavigate();
  const [fundAmount,
    setFundAmount] =
    useState("");

  const [selectedRep,
    setSelectedRep] =
    useState("");

  const [platformRevenue,
    setPlatformRevenue] =
    useState(0);

  const [totalFloatFunded,
    setTotalFloatFunded] =
    useState(0);

  const [pendingWithdrawals,
    setPendingWithdrawals] =
    useState(0);

  const [
    totalWithdrawalsPaid,
    setTotalWithdrawalsPaid,
  ] = useState(0);
const [emcccActivities,
  setEmcccActivities] =
  useState([]);
  const [emcccStats,
  setEmcccStats] =
  useState({
    total: 0,
    onboarded: 0,
    training: 0,
    graduated: 0,
  });
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData =
    async () => {
      try {
        setLoading(true);

const emcccSnapshot =
  await getDocs(
    collection(
      db,
      "emcccActivities"
    )
  );

const emcccList =
  emcccSnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );

setEmcccActivities(
  emcccList
);
const emcccSchoolsSnapshot =
  await getDocs(
    collection(
      db,
      "emcccSchools"
    )
  );

const emcccSchools =
  emcccSchoolsSnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );

const stats = {
  total:
    emcccSchools.length,

  onboarded:
    emcccSchools.filter(
      (school) =>
        school.status ===
        "onboarded"
    ).length,

  training:
    emcccSchools.filter(
      (school) =>
        school.status ===
        "training"
    ).length,

  graduated:
    emcccSchools.filter(
      (school) =>
        school.status ===
        "graduated"
    ).length,
};

setEmcccStats(stats);        
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

        setSchools(schoolsList);

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

        const trainingSnapshot =
          await getDocs(
            collection(
              db,
              "weeklyTraining"
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

        const withdrawalSnapshot =
          await getDocs(
            collection(
              db,
              "withdrawalRequests"
            )
          );

        const withdrawalList =
          withdrawalSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setWithdrawalRequests(
          withdrawalList
        );

        setPendingWithdrawals(
          withdrawalList.filter(
            (x) =>
              x.status ===
              "pending"
          ).length
        );

        const platformSnap =
          await getDoc(
            doc(
              db,
              "platformWallet",
              "main"
            )
          );

        if (
          platformSnap.exists()
        ) {
          setPlatformRevenue(
            platformSnap.data()
              .totalRevenue ||
              0
          );
        }

        const txSnapshot =
          await getDocs(
            collection(
              db,
              "transactions"
            )
          );

        const txList =
          txSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setTransactions(txList);

        let floatFunded = 0;
        let withdrawalsPaid = 0;

        txList.forEach((tx) => {
          if (
            tx.type ===
            "float_topup"
          ) {
            floatFunded += Number(
              tx.amount || 0
            );
          }

          if (
            tx.type ===
            "withdrawal"
          ) {
            withdrawalsPaid +=
              Number(
                tx.amount || 0
              );
          }
        });

        setTotalFloatFunded(
          floatFunded
        );

        setTotalWithdrawalsPaid(
          withdrawalsPaid
        );

        const performanceData =
          repsList.map((rep) => {
            const repTx =
              txList.filter(
                (tx) =>
                  tx.repId ===
                  rep.uid
              );

            const collections =
              repTx.filter(
                (tx) =>
                  tx.type ===
                  "rep_debit"
              ).length;

            const revenue =
              repTx
                .filter(
                  (tx) =>
                    tx.type ===
                    "rep_debit"
                )
                .reduce(
                  (sum, tx) =>
                    sum +
                    Number(
                      tx.amount ||
                        0
                    ),
                  0
                );

            let rating =
              "Inactive";

            if (
              revenue > 30000
            )
              rating =
                "⭐⭐⭐⭐⭐";
            else if (
              revenue > 15000
            )
              rating = "⭐⭐⭐⭐";
            else if (
              revenue > 5000
            )
              rating = "⭐⭐⭐";
            else if (
              revenue > 0
            )
              rating = "⭐⭐";

            return {
              name:
                rep.fullName ||
                "Unknown",
              collections,
              revenue,
              wasteKg:
                revenue > 0
                  ? Math.round(
                      revenue /
                        250
                    )
                  : 0,
              rating,
            };
          });

        setRepPerformance(
          performanceData
        );

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

  const approveRepresentative =
    async (
      id,
      uid,
      fullName
    ) => {
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

        await setDoc(
          doc(
            db,
            "repWallets",
            uid
          ),
          {
            repId: uid,
            repName: fullName,
            floatBalance: 0,
            totalPurchases: 0,
            totalLeviesPaid: 0,
            createdAt:
              new Date(),
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
      const approveSchool =
    async (
      id,
      schoolId,
      schoolName
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "schools",
            id
          ),
          {
            approved: true,
            status:
              "approved",
          }
        );

        await setDoc(
          doc(
            db,
            "schoolWallets",
            schoolId
          ),
          {
            schoolId,
            balance: 0,
            totalEarned: 0,
            totalDeductions: 0,
            createdAt:
              new Date(),
          }
        );

        await setDoc(
          doc(
            db,
            "emcccSchools",
            schoolId
          ),
          {
            schoolId,
            schoolName,
            emcccName:
              "Environmental Management and Climate Change Club",
            status:
              "onboarded",
            launchDate:
              null,
            membersCount: 0,
            weekCompleted: 0,
            nextTrainingWeek: 1,
            patronType:
              "Principal",
            patronName: "",
            coordinators:
              [],
            studentExecutives:
              {},
            createdAt:
              new Date(),
          }
        );

        alert(
          "School approved successfully"
        );

        fetchDashboardData();
    } catch (error) {
  console.error(error);
  alert(error.message);
}
    };

  const handleFundRep =
    async () => {
      try {
        if (
          !selectedRep
        ) {
          alert(
            "Select representative"
          );
          return;
        }

        if (
          !fundAmount ||
          Number(
            fundAmount
          ) <= 0
        ) {
          alert(
            "Enter valid amount"
          );
          return;
        }

        await fundRepWallet(
          selectedRep,
          Number(
            fundAmount
          ),
          "waste2wealthafricahub@gmail.com"
        );

        alert(
          "Wallet funded"
        );

        setSelectedRep("");
        setFundAmount("");

        fetchDashboardData();
      } catch (error) {
        console.error(error);
      }
    };

  const approveWithdrawal =
    async (
      request
    ) => {
      try {
        const walletRef =
          doc(
            db,
            "schoolWallets",
            request.schoolId
          );

        const walletSnap =
          await getDoc(
            walletRef
          );

        if (
          !walletSnap.exists()
        ) {
          alert(
            "Wallet not found"
          );
          const approveEmcccActivity =
  async (activity) => {
    try {
      await updateDoc(
        doc(
          db,
          "emcccActivities",
          activity.id
        ),
        {
          status: "approved",
          approvedAt:
            new Date(),
        }
      );

      const schoolRef =
        doc(
          db,
          "emcccSchools",
          activity.schoolId
        );

      const schoolSnap =
        await getDoc(
          schoolRef
        );

      if (
        schoolSnap.exists()
      ) {
        const schoolData =
          schoolSnap.data();

        const currentWeek =
          schoolData
            .weekCompleted ||
          0;

        const nextWeek =
          currentWeek + 1;

        if (
          nextWeek >= 10
        ) {
          await updateDoc(
            schoolRef,
            {
              weekCompleted:
                10,
              nextTrainingWeek:
                10,
              status:
                "graduated",
            }
          );
        } else {
          await updateDoc(
            schoolRef,
            {
              weekCompleted:
                nextWeek,
              nextTrainingWeek:
                nextWeek + 1,
              status:
                "training",
            }
          );
        }
      }

      alert(
        "EMCCC activity approved"
      );

      fetchDashboardData();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
          return;
        }

        const walletData =
          walletSnap.data();

        if (
          walletData.balance <
          request.amount
        ) {
          alert(
            "Insufficient balance"
          );
          return;
        }

        await updateDoc(
          walletRef,
          {
            balance:
              increment(
                -request.amount
              ),
          }
        );

        await updateDoc(
          doc(
            db,
            "withdrawalRequests",
            request.id
          ),
          {
            status:
              "approved",
          }
        );

        await addDoc(
          collection(
            db,
            "transactions"
          ),
          {
            type:
              "withdrawal",
            schoolId:
              request.schoolId,
            amount:
              request.amount,
            status:
              "completed",
            createdAt:
              new Date(),
          }
        );

        alert(
          "Withdrawal approved"
        );

        fetchDashboardData();
      } catch (error) {
        console.error(error);
      }
    };

  const totalWaste =
    logs.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalWeight ||
            0
        ),
      0
    );

  const totalValue =
    logs.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalValue ||
            0
        ),
      0
    );

  const totalStudents =
    trainingSessions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.studentsReached ||
            0
        ),
      0
    );

  if (loading) {
    return (
      <div
        style={{
          padding:
            "30px",
        }}
      >
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>
        Admin Dashboard
      </h1>

      <p>
        W2WASCHOOL
        Environmental
        Management
        System
      </p>
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <button
    style={{
      padding: "12px 20px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
    onClick={() =>
      navigate("/user-management")
    }
  >
    👥 User Management
  </button>
</div>
      <div
        style={
          styles.cardGrid
        }
      >
        <Card
          title="Registered Schools"
          value={
            schools.length
          }
        />

        <Card
          title="Representatives"
          value={
            representatives.length
          }
        />

        <Card
          title="Students Trained"
          value={
            totalStudents
          }
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

      <div
        style={
          styles.cardGrid
        }
      >
        <Card
          title="Platform Revenue"
          value={`₦${platformRevenue.toLocaleString()}`}
        />

        <Card
          title="Total Float Funded"
          value={`₦${totalFloatFunded.toLocaleString()}`}
        />

        <Card
          title="Pending Withdrawals"
          value={
            pendingWithdrawals
          }
        />

        <Card
          title="Withdrawals Paid"
          value={`₦${totalWithdrawalsPaid.toLocaleString()}`}
        />
        <div style={styles.section}>
  <h2>
    EMCCC Analytics
  </h2>

  <div style={styles.cardGrid}>
    <Card
      title="Total EMCCC Schools"
      value={emcccStats.total}
    />

    <Card
      title="Onboarded"
      value={
        emcccStats.onboarded
      }
    />

    <Card
      title="In Training"
      value={
        emcccStats.training
      }
    />

    <Card
      title="Graduated"
      value={
        emcccStats.graduated
      }
    />
  </div>
</div>
      </div>
            <div style={styles.section}>
        <h2>School Approvals</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>School</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td style={styles.td}>
                  {school.schoolName}
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
                          school.id,
                          school.schoolId,
                          school.schoolName
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

      <div style={styles.section}>
        <h2>Representative Approvals</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Approved</th>
              <th style={styles.th}>Action</th>
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
                            rep.id,
                            rep.uid,
                            rep.fullName
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

      <div style={styles.section}>
        <h2>Fund Representative Wallet</h2>

        <select
          value={selectedRep}
          onChange={(e) =>
            setSelectedRep(
              e.target.value
            )
          }
          style={styles.input}
        >
          <option value="">
            Select Representative
          </option>

          {representatives
            .filter(
              (rep) =>
                rep.approved
            )
            .map((rep) => (
              <option
                key={rep.id}
                value={rep.uid}
              >
                {rep.fullName}
              </option>
            ))}
        </select>

        <input
          type="number"
          value={fundAmount}
          onChange={(e) =>
            setFundAmount(
              e.target.value
            )
          }
          placeholder="Amount"
          style={styles.input}
        />

        <button
          style={styles.button}
          onClick={handleFundRep}
        >
          Fund Wallet
        </button>
      </div>

      <div style={styles.section}>
        <h2>Withdrawal Requests</h2>
        <table style={styles.table}>
          <tbody>
            {withdrawalRequests.map(
              (request) => (
                <tr key={request.id}>
                  <td style={styles.td}>
                    {request.schoolId}
                  </td>
                  <td style={styles.td}>
                    ₦
                    {Number(
                      request.amount ||
                        0
                    ).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    {request.status}
                  </td>
                  <td style={styles.td}>
                    {request.status ===
                      "pending" && (
                      <button
                        style={
                          styles.button
                        }
                        onClick={() =>
                          approveWithdrawal(
                            request
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

      <div style={styles.section}>
      <div style={styles.section}>
  <h2>
    Pending EMCCC Activities
  </h2>

  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>
          School
        </th>

        <th style={styles.th}>
          Week
        </th>

        <th style={styles.th}>
          Title
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
      {emcccActivities
        .filter(
          (activity) =>
            activity.status ===
            "pending"
        )
        .map((activity) => (
          <tr key={activity.id}>
            <td style={styles.td}>
              {
                activity.schoolId
              }
            </td>

            <td style={styles.td}>
              Week{" "}
              {
                activity.weekNumber
              }
            </td>

            <td style={styles.td}>
              {activity.title}
            </td>

            <td style={styles.td}>
              {activity.status}
            </td>

            <td style={styles.td}>
              <button
                style={
                  styles.button
                }
                onClick={() =>
                  approveEmcccActivity(
                    activity
                  )
                }
              >
                Approve
              </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
        <h2>Recent Collections</h2>
        <table style={styles.table}>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>
                  {log.schoolId}
                </td>
                <td style={styles.td}>
                  {log.totalWeight}kg
                </td>
                <td style={styles.td}>
                  ₦
                  {Number(
                    log.totalValue ||
                      0
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
    marginTop: "20px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
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
    borderCollapse:
      "collapse",
    marginTop: "20px",
  },

  th: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom:
      "1px solid #ddd",
  },

  button: {
    padding: "10px 16px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
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