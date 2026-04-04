import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import RepDashboard from "./pages/RepDashboard";

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
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          navigate("/login");
          setLoading(false);
          return;
        }

        const role = docSnap.data().role;

        console.log("AUTH ROLE:", role);

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

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/school-dashboard" element={<SchoolDashboard />} />
      <Route path="/rep-dashboard" element={<RepDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}