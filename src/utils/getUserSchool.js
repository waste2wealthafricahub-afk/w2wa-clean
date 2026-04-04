import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getUserSchool(uid) {
  const q = query(
    collection(db, "schools"),
    where("teacherUid", "==", uid)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  }

  return null;
}