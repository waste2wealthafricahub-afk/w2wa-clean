const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

setGlobalOptions({
  region: "africa-south1",
  maxInstances: 10,
});

exports.processCollectionPurchase = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be signed in.",
    );
  }

  const repId = request.auth.uid;
  const {schoolId, plasticKg, paperKg, metalKg} = request.data || {};

  if (!schoolId) {
    throw new HttpsError(
        "invalid-argument",
        "School is required.",
    );
  }

  const plastic = Number(plasticKg || 0);
  const paper = Number(paperKg || 0);
  const metal = Number(metalKg || 0);

  if (
    !Number.isFinite(plastic) ||
    !Number.isFinite(paper) ||
    !Number.isFinite(metal) ||
    plastic < 0 ||
    paper < 0 ||
    metal < 0
  ) {
    throw new HttpsError(
        "invalid-argument",
        "Waste quantities are invalid.",
    );
  }

  const totalWeight = plastic + paper + metal;

  if (totalWeight <= 0) {
    throw new HttpsError(
        "invalid-argument",
        "Enter a valid waste quantity.",
    );
  }

  const repRef = db.collection("representatives").doc(repId);
  const schoolRef = db.collection("schools").doc(schoolId);
  const priceRef = db.collection("prices").doc("current");
  const repWalletRef = db.collection("repWallets").doc(repId);
  const schoolWalletRef = db.collection("schoolWallets").doc(schoolId);

  const result = await db.runTransaction(async (transaction) => {
    const [
      repSnap,
      schoolSnap,
      priceSnap,
      repWalletSnap,
      schoolWalletSnap,
    ] = await Promise.all([
      transaction.get(repRef),
      transaction.get(schoolRef),
      transaction.get(priceRef),
      transaction.get(repWalletRef),
      transaction.get(schoolWalletRef),
    ]);

    if (!repSnap.exists) {
      throw new HttpsError(
          "permission-denied",
          "Representative account not found.",
      );
    }

    const repData = repSnap.data();

    if (repData.approved !== true) {
      throw new HttpsError(
          "permission-denied",
          "Representative is not approved.",
      );
    }

    if (!schoolSnap.exists) {
      throw new HttpsError(
          "not-found",
          "School not found.",
      );
    }

    const schoolData = schoolSnap.data();

    if (schoolData.approved !== true) {
      throw new HttpsError(
          "failed-precondition",
          "School is not approved.",
      );
    }

    const assignedSchoolIds = Array.isArray(repData.assignedSchoolIds) ?
      repData.assignedSchoolIds :
      [];

    if (!assignedSchoolIds.includes(schoolData.schoolId)) {
      throw new HttpsError(
          "permission-denied",
          "This school is not assigned to this Representative.",
      );
    }

    if (!priceSnap.exists) {
      throw new HttpsError(
          "failed-precondition",
          "Current recycling prices are not configured.",
      );
    }

    const prices = priceSnap.data();

    const plasticPrice = Number(prices.plastic || 0);
    const paperPrice = Number(prices.paper || 0);
    const metalPrice = Number(prices.metal || 0);

    if (
      !Number.isFinite(plasticPrice) ||
      !Number.isFinite(paperPrice) ||
      !Number.isFinite(metalPrice) ||
      plasticPrice < 0 ||
      paperPrice < 0 ||
      metalPrice < 0
    ) {
      throw new HttpsError(
          "failed-precondition",
          "Current recycling prices are invalid.",
      );
    }

    const plasticValue = plastic * plasticPrice;
    const paperValue = paper * paperPrice;
    const metalValue = metal * metalPrice;
    const totalValue = plasticValue + paperValue + metalValue;

    if (!Number.isFinite(totalValue) || totalValue <= 0) {
      throw new HttpsError(
          "failed-precondition",
          "The calculated recyclable value is invalid.",
      );
    }

    const repLevy = totalValue * 0.05;
    const schoolLevy = 0;
    const schoolCredit = totalValue;
    const repDebit = totalValue + repLevy;
    const platformRevenue = repLevy;

    if (!repWalletSnap.exists) {
      throw new HttpsError(
          "failed-precondition",
          "Representative wallet not found.",
      );
    }

    if (!schoolWalletSnap.exists) {
      throw new HttpsError(
          "failed-precondition",
          "School wallet not found.",
      );
    }

    const repWalletData = repWalletSnap.data();
    const floatBalance = Number(repWalletData.floatBalance || 0);

    if (!Number.isFinite(floatBalance) || floatBalance < repDebit) {
      throw new HttpsError(
          "failed-precondition",
          "Insufficient float balance.",
      );
    }

    const collectionRef = db.collection("collections").doc();

    transaction.set(collectionRef, {
      repId,
      schoolId,
      plasticKg: plastic,
      paperKg: paper,
      metalKg: metal,
      plasticPrice,
      paperPrice,
      metalPrice,
      totalWeight,
      totalValue,
      repLevy,
      schoolLevy,
      schoolCredit,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    });

    transaction.update(repWalletRef, {
      floatBalance: FieldValue.increment(-repDebit),
      totalPurchases: FieldValue.increment(totalValue),
      totalLeviesPaid: FieldValue.increment(repLevy),
    });

    transaction.update(schoolWalletRef, {
      balance: FieldValue.increment(schoolCredit),
      totalEarned: FieldValue.increment(schoolCredit),
      totalDeductions: FieldValue.increment(schoolLevy),
    });

    transaction.set(db.collection("transactions").doc(), {
      type: "school_payment",
      schoolId,
      amount: schoolCredit,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    });

    transaction.set(db.collection("transactions").doc(), {
      type: "rep_debit",
      repId,
      amount: repDebit,
      purchaseValue: totalValue,
      totalWeight,
      repLevy,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    });

    transaction.set(db.collection("transactions").doc(), {
      type: "platform_revenue",
      amount: platformRevenue,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      collectionId: collectionRef.id,
      totalWeight,
      totalValue,
      repLevy,
      repDebit,
      schoolCredit,
      platformRevenue,
    };
  });

  return result;
});
