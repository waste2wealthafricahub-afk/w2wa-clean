import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminFundWallet() {
  const [reps, setReps] = useState([]);
  const [selectedRep, setSelectedRep] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const loadReps = async () => {
      const snap = await getDocs(collection(db, "representatives"));
      setReps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadReps();
  }, []);

  const fundWallet = async () => {
    if (!selectedRep || !amount) return alert("Fill all fields");

    const rep = reps.find(r => r.id === selectedRep);
    const newBalance = (rep.walletBalance || 0) + Number(amount);

    // update wallet
    await updateDoc(doc(db, "representatives", selectedRep), {
      walletBalance: newBalance,
    });

    // record transaction
    await addDoc(collection(db, "transactions"), {
      repId: selectedRep,
      type: "credit",
      amount: Number(amount),
      balanceAfter: newBalance,
      description: "Admin funding",
      createdAt: serverTimestamp(),
    });

    alert("Wallet funded successfully");
    setAmount("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Fund Rep Wallet</h2>

      <select onChange={(e) => setSelectedRep(e.target.value)}>
        <option value="">Select Rep</option>
        {reps.map(rep => (
          <option key={rep.id} value={rep.id}>
            {rep.fullName} (₦{rep.walletBalance || 0})
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={fundWallet}>Fund Wallet</button>
    </div>
  );
}