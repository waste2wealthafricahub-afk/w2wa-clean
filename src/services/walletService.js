import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
} from "firebase/firestore";

import {
  db,
} from "../firebase";

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

      await setDoc(
        walletRef,
        {
          schoolId,
          balance: 0,
          totalEarned: 0,
          totalDeductions: 0,
          createdAt: new Date(),
        }
      );
    }
  };

// =============================
// CREATE REP FLOAT WALLET
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

      await setDoc(
        walletRef,
        {
          repId,
          floatBalance: 0,
          totalPurchases: 0,
          totalLeviesPaid: 0,
          createdAt: new Date(),
        }
      );
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

      await setDoc(
        walletRef,
        {
          totalRevenue: 0,
          schoolLevies: 0,
          representativeLevies: 0,
          createdAt: new Date(),
        }
      );
    }
  };

// =============================
// FUND REPRESENTATIVE FLOAT
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

    await updateDoc(
      walletRef,
      {
        floatBalance:
          increment(amount),

        lastTopUp:
          new Date(),
      }
    );

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        walletType: "rep",
        repId,
        amount,
        type: "float_topup",
        approvedBy: adminEmail,
        createdAt: new Date(),
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

    const repLevy =
      totalValue * 0.05;

    const schoolLevy =
      totalValue * 0.025;

    const repDebit =
      totalValue + repLevy;

    const schoolCredit =
      totalValue - schoolLevy;

    const platformRevenue =
      repLevy + schoolLevy;

    // =========================
    // CHECK REP FLOAT BALANCE
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
          increment(schoolCredit),

        totalEarned:
          increment(schoolCredit),

        totalDeductions:
          increment(schoolLevy),
      }
    );

    // =========================
    // CREDIT PLATFORM WALLET
    // =========================
    const platformWalletRef = doc(
      db,
      "platformWallet",
      "main"
    );

    await updateDoc(
      platformWalletRef,
      {
        totalRevenue:
          increment(platformRevenue),

        schoolLevies:
          increment(schoolLevy),

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
        type: "school_payment",
        schoolId,
        amount: schoolCredit,
        createdAt: new Date(),
      }
    );

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type: "waste_purchase",
        repId,
        amount: repDebit,
        createdAt: new Date(),
      }
    );

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        type: "maintenance_fee",
        amount: platformRevenue,
        createdAt: new Date(),
      }
    );

    return {
      repDebit,
      schoolCredit,
      platformRevenue,
    };
  };
```javascript
import {
  doc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  collection,
} from "firebase/firestore";

import {
  db,
} from "../firebase";

// =========================
// CREATE WALLET
// =========================
export const createWallet = async (
  uid,
  role
) => {

  await setDoc(
    doc(db, "wallets", uid),
    {
      uid,
      role,
      balance: 0,
      totalEarned: 0,
      createdAt: new Date(),
    }
  );
};

// =========================
// CREDIT WALLET
// =========================
export const creditWallet = async (
  uid,
  amount,
  description
) => {

  await updateDoc(
    doc(db, "wallets", uid),
    {
      balance: increment(amount),
      totalEarned: increment(amount),
    }
  );

  await addDoc(
    collection(db, "transactions"),
    {
      uid,
      amount,
      type: "credit",
      description,
      createdAt: new Date(),
    }
  );
};