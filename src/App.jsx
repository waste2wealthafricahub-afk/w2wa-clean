import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RepDashboard from "./pages/RepDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";

function AppContent() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        // 🔥 GET ROLE FROM FIRESTORE
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          navigate("/login");
          return;
        }

        const role = docSnap.data().role;

        console.log("AUTH ROLE:", role);

        // 🔥 ROLE-BASED REDIRECT
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "rep") navigate("/rep-dashboard");
        else if (role === "school") navigate("/school-dashboard");
        else navigate("/login");

      } catch (error) {
        console.error(error);
        navigate("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/rep-dashboard" element={<RepDashboard />} />
      <Route path="/school-dashboard" element={<SchoolDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;