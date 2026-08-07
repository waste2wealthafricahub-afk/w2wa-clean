import {
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

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {

    try {

      const user = auth.currentUser;

      if (!user) return;

      const walletRef = doc(
        db,
        "wallets",
        user.uid
      );

      const walletSnap =
        await getDoc(walletRef);

      if (walletSnap.exists()) {
        setWallet(walletSnap.data());
      }

      const transactionQuery = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const transactionSnap =
        await getDocs(transactionQuery);

      const transactionData = [];

      transactionSnap.forEach((doc) => {
        transactionData.push(doc.data());
      });

      setTransactions(transactionData);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Wallet Dashboard</h1>

      <div style={styles.card}>

        <h3>
          Current Balance
        </h3>

        <h1>
          ₦{wallet?.balance || 0}
        </h1>

        <p>
          Total Earned:
          ₦{wallet?.totalEarned || 0}
        </p>

      </div>

      <div style={styles.section}>

        <h2>
          Transactions
        </h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Description</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  {item.type}
                </td>

                <td style={styles.td}>
                  ₦{item.amount}
                </td>

                <td style={styles.td}>
                  {item.description}
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
    marginBottom: "20px",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#007bff",
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