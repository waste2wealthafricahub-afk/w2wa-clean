import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export const getUserRole = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().role;
  } else {
    console.log("No such user document!");
    return null;
  }
};