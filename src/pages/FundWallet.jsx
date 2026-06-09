import { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { PaystackButton } from "react-paystack";

export default function FundWallet() {
  const [repId, setRepId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 Replace with your Paystack public key
  const publicKey = "YOUR_PAYSTACK_PUBLIC_KEY";

  // Paystack config
  const config = {
    reference: new Date().getTime().toString(),
    email: "admin@w2wa.com",
    amount: Number(amount || 0) * 100, // kobo
    publicKey,
  };

  // ✅ Core wallet funding logic
  const fundWallet = async () => {
    try {
      const ref = doc(db, "representatives", repId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Rep not found");
        return;
      }

      const currentBalance = snap.data().walletBalance || 0;
      const newBalance = currentBalance + Number(amount);

      // Update wallet
      await updateDoc(ref, {
        walletBalance: newBalance,
      });

      // Record transaction
      await addDoc(collection(db, "transactions"), {
        repId,
        amount: Number(amount),
        type: "credit",
        balanceAfter: newBalance,
        createdAt: new Date(),
      });

      alert("Wallet funded successfully");

      setRepId("");
      setAmount("");
    } catch (error) {
      console.error(error);
      alert("Funding failed");
    }
  };

  // ✅ Manual funding (backup)
  const handleManualFund = async (e) => {
    e.preventDefault();

    if (!repId || !amount) {
      alert("Enter rep ID and amount");
      return;
    }

    setLoading(true);
    await fundWallet();
    setLoading(false);
  };

  // ✅ Paystack success
  const handleSuccess = async () => {
    if (!repId || !amount) {
      alert("Enter rep ID and amount before payment");
      return;
    }

    await fundWallet();
  };

  return (
    <div style={container}>
      <h2>Fund Rep Wallet</h2>

      <form onSubmit={handleManualFund}>
        <input
          type="text"
          placeholder="Rep ID"
          value={repId}
          onChange={(e) => setRepId(e.target.value)}
          style={input}
        />

        <input
          type="number"
          placeholder="Amount (₦)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={input}
        />

        {/* 🔹 Manual funding */}
        <button type="submit" disabled={loading} style={manualBtn}>
          {loading ? "Processing..." : "Manual Fund"}
        </button>
      </form>

      {/* 🔹 Paystack funding */}
      <div style={{ marginTop: "15px" }}>
        <PaystackButton
          {...config}
          text="Pay with Paystack"
          onSuccess={handleSuccess}
          onClose={() => alert("Payment cancelled")}
          className="paystack-btn"
        />
      </div>
    </div>
  );
}

// 🎨 Styles
const container = {
  padding: "20px",
  maxWidth: "400px",
  margin: "auto",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const manualBtn = {
  width: "100%",
  padding: "10px",
  backgroundColor: "blue",
  color: "white",
  border: "none",
  cursor: "pointer",
};