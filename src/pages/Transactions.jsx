import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [schoolsMap, setSchoolsMap] = useState({});

  useEffect(() => {
    const loadData = async () => {
      // Fetch schools (for names)
      const schoolsSnapshot = await getDocs(collection(db, "schools"));

      const map = {};
      schoolsSnapshot.forEach((doc) => {
        map[doc.id] = doc.data().name || "Unnamed School";
      });

      setSchoolsMap(map);

      // Fetch transactions
      const txSnapshot = await getDocs(collection(db, "transactions"));

      const txData = txSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(txData);
    };

    loadData();
  }, []);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const thtd = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtd}>Type</th>
              <th style={thtd}>Target</th>
              <th style={thtd}>School</th>
              <th style={thtd}>Amount</th>
              <th style={thtd}>Balance After</th>
              <th style={thtd}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td style={thtd}>{tx.type}</td>
                <td style={thtd}>{tx.target}</td>
                <td style={thtd}>
                  {tx.schoolId
                    ? schoolsMap[tx.schoolId] || "Loading..."
                    : "-"}
                </td>
                <td style={thtd}>₦ {tx.amount}</td>
                <td style={thtd}>₦ {tx.balanceAfter}</td>
                <td style={thtd}>
                  {tx.createdAt?.toDate
                    ? tx.createdAt.toDate().toLocaleDateString()
                    : "No date"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}