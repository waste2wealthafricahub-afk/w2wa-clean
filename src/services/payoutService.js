import {
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const paySchool = async (schoolId, amount) => {
  const walletRef = doc(db, "schoolWallets", schoolId);

  const walletSnap = await getDoc(walletRef);

  if (!walletSnap.exists()) {
    throw new Error("Wallet not found");
  }

  const currentBalance = walletSnap.data().balance || 0;

  if (amount > currentBalance) {
    throw new Error("Insufficient balance");
  }

  const newBalance = currentBalance - amount;

  // 1. Update wallet
  await updateDoc(walletRef, {
    balance: newBalance,
    lastUpdated: serverTimestamp(),
  });

  // 2. Record transaction (CLEAN STRUCTURE)
  await addDoc(collection(db, "transactions"), {
    type: "payout",
    target: "school",
    schoolId,
    amount,
    balanceAfter: newBalance,
    description: "School payout",
    status: "completed",
    createdAt: serverTimestamp(),
  });
};