import React, {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

export default function SchoolWalletDashboard() {
  const [wallet, setWallet] =
    useState(null);

  const [schoolId, setSchoolId] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [accountNumber, setAccountNumber] =
    useState("");

  const [accountName, setAccountName] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const user =
        auth.currentUser;

      if (!user) return;

      const schoolQuery = query(
        collection(db, "schools"),
        where(
          "email",
          "==",
          user.email
        )
      );

      const schoolSnapshot =
        await getDocs(
          schoolQuery
        );

      if (
        schoolSnapshot.empty
      ) {
        setLoading(false);
        return;
      }

      const schoolData =
        schoolSnapshot.docs[0].data();

      const currentSchoolId =
        schoolData.schoolId;

      setSchoolId(
        currentSchoolId
      );

      const walletRef = doc(
        db,
        "schoolWallets",
        currentSchoolId
      );

      const walletSnap =
        await getDoc(walletRef);

      if (
        walletSnap.exists()
      ) {
        setWallet(
          walletSnap.data()
        );
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleWithdrawal =
    async () => {
      try {
        if (
          !bankName ||
          !accountNumber ||
          !accountName ||
          !amount
        ) {
          alert(
            "Fill all fields"
          );
          return;
        }

        if (
          Number(amount) <= 0
        ) {
          alert(
            "Invalid amount"
          );
          return;
        }

        if (
          Number(amount) >
          (wallet?.balance || 0)
        ) {
          alert(
            "Insufficient wallet balance"
          );
          return;
        }

        await addDoc(
          collection(
            db,
            "withdrawalRequests"
          ),
          {
            schoolId,
            bankName,
            accountNumber,
            accountName,
            amount:
              Number(amount),
            status:
              "pending",
            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Withdrawal request submitted"
        );

        setBankName("");
        setAccountNumber("");
        setAccountName("");
        setAmount("");

      } catch (error) {
        console.error(error);
        alert(
          "Withdrawal failed"
        );
      }
    };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      <h1>
        School Wallet
      </h1>

      <div style={styles.card}>
        <h3>
          Current Balance
        </h3>

        <p>
          ₦
          {Number(
            wallet?.balance || 0
          ).toLocaleString()}
        </p>

        <p>
          Total Earned: ₦
          {Number(
            wallet?.totalEarned || 0
          ).toLocaleString()}
        </p>

        <p>
          Total Deductions: ₦
          {Number(
            wallet?.totalDeductions || 0
          ).toLocaleString()}
        </p>
      </div>

      <div style={styles.card}>
        <h2>
          Request Withdrawal
        </h2>

        <input
          placeholder="Bank Name"
          value={bankName}
          onChange={(e) =>
            setBankName(
              e.target.value
            )
          }
          style={styles.input}
        />

        <input
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(
              e.target.value
            )
          }
          style={styles.input}
        />

        <input
          placeholder="Account Name"
          value={accountName}
          onChange={(e) =>
            setAccountName(
              e.target.value
            )
          }
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          style={styles.input}
        />

        <button
          onClick={
            handleWithdrawal
          }
          style={styles.button}
        >
          Request Withdrawal
        </button>
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

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxSizing:
      "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};