import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// =============================
// CREATE SCHOOL WALLET
// =============================
export const createSchoolWallet =
  async (schoolId) => {
    const walletRef = doc(
      db,
      "schoolWallets",
      schoolId
    );

    const walletSnap =
      await getDoc(walletRef);

    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        schoolId,
        balance: 0,
        totalEarned: 0,
        totalDeductions: 0,
        createdAt:
          serverTimestamp(),
      });
    }
  };

// =============================
// CREATE REPRESENTATIVE WALLET
// =============================
export const createRepWallet =
  async (repId) => {
    const walletRef = doc(
      db,
      "repWallets",
      repId
    );

    const walletSnap =
      await getDoc(walletRef);

    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        repId,
        floatBalance: 0,
        totalPurchases: 0,
        totalLeviesPaid: 0,
        createdAt:
          serverTimestamp(),
      });
    }
  };

// =============================
// CREATE PLATFORM WALLET
// =============================
export const createPlatformWallet =
  async () => {
    const walletRef = doc(
      db,
      "platformWallet",
      "main"
    );

    const walletSnap =
      await getDoc(walletRef);

    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        totalRevenue: 0,
        schoolLevies: 0,
        representativeLevies: 0,
        createdAt:
          serverTimestamp(),
      });
    }
  };

// =============================
// FUND REP FLOAT WALLET
// =============================
export const fundRepWallet =
  async (
    repId,
    amount,
    adminEmail
  ) => {
    const walletRef = doc(
      db,
      "repWallets",
      repId
    );

    await updateDoc(walletRef, {
      floatBalance:
        increment(amount),
      lastTopUp:
        serverTimestamp(),
    });

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type: "float_topup",
        walletType: "rep",
        repId,
        amount,
        approvedBy:
          adminEmail,
        status: "completed",
        createdAt:
          serverTimestamp(),
      }
    );
  };

// =============================
// PROCESS COLLECTION PURCHASE
// =============================
export const processCollectionPurchase =
  async ({
    repId,
    schoolId,
    totalValue,
  }) => {
    // =========================
    // LEVY CALCULATIONS
    // =========================
    const repLevy =
      totalValue * 0.05;

   const schoolLevy = totalValue * 0.05;
    const repDebit =
      totalValue + repLevy;

    const schoolCredit =
      totalValue - schoolLevy;

    const platformRevenue =
      repLevy + schoolLevy;

    // =========================
    // CHECK REP FLOAT
    // =========================
    const repWalletRef = doc(
      db,
      "repWallets",
      repId
    );

    const repWalletSnap =
      await getDoc(repWalletRef);

    if (!repWalletSnap.exists()) {
      throw new Error(
        "Representative wallet not found"
      );
    }

    const repWalletData =
      repWalletSnap.data();

    if (
      repWalletData.floatBalance <
      repDebit
    ) {
      throw new Error(
        "Insufficient float balance"
      );
    }

    // =========================
    // DEBIT REP WALLET
    // =========================
    await updateDoc(
      repWalletRef,
      {
        floatBalance:
          increment(-repDebit),

        totalPurchases:
          increment(totalValue),

        totalLeviesPaid:
          increment(repLevy),
      }
    );

    // =========================
    // CREDIT SCHOOL WALLET
    // =========================
    const schoolWalletRef = doc(
      db,
      "schoolWallets",
      schoolId
    );

    await updateDoc(
      schoolWalletRef,
      {
        balance:
          increment(
            schoolCredit
          ),

        totalEarned:
          increment(
            schoolCredit
          ),

        totalDeductions:
          increment(
            schoolLevy
          ),
      }
    );

    // =========================
    // CREDIT PLATFORM WALLET
    // =========================
    const platformWalletRef =
      doc(
        db,
        "platformWallet",
        "main"
      );

    await updateDoc(
      platformWalletRef,
      {
        totalRevenue:
          increment(
            platformRevenue
          ),

        schoolLevies:
          increment(
            schoolLevy
          ),

        representativeLevies:
          increment(repLevy),
      }
    );

    // =========================
    // TRANSACTION LEDGER
    // =========================
    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type:
          "school_payment",
        schoolId,
        amount:
          schoolCredit,
        status:
          "completed",
        createdAt:
          serverTimestamp(),
      }
    );

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type: "rep_debit",
        repId,
        amount: repDebit,
        status:
          "completed",
        createdAt:
          serverTimestamp(),
      }
    );

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type:
          "platform_revenue",
        amount:
          platformRevenue,
        status:
          "completed",
        createdAt:
          serverTimestamp(),
      }
    );

    return {
      repDebit,
      schoolCredit,
      platformRevenue,
    };
  };