import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "./utils/getUserRole";

export default function AppRoutes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  if (!user) {
    navigate("/login");
    setLoading(false);
    return;
  }

  console.log("USER UID:", user.uid);   // 👈 ADD HERE

  const role = await getUserRole(user.uid);

  console.log("ROLE:", role);           // 👈 ADD HERE

  if (role === "admin") navigate("/admin-dashboard");
  else if (role === "rep") navigate("/rep-dashboard");
  else if (role === "school") navigate("/school-dashboard");
  else navigate("/login");

  setLoading(false);
});
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return null;
}
