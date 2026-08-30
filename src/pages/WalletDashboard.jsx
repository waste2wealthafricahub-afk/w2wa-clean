import React, {
  useEffect,
  useState,
} from "react";

import {
  auth,
  db,
} from "../firebase";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function WalletDashboard() {
  const [wallet, setWallet] =
    useState(null);

  const [transactions,
    setTransactions] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const user =
        auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      // =========================
      // LOAD REPRESENTATIVE WALLET
      // =========================
      const walletRef = doc(
        db,
        "repWallets",
        user.uid
      );

      const walletSnap =
        await getDoc(walletRef);

      if (walletSnap.exists()) {
        setWallet(
          walletSnap.data()
        );
      }

      // =========================
      // LOAD REPRESENTATIVE
      // // TRANSACTIONS
      // =========================
      const transactionQuery =
        query(
          collection(
            db,
            "transactions"
          ),
          where(
            "repId",
            "==",
            user.uid
          )
        );

      const transactionSnap =
        await getDocs(
          transactionQuery
        );

      const transactionData =
        transactionSnap.docs.map(
          (transactionDoc) => ({
            id: transactionDoc.id,
            ...transactionDoc.data(),
          })
        );

      // Newest transactions first
      transactionData.sort(
        (a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() ||
            0;

          const bTime =
            b.createdAt?.toMillis?.() ||
            0;

          return bTime - aTime;
        }
      );

      setTransactions(
        transactionData
      );

      setLoading(false);

    } catch (error) {
      console.error(
        "Wallet loading error:",
        error
      );

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h2>
          Loading Representative Wallet...
        </h2>
      </div>
    );
  }

  // =========================
  // FINANCIAL SUMMARY
  // =========================

  const availableFloat =
    Number(
      wallet?.floatBalance || 0
    );

  const totalPurchases =
    Number(
      wallet?.totalPurchases || 0
    );

  const representativeLevies =
    Number(
      wallet?.totalLeviesPaid || 0
    );

  const totalFloatUsed =
    totalPurchases +
    representativeLevies;

  return (
    <div style={styles.page}>

      <h1>
        Representative Wallet
      </h1>

      <p>
        Manage your collection float
        and view your financial transactions.
      </p>

      {/* =========================
          WALLET SUMMARY
      ========================= */}

      <div style={styles.summaryGrid}>

        <div style={styles.balanceCard}>
          <h3>
            Available Float
          </h3>

          <h1>
            ₦
            {availableFloat.toLocaleString()}
          </h1>

          <p>
            Funds available for
            waste collection purchases
          </p>
        </div>

        <div style={styles.card}>
          <h3>
            Total Waste Purchases
          </h3>

          <h2>
            ₦
            {totalPurchases.toLocaleString()}
          </h2>

          <p>
            Value of waste purchased
          </p>
        </div>

        <div style={styles.card}>
          <h3>
            Representative Levies Paid
          </h3>

          <h2>
            ₦
            {representativeLevies.toLocaleString()}
          </h2>

          <p>
            5% Representative levy
          </p>
        </div>

        <div style={styles.card}>
          <h3>
            Total Float Used
          </h3>

          <h2>
            ₦
            {totalFloatUsed.toLocaleString()}
          </h2>

          <p>
            Purchases + Representative levy
          </p>
        </div>

      </div>

      {/* =========================
          BUSINESS ACCOUNT
      ========================= */}

      <div style={styles.card}>

        <h2>
          Float Funding Account
        </h2>

        <p>
          <strong>
            Account Name:
          </strong>{" "}
          Waste2wealthafrica Hub
        </p>

        <p>
          <strong>
            Bank:
          </strong>{" "}
          Moniepoint
        </p>

        <p>
          <strong>
            Account Number:
          </strong>{" "}
          6970352296
        </p>

        <p style={styles.note}>
          After making a float payment,
          submit your payment reference
          through the funding request process.
          Your float will be credited after
          Admin verification and approval.
        </p>

      </div>

      {/* =========================
          TRANSACTION HISTORY
      ========================= */}

      <div style={styles.section}>

        <h2>
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <p>
            No transactions yet.
          </p>
        ) : (
          <div style={styles.tableContainer}>

            <table style={styles.table}>

              <thead>
                <tr>
                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Type
                  </th>

                  <th style={styles.th}>
                    Amount
                  </th>

                  <th style={styles.th}>
                    Description
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {transactions.map(
                  (item) => {

                    const isTopUp =
                      item.type ===
                      "float_topup";

                    const isPurchase =
                      item.type ===
                      "rep_debit";

                    const amount =
                      Number(
                        item.amount || 0
                      );

                    let date = "-";

                    if (
                      item.createdAt?.toDate
                    ) {
                      date =
                        item.createdAt
                          .toDate()
                          .toLocaleDateString();
                    }

                    return (
                      <tr
                        key={item.id}
                      >

                        <td
                          style={styles.td}
                        >
                          {date}
                        </td>

                        <td
                          style={styles.td}
                        >
                          {isTopUp
                            ? "Float Top-up"
                            : isPurchase
                            ? "Collection Purchase"
                            : item.type ||
                              "-"}
                        </td>

                        <td
                          style={styles.td}
                        >
                          <span
                            style={{
                              fontWeight:
                                "bold",
                            }}
                          >
                            {isTopUp
                              ? "+"
                              : isPurchase
                              ? "-"
                              : ""}
                            ₦
                            {amount.toLocaleString()}
                          </span>
                        </td>

                        <td
                          style={styles.td}
                        >
                          {isTopUp
                            ? "Admin-funded representative float"
                            : isPurchase
                            ? "Waste collection purchase"
                            : item.description ||
                              "-"}
                        </td>

                        <td
                          style={styles.td}
                        >
                          {item.status ||
                            "completed"}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

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

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    marginTop: "20px",
    marginBottom: "20px",
  },

  balanceCard: {
    background: "#16a34a",
    color: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },

  note: {
    background: "#f0f7ff",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "15px",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
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
};