import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getUserSchool(uid, email) {
  // First try teacherUid
  const uidQuery = query(
    collection(db, "schools"),
    where("teacherUid", "==", uid)
  );

  const uidSnapshot = await getDocs(uidQuery);

  if (!uidSnapshot.empty) {
    const schoolDoc = uidSnapshot.docs[0];

    return {
      id: schoolDoc.id,
      ...schoolDoc.data()
    };
  }

  // If teacherUid is not available, try email
  if (email) {
    const emailQuery = query(
      collection(db, "schools"),
      where("email", "==", email)
    );

    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      const schoolDoc = emailSnapshot.docs[0];

      return {
        id: schoolDoc.id,
        ...schoolDoc.data()
      };
    }
  }

  return null;
}
